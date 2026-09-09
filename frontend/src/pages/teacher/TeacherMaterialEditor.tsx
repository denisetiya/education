import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Loader, Edit, Trash2, X, BookOpen, Video, FileText, HelpCircle, AlertCircle, Link2, Settings, CheckSquare, Type, List } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { materialsAPI, classesAPI, getApiErrorMessage } from '../../utils/api';
import { RichTextEditor } from '../../components/RichTextEditor';
import type { QuizContent as SharedQuizContent, QuizQuestion, QuizSettings, QuestionType } from '../../types/quiz';
import type { ModuleExercise } from '../../types/api.types';

interface VideoContent { url: string; platform: 'youtube' | 'other'; }
interface BookContent { url: string; }

interface MaterialFormData {
    title: string;
    type: string;
    category: string;
    level: string;
    content: string;
    semester: number;
    grade: number;
    linkedQuizId: string;
    linkedExerciseId: string;
    minPassingScore: number;
    order: number | null;
}

interface SpecificFormState {
    videoUrl: string;
    bookUrl: string;
    quizContent: SharedQuizContent;
}

const initialFormData: MaterialFormData = {
    title: '', type: 'article', category: 'MATEMATIKA', level: 'Mudah',
    content: '', semester: 1, grade: 7, linkedQuizId: '', linkedExerciseId: '', minPassingScore: 70, order: null
};

const initialSpecificData: SpecificFormState = {
    videoUrl: '', bookUrl: '',
    quizContent: {
        questions: [],
        settings: { timeLimitSeconds: 0, shuffleQuestions: false, showResultsImmediately: true, enablePowerUps: false }
    }
};

