use serde::Serialize;
use std::{
    fs::{self, OpenOptions},
    io::Write,
    net::TcpListener,
    path::{Path, PathBuf},
    process::{Child, Command, Stdio},
    sync::Mutex,
};
use tauri::Manager;
use uuid::Uuid;

#[cfg(windows)]
use std::os::windows::process::CommandExt;

#[cfg(windows)]
const CREATE_NO_WINDOW: u32 = 0x08000000;
const DESKTOP_FRONTEND_ORIGINS: &str =
    "http://127.0.0.1:1420,http://localhost:5173,http://tauri.localhost,https://tauri.localhost";

struct DesktopBackendRuntime {
    child: Child,
    config: DesktopBackendConfig,
}

#[derive(Default)]
struct DesktopBackendState {
    runtime: Mutex<Option<DesktopBackendRuntime>>,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct DesktopBackendConfig {
    health_url: String,
    api_base_url: String,
    port: u16,
}

struct DesktopBackendPaths {
    backend_root: PathBuf,
    source_entry: PathBuf,
    dist_entry: PathBuf,
    runtime_root: PathBuf,
    database_path: PathBuf,
    jwt_secret_path: PathBuf,
    log_path: PathBuf,
    sidecar_path: PathBuf,
}

fn resolve_backend_root(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let backend_root = if cfg!(debug_assertions) {
        PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("..")
            .join("..")
            .join("backend")
    } else {
        app.path()
            .resource_dir()
            .map_err(|error| format!("Failed to resolve resource directory: {error}"))?
            .join("backend")
    };

    if backend_root.exists() {
        Ok(backend_root)
    } else {
        Err(format!(
            "Backend bundle directory was not found at {}",
            backend_root.display()
        ))
    }
}

fn resolve_sidecar_path() -> Result<PathBuf, String> {
    let current_exe =
        std::env::current_exe().map_err(|error| format!("Failed to resolve app executable: {error}"))?;
    let sidecar_name = if cfg!(windows) {
        "backend-node.exe"
    } else {
        "backend-node"
    };
    let sidecar_path = current_exe.with_file_name(sidecar_name);

    if sidecar_path.exists() {
        Ok(sidecar_path)
    } else {
        Err(format!(
            "Backend sidecar was not found at {}",
            sidecar_path.display()
        ))
    }
}

fn database_url(path: &Path) -> String {
    format!("file:{}", path.to_string_lossy().replace('\\', "/"))
}

fn resolve_seed_database(backend_root: &Path) -> Result<PathBuf, String> {
    let candidates = [
        backend_root.join("prisma").join("dev.db"),
        backend_root.join("dev.db"),
    ];

    candidates
        .into_iter()
        .find(|path| path.exists())
        .ok_or_else(|| {
            format!(
                "Seed database was not found. Checked: {} and {}",
                backend_root.join("prisma").join("dev.db").display(),
                backend_root.join("dev.db").display()
            )
        })
}

fn read_or_create_secret(path: &Path) -> Result<String, String> {
    if path.exists() {
        let secret = fs::read_to_string(path)
            .map_err(|error| format!("Failed to read desktop JWT secret: {error}"))?;
        let secret = secret.trim();

        if !secret.is_empty() {
            return Ok(secret.to_string());
        }
    }

    let secret = format!("{}{}", Uuid::new_v4().simple(), Uuid::new_v4().simple());
    fs::write(path, format!("{secret}\n"))
        .map_err(|error| format!("Failed to persist desktop JWT secret: {error}"))?;
    Ok(secret)
}

fn pick_available_port() -> Result<u16, String> {
    let listener = TcpListener::bind(("127.0.0.1", 0))
        .map_err(|error| format!("Failed to reserve desktop backend port: {error}"))?;
    let port = listener
        .local_addr()
        .map_err(|error| format!("Failed to inspect reserved desktop backend port: {error}"))?
        .port();
    drop(listener);
    Ok(port)
}

fn prepare_backend_paths(app: &tauri::AppHandle) -> Result<DesktopBackendPaths, String> {
    let backend_root = resolve_backend_root(app)?;
    let source_entry = backend_root.join("src").join("index.ts");
    let dist_entry = backend_root.join("dist").join("index.js");

    if !source_entry.exists() && !dist_entry.exists() {
        return Err(format!(
            "Backend entry file was not found at {} or {}",
            source_entry.display(),
            dist_entry.display()
        ));
    }

    let runtime_root = app
        .path()
        .app_local_data_dir()
        .map_err(|error| format!("Failed to resolve desktop data directory: {error}"))?
        .join("backend");
    fs::create_dir_all(&runtime_root)
        .map_err(|error| format!("Failed to create desktop backend runtime directory: {error}"))?;

    let database_path = runtime_root.join("app.db");
    if !database_path.exists() {
        let seed_database = resolve_seed_database(&backend_root)?;

        fs::copy(&seed_database, &database_path).map_err(|error| {
            format!(
                "Failed to prepare writable desktop database from {}: {error}",
                seed_database.display()
            )
        })?;
    }

    Ok(DesktopBackendPaths {
        backend_root,
        source_entry,
        dist_entry,
        runtime_root: runtime_root.clone(),
        database_path,
        jwt_secret_path: runtime_root.join("jwt-secret.txt"),
        log_path: runtime_root.join("backend.log"),
        sidecar_path: resolve_sidecar_path()?,
    })
}

fn desktop_backend_config(port: u16) -> DesktopBackendConfig {
    DesktopBackendConfig {
        health_url: format!("http://127.0.0.1:{port}/health"),
        api_base_url: format!("http://127.0.0.1:{port}/api"),
        port,
    }
}

fn configure_backend_command(
    command: &mut Command,
    paths: &DesktopBackendPaths,
    config: &DesktopBackendConfig,
    jwt_secret: &str,
    stdout: Stdio,
    stderr: Stdio,
) {
    command
        .current_dir(&paths.backend_root)
        .env("PORT", config.port.to_string())
        .env(
            "NODE_ENV",
            if cfg!(debug_assertions) {
                "development"
            } else {
                "production"
            },
        )
        .env("FRONTEND_URL", DESKTOP_FRONTEND_ORIGINS)
        .env("DATABASE_URL", database_url(&paths.database_path))
        .env("JWT_SECRET", jwt_secret)
        .env("DESKTOP_RUNTIME_DIR", paths.runtime_root.as_os_str())
        .stdin(Stdio::null())
        .stdout(stdout)
        .stderr(stderr);

    if cfg!(debug_assertions) && paths.source_entry.exists() {
        command
            .arg("-r")
            .arg("ts-node/register/transpile-only")
            .arg(&paths.source_entry)
            .env("TS_NODE_PROJECT", paths.backend_root.join("tsconfig.json"))
            .env("TS_NODE_TRANSPILE_ONLY", "true");
    } else {
        command.arg(&paths.dist_entry);
    }

    #[cfg(windows)]
    command.creation_flags(CREATE_NO_WINDOW);
}

fn terminate_child(child: &mut Child) {
    let _ = child.kill();
    let _ = child.wait();
}

fn start_desktop_backend(
    app: &tauri::AppHandle,
    force_restart: bool,
) -> Result<DesktopBackendConfig, String> {
    let backend_state = app.state::<DesktopBackendState>();
    let mut runtime_guard = backend_state
        .runtime
        .lock()
        .map_err(|_| "Desktop backend state lock is poisoned".to_string())?;

    if force_restart {
        if let Some(runtime) = runtime_guard.as_mut() {
            terminate_child(&mut runtime.child);
        }
        *runtime_guard = None;
    }

    if let Some(runtime) = runtime_guard.as_mut() {
        match runtime.child.try_wait() {
            Ok(None) => return Ok(runtime.config.clone()),
            Ok(Some(_)) => {
                *runtime_guard = None;
            }
            Err(error) => {
                return Err(format!("Failed to inspect backend process state: {error}"));
            }
        }
    }

    let paths = prepare_backend_paths(app)?;
    let jwt_secret = read_or_create_secret(&paths.jwt_secret_path)?;
    let config = desktop_backend_config(pick_available_port()?);

    let mut log_file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&paths.log_path)
        .map_err(|error| format!("Failed to open desktop backend log file: {error}"))?;

