import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Heart, CheckCircle, XCircle, ArrowRight, RotateCcw, GripVertical, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

type QuestionType = 'multiple-choice' | 'true-false' | 'puzzle' | 'rotation';

interface Question {
    id: number;
    type: QuestionType;
    question: string;
    options?: string[]; // For multiple choice
    correct?: number | boolean | number; // Index or boolean value or angle
    correctOrder?: string[]; // For puzzle
    items?: string[]; // For puzzle initial state
    shape?: 'triangle' | 'square' | 'arrow'; // For rotation
    targetAngle?: number; // For rotation
}

const mockQuestions: Question[] = [
    {
        id: 1,
        type: 'multiple-choice',
        question: "Jika 2x + 5 = 15, berapakah nilai x?",
        options: ["3", "5", "7", "10"],
        correct: 1 // Index of "5"
    },
    {
        id: 2,
        type: 'rotation',
        question: "Putar panah ini hingga menghadap ke BAWAH (180°)",
        shape: 'arrow',
        targetAngle: 180,
        correct: 180
    },
    {
        id: 3,
        type: 'puzzle',
        question: "Urutkan proses terjadinya hujan:",
        items: ["Kondensasi", "Evaporasi", "Presipitasi"],
        correctOrder: ["Evaporasi", "Kondensasi", "Presipitasi"]
    },
    {
        id: 4,
        type: 'true-false',
        question: "Bumi mengelilingi Matahari dalam waktu 365 hari.",
        correct: true
    }
];

