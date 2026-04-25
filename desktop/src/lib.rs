use serde::{Deserialize, Serialize};
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

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct DesktopSeedManifest {
    seed_version: String,
}

#[cfg(windows)]
fn normalize_windows_path(path: PathBuf) -> PathBuf {
    let raw = path.to_string_lossy();
    if let Some(stripped) = raw.strip_prefix(r"\\?\") {
        PathBuf::from(stripped)
    } else {
        path
    }
}

#[cfg(not(windows))]
fn normalize_windows_path(path: PathBuf) -> PathBuf {
    path
}

fn resolve_backend_root(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let mut candidates = Vec::new();

    if cfg!(debug_assertions) {
        candidates.push(PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("..").join("backend"));
    } else {
        let resource_dir = app
            .path()
            .resource_dir()
            .map_err(|error| format!("Failed to resolve resource directory: {error}"))?;
        let current_exe =
            std::env::current_exe().map_err(|error| format!("Failed to resolve app executable: {error}"))?;
        let exe_dir = current_exe.parent().ok_or_else(|| {
            format!(
                "Failed to resolve executable directory for {}",
                current_exe.display()
            )
        })?;

        candidates.push(normalize_windows_path(resource_dir.join("backend")));
        candidates.push(normalize_windows_path(resource_dir.join("resources").join("backend")));
        candidates.push(normalize_windows_path(exe_dir.join("resources").join("backend")));
        candidates.push(normalize_windows_path(exe_dir.join("backend")));
    }

    let inspected_candidates = candidates
        .iter()
        .map(|path| path.display().to_string())
        .collect::<Vec<_>>()
        .join(", ");

    candidates.into_iter().find(|path| path.exists()).ok_or_else(|| {
        format!(
            "Backend bundle directory was not found in any known desktop location. Checked: {inspected_candidates}"
        )
    })
}

fn resolve_sidecar_path() -> Result<PathBuf, String> {
    let current_exe =
        std::env::current_exe().map_err(|error| format!("Failed to resolve app executable: {error}"))?;
    let exe_dir = current_exe.parent().ok_or_else(|| {
        format!(
            "Failed to resolve executable directory for {}",
            current_exe.display()
        )
    })?;
    let sidecar_name = if cfg!(windows) {
        "backend-node.exe"
    } else {
        "backend-node"
    };
    let exact_candidates = [
        current_exe.with_file_name(sidecar_name),
        exe_dir.join(sidecar_name),
    ];

    if let Some(sidecar_path) = exact_candidates.into_iter().find(|path| path.exists()) {
        return Ok(sidecar_path);
    }

    let mut fallback_candidates = fs::read_dir(exe_dir)
        .map_err(|error| format!("Failed to inspect executable directory for sidecars: {error}"))?
        .filter_map(|entry| entry.ok())
        .map(|entry| entry.path())
        .filter(|path| {
            path.file_name()
                .and_then(|value| value.to_str())
                .map(|value| value.starts_with("backend-node"))
                .unwrap_or(false)
        });

    fallback_candidates.next().ok_or_else(|| {
        format!(
            "Backend sidecar was not found next to the installed app in {}",
            exe_dir.display()
        )
    })
}

fn database_url(path: &Path) -> String {
    format!("file:{}", path.to_string_lossy().replace('\\', "/"))
}

fn startup_log_path(app: &tauri::AppHandle) -> Option<PathBuf> {
    let runtime_root = app.path().app_local_data_dir().ok()?.join("backend");
    fs::create_dir_all(&runtime_root).ok()?;
    Some(runtime_root.join("startup.log"))
}

fn append_startup_log(app: &tauri::AppHandle, message: impl AsRef<str>) {
    let Some(path) = startup_log_path(app) else {
        return;
    };

    let Ok(mut file) = OpenOptions::new().create(true).append(true).open(path) else {
        return;
    };

    let _ = writeln!(file, "[{}] {}", chrono_like_timestamp(), message.as_ref());
}

fn sqlite_sidecar_paths(database_path: &Path) -> Vec<PathBuf> {
    ["-wal", "-shm", "-journal"]
        .iter()
        .map(|suffix| PathBuf::from(format!("{}{}", database_path.to_string_lossy(), suffix)))
        .collect()
}

fn read_seed_manifest(path: &Path) -> Result<Option<DesktopSeedManifest>, String> {
    if !path.exists() {
        return Ok(None);
    }

    let raw = fs::read_to_string(path).map_err(|error| {
        format!(
            "Failed to read bundled desktop seed manifest at {}: {error}",
            path.display()
        )
    })?;

    let manifest = serde_json::from_str::<DesktopSeedManifest>(&raw).map_err(|error| {
        format!(
            "Failed to parse bundled desktop seed manifest at {}: {error}",
            path.display()
        )
    })?;

    Ok(Some(manifest))
}

fn read_runtime_seed_version(path: &Path) -> Result<Option<String>, String> {
    if !path.exists() {
        return Ok(None);
    }

    let value = fs::read_to_string(path).map_err(|error| {
        format!(
            "Failed to read desktop runtime seed marker at {}: {error}",
            path.display()
        )
    })?;

    let value = value.trim();
    if value.is_empty() {
        return Ok(None);
    }

    Ok(Some(value.to_string()))
}

