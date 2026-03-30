import React from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Loader2, RefreshCcw, ServerCrash, Sparkles } from 'lucide-react';
import App from '../App';
import { clearDesktopRuntimeConfig, setDesktopRuntimeConfig } from './runtime-config';
import { isDesktopMode } from '../utils/runtime';

interface DesktopBackendConfig {
    apiBaseUrl: string;
    healthUrl: string;
    port: number;
}

let backendStartupPromise: Promise<DesktopBackendConfig> | null = null;

const wait = (durationMs: number) =>
    new Promise((resolve) => {
        window.setTimeout(resolve, durationMs);
    });

const isBackendReady = async (healthUrl: string) => {
    try {
        const response = await fetch(healthUrl, {
            cache: 'no-store'
        });
        return response.ok;
    } catch {
        return false;
    }
};

const waitForBackend = async (
    healthUrl: string,
    setMessage?: (message: string) => void,
    attempts = 45
) => {
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        if (await isBackendReady(healthUrl)) {
            return;
        }

        setMessage?.(`Menunggu backend siap (${attempt}/${attempts})...`);
        await wait(1000);
    }

    throw new Error('Backend tidak merespons health check tepat waktu.');
};

const ensureDesktopBackend = async (
    setMessage?: (message: string) => void,
    commandName: 'ensure_desktop_backend' | 'restart_desktop_backend' = 'ensure_desktop_backend'
): Promise<DesktopBackendConfig> => {
    if (!isDesktopMode) {
        throw new Error('Desktop bootstrap called outside desktop mode.');
    }

    if (backendStartupPromise) {
        return backendStartupPromise;
    }

    backendStartupPromise = (async () => {
        setMessage?.('Menyalakan backend lokal...');
        const config = await invoke<DesktopBackendConfig>(commandName);

        setMessage?.('Backend sedang dipersiapkan...');
        await waitForBackend(config.healthUrl, setMessage);

        return config;
    })();

    try {
        return await backendStartupPromise;
    } catch (error) {
        backendStartupPromise = null;
        throw error;
    }
};

const getDesktopStartupErrorMessage = (startupError: unknown) => {
    if (typeof startupError === 'string' && startupError.trim()) {
        return startupError;
    }

    if (
        startupError &&
        typeof startupError === 'object' &&
        'message' in startupError &&
        typeof (startupError as { message?: unknown }).message === 'string'
    ) {
        return (startupError as { message: string }).message;
    }

    if (startupError instanceof Error && startupError.message) {
        return startupError.message;
    }

    return 'Terjadi kesalahan saat menjalankan backend desktop.';
};

const DesktopLoadingScreen: React.FC<{ message: string; error: string | null; onRetry: () => void }> = ({
    message,
    error,
    onRetry
}) => (
    <div
        style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'radial-gradient(circle at top, rgba(59, 130, 246, 0.18), transparent 40%), linear-gradient(180deg, #020617, #0f172a 60%, #111827)',
            color: 'white'
        }}
    >
        <div
            style={{
                width: '100%',
                maxWidth: '520px',
                padding: '2rem',
                borderRadius: '28px',
                background: 'rgba(15, 23, 42, 0.82)',
                border: '1px solid rgba(148, 163, 184, 0.18)',
                boxShadow: '0 25px 80px rgba(15, 23, 42, 0.35)',
                textAlign: 'center'
            }}
        >
            <div
                style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '24px',
                    margin: '0 auto 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: error ? 'rgba(239, 68, 68, 0.16)' : 'rgba(59, 130, 246, 0.18)',
                    color: error ? '#fca5a5' : '#93c5fd'
                }}
            >
                {error ? <ServerCrash size={34} /> : <Loader2 size={34} className="animate-spin" />}
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#93c5fd', fontWeight: '700', marginBottom: '0.85rem' }}>
                <Sparkles size={16} />
                Geo Education Desktop
            </div>

            <h1 style={{ fontSize: '1.9rem', fontWeight: '800', marginBottom: '0.85rem' }}>
                {error ? 'Backend belum berhasil dijalankan' : 'Menyiapkan aplikasi desktop'}
            </h1>

            <p style={{ color: '#cbd5e1', lineHeight: 1.7, marginBottom: '1.25rem' }}>{error || message}</p>

            <div
                style={{
                    height: '10px',
                    borderRadius: '999px',
                    overflow: 'hidden',
                    background: 'rgba(148, 163, 184, 0.18)',
                    marginBottom: error ? '1.5rem' : 0
                }}
            >
                <div
                    style={{
                        width: error ? '100%' : '65%',
                        height: '100%',
                        borderRadius: '999px',
                        background: error ? 'linear-gradient(90deg, #ef4444, #f97316)' : 'linear-gradient(90deg, #38bdf8, #2563eb)',
                        animation: error ? 'none' : 'desktop-loader-progress 1.4s ease-in-out infinite alternate'
                    }}
                />
            </div>

            {error && (
                <button
                    onClick={onRetry}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.9rem 1.25rem',
                        borderRadius: '999px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
                        color: 'white',
                        fontWeight: '700',
                        cursor: 'pointer'
                    }}
                >
                    <RefreshCcw size={16} />
                    Coba Lagi
                </button>
            )}

            <style>{`
                @keyframes desktop-loader-progress {
                    from { transform: translateX(-10%); }
                    to { transform: translateX(25%); }
                }
            `}</style>
        </div>
    </div>
);

export const DesktopBootstrap: React.FC = () => {
    const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>(isDesktopMode ? 'loading' : 'ready');
    const [message, setMessage] = React.useState('Menyiapkan layanan lokal...');
    const [error, setError] = React.useState<string | null>(null);
    const [retryKey, setRetryKey] = React.useState(0);

    React.useEffect(() => {
        if (!isDesktopMode) {
            return;
        }

        let isActive = true;

        const start = async () => {
            setStatus('loading');
            setError(null);

            try {
                const commandName = retryKey === 0
                    ? 'ensure_desktop_backend'
                    : 'restart_desktop_backend';
                const config = await ensureDesktopBackend((nextMessage) => {
                    if (isActive) {
                        setMessage(nextMessage);
                    }
                }, commandName);

                if (isActive) {
                    setDesktopRuntimeConfig(config);
                    setStatus('ready');
                }
            } catch (startupError) {
                console.error(startupError);
                if (isActive) {
                    setError(getDesktopStartupErrorMessage(startupError));
                    setStatus('error');
                }
            }
        };

        void start();

        return () => {
            isActive = false;
        };
    }, [retryKey]);

    if (status === 'ready') {
        return <App />;
    }

    return (
        <DesktopLoadingScreen
            message={message}
            error={error}
            onRetry={() => {
                clearDesktopRuntimeConfig();
                backendStartupPromise = null;
                setRetryKey((value) => value + 1);
            }}
        />
    );
};

export default DesktopBootstrap;
