import React from 'react';
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
import GeometryCanvas, { type GeometryCanvasHandle } from '../../components/geometry/GeometryCanvas';
import type { CanvasState } from '../../components/geometry/types';
import {
    createEmptyCanvasState,
    findAnswerForQuestion,
    getQuestionTypeLabel,
    parseExerciseQuestions,
    parseQuestionResults,
    parseStoredAnswers,
    type ExerciseAnswerItem,
    type ExerciseQuestion,
    type ExerciseQuestionResult
} from '../../features/exercises/exercise-config';
import type {
    ClassExerciseSummary,
    ExerciseAttemptSummary,
    ExerciseGradingStatus
} from '../../types/api.types';
import { classesAPI } from '../../utils/api';

interface ExerciseResult {
    gradingStatus: ExerciseGradingStatus;
    isCorrect: boolean | null;
    score: number;
    message: string;
    feedback?: string | null;
    gradedAt?: string | null;
    questionResults: ExerciseQuestionResult[];
}

const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const buildResultFromAttempt = (attempt: ExerciseAttemptSummary, exercisePoints: number): ExerciseResult => {
    const questionResults = parseQuestionResults(attempt.questionResults);

    if (attempt.gradingStatus === 'pending_review') {
        return {
            gradingStatus: 'pending_review',
            isCorrect: null,
            score: attempt.score,
            message: 'Jawaban kamu sudah terkirim dan beberapa bagian sedang menunggu penilaian guru.',
            feedback: attempt.feedback,
            gradedAt: attempt.gradedAt,
            questionResults
        };
    }

    if (attempt.isCorrect) {
        return {
            gradingStatus: 'graded',
            isCorrect: true,
            score: attempt.score,
            message: 'Semua jawaban yang dinilai otomatis sudah benar. Kerja bagus.',
            feedback: attempt.feedback,
            gradedAt: attempt.gradedAt,
            questionResults
        };
    }

    return {
        gradingStatus: 'graded',
        isCorrect: false,
        score: attempt.score,
        message: `Latihan sudah dinilai. Skor kamu ${attempt.score}/${exercisePoints}.`,
        feedback: attempt.feedback,
        gradedAt: attempt.gradedAt,
        questionResults
    };
};

const getQuestionStatusMeta = (result?: ExerciseQuestionResult) => {
    if (!result) {
        return null;
    }

    if (result.status === 'pending_review') {
        return {
            label: 'Menunggu review',
            background: '#fef3c7',
            color: '#92400e'
        };
    }

    if (result.status === 'correct') {
        return {
            label: 'Benar',
            background: '#dcfce7',
            color: '#166534'
        };
    }

    return {
        label: 'Perlu revisi',
        background: '#fee2e2',
        color: '#b91c1c'
    };
};

const controlInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.95rem 1rem',
    borderRadius: '0.95rem',
    border: '1px solid #cbd5e1',
    background: 'white'
};

