import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, X, Loader } from 'lucide-react';
import { usersAPI, getApiErrorMessage } from '../../utils/api';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    xp?: number;
    level?: number;
    createdAt: string;
}

export const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'STUDENT'
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await usersAPI.getAll();
            setUsers(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setError('Gagal memuat data user');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase())
            || u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = !roleFilter || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError(null);
            await usersAPI.create(formData);
            setShowAddModal(false);
            setSuccess('User berhasil dibuat');
            setFormData({ name: '', email: '', password: '', role: 'STUDENT' });
            fetchUsers();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(getApiErrorMessage(err, 'Gagal membuat user'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Hapus user "${name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
        try {
            await usersAPI.delete(id);
            setUsers(prev => prev.filter(u => u.id !== id));
            setSuccess('User berhasil dihapus');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(getApiErrorMessage(err, 'Gagal menghapus user'));
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'ADMIN': return { bg: '#fee2e2', color: '#991b1b', label: 'Admin' };
            case 'TEACHER': return { bg: '#e0e7ff', color: '#3730a3', label: 'Guru' };
            case 'STUDENT': return { bg: '#dcfce7', color: '#166534', label: 'Siswa' };
            default: return { bg: '#f3f4f6', color: '#374151', label: role };
        }
    };

    const stats = {
        total: users.length,
        teachers: users.filter(u => u.role === 'TEACHER').length,
        students: users.filter(u => u.role === 'STUDENT').length,
        admins: users.filter(u => u.role === 'ADMIN').length,
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111827' }}>User Management</h1>
                <button
                    className="btn btn-primary"
                    style={{ background: '#ef4444', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onClick={() => { setError(null); setShowAddModal(true); }}
                >
                    <Plus size={18} /> Add User
                </button>
            </div>

            {/* Notifications */}
            {success && (
                <div style={{ padding: '0.75rem 1rem', background: '#dcfce7', color: '#166534', borderRadius: '8px', fontWeight: '500', fontSize: '0.9rem' }}>
                    {success}
                </div>
            )}
            {error && (
                <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontWeight: '500', fontSize: '0.9rem' }}>
                    {error}
                </div>
            )}

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <MiniStat label="Total" value={stats.total} color="#111827" />
                <MiniStat label="Guru" value={stats.teachers} color="#3730a3" />
                <MiniStat label="Siswa" value={stats.students} color="#166534" />
                <MiniStat label="Admin" value={stats.admins} color="#991b1b" />
            </div>

            {/* Filters */}
            <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1rem 1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1 1 250px' }}>
                    <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Cari nama atau email..."
                        style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.8rem', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.9rem' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    style={{ padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.9rem', minWidth: '130px' }}
                >
                    <option value="">Semua Role</option>
                    <option value="STUDENT">Siswa</option>
                    <option value="TEACHER">Guru</option>
                    <option value="ADMIN">Admin</option>
                </select>
            </div>

            {/* Users Table */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <Loader className="animate-spin" size={40} style={{ color: '#ef4444' }} />
                </div>
            ) : (
                <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f9fafb', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>User</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Role</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>XP / Level</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Bergabung</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                                        Tidak ada user ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => {
                                    const roleStyle = getRoleBadge(user.role);
                                    return (
                                        <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: '600', color: '#111827' }}>{user.name}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{user.email}</div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    fontSize: '0.8rem',
                                                    padding: '0.2rem 0.7rem',
                                                    borderRadius: '1rem',
                                                    background: roleStyle.bg,
                                                    color: roleStyle.color,
                                                    fontWeight: '600'
                                                }}>
                                                    {roleStyle.label}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                                                <span style={{ color: '#8b5cf6', fontWeight: '600' }}>{user.xp || 0} XP</span>
                                                <span style={{ color: '#9ca3af', margin: '0 0.4rem' }}>/</span>
                                                <span style={{ color: '#3b82f6', fontWeight: '600' }}>Lv.{user.level || 1}</span>
                                            </td>
                                            <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.85rem' }}>
                                                {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                    <button
                                                        style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #e5e7eb', cursor: 'pointer', background: 'white' }}
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} color="#4b5563" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id, user.name)}
                                                        style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #e5e7eb', cursor: 'pointer', background: 'white' }}
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

            {/* Add User Modal */}
            {showAddModal && (
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
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '480px',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                        animation: 'fadeIn 0.2s ease-out'
                    }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#111827' }}>Tambah User Baru</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                style={{ padding: '0.3rem', borderRadius: '6px', border: 'none', background: '#f3f4f6', cursor: 'pointer', display: 'flex' }}
                            >
                                <X size={18} color="#6b7280" />
                            </button>
                        </div>

                        <form onSubmit={handleAddUser} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.35rem' }}>Nama Lengkap</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Nama user..."
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.35rem' }}>Email</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="email@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.35rem' }}>Password</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Minimal 8 karakter..."
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.35rem' }}>Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                                >
                                    <option value="STUDENT">Siswa</option>
                                    <option value="TEACHER">Guru</option>
                                </select>
                            </div>

                            {error && (
                                <div style={{ padding: '0.65rem 0.85rem', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontSize: '0.85rem' }}>
                                    {error}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowAddModal(false)}
                                    style={{ flex: 1 }}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting}
                                    style={{ flex: 1, background: '#ef4444', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                >
                                    {submitting ? <Loader className="animate-spin" size={18} /> : <Plus size={18} />}
                                    {submitting ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const MiniStat = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '800', color }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{label}</div>
    </div>
);
