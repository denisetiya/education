import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Compass, Sparkles, GraduationCap, ArrowRight, Search, Clock, Zap, LogOut } from 'lucide-react';
import { classesAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

interface EnrolledClass {
    id: string;
    name: string;
    subject: string;
    description?: string;
    thumbnail?: string;
    progressionMode: string;
    teacher?: { name: string };
    _count?: { modules: number; students: number };
}

export const ClassSelection: React.FC = () => {
    const [classes, setClasses] = useState<EnrolledClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => {
        fetchEnrolledClasses();
    }, []);

    const fetchEnrolledClasses = async () => {
        try {
            const data = await classesAPI.getAll();
            setClasses(data);
        } catch (error) {
            console.error('Failed to fetch classes', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectClass = (classId: string) => {
        navigate(`/student/class/${classId}`);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const gradients = [
        'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)', // Indigo
        'linear-gradient(135deg, #34d399 0%, #10b981 100%)', // Emerald
        'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', // Amber
        'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)', // Pink
        'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)', // Blue
        'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)', // Violet
    ];

    const getGradient = (index: number) => gradients[index % gradients.length];

    const getSubjectEmoji = (subject: string) => {
        const map: Record<string, string> = {
            'matematika': '📐', 'geometri': '📐', 'math': '➗',
            'fisika': '⚛️', 'kimia': '🧪', 'biologi': '🧬',
            'bahasa': '📝', 'sejarah': '📜', 'geografi': '🌍',
            'seni': '🎨', 'musik': '🎵', 'olahraga': '⚽',
            'komputer': '💻', 'coding': '👨‍💻'
        };
        const key = subject.toLowerCase();
        for (const [k, v] of Object.entries(map)) {
            if (key.includes(k)) return v;
        }
        return '📚';
    };

    const filteredClasses = classes.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-gradient)'
            }}>
                <div className="animate-pulse" style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    boxShadow: 'var(--shadow-lg)'
                }}>
                    <GraduationCap size={30} color="white" />
                </div>
                <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Memuat kelas...</p>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            padding: '2rem',
            background: 'var(--bg-gradient)'
        }}>
            {/* Background Decoration */}
            <div style={{
                position: 'fixed',
                top: '-10%',
                right: '-5%',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
                borderRadius: '50%',
                zIndex: 0,
                pointerEvents: 'none'
            }} />

            <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                
                {/* Header Section */}
                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
                        <div>
                            <div style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '0.5rem', 
                                background: 'white', 
                                padding: '0.5rem 1rem', 
                                borderRadius: '2rem', 
                                border: '1px solid #e2e8f0',
                                marginBottom: '1rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}>
                                <Sparkles size={16} className="text-primary" />
                                <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>
                                    Selamat datang kembali, <span style={{ color: '#334155', fontWeight: '700' }}>{user?.name?.split(' ')[0]}</span>!
                                </span>
                            </div>
                            <h1 style={{ 
                                fontSize: '2.5rem', 
                                fontWeight: '800', 
                                color: '#1e293b', 
                                letterSpacing: '-0.02em',
                                lineHeight: 1.2
                            }}>
                                Kelas Saya
                            </h1>
                            <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                                Lanjutkan pembelajaran di kelas yang aktif
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input 
                                    type="text" 
                                    placeholder="Cari kelas..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        padding: '0.75rem 1rem 0.75rem 3rem',
                                        borderRadius: '1rem',
                                        border: '1px solid #e2e8f0',
                                        width: '240px',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'var(--primary)';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                                    }}
                                />
                            </div>
                            <button
                                onClick={() => navigate('/student/discover')}
                                className="btn btn-primary"
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
                                }}
                            >
                                <Compass size={20} />
                                Jelajahi
                            </button>
                            
                            <button
                                onClick={handleLogout}
                                
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    background: 'white',
                                    border: '1px solid #e2e8f0',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                title="Keluar"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                {classes.length === 0 ? (
                    <div className="glass-panel" style={{ 
                        padding: '4rem 2rem', 
                        textAlign: 'center', 
                        borderRadius: '2rem',
                        maxWidth: '600px',
                        margin: '2rem auto',
                        border: '1px solid rgba(255,255,255,0.8)'
                    }}>
                        <div style={{ 
                            width: '120px', 
                            height: '120px', 
                            borderRadius: '50%', // Replaced "circle" with "50%" for valid CSS
                            background: '#eff6ff', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem'
                        }}>
                            <BookOpen size={48} className="text-primary" />
                        </div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b', marginBottom: '1rem' }}>
                            Mulai Perjalanan Belajarmu
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2rem' }}>
                            Kamu belum bergabung dengan kelas manapun. Yuk pelajari hal baru hari ini!
                        </p>
                        <button
                            onClick={() => navigate('/student/discover')}
                            className="btn btn-primary"
                            style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '1rem' }}
                        >
                            <Compass size={22} style={{ marginRight: '0.5rem' }} /> Temukan Kelas
                        </button>
                    </div>
                ) : filteredClasses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                        <Search size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p style={{ fontSize: '1.1rem' }}>Tidak menemukan kelas dengan kata kunci "{searchTerm}"</p>
                    </div>
                ) : (
                    /* Classes Grid */
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                        {filteredClasses.map((cls, index) => (
                            <div
                                key={cls.id}
                                onClick={() => handleSelectClass(cls.id)}
                                onMouseEnter={() => setHoveredCard(cls.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                                style={{
                                    background: 'white',
                                    borderRadius: '1.5rem',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    border: '1px solid #f1f5f9',
                                    transform: hoveredCard === cls.id ? 'translateY(-8px)' : 'translateY(0)',
                                    boxShadow: hoveredCard === cls.id 
                                        ? '0 20px 40px -12px rgba(0, 0, 0, 0.12), 0 0 20px rgba(99, 102, 241, 0.1)' 
                                        : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
                                }}
                            >
                                {/* Card Banner */}
                                <div style={{
                                    height: '160px',
                                    background: cls.thumbnail ? `url(${cls.thumbnail}) center/cover` : getGradient(index),
                                    position: 'relative',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}>
                                    <div style={{ 
                                        position: 'absolute', 
                                        inset: 0, 
                                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4))' 
                                    }} />
                                    
                                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <span style={{ 
                                            background: 'rgba(255, 255, 255, 0.95)', 
                                            backdropFilter: 'blur(4px)',
                                            padding: '0.35rem 0.85rem', 
                                            borderRadius: '2rem', 
                                            fontSize: '0.8rem', 
                                            fontWeight: '600',
                                            color: '#475569',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}>
                                            {getSubjectEmoji(cls.subject)} {cls.subject}
                                        </span>
                                        
                                        {cls.progressionMode === 'sequential' && (
                                            <div title="Mode Bertahap" style={{ 
                                                background: 'rgba(0,0,0,0.4)', 
                                                padding: '0.35rem', 
                                                borderRadius: '50%', 
                                                backdropFilter: 'blur(4px)',
                                                color: '#fbbf24'
                                            }}>
                                                <Zap size={16} fill="currentColor" />
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <h3 style={{ 
                                            fontSize: '1.5rem', 
                                            fontWeight: '800', 
                                            color: 'white', 
                                            marginBottom: '0.25rem',
                                            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }}>
                                            {cls.name}
                                        </h3>
                                        {cls.teacher && (
                                            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                <Users size={14} />
                                                {cls.teacher.name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Card Content */}
                                <div style={{ padding: '1.5rem' }}>
                                    
                                    {/* Stats Row */}
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div style={{ 
                                            flex: 1, 
                                            background: '#f8fafc', 
                                            padding: '0.75rem', 
                                            borderRadius: '1rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            border: '1px solid #f1f5f9'
                                        }}>
                                            <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#334155' }}>{cls._count?.modules || 0}</span>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Modul</span>
                                        </div>
                                        <div style={{ 
                                            flex: 1, 
                                            background: '#f8fafc', 
                                            padding: '0.75rem', 
                                            borderRadius: '1rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            border: '1px solid #f1f5f9'
                                        }}>
                                            <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#334155' }}>{cls._count?.students || 1}</span>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Siswa</span>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                                            <Clock size={16} />
                                            <span>Aktif</span>
                                        </div>
                                        <button style={{
                                            background: 'transparent',
                                            color: 'var(--primary)',
                                            border: 'none',
                                            fontWeight: '600',
                                            fontSize: '0.95rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            cursor: 'pointer',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '0.5rem',
                                            transition: 'background 0.2s'
                                        }}
                                        className="hover:bg-indigo-50"
                                        >
                                            Masuk Kelas <ArrowRight size={18} />
                                        </button>
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
