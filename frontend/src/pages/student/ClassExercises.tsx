import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronRight,
    Clock3,
    Loader2,
    PenTool,
    Sparkles,
    Target,
    Timer,
    Trophy
} from 'lucide-react';
import { getQuestionAnswerTypeSummary, parseExerciseQuestions } from '../../features/exercises/exercise-config';
import type { ClassExerciseSummary, ExerciseAttemptSummary } from '../../types/api.types';
import { classesAPI } from '../../utils/api';

interface ClassInfo {
    name: string;
}

const getLatestAttempt = (exercise: ClassExerciseSummary): ExerciseAttemptSummary | undefined => exercise.attempts?.[0];

const getStatusMeta = (attempt?: ExerciseAttemptSummary) => {
    if (!attempt) {
        return {
            label: 'Belum dikerjakan',
            background: '#eff6ff',
            color: '#1d4ed8',
            icon: <PenTool size={14} />
        };
    }

    if (attempt.gradingStatus === 'pending_review') {
        return {
            label: 'Menunggu review',
            background: '#fef3c7',
            color: '#92400e',
            icon: <Clock3 size={14} />
        };
    }

    if (attempt.isCorrect) {
        return {
            label: 'Tuntas',
            background: '#dcfce7',
            color: '#166534',
            icon: <Trophy size={14} />
        };
    }

    return {
        label: 'Sudah dinilai',
        background: '#fee2e2',
        color: '#b91c1c',
        icon: <Target size={14} />
    };
};

