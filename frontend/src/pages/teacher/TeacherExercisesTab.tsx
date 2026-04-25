import React from 'react';
import { Clock, Edit, ExternalLink, Eye, PenTool, Plus, Trash2, X } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { getQuestionAnswerTypeSummary, parseExerciseQuestions } from '../../features/exercises/exercise-config';
import { classesAPI, getApiErrorMessage } from '../../utils/api';

interface TeacherExercisesTabProps {
    classId: string;
    navigate: (path: string) => void;
}

interface ExerciseItem {
    id: string;
    title: string;
    description?: string;
    difficulty: string;
    points: number;
    hasTimer: boolean;
    timerMinutes?: number;
    answerType: string;
    questionSet?: string | null;
    questionCount?: number;
    questionTypes?: string[];
    isPublished: boolean;
    attempts?: Array<{
        id: string;
        isCorrect: boolean;
        score: number;
        gradingStatus: 'graded' | 'pending_review';
    }>;
}

export const TeacherExercisesTab: React.FC<TeacherExercisesTabProps> = ({ classId, navigate }) => {
    const notifications = useNotifications();
    const [exercises, setExercises] = React.useState<ExerciseItem[]>([]);
    const [selectedExercise, setSelectedExercise] = React.useState<ExerciseItem | null>(null);
    const [loading, setLoading] = React.useState(true);

    const fetchExercises = React.useCallback(async () => {
        try {
            setLoading(true);
            const data = await classesAPI.getExercises(classId);
            setExercises(data as ExerciseItem[]);
        } catch (error) {
            console.error('Failed to fetch exercises:', error);
        } finally {
            setLoading(false);
        }
    }, [classId]);

    React.useEffect(() => {
        void fetchExercises();
    }, [fetchExercises]);

    const handleDelete = async (exerciseId: string) => {
        const confirmed = await notifications.confirm({
            title: 'Hapus latihan?',
            message: 'Latihan akan dihapus dari kelas ini. Pastikan memang sudah tidak diperlukan.',
            confirmLabel: 'Hapus latihan',
            cancelLabel: 'Batal',
            tone: 'danger'
        });

        if (!confirmed) return;

        try {
            await classesAPI.deleteExercise(classId, exerciseId);
            setExercises((prev) => prev.filter((exercise) => exercise.id !== exerciseId));
        } catch (error) {
            console.error('Failed to delete exercise:', error);
            notifications.error(
                getApiErrorMessage(error, 'Gagal menghapus latihan.'),
                'Latihan belum dihapus'
            );
        }
    };

    const difficultyConfig: Record<string, { text: string; color: string; bg: string }> = {
        easy: { text: 'Mudah', color: '#22c55e', bg: '#dcfce7' },
        medium: { text: 'Sedang', color: '#f59e0b', bg: '#fef3c7' },
        hard: { text: 'Sulit', color: '#ef4444', bg: '#fee2e2' }
    };

    const totalExercises = exercises.length;
    const totalAttempts = exercises.reduce((sum, exercise) => sum + (exercise.attempts?.length || 0), 0);
    const pendingReviews = exercises.reduce(
        (sum, exercise) => sum + (exercise.attempts?.filter((attempt) => attempt.gradingStatus === 'pending_review').length || 0),
        0
    );
    const publishedExercises = exercises.filter((exercise) => exercise.isPublished).length;

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <div
                    className="animate-spin"
                    style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%' }}
                />
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                    <h3 style={{ fontWeight: '700', color: '#1e293b' }}>Latihan Interaktif</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        Kelola alur latihan dari draft, publikasi, sampai review jawaban siswa.
                    </p>
                </div>
                <button
                    onClick={() => navigate(`/teacher/classes/${classId}/exercise-editor`)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    <Plus size={18} /> Buat Latihan
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="card glass" style={{ padding: '1rem 1.25rem' }}>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.35rem' }}>Total latihan</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>{totalExercises}</p>
                </div>
                <div className="card glass" style={{ padding: '1rem 1.25rem' }}>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.35rem' }}>Sudah dipublikasi</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#166534' }}>{publishedExercises}</p>
                </div>
                <div className="card glass" style={{ padding: '1rem 1.25rem' }}>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.35rem' }}>Total pengumpulan</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1d4ed8' }}>{totalAttempts}</p>
                </div>
                <div className="card glass" style={{ padding: '1rem 1.25rem' }}>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.35rem' }}>Perlu review</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#b45309' }}>{pendingReviews}</p>
                </div>
            </div>

            {exercises.length === 0 ? (
                <div className="card glass" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    <PenTool size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>Belum ada latihan interaktif.</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        Klik "Buat Latihan" untuk membuat latihan dengan visualisasi geometri.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                    {exercises.map((exercise) => {
                        const difficulty = difficultyConfig[exercise.difficulty] || difficultyConfig.medium;
                        const exerciseAttempts = exercise.attempts || [];
                        const totalPendingReview = exerciseAttempts.filter((attempt) => attempt.gradingStatus === 'pending_review').length;
                        const questions = parseExerciseQuestions({
                            title: exercise.title,
                            description: exercise.description || '',
                            instructions: exercise.description || '',
                            points: exercise.points,
                            answerType: exercise.answerType,
                            correctAnswer: null,
                            options: null,
                            canvasState: null,
                            canvasMode: 'readonly',
                            questionSet: exercise.questionSet || null
                        });
                        const typeSummary = getQuestionAnswerTypeSummary(questions).slice(0, 3);

                        return (
                            <div
                                key={exercise.id}
                                className="card glass"
                                onClick={() => setSelectedExercise(exercise)}
                                style={{
                                    padding: 0,
                                    overflow: 'hidden',
                                    position: 'relative',
                                    cursor: 'pointer'
                                }}
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '0.75rem',
                                        right: '0.75rem',
                                        background: exercise.isPublished ? '#dcfce7' : '#f1f5f9',
                                        color: exercise.isPublished ? '#166534' : '#64748b',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.7rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    {exercise.isPublished ? 'Publik' : 'Draft'}
                                </div>

                                <div
                                    style={{
                                        height: '6px',
                                        background: `linear-gradient(90deg, ${difficulty.color}, ${difficulty.color}88)`
                                    }}
                                />

                                <div style={{ padding: '1.25rem' }}>
                                    <h4 style={{ fontWeight: '700', marginBottom: '0.5rem', paddingRight: '4rem' }}>
                                        {exercise.title}
                                    </h4>
                                    {exercise.description && (
                                        <p
                                            style={{
                                                fontSize: '0.85rem',
                                                color: '#64748b',
                                                marginBottom: '1rem',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {exercise.description}
                                        </p>
                                    )}

                                    <div
                                        style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '0.5rem',
                                            marginBottom: '1rem',
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        <span
                                            style={{
                                                background: difficulty.bg,
                                                color: difficulty.color,
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.375rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            {difficulty.text}
                                        </span>
                                        <span
                                            style={{
                                                background: '#fef3c7',
                                                color: '#92400e',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.375rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            {exercise.points} XP
                                        </span>
                                        <span
                                            style={{
                                                background: '#f1f5f9',
                                                color: '#475569',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.375rem'
                                            }}
                                        >
                                            {questions.length} soal
                                        </span>
                                        {exercise.hasTimer && exercise.timerMinutes && (
                                            <span
                                                style={{
                                                    background: '#fee2e2',
                                                    color: '#991b1b',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '0.375rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                                }}
                                            >
                                                <Clock size={12} />
                                                {exercise.timerMinutes}m
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                        {typeSummary.map((typeLabel) => (
                                            <span
                                                key={`${exercise.id}-${typeLabel}`}
                                                style={{
                                                    padding: '0.3rem 0.55rem',
                                                    borderRadius: '999px',
                                                    background: '#eef2ff',
                                                    color: '#4338ca',
                                                    fontSize: '0.72rem',
                                                    fontWeight: '700'
                                                }}
                                            >
                                                {typeLabel}
                                            </span>
                                        ))}
                                    </div>

                                    <div
                                        style={{
                                            marginBottom: '1rem',
                                            padding: '0.85rem 0.9rem',
                                            background: '#f8fafc',
                                            borderRadius: '0.75rem',
                                            border: '1px solid #e2e8f0'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.4rem' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Sudah mengerjakan</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>{exerciseAttempts.length} siswa</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Butuh review</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: totalPendingReview > 0 ? '#b45309' : '#166534' }}>
                                                {totalPendingReview}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                setSelectedExercise(exercise);
                                            }}
                                            style={{
                                                flex: 1,
                                                minWidth: '120px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                padding: '0.5rem',
                                                background: '#ecfeff',
                                                color: '#0f766e',
                                                border: 'none',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            <Eye size={14} /> Detail
                                        </button>
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                navigate(`/teacher/classes/${classId}/exercise-review/${exercise.id}`);
                                            }}
                                            disabled={exerciseAttempts.length === 0}
                                            style={{
                                                flex: 1,
                                                minWidth: '120px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                padding: '0.5rem',
                                                background: exerciseAttempts.length === 0 ? '#e2e8f0' : '#eff6ff',
                                                color: exerciseAttempts.length === 0 ? '#94a3b8' : '#1d4ed8',
                                                border: 'none',
                                                borderRadius: '0.5rem',
                                                cursor: exerciseAttempts.length === 0 ? 'not-allowed' : 'pointer',
                                                fontSize: '0.85rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            <ExternalLink size={14} /> Review
                                        </button>
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                navigate(`/teacher/classes/${classId}/exercise-editor/${exercise.id}`);
                                            }}
                                            style={{
                                                flex: 1,
                                                minWidth: '120px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                padding: '0.5rem',
                                                background: '#f1f5f9',
                                                border: 'none',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                fontWeight: '500'
                                            }}
                                        >
                                            <Edit size={14} /> Edit
                                        </button>
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                void handleDelete(exercise.id);
                                            }}
                                            style={{
                                                padding: '0.5rem 0.75rem',
                                                background: '#fee2e2',
                                                border: 'none',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                color: '#ef4444'
                                            }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedExercise && (() => {
                const difficulty = difficultyConfig[selectedExercise.difficulty] || difficultyConfig.medium;
                const attempts = selectedExercise.attempts || [];
                const pending = attempts.filter((attempt) => attempt.gradingStatus === 'pending_review').length;
                const questions = parseExerciseQuestions({
                    title: selectedExercise.title,
                    description: selectedExercise.description || '',
                    instructions: selectedExercise.description || '',
                    points: selectedExercise.points,
                    answerType: selectedExercise.answerType,
                    correctAnswer: null,
                    options: null,
                    canvasState: null,
                    canvasMode: 'readonly',
                    questionSet: selectedExercise.questionSet || null
                });
                const typeSummary = getQuestionAnswerTypeSummary(questions);

                return (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(15, 23, 42, 0.55)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}>
                        <div style={{
                            width: '100%',
                            maxWidth: '680px',
                            maxHeight: '88vh',
                            overflow: 'auto',
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '1rem',
                            boxShadow: '0 24px 70px rgba(15, 23, 42, 0.28)'
                        }}>
                            <div style={{
                                position: 'sticky',
                                top: 0,
                                zIndex: 2,
                                padding: '1.25rem 1.5rem',
                                background: 'white',
                                borderBottom: '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '1rem',
                                alignItems: 'flex-start'
                            }}>
                                <div>
                                    <p style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                                        Detail Latihan
                                    </p>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
                                        {selectedExercise.title}
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedExercise(null)}
                                    style={{ width: '38px', height: '38px', borderRadius: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    aria-label="Tutup detail latihan"
                                >
                                    <X size={20} color="#64748b" />
                                </button>
                            </div>

                            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                                    <span style={{ padding: '0.35rem 0.65rem', borderRadius: '999px', background: selectedExercise.isPublished ? '#dcfce7' : '#f1f5f9', color: selectedExercise.isPublished ? '#166534' : '#475569', fontSize: '0.78rem', fontWeight: 700 }}>
                                        {selectedExercise.isPublished ? 'Publik' : 'Draft'}
                                    </span>
                                    <span style={{ padding: '0.35rem 0.65rem', borderRadius: '999px', background: difficulty.bg, color: difficulty.color, fontSize: '0.78rem', fontWeight: 700 }}>
                                        {difficulty.text}
                                    </span>
                                    <span style={{ padding: '0.35rem 0.65rem', borderRadius: '999px', background: '#fef3c7', color: '#92400e', fontSize: '0.78rem', fontWeight: 700 }}>
                                        {selectedExercise.points} XP
                                    </span>
                                </div>

                                <div style={{ padding: '1rem', borderRadius: '0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                    <p style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem' }}>Deskripsi</p>
                                    <p style={{ color: '#0f172a', lineHeight: 1.7 }}>
                                        {selectedExercise.description || 'Belum ada deskripsi latihan.'}
                                    </p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.8rem' }}>
                                    <div style={{ padding: '0.9rem 1rem', borderRadius: '0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                        <p style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: '0.25rem' }}>Jumlah soal</p>
                                        <p style={{ color: '#0f172a', fontWeight: 800 }}>{questions.length}</p>
                                    </div>
                                    <div style={{ padding: '0.9rem 1rem', borderRadius: '0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                        <p style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: '0.25rem' }}>Timer</p>
                                        <p style={{ color: '#0f172a', fontWeight: 800 }}>{selectedExercise.hasTimer ? `${selectedExercise.timerMinutes || 0} menit` : 'Tidak aktif'}</p>
                                    </div>
                                    <div style={{ padding: '0.9rem 1rem', borderRadius: '0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                        <p style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: '0.25rem' }}>Pengumpulan</p>
                                        <p style={{ color: '#0f172a', fontWeight: 800 }}>{attempts.length} siswa</p>
                                    </div>
                                    <div style={{ padding: '0.9rem 1rem', borderRadius: '0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                        <p style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: '0.25rem' }}>Butuh review</p>
                                        <p style={{ color: pending > 0 ? '#b45309' : '#166534', fontWeight: 800 }}>{pending}</p>
                                    </div>
                                </div>

                                {typeSummary.length > 0 && (
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {typeSummary.map((label) => (
                                            <span key={label} style={{ padding: '0.35rem 0.65rem', borderRadius: '999px', background: '#eef2ff', color: '#4338ca', fontSize: '0.78rem', fontWeight: 700 }}>
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setSelectedExercise(null)}>
                                        Tutup
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        disabled={attempts.length === 0}
                                        onClick={() => navigate(`/teacher/classes/${classId}/exercise-review/${selectedExercise.id}`)}
                                        style={{ opacity: attempts.length === 0 ? 0.55 : 1 }}
                                    >
                                        <ExternalLink size={16} /> Review
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => navigate(`/teacher/classes/${classId}/exercise-editor/${selectedExercise.id}`)}
                                    >
                                        <Edit size={16} /> Edit Latihan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#eff6ff', borderRadius: '0.75rem', border: '1px solid #bfdbfe' }}>
                <p style={{ fontSize: '0.9rem', color: '#1e40af' }}>
                    <strong>Tip:</strong> Gunakan tombol review untuk menilai jawaban canvas dan memberi feedback yang langsung terlihat oleh siswa.
                </p>
            </div>
        </div>
    );
};

export default TeacherExercisesTab;
