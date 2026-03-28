import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    EyeOff,
    FilePenLine,
    LayoutGrid,
    Plus,
    Save,
    Settings2,
    Sparkles,
    Trash2
} from 'lucide-react';
import GeometryCanvas, { type GeometryCanvasHandle } from '../../components/geometry/GeometryCanvas';
import type { CanvasState } from '../../components/geometry/types';
import {
    createEmptyCanvasState,
    createQuestionTemplate,
    getQuestionTypeLabel,
    parseExerciseQuestions,
    type ExerciseQuestion,
    type ExerciseQuestionMeasurement,
    type ExerciseQuestionShapeConfig,
    type ExerciseQuestionType
} from '../../features/exercises/exercise-config';
import { useNotifications } from '../../contexts/NotificationContext';
import { classesAPI, getApiErrorMessage } from '../../utils/api';

interface ExerciseFormState {
    title: string;
    description: string;
    instructions: string;
    exerciseType: string;
    difficulty: string;
    hasTimer: boolean;
    timerMinutes: number;
    isPublished: boolean;
    order: number;
    questions: ExerciseQuestion[];
}

const createInitialFormState = (): ExerciseFormState => ({
    title: '',
    description: '',
    instructions: '',
    exerciseType: 'mixed',
    difficulty: 'medium',
    hasTimer: false,
    timerMinutes: 15,
    isPublished: false,
    order: 0,
    questions: [createQuestionTemplate('multiple_choice', 0)]
});

const questionTypeButtons: Array<{ type: ExerciseQuestionType; label: string; description: string }> = [
    { type: 'multiple_choice', label: 'Pilihan Ganda', description: 'Cocok untuk konsep cepat dan pemahaman dasar.' },
    { type: 'numeric', label: 'Numerik', description: 'Untuk hitungan aljabar atau hasil akhir pasti.' },
    { type: 'short_text', label: 'Jawaban Singkat', description: 'Untuk alasan singkat atau istilah penting.' },
    { type: 'shape_area', label: 'Luas Bangun', description: 'Template khusus luas bangun datar.' },
    { type: 'shape_perimeter', label: 'Keliling Bangun', description: 'Template khusus keliling bangun datar.' },
    { type: 'canvas', label: 'Canvas Interaktif', description: 'Untuk konstruksi atau gambar yang direview guru.' }
];

type ExerciseShapeType = ExerciseQuestionShapeConfig['shapeType'];

const defaultShapeMeasurements: Record<ExerciseShapeType, ExerciseQuestionMeasurement[]> = {
    square: [{ label: 'Sisi', value: 0, unit: 'cm' }],
    rectangle: [
        { label: 'Panjang', value: 0, unit: 'cm' },
        { label: 'Lebar', value: 0, unit: 'cm' }
    ],
    triangle: [
        { label: 'Alas', value: 0, unit: 'cm' },
        { label: 'Tinggi', value: 0, unit: 'cm' }
    ],
    parallelogram: [
        { label: 'Alas', value: 0, unit: 'cm' },
        { label: 'Tinggi', value: 0, unit: 'cm' }
    ],
    circle: [{ label: 'Jari-jari', value: 0, unit: 'cm' }]
};

