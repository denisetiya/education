import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, BookOpen, Video, FileText, Clock, User, Loader, AlertCircle, Award, HelpCircle, Zap, Timer, ChevronRight, Trophy, Target, PenTool } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { materialsAPI, progressAPI, getApiErrorMessage } from '../../utils/api';
import type { QuizContent as SharedQuizContent } from '../../types/quiz';

interface Material {
    id: string;
    title: string;
    type: string;
    category: string;
    level: string;
    content: string | null;
    semester: number;
    grade: number;
    createdAt: string;
    createdBy?: { name: string };
    linkedQuizId?: string | null;
    linkedQuiz?: { id: string; title: string; type: string } | null;
    linkedExerciseId?: string | null;
    linkedExercise?: { id: string; title: string; class: { id: string; name: string } } | null;
    minPassingScore?: number | null;
    order?: number | null;
}

interface ProgressData {
    status: string;
    timeSpent: number;
    completedAt?: string;
    score?: number;
}

interface VideoContent {
    url: string;
    platform: 'youtube' | 'other';
}

interface BookContent {
    url: string;
}

const detectVideoPlatform = (url: string): VideoContent['platform'] =>
    /youtube\.com|youtu\.be/i.test(url) ? 'youtube' : 'other';

export const StudentMaterialView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const notifications = useNotifications();

    const [material, setMaterial] = useState<Material | null>(null);
    const [progress, setProgress] = useState<ProgressData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [completing, setCompleting] = useState(false);
    const [showXPNotification, setShowXPNotification] = useState(false);
    const [xpEarned, setXpEarned] = useState(0);

    // Quiz State
    const [quizContent, setQuizContent] = useState<SharedQuizContent | null>(null);
    const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({}); // Value depends on type
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizScore, setQuizScore] = useState(0);

    // Gamification State
    const [gameStarted, setGameStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0); // in seconds
    const [isTimerPaused, setIsTimerPaused] = useState(false);
    const [powerUps, setPowerUps] = useState({ fiftyFifty: 1, timeFreeze: 1 });
    const [eliminatedOptions, setEliminatedOptions] = useState<Record<string, number[]>>({}); // questionId -> [indices]

    // Linked Quiz State
    const [showQuizPrompt, setShowQuizPrompt] = useState(false);
    const [showExercisePrompt, setShowExercisePrompt] = useState(false);

    const startTimeRef = useRef<number>(Date.now());
    const timeTrackerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const saveTimeSpent = React.useCallback(async () => {
        if (!id) return;
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        try {
            await progressAPI.update(id, { timeSpent });
        } catch (err) {
            console.error('Failed to save time:', err);
        }
    }, [id]);

    const startTracking = React.useCallback(() => {
        startTimeRef.current = Date.now();
        // Update time every 30 seconds
        timeTrackerRef.current = setInterval(() => {
            saveTimeSpent();
        }, 30000);
    }, [saveTimeSpent]);

    const fetchMaterialAndProgress = React.useCallback(async () => {
        try {
            setLoading(true);
            const [materialData, progressData] = await Promise.all([
                materialsAPI.getById(id!),
                progressAPI.getMaterialProgress(id!)
            ]);
            
            // Parse quiz content if applicable
            let quizData: SharedQuizContent | null = null;
            if (materialData.type === 'quiz' && materialData.content) {
                try {
                    const parsed = JSON.parse(materialData.content);
                    // Handle legacy format or new format
                    if (parsed.questions && !parsed.settings) {
                         quizData = {
                             questions: parsed.questions.map((q: any) => ({
                                 ...q, 
                                 type: 'multiple_choice',
                                 points: 10,
                                 correctIndex: q.correctIndex || 0
                             })),
                             settings: { timeLimitSeconds: 0, shuffleQuestions: false, showResultsImmediately: true, enablePowerUps: false }
                         };
                    } else {
                        quizData = parsed;
                    }
                } catch (e) {
                    console.error("Failed to parse quiz content", e);
                }
            }

            setQuizContent(quizData);
            setMaterial(materialData);
            setProgress(progressData);

            // If quiz already took, restore state
            // If quiz already took, restore state (only if score is not null/undefined)
            if (progressData?.score != null) {
                 setQuizScore(progressData.score);
                 setQuizSubmitted(true);
            }

            // Mark as started
            if (progressData?.status === 'not_started' || !progressData) {
                 await progressAPI.start(id!);
            }
           
            setError(null);
        } catch (err) {
            console.error('Failed to fetch material:', err);
            setError('Materi tidak ditemukan');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchMaterialAndProgress();
            startTracking();
        }

        return () => {
            // Save progress when leaving
            if (timeTrackerRef.current) {
                clearInterval(timeTrackerRef.current);
            }
            saveTimeSpent();
        };
    }, [id, fetchMaterialAndProgress, startTracking, saveTimeSpent]);

    // Game Timer Logic
    useEffect(() => {
        if (!gameStarted || quizSubmitted || isTimerPaused || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    submitQuiz();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameStarted, quizSubmitted, isTimerPaused, timeLeft]);

    const handleStartQuiz = () => {
        if (!quizContent) return;
        setGameStarted(true);
        if (quizContent.settings?.timeLimitSeconds > 0) {
            setTimeLeft(quizContent.settings.timeLimitSeconds);
        }
        // Initialize powerups if enabled
        if (quizContent.settings?.enablePowerUps) {
            setPowerUps({ fiftyFifty: 1, timeFreeze: 1 });
        }
    };

    const handleAnswer = (value: any) => {
        if (!quizContent) return;
        const currentQuestion = quizContent.questions[currentQuestionIndex];
        setQuizAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    };

    const handlePowerUp = (type: 'fiftyFifty' | 'timeFreeze') => {
        if (!quizContent || powerUps[type] <= 0) return;

        if (type === 'fiftyFifty') {
            const currentQuestion = quizContent.questions[currentQuestionIndex];
            if (currentQuestion.type === 'multiple_choice') {
                const incorrectIndices = currentQuestion.options
                    .map((_, i) => i)
                    .filter(i => i !== currentQuestion.correctIndex);
                
                // Shuffle and take 2
                const toEliminate = incorrectIndices.sort(() => 0.5 - Math.random()).slice(0, 2);
                setEliminatedOptions(prev => ({ ...prev, [currentQuestion.id]: toEliminate }));
            }
        } else if (type === 'timeFreeze') {
            setIsTimerPaused(true);
            setTimeout(() => setIsTimerPaused(false), 15000); // Freeze for 15s
        }

        setPowerUps(prev => ({ ...prev, [type]: prev[type] - 1 }));
    };
    
    const nextQuestion = () => {
        if (!quizContent) return;
        if (currentQuestionIndex < quizContent.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            submitQuiz();
        }
    };

    const submitQuiz = async () => {
        if (!quizContent || !id || quizSubmitted) return;
        
        try {
            let correctCount = 0;
            
            quizContent.questions.forEach(q => {
                const answer = quizAnswers[q.id];
                if (q.type === 'multiple_choice' && answer === q.correctIndex) {
                    correctCount++;
                } else if (q.type === 'true_false' && answer === q.correctValue) {
                    correctCount++;
                } else if (q.type === 'short_answer') {
                     if (typeof answer === 'string' && answer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) {
                        correctCount++;
                     }
                }
            });

            const score = Math.round((correctCount / quizContent.questions.length) * 100);
            setQuizScore(score);
            setQuizSubmitted(true);
            setGameStarted(false);

            // Save score to backend and mark as complete
            const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
            await progressAPI.complete(id, timeSpent, score);

        } catch (e) {
            console.error("Error submitting quiz", e);
            notifications.error(
                getApiErrorMessage(e, 'Terjadi kesalahan saat memproses kuis.'),
                'Kuis belum diproses'
            );
        }
    };

    const handleComplete = async () => {
        if (!id || completing) return;

        try {
            setCompleting(true);
            const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
            
            const result = await progressAPI.complete(id, timeSpent);

            setXpEarned(result.xpEarned || 50);
            setShowXPNotification(true);
            setProgress({ status: 'completed', timeSpent, completedAt: new Date().toISOString(), score: quizScore });

            // Check if there's a linked quiz or interactive exercise
            if (material?.linkedQuizId && material?.linkedQuiz) {
                setTimeout(() => {
                    setShowXPNotification(false);
                    setShowQuizPrompt(true);
                }, 1500);
            } else if (material?.linkedExerciseId && material?.linkedExercise) {
                setTimeout(() => {
                    setShowXPNotification(false);
                    setShowExercisePrompt(true);
                }, 1500);
            } else {
                setTimeout(() => {
                    setShowXPNotification(false);
                    navigate('/student/materials');
                }, 2000);
            }
        } catch (err) {
            console.error('Failed to complete:', err);
            notifications.error(
                getApiErrorMessage(err, 'Gagal menandai selesai.'),
                'Progress belum diperbarui'
            );
        } finally {
            setCompleting(false);
        }
    };

    const handleRetakeQuiz = () => {
        setQuizSubmitted(false);
        setQuizScore(0);
        setQuizAnswers({});
        setGameStarted(false);
        setEliminatedOptions({});
        if (quizContent?.settings?.timeLimitSeconds) {
            setTimeLeft(quizContent.settings.timeLimitSeconds);
        }
        if (quizContent?.settings?.enablePowerUps) {
             setPowerUps({ fiftyFifty: 1, timeFreeze: 1 });
        }
        // Ideally we should also reset 'isTimerPaused'
        setIsTimerPaused(false);
    };

    const handleGoToQuiz = () => {
        if (material?.linkedQuizId) {
            navigate(`/student/materials/${material.linkedQuizId}`);
        }
    };

    const handleGoToExercise = () => {
        if (material?.linkedExerciseId && material?.linkedExercise) {
            setShowExercisePrompt(false);
            navigate(`/student/class/${material.linkedExercise.class.id}/exercise/${material.linkedExercise.id}`);
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, { bg: string; text: string }> = {
            'MATEMATIKA': { bg: '#e0e7ff', text: 'var(--primary)' },
            'IPA': { bg: '#dcfce7', text: '#16a34a' },
            'IPS': { bg: '#fef3c7', text: '#d97706' },
            'BAHASA_INDONESIA': { bg: '#fee2e2', text: '#dc2626' },
            'BAHASA_INGGRIS': { bg: '#dbeafe', text: '#2563eb' },
            'SENI': { bg: '#f3e8ff', text: '#9333ea' },
            'OLAHRAGA': { bg: '#cffafe', text: '#0891b2' },
        };
        return colors[category] || { bg: '#f3f4f6', text: '#6b7280' };
    };

    const formatCategory = (category: string) => {
        return category?.replace('_', ' ') || 'Unknown';
    };

    const getTypeIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'video': return <Video size={20} />;
            case 'book': return <BookOpen size={20} />;
            case 'quiz': return <User size={20} />;
            default: return <FileText size={20} />;
        }
    };

    // Helper to extract YouTube ID from watch, short, shorts, and embed URLs.
    const getYoutubeId = (url: string) => {
        try {
            const parsed = new URL(url);
            const host = parsed.hostname.replace(/^www\./, '');

            if (host === 'youtu.be') {
                const id = parsed.pathname.split('/').filter(Boolean)[0];
                return id?.length === 11 ? id : null;
            }

            if (host.endsWith('youtube.com')) {
                const watchId = parsed.searchParams.get('v');
                if (watchId?.length === 11) {
                    return watchId;
                }

                const pathParts = parsed.pathname.split('/').filter(Boolean);
                const embeddedId = pathParts[0] === 'embed' || pathParts[0] === 'shorts'
                    ? pathParts[1]
                    : null;

                return embeddedId?.length === 11 ? embeddedId : null;
            }
        } catch {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
        }

        return null;
    };

    const parseVideoContent = (content: string | null): VideoContent | null => {
        const raw = content?.trim();
        if (!raw) {
            return null;
        }

        try {
            const parsed = JSON.parse(raw) as unknown;
            if (typeof parsed === 'string') {
                const url = parsed.trim();
                return url ? { url, platform: detectVideoPlatform(url) } : null;
            }

            if (parsed && typeof parsed === 'object') {
                const record = parsed as Record<string, unknown>;
                const url = String(record.url ?? record.videoUrl ?? record.link ?? '').trim();
                if (url) {
                    return {
                        url,
                        platform: record.platform === 'youtube' || record.platform === 'other'
                            ? record.platform
                            : detectVideoPlatform(url)
                    };
                }
            }
        } catch {
            if (/^https?:\/\//i.test(raw)) {
                return { url: raw, platform: detectVideoPlatform(raw) };
            }
        }

        return null;
    };

    const parseBookContent = (content: string | null): BookContent | null => {
        const raw = content?.trim();
        if (!raw) {
            return null;
        }

        try {
            const parsed = JSON.parse(raw) as unknown;
            if (typeof parsed === 'string') {
                return parsed.trim() ? { url: parsed.trim() } : null;
            }

            if (parsed && typeof parsed === 'object') {
                const url = String((parsed as Record<string, unknown>).url ?? (parsed as Record<string, unknown>).pdfUrl ?? '').trim();
                return url ? { url } : null;
            }
        } catch {
            if (/^https?:\/\//i.test(raw)) {
                return { url: raw };
            }
        }

        return null;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader className="animate-spin" size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-muted)' }}>Memuat materi...</p>
                </div>
            </div>
        );
    }

    if (error || !material) {
        return (
            <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '4rem 2rem' }}>
                <AlertCircle size={64} style={{ color: '#dc2626', marginBottom: '1rem' }} />
                <h2 style={{ marginBottom: '0.5rem' }}>{error || 'Materi tidak ditemukan'}</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Materi yang kamu cari mungkin sudah dihapus atau tidak tersedia.</p>
                <Link to="/student/materials" className="btn btn-primary">Kembali ke Daftar Materi</Link>
            </div>
        );
    }

    const categoryStyle = getCategoryColor(material.category);
    const isCompleted = progress?.status === 'completed';

    // Parse content
    let videoContent: VideoContent | null = null;
    let bookContent: BookContent | null = null;
    let articleContent: string | null = null;

    try {
        if (material.content) {
            if (material.type === 'video') {
                videoContent = parseVideoContent(material.content);
            } else if (material.type === 'book') {
                bookContent = parseBookContent(material.content);
            } else if (material.type === 'quiz') {
                // Quiz content is handled by state
            } else {
                articleContent = material.content;
            }
        }
    } catch (e) {
        console.error("Error parsing content, falling back to article", e);
        articleContent = material.content;
    }

    return (
        <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', padding: '0 1rem' }} className="animate-slide-up">
            {/* XP Notification */}
            {showXPNotification && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    color: 'white',
                    padding: '2rem',
                    width: '90%',
                    maxWidth: '400px',
                    borderRadius: '1.5rem',
                    textAlign: 'center',
                    zIndex: 1000,
                    animation: 'fadeIn 0.3s ease-out',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}>
                    <Award size={64} style={{ marginBottom: '1rem' }} />
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Materi Selesai!</h2>
                    <p style={{ fontSize: '2rem', fontWeight: '800' }}>+{xpEarned} XP</p>
                </div>
            )}

            {/* Quiz Prompt Modal */}
            {showQuizPrompt && material?.linkedQuiz && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div style={{
                        background: 'white',
                        padding: '2rem',
                        width: '90%',
                        maxWidth: '450px',
                        borderRadius: '1.5rem',
                        textAlign: 'center',
                        animation: 'fadeIn 0.3s ease-out',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{ 
                            width: '70px', 
                            height: '70px', 
                            borderRadius: '50%', 
                            background: 'linear-gradient(135deg, var(--primary), var(--accent))', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            margin: '0 auto 1.5rem' 
                        }}>
                            <HelpCircle size={36} color="white" />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                            Saatnya Mengerjakan Quiz!
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                            Materi <strong>{material.title}</strong> terhubung dengan quiz 
                            <strong> {material.linkedQuiz.title}</strong>. 
                            Kerjakan quiz untuk menguji pemahamanmu!
                            {material.minPassingScore && (
                                <><br />Nilai minimal: <strong>{material.minPassingScore}</strong></>
                            )}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => {
                                    setShowQuizPrompt(false);
                                    navigate('/student/materials');
                                }}
                            >
                                Nanti Saja
                            </button>
                            <button 
                                className="btn btn-primary" 
                                onClick={handleGoToQuiz}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <HelpCircle size={18} /> Kerjakan Quiz
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Interactive Exercise Prompt Modal */}
            {showExercisePrompt && material?.linkedExercise && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div style={{
                        background: 'white',
                        padding: '2rem',
                        width: '90%',
                        maxWidth: '450px',
                        borderRadius: '1.5rem',
                        textAlign: 'center',
                        animation: 'fadeIn 0.3s ease-out',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{ 
                            width: '70px', 
                            height: '70px', 
                            borderRadius: '50%', 
                            background: 'linear-gradient(135deg, #9333ea, #7c3aed)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            margin: '0 auto 1.5rem' 
                        }}>
                            <PenTool size={36} color="white" />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                            Saatnya Latihan!
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                            Materi <strong>{material.title}</strong> terhubung dengan latihan interaktif 
                            <strong> {material.linkedExercise.title}</strong>. 
                            Kerjakan latihan untuk menguji pemahamanmu!
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => {
                                    setShowExercisePrompt(false);
                                    navigate('/student/materials');
                                }}
                            >
                                Nanti Saja
                            </button>
                            <button 
                                className="btn btn-primary" 
                                onClick={handleGoToExercise}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <PenTool size={18} /> Kerjakan Latihan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Link to="/student/materials" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', textDecoration: 'none' }}>
                <ArrowLeft size={20} /> Kembali ke Daftar Materi
            </Link>

            {/* Progress indicator */}
            {isCompleted && (
                <div style={{
                    background: '#dcfce7',
                    border: '1px solid #16a34a',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <CheckCircle size={24} color="#16a34a" style={{ flexShrink: 0 }} />
                    <div>
                        <p style={{ fontWeight: '600', color: '#16a34a' }}>Materi sudah diselesaikan</p>
                        <p style={{ fontSize: '0.85rem', color: '#15803d' }}>
                            Diselesaikan pada {new Date(progress.completedAt!).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            {progress.score !== undefined && ` • Skor: ${progress.score}`}
                        </p>
                    </div>
                </div>
            )}

            <div className="card glass" style={{ padding: '0', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    background: `linear-gradient(135deg, ${categoryStyle.bg}, white)`,
                    borderBottom: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        <span style={{
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            color: categoryStyle.text,
                            background: 'white',
                            padding: '0.3rem 0.75rem',
                            borderRadius: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }}>
                            {formatCategory(material.category)}
                        </span>
                        <span style={{
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            color: 'var(--text-muted)',
                            background: 'white',
                            padding: '0.3rem 0.75rem',
                            borderRadius: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }}>
                            {getTypeIcon(material.type)} {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                        </span>
                        <span style={{
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            color: 'var(--text-muted)',
                            background: 'white',
                            padding: '0.3rem 0.75rem',
                            borderRadius: '1rem'
                        }}>
                            Kelas {material.grade} • Semester {material.semester}
                        </span>
                        <span style={{
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            padding: '0.3rem 0.75rem',
                            borderRadius: '1rem',
                            background: material.level === 'Mudah' ? '#dcfce7' : material.level === 'Menengah' ? '#fef3c7' : '#fee2e2',
                            color: material.level === 'Mudah' ? '#16a34a' : material.level === 'Menengah' ? '#d97706' : '#dc2626'
                        }}>
                            {material.level}
                        </span>
                    </div>

                    <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-main)', lineHeight: 1.2 }}>
                        {material.title}
                    </h1>

                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={16} />
                            <span>{material.createdBy?.name || 'Guru'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={16} />
                            <span>{new Date(material.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                    
                    {/* VIDEO PLAYER */}
                    {videoContent && (
                        <div>
                            {getYoutubeId(videoContent.url) ? (
                                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '1rem', marginBottom: '2rem' }}>
                                    <iframe 
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                        src={`https://www.youtube.com/embed/${getYoutubeId(videoContent.url)}`}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            ) : (
                                <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '1rem', textAlign: 'center' }}>
                                    <Video size={48} style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
                                    <p style={{ marginBottom: '1rem' }}>Video tersedia di link berikut:</p>
                                    <a href={videoContent.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                        Tonton Video <ArrowLeft style={{ transform: 'rotate(135deg)' }} size={16} />
                                    </a>
                                </div>
                            )}
                            {/* Summary / Notes section for video can be added here if needed */}
                        </div>
                    )}

                    {material.type === 'video' && !videoContent && (
                        <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '1rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                            <Video size={48} style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Video belum tersedia</h3>
                            <p style={{ color: 'var(--text-muted)' }}>
                                Materi video ini belum memiliki URL video yang valid. Hubungi guru untuk memperbarui materi.
                            </p>
                        </div>
                    )}

                    {/* BOOK READER */}
                    {bookContent && (
                        <div style={{ textAlign: 'center', padding: 'clamp(2rem, 5vw, 3rem)', background: '#f8fafc', borderRadius: '1rem', border: '2px dashed #e2e8f0' }}>
                            <BookOpen size={64} style={{ color: 'var(--primary)', marginBottom: '1.5rem', opacity: 0.8 }} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>Materi E-Book / PDF</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
                                Materi ini tersedia dalam format dokumen digital. Klik tombol di bawah untuk membuka dan membaca materi.
                            </p>
                            <a href={bookContent.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
                                <BookOpen size={20} /> Baca Materi
                            </a>
                        </div>
                    )}

                    {/* QUIZ PLAYER */}
                    {/* QUIZ PLAYER */}
                    {quizContent && (
                        <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                           
                           {/* GAME OVER / RESULTS */}
                           {quizSubmitted && (
                               <div style={{ padding: '3rem', background: quizScore >= (material.minPassingScore || 70) ? '#f0fdf4' : '#fffbeb', border: `1px solid ${quizScore >= (material.minPassingScore || 70) ? '#bbf7d0' : '#fde68a'}`, borderRadius: '1.5rem', marginBottom: '2rem', textAlign: 'center', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                                   <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                                       {quizScore >= (material.minPassingScore || 70) ? <Trophy size={60} color="#16a34a" /> : <Target size={60} color="#d97706" />}
                                   </div>
                                   <h3 style={{ color: quizScore >= (material.minPassingScore || 70) ? '#166534' : '#92400e', fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                                       Skor Kamu: {quizScore}
                                   </h3>
                                   <p style={{ color: quizScore >= (material.minPassingScore || 70) ? '#15803d' : '#b45309', fontSize: '1.1rem', marginBottom: '2rem' }}>
                                       {quizScore >= (material.minPassingScore || 70) ? 'Selamat! Kamu lulus kuis ini.' : 'Semangat! Coba pelajari materi lagi dan ulangi kuis.'}
                                   </p>
                                   <button 
                                        className="btn btn-primary"
                                        onClick={handleRetakeQuiz}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                                   >
                                        <CheckCircle size={20} /> Ulangi Kuis
                                   </button>
                               </div>
                           )}

                           {/* INTRO SCREEN */}
                           {!gameStarted && !quizSubmitted && (
                               <div style={{ padding: '3rem', background: 'white', borderRadius: '1.5rem', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                                   <div style={{ width: '80px', height: '80px', background: '#e0e7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                       <Award size={40} color="var(--primary)" />
                                   </div>
                                   <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-main)' }}>Siap Mengerjakan Kuis?</h2>
                                   <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2.5rem', color: 'var(--text-muted)' }}>
                                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                           <HelpCircle size={20} />
                                           <span>{quizContent.questions.length} Pertanyaan</span>
                                       </div>
                                       {quizContent.settings?.timeLimitSeconds > 0 && (
                                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                               <Timer size={20} />
                                               <span>{Math.floor(quizContent.settings.timeLimitSeconds / 60)} Menit {quizContent.settings.timeLimitSeconds % 60} Detik</span>
                                           </div>
                                       )}
                                   </div>
                                   <button 
                                       className="btn btn-primary"
                                       onClick={handleStartQuiz}
                                       style={{ padding: '1rem 3rem', fontSize: '1.25rem', borderRadius: '2rem' }}
                                   >
                                       Mulai Sekarang
                                   </button>
                               </div>
                           )}

                           {/* GAMEPLAY */}
                           {gameStarted && !quizSubmitted && (
                               <div>
                                   {/* HUD */}
                                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '1rem', border: '1px solid #e2e8f0', fontWeight: 'bold', color: 'var(--primary)' }}>
                                           <span>Soal {currentQuestionIndex + 1}/{quizContent.questions.length}</span>
                                       </div>
                                       {quizContent.settings?.timeLimitSeconds > 0 && (
                                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: timeLeft < 30 ? '#fee2e2' : 'white', padding: '0.5rem 1rem', borderRadius: '1rem', border: `1px solid ${timeLeft < 30 ? '#fca5a5' : '#e2e8f0'}`, fontWeight: 'bold', color: timeLeft < 30 ? '#dc2626' : 'var(--text-main)' }}>
                                               <Timer size={18} />
                                               <span>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
                                           </div>
                                       )}
                                   </div>

                                   {/* PowerUps */}
                                   {quizContent.settings?.enablePowerUps && (
                                       <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
                                           <button 
                                                onClick={() => handlePowerUp('fiftyFifty')} 
                                                disabled={powerUps.fiftyFifty <= 0 || quizContent.questions[currentQuestionIndex].type !== 'multiple_choice'}
                                                style={{ padding: '0.75rem 1.25rem', borderRadius: '0.75rem', border: 'none', background: powerUps.fiftyFifty > 0 ? 'linear-gradient(135deg, #fbbf24, #d97706)' : '#f1f5f9', color: powerUps.fiftyFifty > 0 ? 'white' : '#cbd5e1', fontWeight: 'bold', cursor: powerUps.fiftyFifty > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.5rem', transform: 'translateY(0)', transition: 'transform 0.1s' }}
                                           >
                                               <Zap size={18} fill="currentColor" /> 50/50 ({powerUps.fiftyFifty})
                                           </button>
                                           <button 
                                                onClick={() => handlePowerUp('timeFreeze')} 
                                                disabled={powerUps.timeFreeze <= 0}
                                                style={{ padding: '0.75rem 1.25rem', borderRadius: '0.75rem', border: 'none', background: powerUps.timeFreeze > 0 ? 'linear-gradient(135deg, #60a5fa, #2563eb)' : '#f1f5f9', color: powerUps.timeFreeze > 0 ? 'white' : '#cbd5e1', fontWeight: 'bold', cursor: powerUps.timeFreeze > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                           >
                                               <Clock size={18} /> Bekukan Waktu ({powerUps.timeFreeze})
                                           </button>
                                       </div>
                                   )}

                                   {/* Question Card */}
                                   <div style={{ background: 'white', padding: 'clamp(1.25rem, 4vw, 2rem)', borderRadius: '1.5rem', border: '1px solid #e2e8f0', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                                            {quizContent.questions[currentQuestionIndex].text}
                                        </h3>

                                        {/* Render Options based on Type */}
                                        {(() => {
                                            const question = quizContent.questions[currentQuestionIndex];
                                            
                                            // Handling different types without complex TS casting inside JSX if possible
                                            if (question.type === 'multiple_choice') {
                                                return (
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                                                        {(question as any).options.map((opt: string, idx: number) => {
                                                            const isEliminated = eliminatedOptions[question.id]?.includes(idx);
                                                            const isSelected = quizAnswers[question.id] === idx;
                                                            
                                                            if (isEliminated) return null;

                                                            return (
                                                                <button
                                                                    key={idx}
                                                                    onClick={() => handleAnswer(idx)}
                                                                    style={{
                                                                        padding: '1rem',
                                                                        textAlign: 'left',
                                                                        borderRadius: '1rem',
                                                                        border: isSelected ? '2px solid var(--primary)' : '2px solid #e2e8f0',
                                                                        background: isSelected ? '#e0e7ff' : 'white',
                                                                        color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                                                                        fontWeight: '600',
                                                                        fontSize: '0.95rem',
                                                                        cursor: 'pointer',
                                                                        transition: 'all 0.2s',
                                                                        display: 'flex',
                                                                        alignItems: 'center'
                                                                    }}
                                                                >
                                                                    <span style={{ display: 'inline-block', width: '30px', height: '30px', borderRadius: '50%', background: isSelected ? 'var(--primary)' : '#f1f5f9', color: isSelected ? 'white' : 'var(--text-muted)', textAlign: 'center', lineHeight: '30px', marginRight: '0.75rem', fontSize: '0.9rem', flexShrink: 0 }}>
                                                                        {String.fromCharCode(65 + idx)}
                                                                    </span>
                                                                    <span style={{ flex: 1 }}>{opt}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            } else if (question.type === 'true_false') {
                                                const currentAnswer = quizAnswers[question.id];
                                                return (
                                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                                        <button
                                                            onClick={() => handleAnswer(true)}
                                                            style={{
                                                                flex: '1 1 140px',
                                                                padding: '1.5rem',
                                                                borderRadius: '1rem',
                                                                border: currentAnswer === true ? '2px solid #16a34a' : '2px solid #e2e8f0',
                                                                background: currentAnswer === true ? '#dcfce7' : 'white',
                                                                color: currentAnswer === true ? '#166534' : 'var(--text-main)',
                                                                fontWeight: 'bold',
                                                                fontSize: '1.1rem',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            BENAR (True)
                                                        </button>
                                                        <button
                                                            onClick={() => handleAnswer(false)}
                                                            style={{
                                                                flex: '1 1 140px',
                                                                padding: '1.5rem',
                                                                borderRadius: '1rem',
                                                                border: currentAnswer === false ? '2px solid #dc2626' : '2px solid #e2e8f0',
                                                                background: currentAnswer === false ? '#fee2e2' : 'white',
                                                                color: currentAnswer === false ? '#991b1b' : 'var(--text-main)',
                                                                fontWeight: 'bold',
                                                                fontSize: '1.1rem',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            SALAH (False)
                                                        </button>
                                                    </div>
                                                );
                                            } else if (question.type === 'short_answer') {
                                                return (
                                                    <div>
                                                        <input
                                                            type="text"
                                                            value={quizAnswers[question.id] || ''}
                                                            onChange={(e) => handleAnswer(e.target.value)}
                                                            placeholder="Ketik jawabanmu di sini..."
                                                            style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', border: '2px solid #e2e8f0', fontSize: '1.1rem' }}
                                                        />
                                                    </div>
                                                );
                                            }
                                        })()}
                                   </div>

                                   {/* Navigation */}
                                   <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                       <button
                                            className="btn btn-primary"
                                            onClick={nextQuestion}
                                            disabled={quizAnswers[quizContent.questions[currentQuestionIndex].id] === undefined}
                                            style={{ padding: '1rem 3rem', borderRadius: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: quizAnswers[quizContent.questions[currentQuestionIndex].id] === undefined ? 0.5 : 1 }}
                                       >
                                           {currentQuestionIndex < quizContent.questions.length - 1 ? 'Selanjutnya' : 'Selesai'} <ChevronRight size={20} />
                                       </button>
                                   </div>
                               </div>
                           )}
                        </div>
                    )}

                    {/* ARTICLE CONTENT */}
                    {articleContent && (
                         <div
                            className="material-content"
                            style={{
                                lineHeight: '1.9',
                                fontSize: '1.05rem',
                                color: 'var(--text-main)'
                            }}
                        >
                            <style>{`
                                .material-content h1, .material-content h2, .material-content h3, 
                                .material-content h4, .material-content h5, .material-content h6 {
                                    margin-top: 1.5rem;
                                    margin-bottom: 0.75rem;
                                    font-weight: 700;
                                    color: var(--text-main);
                                }
                                .material-content ul, .material-content ol {
                                    margin: 1rem 0;
                                    padding-left: 1.5rem;
                                }
                                .material-content blockquote {
                                    border-left: 4px solid var(--primary);
                                    padding-left: 1rem;
                                    margin: 1.5rem 0;
                                    color: var(--text-muted);
                                }
                                .material-content img {
                                    max-width: 100%;
                                    border-radius: 0.5rem;
                                }
                            `}</style>
                            <div dangerouslySetInnerHTML={{ __html: articleContent }} />
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div style={{
                    padding: '2rem 2.5rem',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    background: '#f8fafc'
                }}>
                    <div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            {isCompleted
                                ? 'Kamu sudah menyelesaikan materi ini. Kamu dapat membacanya lagi kapan saja.'
                                : 'Setelah selesai mempelajari materi ini, klik tombol di samping untuk menandai sebagai selesai dan mendapatkan XP.'}
                        </p>
                    </div>
                    
                    {/* Only show Mark Complete button if it's NOT a quiz. Quiz completes automatically or via logic above */}
                    {!isCompleted && material.type !== 'quiz' && (
                        <button
                            className="btn btn-primary"
                            onClick={handleComplete}
                            disabled={completing}
                            style={{
                                padding: '1rem 2rem',
                                fontSize: '1.1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {completing ? (
                                <Loader className="animate-spin" size={20} />
                            ) : (
                                <CheckCircle size={20} />
                            )}
                            Tandai Selesai (+50 XP)
                        </button>
                    )}

                    {isCompleted && (
                         <button
                            className="btn"
                            disabled
                            style={{
                                padding: '1rem 2rem',
                                fontSize: '1.1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: '#dcfce7',
                                color: '#16a34a',
                                border: 'none'
                            }}
                        >
                            <CheckCircle size={20} />
                            Sudah Selesai
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
