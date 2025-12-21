import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Trophy,
    Star,
    Zap,
    LogOut,
    Bell,
    Medal,
    FileText,
    PenTool,
    Library,
    Map,
    Hexagon,
    ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Hook to detect screen size
const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(window.matchMedia(query).matches);

    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        window.addEventListener('resize', listener);
        return () => window.removeEventListener('resize', listener);
    }, [matches, query]);

    return matches;
};

export const StudentLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const isActive = (path: string) => location.pathname === path;
    const isMobile = useMediaQuery('(max-width: 768px)');
    
    // Extract classId from URL if inside a class
    const classIdMatch = location.pathname.match(/\/student\/class\/([^/]+)/);
    const classId = classIdMatch ? classIdMatch[1] : null;
    const isInsideClass = !!classId;
    
    // Hide sidebar on class selection page
    const isClassSelectionPage = location.pathname === '/student' || location.pathname === '/student/classes' || location.pathname === '/student/discover';

    // Use actual user data or defaults
    const studentStats = {
        level: user?.level || 1,
        xp: user?.xp || 0,
        maxXp: 3000,
        streak: user?.streak || 0,
        coins: 450
    };

    const xpPercentage = (studentStats.xp / studentStats.maxXp) * 100;

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-gradient)', paddingBottom: (isMobile && !isClassSelectionPage) ? '80px' : '0' }}>

            {/* Sidebar - Desktop Only, Hidden on Class Selection */}
            {!isMobile && !isClassSelectionPage && (
                <aside className="glass-panel" style={{
                    width: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'fixed',
                    height: 'calc(100vh - 2rem)',
                    top: '1rem',
                    left: '1rem',
                    borderRadius: 'var(--radius-lg)',
                    zIndex: 50,
                    boxShadow: 'var(--shadow-xl)'
                }}>
                    {/* Logo Area */}
                    <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem' }}>🎓</div>
                        <h1 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Geo Education</h1>
                    </div>

                    {/* Navigation */}
                    <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {isInsideClass ? (
                            /* Class-specific Navigation */
                            <>
                                <NavItem to="/student/classes" icon={<ArrowLeft size={20} />} label="Pilih Kelas Lain" active={false} />
                                <div style={{ height: '1px', background: 'rgba(0,0,0,0.1)', margin: '0.5rem 0' }} />
                                <NavItem to={`/student/class/${classId}`} icon={<LayoutDashboard size={20} />} label="Dashboard" active={location.pathname === `/student/class/${classId}`} />
                                <NavItem to={`/student/class/${classId}/materials`} icon={<FileText size={20} />} label="Materi" active={location.pathname.includes('/materials')} />
                                <NavItem to={`/student/class/${classId}/exercises`} icon={<PenTool size={20} />} label="Latihan" active={location.pathname.includes('/exercises')} />
                                <NavItem to={`/student/class/${classId}/library`} icon={<Library size={20} />} label="Perpustakaan" active={location.pathname.includes('/library')} />
                                <NavItem to={`/student/class/${classId}/journey`} icon={<Map size={20} />} label="Perjalanan" active={location.pathname.includes('/journey')} />
                                <NavItem to={`/student/class/${classId}/canvas`} icon={<Hexagon size={20} />} label="Canvas Geometri" active={location.pathname.includes('/canvas')} />
                                <NavItem to={`/student/class/${classId}/achievements`} icon={<Trophy size={20} />} label="Achievements" active={location.pathname.includes('/achievements') && location.pathname.includes('/class/')} />
                            </>
                        ) : (
                            /* General Navigation */
                            <>
                                <NavItem to="/student/classes" icon={<LayoutDashboard size={20} />} label="Kelas Saya" active={location.pathname.startsWith('/student/class')} />
                                <NavItem to="/student/leaderboard" icon={<Trophy size={20} />} label="Leaderboard" active={isActive('/student/leaderboard')} />
                                <NavItem to="/student/achievements" icon={<Medal size={20} />} label="Prestasi Saya" active={isActive('/student/achievements')} />
                            </>
                        )}
                    </nav>

                    {/* User Mini Profile */}
                    <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.4)' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                            {user?.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>{user?.name || 'Siswa'}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Level {studentStats.level} • {studentStats.xp} XP</p>
                        </div>
                        <button onClick={handleLogout} style={{ color: 'var(--text-muted)', padding: '0.5rem', borderRadius: '50%', transition: 'background 0.2s', cursor: 'pointer', background: 'transparent', border: 'none' }} title="Logout">
                            <LogOut size={18} />
                        </button>
                    </div>
                </aside>
            )}

            {/* Main Content Wrapper */}
            <div style={{
                marginLeft: (isMobile || isClassSelectionPage) ? '0' : '300px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: '1rem',
                minWidth: 0 // Prevent overflow on grid items
            }}>

                {/* Top Header Floating */}
                <header className="glass" style={{
                    height: '70px',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isMobile ? 'space-between' : 'flex-end',
                    padding: '0 1.5rem',
                    marginBottom: '2rem',
                    position: 'sticky',
                    top: '1rem',
                    zIndex: 40
                }}>
                    {isMobile && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '28px', height: '28px', background: 'var(--primary)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1rem' }}>🎓</div>
                            <span style={{ fontWeight: '800', color: 'var(--primary)' }}>Geo Education</span>
                        </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '1rem' : '2rem' }}>
                        {/* Notifications */}
                        <button style={{ position: 'relative' }}>
                            <Bell size={22} color="var(--text-muted)" />
                            <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: 'var(--error)', borderRadius: '50%' }}></span>
                        </button>

                        {/* XP Bar Component */}
                        {!isMobile && (
                            <div className="card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(0,0,0,0.05)', boxShadow: 'none', background: 'rgba(255,255,255,0.5)' }}>
                                <Star fill="var(--warning)" color="var(--warning)" size={20} />
                                <div style={{ display: 'flex', flexDirection: 'column', width: '120px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                                        <span>LVL {studentStats.level}</span>
                                        <span>{Math.round(xpPercentage)}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginTop: '2px' }}>
                                        <div style={{ width: `${xpPercentage}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: '3px' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Streak */}
                        <div className="animate-pulse" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', fontWeight: 'bold', background: '#fffbeb', padding: '0.5rem 1rem', borderRadius: '2rem' }}>
                            {isMobile ? <Zap fill="currentColor" size={18} /> : <Zap fill="currentColor" size={20} />}
                            <span>{studentStats.streak} {isMobile ? '' : 'Hari'}</span>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main style={{ flex: 1, animation: 'fadeIn 0.5s ease-out' }}>
                    <Outlet />
                </main>
            </div>

            {/* Bottom Nav - Mobile Only, Hidden on Class Selection */}
            {isMobile && !isClassSelectionPage && (
                <div className="glass-panel" style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '70px',
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    zIndex: 100,
                    borderTopLeftRadius: '1rem',
                    borderTopRightRadius: '1rem',
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
                }}>
                    <MobileNavItem to="/student/classes" icon={<LayoutDashboard size={24} />} active={location.pathname.startsWith('/student/class')} />
                    <MobileNavItem to="/student/discover" icon={<BookOpen size={24} />} active={isActive('/student/discover')} />
                    <MobileNavItem to="/student/leaderboard" icon={<Trophy size={24} />} active={isActive('/student/leaderboard')} />
                    <MobileNavItem to="/student/achievements" icon={<Medal size={24} />} active={isActive('/student/achievements')} />
                </div>
            )}
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
        color: active ? 'white' : 'var(--text-muted)',
        background: active ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'transparent',
        fontWeight: active ? '600' : '500',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: active ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none',
        transform: active ? 'scale(1.02)' : 'scale(1)'
    }}>
        {icon}
        <span>{label}</span>
    </Link>
);

const MobileNavItem: React.FC<{ to: string, icon: React.ReactNode, active: boolean }> = ({ to, icon, active }) => (
    <Link to={to} style={{
        padding: '0.8rem',
        borderRadius: '50%',
        color: active ? 'var(--primary)' : 'var(--text-muted)',
        background: active ? 'var(--primary-light)' : 'transparent',
        transition: 'all 0.2s',
        position: 'relative'
    }}>
        {icon}
        {active && <span style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', background: 'var(--primary)', borderRadius: '50%' }}></span>}
    </Link>
);

