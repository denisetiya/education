import React, { useState, useEffect } from 'react';
import { Search, Loader, Users, BookOpen, Globe, Lock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { classesAPI } from '../../utils/api';

interface ClassItem {
    id: string;
    name: string;
    subject: string;
    description?: string;
    code: string;
    isPublic: boolean;
    createdAt: string;
    teacher?: { name: string };
    _count?: { modules: number; students: number };
}

export const AdminClasses: React.FC = () => {
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterVisibility, setFilterVisibility] = useState<'all' | 'public' | 'private'>('all');

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                setLoading(true);
                const data = await classesAPI.getAll();
                setClasses(data);
            } catch (error) {
                console.error('Failed to fetch classes:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, []);

    const filteredClasses = classes.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase())
            || c.subject.toLowerCase().includes(searchTerm.toLowerCase())
            || (c.teacher?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesVisibility = filterVisibility === 'all'
            || (filterVisibility === 'public' && c.isPublic)
            || (filterVisibility === 'private' && !c.isPublic);
        return matchesSearch && matchesVisibility;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111827' }}>Classes Overview</h1>
            </div>

            {/* Filters */}
            <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1rem 1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1 1 300px' }}>
                    <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Cari kelas atau guru..."
                        style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.8rem', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.9rem' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={filterVisibility}
                    onChange={(e) => setFilterVisibility(e.target.value as any)}
                    style={{ padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.9rem', minWidth: '140px' }}
                >
                    <option value="all">Semua Visibilitas</option>
                    <option value="public">Publik</option>
                    <option value="private">Private</option>
                </select>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <StatCard
                    title="Total Kelas"
                    value={classes.length}
                    icon={<BookOpen size={20} color="#ef4444" />}
                />
                <StatCard
                    title="Kelas Publik"
                    value={classes.filter(c => c.isPublic).length}
                    icon={<Globe size={20} color="#10b981" />}
                />
                <StatCard
                    title="Kelas Private"
                    value={classes.filter(c => !c.isPublic).length}
                    icon={<Lock size={20} color="#f59e0b" />}
                />
                <StatCard
                    title="Total Siswa"
                    value={classes.reduce((sum, c) => sum + (c._count?.students || 0), 0)}
                    icon={<Users size={20} color="#3b82f6" />}
                />
            </div>

            {/* Classes Table */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <Loader className="animate-spin" size={40} style={{ color: '#ef4444' }} />
                </div>
            ) : (
                <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f9fafb', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Nama Kelas</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Mapel</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Guru</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Siswa</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Modul</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Visibilitas</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Kode</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClasses.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                                        Tidak ada kelas ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                filteredClasses.map(cls => (
                                    <tr key={cls.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: '600', color: '#111827' }}>{cls.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                                {new Date(cls.createdAt).toLocaleDateString('id-ID')}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ fontSize: '0.85rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', background: '#e5e7eb', fontWeight: '500', color: '#374151' }}>
                                                {cls.subject}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#374151', fontWeight: '500' }}>
                                            {cls.teacher?.name || '-'}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: '600', color: '#3b82f6' }}>
                                                <Users size={14} /> {cls._count?.students || 0}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <span style={{ fontWeight: '600', color: '#8b5cf6' }}>
                                                {cls._count?.modules || 0}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            {cls.isPublic ? (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', background: '#dcfce7', color: '#166534', fontWeight: '500' }}>
                                                    <Globe size={12} /> Publik
                                                </span>
                                            ) : (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', background: '#fef3c7', color: '#92400e', fontWeight: '500' }}>
                                                    <Lock size={12} /> Private
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <code style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', color: '#6366f1', fontWeight: '600' }}>
                                                {cls.code}
                                            </code>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && filteredClasses.length > 0 && (
                <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                    Total: <strong>{filteredClasses.length}</strong> kelas
                </div>
            )}
        </div>
    );
};

const StatCard = ({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) => (
    <div style={{ background: 'white', padding: '1.25rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: '500' }}>{title}</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#111827', margin: '0.1rem 0' }}>{value}</h3>
        </div>
        <div style={{ padding: '0.8rem', background: '#f3f4f6', borderRadius: '8px' }}>
            {icon}
        </div>
    </div>
);