export const ExerciseSession: React.FC = () => {
    const { classId, exerciseId } = useParams<{ classId: string; exerciseId: string }>();
    const navigate = useNavigate();
    const [exercise, setExercise] = React.useState<ClassExerciseSummary | null>(null);
    const [questions, setQuestions] = React.useState<ExerciseQuestion[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [submitting, setSubmitting] = React.useState(false);
    const [answers, setAnswers] = React.useState<Record<string, ExerciseAnswerItem>>({});
    const [timeRemaining, setTimeRemaining] = React.useState<number | null>(null);
    const [result, setResult] = React.useState<ExerciseResult | null>(null);
    const [alreadyAttempted, setAlreadyAttempted] = React.useState(false);
    const startTimeRef = React.useRef(Date.now());
    const canvasRefs = React.useRef<Record<string, GeometryCanvasHandle | null>>({});

    React.useEffect(() => {
        if (!classId || !exerciseId) {
            return;
        }

        const loadExercise = async () => {
            try {
                setLoading(true);
                const data = await classesAPI.getExercise(classId, exerciseId);
                const nextQuestions = parseExerciseQuestions(data);
                setExercise(data);
                setQuestions(nextQuestions);

                const latestAttempt = data.attempts?.[0];
                if (latestAttempt) {
                    setAlreadyAttempted(true);
                    setResult(buildResultFromAttempt(latestAttempt, data.points));
                    const storedAnswers = parseStoredAnswers(latestAttempt.answer);
                    const mappedAnswers = storedAnswers.reduce<Record<string, ExerciseAnswerItem>>((accumulator, answer) => {
                        accumulator[answer.questionId] = answer;
                        return accumulator;
                    }, {});
                    setAnswers(mappedAnswers);
                } else {
                    const initialAnswers = nextQuestions.reduce<Record<string, ExerciseAnswerItem>>((accumulator, question) => {
                        accumulator[question.id] = { questionId: question.id, value: '' };
                        return accumulator;
                    }, {});
                    setAnswers(initialAnswers);
                }
            } catch (error) {
                console.error('Failed to fetch exercise', error);
            } finally {
                setLoading(false);
            }
        };

        void loadExercise();
    }, [classId, exerciseId]);

    React.useEffect(() => {
        if (exercise?.hasTimer && exercise.timerMinutes && timeRemaining === null && !alreadyAttempted) {
            setTimeRemaining(exercise.timerMinutes * 60);
        }
    }, [exercise, timeRemaining, alreadyAttempted]);

    React.useEffect(() => {
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

    const handleAnswerChange = (questionId: string, value: string | number) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                questionId,
                value
            }
        }));
    };

    const handleSubmit = async () => {
        if (!exercise || !classId || !exerciseId || alreadyAttempted) {
            return;
        }

        const submissionAnswers = questions.map((question) => {
            const canvasState = canvasRefs.current[question.id]?.getState?.();
            return {
                questionId: question.id,
                value: answers[question.id]?.value ?? '',
                canvasState: canvasState || answers[question.id]?.canvasState || null
            };
        });

        const emptyRequiredQuestion = questions.find((question) => {
            if (question.type === 'canvas') {
                return false;
            }

            const currentValue = answers[question.id]?.value;
            return currentValue === undefined || currentValue === null || String(currentValue).trim() === '';
        });

        if (emptyRequiredQuestion) {
            alert(`Jawaban untuk "${emptyRequiredQuestion.title}" belum diisi.`);
            return;
        }

        try {
            setSubmitting(true);
            const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
            const response = await classesAPI.submitExerciseAttempt(classId, exerciseId, {
                answer: submissionAnswers,
                timeSpent
            });

            setAlreadyAttempted(true);
            setResult({
                gradingStatus: response.gradingStatus,
                isCorrect: response.isCorrect,
                score: response.score,
                message: response.message,
                feedback: response.attempt.feedback,
                gradedAt: response.attempt.gradedAt,
                questionResults: parseQuestionResults(response.attempt.questionResults)
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

    React.useEffect(() => {
        if (timeRemaining === 0 && !result && !submitting && !alreadyAttempted) {
            void handleSubmit();
        }
    }, [timeRemaining, result, submitting, alreadyAttempted]);

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
                title: 'Latihan Tuntas'
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
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => navigate(`/student/class/${classId}/exercises`)}
                            style={{ width: '42px', height: '42px', borderRadius: '999px', border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.3rem' }}>
                                {exercise.title}
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                                <span style={{ padding: '0.3rem 0.65rem', borderRadius: '999px', background: difficulty.background, color: difficulty.color, fontWeight: '700', fontSize: '0.78rem' }}>
                                    {difficulty.label}
                                </span>
                                <span style={{ color: '#475569', fontSize: '0.88rem', fontWeight: '600' }}>
                                    {questions.length} soal • {exercise.points} XP
                                </span>
                            </div>
                        </div>
                    </div>

                    {exercise.hasTimer && timeRemaining !== null && !result && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', padding: '0.75rem 1rem', borderRadius: '999px', background: timeRemaining < 60 ? '#fee2e2' : '#eff6ff', color: timeRemaining < 60 ? '#b91c1c' : '#1d4ed8', fontWeight: '800' }}>
                            <Timer size={18} />
                            <span style={{ fontFamily: 'monospace', fontSize: '1rem' }}>{formatTime(timeRemaining)}</span>
                        </div>
                    )}
                </div>
            </header>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {result && resultMeta && (
                    <div
                        style={{
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
                                    <h2 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '0.35rem' }}>{resultMeta.title}</h2>
                                    <p style={{ opacity: 0.92, lineHeight: 1.6 }}>{result.message}</p>
                                    {result.feedback && <p style={{ marginTop: '0.75rem', opacity: 0.95 }}>Feedback guru: {result.feedback}</p>}
                                </div>
                            </div>
                            <div style={{ minWidth: '180px', padding: '1rem 1.1rem', borderRadius: '1rem', background: 'rgba(255, 255, 255, 0.14)', alignSelf: 'flex-start' }}>
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

                {(exercise.instructions || exercise.description) && (
                    <div className="card glass" style={{ padding: '1.4rem 1.5rem' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem' }}>Petunjuk umum</h2>
                        <p style={{ color: '#475569', lineHeight: 1.7 }}>{exercise.instructions || exercise.description}</p>
                    </div>
                )}

                {questions.map((question, index) => {
                    const questionResult = result?.questionResults.find((item) => item.questionId === question.id);
                    const questionStatus = getQuestionStatusMeta(questionResult);
                    const answerValue = answers[question.id]?.value ?? '';
                    const selectedAnswer = findAnswerForQuestion(parseStoredAnswers(JSON.stringify(Object.values(answers))), question.id);
                    const isCanvasInteractive = !result && (question.type === 'canvas' || question.visual?.canvasMode === 'interactive');

                    return (
                        <section key={question.id} className="card glass" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                                <div>
                                    <p style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: '0.25rem' }}>Soal {index + 1}</p>
                                    <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.3rem' }}>{question.title}</h2>
                                    <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                                        <span style={{ padding: '0.3rem 0.6rem', borderRadius: '999px', background: '#eef2ff', color: '#4338ca', fontSize: '0.74rem', fontWeight: '700' }}>
                                            {getQuestionTypeLabel(question.type)}
                                        </span>
                                        <span style={{ padding: '0.3rem 0.6rem', borderRadius: '999px', background: '#eff6ff', color: '#1d4ed8', fontSize: '0.74rem', fontWeight: '700' }}>
                                            {question.points} poin
                                        </span>
                                        {questionStatus && (
                                            <span style={{ padding: '0.3rem 0.6rem', borderRadius: '999px', background: questionStatus.background, color: questionStatus.color, fontSize: '0.74rem', fontWeight: '700' }}>
                                                {questionStatus.label}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {questionResult && result?.gradingStatus !== 'pending_review' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f172a', fontWeight: '800' }}>
                                        {questionResult.status === 'correct' ? <CheckCircle size={18} color="#16a34a" /> : <XCircle size={18} color="#dc2626" />}
                                        {questionResult.score}/{questionResult.maxScore}
                                    </div>
                                )}
                            </div>

                            <p style={{ color: '#475569', lineHeight: 1.7 }}>{question.prompt}</p>

                            {question.shape && (
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {question.shape.measurements.map((measurement) => (
                                        <span key={`${question.id}-${measurement.label}`} style={{ padding: '0.45rem 0.7rem', borderRadius: '0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', fontWeight: '700', fontSize: '0.82rem' }}>
                                            {measurement.label}: {measurement.value} {measurement.unit || ''}
                                        </span>
                                    ))}
                                    {question.shape.formulaHint && (
                                        <span style={{ padding: '0.45rem 0.7rem', borderRadius: '0.85rem', background: '#eef2ff', color: '#4338ca', fontWeight: '700', fontSize: '0.82rem' }}>
                                            Hint: {question.shape.formulaHint}
                                        </span>
                                    )}
                                </div>
                            )}

                            {question.visual?.enabled && (
                                <div style={{ borderRadius: '1rem', overflow: 'hidden', border: '1px solid #dbe3f1', background: 'white' }}>
                                    <GeometryCanvas
                                        ref={(instance) => { canvasRefs.current[question.id] = instance; }}
                                        width={960}
                                        height={420}
                                        initialState={(question.visual.canvasState as CanvasState | undefined) || createEmptyCanvasState()}
                                        readOnly={!isCanvasInteractive}
                                        showToolbar={Boolean(isCanvasInteractive && question.visual.showToolbar)}
                                        showFunctionPanel={Boolean(question.visual.showFunctionPanel)}
                                        hideFunctionExpressions={Boolean(question.visual.hideFunctionExpressions)}
                                        showCoordinates={Boolean(question.visual.showCoordinates)}
                                        compactMode
                                    />
                                </div>
                            )}

                            {!result && question.type === 'multiple_choice' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                    {(question.options || []).map((option, optionIndex) => (
                                        <button
                                            key={option.id}
                                            onClick={() => handleAnswerChange(question.id, option.id)}
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.85rem',
                                                padding: '1rem 1.1rem',
                                                borderRadius: '1rem',
                                                border: answerValue === option.id ? '2px solid #6366f1' : '1px solid #e2e8f0',
                                                background: answerValue === option.id ? '#eef2ff' : 'white',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <span style={{ width: '34px', height: '34px', borderRadius: '999px', background: answerValue === option.id ? '#6366f1' : '#f1f5f9', color: answerValue === option.id ? 'white' : '#475569', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                                                {String.fromCharCode(65 + optionIndex)}
                                            </span>
                                            <span style={{ color: '#0f172a', fontWeight: '600' }}>{option.text}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {!result && (question.type === 'numeric' || question.type === 'shape_area' || question.type === 'shape_perimeter') && (
                                <input
                                    type="number"
                                    step="0.01"
                                    value={typeof answerValue === 'number' ? answerValue : String(answerValue)}
                                    onChange={(event) => handleAnswerChange(question.id, event.target.value)}
                                    placeholder={question.placeholder || 'Masukkan jawaban numerik'}
                                    style={{ ...controlInputStyle, textAlign: 'center', fontSize: '1.05rem', fontWeight: '700' }}
                                />
                            )}

                            {!result && question.type === 'short_text' && (
                                <textarea
                                    value={String(answerValue)}
                                    onChange={(event) => handleAnswerChange(question.id, event.target.value)}
                                    rows={4}
                                    placeholder={question.placeholder || 'Tulis jawaban singkat kamu'}
                                    style={{ ...controlInputStyle, resize: 'vertical', lineHeight: 1.7 }}
                                />
                            )}

                            {!result && question.type === 'canvas' && (
                                <div style={{ padding: '1rem 1.1rem', borderRadius: '1rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', lineHeight: 1.7 }}>
                                    Gambar jawabanmu di canvas, lalu kirim untuk direview guru.
                                </div>
                            )}

                            {result && selectedAnswer && question.type !== 'canvas' && (
                                <div style={{ padding: '0.95rem 1rem', borderRadius: '0.95rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                    <p style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: '0.35rem' }}>Jawaban tersimpan</p>
                                    <p style={{ color: '#0f172a', fontWeight: '700' }}>
                                        {selectedAnswer.value !== undefined && selectedAnswer.value !== null && String(selectedAnswer.value).trim()
                                            ? String(selectedAnswer.value)
                                            : 'Tidak ada jawaban teks'}
                                    </p>
                                </div>
                            )}
                        </section>
                    );
                })}

                {!result && (
                    <button
                        onClick={() => void handleSubmit()}
                        disabled={submitting || alreadyAttempted}
                        style={{
                            width: '100%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.6rem',
                            padding: '1rem 1.2rem',
                            border: 'none',
                            borderRadius: '1rem',
                            background: submitting || alreadyAttempted ? '#94a3b8' : 'linear-gradient(135deg, #4f46e5, #2563eb)',
                            color: 'white',
                            fontWeight: '800',
                            cursor: submitting || alreadyAttempted ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        {submitting ? 'Mengirim jawaban...' : 'Kirim seluruh latihan'}
                    </button>
                )}

                {result && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button onClick={() => navigate(`/student/class/${classId}/exercises`)} className="btn btn-secondary">
                            Kembali ke daftar latihan
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExerciseSession;
