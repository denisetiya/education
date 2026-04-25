import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    BookOpen,
    CheckSquare,
    Clock3,
    FileText,
    FolderKanban,
    GraduationCap,
    LayoutDashboard,
    Loader2,
    Sparkles,
    Users
} from 'lucide-react';
import type { TeacherDashboardData } from '../../types/api.types';
import { dashboardAPI } from '../../utils/api';

const formatDate = (value: string) =>
    new Date(value).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });

export const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<TeacherDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                const response = await dashboardAPI.teacher();
                setData(response);
            } catch (error) {
                console.error('Failed to load teacher dashboard', error);
            } finally {
                setLoading(false);
            }
        };

        void loadDashboard();
    }, []);

    if (loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={42} className="animate-spin" color="var(--primary)" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="card glass" style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: '#64748b' }}>Dashboard guru belum bisa dimuat.</p>
            </div>
        );
    }

    const quickActions = [
        {
            title: 'Kelola Kelas',
            description: 'Atur siswa, modul, dan tab kelas dari satu tempat.',
            icon: <GraduationCap size={22} color="#1d4ed8" />,
            background: '#eff6ff',
            action: () => navigate('/teacher/classes')
        },
        {
            title: 'Tambah Materi',
            description: 'Buat materi baru dan sambungkan ke alur belajar.',
            icon: <FileText size={22} color="#166534" />,
            background: '#f0fdf4',
            action: () => navigate('/teacher/materials?create=1')
        },
        {
            title: 'Susun Kurikulum',
            description: 'Rapikan modul dan struktur pembelajaran per kelas.',
            icon: <FolderKanban size={22} color="#92400e" />,
            background: '#fffbeb',
            action: () => navigate('/teacher/curriculum')
        },
        {
            title: 'Review Penilaian',
            description: 'Buka antrean jawaban yang masih menunggu penilaian.',
            icon: <CheckSquare size={22} color="#7c3aed" />,
            background: '#faf5ff',
            action: () => {
                const firstPending = data.pendingReviews[0];
                if (firstPending) {
                    navigate(`/teacher/classes/${firstPending.exercise.class.id}/exercise-review/${firstPending.exercise.id}`);
                    return;
                }

                navigate('/teacher/classes');
            }
        }
    ];

    const statCards = [
        {
            title: 'Total Kelas',
            value: data.stats.totalClasses,
            helper: `${data.stats.publishedExercises} latihan sudah publik`,
            icon: <LayoutDashboard size={22} color="white" />,
            color: 'linear-gradient(135deg, #2563eb, #4f46e5)'
        },
        {
            title: 'Total Siswa',
            value: data.stats.totalStudents,
            helper: 'Akumulasi dari seluruh kelas',
            icon: <Users size={22} color="white" />,
            color: 'linear-gradient(135deg, #0f766e, #14b8a6)'
        },
        {
            title: 'Materi Dibuat',
            value: data.stats.totalMaterials,
            helper: `${data.stats.totalExercises} latihan tersedia`,
            icon: <BookOpen size={22} color="white" />,
            color: 'linear-gradient(135deg, #ca8a04, #f59e0b)'
        },
        {
            title: 'Butuh Review',
            value: data.stats.pendingReviews,
            helper: 'Prioritas penilaian hari ini',
            icon: <Clock3 size={22} color="white" />,
            color: 'linear-gradient(135deg, #dc2626, #f97316)'
        }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div
                className="card glass"
                style={{
                    padding: '1.75rem',
                    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(14, 165, 233, 0.08))',
                    border: '1px solid rgba(37, 99, 235, 0.14)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                        <p style={{ color: '#1d4ed8', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.45rem' }}>
                            Workspace Guru
                        </p>
                        <h1 style={{ fontSize: '1.9rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                            Semua alur mengajar dalam satu dashboard
                        </h1>
                        <p style={{ color: '#475569', maxWidth: '700px', lineHeight: 1.7 }}>
                            Pantau kelas aktif, materi terbaru, dan antrean penilaian agar pekerjaan harian guru terasa lebih ringan dan terarah.
                        </p>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', color: '#1d4ed8', fontWeight: '700' }}>
                        <Sparkles size={18} />
                        Alur kelas, materi, dan penilaian sudah terhubung
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {statCards.map((card) => (
                    <div key={card.title} className="card glass" style={{ padding: '1.4rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'flex-start' }}>
                            <div>
                                <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '0.35rem' }}>{card.title}</p>
                                <p style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                                    {card.value}
                                </p>
                                <p style={{ color: '#475569', fontSize: '0.82rem' }}>{card.helper}</p>
                            </div>
                            <div
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '16px',
                                    background: card.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 16px 30px rgba(15, 23, 42, 0.12)'
                                }}
                            >
                                {card.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {quickActions.map((item) => (
                    <button
                        key={item.title}
                        onClick={item.action}
                        className="card glass"
                        style={{
                            padding: '1.3rem',
                            textAlign: 'left',
                            cursor: 'pointer',
                            border: '1px solid #e2e8f0',
                            background: 'white'
                        }}
                    >
                        <div
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '14px',
                                background: item.background,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem'
                            }}
                        >
                            {item.icon}
                        </div>
                        <h2 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.45rem' }}>{item.title}</h2>
                        <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: '0.9rem' }}>{item.description}</p>
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '1.5rem', alignItems: 'start' }}>
                <div className="card glass" style={{ padding: '1.35rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                                Antrean Penilaian
                            </h2>
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                Buka jawaban yang masih menunggu review.
                            </p>
                        </div>
                        <button className="btn btn-secondary" onClick={() => navigate('/teacher/classes')}>
                            Lihat Kelas
                        </button>
                    </div>

                    {data.pendingReviews.length === 0 ? (
                        <div style={{ padding: '1.5rem', borderRadius: '1rem', background: '#f8fafc', color: '#64748b', textAlign: 'center' }}>
                            Semua jawaban canvas sudah dinilai.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            {data.pendingReviews.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => navigate(`/teacher/classes/${item.exercise.class.id}/exercise-review/${item.exercise.id}`)}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '1rem',
                                        borderRadius: '1rem',
                                        border: '1px solid #e2e8f0',
                                        background: 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.45rem' }}>
                                        <div>
                                            <p style={{ fontWeight: '800', color: '#0f172a', marginBottom: '0.2rem' }}>{item.exercise.title}</p>
                                            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                                                {item.exercise.class.name} | {item.student.name}
                                            </p>
                                        </div>
                                        <ArrowRight size={18} color="#94a3b8" />
                                    </div>
                                    <p style={{ color: '#475569', fontSize: '0.82rem' }}>
                                        Dikirim {formatDate(item.createdAt)}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card glass" style={{ padding: '1.35rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                                    Kelas Terbaru
                                </h2>
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                    Shortcut menuju kelas yang aktif dikelola.
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {data.classes.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => navigate(`/teacher/classes/${item.id}`)}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '1rem',
                                        borderRadius: '1rem',
                                        border: '1px solid #e2e8f0',
                                        background: 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.4rem' }}>
                                        <p style={{ fontWeight: '800', color: '#0f172a' }}>{item.name}</p>
                                        <ArrowRight size={18} color="#94a3b8" />
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', color: '#64748b', fontSize: '0.82rem' }}>
                                        <span>{item._count.students} siswa</span>
                                        <span>{item._count.modules} modul</span>
                                        <span>{item._count.exercises} latihan</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="card glass" style={{ padding: '1.35rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                                Materi Terbaru
                            </h2>
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                Materi yang baru dibuat atau diperbarui.
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {data.recentMaterials.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => navigate(`/teacher/materials?detail=${item.id}`)}
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
                                    <p style={{ fontWeight: '800', color: '#0f172a', marginBottom: '0.2rem' }}>{item.title}</p>
                                    <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                                        {item.category} | Kelas {item.grade} semester {item.semester}
                                    </p>
                                    <p style={{ color: '#475569', fontSize: '0.8rem' }}>Dibuat {formatDate(item.createdAt)}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
