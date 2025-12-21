import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Compass, ChevronRight, Search, Loader } from 'lucide-react';
import { classesAPI } from '../../utils/api';

interface EnrolledClass {
    id: string;
    name: string;
    subject: string;
    description?: string;
    thumbnail?: string;
    progressionMode: string;
    teacher?: { name: string };
    _count?: { modules: number; students: number };
}

export const ClassSelection: React.FC = () => {
    const [classes, setClasses] = useState<EnrolledClass[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchEnrolledClasses();
    }, []);

    const fetchEnrolledClasses = async () => {
        try {
            const data = await classesAPI.getAll();
            setClasses(data);
        } catch (error) {
            console.error('Failed to fetch classes', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectClass = (classId: string) => {
        navigate(`/student/class/${classId}`);
    };

    const getGradientByIndex = (index: number) => {
        const gradients = [
            'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        ];
        return gradients[index % gradients.length];
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
            padding: '2rem'
        }}>
            {/* Header */}
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                textAlign: 'center',
                marginBottom: '3rem'
            }}>
                <h1 style={{
                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                    fontWeight: '800',
                    color: '#1e293b',
                    marginBottom: '1rem'
                }}>
                    Selamat Datang! 👋
                </h1>
                <p style={{
                    fontSize: '1.1rem',
                    color: '#64748b',
                    maxWidth: '600px',
                    margin: '0 auto'
                }}>
                    Pilih kelas untuk memulai belajar atau temukan kelas baru yang menarik.
                </p>
            </div>

            {/* Main Content */}
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                        <Loader className="animate-spin" size={48} style={{ color: 'var(--primary)' }} />
                    </div>
                ) : classes.length === 0 ? (
                    /* Empty State */
                    <div style={{
                        background: 'white',
                        borderRadius: '1.5rem',
                        padding: '4rem 2rem',
                        textAlign: 'center',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                        <BookOpen size={64} style={{ color: '#94a3b8', marginBottom: '1.5rem' }} />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#334155', marginBottom: '0.75rem' }}>
                            Belum Ada Kelas
                        </h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                            Kamu belum bergabung dengan kelas apapun. Temukan kelas yang menarik!
                        </p>
                        <button
                            onClick={() => navigate('/student/discover')}
                            className="btn btn-primary"
                            style={{
                                padding: '1rem 2rem',
                                fontSize: '1.1rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Compass size={20} />
                            Jelajahi Kelas
                        </button>
                    </div>
                ) : (
                    <>
                        {/* My Classes Grid */}
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#334155' }}>
                                    Kelas Saya
                                </h2>
                                <button
                                    onClick={() => navigate('/student/discover')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--primary)',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}
                                >
                                    <Compass size={18} />
                                    Jelajahi Kelas Baru
                                </button>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {classes.map((cls, index) => (
                                    <div
                                        key={cls.id}
                                        onClick={() => handleSelectClass(cls.id)}
                                        style={{
                                            background: 'white',
                                            borderRadius: '1rem',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-8px)';
                                            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                        }}
                                    >
                                        {/* Card Header */}
                                        <div style={{
                                            background: cls.thumbnail ? `url(${cls.thumbnail}) center/cover` : getGradientByIndex(index),
                                            height: '120px',
                                            padding: '1.25rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'flex-end'
                                        }}>
                                            <h3 style={{
                                                fontSize: '1.25rem',
                                                fontWeight: '700',
                                                color: 'white',
                                                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {cls.name}
                                            </h3>
                                            <p style={{
                                                fontSize: '0.9rem',
                                                color: 'rgba(255,255,255,0.9)',
                                                marginTop: '0.25rem'
                                            }}>
                                                {cls.subject}
                                            </p>
                                        </div>

                                        {/* Card Body */}
                                        <div style={{ padding: '1.25rem' }}>
                                            <div style={{
                                                display: 'flex',
                                                gap: '1.5rem',
                                                marginBottom: '1rem',
                                                color: '#64748b',
                                                fontSize: '0.9rem'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Users size={16} />
                                                    <span>{cls._count?.students || 0} siswa</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <BookOpen size={16} />
                                                    <span>{cls._count?.modules || 0} modul</span>
                                                </div>
                                            </div>

                                            {cls.teacher && (
                                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
                                                    Pengajar: {cls.teacher.name}
                                                </p>
                                            )}

                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '1rem',
                                                    background: cls.progressionMode === 'sequential' ? '#fef3c7' : '#dcfce7',
                                                    color: cls.progressionMode === 'sequential' ? '#92400e' : '#166534',
                                                    fontWeight: '600'
                                                }}>
                                                    {cls.progressionMode === 'sequential' ? 'Bertahap' : 'Bebas'}
                                                </span>

                                                <button style={{
                                                    background: 'var(--primary)',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '0.5rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                                }}>
                                                    Masuk <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
