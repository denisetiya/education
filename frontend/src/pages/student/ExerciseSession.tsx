import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Zap, CheckCircle, XCircle, 
    AlertCircle, Send, Timer, Trophy
} from 'lucide-react';
import { classesAPI } from '../../utils/api';
import GeometryCanvas from '../../components/geometry/GeometryCanvas';
import type { CanvasState } from '../../components/geometry/types';

interface Exercise {
    id: string;
    title: string;
    description?: string;
    instructions?: string;
    exerciseType: string;
    difficulty: string;
    points: number;
    hasTimer: boolean;
    timerMinutes?: number;
    canvasState?: string;
    canvasMode: string;
    answerType: string;
    options?: string;
    attempts?: Array<{
        isCorrect: boolean;
        score: number;
        answer?: string;
        createdAt: string;
    }>;
}

interface ExerciseOption {
    id: string;
    text: string;
    isCorrect?: boolean;
}

export const ExerciseSession: React.FC = () => {
    const { classId, exerciseId } = useParams<{ classId: string; exerciseId: string }>();
    const navigate = useNavigate();
    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string>('');
    const [numericAnswer, setNumericAnswer] = useState<string>('');
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [startTime] = useState<number>(Date.now());
    const [result, setResult] = useState<{ isCorrect: boolean; score: number; message: string } | null>(null);
    const [alreadyAttempted, setAlreadyAttempted] = useState(false);
    const canvasRef = useRef<{ getState: () => CanvasState } | null>(null);

    useEffect(() => {
        if (classId && exerciseId) {
            fetchExercise();
        }
    }, [classId, exerciseId]);

    useEffect(() => {
        // Timer countdown
        if (exercise?.hasTimer && exercise.timerMinutes && timeRemaining === null) {
            setTimeRemaining(exercise.timerMinutes * 60);
        }

        if (timeRemaining !== null && timeRemaining > 0) {
            const interval = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev && prev > 0) {
                        return prev - 1;
                    }
                    return 0;
                });
            }, 1000);
            return () => clearInterval(interval);
        }

        // Auto submit when time runs out
        if (timeRemaining === 0 && !result && !submitting) {
            handleSubmit();
        }
    }, [exercise, timeRemaining, result, submitting]);

    const fetchExercise = async () => {
        try {
            setLoading(true);
            const data = await classesAPI.getExercise(classId!, exerciseId!);
            setExercise(data);
            
            // Check if already attempted
            if (data.attempts && data.attempts.length > 0) {
                setAlreadyAttempted(true);
                setResult({
                    isCorrect: data.attempts[0].isCorrect,
                    score: data.attempts[0].score,
                    message: data.attempts[0].isCorrect ? 'Jawaban Benar!' : 'Jawaban Salah'
                });
            }
        } catch (error) {
            console.error('Failed to fetch exercise:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (alreadyAttempted) return;
        
        let answer;
        if (exercise?.answerType === 'multiple_choice') {
            answer = selectedAnswer;
        } else if (exercise?.answerType === 'numeric') {
            answer = numericAnswer;
        } else if (exercise?.answerType === 'canvas') {
            answer = 'canvas_submission';
        }

        if (!answer && exercise?.answerType !== 'canvas') {
            alert('Pilih atau isi jawaban terlebih dahulu!');
            return;
        }

        try {
            setSubmitting(true);
            const timeSpent = Math.floor((Date.now() - startTime) / 1000);
            const currentCanvasState = canvasRef.current?.getState?.();
            
            const response = await classesAPI.submitExerciseAttempt(classId!, exerciseId!, {
                answer,
                canvasData: currentCanvasState ? JSON.stringify(currentCanvasState) : undefined,
                timeSpent
            });

            setResult({
                isCorrect: response.isCorrect,
                score: response.score,
                message: response.message
            });
            setAlreadyAttempted(true);
        } catch (error: unknown) {
            console.error('Failed to submit:', error);
            if (error && typeof error === 'object' && 'message' in error) {
                const err = error as { message: string };
                if (err.message.includes('Already attempted')) {
                    setAlreadyAttempted(true);
                    alert('Kamu sudah mengerjakan latihan ini!');
                } else {
                    alert('Gagal mengirim jawaban');
                }
            }
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const difficultyLabels: Record<string, { text: string; color: string; bg: string }> = {
        easy: { text: 'Mudah', color: '#22c55e', bg: '#dcfce7' },
        medium: { text: 'Sedang', color: '#f59e0b', bg: '#fef3c7' },
        hard: { text: 'Sulit', color: '#ef4444', bg: '#fee2e2' }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <div className="animate-spin" style={{ width: 48, height: 48, border: '4px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
            </div>
        );
    }

    if (!exercise) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem' }}>
                <AlertCircle size={48} color="#ef4444" />
                <p style={{ fontSize: '1.25rem', fontWeight: '600' }}>Latihan tidak ditemukan</p>
                <button
                    onClick={() => navigate(`/student/class/${classId}/exercises`)}
                    style={{
                        background: 'var(--primary)',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer'
                    }}
                >
                    Kembali
                </button>
            </div>
        );
    }

    const difficulty = difficultyLabels[exercise.difficulty] || difficultyLabels.medium;
    const options: ExerciseOption[] = exercise.options ? JSON.parse(exercise.options) : [];
    const canvasState: CanvasState | undefined = exercise.canvasState ? JSON.parse(exercise.canvasState) : undefined;

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
            {/* Header */}
            <div style={{
                background: 'white',
                borderBottom: '1px solid #e2e8f0',
                padding: '1rem 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate(`/student/class/${classId}/exercises`)}
                        style={{
                            background: '#f1f5f9',
                            border: 'none',
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
                            {exercise.title}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                            <span style={{ 
                                fontSize: '0.75rem', 
                                padding: '0.25rem 0.5rem', 
                                background: difficulty.bg, 
                                color: difficulty.color,
                                borderRadius: '1rem',
                                fontWeight: '600'
                            }}>
                                {difficulty.text}
                            </span>
                            <span style={{ fontSize: '0.875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Zap size={14} color="#f59e0b" /> {exercise.points} XP
                            </span>
                        </div>
                    </div>
                </div>

                {/* Timer */}
                {exercise.hasTimer && timeRemaining !== null && !result && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        background: timeRemaining < 60 ? '#fee2e2' : '#f1f5f9',
                        borderRadius: '2rem',
                        animation: timeRemaining < 60 ? 'pulse 1s infinite' : 'none'
                    }}>
                        <Timer size={20} color={timeRemaining < 60 ? '#ef4444' : '#64748b'} />
                        <span style={{ 
                            fontSize: '1.5rem', 
                            fontWeight: '700', 
                            fontFamily: 'monospace',
                            color: timeRemaining < 60 ? '#ef4444' : '#1e293b'
                        }}>
                            {formatTime(timeRemaining)}
                        </span>
                    </div>
                )}
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
                {/* Result Banner */}
                {result && (
                    <div style={{
                        marginBottom: '1.5rem',
                        padding: '1.5rem',
                        background: result.isCorrect 
                            ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' 
                            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        borderRadius: '1rem',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {result.isCorrect ? <Trophy size={48} /> : <XCircle size={48} />}
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                                    {result.isCorrect ? '🎉 Selamat!' : '😔 Coba Lagi Ya!'}
                                </h2>
                                <p style={{ opacity: 0.9 }}>{result.message}</p>
                            </div>
                        </div>
                        {result.isCorrect && (
                            <div style={{ 
                                background: 'rgba(255,255,255,0.2)', 
                                padding: '1rem 1.5rem', 
                                borderRadius: '0.75rem',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '2rem', fontWeight: '700' }}>+{result.score}</div>
                                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>XP Earned</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Instructions */}
                {exercise.instructions && (
                    <div className="card glass" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>📋 Instruksi</h3>
                        <p style={{ color: '#64748b', lineHeight: 1.6 }}>{exercise.instructions}</p>
                    </div>
                )}

                {/* Canvas Visualization */}
                {canvasState && (
                    <div className="card glass" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            📐 Visualisasi
                        </h3>
                        <div style={{ 
                            border: '2px solid #e2e8f0', 
                            borderRadius: '0.75rem', 
                            overflow: 'hidden',
                            background: '#fafafa'
                        }}>
                            <GeometryCanvas
                                ref={exercise.canvasMode === 'interactive' ? canvasRef : undefined}
                                width={800}
                                height={450}
                                initialState={canvasState}
                            />
                        </div>
                        {exercise.canvasMode === 'interactive' && !result && (
                            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.75rem', textAlign: 'center' }}>
                                💡 Kamu bisa menggambar di canvas untuk menjawab soal
                            </p>
                        )}
                    </div>
                )}

                {/* Answer Section */}
                {!result && (
                    <div className="card glass" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontWeight: '700', marginBottom: '1.25rem' }}>✏️ Jawaban</h3>

                        {exercise.answerType === 'multiple_choice' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {options.map((option, idx) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setSelectedAnswer(option.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '1rem 1.25rem',
                                            background: selectedAnswer === option.id 
                                                ? 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)' 
                                                : 'white',
                                            color: selectedAnswer === option.id ? 'white' : '#374151',
                                            border: selectedAnswer === option.id 
                                                ? 'none' 
                                                : '2px solid #e2e8f0',
                                            borderRadius: '0.75rem',
                                            cursor: 'pointer',
                                            fontSize: '1rem',
                                            textAlign: 'left',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <span style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            background: selectedAnswer === option.id ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: '700',
                                            flexShrink: 0
                                        }}>
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        <span>{option.text}</span>
                                        {selectedAnswer === option.id && <CheckCircle size={20} style={{ marginLeft: 'auto' }} />}
                                    </button>
                                ))}
                            </div>
                        )}

                        {exercise.answerType === 'numeric' && (
                            <div>
                                <input
                                    type="number"
                                    value={numericAnswer}
                                    onChange={(e) => setNumericAnswer(e.target.value)}
                                    placeholder="Masukkan jawaban angka..."
                                    step="0.01"
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        fontSize: '1.25rem',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '0.75rem',
                                        textAlign: 'center'
                                    }}
                                />
                            </div>
                        )}

                        {exercise.answerType === 'canvas' && (
                            <div style={{ 
                                padding: '1rem', 
                                background: '#f8fafc', 
                                borderRadius: '0.75rem',
                                textAlign: 'center',
                                color: '#64748b'
                            }}>
                                <p>Gambar jawabanmu di canvas di atas, lalu klik "Kirim Jawaban"</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || alreadyAttempted}
                            style={{
                                width: '100%',
                                marginTop: '1.5rem',
                                padding: '1rem',
                                background: submitting || alreadyAttempted 
                                    ? '#94a3b8' 
                                    : 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.75rem',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                cursor: submitting || alreadyAttempted ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Send size={20} />
                            {submitting ? 'Mengirim...' : 'Kirim Jawaban'}
                        </button>
                    </div>
                )}

                {/* Back button after result */}
                {result && (
                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <button
                            onClick={() => navigate(`/student/class/${classId}/exercises`)}
                            style={{
                                padding: '1rem 2rem',
                                background: 'white',
                                border: '2px solid var(--primary)',
                                color: 'var(--primary)',
                                borderRadius: '0.75rem',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            ← Kembali ke Daftar Latihan
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
            `}</style>
        </div>
    );
};

export default ExerciseSession;
