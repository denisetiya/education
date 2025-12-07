import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Shield,
    Database,
    CreditCard
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
            {/* Sidebar - Admin (Darker/Different Accents) */}
            <aside style={{
                width: '260px',
                background: '#111827', // Darker than teacher
                color: '#e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 50
            }}>
                <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #1f2937' }}>
                    <div style={{ width: '36px', height: '36px', background: '#ef4444', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Shield size={20} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '0.5px' }}>ADMIN PANEL</h1>
                        <span style={{ fontSize: '0.7rem', opacity: 0.6, textTransform: 'uppercase' }}>Geo Education</span>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <NavItem to="/admin" icon={<LayoutDashboard size={18} />} label="Overview" active={isActive('/admin') || isActive('/admin/')} />
                    <NavItem to="/admin/users" icon={<Users size={18} />} label="User Management" active={isActive('/admin/users')} />
                    <NavItem to="/admin/content" icon={<Database size={18} />} label="Content DB" active={isActive('/admin/content')} />
                    <NavItem to="/admin/billing" icon={<CreditCard size={18} />} label="Subscriptions" active={isActive('/admin/billing')} />
                    <NavItem to="/admin/settings" icon={<Settings size={18} />} label="System Settings" active={isActive('/admin/settings')} />
                </nav>

                <div style={{ padding: '2rem', borderTop: '1px solid #1f2937' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444', fontSize: '0.9rem', fontWeight: '600', transition: 'opacity 0.2s' }}>
                        <LogOut size={18} />
                        Logout
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div style={{ marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Admin Header */}
                <header style={{
                    height: '60px',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    padding: '0 2rem',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#64748b' }}>Super Admin</span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>SA</div>
                    </div>
                </header>

                <main style={{ padding: '2rem', flex: 1, maxWidth: '1400px', width: '100%' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

const NavItem: React.FC<{ to: string, icon: React.ReactNode, label: string, active: boolean }> = ({ to, icon, label, active }) => (
    <Link to={to} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        color: active ? 'white' : '#9ca3af',
        background: active ? '#ef4444' : 'transparent',
        fontSize: '0.9rem',
        fontWeight: active ? '600' : '500',
        transition: 'all 0.2s',
    }}
        onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'white' }}
        onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = '#9ca3af' }}
    >
        {icon}
        <span>{label}</span>
    </Link>
);
