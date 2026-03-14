import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle,
    Clock3,
    Loader2,
    Send,
    Timer,
    Trophy,
    XCircle
} from 'lucide-react';
import type { CanvasState } from '../../components/geometry/types';
import GeometryCanvas, { type GeometryCanvasHandle } from '../../components/geometry/GeometryCanvas';
import type {
    ClassExerciseSummary,
    ExerciseAttemptSummary,
    ExerciseGradingStatus
} from '../../types/api.types';
import { classesAPI } from '../../utils/api';

interface ExerciseOption {
    id: string;
    text: string;
}

interface ExerciseResult {
    gradingStatus: ExerciseGradingStatus;
    isCorrect: boolean | null;
    score: number;
    message: string;
    feedback?: string | null;
    gradedAt?: string | null;
}

const parseCanvasState = (value?: string | null): CanvasState | undefined => {
    if (!value) {
        return undefined;
    }

    try {
        return JSON.parse(value) as CanvasState;
    } catch (error) {
        console.error('Failed to parse canvas state', error);
        return undefined;
    }
};

const parseOptions = (value?: string | null): ExerciseOption[] => {
    if (!value) {
        return [];
    }

    try {
        const parsed = JSON.parse(value) as ExerciseOption[];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Failed to parse exercise options', error);
        return [];
    }
};

const buildResultFromAttempt = (attempt: ExerciseAttemptSummary): ExerciseResult => {
    if (attempt.gradingStatus === 'pending_review') {
        return {
            gradingStatus: 'pending_review',
            isCorrect: null,
            score: attempt.score,
            message: 'Jawaban kamu sudah terkirim dan sedang menunggu penilaian guru.',
            feedback: attempt.feedback,
            gradedAt: attempt.gradedAt
        };
    }

    if (attempt.isCorrect) {
        return {
            gradingStatus: 'graded',
            isCorrect: true,
            score: attempt.score,
            message: 'Jawaban kamu dinilai benar. Kerja bagus.',
            feedback: attempt.feedback,
            gradedAt: attempt.gradedAt
        };
    }

    return {
        gradingStatus: 'graded',
        isCorrect: false,
        score: attempt.score,
        message: 'Jawaban kamu sudah dinilai. Lihat feedback guru untuk perbaikan.',
        feedback: attempt.feedback,
        gradedAt: attempt.gradedAt
    };
};