    let _ = writeln!(
        log_file,
        "\n[{}] Starting desktop backend on port {}",
        chrono_like_timestamp(),
        config.port
    );

    let stderr_log = log_file
        .try_clone()
        .map_err(|error| format!("Failed to prepare backend stderr log file: {error}"))?;

    let mut command = Command::new(&paths.sidecar_path);
    configure_backend_command(
        &mut command,
        &paths,
        &config,
        &jwt_secret,
        Stdio::from(log_file),
        Stdio::from(stderr_log),
    );

    let child = command.spawn().map_err(|error| {
        format!(
            "Failed to start desktop backend using {}: {error}",
            paths.sidecar_path.display()
        )
    })?;

    *runtime_guard = Some(DesktopBackendRuntime {
        child,
        config: config.clone(),
    });

    Ok(config)
}

#[tauri::command]
fn ensure_desktop_backend(app: tauri::AppHandle) -> Result<DesktopBackendConfig, String> {
    start_desktop_backend(&app, false)
}

#[tauri::command]
fn restart_desktop_backend(app: tauri::AppHandle) -> Result<DesktopBackendConfig, String> {
    start_desktop_backend(&app, true)
}

fn chrono_like_timestamp() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    now.to_string()
}

fn warm_desktop_backend(app: tauri::AppHandle) {
    tauri::async_runtime::spawn(async move {
        if let Err(error) = start_desktop_backend(&app, false) {
            log::error!("Failed to warm desktop backend: {error}");
        }
    });
}

fn stop_desktop_backend(app: &tauri::AppHandle) {
    let Some(backend_state) = app.try_state::<DesktopBackendState>() else {
        return;
    };

    let Ok(mut runtime_guard) = backend_state.runtime.lock() else {
        return;
    };

    if let Some(runtime) = runtime_guard.as_mut() {
        terminate_child(&mut runtime.child);
    }

    *runtime_guard = None;
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .setup(|app| {
            app.manage(DesktopBackendState::default());
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            warm_desktop_backend(app.handle().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            ensure_desktop_backend,
            restart_desktop_backend
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|app_handle, event| {
        if let tauri::RunEvent::Exit = event {
            stop_desktop_backend(app_handle);
        }
    });
}
