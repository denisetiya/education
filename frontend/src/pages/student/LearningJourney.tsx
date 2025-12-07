import React, { useState } from 'react';
import { Check, Lock, Star, Play, Map, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LevelNode {
    id: string;
    title: string;
    status: 'completed' | 'unlocked' | 'locked';
    stars: 0 | 1 | 2 | 3;
    type: 'video' | 'quiz' | 'project';
    position: { x: number; y: number };
}

const mapData: Record<string, LevelNode[]> = {
    'matematika': [
        { id: 'm1', title: 'Aljabar Dasar', status: 'completed', stars: 3, type: 'video', position: { x: 50, y: 15 } },
        { id: 'm2', title: 'Persamaan Linear', status: 'unlocked', stars: 0, type: 'quiz', position: { x: 30, y: 35 } },
        { id: 'm3', title: 'Fungsi Kuadrat', status: 'locked', stars: 0, type: 'video', position: { x: 70, y: 55 } },
        { id: 'm4', title: 'Trigonometri', status: 'locked', stars: 0, type: 'project', position: { x: 50, y: 80 } },
    ],
    'fisika': [
        { id: 'f1', title: 'Besaran & Satuan', status: 'unlocked', stars: 0, type: 'video', position: { x: 50, y: 20 } },
        { id: 'f2', title: 'Gerak Lurus', status: 'locked', stars: 0, type: 'quiz', position: { x: 50, y: 60 } },
    ]
};

export const LearningJourney: React.FC = () => {
    const navigate = useNavigate();
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

    if (!selectedSubject) {
        return (
            <div className="container animate-slide-up" style={{ textAlign: 'center', padding: '2rem' }}>
                <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>Pilih Petualanganmu</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '3rem' }}>Setiap mata pelajaran adalah dunia baru untuk dijelajahi!</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
                    <SubjectCard
                        title="Matematika"
                        level="Level 5"
                        progress={60}
                        color="var(--primary)"
                        onClick={() => setSelectedSubject('matematika')}
                    />
                    <SubjectCard
                        title="Fisika"
                        level="Level 2"
                        progress={20}
                        color="var(--secondary)"
                        onClick={() => setSelectedSubject('fisika')}
                    />
                    <SubjectCard
                        title="Biologi"
                        level="Level 1"
                        progress={0}
                        color="var(--success)"
                        onClick={() => { }}
                        locked
                    />
                </div>
            </div>
        );
    }

    const currentMap = mapData[selectedSubject] || [];

    return (
        <div className="animate-fade-in" style={{ position: 'relative', minHeight: '800px', backgroundColor: '#f0f9ff', padding: '2rem', borderRadius: '1rem', overflow: 'hidden' }}>

            <button onClick={() => setSelectedSubject(null)} style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                <ArrowLeft size={20} /> Kembali
            </button>

            <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative', zIndex: 2 }}>
                <h1 className="text-gradient" style={{ fontSize: '2rem', textTransform: 'capitalize' }}>Peta {selectedSubject}</h1>
                <p style={{ color: 'var(--text-muted)' }}>Selesaikan setiap tantangan untuk membuka level berikutnya!</p>
            </div>

            {/* Map Background Pattern */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                backgroundSize: '30px 30px', opacity: 0.5, zIndex: 0
            }}></div>

            {/* Path Connection Lines (Simple SVG for demo) */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
                <path d={`M ${currentMap.map(n => `${n.position.x}% ${n.position.y}%`).join(' L ')}`} stroke="#cbd5e1" strokeWidth="4" strokeDasharray="10 5" fill="none" />
            </svg>

            {/* Nodes */}
            <div style={{ position: 'relative', height: '800px', zIndex: 2 }}>
                {currentMap.map((node) => (
                    <div
                        key={node.id}
                        onClick={() => node.status !== 'locked' && navigate(`/student/material/${node.id}`)}
                        style={{
                            position: 'absolute', left: `${node.position.x}%`, top: `${node.position.y}%`,
                            transform: 'translate(-50%, -50%)',
                            cursor: node.status === 'locked' ? 'not-allowed' : 'pointer',
                            transition: 'transform 0.2s',
                        }}
                        className="journey-node"
                        onMouseEnter={(e) => { if (node.status !== 'locked') e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)'; }}
                        onMouseLeave={(e) => { if (node.status !== 'locked') e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.0)'; }}
                    >
                        {/* Circle Node */}
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: getNodeColor(node.status),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: node.status === 'unlocked' ? '0 0 20px var(--primary)' : 'var(--shadow-lg)',
                            border: '4px solid white', position: 'relative'
                        }}>
                            {getIcon(node.status)}
                            {node.status === 'completed' && (
                                <div style={{ position: 'absolute', bottom: '-10px', display: 'flex', gap: '2px' }}>
                                    {[...Array(3)].map((_, i) => (<Star key={i} size={12} fill={i < node.stars ? "#facc15" : "#94a3b8"} color={i < node.stars ? "#facc15" : "#94a3b8"} />))}
                                </div>
                            )}
                        </div>
                        {/* Label */}
                        <div style={{ marginTop: '1rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '2rem', boxShadow: 'var(--shadow-sm)', textAlign: 'center', whiteSpace: 'nowrap', fontWeight: '600', color: node.status === 'locked' ? 'var(--text-muted)' : 'var(--text-main)' }}>
                            {node.title}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SubjectCard: React.FC<{ title: string, level: string, progress: number, color: string, onClick: () => void, locked?: boolean }> = ({ title, level, progress, color, onClick, locked }) => (
    <div onClick={!locked ? onClick : undefined} className="card glass" style={{
        cursor: locked ? 'not-allowed' : 'pointer',
        opacity: locked ? 0.6 : 1,
        transition: 'transform 0.2s',
        borderTop: `6px solid ${color}`
    }}
        onMouseEnter={(e) => !locked && (e.currentTarget.style.transform = 'translateY(-10px)')}
        onMouseLeave={(e) => !locked && (e.currentTarget.style.transform = 'translateY(0)')}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            {locked ? <Lock size={24} color="var(--text-muted)" /> : <Map size={24} color={color} />}
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: color }}>{level}</span>
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>{title}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{locked ? 'Terkunci' : 'Lanjut belajar'}</p>

        {!locked && (
            <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: color }}></div>
            </div>
        )}
    </div>
);

const getNodeColor = (status: string) => {
    switch (status) {
        case 'completed': return 'var(--success)';
        case 'unlocked': return 'var(--primary)';
        case 'locked': return '#cbd5e1';
        default: return '#cbd5e1';
    }
};

const getIcon = (status: string) => {
    if (status === 'locked') return <Lock color="white" size={32} />;
    if (status === 'completed') return <Check color="white" size={32} strokeWidth={4} />;
    return <Play color="white" size={32} fill="white" />;
};
