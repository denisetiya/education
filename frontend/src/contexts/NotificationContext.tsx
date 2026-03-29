import React from 'react';
import {
    AlertTriangle,
    CircleAlert,
    CheckCircle2,
    Info,
    X,
    XCircle
} from 'lucide-react';

type NotificationTone = 'success' | 'error' | 'warning' | 'info';
type ConfirmationTone = 'danger' | 'warning' | 'info';

interface NotificationInput {
    title?: string;
    message: string;
    tone?: NotificationTone;
    durationMs?: number;
}

interface NotificationItem {
    id: string;
    title?: string;
    message: string;
    tone: NotificationTone;
    durationMs: number;
}

interface ConfirmationInput {
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: ConfirmationTone;
}

type ConfirmationState = Required<ConfirmationInput>;

interface NotificationContextValue {
    notify: (input: NotificationInput) => string;
    dismiss: (id: string) => void;
    success: (message: string, title?: string) => string;
    error: (message: string, title?: string) => string;
    warning: (message: string, title?: string) => string;
    info: (message: string, title?: string) => string;
    confirm: (input: ConfirmationInput) => Promise<boolean>;
}

const NotificationContext = React.createContext<NotificationContextValue | null>(null);

const toneConfig: Record<NotificationTone, {
    title: string;
    icon: React.ReactNode;
    border: string;
    background: string;
    color: string;
}> = {
    success: {
        title: 'Berhasil',
        icon: <CheckCircle2 size={18} />,
        border: '1px solid rgba(16, 185, 129, 0.22)',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.16), rgba(236, 253, 245, 0.98))',
        color: '#065f46'
    },
    error: {
        title: 'Terjadi Masalah',
        icon: <XCircle size={18} />,
        border: '1px solid rgba(239, 68, 68, 0.22)',
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.16), rgba(254, 242, 242, 0.98))',
        color: '#991b1b'
    },
    warning: {
        title: 'Perlu Dicek',
        icon: <AlertTriangle size={18} />,
        border: '1px solid rgba(245, 158, 11, 0.22)',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16), rgba(255, 251, 235, 0.98))',
        color: '#92400e'
    },
    info: {
        title: 'Informasi',
        icon: <Info size={18} />,
        border: '1px solid rgba(59, 130, 246, 0.22)',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.16), rgba(239, 246, 255, 0.98))',
        color: '#1d4ed8'
    }
};

const confirmationToneConfig: Record<ConfirmationTone, {
    icon: React.ReactNode;
    accent: string;
    surface: string;
    text: string;
    buttonBackground: string;
}> = {
    danger: {
        icon: <XCircle size={20} />,
        accent: '#dc2626',
        surface: 'linear-gradient(135deg, rgba(254, 242, 242, 0.98), rgba(254, 226, 226, 0.98))',
        text: '#7f1d1d',
        buttonBackground: 'linear-gradient(135deg, #dc2626, #ef4444)'
    },
    warning: {
        icon: <AlertTriangle size={20} />,
        accent: '#d97706',
        surface: 'linear-gradient(135deg, rgba(255, 251, 235, 0.98), rgba(254, 243, 199, 0.98))',
        text: '#92400e',
        buttonBackground: 'linear-gradient(135deg, #d97706, #f59e0b)'
    },
    info: {
        icon: <CircleAlert size={20} />,
        accent: '#2563eb',
        surface: 'linear-gradient(135deg, rgba(239, 246, 255, 0.98), rgba(219, 234, 254, 0.98))',
        text: '#1d4ed8',
        buttonBackground: 'linear-gradient(135deg, #2563eb, #3b82f6)'
    }
};

