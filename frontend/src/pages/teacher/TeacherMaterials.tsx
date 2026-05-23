import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Search, Loader, Edit, Trash2, BookOpen, Video, FileText, HelpCircle, Link2, X, Eye, Layers3, Library, Workflow, Sparkles } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { materialsAPI, getApiErrorMessage } from '../../utils/api';

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
    linkedQuizId?: string | null;
    linkedQuiz?: { id: string; title: string; type: string } | null;
    minPassingScore?: number | null;
    order?: number | null;
}

const stripHtml = (value: string) =>
    value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const parseMaterialDetail = (material: Material) => {
    if (!material.content) {
        return { primary: 'Belum ada konten yang tersimpan.', secondary: null as string | null, href: null as string | null };
    }
    try {
        const parsed = JSON.parse(material.content) as unknown;
        if (material.type === 'video') {
            const url = typeof parsed === 'string' ? parsed : parsed && typeof parsed === 'object' ? String((parsed as Record<string, unknown>).url ?? (parsed as Record<string, unknown>).videoUrl ?? '') : '';
            return { primary: url || 'URL video belum tersedia.', secondary: url ? 'Tautan video yang akan dibuka oleh siswa.' : null, href: url || null };
        }
        if (material.type === 'book') {
            const url = typeof parsed === 'string' ? parsed : parsed && typeof parsed === 'object' ? String((parsed as Record<string, unknown>).url ?? (parsed as Record<string, unknown>).pdfUrl ?? '') : '';
            return { primary: url || 'URL e-book/PDF belum tersedia.', secondary: url ? 'Dokumen eksternal yang dibuka dari materi siswa.' : null, href: url || null };
        }
        if (material.type === 'quiz' && parsed && typeof parsed === 'object') {
            const questions = Array.isArray((parsed as Record<string, unknown>).questions) ? (parsed as { questions: unknown[] }).questions : [];
            return { primary: `${questions.length} soal kuis`, secondary: 'Builder kuis, siswa akan mengerjakan evaluasi.', href: null };
        }
    } catch { /* fallback below */ }
    if (material.type === 'video') {
        const rawUrl = material.content.trim();
        return { primary: rawUrl, secondary: 'Konten lama terdeteksi sebagai tautan mentah.', href: rawUrl.startsWith('http') ? rawUrl : null };
    }
    const preview = stripHtml(material.content);
    return { primary: preview ? `${preview.slice(0, 220)}${preview.length > 220 ? '...' : ''}` : 'Konten artikel kosong.', secondary: 'Ringkasan konten artikel.', href: null };
};

