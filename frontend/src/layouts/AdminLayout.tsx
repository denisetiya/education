import React, { useMemo, useSyncExternalStore } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Building2, LayoutDashboard, LogOut, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type NavItem = { to: string; label: string; icon: React.ReactNode; match: (p: string) => boolean };

const subscribeMedia = (cb: () => void) => {
    const mq = window.matchMedia('(max-width: 1024px)');
    mq.addEventListener('change', cb);
    return () => mq.removeEventListener('change', cb);
};
const useIsMobile = () => useSyncExternalStore(subscribeMedia, () => window.matchMedia('(max-width: 1024px)').matches, () => false);

export const AdminLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const isMobile = useIsMobile();

    const navItems = useMemo<NavItem[]>(() => [
        { to: '/admin', label: 'Overview', icon: <LayoutDashboard size={18} />, match: (p) => p === '/admin' || p === '/admin/' },
        { to: '/admin/users', label: 'Users', icon: <Users size={18} />, match: (p) => p.startsWith('/admin/users') },
        { to: '/admin/materials', label: 'Materials', icon: <BookOpen size={18} />, match: (p) => p.startsWith('/admin/materials') },
        { to: '/admin/classes', label: 'Classes', icon: <Building2 size={18} />, match: (p) => p.startsWith('/admin/classes') },
    ], []);

    const bottomNav = useMemo(() => [
        { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'Home', match: (p: string) => p === '/admin' || p === '/admin/' },
        { to: '/admin/users', icon: <Users size={20} />, label: 'Users', match: (p: string) => p.startsWith('/admin/users') },
        { to: '/admin/materials', icon: <BookOpen size={20} />, label: 'Materi', match: (p: string) => p.startsWith('/admin/materials') },
        { to: '/admin/classes', icon: <Building2 size={20} />, label: 'Kelas', match: (p: string) => p.startsWith('/admin/classes') },
    ], []);

    const handleLogout = async () => { await logout(); navigate('/login'); };

    if (isMobile) {
        return (
            <div style={{ minHeight: '100vh', background: '#fafafa', paddingBottom: '4.5rem' }}>
                <header style={{
                    position: 'sticky', top: 0, zIndex: 40,
                    background: 'white', borderBottom: '1px solid #e4e4e7',
                    padding: '0.75rem 1rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <img src="/logo-Photoroom.png" alt="Geo Education" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                        <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--gray-900)' }}>Admin</span>
                    </div>
                    <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: '#fef2f2', color: '#dc2626',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8125rem', fontWeight: 600
                    }}>
                        {(user?.name || 'A')[0].toUpperCase()}
                    </div>
                </header>

                <main style={{ padding: '1rem' }}><Outlet /></main>

                <nav style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
                    background: 'white', borderTop: '1px solid #e4e4e7',
                    display: 'flex', justifyContent: 'space-around',
                    padding: '0.5rem 0.25rem', paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))'
                }}>
                    {bottomNav.map((item) => {
                        const active = item.match(location.pathname);
                        return (
                            <Link key={item.to} to={item.to} style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
                                padding: '0.35rem 0.75rem', borderRadius: 8,
                                color: active ? '#dc2626' : 'var(--gray-400)',
                                textDecoration: 'none', fontSize: '0.625rem', fontWeight: active ? 600 : 400
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

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#fafafa' }}>
            <aside style={{
                position: 'fixed', top: 0, left: 0, bottom: 0,
                width: 260, display: 'flex', flexDirection: 'column',
                background: 'white', borderRight: '1px solid #e4e4e7',
                padding: '1.25rem 0.75rem', overflowY: 'auto', zIndex: 30
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0 0.5rem', marginBottom: '1.5rem' }}>
                    <img src="/logo-Photoroom.png" alt="Geo Education" style={{ width: 44, height: 44, objectFit: 'contain' }} />
                    <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--gray-900)', lineHeight: 1.2 }}>Admin Panel</p>
                    </div>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1 }}>
                    {navItems.map((item) => {
                        const active = item.match(location.pathname);
                        return (
                            <Link key={item.to} to={item.to} style={{
                                display: 'flex', alignItems: 'center', gap: '0.6rem',
                                padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)',
                                color: active ? '#dc2626' : 'var(--gray-600)',
                                background: active ? 'rgba(220, 38, 38, 0.06)' : 'transparent',
                                fontWeight: active ? 600 : 400, fontSize: '0.875rem',
                                textDecoration: 'none', transition: 'all 150ms'
                            }}>
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem' }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: '#fef2f2', color: '#dc2626',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.8125rem', fontWeight: 600, flexShrink: 0
                        }}>
                            {(user?.name || 'A')[0].toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--gray-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Admin'}</p>
                            <p style={{ fontSize: '0.6875rem', color: 'var(--gray-400)' }}>Administrator</p>
                        </div>
                        <button onClick={() => void handleLogout()} title="Keluar" style={{
                            padding: '0.4rem', borderRadius: 6, color: 'var(--gray-400)', transition: 'all 150ms'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            <main style={{ marginLeft: 260, flex: 1, minWidth: 0, padding: '1.5rem 2rem' }}>
                <Outlet />
            </main>
        </div>
    );
};
