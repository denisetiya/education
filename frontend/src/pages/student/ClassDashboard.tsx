import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeft, BookOpen, Trophy, Users, TrendingUp, Lock, CheckCircle, 
    Play, Award, Star, Loader, Settings, ChevronRight 
} from 'lucide-react';
import { classesAPI, progressAPI } from '../../utils/api';

interface DashboardData {
    class: {
        id: string;
        name: string;
        subject: string;
        description?: string;
        progressionMode: string;
        xpMultiplier: number;
        teacher: { name: string };
        modules: Array<{
            id: string;
            title: string;
            order: number;
            materials: Array<{
                id: string;
                title: string;
                type: string;
                moduleOrder: number;
            }>;
        }>;
        achievements: Array<{
            id: string;
            title: string;
            description: string;
            icon: string;
            xpReward: number;
            condition: string;
        }>;
        _count: { students: number };
    };
    progress: {
        completed: number;
        total: number;
        percentage: number;
        xp: number;
    };
    materialProgress: Array<{
        materialId: string;
        status: string;
        score?: number;
    }>;
    achievements: {
        unlocked: Array<{ achievement: { id: string; title: string; icon: string } }>;
        total: number;
    };
}

export const ClassDashboard: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (classId) {
            fetchDashboard();
        }
    }, [classId]);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const dashboardData = await classesAPI.getDashboard(classId!);
            setData(dashboardData);
        } catch (err: any) {
            setError(err.message || 'Gagal memuat dashboard');
        } finally {
            setLoading(false);
        }
    };

    const getMaterialStatus = (materialId: string) => {
        const prog = data?.materialProgress.find(p => p.materialId === materialId);
        return prog?.status || 'not_started';
    };

    const isMaterialLocked = (moduleIndex: number, materialIndex: number) => {
        if (!data || data.class.progressionMode === 'free') return false;
        
        // Sequential mode: check if previous materials are completed
        const allMaterials: { id: string; modIdx: number; matIdx: number }[] = [];
        data.class.modules.forEach((mod, mIdx) => {
            mod.materials.forEach((mat, idx) => {
                allMaterials.push({ id: mat.id, modIdx: mIdx, matIdx: idx });
            });
        });

        const currentIndex = allMaterials.findIndex(
            m => m.modIdx === moduleIndex && m.matIdx === materialIndex
        );

        if (currentIndex === 0) return false;

        const previousMaterial = allMaterials[currentIndex - 1];
        const prevStatus = getMaterialStatus(previousMaterial.id);
        return prevStatus !== 'completed';
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video': return '🎥';
            case 'book': return '📖';
            case 'quiz': return '📝';
            case 'article': return '📄';
            default: return '📚';
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader className="animate-spin" size={48} style={{ color: 'var(--primary)' }} />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error || 'Data tidak ditemukan'}</p>
                <button onClick={() => navigate('/student/classes')} className="btn btn-primary">
                    Kembali
                </button>
            </div>
        );
    }

    const { class: cls, progress, achievements } = data;

    return (
        <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <button 
                    onClick={() => navigate('/student/classes')}
                    style={{
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#64748b',
                        cursor: 'pointer',
                        marginBottom: '1rem'
                    }}
                >
                    <ArrowLeft size={20} /> Pilih Kelas Lain
                </button>

                <div style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    borderRadius: '1.5rem',
                    padding: '2rem',
                    color: 'white'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: '800', marginBottom: '0.5rem' }}>
                                {cls.name}
                            </h1>
                            <p style={{ opacity: 0.9, fontSize: '1.1rem' }}>
                                {cls.subject} • {cls.teacher.name}
                            </p>
                            <div style={{ 
                                marginTop: '1rem', 
                                display: 'flex', 
                                gap: '1rem',
                                flexWrap: 'wrap'
                            }}>
                                <span style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '2rem',
                                    fontSize: '0.9rem'
                                }}>
                                    <Users size={14} style={{ display: 'inline', marginRight: '0.3rem' }} />
                                    {cls._count.students} siswa
                                </span>
                                <span style={{
                                    background: cls.progressionMode === 'sequential' ? 'rgba(251,191,36,0.3)' : 'rgba(16,185,129,0.3)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '2rem',
                                    fontSize: '0.9rem'
                                }}>
                                    {cls.progressionMode === 'sequential' ? '🔒 Bertahap' : '🔓 Bebas'}
                                </span>
                            </div>
                        </div>

                        {/* XP Display */}
                        <div style={{
                            background: 'rgba(255,255,255,0.15)',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            textAlign: 'center',
                            minWidth: '150px'
                        }}>
                            <Star size={32} fill="gold" color="gold" style={{ marginBottom: '0.5rem' }} />
                            <div style={{ fontSize: '2rem', fontWeight: '800' }}>{progress.xp}</div>
                            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>XP Kelas</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <div className="card glass" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '1rem',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <TrendingUp size={24} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#334155' }}>
                                {progress.percentage}%
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Progress</div>
                        </div>
                    </div>
                    <div style={{
                        marginTop: '1rem',
                        height: '8px',
                        background: '#e2e8f0',
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            height: '100%',
                            width: `${progress.percentage}%`,
                            background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                            borderRadius: '4px',
                            transition: 'width 0.5s ease'
                        }} />
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>
                        {progress.completed} dari {progress.total} materi selesai
                    </p>
                </div>

                <div className="card glass" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '1rem',
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Trophy size={24} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#334155' }}>
                                {achievements.unlocked.length}/{achievements.total}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Achievements</div>
                        </div>
                    </div>
                </div>

                <div className="card glass" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '1rem',
                            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <BookOpen size={24} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#334155' }}>
                                {cls.modules.length}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Modul</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modules & Materials */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#334155', marginBottom: '1.5rem' }}>
                        📚 Materi Pembelajaran
                    </h2>

                    {cls.modules.length === 0 ? (
                        <div className="card glass" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                            <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>Belum ada modul di kelas ini.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {cls.modules.map((module, modIdx) => (
                                <div key={module.id} className="card glass" style={{ padding: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#334155', marginBottom: '1rem' }}>
                                        Modul {modIdx + 1}: {module.title}
                                    </h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {module.materials.map((material, matIdx) => {
                                            const status = getMaterialStatus(material.id);
                                            const locked = isMaterialLocked(modIdx, matIdx);

                                            return (
                                                <div
                                                    key={material.id}
                                                    onClick={() => !locked && navigate(`/student/materials/${material.id}`)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '1rem',
                                                        padding: '1rem',
                                                        background: locked ? '#f8fafc' : status === 'completed' ? '#f0fdf4' : 'white',
                                                        borderRadius: '0.75rem',
                                                        border: `2px solid ${locked ? '#e2e8f0' : status === 'completed' ? '#86efac' : '#e2e8f0'}`,
                                                        cursor: locked ? 'not-allowed' : 'pointer',
                                                        opacity: locked ? 0.6 : 1,
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <span style={{ fontSize: '1.5rem' }}>
                                                        {locked ? '🔒' : getTypeIcon(material.type)}
                                                    </span>

                                                    <div style={{ flex: 1 }}>
                                                        <p style={{
                                                            fontWeight: '600',
                                                            color: locked ? '#94a3b8' : '#334155'
                                                        }}>
                                                            {material.title}
                                                        </p>
                                                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                            {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                                                        </p>
                                                    </div>

                                                    {status === 'completed' ? (
                                                        <CheckCircle size={24} color="#16a34a" />
                                                    ) : status === 'in_progress' ? (
                                                        <Play size={24} color="var(--primary)" />
                                                    ) : locked ? (
                                                        <Lock size={24} color="#94a3b8" />
                                                    ) : (
                                                        <ChevronRight size={24} color="#64748b" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Achievements Sidebar */}
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#334155', marginBottom: '1.5rem' }}>
                        🏆 Achievements
                    </h2>

                    {cls.achievements.length === 0 ? (
                        <div className="card glass" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                            <Trophy size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
                            <p>Belum ada achievement.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {cls.achievements.map(ach => {
                                const isUnlocked = achievements.unlocked.some(u => u.achievement.id === ach.id);

                                return (
                                    <div
                                        key={ach.id}
                                        className="card glass"
                                        style={{
                                            padding: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            opacity: isUnlocked ? 1 : 0.6,
                                            border: isUnlocked ? '2px solid #fbbf24' : '2px solid transparent'
                                        }}
                                    >
                                        <span style={{ fontSize: '2rem' }}>{ach.icon}</span>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: '700', color: '#334155' }}>{ach.title}</p>
                                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{ach.description}</p>
                                        </div>
                                        <div style={{
                                            background: isUnlocked ? '#fef3c7' : '#f1f5f9',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.85rem',
                                            fontWeight: '700',
                                            color: isUnlocked ? '#92400e' : '#64748b'
                                        }}>
                                            +{ach.xpReward} XP
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