const normalizeQuestion = (question: ExerciseQuestion, index: number): ExerciseQuestion => {
    const clonedCanvasState = question.visual?.canvasState
        ? JSON.parse(JSON.stringify(question.visual.canvasState)) as CanvasState
        : createEmptyCanvasState();
    const nextQuestion: ExerciseQuestion = {
        ...question,
        id: question.id || `question_${index + 1}`,
        title: question.title.trim() || `Soal ${index + 1}`,
        prompt: question.prompt.trim(),
        points: Math.max(1, Number(question.points) || 10)
    };

    if (nextQuestion.type === 'canvas') {
        nextQuestion.manualReview = true;
        nextQuestion.visual = {
            enabled: true,
            canvasState: clonedCanvasState,
            canvasMode: 'interactive',
            showFunctionPanel: nextQuestion.visual?.showFunctionPanel ?? false,
            hideFunctionExpressions: nextQuestion.visual?.hideFunctionExpressions ?? true,
            showCoordinates: nextQuestion.visual?.showCoordinates ?? false,
            showToolbar: true,
            compactToolbar: true
        };
    } else if (nextQuestion.visual?.enabled) {
        nextQuestion.visual = {
            enabled: true,
            canvasState: clonedCanvasState,
            canvasMode: nextQuestion.visual.canvasMode || 'readonly',
            showFunctionPanel: nextQuestion.visual.showFunctionPanel ?? false,
            hideFunctionExpressions: nextQuestion.visual.hideFunctionExpressions ?? true,
            showCoordinates: nextQuestion.visual.showCoordinates ?? false,
            showToolbar: nextQuestion.visual.showToolbar ?? false,
            compactToolbar: true
        };
    } else {
        delete nextQuestion.visual;
    }

    if (nextQuestion.type === 'multiple_choice') {
        nextQuestion.options = (nextQuestion.options || [])
            .map((option) => ({ ...option, text: option.text.trim() }))
            .filter((option) => option.text);
    }

    if (nextQuestion.type === 'short_text') {
        const acceptedText = nextQuestion.acceptedText?.trim();

        if (!nextQuestion.manualReview && acceptedText) {
            nextQuestion.acceptedText = acceptedText;
        } else {
            delete nextQuestion.acceptedText;
        }
    } else {
        delete nextQuestion.acceptedText;
    }

    return nextQuestion;
};

const controlInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.85rem 0.95rem',
    borderRadius: '0.85rem',
    border: '1px solid #cbd5e1',
    background: 'white'
};

const formatNumericValue = (value: number) =>
    new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value);

