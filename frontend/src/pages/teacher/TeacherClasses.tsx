import React, { useState } from 'react';
import { Plus, Search, MoreVertical, Edit, Trash2, Users, Calendar, Clock, Filter, Grid, List } from 'lucide-react';

export const TeacherClasses: React.FC = () => {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    // Mock Data
    const classes = [
        { id: 1, name: 'Matematika VII-A', students: 32, schedule: 'Senin, 08:00', topic: 'Aljabar Dasar', color: 'var(--primary)' },
        { id: 2, name: 'Matematika VII-B', students: 30, schedule: 'Selasa, 10:00', topic: 'Bilangan Bulat', color: 'var(--primary)' },
        { id: 3, name: 'Klub Olimpiade', students: 12, schedule: 'Jumat, 14:00', topic: 'Persiapan Lomba', color: 'var(--warning)' },
        { id: 4, name: 'Fisika VIII-C', students: 28, schedule: 'Rabu, 09:30', topic: 'Hukum Newton', color: 'var(--secondary)' },
        { id: 5, name: 'Biologi X-1', students: 35, schedule: 'Kamis, 13:00', topic: 'Sistem Pencernaan', color: 'var(--success)' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div className="animate-slide-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b' }}>Manajemen Kelas</h1>
                    <p style={{ color: '#64748b' }}>Kelola daftar kelas, jadwal, dan siswa Anda.</p>
                </div>
                <button className="btn btn-primary" style={{ padding: '0.8rem 1.5rem', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)' }}>
                    <Plus size={20} /> Buat Kelas Baru
                </button>
            </div>

            {/* Filter Bar */}
            <div className="card glass animate-slide-up" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animationDelay: '0.1s' }}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                    <div style={{ position: 'relative', width: '320px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Cari kelas berdasarkan nama..."
                            style={{
                                width: '100%',
                                padding: '0.6rem 1rem 0.6rem 2.8rem',
                                border: '1px solid #cbd5e1',
                                borderRadius: '0.5rem',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <button className="btn btn-secondary" style={{ padding: '0.6rem 1rem' }}>
                        <Filter size={18} /> Filter
                    </button>
                </div>

                <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.25rem', borderRadius: '0.5rem' }}>
                    <button
                        onClick={() => setViewMode('list')}
                        style={{ padding: '0.5rem', borderRadius: '0.3rem', background: viewMode === 'list' ? 'white' : 'transparent', boxShadow: viewMode === 'list' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none', color: viewMode === 'list' ? 'var(--primary)' : '#94a3b8' }}
                    >
                        <List size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        style={{ padding: '0.5rem', borderRadius: '0.3rem', background: viewMode === 'grid' ? 'white' : 'transparent', boxShadow: viewMode === 'grid' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none', color: viewMode === 'grid' ? 'var(--primary)' : '#94a3b8' }}
                    >
                        <Grid size={20} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'list' ? (
                <div className="card glass animate-slide-up" style={{ padding: '0', animationDelay: '0.2s', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <tr>
                                <th style={{ padding: '1.2rem', textAlign: 'left' }}>Nama Kelas</th>
                                <th style={{ padding: '1.2rem', textAlign: 'left' }}>Jadwal</th>
                                <th style={{ padding: '1.2rem', textAlign: 'center' }}>Siswa</th>
                                <th style={{ padding: '1.2rem', textAlign: 'left' }}>Topik Saat Ini</th>
                                <th style={{ padding: '1.2rem', textAlign: 'right' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classes.map(cls => (
                                <tr key={cls.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1.2rem', fontWeight: '600', color: '#334155' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cls.color }}></div>
                                            {cls.name}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem', color: '#64748b' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Calendar size={16} /> {cls.schedule}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem', textAlign: 'center' }}>
                                        <span style={{ background: '#f1f5f9', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>
                                            {cls.students}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <span style={{ fontSize: '0.9rem', padding: '0.25rem 0.75rem', background: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', border: '1px solid #dbeafe' }}>
                                            {cls.topic}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button className="btn-secondary" style={{ padding: '0.4rem', color: '#64748b' }}><Edit size={16} /></button>
                                            <button className="btn-secondary" style={{ padding: '0.4rem', color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2' }}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="animate-slide-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', animationDelay: '0.2s' }}>
                    {classes.map(cls => (
                        <div key={cls.id} className="card glass" style={{ padding: '1.5rem', borderTop: `6px solid ${cls.color}`, transition: 'transform 0.2s', cursor: 'pointer' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{cls.name}</h3>
                                <button style={{ color: '#94a3b8' }}><MoreVertical size={20} /></button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>
                                    <Clock size={16} /> {cls.schedule}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>
                                    <Users size={16} /> {cls.students} Siswa
                                </div>
                            </div>

                            <div style={{ paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Topik:</span>
                                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: cls.color }}>{cls.topic}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
