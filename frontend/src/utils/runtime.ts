const hasTauriRuntime =
    typeof window !== 'undefined' &&
    ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);

export const isDesktopMode = import.meta.env.VITE_DESKTOP_MODE === 'true' || hasTauriRuntime;
