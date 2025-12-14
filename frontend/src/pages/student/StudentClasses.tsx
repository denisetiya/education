import React, { useState, useEffect } from 'react';
import { UserPlus, BookOpen, Users } from 'lucide-react';
import { classesAPI } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

export const StudentClasses: React.FC = () => {
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [joinCode, setJoinCode] = useState('');
    const [joining, setJoining] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        try {
            const data = await classesAPI.getAll();
            setClasses(data);
        } catch (error) {
            console.error('Failed to fetch enrolled classes', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinCode) return;
        setJoining(true);
        try {
            await classesAPI.join(joinCode);
            alert('Berhasil bergabung ke kelas!');
            setJoinCode('');
            fetchEnrollments();
        } catch (error: any) {
            alert(error.message || 'Gagal bergabung ke kelas');
        } finally {
            setJoining(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header with Join Section */}
            <div className="animate-slide-up" style={{ 
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                padding: '3rem', 
                borderRadius: '1.5rem', 
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 20px 25px -5px rgba(99, 102, 241, 0.2)'
            }}>
                <div style={{ maxWidth: '500px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>Kelas Saya</h1>
                    <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Temukan materi pembelajaran, tugas, dan latihan dari gurumu di sini.</p>
                </div>

                <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', width: '350px' }}>
                    <h3 style={{ marginBottom: '1rem', fontWeight: '600' }}>Gabung Kelas Baru</h3>
                    <form onSubmit={handleJoinClass} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input 
                            type="text" 
                            placeholder="Masukkan Kode Kelas"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            style={{ 
                                flex: 1, 
                                padding: '0.8rem', 
                                borderRadius: '0.5rem', 
                                border: 'none', 
                                outline: 'none',
                                background: 'white',
                                color: '#1e293b',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                letterSpacing: '2px'
                            }}
                        />
                        <button 
                            type="submit" 
                            disabled={joining || !joinCode}
                            style={{ 
                                padding: '0.8rem', 
                                borderRadius: '0.5rem', 
                                border: 'none', 
                                background: '#10b981', 
                                color: 'white',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                fontWeight: 'bold'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            {joining ? '...' : <UserPlus size={24} />}
                        </button>
                    </form>
                </div>
            </div>

            {/* Enrolled Classes Grid */}
            <div style={{ marginTop: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#334155', marginBottom: '1.5rem' }}>Daftar Kelas</h2>
                
                {loading ? (
                    <div>Loading...</div>
                ) : classes.length === 0 ? (
                    <div className="card glass" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                         <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                         <p>Kamu belum bergabung dengan kelas manapun.</p>
                         <p style={{ fontSize: '0.9rem' }}>Minta kode kelas dari gurumu untuk mulai belajar.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {classes.map(cls => (
                            <div key={cls.id} className="card glass animate-slide-up" 
                                style={{ 
                                    padding: '0', 
                                    overflow: 'hidden', 
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                }}
                                onClick={() => navigate(`/student/classes/${cls.id}`)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{ height: '100px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '1.5rem', color: 'white' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cls.name}</h3>
                                    <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>{cls.subject}</p>
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                        <Users size={16} /> Guru: {cls.teacher?.name}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                                        <BookOpen size={16} /> {cls._count?.modules || 0} Modul Pembelajaran
                                    </div>
                                    <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', textAlign: 'right' }}>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '600' }}>Masuk Kelas →</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
