import React, { useState } from 'react';
import { Plus, GripVertical, FileText, Video, HelpCircle, Save, Trash, Move } from 'lucide-react';

export const TeacherCurriculum: React.FC = () => {
    // Mock Editor State
    const [modules, setModules] = useState([
        {
            id: 1,
            title: 'Bab 1: Pendahuluan',
            items: [
                { id: 1, type: 'video', title: 'Video Pengantar', duration: '5:00' },
                { id: 2, type: 'text', title: 'Rangkuman Materi', pages: '3 hal' }
            ]
        },
        {
            id: 2,
            title: 'Bab 2: Inti Materi',
            items: [
                { id: 3, type: 'quiz', title: 'Quiz Harian', questions: 10 }
            ]
        },
    ]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="animate-slide-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b' }}>Penyusun Kurikulum</h1>
                    <p style={{ color: '#64748b' }}>Susun materi pembelajaran secara terstruktur.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" style={{ border: '1px solid #ef4444', color: '#ef4444' }}>Reset</button>
                    <button className="btn btn-primary"><Save size={18} /> Simpan Perubahan</button>
                </div>
            </div>

            <div className="animate-slide-up" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', animationDelay: '0.1s' }}>

                {/* Editor Canvas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {modules.map((module, index) => (
                        <div key={module.id} className="card glass" style={{ padding: '0', overflow: 'hidden', borderLeft: index === 0 ? '4px solid var(--primary)' : '4px solid #cbd5e1' }}>
                            {/* Module Header */}
                            <div style={{ padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.5)', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ cursor: 'move', color: '#94a3b8' }}><GripVertical size={20} /></div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{module.title}</h3>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600', padding: '0.4rem 0.8rem', background: '#e0e7ff', borderRadius: '4px' }}>+ Item</button>
                                    <button style={{ color: '#ef4444', padding: '0.4rem' }}><Trash size={18} /></button>
                                </div>
                            </div>

                            {/* Module Items */}
                            <div style={{ padding: '1.5rem', background: '#f8fafc', minHeight: '100px' }}>
                                {module.items.map(item => (
                                    <div key={item.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '1rem',
                                        marginBottom: '0.8rem',
                                        background: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '0.75rem',
                                        cursor: 'grab',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                        transition: 'transform 0.2s'
                                    }}
                                        className="hover:scale-[1.01]"
                                    >
                                        <GripVertical size={20} color="#cbd5e1" />
                                        <div style={{
                                            padding: '0.6rem',
                                            borderRadius: '0.5rem',
                                            background: item.type === 'video' ? '#eff6ff' : item.type === 'quiz' ? '#fef2f2' : '#f0fdf4',
                                            color: item.type === 'video' ? '#2563eb' : item.type === 'quiz' ? '#dc2626' : '#166534'
                                        }}>
                                            {item.type === 'video' ? <Video size={18} /> : item.type === 'quiz' ? <HelpCircle size={18} /> : <FileText size={18} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>{item.title}</p>
                                            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                {item.type === 'video' ? item.duration : item.type === 'quiz' ? `${item.questions} Soal` : item.pages}
                                            </p>
                                        </div>
                                        <button style={{ color: '#cbd5e1' }}><Move size={16} /></button>
                                    </div>
                                ))}
                                {module.items.length === 0 && (
                                    <div style={{ border: '2px dashed #cbd5e1', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                                        <p>Drop materi di sini</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    <button style={{
                        padding: '1.5rem',
                        border: '2px dashed #94a3b8',
                        borderRadius: '0.75rem',
                        color: '#64748b',
                        fontWeight: '600',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '0.75rem',
                        background: 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.color = '#64748b'; }}
                    >
                        <Plus size={24} /> Tambah Bab Baru
                    </button>
                </div>

                {/* Toolbox Sidebar */}
                <div style={{ position: 'sticky', top: '2rem', height: 'fit-content' }}>
                    <div className="card glass" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: '700' }}>Toolbox Materi</h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Drag icon ke area editor.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <ToolItem icon={<FileText size={20} />} label="Teks & Bacaan" color="#166534" bg="#f0fdf4" />
                            <ToolItem icon={<Video size={20} />} label="Video Upload" color="#2563eb" bg="#eff6ff" />
                            <ToolItem icon={<HelpCircle size={20} />} label="Kuis Interaktif" color="#dc2626" bg="#fef2f2" />
                        </div>

                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '1rem' }}>Template Cepat</h4>
                            <button style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', background: 'white', color: '#475569', fontSize: '0.9rem', textAlign: 'left', marginBottom: '0.5rem' }}>
                                📄 Silabus Standar
                            </button>
                            <button style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', background: 'white', color: '#475569', fontSize: '0.9rem', textAlign: 'left' }}>
                                🧪 Struktur Praktikum
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

const ToolItem: React.FC<{ icon: React.ReactNode, label: string, color: string, bg: string }> = ({ icon, label, color, bg }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        border: '1px solid #e2e8f0',
        borderRadius: '0.75rem',
        cursor: 'grab',
        background: 'white',
        boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
        transition: 'all 0.2s'
    }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
        <div style={{ padding: '0.5rem', borderRadius: '0.4rem', background: bg, color: color }}>
            {icon}
        </div>
        <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#334155' }}>{label}</span>
    </div>
);
