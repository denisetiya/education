import React from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    Info,
    X,
    XCircle
} from 'lucide-react';

type NotificationTone = 'success' | 'error' | 'warning' | 'info';

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

interface NotificationContextValue {
    notify: (input: NotificationInput) => string;
    dismiss: (id: string) => void;
    success: (message: string, title?: string) => string;
    error: (message: string, title?: string) => string;
    warning: (message: string, title?: string) => string;
    info: (message: string, title?: string) => string;
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

const createNotificationId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    return `notification-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const NotificationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
    const timeoutMapRef = React.useRef<Record<string, number>>({});

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

    React.useEffect(() => () => {
        Object.values(timeoutMapRef.current).forEach((timeoutId) => window.clearTimeout(timeoutId));
        timeoutMapRef.current = {};
    }, []);

    const contextValue = React.useMemo<NotificationContextValue>(() => ({
        notify,
        dismiss,
        success: (message, title) => notify({ tone: 'success', message, title }),
        error: (message, title) => notify({ tone: 'error', message, title }),
        warning: (message, title) => notify({ tone: 'warning', message, title }),
        info: (message, title) => notify({ tone: 'info', message, title })
    }), [dismiss, notify]);

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}

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
