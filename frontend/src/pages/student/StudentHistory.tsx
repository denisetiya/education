import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, CheckCircle, Play, Loader, History, ChevronRight, Video, FileText, HelpCircle, Filter } from 'lucide-react';
import { progressAPI } from '../../utils/api';

interface ProgressItem {
    id: string;
    status: string;
    timeSpent: number;
    completedAt: string | null;
    updatedAt: string;
    material: {
        id: string;
        title: string;
        type: string;
        category: string;
        level: string;
        grade: number;
        semester: number;
    };
}

export const StudentHistory: React.FC = () => {
    const [history, setHistory] = useState<ProgressItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

    useEffect(() => {
        fetchHistory();
    }, [filter]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const status = filter === 'all' ? undefined : filter;
            const data = await progressAPI.getHistory(50, status);
            setHistory(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch history:', err);
            setError('Gagal memuat riwayat');
        } finally {
            setLoading(false);
        }
    };

    const formatTimeSpent = (seconds: number) => {
        if (seconds < 60) return `${seconds} detik`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} menit`;
        const hours = Math.floor(minutes / 60);
        const remainingMins = minutes % 60;
        return `${hours} jam ${remainingMins} menit`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            if (hours === 0) {
                const minutes = Math.floor(diff / (1000 * 60));
                return `${minutes} menit lalu`;
            }
            return `${hours} jam lalu`;
        } else if (days === 1) {
            return 'Kemarin';
        } else if (days < 7) {
            return `${days} hari lalu`;
        }
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'video': return <Video size={18} />;
            case 'quiz': return <HelpCircle size={18} />;
            case 'book': return <BookOpen size={18} />;
            default: return <FileText size={18} />;
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'MATEMATIKA': 'var(--primary)',
            'IPA': '#16a34a',
            'IPS': '#d97706',
            'BAHASA_INDONESIA': '#dc2626',
            'BAHASA_INGGRIS': '#2563eb',
            'SENI': '#9333ea',
            'OLAHRAGA': '#0891b2',
        };
        return colors[category] || 'var(--accent)';
    };

    const formatCategory = (category: string) => category.replace('_', ' ');

    const stats = {
        total: history.length,
        completed: history.filter(h => h.status === 'completed').length,
        inProgress: history.filter(h => h.status === 'in_progress').length,
        totalTime: history.reduce((sum, h) => sum + h.timeSpent, 0)
    };

    return (
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                        <History size={36} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                        Riwayat Belajar
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Lihat semua materi yang pernah kamu baca.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="card glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>{stats.total}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Materi Dibaca</div>
                </div>
                <div className="card glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#16a34a' }}>{stats.completed}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Selesai</div>
                </div>
                <div className="card glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#d97706' }}>{stats.inProgress}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sedang Dibaca</div>
                </div>
                <div className="card glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#2563eb' }}>{formatTimeSpent(stats.totalTime)}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Waktu</div>
                </div>
            </div>

            {/* Filter */}
            <div className="card glass" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <Filter size={20} color="var(--text-muted)" />
                <span style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Filter:</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[
                        { value: 'all', label: 'Semua' },
                        { value: 'in_progress', label: 'Sedang Dibaca' },
                        { value: 'completed', label: 'Selesai' }
                    ].map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setFilter(opt.value as any)}
                            className={`btn ${filter === opt.value ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <Loader className="animate-spin" size={40} style={{ color: 'var(--primary)' }} />
                </div>
            )}

            {/* Error */}
            {error && !loading && (
                <div className="card" style={{ padding: '2rem', textAlign: 'center', background: '#fef2f2' }}>
                    <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>
                    <button className="btn btn-primary" onClick={fetchHistory}>Coba Lagi</button>
                </div>
            )}

            {/* History List */}
            {!loading && !error && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {history.map((item) => (
                        <Link
                            key={item.id}
                            to={`/student/materials/${item.material.id}`}
                            className="card glass card-hover-effect"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1.5rem',
                                padding: '1.5rem',
                                textDecoration: 'none',
                                color: 'inherit',
                                borderLeft: `4px solid ${getCategoryColor(item.material.category)}`
                            }}
                        >
                            {/* Icon */}
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '1rem',
                                background: `${getCategoryColor(item.material.category)}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: getCategoryColor(item.material.category),
                                flexShrink: 0
                            }}>
                                {getTypeIcon(item.material.type)}
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        fontWeight: '600',
                                        color: getCategoryColor(item.material.category),
                                        background: `${getCategoryColor(item.material.category)}15`,
                                        padding: '0.15rem 0.5rem',
                                        borderRadius: '4px'
                                    }}>
                                        {formatCategory(item.material.category)}
                                    </span>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        fontWeight: '600',
                                        color: 'var(--text-muted)',
                                        background: '#f1f5f9',
                                        padding: '0.15rem 0.5rem',
                                        borderRadius: '4px'
                                    }}>
                                        Kelas {item.material.grade}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {item.material.title}
                                </h3>
                                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Clock size={14} /> {formatTimeSpent(item.timeSpent)}
                                    </span>
                                    <span>{formatDate(item.updatedAt)}</span>
                                </div>
                            </div>

                            {/* Status */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                                {item.status === 'completed' ? (
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        padding: '0.5rem 1rem',
                                        background: '#dcfce7',
                                        color: '#16a34a',
                                        borderRadius: '2rem',
                                        fontWeight: '600',
                                        fontSize: '0.85rem'
                                    }}>
                                        <CheckCircle size={16} /> Selesai
                                    </span>
                                ) : (
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        padding: '0.5rem 1rem',
                                        background: '#fef3c7',
                                        color: '#d97706',
                                        borderRadius: '2rem',
                                        fontWeight: '600',
                                        fontSize: '0.85rem'
                                    }}>
                                        <Play size={16} /> Lanjutkan
                                    </span>
                                )}
                                <ChevronRight size={20} color="var(--text-muted)" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && history.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <BookOpen size={64} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
                    <h3 style={{ marginBottom: '0.5rem' }}>Belum ada riwayat</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        {filter === 'all'
                            ? 'Kamu belum membaca materi apapun. Mulai belajar sekarang!'
                            : 'Tidak ada materi dengan status ini.'}
                    </p>
                    <Link to="/student/materials" className="btn btn-primary">Mulai Belajar</Link>
                </div>
            )}
        </div>
    );
};
