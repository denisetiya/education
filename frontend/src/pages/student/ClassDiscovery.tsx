import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, BookOpen, ArrowLeft, Loader, UserPlus, Eye, X } from 'lucide-react';
import { classesAPI } from '../../utils/api';

interface PublicClass {
    id: string;
    name: string;
    subject: string;
    description?: string;
    thumbnail?: string;
    progressionMode: string;
    code?: string;
    teacher?: { name: string };
    _count?: { modules: number; students: number };
    modules?: { id: string; title: string; order: number }[];
}

export const ClassDiscovery: React.FC = () => {
    const [classes, setClasses] = useState<PublicClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('');
    const [previewClass, setPreviewClass] = useState<PublicClass | null>(null);
    const [joining, setJoining] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const subjects = ['Matematika', 'Geometri', 'Aljabar', 'Fisika', 'Kimia'];

    useEffect(() => {
        fetchPublicClasses();
    }, [search, subjectFilter]);

    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess(null);
                setError(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    const fetchPublicClasses = async () => {
        try {
            setLoading(true);
            const data = await classesAPI.getPublic({ search, subject: subjectFilter });
            setClasses(data);
        } catch (err) {
            console.error('Failed to fetch public classes', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = async (classId: string) => {
        try {
            const data = await classesAPI.getPublicById(classId);
            setPreviewClass(data);
        } catch (err) {
            console.error('Failed to fetch class preview', err);
        }
    };

    const handleJoin = async (code: string) => {
        if (!code) return;
        setJoining(true);
        try {
            await classesAPI.join(code);
            setSuccess('Berhasil bergabung ke kelas!');
            setPreviewClass(null);
            setTimeout(() => navigate('/student/classes'), 1500);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Gagal bergabung ke kelas';
            setError(message);
        } finally {
            setJoining(false);
        }
    };

    const getGradientByIndex = (index: number) => {
        const gradients = [
            'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        ];
        return gradients[index % gradients.length];
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
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
                    <ArrowLeft size={20} /> Kembali
                </button>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>
                    🔍 Jelajahi Kelas
                </h1>
                <p style={{ color: '#64748b' }}>
                    Temukan kelas-kelas menarik yang tersedia untuk kamu ikuti.
                </p>
            </div>

            {/* Search & Filter */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                flexWrap: 'wrap'
            }}>
                <div style={{
                    flex: '1',
                    minWidth: '250px',
                    position: 'relative'
                }}>
                    <Search size={20} style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8'
                    }} />
                    <input
                        type="text"
                        placeholder="Cari kelas..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.875rem 1rem 0.875rem 3rem',
                            borderRadius: '0.75rem',
                            border: '2px solid #e2e8f0',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setSubjectFilter('')}
                        style={{
                            padding: '0.75rem 1.25rem',
                            borderRadius: '0.75rem',
                            border: 'none',
                            background: !subjectFilter ? 'var(--primary)' : '#f1f5f9',
                            color: !subjectFilter ? 'white' : '#64748b',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Semua
                    </button>
                    {subjects.map(subj => (
                        <button
                            key={subj}
                            onClick={() => setSubjectFilter(subj)}
                            style={{
                                padding: '0.75rem 1.25rem',
                                borderRadius: '0.75rem',
                                border: 'none',
                                background: subjectFilter === subj ? 'var(--primary)' : '#f1f5f9',
                                color: subjectFilter === subj ? 'white' : '#64748b',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            {subj}
                        </button>
                    ))}
                </div>
            </div>

            {/* Classes Grid */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <Loader className="animate-spin" size={48} style={{ color: 'var(--primary)' }} />
                </div>
            ) : classes.length === 0 ? (
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '4rem',
                    textAlign: 'center',
                    color: '#64748b'
                }}>
                    <p style={{ fontSize: '1.1rem' }}>Tidak ada kelas publik yang ditemukan.</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Coba ubah filter atau kata pencarian.</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {classes.map((cls, index) => (
                        <div
                            key={cls.id}
                            style={{
                                background: 'white',
                                borderRadius: '1rem',
                                overflow: 'hidden',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                            }}
                        >
                            <div style={{
                                background: cls.thumbnail ? `url(${cls.thumbnail}) center/cover` : getGradientByIndex(index),
                                height: '100px',
                                padding: '1rem',
                                display: 'flex',
                                alignItems: 'flex-end'
                            }}>
                                <h3 style={{
                                    color: 'white',
                                    fontWeight: '700',
                                    fontSize: '1.1rem',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                }}>
                                    {cls.name}
                                </h3>
                            </div>

                            <div style={{ padding: '1.25rem' }}>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                                    {cls.subject} • {cls.teacher?.name || 'Teacher'}
                                </p>

                                <p style={{
                                    color: '#334155',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.5',
                                    marginBottom: '1rem',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {cls.description || 'Tidak ada deskripsi.'}
                                </p>

                                <div style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    marginBottom: '1rem',
                                    color: '#64748b',
                                    fontSize: '0.85rem'
                                }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <Users size={14} /> {cls._count?.students || 0}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <BookOpen size={14} /> {cls._count?.modules || 0} modul
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handlePreview(cls.id)}
                                        style={{
                                            flex: 1,
                                            padding: '0.625rem',
                                            borderRadius: '0.5rem',
                                            border: '2px solid #e2e8f0',
                                            background: 'white',
                                            color: '#64748b',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.3rem'
                                        }}
                                    >
                                        <Eye size={16} /> Preview
                                    </button>
                                    <button
                                        onClick={() => cls.code && handleJoin(cls.code)}
                                        style={{
                                            flex: 1,
                                            padding: '0.625rem',
                                            borderRadius: '0.5rem',
                                            border: 'none',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.3rem'
                                        }}
                                    >
                                        <UserPlus size={16} /> Gabung
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Preview Modal */}
            {previewClass && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '1.5rem',
                        width: '100%',
                        maxWidth: '500px',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                            padding: '2rem',
                            color: 'white',
                            position: 'relative'
                        }}>
                            <button
                                onClick={() => setPreviewClass(null)}
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'white'
                                }}
                            >
                                <X size={18} />
                            </button>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                                {previewClass.name}
                            </h2>
                            <p style={{ opacity: 0.9 }}>{previewClass.subject}</p>
                        </div>

                        <div style={{ padding: '1.5rem' }}>
                            <p style={{ color: '#334155', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                                {previewClass.description || 'Tidak ada deskripsi.'}
                            </p>

                            <div style={{
                                display: 'flex',
                                gap: '1.5rem',
                                marginBottom: '1.5rem',
                                color: '#64748b'
                            }}>
                                <div>
                                    <strong style={{ color: '#334155' }}>{previewClass._count?.students || 0}</strong> siswa
                                </div>
                                <div>
                                    <strong style={{ color: '#334155' }}>{previewClass._count?.modules || 0}</strong> modul
                                </div>
                                <div>
                                    Mode: <strong style={{ color: '#334155' }}>
                                        {previewClass.progressionMode === 'sequential' ? 'Bertahap' : 'Bebas'}
                                    </strong>
                                </div>
                            </div>

                            {previewClass.modules && previewClass.modules.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontWeight: '600', marginBottom: '0.75rem', color: '#334155' }}>
                                        Daftar Modul:
                                    </h4>
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {previewClass.modules.map((mod, i) => (
                                            <li key={mod.id} style={{
                                                padding: '0.75rem',
                                                background: '#f8fafc',
                                                borderRadius: '0.5rem',
                                                marginBottom: '0.5rem',
                                                color: '#475569'
                                            }}>
                                                {i + 1}. {mod.title}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <button
                                onClick={() => previewClass.code && handleJoin(previewClass.code)}
                                disabled={joining}
                                className="btn btn-primary"
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    fontSize: '1.1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {joining ? <Loader className="animate-spin" size={20} /> : <UserPlus size={20} />}
                                {joining ? 'Memproses...' : 'Gabung Kelas Ini'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notifications */}
            {success && (
                <div style={{
                    position: 'fixed', bottom: '2rem', right: '2rem',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white', padding: '1rem 1.5rem', borderRadius: '1rem',
                    boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)',
                    zIndex: 1100, display: 'flex', alignItems: 'center', gap: '0.5rem',
                    animation: 'slideIn 0.3s ease'
                }}>
                    ✅ {success}
                </div>
            )}
            {error && (
                <div style={{
                    position: 'fixed', bottom: '2rem', right: '2rem',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white', padding: '1rem 1.5rem', borderRadius: '1rem',
                    boxShadow: '0 10px 40px rgba(239, 68, 68, 0.4)',
                    zIndex: 1100, display: 'flex', alignItems: 'center', gap: '0.5rem',
                    animation: 'slideIn 0.3s ease'
                }}>
                    ❌ {error}
                </div>
            )}
        </div>
    );
};
