import React, { useState, useEffect } from 'react';
import { Play, Clock, Star, History, ChevronRight, Award, Trophy, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { materialsAPI } from '../../utils/api';

interface QuizMaterial {
    id: string;
    title: string;
    description?: string;
    type: string;
    category: string;
    level: string;
    questions?: unknown[];
    settings?: unknown;
    xp?: number;
    grade: number;
    content?: string | null;
}

const StudentPracticeHub: React.FC = () => {
    const [quizzes, setQuizzes] = useState<QuizMaterial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                // Fetch only quizzes
                const data = await materialsAPI.getAll({ type: 'quiz' });
                setQuizzes(data);
            } catch (error) {
                console.error("Failed to fetch quizzes", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, []);

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'MATEMATIKA': 'var(--primary)',
            'IPA': '#16a34a',
            'IPS': '#d97706',
            'BAHASA_INDONESIA': '#dc2626',
            'BAHASA_INGGRIS': '#2563eb',
            'SENI': '#9333ea',
            'OLAHRAGA': '#0891b2',
        };
        return colors[category] || 'var(--accent)';
    };

    // Helper to get quiz details from content string
    const getQuizDetails = (material: QuizMaterial) => {
        let questionCount = 0;
        let timeLimit = 0;
        try {
            const content = JSON.parse(material.content || '{}');
            if (content.questions) questionCount = content.questions.length;
            if (content.settings?.timeLimitSeconds) timeLimit = content.settings.timeLimitSeconds;
        } catch {
            // Content might be purely string or invalid JSON
        }
        return { questionCount, timeLimit };
    };

    // Mock Data for History - kept static for now as requested we focus on separating list
    const history = [
        {
            id: 1,
            title: "Geometri Dasar",
            date: "7 Des 2025",
            score: 200,
            maxScore: 400,
            grade: "B"
        }
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader className="animate-spin" size={40} style={{ color: 'var(--primary)' }} />
            </div>
        );
    }

    return (
        <div className="container animate-fade-in" style={{ paddingBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Star className="text-gradient" fill="var(--warning)" color="var(--warning)" />
                Zona Latihan & Kuis
            </h1>

            {/* Main Sections Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                {/* Left Column: Available Exercises */}
                <div style={{ flex: 2 }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-muted)' }}>Materi Latihan Tersedia</h2>
                    
                    {quizzes.length === 0 ? (
                        <div className="card glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Trophy size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                            <p>Belum ada kuis yang tersedia saat ini.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {quizzes.map((quiz) => {
                                const { questionCount, timeLimit } = getQuizDetails(quiz);
                                const color = getCategoryColor(quiz.category);
                                
                                return (
                                    <div key={quiz.id} className="card glass" style={{
                                        display: 'flex',
                                        gap: '1.5rem',
                                        alignItems: 'center',
                                        transition: 'all 0.2s',
                                        cursor: 'pointer',
                                        padding: '1.5rem',
                                        borderLeft: `4px solid ${color}`
                                    }}>
                                        <div style={{
                                            width: '60px', height: '60px',
                                            borderRadius: '1rem',
                                            background: `${color}20`,
                                            color: color,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.5rem', fontWeight: 'bold'
                                        }}>
                                            <Award size={24} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{quiz.title}</h3>
                                                <span style={{
                                                    fontSize: '0.75rem', fontWeight: '700',
                                                    padding: '0.2rem 0.6rem', borderRadius: '1rem',
                                                    background: quiz.level === 'Sulit' ? '#fee2e2' : quiz.level === 'Sedang' ? '#ffedd5' : '#dcfce7',
                                                    color: quiz.level === 'Sulit' ? 'var(--error)' : quiz.level === 'Sedang' ? 'var(--warning)' : 'var(--success)'
                                                }}>
                                                    {quiz.level}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                                {quiz.category.replace('_', ' ')} • Kelas {quiz.grade}
                                            </p>
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> {timeLimit > 0 ? `${Math.floor(timeLimit/60)} Menit` : 'Tanpa Waktu'}</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <Trophy size={14} /> {questionCount} Soal
                                                </span>
                                            </div>
                                        </div>
                                        <Link to={`/student/materials/${quiz.id}`} className="btn btn-primary" style={{ padding: '0.8rem', borderRadius: '50%' }}>
                                            <Play size={20} fill="currentColor" style={{ marginLeft: '2px' }} />
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    )}
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

export default StudentPracticeHub;