export const ExerciseEditor: React.FC = () => {
    const { classId, exerciseId } = useParams<{ classId: string; exerciseId?: string }>();
    const navigate = useNavigate();
    const notifications = useNotifications();
    const [form, setForm] = React.useState<ExerciseFormState>(createInitialFormState());
    const [loading, setLoading] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const canvasRefs = React.useRef<Record<string, GeometryCanvasHandle | null>>({});
    const isEditing = Boolean(exerciseId);

    React.useEffect(() => {
        if (!classId || !exerciseId) {
            return;
        }

        const loadExercise = async () => {
            try {
                setLoading(true);
                const data = await classesAPI.getExercise(classId, exerciseId);
                setForm({
                    title: data.title || '',
                    description: data.description || '',
                    instructions: data.instructions || '',
                    exerciseType: data.exerciseType || 'mixed',
                    difficulty: data.difficulty || 'medium',
                    hasTimer: data.hasTimer || false,
                    timerMinutes: data.timerMinutes || 15,
                    isPublished: data.isPublished || false,
                    order: 0,
                    questions: parseExerciseQuestions(data)
                });
            } catch (error) {
                console.error('Failed to load exercise', error);
            } finally {
                setLoading(false);
            }
        };

        void loadExercise();
    }, [classId, exerciseId]);

    const totalPoints = React.useMemo(
        () => form.questions.reduce((sum, question) => sum + (Number(question.points) || 0), 0),
        [form.questions]
    );

    const updateQuestion = (questionId: string, updater: (question: ExerciseQuestion) => ExerciseQuestion) => {
        setForm((prev) => ({
            ...prev,
            questions: prev.questions.map((question) => question.id === questionId ? updater(question) : question)
        }));
    };

    const handleCanvasSave = React.useCallback((questionId: string, nextState: CanvasState) => {
        updateQuestion(questionId, (current) => ({
            ...current,
            visual: {
                enabled: true,
                canvasState: nextState,
                canvasMode: current.type === 'canvas' ? 'interactive' : current.visual?.canvasMode || 'readonly',
                showFunctionPanel: current.visual?.showFunctionPanel ?? false,
                hideFunctionExpressions: current.visual?.hideFunctionExpressions ?? true,
                showCoordinates: current.visual?.showCoordinates ?? false,
                showToolbar: current.type === 'canvas' ? true : current.visual?.showToolbar ?? false,
                compactToolbar: true
            }
        }));
    }, []);

    const handleQuestionTypeChange = (questionId: string, nextType: ExerciseQuestionType) => {
        updateQuestion(questionId, (question) => {
            const template = createQuestionTemplate(nextType, 0);
            return {
                ...template,
                id: question.id,
                title: question.title,
                prompt: question.prompt,
                points: question.points || template.points
            };
        });
    };

    const addQuestion = (type: ExerciseQuestionType) => {
        setForm((prev) => ({
            ...prev,
            questions: [...prev.questions, createQuestionTemplate(type, prev.questions.length)]
        }));
    };

    const removeQuestion = (questionId: string) => {
        if (form.questions.length === 1) {
            notifications.warning('Latihan minimal memiliki satu soal.', 'Jumlah soal belum cukup');
            return;
        }

        setForm((prev) => ({
            ...prev,
            questions: prev.questions.filter((question) => question.id !== questionId)
        }));
    };

    const handleSave = async () => {
        if (!classId) {
            return;
        }

        const title = form.title.trim();
        if (!title) {
            notifications.warning('Judul latihan wajib diisi.', 'Lengkapi meta latihan');
            return;
        }

        const normalizedQuestions = form.questions.map((question, index) => {
            const latestCanvasState = question.visual?.enabled
                ? canvasRefs.current[question.id]?.getState() ?? (question.visual.canvasState as CanvasState | undefined) ?? createEmptyCanvasState()
                : undefined;

            return normalizeQuestion({
                ...question,
                visual: question.visual?.enabled
                    ? {
                        ...question.visual,
                        canvasState: latestCanvasState
                    }
                    : question.visual
            }, index);
        });
        const invalidQuestion = normalizedQuestions.find((question) => !question.prompt);
        if (invalidQuestion) {
            notifications.warning('Semua soal harus memiliki prompt atau instruksi yang jelas.', 'Soal belum lengkap');
            return;
        }

        const invalidShortText = normalizedQuestions.find(
            (question) => question.type === 'short_text' && !question.manualReview && !question.acceptedText?.trim()
        );
        if (invalidShortText) {
            notifications.warning(
                'Jawaban singkat otomatis perlu jawaban referensi atau aktifkan review manual.',
                'Atur kunci jawaban singkat'
            );
            return;
        }

        const invalidMultipleChoice = normalizedQuestions.find(
            (question) => question.type === 'multiple_choice' && (!question.options || question.options.length < 2 || !question.correctOptionId)
        );
        if (invalidMultipleChoice) {
            notifications.warning(
                'Soal pilihan ganda butuh minimal dua opsi dan satu jawaban benar.',
                'Periksa opsi jawaban'
            );
            return;
        }

        try {
            setSaving(true);
            const payload = {
                title,
                description: form.description.trim(),
                instructions: form.instructions.trim(),
                exerciseType: form.exerciseType,
                difficulty: form.difficulty,
                hasTimer: form.hasTimer,
                timerMinutes: form.hasTimer ? form.timerMinutes : null,
                isPublished: form.isPublished,
                order: form.order,
                questionSet: normalizedQuestions
            };

            if (isEditing && exerciseId) {
                await classesAPI.updateExercise(classId, exerciseId, payload);
            } else {
                await classesAPI.createExercise(classId, payload);
            }

            navigate(`/teacher/classes/${classId}?tab=exercises`);
            notifications.success(
                isEditing ? 'Perubahan latihan sudah tersimpan.' : 'Latihan baru berhasil disimpan.',
                'Latihan siap digunakan'
            );
        } catch (error) {
            console.error('Failed to save exercise', error);
            notifications.error(
                getApiErrorMessage(error, 'Gagal menyimpan latihan.'),
                'Latihan belum tersimpan'
            );
        } finally {
            setSaving(false);
        }
    };

    if (!classId) {
        return null;
    }

    if (loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                Memuat editor latihan...
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)' }}>
            <header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 20,
                    borderBottom: '1px solid #e2e8f0',
                    background: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(14px)'
                }}
            >
                <div style={{ maxWidth: '1480px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => navigate(`/teacher/classes/${classId}?tab=exercises`)}
                            style={{ width: '42px', height: '42px', borderRadius: '999px', border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>
                                {isEditing ? 'Edit latihan kelas' : 'Buat latihan baru'}
                            </h1>
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                Multi-soal, grafik fungsi opsional, bangun datar, dan canvas interaktif dalam satu paket.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => void handleSave()}
                        disabled={saving}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.9rem 1.2rem',
                            borderRadius: '0.95rem',
                            border: 'none',
                            background: saving ? '#94a3b8' : 'linear-gradient(135deg, #4f46e5, #2563eb)',
                            color: 'white',
                            fontWeight: '800',
                            cursor: saving ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <Save size={18} />
                        {saving ? 'Menyimpan...' : 'Simpan latihan'}
                    </button>
                </div>
            </header>

            <div style={{ maxWidth: '1480px', margin: '0 auto', padding: '1.5rem', display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '6rem' }}>
                    <div className="card glass" style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                            <Settings2 size={18} color="#4f46e5" />
                            <h2 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>Meta latihan</h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            <input
                                value={form.title}
                                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                                placeholder="Judul latihan"
                                style={controlInputStyle}
                            />
                            <textarea
                                value={form.description}
                                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                                rows={3}
                                placeholder="Ringkasan singkat untuk guru dan siswa"
                                style={{ ...controlInputStyle, resize: 'vertical', lineHeight: 1.6 }}
                            />
                            <textarea
                                value={form.instructions}
                                onChange={(event) => setForm((prev) => ({ ...prev, instructions: event.target.value }))}
                                rows={4}
                                placeholder="Petunjuk umum sebelum siswa mulai mengerjakan"
                                style={{ ...controlInputStyle, resize: 'vertical', lineHeight: 1.6 }}
                            />
                            <select
                                value={form.exerciseType}
                                onChange={(event) => setForm((prev) => ({ ...prev, exerciseType: event.target.value }))}
                                style={controlInputStyle}
                            >
                                <option value="mixed">Campuran</option>
                                <option value="algebra_visual">Aljabar visual</option>
                                <option value="plane_geometry">Bangun datar</option>
                                <option value="constructive_geometry">Konstruksi visual</option>
                            </select>
                            <select
                                value={form.difficulty}
                                onChange={(event) => setForm((prev) => ({ ...prev, difficulty: event.target.value }))}
                                style={controlInputStyle}
                            >
                                <option value="easy">Mudah</option>
                                <option value="medium">Sedang</option>
                                <option value="hard">Sulit</option>
                            </select>
                        </div>
                    </div>

                    <div className="card glass" style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{ padding: '0.9rem', borderRadius: '0.9rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                <p style={{ color: '#64748b', fontSize: '0.74rem', marginBottom: '0.25rem' }}>Jumlah soal</p>
                                <p style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a' }}>{form.questions.length}</p>
                            </div>
                            <div style={{ padding: '0.9rem', borderRadius: '0.9rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                <p style={{ color: '#64748b', fontSize: '0.74rem', marginBottom: '0.25rem' }}>Total poin</p>
                                <p style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a' }}>{totalPoints}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                                <span style={{ fontWeight: '700', color: '#0f172a' }}>Aktifkan timer</span>
                                <input
                                    type="checkbox"
                                    checked={form.hasTimer}
                                    onChange={(event) => setForm((prev) => ({ ...prev, hasTimer: event.target.checked }))}
                                />
                            </label>
                            {form.hasTimer && (
                                <input
                                    type="number"
                                    min={1}
                                    max={180}
                                    value={form.timerMinutes}
                                    onChange={(event) => setForm((prev) => ({ ...prev, timerMinutes: Number(event.target.value) || 15 }))}
                                    style={controlInputStyle}
                                />
                            )}
                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                                <span style={{ fontWeight: '700', color: '#0f172a' }}>Langsung publikasikan</span>
                                <input
                                    type="checkbox"
                                    checked={form.isPublished}
                                    onChange={(event) => setForm((prev) => ({ ...prev, isPublished: event.target.checked }))}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="card glass" style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.85rem' }}>
                            <Sparkles size={18} color="#2563eb" />
                            <h2 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>Tambah soal</h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {questionTypeButtons.map((button) => (
                                <button
                                    key={button.type}
                                    onClick={() => addQuestion(button.type)}
                                    style={{ width: '100%', textAlign: 'left', padding: '0.85rem 0.95rem', borderRadius: '0.95rem', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}
                                >
                                    <p style={{ fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>{button.label}</p>
                                    <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5 }}>{button.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                <main style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="card glass" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                        <div>
                            <p style={{ color: '#4338ca', fontWeight: '700', fontSize: '0.82rem', marginBottom: '0.35rem' }}>Builder latihan profesional</p>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.3rem' }}>Buat paket soal yang utuh</h2>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                Setiap soal bisa memakai grafik fungsi, visual bangun datar, atau canvas interaktif secara terpisah.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ padding: '0.35rem 0.65rem', borderRadius: '999px', background: '#eef2ff', color: '#4338ca', fontWeight: '700', fontSize: '0.75rem' }}>
                                <LayoutGrid size={14} style={{ display: 'inline', marginRight: '0.35rem' }} />
                                Multi-soal
                            </span>
                            <span style={{ padding: '0.35rem 0.65rem', borderRadius: '999px', background: '#dcfce7', color: '#166534', fontWeight: '700', fontSize: '0.75rem' }}>
                                <FilePenLine size={14} style={{ display: 'inline', marginRight: '0.35rem' }} />
                                User-friendly
                            </span>
                        </div>
                    </div>

                    {form.questions.map((question, index) => {
                        const visualEnabled = question.type === 'canvas' || Boolean(question.visual?.enabled);

                        return (
                            <section key={question.id} className="card glass" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                                    <div>
                                        <p style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: '0.25rem' }}>Soal {index + 1}</p>
                                        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>{question.title || `Soal ${index + 1}`}</h3>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <select
                                            value={question.type}
                                            onChange={(event) => handleQuestionTypeChange(question.id, event.target.value as ExerciseQuestionType)}
                                            style={controlInputStyle}
                                        >
                                            {questionTypeButtons.map((button) => (
                                                <option key={button.type} value={button.type}>{button.label}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            min={1}
                                            max={100}
                                            value={question.points}
                                            onChange={(event) => updateQuestion(question.id, (current) => ({ ...current, points: Number(event.target.value) || 10 }))}
                                            style={{ ...controlInputStyle, width: '110px' }}
                                        />
                                        <button
                                            onClick={() => removeQuestion(question.id)}
                                            style={{ width: '42px', height: '42px', borderRadius: '0.85rem', border: 'none', background: '#fee2e2', color: '#b91c1c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: '0.85rem' }}>
                                    <input
                                        value={question.title}
                                        onChange={(event) => updateQuestion(question.id, (current) => ({ ...current, title: event.target.value }))}
                                        placeholder={`Judul ringkas soal ${index + 1}`}
                                        style={controlInputStyle}
                                    />
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.9rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontWeight: '700' }}>
                                        {getQuestionTypeLabel(question.type)}
                                    </div>
                                </div>

                                <textarea
                                    value={question.prompt}
                                    onChange={(event) => updateQuestion(question.id, (current) => ({ ...current, prompt: event.target.value }))}
                                    rows={3}
                                    placeholder="Tulis pertanyaan atau instruksi yang akan dibaca siswa."
                                    style={{ ...controlInputStyle, resize: 'vertical', lineHeight: 1.7 }}
                                />

                                {question.type === 'multiple_choice' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                        {(question.options || []).map((option, optionIndex) => (
                                            <div key={option.id} style={{ display: 'grid', gridTemplateColumns: '52px minmax(0, 1fr) 48px', gap: '0.6rem', alignItems: 'center' }}>
                                                <button
                                                    onClick={() => updateQuestion(question.id, (current) => ({
                                                        ...current,
                                                        correctOptionId: option.id
                                                    }))}
                                                    style={{
                                                        width: '48px',
                                                        height: '48px',
                                                        borderRadius: '0.9rem',
                                                        border: question.correctOptionId === option.id ? '2px solid #16a34a' : '1px solid #cbd5e1',
                                                        background: question.correctOptionId === option.id ? '#f0fdf4' : 'white',
                                                        color: question.correctOptionId === option.id ? '#166534' : '#475569',
                                                        cursor: 'pointer',
                                                        fontWeight: '800'
                                                    }}
                                                >
                                                    {String.fromCharCode(65 + optionIndex)}
                                                </button>
                                                <input
                                                    value={option.text}
                                                    onChange={(event) => updateQuestion(question.id, (current) => ({
                                                        ...current,
                                                        options: (current.options || []).map((item) => item.id === option.id ? { ...item, text: event.target.value } : item)
                                                    }))}
                                                    placeholder={`Opsi ${String.fromCharCode(65 + optionIndex)}`}
                                                    style={controlInputStyle}
                                                />
                                                <button
                                                    onClick={() => updateQuestion(question.id, (current) => ({
                                                        ...current,
                                                        options: (current.options || []).filter((item) => item.id !== option.id)
                                                    }))}
                                                    style={{ width: '44px', height: '44px', borderRadius: '0.85rem', border: 'none', background: '#fee2e2', color: '#b91c1c', cursor: 'pointer' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => updateQuestion(question.id, (current) => ({
                                                ...current,
                                                options: [...(current.options || []), { id: `opt_${Date.now()}`, text: '' }]
                                            }))}
                                            style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.7rem 0.95rem', borderRadius: '0.85rem', border: '1px dashed #94a3b8', background: 'white', cursor: 'pointer', fontWeight: '700', color: '#334155' }}
                                        >
                                            <Plus size={16} />
                                            Tambah opsi
                                        </button>
                                    </div>
                                )}

                                {(question.type === 'numeric' || question.type === 'shape_area' || question.type === 'shape_perimeter') && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                        <div
                                            style={{
                                                padding: '0.9rem 1rem',
                                                borderRadius: '1rem',
                                                background: '#f8fafc',
                                                border: '1px solid #e2e8f0'
                                            }}
                                        >
                                            <p style={{ fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>
                                                Penilaian jawaban angka
                                            </p>
                                            <p style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.6 }}>
                                                Kolom pertama adalah jawaban yang dianggap benar. Kolom kedua adalah toleransi
                                                plus-minus untuk koreksi otomatis.
                                            </p>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                                            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                                <span style={{ fontWeight: '700', color: '#0f172a' }}>Jawaban benar</span>
                                                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                                    Nilai target yang harus dijawab siswa.
                                                </span>
                                                <input
                                                    type="number"
                                                    value={question.correctValue ?? 0}
                                                    onChange={(event) => updateQuestion(question.id, (current) => ({ ...current, correctValue: Number(event.target.value) }))}
                                                    placeholder="Contoh: 24"
                                                    style={controlInputStyle}
                                                />
                                            </label>

                                            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                                <span style={{ fontWeight: '700', color: '#0f172a' }}>Toleransi (+/-)</span>
                                                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                                    Isi `0` jika jawaban harus persis sama.
                                                </span>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    step="0.01"
                                                    value={question.tolerance ?? 0}
                                                    onChange={(event) => updateQuestion(question.id, (current) => ({ ...current, tolerance: Number(event.target.value) }))}
                                                    placeholder="Contoh: 0.5"
                                                    style={controlInputStyle}
                                                />
                                            </label>
                                        </div>

                                        <div
                                            style={{
                                                padding: '0.85rem 0.95rem',
                                                borderRadius: '0.95rem',
                                                background: 'rgba(37, 99, 235, 0.06)',
                                                border: '1px solid rgba(37, 99, 235, 0.12)',
                                                color: '#334155',
                                                fontSize: '0.82rem',
                                                lineHeight: 1.6
                                            }}
                                        >
                                            {(question.tolerance ?? 0) > 0
                                                ? `Contoh penilaian: jika jawaban benar ${formatNumericValue(question.correctValue ?? 0)} dan toleransi ${formatNumericValue(question.tolerance ?? 0)}, maka sistem menerima jawaban dari ${formatNumericValue((question.correctValue ?? 0) - (question.tolerance ?? 0))} sampai ${formatNumericValue((question.correctValue ?? 0) + (question.tolerance ?? 0))}.`
                                                : `Contoh penilaian: jika jawaban benar ${formatNumericValue(question.correctValue ?? 0)} dan toleransi 0, maka siswa harus menjawab tepat ${formatNumericValue(question.correctValue ?? 0)}.`}
                                        </div>
                                    </div>
                                )}

                                {question.type === 'short_text' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.9rem 1rem', borderRadius: '0.95rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                            <div>
                                                <p style={{ fontWeight: '800', color: '#0f172a', marginBottom: '0.2rem' }}>Review manual oleh guru</p>
                                                <p style={{ color: '#64748b', fontSize: '0.82rem' }}>Aktifkan jika jawaban perlu dinilai secara kualitatif.</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={Boolean(question.manualReview)}
                                                onChange={(event) => updateQuestion(question.id, (current) => ({ ...current, manualReview: event.target.checked }))}
                                            />
                                        </label>
                                        {!question.manualReview && (
                                            <input
                                                value={question.acceptedText || ''}
                                                onChange={(event) => updateQuestion(question.id, (current) => ({ ...current, acceptedText: event.target.value }))}
                                                placeholder="Jawaban referensi, misalnya: persegi"
                                                style={controlInputStyle}
                                            />
                                        )}
                                    </div>
                                )}

                                {(question.type === 'shape_area' || question.type === 'shape_perimeter') && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <select
                                            value={question.shape?.shapeType || 'rectangle'}
                                            onChange={(event) => updateQuestion(question.id, (current) => ({
                                                ...current,
                                                shape: {
                                                    shapeType: event.target.value as ExerciseShapeType,
                                                    measurements: defaultShapeMeasurements[event.target.value as ExerciseShapeType].map((measurement) => ({ ...measurement })),
                                                    formulaHint: current.shape?.formulaHint || ''
                                                }
                                            }))}
                                            style={controlInputStyle}
                                        >
                                            <option value="square">Persegi</option>
                                            <option value="rectangle">Persegi panjang</option>
                                            <option value="triangle">Segitiga</option>
                                            <option value="parallelogram">Jajar genjang</option>
                                            <option value="circle">Lingkaran</option>
                                        </select>

                                        {(question.shape?.measurements || []).map((measurement, measurementIndex) => (
                                            <div key={`${question.id}-${measurement.label}-${measurementIndex}`} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 120px 100px', gap: '0.6rem' }}>
                                                <input
                                                    value={measurement.label}
                                                    onChange={(event) => updateQuestion(question.id, (current) => ({
                                                        ...current,
                                                        shape: current.shape ? {
                                                            ...current.shape,
                                                            measurements: current.shape.measurements.map((item, indexValue) => indexValue === measurementIndex ? { ...item, label: event.target.value } : item)
                                                        } : current.shape
                                                    }))}
                                                    placeholder="Label ukuran"
                                                    style={controlInputStyle}
                                                />
                                                <input
                                                    type="number"
                                                    value={measurement.value}
                                                    onChange={(event) => updateQuestion(question.id, (current) => ({
                                                        ...current,
                                                        shape: current.shape ? {
                                                            ...current.shape,
                                                            measurements: current.shape.measurements.map((item, indexValue) => indexValue === measurementIndex ? { ...item, value: Number(event.target.value) } : item)
                                                        } : current.shape
                                                    }))}
                                                    placeholder="Nilai"
                                                    style={controlInputStyle}
                                                />
                                                <input
                                                    value={measurement.unit || ''}
                                                    onChange={(event) => updateQuestion(question.id, (current) => ({
                                                        ...current,
                                                        shape: current.shape ? {
                                                            ...current.shape,
                                                            measurements: current.shape.measurements.map((item, indexValue) => indexValue === measurementIndex ? { ...item, unit: event.target.value } : item)
                                                        } : current.shape
                                                    }))}
                                                    placeholder="Satuan"
                                                    style={controlInputStyle}
                                                />
                                            </div>
                                        ))}

                                        <input
                                            value={question.shape?.formulaHint || ''}
                                            onChange={(event) => updateQuestion(question.id, (current) => ({
                                                ...current,
                                                shape: current.shape ? { ...current.shape, formulaHint: event.target.value } : current.shape
                                            }))}
                                            placeholder="Hint rumus opsional, misalnya: Luas = alas x tinggi / 2"
                                            style={controlInputStyle}
                                        />
                                    </div>
                                )}

                                <div style={{ padding: '1rem', borderRadius: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                                        <div>
                                            <p style={{ fontWeight: '800', color: '#0f172a', marginBottom: '0.2rem' }}>Visual grafik atau canvas</p>
                                            <p style={{ color: '#64748b', fontSize: '0.82rem' }}>
                                                Aktifkan jika soal perlu area visual, grafik fungsi, atau media gambar.
                                            </p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={visualEnabled}
                                            onChange={(event) => updateQuestion(question.id, (current) => ({
                                                ...current,
                                                visual: event.target.checked
                                                    ? {
                                                        enabled: true,
                                                        canvasState: current.visual?.canvasState || createEmptyCanvasState(),
                                                        canvasMode: current.type === 'canvas' ? 'interactive' : current.visual?.canvasMode || 'readonly',
                                                        showFunctionPanel: current.visual?.showFunctionPanel ?? false,
                                                        hideFunctionExpressions: current.visual?.hideFunctionExpressions ?? true,
                                                        showCoordinates: current.visual?.showCoordinates ?? false,
                                                        showToolbar: current.type === 'canvas' ? true : current.visual?.showToolbar ?? false,
                                                        compactToolbar: true
                                                    }
                                                    : undefined
                                            }))}
                                        />
                                    </div>

                                    {visualEnabled && (
                                        <>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.8rem 0.9rem', borderRadius: '0.85rem', background: 'white', border: '1px solid #e2e8f0' }}>
                                                    <span style={{ fontWeight: '700', color: '#0f172a' }}>Siswa boleh edit canvas</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={question.type === 'canvas' || question.visual?.canvasMode === 'interactive'}
                                                        onChange={(event) => updateQuestion(question.id, (current) => ({
                                                            ...current,
                                                            visual: {
                                                                enabled: true,
                                                                canvasState: current.visual?.canvasState || createEmptyCanvasState(),
                                                                canvasMode: event.target.checked ? 'interactive' : 'readonly',
                                                                showFunctionPanel: current.visual?.showFunctionPanel ?? false,
                                                                hideFunctionExpressions: current.visual?.hideFunctionExpressions ?? true,
                                                                showCoordinates: current.visual?.showCoordinates ?? false,
                                                                showToolbar: event.target.checked,
                                                                compactToolbar: true
                                                            }
                                                        }))}
                                                        disabled={question.type === 'canvas'}
                                                    />
                                                </label>
                                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.8rem 0.9rem', borderRadius: '0.85rem', background: 'white', border: '1px solid #e2e8f0' }}>
                                                    <span style={{ fontWeight: '700', color: '#0f172a' }}>Tampilkan panel grafik</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(question.visual?.showFunctionPanel)}
                                                        onChange={(event) => updateQuestion(question.id, (current) => ({
                                                            ...current,
                                                            visual: current.visual ? { ...current.visual, enabled: true, showFunctionPanel: event.target.checked } : current.visual
                                                        }))}
                                                    />
                                                </label>
                                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.8rem 0.9rem', borderRadius: '0.85rem', background: 'white', border: '1px solid #e2e8f0' }}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontWeight: '700', color: '#0f172a' }}>
                                                        <EyeOff size={16} />
                                                        Sembunyikan rumus fungsi
                                                    </span>
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(question.visual?.hideFunctionExpressions)}
                                                        onChange={(event) => updateQuestion(question.id, (current) => ({
                                                            ...current,
                                                            visual: current.visual ? { ...current.visual, enabled: true, hideFunctionExpressions: event.target.checked } : current.visual
                                                        }))}
                                                    />
                                                </label>
                                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.8rem 0.9rem', borderRadius: '0.85rem', background: 'white', border: '1px solid #e2e8f0' }}>
                                                    <span style={{ fontWeight: '700', color: '#0f172a' }}>Tampilkan koordinat</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(question.visual?.showCoordinates)}
                                                        onChange={(event) => updateQuestion(question.id, (current) => ({
                                                            ...current,
                                                            visual: current.visual ? { ...current.visual, enabled: true, showCoordinates: event.target.checked } : current.visual
                                                        }))}
                                                    />
                                                </label>
                                            </div>

                                            <div style={{ borderRadius: '1rem', overflow: 'hidden', border: '1px solid #dbe3f1', background: 'white' }}>
                                                <GeometryCanvas
                                                    ref={(instance) => {
                                                        canvasRefs.current[question.id] = instance;
                                                    }}
                                                    width={920}
                                                    height={420}
                                                    initialState={(question.visual?.canvasState as CanvasState | undefined) || createEmptyCanvasState()}
                                                    onSave={(nextState) => handleCanvasSave(question.id, nextState)}
                                                    compactMode
                                                    showToolbar={Boolean(question.type === 'canvas' || question.visual?.showToolbar)}
                                                    showFunctionPanel={Boolean(question.visual?.showFunctionPanel)}
                                                    hideFunctionExpressions={Boolean(question.visual?.hideFunctionExpressions)}
                                                    showCoordinates={Boolean(question.visual?.showCoordinates)}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </section>
                        );
                    })}
                </main>
            </div>
        </div>
    );
};

export default ExerciseEditor;