export const TeacherMaterialEditor: React.FC = () => {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const notifications = useNotifications();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState<MaterialFormData>(initialFormData);
    const [specificData, setSpecificData] = useState<SpecificFormState>(initialSpecificData);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [quizList, setQuizList] = useState<{ id: string; title: string; category: string; grade: number; semester: number }[]>([]);
    const [exerciseList, setExerciseList] = useState<ModuleExercise[]>([]);
    const [loadingMaterial, setLoadingMaterial] = useState(false);

    const categories = ['MATEMATIKA', 'IPA', 'IPS', 'BAHASA_INDONESIA', 'BAHASA_INGGRIS', 'SENI', 'OLAHRAGA'];
    const levels = ['Mudah', 'Menengah', 'Sulit'];

    const types = [
        { id: 'article', label: 'Artikel / Teks', icon: FileText, description: 'Cocok untuk materi inti, ringkasan konsep, atau petunjuk langkah demi langkah.', background: '#eff6ff', color: '#1d4ed8' },
        { id: 'video', label: 'Video Pembelajaran', icon: Video, description: 'Tempel tautan video agar siswa bisa belajar lewat penjelasan visual yang singkat.', background: '#eef2ff', color: '#4338ca' },
        { id: 'quiz', label: 'Kuis Latihan', icon: HelpCircle, description: 'Bangun evaluasi cepat dengan pilihan ganda, benar salah, atau jawaban singkat.', background: '#fef3c7', color: '#92400e' },
        { id: 'book', label: 'E-Book / PDF', icon: BookOpen, description: 'Sediakan bahan baca lengkap atau lampiran PDF untuk pendalaman mandiri.', background: '#ecfeff', color: '#155e75' }
    ];

    const formatCategory = (category: string) => category.replace('_', ' ');

    // Fetch quizzes and interactive exercises for linking
    useEffect(() => {
        materialsAPI.getQuizzes().then(setQuizList).catch(() => {});
        classesAPI.getExerciseLibrary()
            .then(setExerciseList)
            .catch(() => {});
    }, []);

    // Load existing material for editing
    useEffect(() => {
        if (!id) return;
        setLoadingMaterial(true);
        materialsAPI.getById(id)
            .then((material) => {
                const baseData: MaterialFormData = {
                    title: material.title,
                    type: material.type,
                    category: material.category,
                    level: material.level,
                    content: material.content || '',
                    semester: material.semester,
                    grade: material.grade,
                    linkedQuizId: (material as any).linkedQuizId || '',
                    linkedExerciseId: material.linkedExerciseId || '',
                    minPassingScore: (material as any).minPassingScore ?? 70,
                    order: (material as any).order ?? null
                };

                const newSpecificData: SpecificFormState = { ...initialSpecificData };

                try {
                    if (material.type === 'video' && material.content) {
                        const vid = JSON.parse(material.content) as VideoContent;
                        newSpecificData.videoUrl = vid.url;
                    } else if (material.type === 'book' && material.content) {
                        const book = JSON.parse(material.content) as BookContent;
                        newSpecificData.bookUrl = book.url;
                    } else if (material.type === 'quiz' && material.content) {
                        const quiz = JSON.parse(material.content) as any;
                        if (quiz.questions && Array.isArray(quiz.questions)) {
                            const isOldSchema = quiz.questions.length > 0 && !quiz.questions[0].type;
                            if (isOldSchema) {
                                newSpecificData.quizContent.questions = quiz.questions.map((q: any) => ({
                                    id: q.id, type: 'multiple_choice', text: q.text,
                                    points: 10, options: q.options || [], correctIndex: q.correctIndex || 0
                                }));
                            } else {
                                newSpecificData.quizContent = quiz as SharedQuizContent;
                                if (!newSpecificData.quizContent.settings) {
                                    newSpecificData.quizContent.settings = { ...initialSpecificData.quizContent.settings };
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error('Error parsing material content', e);
                }

                setFormData(baseData);
                setSpecificData(newSpecificData);
            })
            .catch((err) => {
                notifications.error(getApiErrorMessage(err, 'Gagal memuat materi'), 'Materi tidak ditemukan');
                navigate('/teacher/materials');
            })
            .finally(() => setLoadingMaterial(false));
    }, [id, navigate, notifications]);

    // Quiz helpers
    const addQuestion = (type: QuestionType) => {
        let newQuestion: QuizQuestion;
        const newId = Date.now().toString();
        const base = { id: newId, text: '', points: 10 };

        if (type === 'multiple_choice') {
            newQuestion = { ...base, type: 'multiple_choice', options: ['', '', '', ''], correctIndex: 0 };
        } else if (type === 'true_false') {
            newQuestion = { ...base, type: 'true_false', correctValue: true };
        } else {
            newQuestion = { ...base, type: 'short_answer', correctAnswer: '' };
        }

        setSpecificData(prev => ({
            ...prev,
            quizContent: { ...prev.quizContent, questions: [...prev.quizContent.questions, newQuestion] }
        }));
    };

    const removeQuestion = (index: number) => {
        setSpecificData(prev => ({
            ...prev,
            quizContent: { ...prev.quizContent, questions: prev.quizContent.questions.filter((_, i) => i !== index) }
        }));
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        setSpecificData(prev => {
            const newQuestions = [...prev.quizContent.questions];
            newQuestions[index] = { ...newQuestions[index], [field]: value };
            return { ...prev, quizContent: { ...prev.quizContent, questions: newQuestions } };
        });
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        setSpecificData(prev => {
            const newQuestions = [...prev.quizContent.questions];
            const question = newQuestions[qIndex] as any;
            if (question.type === 'multiple_choice') {
                const newOptions = [...question.options];
                newOptions[oIndex] = value;
                question.options = newOptions;
            }
            return { ...prev, quizContent: { ...prev.quizContent, questions: newQuestions } };
        });
    };

    const updateSettings = (key: keyof QuizSettings, value: any) => {
        setSpecificData(prev => ({
            ...prev,
            quizContent: {
                ...prev.quizContent,
                settings: { ...prev.quizContent.settings, [key]: value }
            }
        }));
    };

    const validateQuiz = () => {
        if (specificData.quizContent.questions.length === 0) {
            setFormError('Tambahkan minimal 1 soal untuk kuis');
            return false;
        }
        for (let i = 0; i < specificData.quizContent.questions.length; i++) {
            const q = specificData.quizContent.questions[i];
            if (!q.text.trim()) {
                setFormError(`Soal #${i + 1}: Pertanyaan tidak boleh kosong`);
                return false;
            }
            if (q.type === 'multiple_choice') {
                for (let j = 0; j < ((q as any).options || []).length; j++) {
                    if (!(q as any).options[j].trim()) {
                        setFormError(`Soal #${i + 1}: Opsi ${j + 1} tidak boleh kosong`);
                        return false;
                    }
                }
            } else if (q.type === 'short_answer') {
                if (!(q as any).correctAnswer?.trim()) {
                    setFormError(`Soal #${i + 1}: Jawaban benar harus diisi`);
                    return false;
                }
            }
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!formData.title.trim()) {
            setFormError('Judul materi harus diisi');
            return;
        }

        let finalContent = formData.content;

        if (formData.type === 'video') {
            if (!specificData.videoUrl.trim()) {
                setFormError('URL video harus diisi');
                return;
            }
            finalContent = JSON.stringify({
                url: specificData.videoUrl,
                platform: specificData.videoUrl.includes('youtube') ? 'youtube' : 'other'
            } as VideoContent);
        } else if (formData.type === 'book') {
            if (!specificData.bookUrl.trim()) {
                setFormError('URL PDF/E-book harus diisi');
                return;
            }
            finalContent = JSON.stringify({ url: specificData.bookUrl } as BookContent);
        } else if (formData.type === 'quiz') {
            if (!validateQuiz()) return;
            finalContent = JSON.stringify(specificData.quizContent);
        } else if (formData.type === 'article') {
            if (!formData.content.trim()) {
                setFormError('Konten artikel harus diisi');
                return;
            }
        }

        try {
            setSubmitting(true);
            const payload = { ...formData, content: finalContent };

            if (isEditing && id) {
                await materialsAPI.update(id, payload);
                notifications.success('Materi berhasil diperbarui', 'Sukses');
            } else {
                await materialsAPI.create(payload);
                notifications.success('Materi berhasil dibuat', 'Sukses');
            }

            navigate('/teacher/materials');
        } catch (err) {
            setFormError(getApiErrorMessage(err, 'Gagal menyimpan materi'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingMaterial) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader className="animate-spin" size={40} style={{ color: 'var(--primary)' }} />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }} className="animate-slide-up">
            <button
                onClick={() => navigate('/teacher/materials')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
            >
                <ArrowLeft size={20} /> Kembali ke Daftar Materi
            </button>

            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', marginBottom: '2rem' }}>
                {isEditing ? 'Edit Materi' : 'Tambah Materi Baru'}
            </h1>

            {formError && (
                <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626' }}>
                    <AlertCircle size={20} /> {formError}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="card glass" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Title */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Judul Materi *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Masukkan judul materi"
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '1rem' }}
                                required
                            />
                        </div>

                        {/* General Info Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Kategori</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{formatCategory(cat)}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Level</label>
                                <select
                                    value={formData.level}
                                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}
                                >
                                    {levels.map(level => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Kelas / Semester</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <select
                                        value={formData.grade}
                                        onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}
                                    >
                                        <option value={7}>Kls 7</option>
                                        <option value={8}>Kls 8</option>
                                        <option value={9}>Kls 9</option>
                                    </select>
                                    <select
                                        value={formData.semester}
                                        onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}
                                    >
                                        <option value={1}>Sem 1</option>
                                        <option value={2}>Sem 2</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Material Type Selection */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', fontSize: '0.9rem' }}>Tipe Materi</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                                {types.map((t) => (
                                    <div
                                        key={t.id}
                                        onClick={() => setFormData({ ...formData, type: t.id })}
                                        style={{
                                            cursor: 'pointer', padding: '1rem',
                                            border: formData.type === t.id ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                                            background: formData.type === t.id ? '#f8fbff' : 'white',
                                            borderRadius: '0.9rem', display: 'flex', flexDirection: 'column',
                                            alignItems: 'flex-start', gap: '0.75rem', transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: t.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <t.icon size={22} color={t.color} />
                                        </div>
                                        <span style={{ fontSize: '0.95rem', fontWeight: formData.type === t.id ? '700' : '600', color: formData.type === t.id ? 'var(--primary)' : 'var(--text-main)' }}>
                                            {t.label}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{t.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quiz & Exercise Linking Section */}
                        {formData.type !== 'quiz' && (
                            <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                                    <Link2 size={18} /> Hubungkan dengan Quiz / Latihan
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                    Siswa akan diarahkan ke quiz atau latihan interaktif setelah membaca materi ini.
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>Quiz Terhubung</label>
                                        <select
                                            value={formData.linkedQuizId}
                                            onChange={(e) => setFormData({ ...formData, linkedQuizId: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', background: 'white' }}
                                        >
                                            <option value="">-- Tidak Terhubung --</option>
                                            {quizList.map(quiz => (
                                                <option key={quiz.id} value={quiz.id}>{quiz.title} (Kls {quiz.grade})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>Latihan Interaktif Terhubung</label>
                                        <select
                                            value={formData.linkedExerciseId}
                                            onChange={(e) => setFormData({ ...formData, linkedExerciseId: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', background: 'white' }}
                                        >
                                            <option value="">-- Tidak Terhubung --</option>
                                            {exerciseList.map(exercise => (
                                                <option key={exercise.id} value={exercise.id}>
                                                    {exercise.title} — {exercise.class?.name ?? '-'}{!exercise.isPublished ? ' (Draft)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {formData.linkedQuizId && (
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>Nilai Minimal Kelulusan</label>
                                            <input
                                                type="number" min={0} max={100}
                                                value={formData.minPassingScore}
                                                onChange={(e) => setFormData({ ...formData, minPassingScore: parseInt(e.target.value) || 70 })}
                                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>Urutan Materi (Opsional)</label>
                                        <input
                                            type="number" min={1}
                                            value={formData.order ?? ''}
                                            onChange={(e) => setFormData({ ...formData, order: e.target.value ? parseInt(e.target.value) : null })}
                                            placeholder="Contoh: 1, 2, 3..."
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Dynamic Content Form Based on Type */}
                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {formData.type === 'video' && <><Video size={20} /> Konten Video</>}
                                {formData.type === 'book' && <><BookOpen size={20} /> Konten E-Book</>}
                                {formData.type === 'quiz' && <><HelpCircle size={20} /> Builder Kuis</>}
                                {formData.type === 'article' && <><FileText size={20} /> Konten Artikel</>}
                            </h3>

                            {/* ARTICLE */}
                            {formData.type === 'article' && (
                                <RichTextEditor
                                    value={formData.content}
                                    onChange={(value) => setFormData({ ...formData, content: value })}
                                    placeholder="Tulis konten artikel di sini..."
                                />
                            )}

                            {/* VIDEO */}
                            {formData.type === 'video' && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>URL Video (YouTube)</label>
                                    <input
                                        type="url"
                                        value={specificData.videoUrl}
                                        onChange={(e) => setSpecificData({ ...specificData, videoUrl: e.target.value })}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}
                                    />
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Masukkan link lengkap video dari YouTube.</p>
                                </div>
                            )}

                            {/* BOOK */}
                            {formData.type === 'book' && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>URL File PDF / E-book</label>
                                    <input
                                        type="url"
                                        value={specificData.bookUrl}
                                        onChange={(e) => setSpecificData({ ...specificData, bookUrl: e.target.value })}
                                        placeholder="https://example.com/file.pdf"
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}
                                    />
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Masukkan link langsung (direct link) ke file PDF.</p>
                                </div>
                            )}

                            {/* QUIZ */}
                            {formData.type === 'quiz' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ background: '#f1f5f9', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                                        <h4 style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Settings size={18} /> Pengaturan Kuis
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Batas Waktu (Detik)</label>
                                                <input
                                                    type="number" min={0}
                                                    value={specificData.quizContent.settings?.timeLimitSeconds || 0}
                                                    onChange={(e) => updateSettings('timeLimitSeconds', parseInt(e.target.value) || 0)}
                                                    placeholder="0 = Tidak ada batas"
                                                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }}
                                                />
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>0 = Tidak ada batas waktu</span>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Fitur Game</label>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                                        <input type="checkbox" checked={specificData.quizContent.settings?.enablePowerUps || false} onChange={(e) => updateSettings('enablePowerUps', e.target.checked)} style={{ accentColor: 'var(--primary)' }} />
                                                        <span style={{ fontSize: '0.9rem' }}>Aktifkan Power-Ups (Bantuan)</span>
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                                        <input type="checkbox" checked={specificData.quizContent.settings?.showResultsImmediately ?? true} onChange={(e) => updateSettings('showResultsImmediately', e.target.checked)} style={{ accentColor: 'var(--primary)' }} />
                                                        <span style={{ fontSize: '0.9rem' }}>Tampilkan Hasil Langsung</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {specificData.quizContent.questions.map((q, qIndex) => (
                                        <div key={q.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontWeight: '700', color: 'var(--primary)', background: '#e0e7ff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>{qIndex + 1}</span>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{q.type.replace('_', ' ')}</span>
                                                </div>
                                                <button type="button" onClick={() => removeQuestion(qIndex)} style={{ color: '#dc2626', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: '500' }}>
                                                    <Trash2 size={14} /> Hapus Soal
                                                </button>
                                            </div>

                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Pertanyaan</label>
                                                <input type="text" value={q.text} onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                                                    placeholder="Tulis pertanyaan..."
                                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }} />
                                            </div>

                                            {q.type === 'multiple_choice' && (
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    {(q as any).options.map((opt: string, oIndex: number) => (
                                                        <div key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <input type="radio" name={`correct-${q.id}`} checked={(q as any).correctIndex === oIndex} onChange={() => updateQuestion(qIndex, 'correctIndex', oIndex)}
                                                                style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary)', cursor: 'pointer' }} />
                                                            <input type="text" value={opt} onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                                placeholder={`Opsi ${oIndex + 1}`}
                                                                style={{ flex: 1, padding: '0.6rem', border: (q as any).correctIndex === oIndex ? '1px solid var(--primary)' : '1px solid #e2e8f0', borderRadius: '0.5rem', background: (q as any).correctIndex === oIndex ? '#eff6ff' : 'white' }} />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {q.type === 'true_false' && (
                                                <div style={{ display: 'flex', gap: '2rem' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem 1.5rem', background: (q as any).correctValue === true ? '#dcfce7' : '#f8fafc', border: (q as any).correctValue === true ? '1px solid #16a34a' : '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
                                                        <input type="radio" name={`tf-${q.id}`} checked={(q as any).correctValue === true} onChange={() => updateQuestion(qIndex, 'correctValue', true)} style={{ accentColor: '#16a34a' }} />
                                                        <span style={{ fontWeight: '600', color: (q as any).correctValue === true ? '#16a34a' : 'inherit' }}>BENAR (True)</span>
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem 1.5rem', background: (q as any).correctValue === false ? '#fee2e2' : '#f8fafc', border: (q as any).correctValue === false ? '1px solid #dc2626' : '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
                                                        <input type="radio" name={`tf-${q.id}`} checked={(q as any).correctValue === false} onChange={() => updateQuestion(qIndex, 'correctValue', false)} style={{ accentColor: '#dc2626' }} />
                                                        <span style={{ fontWeight: '600', color: (q as any).correctValue === false ? '#dc2626' : 'inherit' }}>SALAH (False)</span>
                                                    </label>
                                                </div>
                                            )}

                                            {q.type === 'short_answer' && (
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Jawaban Benar</label>
                                                    <input type="text" value={(q as any).correctAnswer} onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                                                        placeholder="Ketik jawaban singkat yang benar..."
                                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', background: '#f8fafc' }} />
                                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                                        Jawaban siswa akan dicocokkan (tidak sensitif huruf besar/kecil).
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem' }}>
                                        <button type="button" onClick={() => addQuestion('multiple_choice')}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', color: 'var(--text-main)' }}>
                                            <List size={18} /> Pilihan Ganda
                                        </button>
                                        <button type="button" onClick={() => addQuestion('true_false')}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', color: 'var(--text-main)' }}>
                                            <CheckSquare size={18} /> Benar/Salah
                                        </button>
                                        <button type="button" onClick={() => addQuestion('short_answer')}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', color: 'var(--text-main)' }}>
                                            <Type size={18} /> Isian Singkat
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => navigate('/teacher/materials')}>
                                Batal
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting && <Loader className="animate-spin" size={20} style={{ marginRight: '0.5rem' }} />}
                                {isEditing ? 'Simpan Perubahan' : 'Tambah Materi'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};