const createNotificationId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    return `notification-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const NotificationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
    const [confirmation, setConfirmation] = React.useState<ConfirmationState | null>(null);
    const timeoutMapRef = React.useRef<Record<string, number>>({});
    const confirmationResolverRef = React.useRef<((value: boolean) => void) | null>(null);

    const dismiss = React.useCallback((id: string) => {
        const activeTimeout = timeoutMapRef.current[id];
        if (activeTimeout) {
            window.clearTimeout(activeTimeout);
            delete timeoutMapRef.current[id];
        }

        setNotifications((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const notify = React.useCallback((input: NotificationInput) => {
        const id = createNotificationId();
        const tone = input.tone ?? 'info';
        const durationMs = input.durationMs ?? (tone === 'error' ? 6500 : 4200);

        setNotifications((prev) => [
            ...prev,
            {
                id,
                title: input.title,
                message: input.message,
                tone,
                durationMs
            }
        ]);

        timeoutMapRef.current[id] = window.setTimeout(() => {
            dismiss(id);
        }, durationMs);

        return id;
    }, [dismiss]);

    const resolveConfirmation = React.useCallback((value: boolean) => {
        confirmationResolverRef.current?.(value);
        confirmationResolverRef.current = null;
        setConfirmation(null);
    }, []);

    const confirm = React.useCallback((input: ConfirmationInput) => {
        if (confirmationResolverRef.current) {
            confirmationResolverRef.current(false);
            confirmationResolverRef.current = null;
        }

        return new Promise<boolean>((resolve) => {
            confirmationResolverRef.current = resolve;
            setConfirmation({
                title: input.title ?? 'Konfirmasi tindakan',
                message: input.message,
                confirmLabel: input.confirmLabel ?? 'Lanjutkan',
                cancelLabel: input.cancelLabel ?? 'Batal',
                tone: input.tone ?? 'warning'
            });
        });
    }, []);

    React.useEffect(() => () => {
        Object.values(timeoutMapRef.current).forEach((timeoutId) => window.clearTimeout(timeoutId));
        timeoutMapRef.current = {};
        if (confirmationResolverRef.current) {
            confirmationResolverRef.current(false);
            confirmationResolverRef.current = null;
        }
    }, []);

    const contextValue = React.useMemo<NotificationContextValue>(() => ({
        notify,
        dismiss,
        success: (message, title) => notify({ tone: 'success', message, title }),
        error: (message, title) => notify({ tone: 'error', message, title }),
        warning: (message, title) => notify({ tone: 'warning', message, title }),
        info: (message, title) => notify({ tone: 'info', message, title }),
        confirm
    }), [dismiss, notify, confirm]);

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}

            {confirmation && (
                <div
                    role="dialog"
                    aria-modal="true"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 3300,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1.5rem',
                        background: 'rgba(15, 23, 42, 0.45)',
                        backdropFilter: 'blur(8px)'
                    }}
                    onClick={() => resolveConfirmation(false)}
                >
                    <div
                        onClick={(event) => event.stopPropagation()}
                        style={{
                            width: 'min(480px, 100%)',
                            borderRadius: '1.4rem',
                            border: '1px solid rgba(148, 163, 184, 0.22)',
                            background: confirmationToneConfig[confirmation.tone].surface,
                            boxShadow: '0 30px 60px rgba(15, 23, 42, 0.24)',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ padding: '1.35rem 1.4rem 1rem', display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
                            <div
                                style={{
                                    width: '2.5rem',
                                    height: '2.5rem',
                                    borderRadius: '999px',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(255, 255, 255, 0.72)',
                                    color: confirmationToneConfig[confirmation.tone].accent
                                }}
                            >
                                {confirmationToneConfig[confirmation.tone].icon}
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <p style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                                    {confirmation.title}
                                </p>
                                <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: confirmationToneConfig[confirmation.tone].text }}>
                                    {confirmation.message}
                                </p>
                            </div>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '0.75rem',
                                padding: '0 1.4rem 1.35rem'
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => resolveConfirmation(false)}
                                style={{
                                    padding: '0.8rem 1rem',
                                    borderRadius: '0.95rem',
                                    border: '1px solid rgba(148, 163, 184, 0.24)',
                                    background: 'rgba(255, 255, 255, 0.82)',
                                    color: '#334155',
                                    fontWeight: 700
                                }}
                            >
                                {confirmation.cancelLabel}
                            </button>
                            <button
                                type="button"
                                onClick={() => resolveConfirmation(true)}
                                style={{
                                    padding: '0.8rem 1rem',
                                    borderRadius: '0.95rem',
                                    border: 'none',
                                    background: confirmationToneConfig[confirmation.tone].buttonBackground,
                                    color: 'white',
                                    fontWeight: 700,
                                    boxShadow: '0 16px 30px rgba(15, 23, 42, 0.16)'
                                }}
                            >
                                {confirmation.confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div
                aria-live="polite"
                aria-atomic="true"
                style={{
                    position: 'fixed',
                    top: '1.25rem',
                    right: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.8rem',
                    width: 'min(420px, calc(100vw - 2rem))',
                    zIndex: 3200,
                    pointerEvents: 'none'
                }}
            >
                {notifications.map((notification) => {
                    const tone = toneConfig[notification.tone];

                    return (
                        <div
                            key={notification.id}
                            role={notification.tone === 'error' ? 'alert' : 'status'}
                            style={{
                                pointerEvents: 'auto',
                                display: 'grid',
                                gridTemplateColumns: 'auto 1fr auto',
                                gap: '0.85rem',
                                alignItems: 'start',
                                padding: '0.95rem 1rem',
                                borderRadius: '1rem',
                                border: tone.border,
                                background: tone.background,
                                boxShadow: '0 18px 45px rgba(15, 23, 42, 0.12)',
                                backdropFilter: 'blur(14px)',
                                color: tone.color,
                                animation: 'slideUp 0.2s ease-out'
                            }}
                        >
                            <div
                                style={{
                                    width: '2rem',
                                    height: '2rem',
                                    borderRadius: '999px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(255, 255, 255, 0.68)'
                                }}
                            >
                                {tone.icon}
                            </div>

                            <div>
                                <p style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: '0.15rem' }}>
                                    {notification.title || tone.title}
                                </p>
                                <p style={{ fontSize: '0.86rem', lineHeight: 1.55 }}>
                                    {notification.message}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => dismiss(notification.id)}
                                aria-label="Tutup notifikasi"
                                style={{
                                    width: '1.85rem',
                                    height: '1.85rem',
                                    borderRadius: '999px',
                                    border: '1px solid rgba(148, 163, 184, 0.24)',
                                    background: 'rgba(255, 255, 255, 0.72)',
                                    color: tone.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = React.useContext(NotificationContext);

    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }

    return context;
};
