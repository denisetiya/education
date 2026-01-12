import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Save, Eye, EyeOff, Plus, Trash2, 
    Clock, Target, Zap, CheckCircle, Circle, Hash, PenTool,
    Settings, ToggleLeft, ToggleRight
} from 'lucide-react';
import { classesAPI } from '../../utils/api';
import GeometryCanvas from '../../components/geometry/GeometryCanvas';
import type { CanvasState } from '../../components/geometry/types';

interface ExerciseOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

interface ExerciseData {
    title: string;
    description: string;
    instructions: string;
    exerciseType: string;
    difficulty: string;
    points: number;
    hasTimer: boolean;
    timerMinutes: number;
    canvasMode: string;
    answerType: string;
    correctAnswer: string;
    options: ExerciseOption[];
    isPublished: boolean;
}

const initialExerciseData: ExerciseData = {
    title: '',
    description: '',
    instructions: '',
    exerciseType: 'geometry',
    difficulty: 'medium',
    points: 10,
    hasTimer: false,
    timerMinutes: 10,
    canvasMode: 'readonly',
    answerType: 'multiple_choice',
    correctAnswer: '',
    options: [
        { id: '1', text: '', isCorrect: false },
        { id: '2', text: '', isCorrect: false },
        { id: '3', text: '', isCorrect: false },
        { id: '4', text: '', isCorrect: false }
    ],
    isPublished: false
};

