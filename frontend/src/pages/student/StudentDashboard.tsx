import React, { useState, useEffect } from 'react';
import { Play, Clock, Award, ChevronRight, TrendingUp, BookOpen, Loader, Flame, GraduationCap, Trophy, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardAPI, materialsAPI } from '../../utils/api';
import { getCategoryIcon } from '../../components/common/IconHelpers';

interface DashboardStats {
    completedMaterials: number;
    totalMaterials: number;
    totalTimeSpent: number;
    badges: number;
}

interface RecentProgress {
    id: string;
    progress: number;
    status: string;
    material: {
        id: string;
        title: string;
        category: string;
        type: string;
    };
}

interface DashboardData {
    user: {
        id: string;
        name: string;
        xp: number;
        level: number;
        streak: number;
    };
    stats: DashboardStats;
    recentProgress: RecentProgress[];
    achievements: any[];
}

interface Material {
    id: string;
    title: string;
    category: string;
    type: string;
    description?: string;
}

export const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [recentMaterials, setRecentMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [dashboard, materials] = await Promise.all([
                    dashboardAPI.student(),
                    materialsAPI.getAll()
                ]);
                setDashboardData(dashboard);
                setRecentMaterials(materials.slice(0, 3));
            } catch (err) {
                console.error('Failed to fetch dashboard:', err);
                setError('Gagal memuat data dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Format time spent (in minutes) to hours
    const formatTimeSpent = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}.${Math.round(mins / 6)} Jam`;
        }
        return `${mins} Menit`;
    };

    // Calculate progress percentage
    const progressPercentage = dashboardData
        ? Math.round((dashboardData.stats.completedMaterials / Math.max(dashboardData.stats.totalMaterials, 1)) * 100)
        : 0;

    // Get category icon helper
    const renderCategoryIcon = (category: string) => {
        return getCategoryIcon(category, 24);
    };

    // Get category color
    const getCategoryColor = (category: string) => {
        const colors: Record<string, { bg: string; text: string }> = {
            'MATEMATIKA': { bg: '#e0e7ff', text: 'var(--primary)' },
            'IPA': { bg: '#dcfce7', text: '#16a34a' },
            'IPS': { bg: '#fef3c7', text: '#d97706' },
            'BAHASA_INDONESIA': { bg: '#fee2e2', text: '#dc2626' },
            'BAHASA_INGGRIS': { bg: '#dbeafe', text: '#2563eb' },
        };
        return colors[category] || { bg: '#f3f4f6', text: '#6b7280' };
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader className="animate-spin" size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-muted)' }}>Memuat dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', background: '#fef2f2' }}>
                <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>
                    Coba Lagi
                </button>
            </div>
        );
    }

    const stats = dashboardData?.stats;
    const currentProgress = dashboardData?.recentProgress?.[0];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Welcome Hero - Modern Glass */}
            <div className="card animate-slide-up" style={{
                background: 'linear-gradient(120deg, var(--primary), var(--accent))',
                color: 'white',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '1.5rem',
                padding: 'clamp(1.5rem, 4vw, 2.5rem)',
                position: 'relative',
                overflow: 'hidden',
                border: 'none',
                justifyContent: 'space-between'
            }}>
                {/* Abstract Shapes */}
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', bottom: '-20px', left: '40%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>

                <div style={{ position: 'relative', zIndex: 1, flex: '2 1 300px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.75rem', background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: '600', marginBottom: '1rem' }}>
                        <Flame size={16} /> Daily Streak: {dashboardData?.user?.streak || user?.streak || 0} Hari
                    </div>
                    <h1 style={{ marginBottom: '1rem', fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: '800', lineHeight: 1.2 }}>Halo, {user?.name || 'Siswa'}!</h1>
                    <p style={{ opacity: 0.9, fontSize: '1.05rem', maxWidth: '400px', marginBottom: '1.5rem' }}>
                        {progressPercentage > 0
                            ? `Kamu sudah menyelesaikan ${progressPercentage}% dari semua materi. ${progressPercentage >= 80 ? 'Luar biasa!' : 'Ayo sedikit lagi!'}`
                            : 'Mulai perjalanan belajarmu hari ini!'}
                    </p>
                    <Link to="/student/materials" className="btn" style={{ background: 'white', color: 'var(--primary)', padding: '0.85rem 1.75rem', fontSize: '0.95rem', fontWeight: 600 }}>
                        <Play size={18} fill="currentColor" /> Lanjut Belajar
                    </Link>
                </div>

                {/* Hero Image / Illustration Placeholder */}
                <div className="animate-float" style={{ display: 'flex', justifyContent: 'center', flex: '1 1 120px', minWidth: '120px' }}>
                    <GraduationCap size={84} color="rgba(255,255,255,0.85)" />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="animate-slide-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem', animationDelay: '0.1s' }}>
                <StatCard
                    icon={<Clock size={24} />}
                    label="Total Waktu Belajar"
                    value={formatTimeSpent(stats?.totalTimeSpent || 0)}
                    color="#3b82f6"
                    bg="rgba(59, 130, 246, 0.1)"
                    trend={stats?.totalTimeSpent ? `+${Math.min(stats.totalTimeSpent, 30)} Menit` : 'Mulai!'}
                />
                <StatCard
                    icon={<Award size={24} />}
                    label="Lencana Diraih"
                    value={String(stats?.badges || 0)}
                    color="#f59e0b"
                    bg="rgba(245, 158, 11, 0.1)"
                    trend={stats?.badges ? 'Baru!' : 'Raih!'}
                />
                <StatCard
                    icon={<BookOpen size={24} />}
                    label="Materi Selesai"
                    value={`${stats?.completedMaterials || 0}/${stats?.totalMaterials || 0}`}
                    color="#10b981"
                    bg="rgba(16, 185, 129, 0.1)"
                    trend={`${progressPercentage}% Selesai`}
                />
            </div>

            {/* Current Course Progress - Modern */}
            {currentProgress && (
                <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Sedang Dipelajari</h2>
                        <Link to="/student/materials" style={{ color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>
                            Lihat Semua <ChevronRight size={16} />
                        </Link>
                    </div>

                    <div className="glass card card-hover-effect animate-slide-up" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', border: '1px solid rgba(255,255,255,0.6)' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '1.5rem',
                            background: `linear-gradient(135deg, ${getCategoryColor(currentProgress.material.category).bg} 0%, ${getCategoryColor(currentProgress.material.category).bg} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: getCategoryColor(currentProgress.material.category).text,
                            boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.2)',
                            flexShrink: 0
                        }}>
                            {getCategoryIcon(currentProgress.material.category, 36)}
                        </div>
                        <div style={{ flex: '1 1 300px' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: getCategoryColor(currentProgress.material.category).text, background: getCategoryColor(currentProgress.material.category).bg, padding: '0.2rem 0.6rem', borderRadius: '0.5rem' }}>
                                    {currentProgress.material.category.replace('_', ' ')}
                                </span>
                                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                                    {currentProgress.material.type}
                                </span>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>{currentProgress.material.title}</h3>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                {currentProgress.status === 'completed' ? 'Selesai!' : 'Lanjutkan pembelajaran'}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${currentProgress.progress}%`, height: '100%', background: currentProgress.progress === 100 ? 'var(--success)' : 'var(--primary)', borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
                                </div>
                                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>{currentProgress.progress}%</span>
                            </div>
                        </div>
                        <Link to={`/student/materials/${currentProgress.material.id}`} className="btn btn-primary" style={{ height: '50px', width: '50px', padding: 0, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Play size={24} fill="currentColor" style={{ marginLeft: '4px' }} />
                        </Link>
                    </div>
                </div>
            )}

            {/* Recent Materials (if no current progress) */}
            {!currentProgress && recentMaterials.length > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Materi Tersedia</h2>
                        <Link to="/student/materials" style={{ color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>
                            Lihat Semua <ChevronRight size={16} />
                        </Link>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1rem' }}>
                        {recentMaterials.map((material) => (
                            <Link key={material.id} to={`/student/materials/${material.id}`} className="glass card card-hover-effect" style={{ display: 'flex', gap: '1rem', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                                <div style={{
                                    width: '52px',
                                    height: '52px',
                                    borderRadius: '1rem',
                                    background: getCategoryColor(material.category).bg,
                                    color: getCategoryColor(material.category).text,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {renderCategoryIcon(material.category)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: '600', color: getCategoryColor(material.category).text, background: getCategoryColor(material.category).bg, padding: '0.15rem 0.4rem', borderRadius: '0.25rem' }}>
                                        {material.category.replace('_', ' ')}
                                    </span>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{material.title}</h4>
                                </div>
                                <ChevronRight size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Achievements */}
            {dashboardData?.achievements && dashboardData.achievements.length > 0 && (
                <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Prestasi Terbaru</h2>
                        <Link to="/student/achievements" style={{ color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>
                            Lihat Semua <ChevronRight size={16} />
                        </Link>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        {dashboardData.achievements.slice(0, 5).map((achievement, index) => (
                            <div key={index} className="glass card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '180px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                                    <Trophy size={20} color="white" />
                                </div>
                                <div>
                                    <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{achievement.name || 'Achievement'}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{achievement.description || 'Diraih!'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, color: string, bg: string, trend: string }> = ({ icon, label, value, color, bg, trend }) => (
    <div className="card glass card-hover-effect animate-slide-up" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'all 0.2s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div style={{
                padding: '0.75rem',
                borderRadius: '1rem',
                background: bg,
                color: color
            }}>
                {icon}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--success)', background: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '1rem' }}>
                <TrendingUp size={12} /> {trend}
            </div>
        </div>

        <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>{label}</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>{value}</h3>
        </div>
    </div>
);
