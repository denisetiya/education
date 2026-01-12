import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PenTool, Zap, Loader, CheckCircle, Target, ChevronRight, Timer } from 'lucide-react';
import { classesAPI } from '../../utils/api';

interface Exercise {
    id: string;
    title: string;
    description?: string;
    difficulty: string;
    points: number;
    hasTimer: boolean;
    timerMinutes?: number;
    exerciseType: string;
    attempts?: Array<{
        isCorrect: boolean;
        score: number;
        createdAt: string;
    }>;
}

export const ClassExercises: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [className, setClassName] = useState('');

    useEffect(() => {
        if (classId) {
            fetchData();
        }
    }, [classId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch both class info and exercises
            const [classData, exercisesData] = await Promise.all([
                classesAPI.getById(classId!),
                classesAPI.getExercises(classId!)
            ]);
            setClassName(classData.name);
            setExercises(exercisesData);
        } catch (err) {
            console.error('Failed to fetch exercises', err);
        } finally {
            setLoading(false);
        }
    };

    const difficultyConfig: Record<string, { text: string; color: string; bg: string }> = {
        easy: { text: 'Mudah', color: '#22c55e', bg: '#dcfce7' },
        medium: { text: 'Sedang', color: '#f59e0b', bg: '#fef3c7' },
        hard: { text: 'Sulit', color: '#ef4444', bg: '#fee2e2' }
    };

    const totalPoints = exercises.reduce((sum, ex) => sum + ex.points, 0);
    const completedCount = exercises.filter(ex => ex.attempts && ex.attempts.length > 0).length;
    const earnedPoints = exercises
        .filter(ex => ex.attempts && ex.attempts.length > 0 && ex.attempts[0].isCorrect)
        .reduce((sum, ex) => sum + ex.points, 0);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader className="animate-spin" size={48} style={{ color: 'var(--primary)' }} />
            </div>
        );
    }

    return (
        <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>
                    📐 Latihan Interaktif
                </h1>
                <p style={{ color: '#64748b' }}>Kelas: {className}</p>
            </div>

            {/* Stats */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '1rem', 
                marginBottom: '2rem' 
            }}>
                <div className="card glass" style={{ padding: '1.25rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>
                        {exercises.length}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Total Latihan</div>
                </div>
                <div className="card glass" style={{ padding: '1.25rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#22c55e' }}>
                        {completedCount}/{exercises.length}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Selesai</div>
                </div>
                <div className="card glass" style={{ padding: '1.25rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f59e0b' }}>
                        {earnedPoints}/{totalPoints}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>XP Terkumpul</div>
                </div>
            </div>

            {exercises.length === 0 ? (
                <div className="card glass" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    <PenTool size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>Belum ada latihan interaktif di kelas ini.</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Guru akan menambahkan latihan sebentar lagi.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                    {exercises.map((exercise) => {
                        const difficulty = difficultyConfig[exercise.difficulty] || difficultyConfig.medium;
                        const isCompleted = exercise.attempts && exercise.attempts.length > 0;
                        const isCorrect = isCompleted && exercise.attempts![0].isCorrect;

                        return (
                            <div
                                key={exercise.id}
                                className="card glass"
                                style={{
                                    padding: 0,
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    opacity: isCompleted ? 0.85 : 1,
                                    position: 'relative'
                                }}
                                onClick={() => navigate(`/student/class/${classId}/exercise/${exercise.id}`)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.12)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '';
                                }}
                            >
                                {/* Completed Badge */}
                                {isCompleted && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
                                        background: isCorrect ? '#22c55e' : '#94a3b8',
                                        color: 'white',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        zIndex: 10
                                    }}>
                                        <CheckCircle size={14} />
                                        {isCorrect ? 'Benar' : 'Selesai'}
                                    </div>
                                )}

                                {/* Header gradient */}
                                <div style={{
                                    height: '8px',
                                    background: `linear-gradient(90deg, ${difficulty.color}, ${difficulty.color}99)`
                                }} />

                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                        <div style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: '1rem',
                                            background: isCompleted 
                                                ? (isCorrect ? 'linear-gradient(135deg, #22c55e, #16a34a)' : '#94a3b8')
                                                : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            {isCompleted ? (
                                                <CheckCircle size={28} color="white" />
                                            ) : (
                                                <PenTool size={28} color="white" />
                                            )}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 style={{ 
                                                fontWeight: '700', 
                                                color: '#334155', 
                                                marginBottom: '0.25rem',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {exercise.title}
                                            </h3>
                                            {exercise.description && (
                                                <p style={{ 
                                                    fontSize: '0.85rem', 
                                                    color: '#64748b',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    {exercise.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Meta info */}
                                    <div style={{
                                        marginTop: '1.25rem',
                                        paddingTop: '1rem',
                                        borderTop: '1px solid #f1f5f9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            {/* Difficulty */}
                                            <span style={{ 
                                                fontSize: '0.75rem', 
                                                padding: '0.25rem 0.5rem', 
                                                background: difficulty.bg, 
                                                color: difficulty.color,
                                                borderRadius: '0.5rem',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem'
                                            }}>
                                                <Target size={12} />
                                                {difficulty.text}
                                            </span>
                                            
                                            {/* Points */}
                                            <span style={{ 
                                                fontSize: '0.85rem', 
                                                color: '#f59e0b', 
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem'
                                            }}>
                                                <Zap size={14} />
                                                {exercise.points} XP
                                            </span>

                                            {/* Timer */}
                                            {exercise.hasTimer && exercise.timerMinutes && (
                                                <span style={{ 
                                                    fontSize: '0.85rem', 
                                                    color: '#64748b',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                                }}>
                                                    <Timer size={14} />
                                                    {exercise.timerMinutes}m
                                                </span>
                                            )}
                                        </div>

                                        {/* Arrow */}
                                        <ChevronRight size={20} color="#94a3b8" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ClassExercises;
