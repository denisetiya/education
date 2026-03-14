import React, { useState, useEffect } from 'react';
import { Plus, MoreVertical, Edit, Users, Copy, BookOpen, Grid, List } from 'lucide-react';
import { classesAPI } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import type { ClassItem } from '../../types/api.types';

export const TeacherClasses: React.FC = () => {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newClass, setNewClass] = useState({ name: '', subject: '', description: '' });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchClasses();
    }, []);

    // Auto-hide success message after 3 seconds
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const fetchClasses = async () => {
        try {
            const data = await classesAPI.getAll();
            setClasses(data);
        } catch (error) {
            console.error('Failed to fetch classes', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            await classesAPI.create({
                name: newClass.name.trim(),
                subject: newClass.subject.trim() || undefined,
                description: newClass.description.trim() || undefined
            });
            setShowCreateModal(false);
            setNewClass({ name: '', subject: '', description: '' });
            setSuccess('Kelas berhasil dibuat!');
            fetchClasses();
        } catch (error: unknown) {
            console.error('Failed to create class', error);
            setError(error instanceof Error ? error.message : 'Gagal membuat kelas. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setSuccess('Kode kelas disalin!');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div className="animate-slide-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b' }}>Manajemen Kelas</h1>
                    <p style={{ color: '#64748b' }}>Kelola daftar kelas, jadwal, dan siswa Anda.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                     <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.25rem', borderRadius: '0.5rem', height: 'fit-content' }}>
                        <button
                            onClick={() => setViewMode('list')}
                            style={{ padding: '0.5rem', borderRadius: '0.3rem', background: viewMode === 'list' ? 'white' : 'transparent', boxShadow: viewMode === 'list' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none', color: viewMode === 'list' ? 'var(--primary)' : '#94a3b8', border: 'none', cursor: 'pointer' }}
                        >
                            <List size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{ padding: '0.5rem', borderRadius: '0.3rem', background: viewMode === 'grid' ? 'white' : 'transparent', boxShadow: viewMode === 'grid' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none', color: viewMode === 'grid' ? 'var(--primary)' : '#94a3b8', border: 'none', cursor: 'pointer' }}
                        >
                            <Grid size={20} />
                        </button>
                    </div>
                    <button 
                        onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary" 
                    style={{ padding: '0.8rem 1.5rem', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Plus size={20} /> Buat Kelas Baru
                </button>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div>Loading...</div>
            ) : viewMode === 'list' ? (
                <div className="card glass animate-slide-up" style={{ padding: '0', animationDelay: '0.2s', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <tr>
                                <th style={{ padding: '1.2rem', textAlign: 'left' }}>Nama Kelas</th>
                                <th style={{ padding: '1.2rem', textAlign: 'left' }}>Kode</th>
                                <th style={{ padding: '1.2rem', textAlign: 'center' }}>Siswa</th>
                                <th style={{ padding: '1.2rem', textAlign: 'center' }}>Modul</th>
                                <th style={{ padding: '1.2rem', textAlign: 'right' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classes.map(cls => (
                                <tr key={cls.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1.2rem', fontWeight: '600', color: '#334155' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                                            {cls.name}
                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'normal' }}>({cls.subject})</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem', fontFamily: 'monospace', fontSize: '1.1rem' }}>
                                        <button onClick={() => copyToClipboard(cls.code)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: 'none', border: 'none' }}>
                                            {cls.code} <Copy size={14} />
                                        </button>
                                    </td>
                                    <td style={{ padding: '1.2rem', textAlign: 'center' }}>
                                        <span style={{ background: '#f1f5f9', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>
                                            {cls._count?.students || 0}
                                        </span>
                                    </td>
                                     <td style={{ padding: '1.2rem', textAlign: 'center' }}>
                                        <span style={{ background: '#f0fdf4', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 'bold', color: '#166534' }}>
                                            {cls._count?.modules || 0}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button onClick={() => navigate(`/teacher/classes/${cls.id}`)} className="btn-secondary" style={{ padding: '0.4rem', color: '#64748b' }}><Edit size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {classes.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Belum ada kelas yang dibuat.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="animate-slide-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', animationDelay: '0.2s' }}>
                    {classes.map(cls => (
                        <div key={cls.id} className="card glass" style={{ padding: '1.5rem', borderTop: `6px solid var(--primary)`, transition: 'transform 0.2s', cursor: 'pointer' }}
                            onClick={() => navigate(`/teacher/classes/${cls.id}`)}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{cls.name}</h3>
                                <button style={{ color: '#94a3b8' }} onClick={(e) => { e.stopPropagation(); /* Menu logic */ }}><MoreVertical size={20} /></button>
                            </div>

                            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>{cls.subject}</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>
                                    <b style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: '#334155' }}>{cls.code}</b>
                                    <button onClick={(e) => { e.stopPropagation(); copyToClipboard(cls.code); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Copy size={14} /></button>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>
                                    <Users size={16} /> {cls._count?.students || 0} Siswa
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>
                                    <BookOpen size={16} /> {cls._count?.modules || 0} Modul
                                </div>
                            </div>
                        </div>
                    ))}
                    {classes.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                            Belum ada kelas. Silakan buat kelas baru.
                        </div>
                    )}
                </div>
            )}

            {/* Create Class Modal */}
            {showCreateModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="card glass" style={{ width: '440px', padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Buat Kelas Baru</h2>
                        {error && (
                            <div style={{ 
                                padding: '0.75rem 1rem', 
                                background: '#fef2f2', 
                                border: '1px solid #fecaca', 
                                borderRadius: '0.5rem', 
                                color: '#dc2626', 
                                marginBottom: '1rem',
                                fontSize: '0.9rem'
                            }}>
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleCreateClass} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nama Kelas</label>
                                <input
                                    type="text"
                                    required
                                    value={newClass.name}
                                    onChange={e => setNewClass({ ...newClass, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                                    placeholder="Contoh: Kelas 10-A"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Mata Pelajaran</label>
                                <input
                                    type="text"
                                    value={newClass.subject}
                                    onChange={e => setNewClass({ ...newClass, subject: e.target.value })}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                                    placeholder="Contoh: Matematika"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Deskripsi (Opsional)</label>
                                <textarea
                                    value={newClass.description}
                                    onChange={e => setNewClass({ ...newClass, description: e.target.value })}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                                    rows={3}
                                    placeholder="Tambahkan deskripsi kelas..."
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setError(null);
                                        setNewClass({ name: '', subject: '', description: '' });
                                    }}
                                    className="btn btn-secondary"
                                    style={{ flex: 1 }}
                                >
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
                                    {isSubmitting ? 'Membuat...' : 'Buat'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Success Toast */}
            {success && (
                <div style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    background: '#10b981',
                    color: 'white',
                    padding: '1rem 1.5rem',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    animation: 'slideUp 0.3s ease-out',
                    zIndex: 1100
                }}>
                    ✓ {success}
                </div>
            )}
        </div>
    );
};
