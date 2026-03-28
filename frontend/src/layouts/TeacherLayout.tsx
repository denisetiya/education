import React, { useMemo, useSyncExternalStore } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    BarChart3,
    BookOpen,
    ClipboardCheck,
    FileStack,
    GraduationCap,
    LayoutDashboard,
    LogOut,
    Plus,
    Sparkles,
    Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type TeacherNavItem = {
    to: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    match: (pathname: string) => boolean;
};

type HeaderAction = {
    label: string;
    variant: 'primary' | 'secondary';
    onClick: () => void;
};

const subscribeMedia = (callback: () => void) => {
    const media = window.matchMedia('(max-width: 1080px)');
    const listener = () => callback();
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
};

const getMediaSnapshot = () => window.matchMedia('(max-width: 1080px)').matches;
const getServerSnapshot = () => false;

const useCompactShell = () =>
    useSyncExternalStore(subscribeMedia, getMediaSnapshot, getServerSnapshot);

const TeacherLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const compactShell = useCompactShell();

    const navItems = useMemo<TeacherNavItem[]>(
        () => [
            {
                to: '/teacher',
                label: 'Dashboard',
                description: 'Ringkasan kelas, materi, dan review hari ini.',
                icon: <LayoutDashboard size={18} />,
                match: (pathname) => pathname === '/teacher'
            },
            {
                to: '/teacher/classes',
                label: 'Kelas',
                description: 'Kelola kelas, siswa, leaderboard, dan forum.',
                icon: <Users size={18} />,
                match: (pathname) => pathname.startsWith('/teacher/classes')
            },
            {
                to: '/teacher/materials',
                label: 'Materi',
                description: 'Buat konten belajar dan hubungkan ke latihan.',
                icon: <BookOpen size={18} />,
                match: (pathname) => pathname.startsWith('/teacher/materials')
            },
            {
                to: '/teacher/curriculum',
                label: 'Kurikulum',
                description: 'Susun modul dan urutan belajar per kelas.',
                icon: <FileStack size={18} />,
                match: (pathname) => pathname.startsWith('/teacher/curriculum')
            },
            {
                to: '/teacher/analytics',
                label: 'Analitik',
                description: 'Pantau progres kelas dan hasil penilaian.',
                icon: <BarChart3 size={18} />,
                match: (pathname) => pathname.startsWith('/teacher/analytics')
            }
        ],
        []
    );

    const activeItem = navItems.find((item) => item.match(location.pathname)) ?? navItems[0];

    const pageMeta = useMemo(() => {
        const pathname = location.pathname;

        if (/\/teacher\/classes\/[^/]+\/exercise-review\/[^/]+/.test(pathname)) {
            return {
                title: 'Review Penilaian',
                description: 'Nilai jawaban siswa, beri umpan balik, lalu lanjut ke submission berikutnya.',
                accent: 'Antrean review',
                actions: [
                    {
                        label: 'Kembali ke kelas',
                        variant: 'secondary' as const,
                        onClick: () => navigate(pathname.replace(/\/exercise-review\/[^/]+$/, ''))
                    }
                ]
            };
        }

        if (/\/teacher\/classes\/[^/]+\/exercise-editor/.test(pathname)) {
            return {
                title: 'Editor Latihan',
                description: 'Susun paket soal multi-tipe, visual interaktif, dan aturan pengerjaan dari satu halaman.',
                accent: 'Latihan interaktif',
                actions: [
                    {
                        label: 'Kembali ke kelas',
                        variant: 'secondary' as const,
                        onClick: () => navigate(pathname.replace(/\/exercise-editor(\/[^/]+)?$/, ''))
                    }
                ]
            };
        }

        if (/\/teacher\/classes\/[^/]+\/book-editor/.test(pathname)) {
            return {
                title: 'Editor Buku Kelas',
                description: 'Rapikan bahan bacaan kelas agar siswa bisa membaca dan mengulang materi dengan nyaman.',
                accent: 'Library kelas',
                actions: [
                    {
                        label: 'Kembali ke kelas',
                        variant: 'secondary' as const,
                        onClick: () => navigate(pathname.replace(/\/book-editor(\/[^/]+)?$/, ''))
                    }
                ]
            };
        }

        if (/\/teacher\/classes\/[^/]+$/.test(pathname)) {
            return {
                title: 'Ruang Kelas',
                description: 'Akses siswa, materi, latihan, leaderboard, dan forum kelas dari satu workspace.',
                accent: 'Kontrol kelas',
                actions: [
                    {
                        label: 'Tambah latihan',
                        variant: 'primary' as const,
                        onClick: () => navigate(`${pathname}/exercise-editor`)
                    },
                    {
                        label: 'Tambah buku',
                        variant: 'secondary' as const,
                        onClick: () => navigate(`${pathname}/book-editor`)
                    }
                ]
            };
        }

        if (pathname.startsWith('/teacher/materials')) {
            return {
                title: 'Materi dan Konten',
                description: 'Buat artikel, video, e-book, dan kuis dengan struktur yang mudah dipahami guru.',
                accent: 'Konten pembelajaran',
                actions: [
                    {
                        label: 'Buat materi',
                        variant: 'primary' as const,
                        onClick: () => navigate('/teacher/materials?create=1')
                    }
                ]
            };
        }

        if (pathname.startsWith('/teacher/classes')) {
            return {
                title: 'Manajemen Kelas',
                description: 'Buat kelas baru, bagikan kode join, dan pantau aktivitas siswa dengan lebih cepat.',
                accent: 'Operasional kelas',
                actions: [
                    {
                        label: 'Buat kelas',
                        variant: 'primary' as const,
                        onClick: () => navigate('/teacher/classes?create=1')
                    }
                ]
            };
        }

        if (pathname.startsWith('/teacher/curriculum')) {
            return {
                title: 'Perencanaan Kurikulum',
                description: 'Susun modul, materi, dan urutan belajar tanpa harus berpindah-pindah konteks.',
                accent: 'Struktur belajar',
                actions: [
                    {
                        label: 'Kelola modul',
                        variant: 'secondary' as const,
                        onClick: () => navigate('/teacher/curriculum')
                    }
                ]
            };
        }

        if (pathname.startsWith('/teacher/analytics')) {
            return {
                title: 'Analitik Pembelajaran',
                description: 'Lihat progres siswa, penyelesaian materi, dan kebutuhan intervensi secara cepat.',
                accent: 'Insight kelas',
                actions: [
                    {
                        label: 'Buka kelas',
                        variant: 'secondary' as const,
                        onClick: () => navigate('/teacher/classes')
                    }
                ]
            };
        }

        return {
            title: 'Dashboard Guru',
            description: 'Pantau seluruh kelas, materi terbaru, dan antrean review dari satu tempat.',
            accent: 'Workspace guru',
            actions: [
                {
                    label: 'Buat materi',
                    variant: 'primary' as const,
                    onClick: () => navigate('/teacher/materials?create=1')
                },
                {
                    label: 'Kelola kelas',
                    variant: 'secondary' as const,
                    onClick: () => navigate('/teacher/classes')
                }
            ]
        };
    }, [location.pathname, navigate]);

    const headerActions = pageMeta.actions.filter(Boolean) as HeaderAction[];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const shellPadding = compactShell ? '1rem' : '1.25rem';
    const asideWidth = 276;
    const desktopContentOffset = compactShell ? '0' : `calc(${asideWidth}px + 1rem)`;

    return (
        <div
            style={{
                minHeight: '100vh',
                background:
                    'radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 26%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
                padding: shellPadding
            }}
        >
            <div
                style={{
                    minHeight: `calc(100vh - ${compactShell ? '2rem' : '2.5rem'})`
                }}
            >
                <aside
                    style={{
                        position: compactShell ? 'static' : 'fixed',
                        top: compactShell ? 'auto' : shellPadding,
                        left: compactShell ? 'auto' : shellPadding,
                        width: compactShell ? 'auto' : `${asideWidth}px`,
                        height: compactShell ? 'auto' : `calc(100vh - ${shellPadding} - ${shellPadding})`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        padding: compactShell ? '1rem' : '1.2rem',
                        borderRadius: '1.5rem',
                        background: 'rgba(15, 23, 42, 0.96)',
                        border: '1px solid rgba(148, 163, 184, 0.18)',
                        color: '#e2e8f0',
                        boxShadow: '0 24px 48px rgba(15, 23, 42, 0.18)',
                        overflowY: compactShell ? 'visible' : 'auto',
                        zIndex: compactShell ? 'auto' : 20,
                        boxSizing: 'border-box'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div
                            style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '14px',
                                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 12px 24px rgba(59, 130, 246, 0.35)'
                            }}
                        >
                            <GraduationCap size={22} color="white" />
                        </div>
                        <div>
                            <p style={{ fontSize: '1rem', fontWeight: 800, color: 'white' }}>Geo Education</p>
                            <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Workspace untuk guru</p>
                        </div>
                    </div>

                    <div
                        style={{
                            padding: '1rem',
                            borderRadius: '1.2rem',
                            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.22), rgba(99, 102, 241, 0.18))',
                            border: '1px solid rgba(96, 165, 250, 0.18)'
                        }}
                    >
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#bfdbfe', fontSize: '0.76rem', fontWeight: 700, marginBottom: '0.55rem' }}>
                            <Sparkles size={14} />
                            {pageMeta.accent}
                        </div>
                        <p style={{ color: 'white', fontWeight: 800, marginBottom: '0.3rem', lineHeight: 1.4 }}>
                            {pageMeta.title}
                        </p>
                        <p style={{ color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.55 }}>
                            {pageMeta.description}
                        </p>
                    </div>

                    <nav
                        style={{
                            display: 'flex',
                            flexDirection: compactShell ? 'row' : 'column',
                            gap: '0.65rem',
                            overflowX: compactShell ? 'auto' : 'visible',
                            paddingBottom: compactShell ? '0.25rem' : 0
                        }}
                    >
                        {navItems.map((item) => {
                            const active = item.match(location.pathname);
                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    style={{
                                        minWidth: compactShell ? '220px' : 'auto',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '0.85rem',
                                        padding: '0.9rem 1rem',
                                        borderRadius: '1rem',
                                        textDecoration: 'none',
                                        color: active ? 'white' : '#cbd5e1',
                                        background: active
                                            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.28), rgba(99, 102, 241, 0.18))'
                                            : 'rgba(15, 23, 42, 0.4)',
                                        border: active ? '1px solid rgba(96, 165, 250, 0.3)' : '1px solid rgba(148, 163, 184, 0.08)'
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '38px',
                                            height: '38px',
                                            borderRadius: '12px',
                                            background: active ? 'rgba(255, 255, 255, 0.16)' : 'rgba(148, 163, 184, 0.12)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}
                                    >
                                        {item.icon}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.2rem' }}>{item.label}</p>
                                        <p style={{ fontSize: '0.78rem', color: active ? '#dbeafe' : '#94a3b8', lineHeight: 1.5 }}>
                                            {item.description}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    <div
                        style={{
                            marginTop: 'auto',
                            padding: '1rem',
                            borderRadius: '1.2rem',
                            background: 'rgba(15, 23, 42, 0.6)',
                            border: '1px solid rgba(148, 163, 184, 0.12)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.9rem' }}>
                            <div
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '14px',
                                    background: 'linear-gradient(135deg, #22c55e, #14b8a6)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 800
                                }}
                            >
                                {(user?.name || 'G').slice(0, 1).toUpperCase()}
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <p style={{ color: 'white', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {user?.name || 'Guru'}
                                </p>
                                <p style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                                    {activeItem.label} aktif
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.7rem' }}>
                            <button
                                type="button"
                                onClick={() => navigate('/teacher/materials?create=1')}
                                style={{
                                    flex: 1,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.45rem',
                                    padding: '0.8rem 0.9rem',
                                    borderRadius: '0.95rem',
                                    border: '1px solid rgba(96, 165, 250, 0.18)',
                                    background: 'rgba(37, 99, 235, 0.12)',
                                    color: '#dbeafe',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                <Plus size={16} />
                                Buat
                            </button>
                            <button
                                type="button"
                                onClick={() => void handleLogout()}
                                style={{
                                    flex: 1,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.45rem',
                                    padding: '0.8rem 0.9rem',
                                    borderRadius: '0.95rem',
                                    border: '1px solid rgba(248, 113, 113, 0.16)',
                                    background: 'rgba(127, 29, 29, 0.18)',
                                    color: '#fecaca',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                <LogOut size={16} />
                                Keluar
                            </button>
                        </div>
                    </div>
                </aside>

                <div
                    style={{
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        marginLeft: desktopContentOffset
                    }}
                >
                    <header
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: '1rem',
                            flexWrap: 'wrap',
                            padding: compactShell ? '1rem' : '1.35rem 1.5rem',
                            borderRadius: '1.5rem',
                            background: 'rgba(255, 255, 255, 0.82)',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            backdropFilter: 'blur(18px)',
                            boxShadow: '0 24px 48px rgba(148, 163, 184, 0.12)'
                        }}
                    >
                        <div style={{ minWidth: 0 }}>
                            <p style={{ color: '#2563eb', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                                {pageMeta.accent}
                            </p>
                            <h1 style={{ fontSize: compactShell ? '1.5rem' : '1.9rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                                {pageMeta.title}
                            </h1>
                            <p style={{ color: '#475569', lineHeight: 1.65, maxWidth: '720px' }}>{pageMeta.description}</p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            {headerActions.map((action) => (
                                <button
                                    key={action.label}
                                    type="button"
                                    onClick={action.onClick}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.85rem 1.1rem',
                                        borderRadius: '0.95rem',
                                        border:
                                            action.variant === 'primary'
                                                ? '1px solid rgba(59, 130, 246, 0.2)'
                                                : '1px solid rgba(148, 163, 184, 0.24)',
                                        background:
                                            action.variant === 'primary'
                                                ? 'linear-gradient(135deg, #2563eb, #4f46e5)'
                                                : 'white',
                                        color: action.variant === 'primary' ? 'white' : '#0f172a',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        boxShadow:
                                            action.variant === 'primary'
                                                ? '0 18px 36px rgba(37, 99, 235, 0.2)'
                                                : 'none'
                                    }}
                                >
                                    {action.variant === 'primary' ? <Plus size={16} /> : <ClipboardCheck size={16} />}
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </header>

                    <main style={{ minWidth: 0 }}>
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export { TeacherLayout };
