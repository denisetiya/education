import React, { useState, useEffect } from 'react';
import { Plus, Search, Loader, Edit, Trash2, X, BookOpen, Video, FileText, HelpCircle, AlertCircle } from 'lucide-react';
import { materialsAPI } from '../../utils/api';
import { RichTextEditor } from '../../components/RichTextEditor';

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

interface MaterialFormData {
    title: string;
    type: string;
    category: string;
    level: string;
    content: string;
    semester: number;
    grade: number;
}

const initialFormData: MaterialFormData = {
    title: '',
    type: 'article',
    category: 'MATEMATIKA',
    level: 'Mudah',
    content: '',
    semester: 1,
    grade: 10
};

export const TeacherMaterials: React.FC = () => {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<MaterialFormData>(initialFormData);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Delete confirmation
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const categories = [
        'MATEMATIKA', 'IPA', 'IPS', 'BAHASA_INDONESIA', 'BAHASA_INGGRIS', 'SENI', 'OLAHRAGA'
    ];

    const types = ['video', 'article', 'book', 'quiz'];
    const levels = ['Mudah', 'Menengah', 'Sulit'];

    useEffect(() => {
        fetchMaterials();
    }, [searchQuery]);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const filters: any = {};
            if (searchQuery) filters.search = searchQuery;
            const data = await materialsAPI.getAll(filters);
            setMaterials(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch materials:', err);
            setError('Gagal memuat materi');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setFormData(initialFormData);
        setIsEditing(false);
        setEditingId(null);
        setFormError(null);
        setShowModal(true);
    };

    const handleOpenEdit = (material: Material) => {
        setFormData({
            title: material.title,
            type: material.type,
            category: material.category,
            level: material.level,
            content: material.content || '',
            semester: material.semester,
            grade: material.grade
        });
        setIsEditing(true);
        setEditingId(material.id);
        setFormError(null);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            setFormError('Judul materi harus diisi');
            return;
        }

        try {
            setSubmitting(true);
            setFormError(null);

            if (isEditing && editingId) {
                await materialsAPI.update(editingId, formData);
            } else {
                await materialsAPI.create(formData);
            }

            setShowModal(false);
            fetchMaterials();
        } catch (err: any) {
            console.error('Submit error:', err);
            setFormError(err.message || 'Gagal menyimpan materi');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setDeleting(true);
            await materialsAPI.delete(id);
            setDeleteConfirm(null);
            fetchMaterials();
        } catch (err: any) {
            console.error('Delete error:', err);
            alert('Gagal menghapus materi: ' + (err.message || 'Unknown error'));
        } finally {
            setDeleting(false);
        }
    };

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div className="animate-slide-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b' }}>Kelola Materi</h1>
                    <p style={{ color: '#64748b' }}>Buat, edit, dan hapus materi pembelajaran.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                        <Search size={20} color="var(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Cari materi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ border: 'none', outline: 'none', fontSize: '0.95rem', minWidth: '180px' }}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={handleOpenCreate}>
                        <Plus size={20} /> Tambah Materi
                    </button>
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

            {/* Material Table */}
            {!loading && !error && (
                <div className="card glass animate-slide-up" style={{ padding: '0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>JUDUL</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>KATEGORI</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>TIPE</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>LEVEL</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>KELAS</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>AKSI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {materials.map((material) => (
                                <tr key={material.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{material.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            Dibuat: {new Date(material.createdAt).toLocaleDateString('id-ID')}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            color: getCategoryColor(material.category),
                                            background: getCategoryColor(material.category) + '15',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px'
                                        }}>
                                            {formatCategory(material.category)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            {getTypeIcon(material.type)} {material.type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '4px',
                                            background: material.level === 'Mudah' ? '#dcfce7' : material.level === 'Menengah' ? '#fef3c7' : '#fee2e2',
                                            color: material.level === 'Mudah' ? '#16a34a' : material.level === 'Menengah' ? '#d97706' : '#dc2626'
                                        }}>
                                            {material.level}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>{material.grade} / Sem {material.semester}</span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => handleOpenEdit(material)}
                                                style={{ padding: '0.5rem', color: 'var(--primary)', background: '#e0e7ff', borderRadius: '0.5rem', cursor: 'pointer', border: 'none' }}
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(material.id)}
                                                style={{ padding: '0.5rem', color: '#dc2626', background: '#fee2e2', borderRadius: '0.5rem', cursor: 'pointer', border: 'none' }}
                                                title="Hapus"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {materials.length === 0 && (
                        <div style={{ padding: '4rem', textAlign: 'center' }}>
                            <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
                            <p style={{ color: 'var(--text-muted)' }}>Belum ada materi. Klik "Tambah Materi" untuk membuat yang pertama.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
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
                    <div className="card" style={{
                        width: '100%',
                        maxWidth: '800px',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        animation: 'fadeIn 0.2s ease-out'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                                {isEditing ? 'Edit Materi' : 'Tambah Materi Baru'}
                            </h2>
                            <button onClick={() => setShowModal(false)} style={{ padding: '0.5rem', cursor: 'pointer', background: 'transparent', border: 'none' }}>
                                <X size={24} color="var(--text-muted)" />
                            </button>
                        </div>

                        {formError && (
                            <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626' }}>
                                <AlertCircle size={20} />
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {/* Title */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Judul Materi *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Masukkan judul materi"
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '1rem' }}
                                        required
                                    />
                                </div>

                                {/* Category & Type */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Kategori</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{formatCategory(cat)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Tipe</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}
                                        >
                                            {types.map(type => (
                                                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Level, Grade, Semester */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Level</label>
                                        <select
                                            value={formData.level}
                                            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}
                                        >
                                            {levels.map(level => (
                                                <option key={level} value={level}>{level}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Kelas</label>
                                        <select
                                            value={formData.grade}
                                            onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}
                                        >
                                            <option value={10}>10</option>
                                            <option value={11}>11</option>
                                            <option value={12}>12</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Semester</label>
                                        <select
                                            value={formData.semester}
                                            onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}
                                        >
                                            <option value={1}>1</option>
                                            <option value={2}>2</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Content */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Konten</label>
                                    <RichTextEditor
                                        value={formData.content}
                                        onChange={(value) => setFormData({ ...formData, content: value })}
                                        placeholder="Tulis konten materi di sini..."
                                    />
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                        Batal
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? <Loader className="animate-spin" size={20} /> : null}
                                        {isEditing ? 'Simpan Perubahan' : 'Tambah Materi'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <Trash2 size={28} color="#dc2626" />
                        </div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Hapus Materi?</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            Tindakan ini tidak dapat dibatalkan. Materi akan dihapus secara permanen.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)} disabled={deleting}>
                                Batal
                            </button>
                            <button
                                className="btn"
                                style={{ background: '#dc2626', color: 'white' }}
                                onClick={() => handleDelete(deleteConfirm)}
                                disabled={deleting}
                            >
                                {deleting ? <Loader className="animate-spin" size={20} /> : 'Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
