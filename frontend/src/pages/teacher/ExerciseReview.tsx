import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    Loader2,
    MessageSquare,
    PenSquare,
    Send,
    Sparkles,
    UserCircle2,
    XCircle
} from 'lucide-react';
import GeometryCanvas from '../../components/geometry/GeometryCanvas';
import type { CanvasState } from '../../components/geometry/types';
import type { ClassExerciseSummary, ExerciseAttemptSummary } from '../../types/api.types';
import { classesAPI } from '../../utils/api';

interface ClassInfo {
    id: string;
    name: string;
    subject: string;
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

const parseStoredAnswer = (value?: string | null): string => {
    if (!value) {
        return 'Tidak ada jawaban teks.';
    }

    try {
        const parsed = JSON.parse(value) as unknown;
        if (typeof parsed === 'string') {
            return parsed;
        }

        return JSON.stringify(parsed, null, 2);
    } catch {
        return value;
    }
};

const formatDate = (value?: string | null) => {
    if (!value) {
        return '-';
    }

    return new Date(value).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
};

const getAttemptStatusMeta = (attempt: ExerciseAttemptSummary) => {
    if (attempt.gradingStatus === 'pending_review') {
        return {
            label: 'Menunggu Review',
            background: '#fef3c7',
            color: '#92400e'
        };
    }

    if (attempt.isCorrect) {
        return {
            label: 'Sudah Dinilai',
            background: '#dcfce7',
            color: '#166534'
        };
    }

    return {
        label: 'Perlu Revisi',
        background: '#fee2e2',
        color: '#b91c1c'
    };
};

export const ExerciseReview: React.FC = () => {
    const { classId, exerciseId } = useParams<{ classId: string; exerciseId: string }>();
    const navigate = useNavigate();
    const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
    const [exercise, setExercise] = useState<ClassExerciseSummary | null>(null);
    const [selectedAttemptId, setSelectedAttemptId] = useState<string>('');
    const [scoreInput, setScoreInput] = useState<string>('0');
    const [feedback, setFeedback] = useState('');
    const [markCorrect, setMarkCorrect] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    useEffect(() => {
        if (!classId || !exerciseId) {
            return;
        }

        const loadReviewData = async () => {
            try {
                setLoading(true);
                const [classData, exerciseData] = await Promise.all([
                    classesAPI.getById(classId),
                    classesAPI.getExercise(classId, exerciseId)
                ]);

                setClassInfo({
                    id: classData.id,
                    name: classData.name,
                    subject: classData.subject
                });
                setExercise(exerciseData);

                const attempts = exerciseData.attempts || [];
                const preferredAttempt = attempts.find((attempt) => attempt.gradingStatus === 'pending_review') || attempts[0];
                if (preferredAttempt) {
                    setSelectedAttemptId(preferredAttempt.id);
                    setScoreInput(String(preferredAttempt.score ?? 0));
                    setFeedback(preferredAttempt.feedback || '');
                    setMarkCorrect(preferredAttempt.isCorrect || preferredAttempt.score >= exerciseData.points);
                }
            } catch (error) {
                console.error('Failed to load exercise review', error);
            } finally {
                setLoading(false);
            }
        };

        void loadReviewData();
    }, [classId, exerciseId]);

    const attempts = useMemo(() => exercise?.attempts || [], [exercise?.attempts]);
    const selectedAttempt = useMemo(
        () => attempts.find((attempt) => attempt.id === selectedAttemptId) || null,
        [attempts, selectedAttemptId]
    );

    useEffect(() => {
        if (!selectedAttempt || !exercise) {
            return;
        }

        setScoreInput(String(selectedAttempt.score ?? 0));
        setFeedback(selectedAttempt.feedback || '');
        setMarkCorrect(selectedAttempt.isCorrect || selectedAttempt.score >= exercise.points);
    }, [selectedAttempt, exercise]);

    const pendingCount = attempts.filter((attempt) => attempt.gradingStatus === 'pending_review').length;
    const promptCanvasState = parseCanvasState(exercise?.canvasState);
    const answerCanvasState = parseCanvasState(selectedAttempt?.canvasData);

    const handleSaveGrade = async () => {
        if (!classId || !exerciseId || !selectedAttempt || !exercise) {
            return;
        }

        const parsedScore = Number(scoreInput);
        if (!Number.isFinite(parsedScore)) {
            alert('Masukkan nilai yang valid.');
            return;
        }

        try {
            setSaving(true);
            const response = await classesAPI.gradeExerciseAttempt(classId, exerciseId, selectedAttempt.id, {
                score: parsedScore,
                isCorrect: markCorrect,
                feedback
            });

            setNotice(response.message);
            setExercise((prev) => {
                if (!prev) {
                    return prev;
                }

                return {
                    ...prev,
                    attempts: prev.attempts?.map((attempt) =>
                        attempt.id === selectedAttempt.id
                            ? { ...attempt, ...response.attempt }
                            : attempt
                    )
                };
            });
        } catch (error) {
            console.error('Failed to save grade', error);
            alert('Gagal menyimpan penilaian.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={40} className="animate-spin" color="var(--primary)" />
            </div>
        );
    }

    if (!exercise || !classInfo) {
        return (
            <div style={{ padding: '2rem' }}>
                <button
                    onClick={() => navigate(`/teacher/classes/${classId}?tab=exercises`)}
                    className="btn btn-secondary"
                >
                    Kembali
                </button>
                <p style={{ marginTop: '1rem', color: '#64748b' }}>Data latihan tidak ditemukan.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div
                className="card glass"
                style={{
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, rgba(14, 116, 144, 0.08), rgba(59, 130, 246, 0.08))',
                    border: '1px solid rgba(14, 165, 233, 0.18)'
                }}
            >
                <button
                    onClick={() => navigate(`/teacher/classes/${classId}?tab=exercises`)}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'transparent',
                        border: 'none',
                        color: '#0f172a',
                        cursor: 'pointer',
                        marginBottom: '1rem',
                        fontWeight: '600'
                    }}
                >
                    <ArrowLeft size={18} />
                    Kembali ke latihan kelas
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                        <p style={{ color: '#0f766e', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                            Review Penilaian
                        </p>
                        <h1 style={{ fontSize: '1.9rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                            {exercise.title}
                        </h1>
                        <p style={{ color: '#475569' }}>
                            {classInfo.name} · {classInfo.subject}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div className="card" style={{ padding: '1rem 1.25rem', minWidth: '150px' }}>
                            <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.35rem' }}>Perlu review</p>
                            <p style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>{pendingCount}</p>
                        </div>
                        <div className="card" style={{ padding: '1rem 1.25rem', minWidth: '150px' }}>
                            <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.35rem' }}>Total attempt</p>
                            <p style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>{attempts.length}</p>
                        </div>
                        <div className="card" style={{ padding: '1rem 1.25rem', minWidth: '150px' }}>
                            <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.35rem' }}>Poin maksimal</p>
                            <p style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>{exercise.points} XP</p>
                        </div>
                    </div>
                </div>
            </div>

            {notice && (
                <div
                    style={{
                        padding: '0.9rem 1rem',
                        borderRadius: '0.9rem',
                        background: '#dcfce7',
                        color: '#166534',
                        border: '1px solid #86efac',
                        fontWeight: '600'
                    }}
                >
                    {notice}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '340px minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
                <aside className="card glass" style={{ padding: '1rem', position: 'sticky', top: '6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>Daftar Pengumpulan</h2>
                            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Pilih siswa yang ingin dinilai.</p>
                        </div>
                        <Sparkles size={18} color="#0ea5e9" />
                    </div>

                    {attempts.length === 0 ? (
                        <div
                            style={{
                                padding: '1.25rem',
                                borderRadius: '0.9rem',
                                background: '#f8fafc',
                                color: '#64748b',
                                textAlign: 'center'
                            }}
                        >
                            Belum ada siswa yang mengerjakan latihan ini.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {attempts.map((attempt) => {
                                const status = getAttemptStatusMeta(attempt);
                                const isActive = attempt.id === selectedAttemptId;

                                return (
                                    <button
                                        key={attempt.id}
                                        onClick={() => setSelectedAttemptId(attempt.id)}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '1rem',
                                            borderRadius: '1rem',
                                            border: isActive ? '2px solid #0ea5e9' : '1px solid #e2e8f0',
                                            background: isActive ? '#f0f9ff' : 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>
                                                    {attempt.student?.name || 'Siswa'}
                                                </p>
                                                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                                    {attempt.student?.email || 'Tanpa email'}
                                                </p>
                                            </div>
                                            <span
                                                style={{
                                                    padding: '0.3rem 0.6rem',
                                                    borderRadius: '999px',
                                                    background: status.background,
                                                    color: status.color,
                                                    fontSize: '0.72rem',
                                                    fontWeight: '700',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {status.label}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.85rem', color: '#64748b', fontSize: '0.8rem' }}>
                                            <span>{formatDate(attempt.createdAt)}</span>
                                            <span style={{ fontWeight: '700', color: '#0f172a' }}>{attempt.score}/{exercise.points}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </aside>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="card glass" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                            <div>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
                                    Brief Soal
                                </h2>
                                <p style={{ color: '#64748b', lineHeight: 1.7 }}>
                                    {exercise.instructions || exercise.description || 'Guru belum menambahkan instruksi khusus.'}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                                <span style={{ padding: '0.45rem 0.75rem', borderRadius: '999px', background: '#dbeafe', color: '#1d4ed8', fontWeight: '700', fontSize: '0.8rem' }}>
                                    {exercise.answerType.replace('_', ' ')}
                                </span>
                                <span style={{ padding: '0.45rem 0.75rem', borderRadius: '999px', background: '#fef3c7', color: '#92400e', fontWeight: '700', fontSize: '0.8rem' }}>
                                    {exercise.points} XP
                                </span>
                            </div>
                        </div>
                    </div>

                    {promptCanvasState && (
                        <div className="card glass" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>
                                Canvas Soal
                            </h3>
                            <div style={{ borderRadius: '1rem', overflow: 'hidden', border: '1px solid #e2e8f0', background: 'white' }}>
                                <GeometryCanvas width={900} height={460} initialState={promptCanvasState} />
                            </div>
                        </div>
                    )}

                    {selectedAttempt ? (
                        <>
                            <div className="card glass" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                                            Jawaban Siswa
                                        </h3>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                            Ditinjau untuk {selectedAttempt.student?.name || 'siswa'} pada {formatDate(selectedAttempt.createdAt)}.
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.85rem' }}>
                                        <UserCircle2 size={16} />
                                        {selectedAttempt.student?.email || 'Email tidak tersedia'}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '1rem',
                                        background: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        whiteSpace: 'pre-wrap',
                                        lineHeight: 1.7,
                                        color: '#0f172a'
                                    }}
                                >
                                    {parseStoredAnswer(selectedAttempt.answer)}
                                </div>
                            </div>

                            {answerCanvasState && (
                                <div className="card glass" style={{ padding: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>
                                        Canvas Jawaban Siswa
                                    </h3>
                                    <div style={{ borderRadius: '1rem', overflow: 'hidden', border: '1px solid #e2e8f0', background: 'white' }}>
                                        <GeometryCanvas width={900} height={460} initialState={answerCanvasState} />
                                    </div>
                                </div>
                            )}

                            <div className="card glass" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                                            Form Penilaian
                                        </h3>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                            Simpan nilai, status, dan catatan agar siswa menerima hasil yang jelas.
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.85rem' }}>
                                        <Clock3 size={16} />
                                        Dinilai: {formatDate(selectedAttempt.gradedAt)}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '180px minmax(0, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', color: '#0f172a' }}>
                                            Nilai
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={exercise.points}
                                            value={scoreInput}
                                            onChange={(event) => setScoreInput(event.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.9rem 1rem',
                                                borderRadius: '0.85rem',
                                                border: '1px solid #cbd5e1',
                                                background: 'white'
                                            }}
                                        />
                                        <p style={{ marginTop: '0.45rem', color: '#64748b', fontSize: '0.8rem' }}>
                                            Maksimal {exercise.points} XP
                                        </p>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', color: '#0f172a' }}>
                                            Status Hasil
                                        </label>
                                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => setMarkCorrect(true)}
                                                style={{
                                                    flex: 1,
                                                    minWidth: '160px',
                                                    padding: '0.9rem 1rem',
                                                    borderRadius: '0.85rem',
                                                    border: markCorrect ? '2px solid #22c55e' : '1px solid #cbd5e1',
                                                    background: markCorrect ? '#f0fdf4' : 'white',
                                                    color: markCorrect ? '#166534' : '#334155',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.55rem',
                                                    fontWeight: '700'
                                                }}
                                            >
                                                <CheckCircle2 size={18} />
                                                Tuntas
                                            </button>
                                            <button
                                                onClick={() => setMarkCorrect(false)}
                                                style={{
                                                    flex: 1,
                                                    minWidth: '160px',
                                                    padding: '0.9rem 1rem',
                                                    borderRadius: '0.85rem',
                                                    border: !markCorrect ? '2px solid #ef4444' : '1px solid #cbd5e1',
                                                    background: !markCorrect ? '#fef2f2' : 'white',
                                                    color: !markCorrect ? '#b91c1c' : '#334155',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.55rem',
                                                    fontWeight: '700'
                                                }}
                                            >
                                                <XCircle size={18} />
                                                Perlu Revisi
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', color: '#0f172a' }}>
                                        Feedback untuk siswa
                                    </label>
                                    <textarea
                                        value={feedback}
                                        onChange={(event) => setFeedback(event.target.value)}
                                        rows={5}
                                        placeholder="Tulis arahan singkat, apresiasi, atau perbaikan yang perlu dilakukan."
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            borderRadius: '0.95rem',
                                            border: '1px solid #cbd5e1',
                                            resize: 'vertical',
                                            background: 'white',
                                            lineHeight: 1.6
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                                        <MessageSquare size={16} />
                                        Hasil akan langsung muncul di halaman siswa.
                                    </div>
                                    <button
                                        onClick={handleSaveGrade}
                                        disabled={saving}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.6rem',
                                            background: 'linear-gradient(135deg, #0f766e, #0ea5e9)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '0.95rem 1.4rem',
                                            borderRadius: '0.95rem',
                                            cursor: saving ? 'not-allowed' : 'pointer',
                                            fontWeight: '700',
                                            boxShadow: '0 16px 35px rgba(14, 165, 233, 0.24)'
                                        }}
                                    >
                                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                        Simpan Penilaian
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="card glass" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                            <PenSquare size={42} style={{ marginBottom: '0.75rem' }} />
                            Pilih attempt di panel kiri untuk mulai menilai.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExerciseReview;
