import React, { useState, useEffect } from 'react';
import { Search, Loader, BookOpen, Video, FileText, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { materialsAPI } from '../../utils/api';

interface Material {
    id: string;
    title: string;
    type: string;
    category: string;
    level: string;
    semester: number;
    grade: number;
    createdBy?: { name: string };
}

export const StudentMaterials: React.FC = () => {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
    const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = [
        'MATEMATIKA', 'IPA', 'IPS', 'BAHASA_INDONESIA', 'BAHASA_INGGRIS', 'SENI', 'OLAHRAGA'
    ];



    const fetchMaterials = React.useCallback(async () => {
        try {
            setLoading(true);
            const filters: { grade?: number; semester?: number; category?: string; search?: string } = {};
            if (selectedGrade) filters.grade = selectedGrade;
            if (selectedSemester) filters.semester = selectedSemester;
            if (selectedCategory) filters.category = selectedCategory;
            if (searchQuery) filters.search = searchQuery;

            const data = await materialsAPI.getAll(filters);
            setMaterials(data.filter((m: Material) => m.type !== 'quiz'));
            setError(null);
        } catch (err) {
            console.error('Failed to fetch materials:', err);
            setError('Gagal memuat materi');
        } finally {
            setLoading(false);
        }
    }, [selectedGrade, selectedSemester, selectedCategory, searchQuery]);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    const getTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'video': return <Video size={16} />;
            case 'quiz': return <HelpCircle size={16} />;
            case 'book': return <BookOpen size={16} />;
            default: return <FileText size={16} />;
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

    const formatCategory = (category: string) => {
        return category.replace('_', ' ');
    };

    return (
        <div className="container animate-slide-up" style={{ padding: '0 0 2rem 0' }}>

            {/* Header */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Materi Pembelajaran</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Pilih materi sesuai jenjang dan semestermu.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                    <Search size={20} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Cari materi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ border: 'none', outline: 'none', fontSize: '0.95rem', minWidth: '200px' }}
                    />
                </div>
            </div>

            {/* Filter Bar */}
            <div className="card glass" style={{ marginBottom: '2rem', padding: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>

                {/* Grade Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>KELAS</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setSelectedGrade(null)}
                            className={`btn ${selectedGrade === null ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '0.5rem 1rem' }}
                        >
                            Semua
                        </button>
                        {[10, 11, 12].map(grade => (
                            <button
                                key={grade}
                                onClick={() => setSelectedGrade(grade)}
                                className={`btn ${selectedGrade === grade ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ padding: '0.5rem 1.5rem' }}
                            >
                                {grade}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Semester Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>SEMESTER</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setSelectedSemester(null)}
                            className={`btn ${selectedSemester === null ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '0.5rem 1rem' }}
                        >
                            Semua
                        </button>
                        {[1, 2].map(sem => (
                            <button
                                key={sem}
                                onClick={() => setSelectedSemester(sem)}
                                className={`btn ${selectedSemester === sem ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ padding: '0.5rem 1.5rem' }}
                            >
                                {sem}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Category Filter Dropdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft: 'auto', flexGrow: 1, minWidth: '200px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>MATA PELAJARAN</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{
                            padding: '0.6rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid #cbd5e1',
                            background: 'white',
                            width: '100%',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="">Semua Mata Pelajaran</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{formatCategory(cat)}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
                    <Loader className="animate-spin" size={40} style={{ color: 'var(--primary)' }} />
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="card" style={{ padding: '2rem', textAlign: 'center', background: '#fef2f2' }}>
                    <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>
                    <button className="btn btn-primary" onClick={fetchMaterials}>Coba Lagi</button>
                </div>
            )}

            {/* Material Grid */}
            {!loading && !error && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {materials.map(item => (
                        <div key={item.id} className="card glass card-hover-effect" style={{
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            transition: 'all 0.2s',
                            borderLeft: `4px solid ${getCategoryColor(item.category)}`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    color: getCategoryColor(item.category),
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {formatCategory(item.category)}
                                </span>
                                <span style={{
                                    fontSize: '0.75rem',
                                    padding: '0.25rem 0.5rem',
                                    background: 'rgba(0,0,0,0.05)',
                                    borderRadius: '4px',
                                    color: 'var(--text-muted)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                }}>
                                    {getTypeIcon(item.type)} {item.type}
                                </span>
                            </div>

                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', lineHeight: 1.4 }}>{item.title}</h3>

                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{
                                    fontSize: '0.7rem',
                                    padding: '0.2rem 0.5rem',
                                    background: '#f1f5f9',
                                    borderRadius: '4px',
                                    color: 'var(--text-muted)'
                                }}>
                                    Level: {item.level}
                                </span>
                                {item.createdBy && (
                                    <span style={{
                                        fontSize: '0.7rem',
                                        padding: '0.2rem 0.5rem',
                                        background: '#f1f5f9',
                                        borderRadius: '4px',
                                        color: 'var(--text-muted)'
                                    }}>
                                        Oleh: {item.createdBy.name}
                                    </span>
                                )}
                            </div>

                            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Kls {item.grade} • Sem {item.semester}</span>
                                <Link to={`/student/materials/${item.id}`} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                                    Buka
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && materials.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <BookOpen size={64} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Tidak ada materi ditemukan untuk filter ini.</p>
                </div>
            )}

        </div>
    );
};
