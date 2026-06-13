import React, { useMemo, useSyncExternalStore } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    BookOpen,
    Compass,
    Flame,
    LayoutDashboard,
    Library,
    LogOut,
    Map,
    Medal,
    MessageSquare,
    PenTool,
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
    const media = window.matchMedia('(max-width: 1024px)');
    media.addEventListener('change', callback);
    return () => media.removeEventListener('change', callback);
};

const useIsMobile = () =>
    useSyncExternalStore(
        subscribeMedia,
        () => window.matchMedia('(max-width: 1024px)').matches,
        () => false
    );

const StudentLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const isMobile = useIsMobile();

    const classMatch = location.pathname.match(/\/student\/class\/([^/]+)/);
    const classId = classMatch?.[1] ?? null;
    const insideClass = Boolean(classId);

    const generalNav = useMemo<NavItem[]>(() => [
        { to: '/student/classes', label: 'Kelas Saya', icon: <LayoutDashboard size={18} />, active: (p) => p === '/student' || p === '/student/classes' || p.startsWith('/student/class/') },
        { to: '/student/journey', label: 'Peta Belajar', icon: <Map size={18} />, active: (p) => p === '/student/journey' },
        { to: '/student/discover', label: 'Jelajah', icon: <Compass size={18} />, active: (p) => p.startsWith('/student/discover') },
        { to: '/student/leaderboard', label: 'Leaderboard', icon: <Trophy size={18} />, active: (p) => p === '/student/leaderboard' },
        { to: '/student/achievements', label: 'Prestasi', icon: <Medal size={18} />, active: (p) => p === '/student/achievements' }
    ], []);

    const classNav = useMemo<NavItem[]>(() => classId ? [
        { to: '/student/classes', label: 'Kembali', icon: <ArrowLeft size={18} />, active: () => false },
        { to: `/student/class/${classId}`, label: 'Ringkasan', icon: <LayoutDashboard size={18} />, active: (p) => p === `/student/class/${classId}` },
        { to: `/student/class/${classId}/materials`, label: 'Materi', icon: <BookOpen size={18} />, active: (p) => p.includes(`/class/${classId}/materials`) },
        { to: `/student/class/${classId}/exercises`, label: 'Latihan', icon: <PenTool size={18} />, active: (p) => p.includes(`/class/${classId}/exercise`) },
        { to: `/student/class/${classId}/journey`, label: 'Perjalanan', icon: <Map size={18} />, active: (p) => p.includes(`/class/${classId}/journey`) },
        { to: `/student/class/${classId}/library`, label: 'Library', icon: <Library size={18} />, active: (p) => p.includes(`/class/${classId}/library`) },
        { to: `/student/class/${classId}/forum`, label: 'Forum', icon: <MessageSquare size={18} />, active: (p) => p.includes(`/class/${classId}/forum`) },
        { to: `/student/class/${classId}/leaderboard`, label: 'Peringkat', icon: <Trophy size={18} />, active: (p) => p.includes(`/class/${classId}/leaderboard`) }
    ] : [], [classId]);

    const navItems = insideClass ? classNav : generalNav;

    const bottomNav = useMemo(() => {
        if (insideClass && classId) return [
            { to: `/student/class/${classId}`, icon: <LayoutDashboard size={20} />, label: 'Home', active: (p: string) => p === `/student/class/${classId}` },
            { to: `/student/class/${classId}/materials`, icon: <BookOpen size={20} />, label: 'Materi', active: (p: string) => p.includes(`/class/${classId}/materials`) },
            { to: `/student/class/${classId}/journey`, icon: <Map size={20} />, label: 'Journey', active: (p: string) => p.includes(`/class/${classId}/journey`) },
            { to: `/student/class/${classId}/exercises`, icon: <PenTool size={20} />, label: 'Latihan', active: (p: string) => p.includes(`/class/${classId}/exercise`) },
            { to: `/student/class/${classId}/forum`, icon: <MessageSquare size={20} />, label: 'Forum', active: (p: string) => p.includes(`/class/${classId}/forum`) }
        ];
        return [
            { to: '/student/classes', icon: <LayoutDashboard size={20} />, label: 'Kelas', active: (p: string) => p === '/student' || p === '/student/classes' || p.startsWith('/student/class/') },
            { to: '/student/journey', icon: <Map size={20} />, label: 'Belajar', active: (p: string) => p === '/student/journey' },
            { to: '/student/discover', icon: <Compass size={20} />, label: 'Jelajah', active: (p: string) => p.startsWith('/student/discover') },
            { to: '/student/leaderboard', icon: <Trophy size={20} />, label: 'Ranking', active: (p: string) => p === '/student/leaderboard' },
            { to: '/student/achievements', icon: <Medal size={20} />, label: 'Prestasi', active: (p: string) => p === '/student/achievements' }
        ];
    }, [insideClass, classId]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const xp = user?.xp || 0;
    const level = user?.level || 1;
    const streak = user?.streak || 0;
    const targetXp = Math.max(1000, Math.ceil(xp / 500) * 500);
    const progress = Math.min(100, (xp / targetXp) * 100);

    if (isMobile) {
        return (
            <div style={{ minHeight: '100vh', background: '#fafafa', paddingBottom: '4.5rem' }}>
                {/* Mobile Header */}
                <header style={{
                    position: 'sticky', top: 0, zIndex: 40,
                    background: 'white', borderBottom: '1px solid #e4e4e7',
                    padding: '0.75rem 1rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <img src="/logo-Photoroom-v2.png" alt="Geo Education" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                        <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--gray-900)' }}>Geo Education</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {streak > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: 'var(--warning)' }}>
                                <Flame size={14} />
                                <span style={{ fontWeight: 600 }}>{streak}</span>
                            </div>
                        )}
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'var(--primary-light)', color: 'var(--primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.8125rem', fontWeight: 600
                        }}>
                            {(user?.name || 'S')[0].toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Mobile Content */}
                <main style={{ padding: '1rem' }}>
                    <Outlet />
                </main>

                {/* Bottom Navigation */}
                <nav style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
                    background: 'white', borderTop: '1px solid #e4e4e7',
                    display: 'flex', justifyContent: 'space-around',
                    padding: '0.5rem 0.25rem', paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))'
                }}>
                    {bottomNav.map((item) => {
                        const active = item.active(location.pathname);
                        return (
                            <Link key={item.to} to={item.to} style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
                                padding: '0.35rem 0.75rem', borderRadius: 8,
                                color: active ? 'var(--primary)' : 'var(--gray-400)',
                                textDecoration: 'none', fontSize: '0.625rem', fontWeight: active ? 600 : 400,
                                transition: 'color 150ms'
                            }}>
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        );
    }

    // Desktop Layout
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#fafafa' }}>
            {/* Sidebar */}
            <aside style={{
                position: 'fixed', top: 0, left: 0, bottom: 0,
                width: 260, display: 'flex', flexDirection: 'column',
                background: 'white', borderRight: '1px solid #e4e4e7',
                padding: '1.25rem 0.75rem', overflowY: 'auto', zIndex: 30
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0 0.5rem', marginBottom: '1.5rem' }}>
                    <img src="/logo-Photoroom-v2.png" alt="Geo Education" style={{ width: 44, height: 44, objectFit: 'contain' }} />
                    <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--gray-900)', lineHeight: 1.2 }}>Platform Belajar</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1 }}>
                    {navItems.map((item) => {
                        const active = item.active(location.pathname);
                        return (
                            <Link key={`${item.to}-${item.label}`} to={item.to} style={{
                                display: 'flex', alignItems: 'center', gap: '0.6rem',
                                padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)',
                                color: active ? 'var(--primary)' : 'var(--gray-600)',
                                background: active ? 'var(--primary-muted)' : 'transparent',
                                fontWeight: active ? 600 : 400, fontSize: '0.875rem',
                                textDecoration: 'none', transition: 'all 150ms'
                            }}>
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                    {/* XP Progress */}
                    <div style={{ padding: '0.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Level {level}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{xp} XP</span>
                        </div>
                        <div style={{ height: 4, background: 'var(--gray-200)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', borderRadius: 2, transition: 'width 300ms' }} />
                        </div>
                        {streak > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--warning)' }}>
                                <Flame size={12} />
                                <span>{streak} hari streak</span>
                            </div>
                        )}
                    </div>

                    {/* User Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem' }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: 'var(--primary-light)', color: 'var(--primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.8125rem', fontWeight: 600, flexShrink: 0
                        }}>
                            {(user?.name || 'S')[0].toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--gray-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Siswa'}</p>
                            <p style={{ fontSize: '0.6875rem', color: 'var(--gray-400)' }}>Siswa</p>
                        </div>
                        <button onClick={() => void handleLogout()} title="Keluar" style={{
                            padding: '0.4rem', borderRadius: 6, color: 'var(--gray-400)',
                            transition: 'all 150ms'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--error-light)'; e.currentTarget.style.color = 'var(--error)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ marginLeft: 260, flex: 1, minWidth: 0, padding: '1.5rem 2rem' }}>
                <Outlet />
            </main>
        </div>
    );
};

export { StudentLayout };
