import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Clock,
    FileText,
    Loader,
    TrendingUp,
    Users
} from 'lucide-react';
import type { TeacherDashboardData } from '../../types/api.types';
import { dashboardAPI } from '../../utils/api';

const formatDate = (value: string) =>
    new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

export const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<TeacherDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dashboardAPI.teacher().then(setData).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader size={24} style={{ color: 'var(--gray-400)', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)' }}>
                <p style={{ color: 'var(--gray-500)' }}>Dashboard belum bisa dimuat.</p>
            </div>
        );
    }

    const stats = [
        { label: 'Kelas Aktif', value: data.stats.totalClasses, icon: <Users size={18} />, color: '#2563eb' },
        { label: 'Total Siswa', value: data.stats.totalStudents, icon: <TrendingUp size={18} />, color: '#059669' },
        { label: 'Materi', value: data.stats.totalMaterials, icon: <BookOpen size={18} />, color: '#7c3aed' },
        { label: 'Perlu Review', value: data.stats.pendingReviews, icon: <Clock size={18} />, color: data.stats.pendingReviews > 0 ? '#dc2626' : '#71717a' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>Dashboard</h1>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Ringkasan kelas, materi, dan penilaian.</p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '0.75rem' }}>
                {stats.map((s) => (
                    <div key={s.label} style={{
                        padding: '1.25rem', background: 'white',
                        border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)',
                        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between'
                    }}>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.35rem' }}>{s.label}</p>
                            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--gray-900)', lineHeight: 1 }}>{s.value}</p>
                        </div>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: `${s.color}10`, color: s.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {s.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Insight Banner */}
            {data.stats.pendingReviews > 0 && (
                <div style={{
                    padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)',
                    background: '#fef2f2', border: '1px solid #fecaca',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Clock size={18} style={{ color: '#dc2626' }} />
                        <span style={{ fontSize: '0.875rem', color: '#991b1b' }}>
                            <strong>{data.stats.pendingReviews} jawaban</strong> menunggu penilaian
                        </span>
                    </div>
                    <button onClick={() => {
                        const first = data.pendingReviews[0];
                        if (first) navigate(`/teacher/classes/${first.exercise.class.id}/exercise-review/${first.exercise.id}`);
                        else navigate('/teacher/classes');
                    }} style={{
                        padding: '0.45rem 0.875rem', borderRadius: 'var(--radius-md)',
                        background: '#dc2626', color: 'white', fontSize: '0.8125rem', fontWeight: 500
                    }}>
                        Review Sekarang
                    </button>
                </div>
            )}

            {/* Main Grid: Pending Reviews + Classes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1rem', alignItems: 'start' }}>
                {/* Pending Reviews */}
                <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--gray-900)' }}>Antrean Penilaian</h2>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{data.pendingReviews.length} item</span>
                    </div>
                    <div style={{ padding: '0.5rem' }}>
                        {data.pendingReviews.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center' }}>
                                <CheckCircle2 size={24} style={{ color: 'var(--gray-300)', margin: '0 auto 0.5rem' }} />
                                <p style={{ color: 'var(--gray-400)', fontSize: '0.8125rem' }}>Semua sudah dinilai</p>
                            </div>
                        ) : (
                            data.pendingReviews.slice(0, 5).map((item) => (
                                <button key={item.id} onClick={() => navigate(`/teacher/classes/${item.exercise.class.id}/exercise-review/${item.exercise.id}`)} style={{
                                    width: '100%', textAlign: 'left', padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)', cursor: 'pointer',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    transition: 'background 150ms'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--gray-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.exercise.title}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{item.student.name} · {item.exercise.class.name}</p>
                                    </div>
                                    <ArrowRight size={14} style={{ color: 'var(--gray-300)', flexShrink: 0 }} />
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Classes */}
                <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--gray-900)' }}>Kelas Aktif</h2>
                        <button onClick={() => navigate('/teacher/classes')} style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 500 }}>Lihat semua</button>
                    </div>
                    <div style={{ padding: '0.5rem' }}>
                        {data.classes.slice(0, 4).map((cls) => (
                            <button key={cls.id} onClick={() => navigate(`/teacher/classes/${cls.id}`)} style={{
                                width: '100%', textAlign: 'left', padding: '0.75rem',
                                borderRadius: 'var(--radius-md)', cursor: 'pointer',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                transition: 'background 150ms'
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--gray-900)' }}>{cls.name}</p>
                                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                                        <span>{cls._count.students} siswa</span>
                                        <span>{cls._count.modules} modul</span>
                                        <span>{cls._count.exercises} latihan</span>
                                    </div>
                                </div>
                                <ArrowRight size={14} style={{ color: 'var(--gray-300)', flexShrink: 0 }} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Materials + Recent Submissions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1rem', alignItems: 'start' }}>
                {/* Recent Materials */}
                <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--gray-900)' }}>Materi Terbaru</h2>
                        <button onClick={() => navigate('/teacher/materials')} style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 500 }}>Lihat semua</button>
                    </div>
                    <div style={{ padding: '0.5rem' }}>
                        {data.recentMaterials.slice(0, 4).map((mat) => (
                            <button key={mat.id} onClick={() => navigate(`/teacher/materials?detail=${mat.id}`)} style={{
                                width: '100%', textAlign: 'left', padding: '0.75rem',
                                borderRadius: 'var(--radius-md)', cursor: 'pointer',
                                transition: 'background 150ms'
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <FileText size={14} />
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--gray-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mat.title}</p>
                                        <p style={{ fontSize: '0.6875rem', color: 'var(--gray-400)' }}>{mat.category} · Kelas {mat.grade} · {formatDate(mat.createdAt)}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recent Submissions */}
                <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-100)' }}>
                        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--gray-900)' }}>Aktivitas Terbaru</h2>
                    </div>
                    <div style={{ padding: '0.5rem' }}>
                        {data.recentSubmissions.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center' }}>
                                <p style={{ color: 'var(--gray-400)', fontSize: '0.8125rem' }}>Belum ada submission</p>
                            </div>
                        ) : (
                            data.recentSubmissions.slice(0, 5).map((sub) => (
                                <div key={sub.id} style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <div style={{
                                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                        background: sub.gradingStatus === 'graded' ? '#059669' : '#f59e0b'
                                    }} />
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <p style={{ fontSize: '0.8125rem', color: 'var(--gray-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            <strong style={{ fontWeight: 500 }}>{sub.student.name}</strong> mengerjakan {sub.exercise.title}
                                        </p>
                                        <p style={{ fontSize: '0.6875rem', color: 'var(--gray-400)' }}>
                                            {sub.exercise.class.name} · Skor {sub.score} · {formatDate(sub.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
