import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    ChevronRight,
    Lock,
    MessageSquare,
    PlayCircle,
    Sparkles,
    Star,
    Target,
    Trophy,
    Users
} from 'lucide-react';
import { classesAPI } from '../../utils/api';

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

const getMaterialTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
        article: 'Artikel',
        video: 'Video',
        quiz: 'Kuis',
        book: 'E-book'
    };

    return labels[type] || 'Materi';
};

const getMaterialTypeTone = (type: string) => {
    const tones: Record<string, { background: string; color: string }> = {
        article: { background: '#eff6ff', color: '#1d4ed8' },
        video: { background: '#eef2ff', color: '#4338ca' },
        quiz: { background: '#fef3c7', color: '#92400e' },
        book: { background: '#ecfeff', color: '#155e75' }
    };

    return tones[type] || { background: '#f8fafc', color: '#475569' };
};

export const ClassDashboard: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!classId) {
            return;
        }

        const fetchDashboard = async () => {
            try {
                setLoading(true);
                const dashboardData = await classesAPI.getDashboard(classId);
                setData(dashboardData);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Gagal memuat dashboard');
            } finally {
                setLoading(false);
            }
        };

        void fetchDashboard();
    }, [classId]);

    const getMaterialStatus = (materialId: string) =>
        data?.materialProgress.find((item) => item.materialId === materialId)?.status || 'not_started';

    const isMaterialLocked = (moduleIndex: number, materialIndex: number) => {
        if (!data || data.class.progressionMode === 'free') {
            return false;
        }

        const allMaterials = data.class.modules.flatMap((module, modIdx) =>
            module.materials.map((material, matIdx) => ({
                id: material.id,
                moduleIndex: modIdx,
                materialIndex: matIdx
            }))
        );

        const currentIndex = allMaterials.findIndex(
            (item) => item.moduleIndex === moduleIndex && item.materialIndex === materialIndex
        );

        if (currentIndex <= 0) {
            return false;
        }

        const previousMaterial = allMaterials[currentIndex - 1];
        return getMaterialStatus(previousMaterial.id) !== 'completed';
    };

    if (loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                Memuat dashboard kelas...
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="card glass" style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error || 'Data kelas tidak ditemukan.'}</p>
                <button type="button" className="btn btn-primary" onClick={() => navigate('/student/classes')}>
                    Kembali ke kelas saya
                </button>
            </div>
        );
    }

    const { class: cls, progress, achievements } = data;
    let nextMaterial: { moduleTitle: string; material: DashboardData['class']['modules'][number]['materials'][number] } | null = null;

    for (let modIdx = 0; modIdx < cls.modules.length; modIdx += 1) {
        const module = cls.modules[modIdx];
        for (let matIdx = 0; matIdx < module.materials.length; matIdx += 1) {
            const material = module.materials[matIdx];
            if (!isMaterialLocked(modIdx, matIdx) && getMaterialStatus(material.id) !== 'completed') {
                nextMaterial = {
                    moduleTitle: module.title,
                    material
                };
                break;
            }
        }

        if (nextMaterial) {
            break;
        }
    }

    return (
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <section
                className="card glass"
                style={{
                    padding: '1.6rem',
                    background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(37, 99, 235, 0.08))',
                    border: '1px solid rgba(37, 99, 235, 0.14)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ maxWidth: '760px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: '#0369a1', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                            <Sparkles size={16} />
                            {cls.subject}
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.45rem' }}>{cls.name}</h1>
                        <p style={{ color: '#475569', lineHeight: 1.65, marginBottom: '1rem' }}>
                            {cls.description || 'Kelas ini berisi materi, latihan, dan diskusi yang sudah terhubung dalam satu alur belajar.'}
                        </p>
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                            {[
                                `${cls.teacher.name}`,
                                `${cls._count.students} siswa`,
                                cls.progressionMode === 'sequential' ? 'Belajar bertahap' : 'Belajar fleksibel',
                                `XP x${cls.xpMultiplier}`
                            ].map((item) => (
                                <span
                                    key={item}
                                    style={{
                                        padding: '0.45rem 0.75rem',
                                        borderRadius: '999px',
                                        background: 'rgba(255, 255, 255, 0.72)',
                                        color: '#334155',
                                        fontWeight: 700,
                                        fontSize: '0.78rem'
                                    }}
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        <button type="button" onClick={() => navigate(`/student/class/${classId}/materials`)} style={{ ...actionButton(true) }}>
                            <BookOpen size={16} />
                            Buka materi
                        </button>
                        <button type="button" onClick={() => navigate(`/student/class/${classId}/exercises`)} style={{ ...actionButton(false) }}>
                            <PlayCircle size={16} />
                            Kerjakan latihan
                        </button>
                        <button type="button" onClick={() => navigate(`/student/class/${classId}/forum`)} style={{ ...actionButton(false) }}>
                            <MessageSquare size={16} />
                            Forum kelas
                        </button>
                    </div>
                </div>
            </section>

            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
                {[
                    {
                        label: 'Progress materi',
                        value: `${progress.percentage}%`,
                        helper: `${progress.completed} dari ${progress.total} materi selesai`,
                        icon: <Target size={20} color="white" />,
                        color: 'linear-gradient(135deg, #22c55e, #16a34a)'
                    },
                    {
                        label: 'XP kelas',
                        value: `${progress.xp}`,
                        helper: 'XP bertambah dari materi, latihan, dan achievement',
                        icon: <Star size={20} color="white" />,
                        color: 'linear-gradient(135deg, #2563eb, #4f46e5)'
                    },
                    {
                        label: 'Achievement',
                        value: `${achievements.unlocked.length}/${achievements.total}`,
                        helper: 'Badge yang sudah terbuka di kelas ini',
                        icon: <Trophy size={20} color="white" />,
                        color: 'linear-gradient(135deg, #f59e0b, #d97706)'
                    },
                    {
                        label: 'Modul aktif',
                        value: `${cls.modules.length}`,
                        helper: 'Materi tersusun rapi per topik pembelajaran',
                        icon: <Users size={20} color="white" />,
                        color: 'linear-gradient(135deg, #0f766e, #14b8a6)'
                    }
                ].map((card) => (
                    <div key={card.label} className="card glass" style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'flex-start' }}>
                            <div>
                                <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.35rem' }}>{card.label}</p>
                                <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>{card.value}</p>
                                <p style={{ color: '#475569', fontSize: '0.82rem', lineHeight: 1.55 }}>{card.helper}</p>
                            </div>
                            <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {card.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(280px, 0.85fr)', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="card glass" style={{ padding: '1.35rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                            <div>
                                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem' }}>Langkah berikutnya</h2>
                                <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Fokus ke materi yang paling relevan untuk dikerjakan sekarang.</p>
                            </div>
                            <button type="button" className="btn btn-secondary" onClick={() => navigate(`/student/class/${classId}/materials`)}>
                                Lihat semua materi
                            </button>
                        </div>

                        {nextMaterial ? (
                            <button
                                type="button"
                                onClick={() => navigate(`/student/materials/${nextMaterial.material.id}`)}
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '1rem 1.1rem',
                                    borderRadius: '1rem',
                                    border: '1px solid #dbeafe',
                                    background: '#f8fbff',
                                    cursor: 'pointer'
                                }}
                            >
                                <p style={{ color: '#1d4ed8', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                                    Selanjutnya dari modul {nextMaterial.moduleTitle}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ color: '#0f172a', fontWeight: 800, marginBottom: '0.25rem' }}>{nextMaterial.material.title}</p>
                                        <p style={{ color: '#64748b', fontSize: '0.84rem' }}>{getMaterialTypeLabel(nextMaterial.material.type)}</p>
                                    </div>
                                    <ArrowRight size={18} color="#94a3b8" />
                                </div>
                            </button>
                        ) : (
                            <div style={{ padding: '1rem 1.1rem', borderRadius: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}>
                                Semua materi yang tersedia sudah kamu sentuh. Lanjutkan ke latihan atau forum kelas.
                            </div>
                        )}
                    </div>

                    <div className="card glass" style={{ padding: '1.35rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem' }}>Peta materi</h2>
                            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Semua modul dan materi ditampilkan dengan status yang mudah dibaca.</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {cls.modules.length === 0 ? (
                                <div style={{ padding: '1.2rem', borderRadius: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' }}>
                                    Belum ada modul di kelas ini.
                                </div>
                            ) : (
                                cls.modules.map((module, moduleIndex) => (
                                    <div key={module.id} style={{ padding: '1rem', borderRadius: '1rem', background: '#fcfdff', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center', marginBottom: '0.9rem' }}>
                                            <div>
                                                <p style={{ color: '#2563eb', fontSize: '0.76rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                                                    Modul {moduleIndex + 1}
                                                </p>
                                                <h3 style={{ color: '#0f172a', fontSize: '1rem', fontWeight: 800 }}>{module.title}</h3>
                                            </div>
                                            <span style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 700 }}>{module.materials.length} materi</span>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                                            {module.materials.map((material, materialIndex) => {
                                                const status = getMaterialStatus(material.id);
                                                const locked = isMaterialLocked(moduleIndex, materialIndex);
                                                const tone = getMaterialTypeTone(material.type);
                                                const statusMeta = getStatusMeta(status, locked);

                                                return (
                                                    <button
                                                        key={material.id}
                                                        type="button"
                                                        onClick={() => {
                                                            if (!locked) {
                                                                navigate(`/student/materials/${material.id}`);
                                                            }
                                                        }}
                                                        style={{
                                                            width: '100%',
                                                            textAlign: 'left',
                                                            padding: '0.95rem 1rem',
                                                            borderRadius: '0.95rem',
                                                            border: locked ? '1px solid #e2e8f0' : '1px solid #dbeafe',
                                                            background: locked ? '#f8fafc' : 'white',
                                                            cursor: locked ? 'not-allowed' : 'pointer',
                                                            opacity: locked ? 0.75 : 1
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center' }}>
                                                            <div style={{ minWidth: 0 }}>
                                                                <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', marginBottom: '0.45rem' }}>
                                                                    <span style={{ padding: '0.28rem 0.58rem', borderRadius: '999px', background: tone.background, color: tone.color, fontSize: '0.72rem', fontWeight: 700 }}>
                                                                        {getMaterialTypeLabel(material.type)}
                                                                    </span>
                                                                    <span style={{ padding: '0.28rem 0.58rem', borderRadius: '999px', background: statusMeta.background, color: statusMeta.color, fontSize: '0.72rem', fontWeight: 700 }}>
                                                                        {statusMeta.label}
                                                                    </span>
                                                                </div>
                                                                <p style={{ color: '#0f172a', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                    {material.title}
                                                                </p>
                                                            </div>
                                                            {locked ? <Lock size={18} color="#94a3b8" /> : status === 'completed' ? <CheckCircle2 size={18} color="#16a34a" /> : <ChevronRight size={18} color="#94a3b8" />}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="card glass" style={{ padding: '1.35rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem' }}>Akses cepat</h2>
                            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Pindah ke area penting kelas tanpa banyak langkah.</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {[
                                {
                                    label: 'Latihan interaktif',
                                    helper: 'Kerjakan paket soal dan lihat hasil review guru.',
                                    action: () => navigate(`/student/class/${classId}/exercises`)
                                },
                                {
                                    label: 'Leaderboard kelas',
                                    helper: 'Lihat ranking, badge, dan kontribusi diskusi.',
                                    action: () => navigate(`/student/class/${classId}/leaderboard`)
                                },
                                {
                                    label: 'Forum diskusi',
                                    helper: 'Ajukan pertanyaan atau bantu teman memahami materi.',
                                    action: () => navigate(`/student/class/${classId}/forum`)
                                }
                            ].map((item) => (
                                <button
                                    key={item.label}
                                    type="button"
                                    onClick={item.action}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '0.95rem 1rem',
                                        borderRadius: '1rem',
                                        border: '1px solid #e2e8f0',
                                        background: 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ color: '#0f172a', fontWeight: 800, marginBottom: '0.2rem' }}>{item.label}</p>
                                            <p style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.5 }}>{item.helper}</p>
                                        </div>
                                        <ArrowRight size={18} color="#94a3b8" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="card glass" style={{ padding: '1.35rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem' }}>Achievement kelas</h2>
                            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Target yang sedang aktif dan hadiah XP yang bisa dibuka.</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {cls.achievements.length === 0 ? (
                                <div style={{ padding: '1rem', borderRadius: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' }}>
                                    Belum ada achievement di kelas ini.
                                </div>
                            ) : (
                                cls.achievements.map((achievement) => {
                                    const unlocked = achievements.unlocked.some((item) => item.achievement.id === achievement.id);

                                    return (
                                        <div
                                            key={achievement.id}
                                            style={{
                                                padding: '0.95rem 1rem',
                                                borderRadius: '1rem',
                                                border: unlocked ? '1px solid #fcd34d' : '1px solid #e2e8f0',
                                                background: unlocked ? '#fffbeb' : 'white'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.35rem' }}>
                                                <p style={{ color: '#0f172a', fontWeight: 800 }}>{achievement.title}</p>
                                                <span style={{ color: unlocked ? '#92400e' : '#64748b', fontSize: '0.76rem', fontWeight: 700 }}>
                                                    +{achievement.xpReward} XP
                                                </span>
                                            </div>
                                            <p style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.5 }}>{achievement.description}</p>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const actionButton = (primary: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.85rem 1.05rem',
    borderRadius: '0.95rem',
    border: primary ? '1px solid rgba(14, 165, 233, 0.18)' : '1px solid rgba(148, 163, 184, 0.22)',
    background: primary ? 'linear-gradient(135deg, #0ea5e9, #2563eb)' : 'white',
    color: primary ? 'white' : '#0f172a',
    fontWeight: 700,
    cursor: 'pointer'
});

const getStatusMeta = (status: string, locked: boolean) => {
    if (locked) {
        return {
            label: 'Terkunci',
            background: '#e2e8f0',
            color: '#475569'
        };
    }

    if (status === 'completed') {
        return {
            label: 'Selesai',
            background: '#dcfce7',
            color: '#166534'
        };
    }

    if (status === 'in_progress') {
        return {
            label: 'Sedang dipelajari',
            background: '#dbeafe',
            color: '#1d4ed8'
        };
    }

    return {
        label: 'Belum mulai',
        background: '#f8fafc',
        color: '#475569'
    };
};

export default ClassDashboard;