const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const ExerciseSession: React.FC = () => {
    const { classId, exerciseId } = useParams<{ classId: string; exerciseId: string }>();
    const navigate = useNavigate();
    const [exercise, setExercise] = useState<ClassExerciseSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [numericAnswer, setNumericAnswer] = useState('');
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [result, setResult] = useState<ExerciseResult | null>(null);
    const [alreadyAttempted, setAlreadyAttempted] = useState(false);
    const startTimeRef = useRef(Date.now());
    const canvasRef = useRef<GeometryCanvasHandle | null>(null);

    useEffect(() => {
        if (!classId || !exerciseId) {
            return;
        }

        const loadExercise = async () => {
            try {
                setLoading(true);
                const data = await classesAPI.getExercise(classId, exerciseId);
                setExercise(data);

                const latestAttempt = data.attempts?.[0];
                if (latestAttempt) {
                    setAlreadyAttempted(true);
                    setResult(buildResultFromAttempt(latestAttempt));
                }
            } catch (error) {
                console.error('Failed to fetch exercise', error);
            } finally {
                setLoading(false);
            }
        };

        void loadExercise();
    }, [classId, exerciseId]);

    useEffect(() => {
        if (exercise?.hasTimer && exercise.timerMinutes && timeRemaining === null && !alreadyAttempted) {
            setTimeRemaining(exercise.timerMinutes * 60);
        }
    }, [exercise, timeRemaining, alreadyAttempted]);

    useEffect(() => {
        if (timeRemaining === null || timeRemaining <= 0 || result || submitting) {
            return;
        }

        const interval = window.setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev === null) {
                    return prev;
                }

                return prev > 0 ? prev - 1 : 0;
            });
        }, 1000);

        return () => window.clearInterval(interval);
    }, [timeRemaining, result, submitting]);

    useEffect(() => {
        if (timeRemaining === 0 && !result && !submitting && !alreadyAttempted) {
            void handleSubmit();
        }
    }, [timeRemaining, result, submitting, alreadyAttempted]);

    const options = useMemo(() => parseOptions(exercise?.options), [exercise?.options]);
    const promptCanvasState = useMemo(() => parseCanvasState(exercise?.canvasState), [exercise?.canvasState]);

    const handleSubmit = async () => {
        if (!exercise || !classId || !exerciseId || alreadyAttempted) {
            return;
        }

        let answer: string | undefined;
        if (exercise.answerType === 'multiple_choice') {
            answer = selectedAnswer;
        } else if (exercise.answerType === 'numeric') {
            answer = numericAnswer;
        } else if (exercise.answerType === 'canvas') {
            answer = 'canvas_submission';
        }

        if (!answer && exercise.answerType !== 'canvas') {
            alert('Pilih atau isi jawaban terlebih dahulu.');
            return;
        }

        try {
            setSubmitting(true);
            const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
            const currentCanvasState = canvasRef.current?.getState?.();
            const response = await classesAPI.submitExerciseAttempt(classId, exerciseId, {
                answer,
                canvasData: currentCanvasState ? JSON.stringify(currentCanvasState) : undefined,
                timeSpent
            });

            setAlreadyAttempted(true);
            setResult({
                gradingStatus: response.gradingStatus,
                isCorrect: response.isCorrect,
                score: response.score,
                message: response.message,
                feedback: response.attempt.feedback,
                gradedAt: response.attempt.gradedAt
            });
        } catch (error: unknown) {
            console.error('Failed to submit attempt', error);
            if (error instanceof Error && error.message.includes('Already attempted')) {
                setAlreadyAttempted(true);
                alert('Latihan ini sudah pernah kamu kirim.');
                return;
            }

            alert('Gagal mengirim jawaban.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={42} className="animate-spin" color="var(--primary)" />
            </div>
        );
    }

    if (!exercise) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div className="card glass" style={{ padding: '2rem', textAlign: 'center', maxWidth: '420px' }}>
                    <AlertCircle size={42} color="#ef4444" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
                        Latihan tidak ditemukan
                    </h2>
                    <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                        Coba kembali ke daftar latihan kelas.
                    </p>
                    <button className="btn btn-primary" onClick={() => navigate(`/student/class/${classId}/exercises`)}>
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    const difficultyConfig: Record<string, { label: string; background: string; color: string }> = {
        easy: { label: 'Mudah', background: '#dcfce7', color: '#166534' },
        medium: { label: 'Sedang', background: '#fef3c7', color: '#92400e' },
        hard: { label: 'Sulit', background: '#fee2e2', color: '#b91c1c' }
    };
    const difficulty = difficultyConfig[exercise.difficulty] || difficultyConfig.medium;

    const resultMeta = result?.gradingStatus === 'pending_review'
        ? {
            background: 'linear-gradient(135deg, #0f766e, #0ea5e9)',
            icon: <Clock3 size={42} />,
            title: 'Menunggu Penilaian'
        }
        : result?.isCorrect
            ? {
                background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                icon: <Trophy size={42} />,
                title: 'Jawaban Tuntas'
            }
            : result
                ? {
                    background: 'linear-gradient(135deg, #dc2626, #f97316)',
                    icon: <XCircle size={42} />,
                    title: 'Sudah Dinilai'
                }
                : null;

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)' }}>
            <header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 20,
                    borderBottom: '1px solid #e2e8f0',
                    background: 'rgba(255, 255, 255, 0.88)',
                    backdropFilter: 'blur(14px)'
                }}
            >
                <div
                    style={{
                        maxWidth: '1200px',
                        margin: '0 auto',
                        padding: '1rem 1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                        flexWrap: 'wrap'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => navigate(`/student/class/${classId}/exercises`)}
                            style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '999px',
                                border: '1px solid #e2e8f0',
                                background: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.3rem' }}>
                                {exercise.title}
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                                <span
                                    style={{
                                        padding: '0.3rem 0.65rem',
                                        borderRadius: '999px',
                                        background: difficulty.background,
                                        color: difficulty.color,
                                        fontWeight: '700',
                                        fontSize: '0.78rem'
                                    }}
                                >
                                    {difficulty.label}
                                </span>
                                <span style={{ color: '#475569', fontSize: '0.88rem', fontWeight: '600' }}>
                                    {exercise.points} XP
                                </span>
                            </div>
                        </div>
                    </div>

                    {exercise.hasTimer && timeRemaining !== null && !result && (
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.55rem',
                                padding: '0.75rem 1rem',
                                borderRadius: '999px',
                                background: timeRemaining < 60 ? '#fee2e2' : '#eff6ff',
                                color: timeRemaining < 60 ? '#b91c1c' : '#1d4ed8',
                                fontWeight: '800'
                            }}
                        >
                            <Timer size={18} />
                            <span style={{ fontFamily: 'monospace', fontSize: '1rem' }}>{formatTime(timeRemaining)}</span>
                        </div>
                    )}
                </div>
            </header>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
                {result && resultMeta && (
                    <div
                        style={{
                            marginBottom: '1.5rem',
                            padding: '1.4rem 1.5rem',
                            borderRadius: '1.25rem',
                            color: 'white',
                            background: resultMeta.background,
                            boxShadow: '0 20px 45px rgba(15, 23, 42, 0.14)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {resultMeta.icon}
                                <div>
                                    <h2 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '0.35rem' }}>
                                        {resultMeta.title}
                                    </h2>
                                    <p style={{ opacity: 0.92, lineHeight: 1.6 }}>{result.message}</p>
                                    {result.feedback && (
                                        <p style={{ marginTop: '0.75rem', opacity: 0.95 }}>
                                            Feedback guru: {result.feedback}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div
                                style={{
                                    minWidth: '180px',
                                    padding: '1rem 1.1rem',
                                    borderRadius: '1rem',
                                    background: 'rgba(255, 255, 255, 0.14)',
                                    alignSelf: 'flex-start'
                                }}
                            >
                                <p style={{ fontSize: '0.8rem', opacity: 0.85, marginBottom: '0.35rem' }}>
                                    {result.gradingStatus === 'pending_review' ? 'Status' : 'Skor'}
                                </p>
                                <p style={{ fontSize: '1.7rem', fontWeight: '800' }}>
                                    {result.gradingStatus === 'pending_review' ? 'Pending' : `${result.score}/${exercise.points}`}
                                </p>
                                {result.gradedAt && (
                                    <p style={{ marginTop: '0.45rem', fontSize: '0.75rem', opacity: 0.85 }}>
                                        Dinilai {new Date(result.gradedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1.25rem' }}>
                    {(exercise.instructions || exercise.description) && (
                        <div className="card glass" style={{ padding: '1.5rem' }}>
                            <h2 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem' }}>
                                Petunjuk
                            </h2>
                            <p style={{ color: '#475569', lineHeight: 1.7 }}>
                                {exercise.instructions || exercise.description}
                            </p>
                        </div>
                    )}

                    {promptCanvasState && (
                        <div className="card glass" style={{ padding: '1.5rem' }}>
                            <h2 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>
                                Area Visual Soal
                            </h2>
                            <div style={{ borderRadius: '1rem', overflow: 'hidden', border: '1px solid #e2e8f0', background: 'white' }}>
                                <GeometryCanvas
                                    ref={exercise.canvasMode === 'interactive' && !result ? canvasRef : undefined}
                                    width={900}
                                    height={460}
                                    initialState={promptCanvasState}
                                />
                            </div>
                            {exercise.canvasMode === 'interactive' && !result && (
                                <p style={{ marginTop: '0.85rem', fontSize: '0.88rem', color: '#64748b' }}>
                                    Kamu bisa menggambar langsung di canvas bila latihan meminta jawaban visual.
                                </p>
                            )}
                        </div>
                    )}

                    {!result && (
                        <div className="card glass" style={{ padding: '1.5rem' }}>
                            <h2 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>
                                Jawaban Kamu
                            </h2>

                            {exercise.answerType === 'multiple_choice' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {options.map((option, index) => (
                                        <button
                                            key={option.id}
                                            onClick={() => setSelectedAnswer(option.id)}
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.85rem',
                                                padding: '1rem 1.1rem',
                                                borderRadius: '1rem',
                                                border: selectedAnswer === option.id ? '2px solid #6366f1' : '1px solid #e2e8f0',
                                                background: selectedAnswer === option.id ? '#eef2ff' : 'white',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width: '34px',
                                                    height: '34px',
                                                    borderRadius: '999px',
                                                    background: selectedAnswer === option.id ? '#6366f1' : '#f1f5f9',
                                                    color: selectedAnswer === option.id ? 'white' : '#475569',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: '800'
                                                }}
                                            >
                                                {String.fromCharCode(65 + index)}
                                            </span>
                                            <span style={{ color: '#0f172a', fontWeight: '600' }}>{option.text}</span>
                                            {selectedAnswer === option.id && <CheckCircle size={18} color="#6366f1" style={{ marginLeft: 'auto' }} />}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {exercise.answerType === 'numeric' && (
                                <input
                                    type="number"
                                    step="0.01"
                                    value={numericAnswer}
                                    onChange={(event) => setNumericAnswer(event.target.value)}
                                    placeholder="Masukkan jawaban numerik"
                                    style={{
                                        width: '100%',
                                        padding: '1rem 1.1rem',
                                        borderRadius: '1rem',
                                        border: '1px solid #cbd5e1',
                                        background: 'white',
                                        textAlign: 'center',
                                        fontSize: '1.15rem',
                                        fontWeight: '700'
                                    }}
                                />
                            )}

                            {exercise.answerType === 'canvas' && (
                                <div
                                    style={{
                                        padding: '1rem 1.1rem',
                                        borderRadius: '1rem',
                                        background: '#eff6ff',
                                        color: '#1d4ed8',
                                        border: '1px solid #bfdbfe',
                                        lineHeight: 1.7
                                    }}
                                >
                                    Gambar jawabanmu di canvas, lalu kirim untuk direview guru.
                                </div>
                            )}

                            <button
                                onClick={() => void handleSubmit()}
                                disabled={submitting || alreadyAttempted}
                                style={{
                                    marginTop: '1.25rem',
                                    width: '100%',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.6rem',
                                    padding: '1rem 1.2rem',
                                    border: 'none',
                                    borderRadius: '1rem',
                                    background: submitting || alreadyAttempted
                                        ? '#94a3b8'
                                        : 'linear-gradient(135deg, #4f46e5, #2563eb)',
                                    color: 'white',
                                    fontWeight: '800',
                                    cursor: submitting || alreadyAttempted ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                {submitting ? 'Mengirim jawaban...' : 'Kirim Jawaban'}
                            </button>
                        </div>
                    )}

                    {result && (
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button
                                onClick={() => navigate(`/student/class/${classId}/exercises`)}
                                className="btn btn-secondary"
                            >
                                Kembali ke daftar latihan
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExerciseSession;
