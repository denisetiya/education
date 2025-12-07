import React from 'react';
import { Play, Clock, Star, History, ChevronRight, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentPracticeHub: React.FC = () => {
    // Mock Data for Available Practice Sets
    const practiceSets = [
        {
            id: 'geo-101',
            title: "Geometri Dasar",
            description: "Putaran sudut, bangun datar, dan simetri.",
            difficulty: "Medium",
            questions: 10,
            xp: 500,
            color: 'var(--primary)',
            icon: '📐'
        },
        {
            id: 'alg-101',
            title: "Aljabar Linear",
            description: "Persamaan satu variabel dan logika matematika.",
            difficulty: "Hard",
            questions: 15,
            xp: 750,
            color: 'var(--secondary)',
            icon: 'x²'
        },
        {
            id: 'bio-101',
            title: "Sistem Tata Surya",
            description: "Planet, rotasi bumi, dan fenomena alam.",
            difficulty: "Easy",
            questions: 8,
            xp: 300,
            color: 'var(--success)',
            icon: '🪐'
        }
    ];

    // Mock Data for History
    const history = [
        {
            id: 1,
            title: "Geometri Dasar",
            date: "7 Des 2025",
            score: 200,
            maxScore: 400,
            grade: "B"
        },
        {
            id: 2,
            title: "Logika Dasar",
            date: "6 Des 2025",
            score: 100,
            maxScore: 100,
            grade: "A+"
        }
    ];

    return (
        <div className="container animate-fade-in" style={{ paddingBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Star className="text-gradient" fill="var(--warning)" color="var(--warning)" />
                Zona Latihan
            </h1>

            {/* Main Sections Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                {/* Left Column: Available Exercises */}
                <div style={{ flex: 2 }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-muted)' }}>Materi Tersedia</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {practiceSets.map((set) => (
                            <div key={set.id} className="card glass" style={{
                                display: 'flex',
                                gap: '1.5rem',
                                alignItems: 'center',
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                                padding: '1.5rem'
                            }}>
                                <div style={{
                                    width: '60px', height: '60px',
                                    borderRadius: '1rem',
                                    background: `${set.color}20`,
                                    color: set.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.5rem', fontWeight: 'bold'
                                }}>
                                    {set.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{set.title}</h3>
                                        <span style={{
                                            fontSize: '0.75rem', fontWeight: '700',
                                            padding: '0.2rem 0.6rem', borderRadius: '1rem',
                                            background: set.difficulty === 'Hard' ? '#fee2e2' : set.difficulty === 'Medium' ? '#ffedd5' : '#dcfce7',
                                            color: set.difficulty === 'Hard' ? 'var(--error)' : set.difficulty === 'Medium' ? 'var(--warning)' : 'var(--success)'
                                        }}>
                                            {set.difficulty}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{set.description}</p>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> {set.questions} Soal</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--warning)', fontWeight: '600' }}><Award size={14} /> +{set.xp} XP</span>
                                    </div>
                                </div>
                                <Link to={`/student/practice/${set.id}`} className="btn btn-primary" style={{ padding: '0.8rem', borderRadius: '50%' }}>
                                    <Play size={20} fill="currentColor" style={{ marginLeft: '2px' }} />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: History & Stats */}
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-muted)' }}>Riwayat Latihan</h2>
                    <div className="card glass" style={{ padding: '0' }}>
                        {history.map((item, idx) => (
                            <div key={item.id} style={{
                                padding: '1.2rem',
                                borderBottom: idx !== history.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                                display: 'flex', alignItems: 'center', gap: '1rem'
                            }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', color: 'var(--text-muted)'
                                }}>
                                    {item.grade}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600' }}>{item.title}</h4>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.date}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{item.score}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PTS</div>
                                </div>
                            </div>
                        ))}
                        <button className="btn" style={{ width: '100%', borderTop: '1px solid rgba(0,0,0,0.05)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', color: 'var(--primary)', fontSize: '0.9rem' }}>
                            Lihat Semua <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Quick Daily Challenge Card */}
                    <div className="card" style={{ marginTop: '2rem', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', opacity: 0.9 }}>
                            <History size={18} /> Tantangan Harian
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>Kuis Cepat 5 Menit</h3>
                        <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '1.5rem' }}>Selesaikan 5 soal acak untuk bonus XP!</p>
                        <button className="btn" style={{ width: '100%', background: 'white', color: 'var(--success)' }}>
                            Mulai Sekarang
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