export const StudentQuizSession: React.FC = () => {
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [timeLeft, setTimeLeft] = useState(60);

    // State for different answer types
    const [selectedOption, setSelectedOption] = useState<any>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    // Rotation specific state
    const [currentAngle, setCurrentAngle] = useState(0);

    useEffect(() => {
        if (timeLeft > 0 && !isFinished) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            setIsFinished(true);
        }
    }, [timeLeft, isFinished]);

    // Reset rotation state on new question
    useEffect(() => {
        if (mockQuestions[currentQ].type === 'rotation') {
            setCurrentAngle(0);
        }
    }, [currentQ]);

    const handleAnswer = (answer: any) => {
        if (isAnswered || isFinished) return;

        const question = mockQuestions[currentQ];
        let isCorrect = false;

        if (question.type === 'multiple-choice') {
            setSelectedOption(answer);
            if (answer === question.correct) isCorrect = true;
        } else if (question.type === 'true-false') {
            setSelectedOption(answer);
            if (answer === question.correct) isCorrect = true;
        } else if (question.type === 'puzzle') {
            const currentOrder = answer as string[];
            if (JSON.stringify(currentOrder) === JSON.stringify(question.correctOrder)) {
                isCorrect = true;
            }
            setSelectedOption(answer);
        } else if (question.type === 'rotation') {
            // Normalize angle to 0-360
            const normalizedAngle = ((answer % 360) + 360) % 360;
            if (normalizedAngle === question.correct) {
                isCorrect = true;
            }
            setSelectedOption(normalizedAngle);
        }

        setIsAnswered(true);

        if (isCorrect) {
            setScore(score + 100);
        } else {
            setLives(lives - 1);
            if (lives - 1 === 0) setIsFinished(true);
        }
    };

    const nextQuestion = () => {
        if (currentQ < mockQuestions.length - 1) {
            setCurrentQ(currentQ + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setIsFinished(true);
        }
    };

    // Puzzle Logic
    const [puzzleItems, setPuzzleItems] = useState<string[]>([]);
    useEffect(() => {
        if (mockQuestions[currentQ].type === 'puzzle') {
            setPuzzleItems([...(mockQuestions[currentQ].items || [])]);
        }
    }, [currentQ]);

    const movePuzzleItem = (fromIndex: number, toIndex: number) => {
        if (isAnswered) return;
        const newItems = [...puzzleItems];
        const [moved] = newItems.splice(fromIndex, 1);
        newItems.splice(toIndex, 0, moved);
        setPuzzleItems(newItems);
    };

    const rotateShape = (direction: 'cw' | 'ccw') => {
        if (isAnswered) return;
        setCurrentAngle(prev => direction === 'cw' ? prev + 90 : prev - 90);
    };

    if (isFinished) {
        return (
            <div className="container animate-slide-up" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
                <div className="card glass" style={{ padding: '3rem' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉 Selesai!</h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Kamu telah menyelesaikan latihan ini.</p>
                    <div style={{ fontSize: '4rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '1rem' }}>{score} <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>PTS</span></div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Link to="/student" className="btn btn-secondary"><ArrowLeft size={20} /> Kembali</Link>
                        <button onClick={() => window.location.reload()} className="btn btn-primary"><RotateCcw size={20} /> Ulangi</button>
                    </div>
                </div>
            </div>
        );
    }

    const question = mockQuestions[currentQ];

    return (
        <div className="container animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <Link to="/student" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontWeight: '600' }}><ArrowLeft size={20} /> Keluar</Link>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', fontWeight: 'bold' }}><Clock size={20} /> {timeLeft}s</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error)', fontWeight: 'bold' }}>
                        {[...Array(lives)].map((_, i) => <Heart key={i} size={20} fill="currentColor" />)}
                    </div>
                </div>
            </div>

            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '2rem' }}>
                <div style={{ width: `${((currentQ + 1) / mockQuestions.length) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px', transition: 'width 0.3s' }}></div>
            </div>

            <div className="card glass" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem', lineHeight: 1.4 }}>{question.question}</h2>

                {/* --- RENDER BASED ON TYPE --- */}

                {question.type === 'multiple-choice' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {question.options?.map((opt, idx) => {
                            let bgColor = 'white';
                            let borderColor = 'transparent';
                            if (isAnswered) {
                                if (idx === question.correct) { bgColor = '#dcfce7'; borderColor = 'var(--success)'; }
                                else if (idx === selectedOption) { bgColor = '#fee2e2'; borderColor = 'var(--error)'; }
                            }
                            return (
                                <button key={idx} onClick={() => handleAnswer(idx)} disabled={isAnswered} className="btn" style={{ justifyContent: 'flex-start', padding: '1.5rem', background: bgColor, border: `2px solid ${borderColor === 'transparent' ? 'rgba(0,0,0,0.05)' : borderColor}`, fontSize: '1.1rem', position: 'relative', opacity: isAnswered && idx !== question.correct && idx !== selectedOption ? 0.5 : 1 }}>
                                    <span style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem', fontWeight: 'bold' }}>{String.fromCharCode(65 + idx)}</span>
                                    {opt}
                                    {isAnswered && idx === question.correct && <CheckCircle size={24} color="var(--success)" style={{ position: 'absolute', right: '1rem' }} />}
                                    {isAnswered && idx === selectedOption && idx !== question.correct && <XCircle size={24} color="var(--error)" style={{ position: 'absolute', right: '1rem' }} />}
                                </button>
                            );
                        })}
                    </div>
                )}

                {question.type === 'true-false' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {[true, false].map((val) => {
                            let bgColor = 'white';
                            let iconColor = val ? 'var(--success)' : 'var(--error)';
                            let borderColor = 'transparent';
                            if (isAnswered) {
                                if (val === question.correct) { bgColor = '#dcfce7'; borderColor = 'var(--success)'; iconColor = 'var(--success)'; }
                                else if (val === selectedOption) { bgColor = '#fee2e2'; borderColor = 'var(--error)'; iconColor = 'var(--error)'; }
                                else { bgColor = 'white'; borderColor = 'rgba(0,0,0,0.05)'; iconColor = 'var(--text-muted)'; }
                            }
                            return (
                                <button key={String(val)} onClick={() => handleAnswer(val)} disabled={isAnswered} className="btn" style={{ padding: '3rem', fontSize: '1.5rem', fontWeight: '800', border: `2px solid ${borderColor === 'transparent' ? 'rgba(0,0,0,0.05)' : borderColor}`, background: bgColor, boxShadow: 'var(--shadow-md)', flexDirection: 'column', gap: '1rem', color: 'var(--text-main)' }}>
                                    {val ? <CheckCircle size={48} color={iconColor} /> : <XCircle size={48} color={iconColor} />}
                                    {val ? 'BENAR' : 'SALAH'}
                                </button>
                            );
                        })}
                    </div>
                )}

                {question.type === 'puzzle' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxWidth: '500px', margin: '0 auto' }}>
                        {isAnswered ? (
                            (selectedOption || []).map((item: string, idx: number) => {
                                const isCorrectPos = item === question.correctOrder![idx];
                                return (
                                    <div key={idx} className="btn" style={{ background: isCorrectPos ? '#dcfce7' : '#fee2e2', justifyContent: 'space-between', padding: '1rem', cursor: 'default' }}>
                                        <span style={{ fontWeight: '600' }}>{idx + 1}. {item}</span>
                                        {isCorrectPos ? <CheckCircle size={20} color="var(--success)" /> : <XCircle size={20} color="var(--error)" />}
                                    </div>
                                );
                            })
                        ) : (
                            puzzleItems.map((item, idx) => (
                                <div key={idx} className="btn" style={{ background: 'white', border: '1px solid #e2e8f0', justifyContent: 'space-between', padding: '1rem', cursor: 'default' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <GripVertical size={20} color="#cbd5e1" />
                                        <span>{item}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button disabled={idx === 0} onClick={() => movePuzzleItem(idx, idx - 1)} style={{ padding: '0.2rem', opacity: idx === 0 ? 0.3 : 1 }}>⬆️</button>
                                        <button disabled={idx === puzzleItems.length - 1} onClick={() => movePuzzleItem(idx, idx + 1)} style={{ padding: '0.2rem', opacity: idx === puzzleItems.length - 1 ? 0.3 : 1 }}>⬇️</button>
                                    </div>
                                </div>
                            ))
                        )}
                        {!isAnswered && (
                            <button onClick={() => handleAnswer(puzzleItems)} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                                Cek Susunan
                            </button>
                        )}
                    </div>
                )}

                {question.type === 'rotation' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                        <div style={{
                            width: '200px', height: '200px',
                            border: '2px dashed #cbd5e1',
                            borderRadius: '1rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: '#f8fafc'
                        }}>
                            <div style={{
                                width: '100px', height: '100px',
                                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                borderRadius: question.shape === 'arrow' ? '0' : '0.5rem',
                                clipPath: question.shape === 'arrow'
                                    ? 'polygon(40% 0%, 40% 40%, 0% 40%, 50% 100%, 100% 40%, 60% 40%, 60% 0%)' /* Arrow Shape */
                                    : question.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
                                transform: `rotate(${currentAngle}deg)`,
                                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                            }}></div>
                        </div>

                        {!isAnswered ? (
                            <>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button onClick={() => rotateShape('ccw')} className="btn btn-secondary" style={{ padding: '1rem', borderRadius: '50%' }}>
                                        <RefreshCw size={24} style={{ transform: 'scaleX(-1)' }} />
                                    </button>
                                    <button onClick={() => rotateShape('cw')} className="btn btn-secondary" style={{ padding: '1rem', borderRadius: '50%' }}>
                                        <RefreshCw size={24} />
                                    </button>
                                </div>
                                <button onClick={() => handleAnswer(currentAngle)} className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
                                    Kunci Jawaban ({((currentAngle % 360) + 360) % 360}°)
                                </button>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                {selectedOption === question.correct ? (
                                    <div style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <CheckCircle size={28} /> Jawaban Benar!
                                    </div>
                                ) : (
                                    <div style={{ color: 'var(--error)', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <XCircle size={28} /> Jawaban Salah
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', height: '50px' }}>
                    {isAnswered && (
                        <button onClick={nextQuestion} className="btn btn-primary animate-slide-up">
                            {currentQ < mockQuestions.length - 1 ? 'Soal Berikutnya' : 'Selesai'} <ArrowRight size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