export const TeacherMaterials: React.FC = () => {
    const notifications = useNotifications();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const categories = ['MATEMATIKA', 'IPA', 'IPS', 'BAHASA_INDONESIA', 'BAHASA_INGGRIS', 'SENI', 'OLAHRAGA'];

    const fetchMaterials = React.useCallback(async () => {
        try {
            setLoading(true);
            const filters: { search?: string } = {};
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
    }, [searchQuery]);

    useEffect(() => { fetchMaterials(); }, [fetchMaterials]);

    useEffect(() => {
        const detailId = searchParams.get('detail');
        if (!detailId) return;
        const material = materials.find((item) => item.id === detailId);
        if (material) { setSelectedMaterial(material); return; }
        if (!loading) {
            void materialsAPI.getById(detailId)
                .then((item) => setSelectedMaterial(item as Material))
                .catch((err) => { console.error('Failed to load material detail:', err); });
        }
    }, [loading, materials, searchParams]);

    const closeMaterialDetail = () => {
        setSelectedMaterial(null);
        if (searchParams.get('detail')) {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.delete('detail');
            setSearchParams(nextParams, { replace: true });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setDeleting(true);
            await materialsAPI.delete(id);
            setDeleteConfirm(null);
            fetchMaterials();
        } catch (err) {
            console.error('Delete error:', err);
            notifications.error(getApiErrorMessage(err, 'Gagal menghapus materi.'), 'Materi belum dihapus');
        } finally {
            setDeleting(false);
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'MATEMATIKA': 'var(--primary)', 'IPA': '#16a34a', 'IPS': '#d97706',
            'BAHASA_INDONESIA': '#dc2626', 'BAHASA_INGGRIS': '#2563eb',
            'SENI': '#9333ea', 'OLAHRAGA': '#0891b2'
        };
        return colors[category] || 'var(--accent)';
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

    const getMaterialTypeLabel = (type: string) => {
        switch (type.toLowerCase()) {
            case 'video': return 'Video Pembelajaran';
            case 'quiz': return 'Kuis Latihan';
            case 'book': return 'E-Book / PDF';
            default: return 'Artikel / Teks';
        }
    };

    const materialSummary = {
        total: materials.length,
        typeCoverage: new Set(materials.map(m => m.type)).size,
        quizLinked: materials.filter(m => m.linkedQuizId).length,
        recent: materials.slice(0, 5)
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <section
                className="card glass animate-slide-up"
                style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(14, 165, 233, 0.08))', border: '1px solid rgba(37, 99, 235, 0.14)' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ maxWidth: '760px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: '#1d4ed8', fontSize: '0.84rem', fontWeight: '700', marginBottom: '0.55rem' }}>
                            <Sparkles size={16} /> Builder materi guru
                        </div>
                        <h1 style={{ fontSize: '1.9rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>Kelola materi dengan alur yang lebih jelas</h1>
                        <p style={{ color: '#475569', lineHeight: 1.65 }}>
                            Semua konten pembelajaran dikumpulkan di satu tempat, jadi guru lebih mudah membuat materi, menautkan kuis, dan melihat apa yang sudah siap dipakai siswa.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        <button className="btn btn-primary" onClick={() => navigate('/teacher/materials/new')}>
                            <Plus size={18} /> Buat materi baru
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginTop: '1.25rem' }}>
                    {[
                        { label: 'Total materi', value: materialSummary.total, helper: 'Semua konten belajar yang sudah dibuat', icon: <Layers3 size={18} color="#1d4ed8" />, background: '#eff6ff' },
                        { label: 'Tipe aktif', value: materialSummary.typeCoverage, helper: 'Varian konten yang siap dipakai', icon: <Workflow size={18} color="#0f766e" />, background: '#ecfdf5' },
                        { label: 'Materi bertaut kuis', value: materialSummary.quizLinked, helper: 'Konten yang sudah terhubung evaluasi', icon: <HelpCircle size={18} color="#92400e" />, background: '#fffbeb' },
                        { label: 'Materi terbaru', value: materialSummary.recent.length, helper: 'Konten paling baru yang bisa ditinjau ulang', icon: <Library size={18} color="#7c3aed" />, background: '#faf5ff' }
                    ].map((card) => (
                        <div key={card.label} className="card" style={{ padding: '1rem', boxShadow: 'none', border: '1px solid rgba(148, 163, 184, 0.16)', background: 'white' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: card.background, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>{card.icon}</div>
                            <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{card.label}</p>
                            <p style={{ color: '#0f172a', fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.3rem' }}>{card.value}</p>
                            <p style={{ color: '#475569', fontSize: '0.8rem', lineHeight: 1.5 }}>{card.helper}</p>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(260px, 360px)', gap: '1rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.75rem 1rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                        <Search size={18} color="#64748b" />
                        <input
                            type="text"
                            placeholder="Cari judul materi, kategori, atau tipe..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.95rem', background: 'transparent' }}
                        />
                    </div>
                    <div className="card" style={{ padding: '1rem', boxShadow: 'none', border: '1px solid rgba(148, 163, 184, 0.16)', background: 'rgba(255, 255, 255, 0.82)' }}>
                        <p style={{ color: '#0f172a', fontWeight: '700', marginBottom: '0.35rem' }}>Tips cepat</p>
                        <p style={{ color: '#64748b', fontSize: '0.84rem', lineHeight: 1.55 }}>
                            Mulai dari artikel untuk konsep inti, lalu tambahkan kuis atau video pendukung agar alur belajar siswa lebih runtut.
                        </p>
                    </div>
                </div>
            </section>

            {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
                    <Loader className="animate-spin" size={40} style={{ color: 'var(--primary)' }} />
                </div>
            )}

            {error && !loading && (
                <div className="card" style={{ padding: '2rem', textAlign: 'center', background: '#fef2f2' }}>
                    <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>
                    <button className="btn btn-primary" onClick={fetchMaterials}>Coba Lagi</button>
                </div>
            )}

            {!loading && !error && (
                <div className="card glass animate-slide-up" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
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
                                    <tr key={material.id}
                                        onClick={() => setSelectedMaterial(material)}
                                        style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                                    >
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{material.title}</span>
                                                {material.linkedQuiz && (
                                                    <span style={{ fontSize: '0.7rem', fontWeight: '600', background: '#dbeafe', color: '#1d4ed8', padding: '0.15rem 0.4rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <Link2 size={10} /> {material.linkedQuiz.title}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                Dibuat: {new Date(material.createdAt).toLocaleDateString('id-ID')}
                                                {material.order && <> | Urutan: {material.order}</>}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: getCategoryColor(material.category), background: getCategoryColor(material.category) + '15', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                                                {formatCategory(material.category)}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                {getTypeIcon(material.type)} {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.2rem 0.5rem', borderRadius: '4px',
                                                background: material.level === 'Mudah' ? '#dcfce7' : material.level === 'Menengah' ? '#fef3c7' : '#fee2e2',
                                                color: material.level === 'Mudah' ? '#16a34a' : material.level === 'Menengah' ? '#d97706' : '#dc2626'
                                            }}>{material.level}</span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>{material.grade} / Sem {material.semester}</span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button onClick={(event) => { event.stopPropagation(); setSelectedMaterial(material); }}
                                                    style={{ padding: '0.5rem', color: '#0f766e', background: '#ccfbf1', borderRadius: '0.5rem', cursor: 'pointer', border: 'none' }} title="Detail">
                                                    <Eye size={16} />
                                                </button>
                                                <button onClick={(event) => { event.stopPropagation(); navigate(`/teacher/materials/${material.id}/edit`); }}
                                                    style={{ padding: '0.5rem', color: 'var(--primary)', background: '#e0e7ff', borderRadius: '0.5rem', cursor: 'pointer', border: 'none' }} title="Edit">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={(event) => { event.stopPropagation(); setDeleteConfirm(material.id); }}
                                                    style={{ padding: '0.5rem', color: '#dc2626', background: '#fee2e2', borderRadius: '0.5rem', cursor: 'pointer', border: 'none' }} title="Hapus">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {materials.length === 0 && (
                        <div style={{ padding: '4rem', textAlign: 'center' }}>
                            <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
                            <p style={{ color: 'var(--text-muted)' }}>Belum ada materi. Mulai dari artikel pertama lalu sambungkan kuis bila perlu.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Material Detail Panel */}
            {selectedMaterial && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', overflow: 'auto', background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', boxShadow: '0 24px 70px rgba(15, 23, 42, 0.28)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Detail Materi</h2>
                            <button onClick={closeMaterialDetail} style={{ padding: '0.5rem', cursor: 'pointer', background: 'transparent', border: 'none' }}>
                                <X size={20} color="var(--text-muted)" />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Judul</span>
                                <p style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-main)' }}>{selectedMaterial.title}</p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Kategori</span>
                                    <p>{formatCategory(selectedMaterial.category)}</p>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Tipe</span>
                                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>{getTypeIcon(selectedMaterial.type)} {getMaterialTypeLabel(selectedMaterial.type)}</p>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Level</span>
                                    <p>{selectedMaterial.level}</p>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Kelas / Semester</span>
                                    <p>Kelas {selectedMaterial.grade} / Semester {selectedMaterial.semester}</p>
                                </div>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Konten</span>
                                <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{parseMaterialDetail(selectedMaterial).primary}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button className="btn btn-primary" onClick={() => { closeMaterialDetail(); navigate(`/teacher/materials/${selectedMaterial.id}/edit`); }}>
                                    <Edit size={16} /> Edit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', boxShadow: '0 24px 70px rgba(15, 23, 42, 0.28)' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <Trash2 size={28} color="#dc2626" />
                        </div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Hapus Materi?</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Tindakan ini tidak dapat dibatalkan. Materi akan dihapus secara permanen.</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)} disabled={deleting}>Batal</button>
                            <button className="btn" style={{ background: '#dc2626', color: 'white' }} onClick={() => handleDelete(deleteConfirm)} disabled={deleting}>
                                {deleting ? <Loader className="animate-spin" size={20} /> : 'Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
