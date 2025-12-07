import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, PlayCircle, BookOpen, Video, FileText, Clock, User, Loader, AlertCircle, Award } from 'lucide-react';
import { materialsAPI, progressAPI } from '../../utils/api';

interface Material {
    id: string;
    title: string;
    type: string;
    category: string;
    level: string;
    content: string | null;
    semester: number;
    grade: number;
    createdAt: string;
    createdBy?: { name: string };
}

interface ProgressData {
    status: string;
    timeSpent: number;
    completedAt?: string;
}

export const StudentMaterialView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [material, setMaterial] = useState<Material | null>(null);
    const [progress, setProgress] = useState<ProgressData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [completing, setCompleting] = useState(false);
    const [showXPNotification, setShowXPNotification] = useState(false);
    const [xpEarned, setXpEarned] = useState(0);

    const startTimeRef = useRef<number>(Date.now());
    const timeTrackerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (id) {
            fetchMaterialAndProgress();
            startTracking();
        }

        return () => {
            // Save progress when leaving
            if (timeTrackerRef.current) {
                clearInterval(timeTrackerRef.current);
            }
            saveTimeSpent();
        };
    }, [id]);

    const fetchMaterialAndProgress = async () => {
        try {
            setLoading(true);
            const [materialData, progressData] = await Promise.all([
                materialsAPI.getById(id!),
                progressAPI.getMaterialProgress(id!)
            ]);
            setMaterial(materialData);
            setProgress(progressData);

            // Mark as started
            await progressAPI.start(id!);

            setError(null);
        } catch (err) {
            console.error('Failed to fetch material:', err);
            setError('Materi tidak ditemukan');
        } finally {
            setLoading(false);
        }
    };

    const startTracking = () => {
        startTimeRef.current = Date.now();
        // Update time every 30 seconds
        timeTrackerRef.current = setInterval(() => {
            saveTimeSpent();
        }, 30000);
    };

    const saveTimeSpent = async () => {
        if (!id) return;
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        try {
            await progressAPI.update(id, { timeSpent });
        } catch (err) {
            console.error('Failed to save time:', err);
        }
    };

    const handleComplete = async () => {
        if (!id || completing) return;

        try {
            setCompleting(true);
            const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
            const result = await progressAPI.complete(id, timeSpent);

            setXpEarned(result.xpEarned || 50);
            setShowXPNotification(true);
            setProgress({ status: 'completed', timeSpent, completedAt: new Date().toISOString() });

            setTimeout(() => {
                setShowXPNotification(false);
                navigate('/student/materials');
            }, 2000);
        } catch (err) {
            console.error('Failed to complete:', err);
            alert('Gagal menandai selesai');
        } finally {
            setCompleting(false);
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, { bg: string; text: string }> = {
            'MATEMATIKA': { bg: '#e0e7ff', text: 'var(--primary)' },
            'IPA': { bg: '#dcfce7', text: '#16a34a' },
            'IPS': { bg: '#fef3c7', text: '#d97706' },
            'BAHASA_INDONESIA': { bg: '#fee2e2', text: '#dc2626' },
            'BAHASA_INGGRIS': { bg: '#dbeafe', text: '#2563eb' },
            'SENI': { bg: '#f3e8ff', text: '#9333ea' },
            'OLAHRAGA': { bg: '#cffafe', text: '#0891b2' },
        };
        return colors[category] || { bg: '#f3f4f6', text: '#6b7280' };
    };

    const formatCategory = (category: string) => {
        return category?.replace('_', ' ') || 'Unknown';
    };

    const getTypeIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'video': return <Video size={20} />;
            case 'book': return <BookOpen size={20} />;
            default: return <FileText size={20} />;
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader className="animate-spin" size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-muted)' }}>Memuat materi...</p>
                </div>
            </div>
        );
    }

    if (error || !material) {
        return (
            <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '4rem 2rem' }}>
                <AlertCircle size={64} style={{ color: '#dc2626', marginBottom: '1rem' }} />
                <h2 style={{ marginBottom: '0.5rem' }}>{error || 'Materi tidak ditemukan'}</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Materi yang kamu cari mungkin sudah dihapus atau tidak tersedia.</p>
                <Link to="/student/materials" className="btn btn-primary">Kembali ke Daftar Materi</Link>
            </div>
        );
    }

    const categoryStyle = getCategoryColor(material.category);
    const isCompleted = progress?.status === 'completed';

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }} className="animate-slide-up">
            {/* XP Notification */}
            {showXPNotification && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    color: 'white',
                    padding: '3rem',
                    borderRadius: '1.5rem',
                    textAlign: 'center',
                    zIndex: 1000,
                    animation: 'fadeIn 0.3s ease-out',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}>
                    <Award size={64} style={{ marginBottom: '1rem' }} />
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Materi Selesai! 🎉</h2>
                    <p style={{ fontSize: '2rem', fontWeight: '800' }}>+{xpEarned} XP</p>
                </div>
            )}

            <Link to="/student/materials" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', textDecoration: 'none' }}>
                <ArrowLeft size={20} /> Kembali ke Daftar Materi
            </Link>

            {/* Progress indicator */}
            {isCompleted && (
                <div style={{
                    background: '#dcfce7',
                    border: '1px solid #16a34a',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.5rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <CheckCircle size={24} color="#16a34a" />
                    <div>
                        <p style={{ fontWeight: '600', color: '#16a34a' }}>Materi sudah diselesaikan</p>
                        <p style={{ fontSize: '0.85rem', color: '#15803d' }}>
                            Diselesaikan pada {new Date(progress.completedAt!).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>
            )}

            <div className="card glass" style={{ padding: '0', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{
                    padding: '2rem',
                    background: `linear-gradient(135deg, ${categoryStyle.bg}, white)`,
                    borderBottom: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        <span style={{
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            color: categoryStyle.text,
                            background: 'white',
                            padding: '0.3rem 0.75rem',
                            borderRadius: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }}>
                            {formatCategory(material.category)}
                        </span>
                        <span style={{
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            color: 'var(--text-muted)',
                            background: 'white',
                            padding: '0.3rem 0.75rem',
                            borderRadius: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }}>
                            {getTypeIcon(material.type)} {material.type}
                        </span>
                        <span style={{
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            color: 'var(--text-muted)',
                            background: 'white',
                            padding: '0.3rem 0.75rem',
                            borderRadius: '1rem'
                        }}>
                            Kelas {material.grade} • Semester {material.semester}
                        </span>
                        <span style={{
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            padding: '0.3rem 0.75rem',
                            borderRadius: '1rem',
                            background: material.level === 'Mudah' ? '#dcfce7' : material.level === 'Menengah' ? '#fef3c7' : '#fee2e2',
                            color: material.level === 'Mudah' ? '#16a34a' : material.level === 'Menengah' ? '#d97706' : '#dc2626'
                        }}>
                            {material.level}
                        </span>
                    </div>

                    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-main)' }}>
                        {material.title}
                    </h1>

                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={16} />
                            <span>{material.createdBy?.name || 'Guru'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={16} />
                            <span>{new Date(material.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ padding: '2.5rem' }}>
                    {/* Video placeholder for video type */}
                    {material.type.toLowerCase() === 'video' && (
                        <div style={{
                            width: '100%',
                            height: '400px',
                            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                            borderRadius: 'var(--radius-lg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '2rem',
                            color: 'white',
                            flexDirection: 'column',
                            gap: '1rem',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                        }}>
                            <PlayCircle size={64} />
                            <span style={{ fontSize: '1.1rem' }}>Video Player</span>
                            <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Klik untuk memutar video pembelajaran</span>
                        </div>
                    )}

                    {/* Rich Content */}
                    <div
                        className="material-content"
                        style={{
                            lineHeight: '1.9',
                            fontSize: '1.05rem',
                            color: 'var(--text-main)'
                        }}
                    >
                        <style>{`
                            .material-content h1, .material-content h2, .material-content h3, 
                            .material-content h4, .material-content h5, .material-content h6 {
                                margin-top: 1.5rem;
                                margin-bottom: 0.75rem;
                                font-weight: 700;
                                color: var(--text-main);
                            }
                            .material-content h1 { font-size: 2rem; }
                            .material-content h2 { font-size: 1.5rem; }
                            .material-content h3 { font-size: 1.25rem; }
                            .material-content p { margin-bottom: 1rem; }
                            .material-content ul, .material-content ol {
                                margin: 1rem 0;
                                padding-left: 1.5rem;
                            }
                            .material-content li { margin-bottom: 0.5rem; }
                            .material-content blockquote {
                                border-left: 4px solid var(--primary);
                                padding-left: 1rem;
                                margin: 1.5rem 0;
                                color: var(--text-muted);
                                font-style: italic;
                            }
                            .material-content pre {
                                background: #1e293b;
                                color: #e2e8f0;
                                padding: 1rem;
                                border-radius: 0.5rem;
                                overflow-x: auto;
                                margin: 1rem 0;
                            }
                            .material-content code {
                                background: #f1f5f9;
                                padding: 0.2rem 0.4rem;
                                border-radius: 0.25rem;
                                font-size: 0.9em;
                            }
                            .material-content pre code {
                                background: transparent;
                                padding: 0;
                            }
                            .material-content img {
                                max-width: 100%;
                                border-radius: 0.5rem;
                                margin: 1rem 0;
                            }
                            .material-content a {
                                color: var(--primary);
                                text-decoration: underline;
                            }
                            .material-content table {
                                width: 100%;
                                border-collapse: collapse;
                                margin: 1rem 0;
                            }
                            .material-content th, .material-content td {
                                border: 1px solid #e2e8f0;
                                padding: 0.75rem;
                                text-align: left;
                            }
                            .material-content th {
                                background: #f8fafc;
                                font-weight: 600;
                            }
                        `}</style>

                        {material.content ? (
                            <div dangerouslySetInnerHTML={{ __html: material.content }} />
                        ) : (
                            <div style={{
                                padding: '3rem',
                                background: '#f8fafc',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center',
                                color: 'var(--text-muted)'
                            }}>
                                <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p style={{ fontSize: '1.1rem' }}>Konten materi akan segera tersedia.</p>
                                <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Hubungi guru untuk informasi lebih lanjut.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Action */}
                <div style={{
                    padding: '2rem 2.5rem',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    background: '#f8fafc'
                }}>
                    <div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            {isCompleted
                                ? 'Kamu sudah menyelesaikan materi ini. Kamu dapat membacanya lagi kapan saja.'
                                : 'Setelah selesai mempelajari materi ini, klik tombol di samping untuk menandai sebagai selesai dan mendapatkan XP.'}
                        </p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={handleComplete}
                        disabled={completing || isCompleted}
                        style={{
                            padding: '1rem 2rem',
                            fontSize: '1.1rem',
                            opacity: isCompleted ? 0.6 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {completing ? (
                            <Loader className="animate-spin" size={20} />
                        ) : (
                            <CheckCircle size={20} />
                        )}
                        {isCompleted ? 'Sudah Selesai ✓' : 'Tandai Selesai (+50 XP)'}
                    </button>
                </div>
            </div>
        </div>
    );
};