fn write_runtime_seed_version(path: &Path, seed_version: &str) -> Result<(), String> {
    fs::write(path, format!("{seed_version}\n")).map_err(|error| {
        format!(
            "Failed to persist desktop runtime seed marker at {}: {error}",
            path.display()
        )
    })
}

fn should_refresh_runtime_database(
    seed_database: &Path,
    runtime_database: &Path,
    bundled_seed_version: Option<&str>,
    runtime_seed_version: Option<&str>,
) -> Result<bool, String> {
    if !runtime_database.exists() {
        return Ok(true);
    }

    if let Some(bundled_seed_version) = bundled_seed_version {
        return Ok(runtime_seed_version != Some(bundled_seed_version));
    }

    let seed_modified = fs::metadata(seed_database)
        .and_then(|metadata| metadata.modified())
        .map_err(|error| format!("Failed to inspect seed database timestamp: {error}"))?;
    let runtime_modified = fs::metadata(runtime_database)
        .and_then(|metadata| metadata.modified())
        .map_err(|error| format!("Failed to inspect desktop runtime database timestamp: {error}"))?;

    Ok(seed_modified > runtime_modified)
}

fn replace_runtime_database(seed_database: &Path, runtime_database: &Path) -> Result<(), String> {
    if runtime_database.exists() {
        fs::remove_file(runtime_database).map_err(|error| {
            format!(
                "Failed to clear outdated desktop database at {}: {error}",
                runtime_database.display()
            )
        })?;
    }

    for sidecar_path in sqlite_sidecar_paths(runtime_database) {
        if sidecar_path.exists() {
            fs::remove_file(&sidecar_path).map_err(|error| {
                format!(
                    "Failed to clear stale SQLite sidecar file {}: {error}",
                    sidecar_path.display()
                )
            })?;
        }
    }

    fs::copy(seed_database, runtime_database).map_err(|error| {
        format!(
            "Failed to prepare writable desktop database from {}: {error}",
            seed_database.display()
        )
    })?;

    Ok(())
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
    let runtime_seed_version_path = runtime_root.join("seed-version.txt");
    let seed_database = resolve_seed_database(&backend_root)?;
    let bundled_seed_manifest =
        read_seed_manifest(&backend_root.join("seed-manifest.json"))?;
    let bundled_seed_version = bundled_seed_manifest
        .as_ref()
        .map(|manifest| manifest.seed_version.as_str());
    let runtime_seed_version = read_runtime_seed_version(&runtime_seed_version_path)?;

    if should_refresh_runtime_database(
        &seed_database,
        &database_path,
        bundled_seed_version,
        runtime_seed_version.as_deref(),
    )? {
        append_startup_log(
            app,
            format!(
                "Refreshing runtime database from {} to {}",
                seed_database.display(),
                database_path.display()
            ),
        );
        replace_runtime_database(&seed_database, &database_path)?;
        if let Some(seed_version) = bundled_seed_version {
            write_runtime_seed_version(&runtime_seed_version_path, seed_version)?;
        }
    } else {
        append_startup_log(
            app,
            format!(
                "Keeping existing runtime database at {}",
                database_path.display()
            ),
        );
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
        .env("NODE_PATH", paths.backend_root.join("node_modules"))
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
    append_startup_log(app, format!("start_desktop_backend(force_restart={force_restart})"));
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
                append_startup_log(app, "Existing desktop backend process is no longer running");
                *runtime_guard = None;
            }
            Err(error) => {
                let message = format!("Failed to inspect backend process state: {error}");
                append_startup_log(app, &message);
                return Err(message);
            }
        }
    }

    let paths = prepare_backend_paths(app).map_err(|error| {
        append_startup_log(app, format!("Failed to prepare backend paths: {error}"));
        error
    })?;
    append_startup_log(
        app,
        format!(
            "Using backend_root={}, sidecar={}, database={}",
            paths.backend_root.display(),
            paths.sidecar_path.display(),
            paths.database_path.display()
        ),
    );

    let jwt_secret = read_or_create_secret(&paths.jwt_secret_path).map_err(|error| {
        append_startup_log(app, format!("Failed to prepare JWT secret: {error}"));
        error
    })?;
    let config = desktop_backend_config(pick_available_port().map_err(|error| {
        append_startup_log(app, format!("Failed to reserve backend port: {error}"));
        error
    })?);

    let mut log_file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&paths.log_path)
        .map_err(|error| {
            let message = format!("Failed to open desktop backend log file: {error}");
            append_startup_log(app, &message);
            message
        })?;

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
        let message = format!(
            "Failed to start desktop backend using {}: {error}",
            paths.sidecar_path.display()
        );
        append_startup_log(app, &message);
        message
    })?;
    append_startup_log(
        app,
        format!("Spawned desktop backend sidecar on port {}", config.port),
    );

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
            append_startup_log(&app, format!("Failed to warm desktop backend: {error}"));
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

    app.run(|app_handle, event| match event {
        tauri::RunEvent::ExitRequested { .. } | tauri::RunEvent::Exit => {
            stop_desktop_backend(app_handle);
        }
        _ => {}
    });
}
