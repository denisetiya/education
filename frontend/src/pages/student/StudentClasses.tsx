import React, { useState, useEffect } from 'react';
import { UserPlus, BookOpen, Users, Loader, ArrowRight } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { classesAPI, getApiErrorMessage } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

export const StudentClasses: React.FC = () => {
    const notifications = useNotifications();
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [joinCode, setJoinCode] = useState('');
    const [joining, setJoining] = useState(false);
    const navigate = useNavigate();

    useEffect(() => { fetchEnrollments(); }, []);

    const fetchEnrollments = async () => {
        try {
            const data = await classesAPI.getAll();
            setClasses(data);
        } catch (error) {
            console.error('Failed to fetch enrolled classes', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinCode) return;
        setJoining(true);
        try {
            await classesAPI.join(joinCode);
            notifications.success('Berhasil bergabung ke kelas!', 'Kelas ditambahkan');
            setJoinCode('');
            fetchEnrollments();
        } catch (error: unknown) {
            notifications.error(getApiErrorMessage(error, 'Gagal bergabung ke kelas.'), 'Kelas belum ditambahkan');
        } finally {
            setJoining(false);
        }
    };

    const colors = ['#4f46e5', '#0891b2', '#7c3aed', '#059669', '#dc2626', '#ca8a04'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Page Header + Join */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>Kelas Saya</h1>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Akses materi, tugas, dan latihan dari gurumu.</p>
                </div>
                <form onSubmit={handleJoinClass} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Kode kelas"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        style={{
                            padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--gray-200)', fontSize: '0.875rem',
                            width: 140, fontWeight: 500, letterSpacing: '1px',
                            textAlign: 'center', outline: 'none',
                            transition: 'border-color 150ms'
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onBlur={e => e.currentTarget.style.borderColor = 'var(--gray-200)'}
                    />
                    <button
                        type="submit"
                        disabled={joining || !joinCode}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.55rem 1rem', borderRadius: 'var(--radius-md)',
                            background: 'var(--primary)', color: 'white',
                            fontSize: '0.875rem', fontWeight: 500,
                            opacity: (joining || !joinCode) ? 0.5 : 1,
                            transition: 'opacity 150ms'
                        }}
                    >
                        {joining ? <Loader size={16} className="animate-spin" /> : <UserPlus size={16} />}
                        Gabung
                    </button>
                </form>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                    <Loader size={24} style={{ color: 'var(--gray-400)', animation: 'spin 1s linear infinite' }} />
                </div>
            ) : classes.length === 0 ? (
                <div style={{
                    padding: '3rem 2rem', textAlign: 'center',
                    background: 'white', border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius-lg)'
                }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: 'var(--gray-100)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem'
                    }}>
                        <BookOpen size={24} style={{ color: 'var(--gray-400)' }} />
                    </div>
                    <p style={{ fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.25rem' }}>Belum ada kelas</p>
                    <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>Masukkan kode kelas dari gurumu untuk mulai belajar.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {classes.map((cls, i) => (
                        <div
                            key={cls.id}
                            onClick={() => navigate(`/student/classes/${cls.id}`)}
                            style={{
                                background: 'white', border: '1px solid var(--gray-200)',
                                borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                                cursor: 'pointer', transition: 'box-shadow 150ms, border-color 150ms'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--gray-300)'; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--gray-200)'; }}
                        >
                            {/* Color bar */}
                            <div style={{ height: 4, background: colors[i % colors.length] }} />
                            <div style={{ padding: '1.25rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {cls.name}
                                </h3>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>{cls.subject}</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Users size={14} />
                                        <span>{cls.teacher?.name || 'Guru'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <BookOpen size={14} />
                                        <span>{cls._count?.modules || 0} modul</span>
                                    </div>
                                </div>

                                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                    <span style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        Masuk <ArrowRight size={14} />
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
