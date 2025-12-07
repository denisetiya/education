import React, { useState } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';

export const AdminUsers: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const users = [
        { id: 1, name: 'Budi Santoso', email: 'budi@example.com', role: 'Student', status: 'Active' },
        { id: 2, name: 'Siti Aminah', email: 'siti@example.com', role: 'Student', status: 'Active' },
        { id: 3, name: 'Pak Guru', email: 'guru@example.com', role: 'Teacher', status: 'Active' },
        { id: 4, name: 'Admin User', email: 'admin@geo.edu', role: 'Admin', status: 'Active' },
        { id: 5, name: 'Rudi Hermawan', email: 'rudi@example.com', role: 'Student', status: 'Inactive' },
    ];

    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111827' }}>User Management</h1>
                <button className="btn btn-primary" style={{ background: '#ef4444', border: 'none' }}>+ Add User</button>
            </div>

            <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.8rem', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.9rem' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f9fafb', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>User</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Role</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#111827' }}>{user.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{user.email}</div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ fontSize: '0.85rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', background: '#e5e7eb', fontWeight: '500' }}>{user.role}</span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        fontSize: '0.85rem', padding: '0.2rem 0.6rem', borderRadius: '1rem',
                                        background: user.status === 'Active' ? '#dcfce7' : '#fee2e2',
                                        color: user.status === 'Active' ? '#166534' : '#991b1b',
                                        fontWeight: '500'
                                    }}>
                                        {user.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                        <button style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #e5e7eb', cursor: 'pointer' }}><Edit size={16} color="#4b5563" /></button>
                                        <button style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #e5e7eb', cursor: 'pointer' }}><Trash2 size={16} color="#ef4444" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