export const ClassExercises: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
    const [exercises, setExercises] = useState<ClassExerciseSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!classId) {
            return;
        }

        const loadData = async () => {
            try {
                setLoading(true);
                const [classData, exercisesData] = await Promise.all([
                    classesAPI.getById(classId),
                    classesAPI.getExercises(classId)
                ]);

                setClassInfo({ name: classData.name });
                setExercises(exercisesData);
            } catch (error) {
                console.error('Failed to fetch class exercises', error);
            } finally {
                setLoading(false);
            }
        };

        void loadData();
    }, [classId]);

    const summary = useMemo(() => {
        const totalPoints = exercises.reduce((sum, exercise) => sum + exercise.points, 0);
        const completedCount = exercises.filter((exercise) => Boolean(getLatestAttempt(exercise))).length;
        const pendingCount = exercises.filter((exercise) => getLatestAttempt(exercise)?.gradingStatus === 'pending_review').length;
        const earnedPoints = exercises.reduce((sum, exercise) => sum + (getLatestAttempt(exercise)?.score || 0), 0);

        return {
            totalPoints,
            completedCount,
            pendingCount,
            earnedPoints
        };
    }, [exercises]);

    const difficultyConfig: Record<string, { label: string; background: string; color: string }> = {
        easy: { label: 'Mudah', background: '#dcfce7', color: '#166534' },
        medium: { label: 'Sedang', background: '#fef3c7', color: '#92400e' },
        hard: { label: 'Sulit', background: '#fee2e2', color: '#b91c1c' }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={40} className="animate-spin" color="var(--primary)" />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
            <div
                className="card glass"
                style={{
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(99, 102, 241, 0.08))',
                    border: '1px solid rgba(99, 102, 241, 0.15)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div>
                        <p style={{ color: '#4338ca', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                            Pusat Latihan
                        </p>
                        <h1 style={{ fontSize: '1.9rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                            Latihan Interaktif
                        </h1>
                        <p style={{ color: '#475569' }}>
                            Pantau pengerjaan dan hasil latihan untuk kelas {classInfo?.name || '-'}.
                        </p>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', color: '#4338ca', fontWeight: '700' }}>
                        <Sparkles size={18} />
                        Progres otomatis tersimpan
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="card glass" style={{ padding: '1.25rem' }}>
                    <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '0.35rem' }}>Total latihan</p>
                    <p style={{ fontSize: '1.7rem', fontWeight: '800', color: '#0f172a' }}>{exercises.length}</p>
                </div>
                <div className="card glass" style={{ padding: '1.25rem' }}>
                    <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '0.35rem' }}>Sudah dikerjakan</p>
                    <p style={{ fontSize: '1.7rem', fontWeight: '800', color: '#0f172a' }}>{summary.completedCount}/{exercises.length}</p>
                </div>
                <div className="card glass" style={{ padding: '1.25rem' }}>
                    <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '0.35rem' }}>Menunggu review</p>
                    <p style={{ fontSize: '1.7rem', fontWeight: '800', color: '#92400e' }}>{summary.pendingCount}</p>
                </div>
                <div className="card glass" style={{ padding: '1.25rem' }}>
                    <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '0.35rem' }}>XP terkumpul</p>
                    <p style={{ fontSize: '1.7rem', fontWeight: '800', color: '#2563eb' }}>{summary.earnedPoints}/{summary.totalPoints}</p>
                </div>
            </div>

            {exercises.length === 0 ? (
                <div className="card glass" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    <PenTool size={48} style={{ marginBottom: '1rem', opacity: 0.6 }} />
                    <p style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                        Belum ada latihan interaktif
                    </p>
                    <p>Guru akan menambahkan latihan untuk kelas ini sebentar lagi.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
                    {exercises.map((exercise) => {
                        const attempt = getLatestAttempt(exercise);
                        const status = getStatusMeta(attempt);
                        const difficulty = difficultyConfig[exercise.difficulty] || difficultyConfig.medium;
                        const questions = parseExerciseQuestions(exercise);
                        const typeSummary = getQuestionAnswerTypeSummary(questions);

                        return (
                            <button
                                key={exercise.id}
                                onClick={() => navigate(`/student/class/${classId}/exercise/${exercise.id}`)}
                                className="card glass"
                                style={{
                                    padding: 0,
                                    overflow: 'hidden',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    border: '1px solid #e2e8f0',
                                    background: 'white'
                                }}
                            >
                                <div
                                    style={{
                                        height: '8px',
                                        background: `linear-gradient(90deg, ${difficulty.color}, #6366f1)`
                                    }}
                                />

                                <div style={{ padding: '1.35rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'flex-start' }}>
                                        <div>
                                            <h2 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>
                                                {exercise.title}
                                            </h2>
                                            {exercise.description && (
                                                <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: '0.88rem' }}>
                                                    {exercise.description}
                                                </p>
                                            )}
                                        </div>
                                        <span
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.35rem',
                                                padding: '0.35rem 0.6rem',
                                                borderRadius: '999px',
                                                background: status.background,
                                                color: status.color,
                                                fontSize: '0.74rem',
                                                fontWeight: '700',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {status.icon}
                                            {status.label}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                                        <span
                                            style={{
                                                padding: '0.35rem 0.6rem',
                                                borderRadius: '999px',
                                                background: difficulty.background,
                                                color: difficulty.color,
                                                fontWeight: '700',
                                                fontSize: '0.75rem'
                                            }}
                                        >
                                            {difficulty.label}
                                        </span>
                                        <span
                                            style={{
                                                padding: '0.35rem 0.6rem',
                                                borderRadius: '999px',
                                                background: '#eff6ff',
                                                color: '#1d4ed8',
                                                fontWeight: '700',
                                                fontSize: '0.75rem'
                                            }}
                                        >
                                            {exercise.points} XP
                                        </span>
                                        <span
                                            style={{
                                                padding: '0.35rem 0.6rem',
                                                borderRadius: '999px',
                                                background: '#f8fafc',
                                                color: '#475569',
                                                fontWeight: '700',
                                                fontSize: '0.75rem'
                                            }}
                                        >
                                            {questions.length} soal
                                        </span>
                                        {exercise.hasTimer && exercise.timerMinutes && (
                                            <span
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.35rem',
                                                    padding: '0.35rem 0.6rem',
                                                    borderRadius: '999px',
                                                    background: '#f8fafc',
                                                    color: '#475569',
                                                    fontWeight: '700',
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                <Timer size={12} />
                                                {exercise.timerMinutes} menit
                                            </span>
                                        )}
                                    </div>

                                    {typeSummary.length > 0 && (
                                        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginTop: '0.85rem' }}>
                                            {typeSummary.map((label) => (
                                                <span
                                                    key={`${exercise.id}-${label}`}
                                                    style={{
                                                        padding: '0.3rem 0.55rem',
                                                        borderRadius: '999px',
                                                        background: '#f8fafc',
                                                        color: '#475569',
                                                        fontSize: '0.72rem',
                                                        fontWeight: '700'
                                                    }}
                                                >
                                                    {label}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {attempt && (
                                        <div
                                            style={{
                                                marginTop: '1rem',
                                                padding: '0.9rem 1rem',
                                                borderRadius: '0.95rem',
                                                background: '#f8fafc',
                                                border: '1px solid #e2e8f0'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', color: '#475569', fontSize: '0.82rem' }}>
                                                <span>Skor terakhir</span>
                                                <strong style={{ color: '#0f172a' }}>{attempt.score}/{exercise.points}</strong>
                                            </div>
                                            <p style={{ marginTop: '0.4rem', color: '#64748b', fontSize: '0.78rem' }}>
                                                Dikirim {new Date(attempt.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </p>
                                        </div>
                                    )}

                                    <div
                                        style={{
                                            marginTop: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            color: '#475569',
                                            fontWeight: '700'
                                        }}
                                    >
                                        <span>{attempt ? 'Lihat detail hasil' : 'Mulai latihan'}</span>
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ClassExercises;
