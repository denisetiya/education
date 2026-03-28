import React, { useMemo, useSyncExternalStore } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    BookOpen,
    Compass,
    Flame,
    GraduationCap,
    LayoutDashboard,
    Library,
    LogOut,
    Medal,
    MessageSquare,
    PenTool,
    Sparkles,
    Trophy
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type NavItem = {
    to: string;
    label: string;
    icon: React.ReactNode;
    active: (pathname: string) => boolean;
};

const subscribeMedia = (callback: () => void) => {
    const media = window.matchMedia('(max-width: 1080px)');
    const listener = () => callback();
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
};

const useCompactShell = () =>
    useSyncExternalStore(
        subscribeMedia,
        () => window.matchMedia('(max-width: 1080px)').matches,
        () => false
    );

const buttonStyle = (primary: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.45rem',
    padding: '0.85rem 1.05rem',
    borderRadius: '0.95rem',
    border: primary ? '1px solid rgba(14, 165, 233, 0.18)' : '1px solid rgba(148, 163, 184, 0.22)',
    background: primary ? 'linear-gradient(135deg, #0ea5e9, #2563eb)' : 'white',
    color: primary ? 'white' : '#0f172a',
    fontWeight: 700,
    cursor: 'pointer'
});

const StudentLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const compactShell = useCompactShell();

    const classMatch = location.pathname.match(/\/student\/class\/([^/]+)/);
    const classId = classMatch?.[1] ?? null;
    const insideClass = Boolean(classId);

    const generalNav = useMemo<NavItem[]>(
        () => [
            { to: '/student/classes', label: 'Kelas Saya', icon: <LayoutDashboard size={18} />, active: (pathname) => pathname === '/student' || pathname === '/student/classes' || pathname.startsWith('/student/class/') },
            { to: '/student/discover', label: 'Jelajah', icon: <Compass size={18} />, active: (pathname) => pathname.startsWith('/student/discover') },
            { to: '/student/leaderboard', label: 'Leaderboard', icon: <Trophy size={18} />, active: (pathname) => pathname === '/student/leaderboard' },
            { to: '/student/achievements', label: 'Prestasi', icon: <Medal size={18} />, active: (pathname) => pathname === '/student/achievements' }
        ],
        []
    );

    const classNav = useMemo<NavItem[]>(
        () =>
            classId
                ? [
                    { to: '/student/classes', label: 'Kembali', icon: <ArrowLeft size={18} />, active: () => false },
                    { to: `/student/class/${classId}`, label: 'Ringkasan', icon: <LayoutDashboard size={18} />, active: (pathname) => pathname === `/student/class/${classId}` },
                    { to: `/student/class/${classId}/materials`, label: 'Materi', icon: <BookOpen size={18} />, active: (pathname) => pathname.includes(`/student/class/${classId}/materials`) },
                    { to: `/student/class/${classId}/exercises`, label: 'Latihan', icon: <PenTool size={18} />, active: (pathname) => pathname.includes(`/student/class/${classId}/exercise`) || pathname.includes(`/student/class/${classId}/exercises`) },
                    { to: `/student/class/${classId}/library`, label: 'Library', icon: <Library size={18} />, active: (pathname) => pathname.includes(`/student/class/${classId}/library`) },
                    { to: `/student/class/${classId}/forum`, label: 'Forum', icon: <MessageSquare size={18} />, active: (pathname) => pathname.includes(`/student/class/${classId}/forum`) },
                    { to: `/student/class/${classId}/leaderboard`, label: 'Peringkat', icon: <Trophy size={18} />, active: (pathname) => pathname.includes(`/student/class/${classId}/leaderboard`) }
                ]
                : [],
        [classId]
    );

    const navItems = insideClass ? classNav : generalNav;

    const pageMeta = useMemo(() => {
        if (insideClass && classId) {
            if (location.pathname.includes(`/student/class/${classId}/materials`)) {
                return { title: 'Materi Kelas', description: 'Ikuti modul, pahami konsep inti, lalu lanjut ke latihan saat sudah siap.', accent: 'Belajar terarah' };
            }
            if (location.pathname.includes(`/student/class/${classId}/exercises`)) {
                return { title: 'Latihan Interaktif', description: 'Kerjakan soal multi-tipe dan cek hasil terbaru dari guru.', accent: 'Ruang latihan' };
            }
            if (location.pathname.includes(`/student/class/${classId}/forum`)) {
                return { title: 'Forum Diskusi', description: 'Tanya materi, berbagi strategi, dan ikuti pengumuman kelas.', accent: 'Diskusi kelas' };
            }
            if (location.pathname.includes(`/student/class/${classId}/leaderboard`)) {
                return { title: 'Leaderboard Kelas', description: 'Pantau ranking, badge, dan progres teman sekelas.', accent: 'Motivasi belajar' };
            }
            if (location.pathname.includes(`/student/class/${classId}/library`)) {
                return { title: 'Library Kelas', description: 'Buka buku ringkas dan bahan pendamping dari guru.', accent: 'Bahan belajar' };
            }

            return { title: 'Dashboard Kelas', description: 'Lihat progres, langkah berikutnya, dan akses cepat ke materi penting.', accent: 'Ruang kelas' };
        }

        if (location.pathname.startsWith('/student/discover')) {
            return { title: 'Jelajah Kelas', description: 'Temukan kelas publik yang relevan untuk kamu ikuti.', accent: 'Eksplorasi' };
        }
        if (location.pathname.startsWith('/student/leaderboard')) {
            return { title: 'Leaderboard Global', description: 'Bandingkan progres belajarmu dengan siswa lain.', accent: 'Peringkat' };
        }
        if (location.pathname.startsWith('/student/achievements')) {
            return { title: 'Prestasi Saya', description: 'Lihat badge dan target yang bisa dikejar berikutnya.', accent: 'Achievement' };
        }

        return { title: 'Kelas Saya', description: 'Masuk ke kelas, lanjutkan materi, dan pilih fokus belajar hari ini.', accent: 'Belajar harian' };
    }, [classId, insideClass, location.pathname]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const xp = user?.xp || 0;
    const level = user?.level || 1;
    const streak = user?.streak || 0;
    const targetXp = Math.max(1000, Math.ceil(xp / 500) * 500);
    const progress = Math.min(100, (xp / targetXp) * 100);
    const asideWidth = 272;
    const desktopContentOffset = compactShell ? '0' : `calc(${asideWidth}px + 1rem)`;

    const headerActions = insideClass && classId
        ? [
            { label: 'Materi', primary: true, onClick: () => navigate(`/student/class/${classId}/materials`) },
            { label: 'Latihan', primary: false, onClick: () => navigate(`/student/class/${classId}/exercises`) }
        ]
        : [
            { label: 'Kelas Saya', primary: true, onClick: () => navigate('/student/classes') },
            { label: 'Jelajah', primary: false, onClick: () => navigate('/student/discover') }
        ];

    const bottomNav = insideClass && classId
        ? [
            { to: `/student/class/${classId}`, icon: <LayoutDashboard size={20} />, active: (pathname: string) => pathname === `/student/class/${classId}` },
            { to: `/student/class/${classId}/materials`, icon: <BookOpen size={20} />, active: (pathname: string) => pathname.includes(`/student/class/${classId}/materials`) },
            { to: `/student/class/${classId}/exercises`, icon: <PenTool size={20} />, active: (pathname: string) => pathname.includes(`/student/class/${classId}/exercise`) || pathname.includes(`/student/class/${classId}/exercises`) },
            { to: `/student/class/${classId}/forum`, icon: <MessageSquare size={20} />, active: (pathname: string) => pathname.includes(`/student/class/${classId}/forum`) }
        ]
        : [
            { to: '/student/classes', icon: <LayoutDashboard size={20} />, active: (pathname: string) => pathname === '/student' || pathname === '/student/classes' || pathname.startsWith('/student/class/') },
            { to: '/student/discover', icon: <Compass size={20} />, active: (pathname: string) => pathname.startsWith('/student/discover') },
            { to: '/student/leaderboard', icon: <Trophy size={20} />, active: (pathname: string) => pathname === '/student/leaderboard' },
            { to: '/student/achievements', icon: <Medal size={20} />, active: (pathname: string) => pathname === '/student/achievements' }
        ];

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'radial-gradient(circle at top right, rgba(14, 165, 233, 0.12), transparent 24%), linear-gradient(180deg, #f8fafc 0%, #eef6ff 100%)',
                padding: compactShell ? '1rem' : '1.25rem',
                paddingBottom: compactShell ? '5.75rem' : '1.25rem'
            }}
        >
            <div style={{ minHeight: `calc(100vh - ${compactShell ? '6.75rem' : '2.5rem'})` }}>
                <aside
                    style={{
                        position: compactShell ? 'static' : 'fixed',
                        top: compactShell ? 'auto' : '1.25rem',
                        left: compactShell ? 'auto' : '1.25rem',
                        width: compactShell ? 'auto' : `${asideWidth}px`,
                        height: compactShell ? 'auto' : 'calc(100vh - 2.5rem)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        padding: compactShell ? '1rem' : '1.2rem',
                        borderRadius: '1.5rem',
                        background: 'rgba(255, 255, 255, 0.84)',
                        border: '1px solid rgba(148, 163, 184, 0.22)',
                        boxShadow: '0 24px 48px rgba(148, 163, 184, 0.12)',
                        backdropFilter: 'blur(18px)',
                        overflowY: compactShell ? 'visible' : 'auto',
                        zIndex: compactShell ? 'auto' : 20,
                        boxSizing: 'border-box'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <GraduationCap size={22} color="white" />
                        </div>
                        <div>
                            <p style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Geo Education</p>
                            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Ruang belajar siswa</p>
                        </div>
                    </div>

                    <div style={{ padding: '1rem', borderRadius: '1.2rem', background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(37, 99, 235, 0.08))', border: '1px solid rgba(37, 99, 235, 0.12)' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#0369a1', fontSize: '0.76rem', fontWeight: 700, marginBottom: '0.45rem' }}>
                            <Sparkles size={14} />
                            {pageMeta.accent}
                        </div>
                        <p style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>{pageMeta.title}</p>
                        <p style={{ color: '#475569', fontSize: '0.82rem', lineHeight: 1.55 }}>{pageMeta.description}</p>
                    </div>

                    <nav style={{ display: 'flex', flexDirection: compactShell ? 'row' : 'column', gap: '0.65rem', overflowX: compactShell ? 'auto' : 'visible' }}>
                        {navItems.map((item) => {
                            const active = item.active(location.pathname);
                            return (
                                <Link
                                    key={`${item.to}-${item.label}`}
                                    to={item.to}
                                    style={{
                                        minWidth: compactShell ? '188px' : 'auto',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.9rem 1rem',
                                        borderRadius: '1rem',
                                        textDecoration: 'none',
                                        color: '#0f172a',
                                        background: active ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.14), rgba(37, 99, 235, 0.1))' : '#f8fafc',
                                        border: active ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid #e2e8f0',
                                        fontWeight: active ? 700 : 600
                                    }}
                                >
                                    <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: active ? 'white' : '#e2e8f0', color: active ? '#0ea5e9' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {item.icon}
                                    </div>
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div style={{ marginTop: 'auto', padding: '1rem', borderRadius: '1.2rem', background: '#0f172a', color: '#e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.9rem' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #22c55e, #14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>
                                {(user?.name || 'S').slice(0, 1).toUpperCase()}
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <p style={{ color: 'white', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Siswa'}</p>
                                <p style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Level {level}</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.75rem', marginBottom: '0.9rem' }}>
                            <div style={{ padding: '0.75rem', borderRadius: '0.95rem', background: 'rgba(148, 163, 184, 0.12)' }}>
                                <p style={{ color: '#94a3b8', fontSize: '0.74rem', marginBottom: '0.18rem' }}>XP</p>
                                <p style={{ color: 'white', fontWeight: 800 }}>{xp}</p>
                            </div>
                            <div style={{ padding: '0.75rem', borderRadius: '0.95rem', background: 'rgba(148, 163, 184, 0.12)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#fde68a', marginBottom: '0.18rem' }}>
                                    <Flame size={14} />
                                    <span style={{ fontSize: '0.74rem' }}>Streak</span>
                                </div>
                                <p style={{ color: 'white', fontWeight: 800 }}>{streak} hari</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '0.95rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.4rem', color: '#94a3b8', fontSize: '0.74rem', marginBottom: '0.35rem' }}>
                                <span>Progress level</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div style={{ height: '8px', background: 'rgba(148, 163, 184, 0.18)', borderRadius: '999px', overflow: 'hidden' }}>
                                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #22c55e, #38bdf8)', borderRadius: '999px' }} />
                            </div>
                        </div>

                        <button type="button" onClick={() => void handleLogout()} style={{ width: '100%', ...buttonStyle(false), background: 'rgba(127, 29, 29, 0.18)', border: '1px solid rgba(248, 113, 113, 0.18)', color: '#fecaca' }}>
                            <LogOut size={16} />
                            Keluar
                        </button>
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
                    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', padding: compactShell ? '1rem' : '1.35rem 1.5rem', borderRadius: '1.5rem', background: 'rgba(255, 255, 255, 0.84)', border: '1px solid rgba(148, 163, 184, 0.2)', backdropFilter: 'blur(18px)', boxShadow: '0 24px 48px rgba(148, 163, 184, 0.12)' }}>
                        <div>
                            <p style={{ color: '#0369a1', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem' }}>{pageMeta.accent}</p>
                            <h1 style={{ fontSize: compactShell ? '1.5rem' : '1.9rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>{pageMeta.title}</h1>
                            <p style={{ color: '#475569', lineHeight: 1.65, maxWidth: '760px' }}>{pageMeta.description}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            {headerActions.map((action) => (
                                <button key={action.label} type="button" onClick={action.onClick} style={buttonStyle(action.primary)}>
                                    {action.primary ? <BookOpen size={16} /> : <Sparkles size={16} />}
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

            {compactShell && (
                <div style={{ position: 'fixed', left: '1rem', right: '1rem', bottom: '1rem', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.75rem', padding: '0.8rem', borderRadius: '1.4rem', background: 'rgba(15, 23, 42, 0.94)', border: '1px solid rgba(148, 163, 184, 0.16)', boxShadow: '0 20px 40px rgba(15, 23, 42, 0.18)', zIndex: 100 }}>
                    {bottomNav.map((item) => {
                        const active = item.active(location.pathname);
                        return (
                            <Link key={item.to} to={item.to} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.8rem 0.5rem', borderRadius: '1rem', color: active ? 'white' : '#94a3b8', background: active ? 'linear-gradient(135deg, #0ea5e9, #2563eb)' : 'transparent', textDecoration: 'none' }}>
                                {item.icon}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export { StudentLayout };