export const ExerciseEditor: React.FC = () => {
    const { classId, exerciseId } = useParams<{ classId: string; exerciseId?: string }>();
    const navigate = useNavigate();
    const [exercise, setExercise] = useState<ExerciseData>(initialExerciseData);
    const [canvasState, setCanvasState] = useState<CanvasState | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const canvasRef = useRef<{ getState: () => CanvasState } | null>(null);

    const isEditing = !!exerciseId;

    useEffect(() => {
        if (exerciseId && classId) {
            fetchExercise();
        }
    }, [exerciseId, classId]);

    const fetchExercise = async () => {
        try {
            setLoading(true);
            const data = await classesAPI.getExercise(classId!, exerciseId!);
            setExercise({
                title: data.title || '',
                description: data.description || '',
                instructions: data.instructions || '',
                exerciseType: data.exerciseType || 'geometry',
                difficulty: data.difficulty || 'medium',
                points: data.points || 10,
                hasTimer: data.hasTimer || false,
                timerMinutes: data.timerMinutes || 10,
                canvasMode: data.canvasMode || 'readonly',
                answerType: data.answerType || 'multiple_choice',
                correctAnswer: data.correctAnswer || '',
                options: data.options ? JSON.parse(data.options) : initialExerciseData.options,
                isPublished: data.isPublished || false
            });
            if (data.canvasState) {
                setCanvasState(JSON.parse(data.canvasState));
            }
        } catch (error) {
            console.error('Failed to fetch exercise:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!exercise.title.trim()) {
            alert('Judul latihan harus diisi!');
            return;
        }

        try {
            setSaving(true);
            
            // Get current canvas state
            const currentCanvasState = canvasRef.current?.getState?.() || canvasState;
            
            // Prepare correct answer based on answer type
            let correctAnswerData = exercise.correctAnswer;
            if (exercise.answerType === 'multiple_choice') {
                const correctOption = exercise.options.find(o => o.isCorrect);
                correctAnswerData = correctOption ? JSON.stringify({ id: correctOption.id }) : '';
            } else if (exercise.answerType === 'numeric') {
                correctAnswerData = JSON.stringify({ value: parseFloat(exercise.correctAnswer), tolerance: 0.01 });
            }

            const payload = {
                title: exercise.title,
                description: exercise.description,
                instructions: exercise.instructions,
                exerciseType: exercise.exerciseType,
                difficulty: exercise.difficulty,
                points: exercise.points,
                hasTimer: exercise.hasTimer,
                timerMinutes: exercise.hasTimer ? exercise.timerMinutes : null,
                canvasState: currentCanvasState ? JSON.stringify(currentCanvasState) : null,
                canvasMode: exercise.canvasMode,
                answerType: exercise.answerType,
                correctAnswer: correctAnswerData,
                options: exercise.answerType === 'multiple_choice' ? JSON.stringify(exercise.options) : null,
                isPublished: exercise.isPublished
            };

            if (isEditing) {
                await classesAPI.updateExercise(classId!, exerciseId!, payload);
            } else {
                await classesAPI.createExercise(classId!, payload);
            }

            navigate(`/teacher/classes/${classId}?tab=exercises`);
        } catch (error) {
            console.error('Failed to save exercise:', error);
            alert('Gagal menyimpan latihan');
        } finally {
            setSaving(false);
        }
    };

    const addOption = () => {
        const newId = String(exercise.options.length + 1);
        setExercise(prev => ({
            ...prev,
            options: [...prev.options, { id: newId, text: '', isCorrect: false }]
        }));
    };

    const removeOption = (id: string) => {
        if (exercise.options.length <= 2) return;
        setExercise(prev => ({
            ...prev,
            options: prev.options.filter(o => o.id !== id)
        }));
    };

    const updateOption = (id: string, text: string) => {
        setExercise(prev => ({
            ...prev,
            options: prev.options.map(o => o.id === id ? { ...o, text } : o)
        }));
    };

    const setCorrectOption = (id: string) => {
        setExercise(prev => ({
            ...prev,
            options: prev.options.map(o => ({ ...o, isCorrect: o.id === id }))
        }));
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <div className="animate-spin" style={{ width: 48, height: 48, border: '4px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
            </div>
        );
    }

    const difficultyColors: Record<string, string> = {
        easy: '#22c55e',
        medium: '#f59e0b',
        hard: '#ef4444'
    };

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
                        onClick={() => navigate(`/teacher/classes/${classId}?tab=exercises`)}
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
                            {isEditing ? 'Edit Latihan' : 'Buat Latihan Baru'}
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                            Latihan interaktif dengan visualisasi geometri
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        style={{
                            background: previewMode ? 'var(--primary)' : '#f1f5f9',
                            color: previewMode ? 'white' : '#64748b',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: '600'
                        }}
                    >
                        {previewMode ? <EyeOff size={18} /> : <Eye size={18} />}
                        {previewMode ? 'Edit' : 'Preview'}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1.5rem',
                            borderRadius: '0.5rem',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: '600',
                            opacity: saving ? 0.7 : 1
                        }}
                    >
                        <Save size={18} />
                        {saving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', maxWidth: '1600px', margin: '0 auto' }}>
                {/* Left Panel - Settings */}
                <div style={{ width: '360px', flexShrink: 0 }}>
                    <div className="card glass" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Settings size={20} /> Pengaturan Latihan
                        </h3>

                        {/* Title */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.875rem', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                                Judul Latihan *
                            </label>
                            <input
                                type="text"
                                value={exercise.title}
                                onChange={(e) => setExercise(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Contoh: Luas Segitiga"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        {/* Description */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.875rem', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                                Deskripsi
                            </label>
                            <textarea
                                value={exercise.description}
                                onChange={(e) => setExercise(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Deskripsi singkat latihan..."
                                rows={2}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.9rem',
                                    resize: 'none'
                                }}
                            />
                        </div>

                        {/* Instructions */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.875rem', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                                Instruksi Soal
                            </label>
                            <textarea
                                value={exercise.instructions}
                                onChange={(e) => setExercise(prev => ({ ...prev, instructions: e.target.value }))}
                                placeholder="Instruksi untuk siswa mengerjakan..."
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.9rem',
                                    resize: 'none'
                                }}
                            />
                        </div>

                        {/* Difficulty & Points */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div>
                                <label style={{ fontWeight: '600', fontSize: '0.875rem', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                                    <Target size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                    Kesulitan
                                </label>
                                <select
                                    value={exercise.difficulty}
                                    onChange={(e) => setExercise(prev => ({ ...prev, difficulty: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '0.5rem',
                                        background: 'white',
                                        color: difficultyColors[exercise.difficulty]
                                    }}
                                >
                                    <option value="easy">Mudah</option>
                                    <option value="medium">Sedang</option>
                                    <option value="hard">Sulit</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontWeight: '600', fontSize: '0.875rem', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                                    <Zap size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                    Poin XP
                                </label>
                                <input
                                    type="number"
                                    value={exercise.points}
                                    onChange={(e) => setExercise(prev => ({ ...prev, points: parseInt(e.target.value) || 10 }))}
                                    min={1}
                                    max={100}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '0.5rem'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Timer Toggle */}
                        <div style={{ 
                            marginBottom: '1.25rem', 
                            padding: '1rem', 
                            background: '#f8fafc', 
                            borderRadius: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={18} color="#64748b" />
                                <span style={{ fontWeight: '600', color: '#374151' }}>Timer</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {exercise.hasTimer && (
                                    <input
                                        type="number"
                                        value={exercise.timerMinutes}
                                        onChange={(e) => setExercise(prev => ({ ...prev, timerMinutes: parseInt(e.target.value) || 10 }))}
                                        min={1}
                                        max={180}
                                        style={{
                                            width: '60px',
                                            padding: '0.5rem',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '0.375rem',
                                            textAlign: 'center'
                                        }}
                                    />
                                )}
                                {exercise.hasTimer && <span style={{ color: '#64748b', fontSize: '0.875rem' }}>menit</span>}
                                <button
                                    onClick={() => setExercise(prev => ({ ...prev, hasTimer: !prev.hasTimer }))}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                                >
                                    {exercise.hasTimer ? (
                                        <ToggleRight size={28} color="var(--primary)" />
                                    ) : (
                                        <ToggleLeft size={28} color="#94a3b8" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Canvas Mode */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.875rem', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                                <PenTool size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                Mode Canvas untuk Siswa
                            </label>
                            <select
                                value={exercise.canvasMode}
                                onChange={(e) => setExercise(prev => ({ ...prev, canvasMode: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.5rem',
                                    background: 'white'
                                }}
                            >
                                <option value="readonly">Hanya Lihat (Read-only)</option>
                                <option value="interactive">Interaktif (Bisa Gambar)</option>
                            </select>
                        </div>

                        {/* Answer Type */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.875rem', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                                Tipe Jawaban
                            </label>
                            <select
                                value={exercise.answerType}
                                onChange={(e) => setExercise(prev => ({ ...prev, answerType: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.5rem',
                                    background: 'white'
                                }}
                            >
                                <option value="multiple_choice">Pilihan Ganda</option>
                                <option value="numeric">Angka/Numerik</option>
                                <option value="canvas">Gambar di Canvas</option>
                            </select>
                        </div>

                        {/* Answer Options based on type */}
                        {exercise.answerType === 'multiple_choice' && (
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ fontWeight: '600', fontSize: '0.875rem', color: '#374151', display: 'block', marginBottom: '0.75rem' }}>
                                    Opsi Jawaban (klik untuk jawaban benar)
                                </label>
                                {exercise.options.map((option, idx) => (
                                    <div key={option.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <button
                                            onClick={() => setCorrectOption(option.id)}
                                            style={{
                                                background: option.isCorrect ? '#22c55e' : '#f1f5f9',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: 28,
                                                height: 28,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            {option.isCorrect ? (
                                                <CheckCircle size={16} color="white" />
                                            ) : (
                                                <Circle size={16} color="#94a3b8" />
                                            )}
                                        </button>
                                        <input
                                            type="text"
                                            value={option.text}
                                            onChange={(e) => updateOption(option.id, e.target.value)}
                                            placeholder={`Opsi ${String.fromCharCode(65 + idx)}`}
                                            style={{
                                                flex: 1,
                                                padding: '0.5rem 0.75rem',
                                                border: option.isCorrect ? '2px solid #22c55e' : '1px solid #e2e8f0',
                                                borderRadius: '0.5rem',
                                                background: option.isCorrect ? '#f0fdf4' : 'white'
                                            }}
                                        />
                                        {exercise.options.length > 2 && (
                                            <button
                                                onClick={() => removeOption(option.id)}
                                                style={{
                                                    background: '#fee2e2',
                                                    border: 'none',
                                                    borderRadius: '0.375rem',
                                                    padding: '0.375rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Trash2 size={14} color="#ef4444" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    onClick={addOption}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        border: '2px dashed #e2e8f0',
                                        borderRadius: '0.5rem',
                                        background: 'transparent',
                                        color: '#64748b',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        marginTop: '0.5rem'
                                    }}
                                >
                                    <Plus size={16} /> Tambah Opsi
                                </button>
                            </div>
                        )}

                        {exercise.answerType === 'numeric' && (
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ fontWeight: '600', fontSize: '0.875rem', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                                    <Hash size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                    Jawaban Benar (angka)
                                </label>
                                <input
                                    type="number"
                                    value={exercise.correctAnswer}
                                    onChange={(e) => setExercise(prev => ({ ...prev, correctAnswer: e.target.value }))}
                                    placeholder="Contoh: 42"
                                    step="0.01"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '0.5rem'
                                    }}
                                />
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                    Toleransi: ±0.01
                                </p>
                            </div>
                        )}

                        {exercise.answerType === 'canvas' && (
                            <div style={{ 
                                marginBottom: '1.25rem', 
                                padding: '1rem', 
                                background: '#fef3c7', 
                                borderRadius: '0.75rem',
                                border: '1px solid #fcd34d'
                            }}>
                                <p style={{ fontSize: '0.875rem', color: '#92400e' }}>
                                    <strong>Catatan:</strong> Jawaban canvas akan dinilai secara manual oleh guru.
                                </p>
                            </div>
                        )}

                        {/* Publish Toggle */}
                        <div style={{ 
                            padding: '1rem', 
                            background: exercise.isPublished ? '#dcfce7' : '#f1f5f9', 
                            borderRadius: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            border: exercise.isPublished ? '1px solid #86efac' : '1px solid transparent'
                        }}>
                            <div>
                                <span style={{ fontWeight: '600', color: exercise.isPublished ? '#166534' : '#374151' }}>
                                    {exercise.isPublished ? '✅ Dipublikasikan' : 'Belum Dipublikasikan'}
                                </span>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                    {exercise.isPublished ? 'Siswa dapat melihat latihan ini' : 'Hanya guru yang dapat melihat'}
                                </p>
                            </div>
                            <button
                                onClick={() => setExercise(prev => ({ ...prev, isPublished: !prev.isPublished }))}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                            >
                                {exercise.isPublished ? (
                                    <ToggleRight size={32} color="#22c55e" />
                                ) : (
                                    <ToggleLeft size={32} color="#94a3b8" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Canvas */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card glass" style={{ padding: '1.5rem' }}>
                        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                📐 Canvas Geometri
                            </h3>
                            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                Gambar soal visualisasi di sini
                            </span>
                        </div>
                        <div style={{ 
                            border: '2px solid #e2e8f0', 
                            borderRadius: '0.75rem', 
                            overflow: 'hidden',
                            background: '#fafafa'
                        }}>
                            <GeometryCanvas
                                ref={canvasRef}
                                width={800}
                                height={500}
                                initialState={canvasState || undefined}
                                onSave={(state) => setCanvasState(state)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExerciseEditor;
