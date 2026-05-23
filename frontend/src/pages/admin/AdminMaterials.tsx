import React, { useState, useEffect } from 'react';
import { Search, Loader, Trash2, Eye, BookOpen, Video, FileText, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { materialsAPI } from '../../utils/api';

interface Material {
    id: string;
    title: string;
    type: string;
    category: string;
    level: string;
    grade: number;
    semester: number;
    createdAt: string;
    createdBy?: { name: string };
}

export const AdminMaterials: React.FC = () => {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string>('');

    const categories = ['MATEMATIKA', 'IPA', 'IPS', 'BAHASA_INDONESIA', 'BAHASA_INGGRIS', 'SENI', 'OLAHRAGA'];
    const types = ['article', 'video', 'book', 'quiz'];

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                setLoading(true);
                const filters: Record<string, unknown> = {};
                if (selectedGrade) filters.grade = selectedGrade;
                if (selectedCategory) filters.category = selectedCategory;
                if (selectedType) filters.type = selectedType;
                if (searchTerm) filters.search = searchTerm;
                const data = await materialsAPI.getAll(filters as any);
                setMaterials(data);
            } catch (error) {
                console.error('Failed to fetch materials:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMaterials();
    }, [selectedGrade, selectedCategory, selectedType, searchTerm]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Hapus materi ini? Tindakan ini tidak bisa dibatalkan.')) return;
        try {
            await materialsAPI.delete(id);
            setMaterials(prev => prev.filter(m => m.id !== id));
        } catch (error) {
            console.error('Failed to delete material:', error);
        }
    };

    const formatCategory = (category: string) => category.replace('_', ' ');

    const getTypeIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'video': return <Video size={16} />;
            case 'book': return <BookOpen size={16} />;
            case 'quiz': return <HelpCircle size={16} />;
            default: return <FileText size={16} />;
        }
    };

    const getTypeName = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'video': return 'Video';
            case 'book': return 'E-Book';
            case 'quiz': return 'Kuis';
            default: return 'Artikel';
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'Mudah': return { bg: '#dcfce7', color: '#166534' };
            case 'Menengah': return { bg: '#fef3c7', color: '#92400e' };
            case 'Sulit': return { bg: '#fee2e2', color: '#991b1b' };
            default: return { bg: '#f3f4f6', color: '#374151' };
        }
    };

    const filteredMaterials = materials;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111827' }}>Materials Management</h1>
            </div>

            {/* Filters */}
            <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1rem 1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1 1 250px' }}>
                    <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Cari materi..."
                        style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.8rem', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.9rem' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={selectedGrade === null ? '' : selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value ? Number(e.target.value) : null)}
                    style={{ padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.9rem', minWidth: '120px' }}
                >
                    <option value="">Semua Kelas</option>
                    <option value={7}>Kls 7</option>
                    <option value={8}>Kls 8</option>
                    <option value={9}>Kls 9</option>
                </select>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.9rem', minWidth: '140px' }}
                >
                    <option value="">Semua Mapel</option>
                    {categories.map(c => (
                        <option key={c} value={c}>{c.replace('_', ' ')}</option>
                    ))}
                </select>
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    style={{ padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.9rem', minWidth: '130px' }}
                >
                    <option value="">Semua Tipe</option>
                    {types.map(t => (
                        <option key={t} value={t}>{getTypeName(t)}</option>
                    ))}
                </select>
            </div>

            {/* Materials Table */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <Loader className="animate-spin" size={40} style={{ color: '#ef4444' }} />
                </div>
            ) : (
                <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f9fafb', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Judul Materi</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Tipe</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Mapel</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Kelas</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Level</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Dibuat Oleh</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMaterials.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                                        Tidak ada materi ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                filteredMaterials.map(material => {
                                    const levelStyle = getLevelColor(material.level);
                                    return (
                                        <tr key={material.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: '600', color: '#111827' }}>{material.title}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                                    Sem {material.semester} &middot; {new Date(material.createdAt).toLocaleDateString('id-ID')}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: '#374151' }}>
                                                    {getTypeIcon(material.type)} {getTypeName(material.type)}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ fontSize: '0.85rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', background: '#e5e7eb', fontWeight: '500', color: '#374151' }}>
                                                    {formatCategory(material.category)}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ fontWeight: '600', color: '#111827' }}>Kls {material.grade}</span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', background: levelStyle.bg, color: levelStyle.color, fontWeight: '500' }}>
                                                    {material.level}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
                                                {material.createdBy?.name || '-'}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                    <Link
                                                        to={`/student/materials/${material.id}`}
                                                        style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #e5e7eb', cursor: 'pointer', display: 'flex' }}
                                                        title="Lihat"
                                                    >
                                                        <Eye size={16} color="#4b5563" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(material.id)}
                                                        style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #e5e7eb', cursor: 'pointer', display: 'flex' }}
                                                        title="Hapus"
                                                    >
                                                        <Trash2 size={16} color="#ef4444" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Stats */}
            {!loading && filteredMaterials.length > 0 && (
                <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                    Total: <strong>{filteredMaterials.length}</strong> materi
                </div>
            )}
        </div>
    );
};
