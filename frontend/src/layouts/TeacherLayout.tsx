import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    BarChart2,
    Settings,
    LogOut,
    Bell,
    Search,
    FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const TeacherLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const isActive = (path: string) => location.pathname === path;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', backgroundImage: 'radial-gradient(at 100% 0%, rgba(99,102,241,0.05) 0, transparent 50%)' }}>
            {/* Sidebar - Modern Glass Dark */}
            <aside style={{
                width: '280px',
                background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                color: '#f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: 'calc(100vh - 2rem)',
                top: '1rem',
                left: '1rem',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                zIndex: 50,
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(99,102,241,0.5)' }}>
                        <span style={{ fontSize: '1.2rem' }}>🎓</span>
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Geo Education</h1>
                        <span style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '600' }}>Teacher</span>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <NavItem
                        to="/teacher"
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        active={isActive('/teacher')}
                    />
                    <NavItem
                        to="/teacher/classes"
                        icon={<Users size={20} />}
                        label="Manajemen Kelas"
                        active={isActive('/teacher/classes')}
                    />
                    <NavItem
                        to="/teacher/materials"
                        icon={<FileText size={20} />}
                        label="Kelola Materi"
                        active={isActive('/teacher/materials')}
                    />
                    <NavItem
                        to="/teacher/curriculum"
                        icon={<BookOpen size={20} />}
                        label="Kurikulum"
                        active={isActive('/teacher/curriculum')}
                    />
                    <NavItem
                        to="/teacher/analytics"
                        icon={<BarChart2 size={20} />}
                        label="Analitik"
                        active={isActive('/teacher/analytics')}
                    />
                </nav>

                <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', margin: '1rem', borderRadius: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--secondary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {user?.name?.charAt(0).toUpperCase() || 'G'}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <p style={{ fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Guru'}</p>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Guru</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to="/teacher/settings" style={{ flex: 1, padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.1)', textAlign: 'center', fontSize: '0.8rem', color: '#cbd5e1' }}>
                            <Settings size={16} />
                        </Link>
                        <button onClick={async () => { await logout(); navigate('/login'); }} style={{ flex: 1, padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', textAlign: 'center', fontSize: '0.8rem', border: 'none', cursor: 'pointer' }}>
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div style={{ marginLeft: '320px', flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem', paddingLeft: '1rem' }}>
                <header style={{
                    height: '70px',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 2rem',
                    marginBottom: '2rem',
                    position: 'sticky',
                    top: '1rem',
                    zIndex: 40,
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.5)',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    {/* Search Bar */}
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Cari siswa, kelas, atau materi..."
                            style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.8rem', borderRadius: '2rem', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem' }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <button style={{ position: 'relative' }}>
                            <Bell size={20} color="#64748b" />
                            <span style={{ position: 'absolute', top: -2, right: -1, width: '8px', height: '8px', background: 'var(--secondary)', borderRadius: '50%' }}></span>
                        </button>
                        <button
                            className="btn btn-primary"
                            style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
                            onClick={() => navigate('/teacher/materials?create=1')}
                        >
                            + Buat Materi
                        </button>
                    </div>
                </header>

                <main style={{ paddingRight: '2rem', flex: 1, animation: 'fadeIn 0.5s ease-out' }}>
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
        gap: '1rem',
        padding: '0.8rem 1rem',
        borderRadius: 'var(--radius-md)',
        color: active ? 'white' : '#94a3b8',
        background: active ? 'linear-gradient(90deg, var(--primary), transparent)' : 'transparent',
        borderLeft: active ? '4px solid var(--primary)' : '4px solid transparent',
        fontWeight: active ? '600' : '500',
        transition: 'all 0.2s',
    }}
        onMouseEnter={(e) => {
            if (!active) {
                e.currentTarget.style.color = '#e2e8f0';
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }
        }}
        onMouseLeave={(e) => {
            if (!active) {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.background = 'transparent';
            }
        }}
    >
        {icon}
        <span>{label}</span>
    </Link>
);
