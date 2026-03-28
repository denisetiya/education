import React, { useState, useEffect } from 'react';
import { Check, Lock, Star, Play, Map, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { modulesAPI, progressAPI } from '../../utils/api';

interface LevelNode {
    id: string;
    title: string;
    grade: number;
    semester: number;
    subject: string;
    status: 'completed' | 'unlocked' | 'locked';
    stars: 0 | 1 | 2 | 3;
    type: 'video' | 'quiz' | 'project'; // Representative type
    position: { x: number; y: number };
    materialId: string | null; // ID of the first material to jump to, or module ID if we handle modules routing
    materialsCount: number;
    completedCount: number;
}

export const LearningJourney: React.FC = () => {
    const navigate = useNavigate();
    const notifications = useNotifications();
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [mapNodes, setMapNodes] = useState<LevelNode[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!selectedSubject) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [modules, progressMap] = await Promise.all([
                    modulesAPI.getAll({ subject: selectedSubject }),
                    progressAPI.getMap()
                ]);

                // Transform modules into nodes
                const nodes: LevelNode[] = [];
                let isPreviousCompleted = true; // First node is always unlocked if prev completed (initially true)

                modules.forEach((mod: any, index: number) => {
                    const materials = mod.materials || [];
                    const completedCount = materials.filter((m: any) => progressMap[m.id]?.status === 'completed').length;
                    const isCompleted = materials.length > 0 && completedCount === materials.length;
                    
                    // Determine Status
                    let status: 'completed' | 'unlocked' | 'locked' = 'locked';
                    if (isCompleted) status = 'completed';
                    else if (isPreviousCompleted) status = 'unlocked';
                    
                    // Determine Stars (Avg score of quizzes? or just completion)
                    // Simplified: 3 stars if all completed
                    const stars = isCompleted ? 3 : 0;

                    // Position (Zig-zag)
                    const y = 15 + (index * 25); // Vertical spacing
                    const x = index % 2 === 0 ? 30 : 70; // Alternating left-right

                    nodes.push({
                        id: mod.id,
                        title: mod.title,
                        grade: mod.grade,
                        semester: mod.semester,
                        subject: mod.subject,
                        status,
                        stars,
                        type: 'video', // Default icon, could depend on content
                        position: { x, y },
                        materialId: materials.length > 0 ? materials[0].id : null, // Link to first material for now
                        materialsCount: materials.length,
                        completedCount
                    });

                    // Update chain for next node
                    isPreviousCompleted = isCompleted;
                });

                setMapNodes(nodes);
            } catch (error) {
                console.error("Failed to load map path", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedSubject]);

    const handleNodeClick = (node: LevelNode) => {
        if (node.status === 'locked') return;
        // Navigate to the first material or a module view
        if (node.materialId) {
            navigate(`/student/materials/${node.materialId}`); // Direct link for simplicity
        } else {
            notifications.info('Modul ini belum memiliki materi.', 'Konten belum tersedia');
        }
    };

    if (!selectedSubject) {
        return (
            <div className="container animate-slide-up" style={{ textAlign: 'center', padding: '2rem' }}>
                <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>Pilih Petualanganmu</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '3rem' }}>Setiap mata pelajaran adalah dunia baru untuk dijelajahi!</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
                    <SubjectCard
                        title="Matematika"
                        level="Level 1"
                        progress={0}
                        color="var(--primary)"
                        onClick={() => setSelectedSubject('MATEMATIKA')}
                    />
                    <SubjectCard
                        title="IPA"
                        level="Level 1"
                        progress={0}
                        color="#16a34a"
                        onClick={() => setSelectedSubject('IPA')}
                    />
                    <SubjectCard
                        title="IPS"
                        level="Level 1"
                        progress={0}
                        color="#d97706"
                        onClick={() => setSelectedSubject('IPS')}
                    />
                     <SubjectCard
                        title="Bahasa Inggris"
                        level="Level 1"
                        progress={0}
                        color="#2563eb"
                         onClick={() => setSelectedSubject('BAHASA_INGGRIS')}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ position: 'relative', minHeight: '800px', backgroundColor: '#f0f9ff', padding: '2rem', borderRadius: '1rem', overflow: 'hidden' }}>

            <button onClick={() => setSelectedSubject(null)} style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                <ArrowLeft size={20} /> Kembali
            </button>

            <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative', zIndex: 2 }}>
                <h1 className="text-gradient" style={{ fontSize: '2rem', textTransform: 'capitalize' }}>Peta {selectedSubject.toLowerCase().replace('_', ' ')}</h1>
                <p style={{ color: 'var(--text-muted)' }}>Selesaikan setiap tantangan untuk membuka level berikutnya!</p>
            </div>

            {/* Map Background Pattern */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                backgroundSize: '30px 30px', opacity: 0.5, zIndex: 0
            }}></div>

            {/* Path Connection Lines */}
            {mapNodes.length > 1 && (
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
                     <path 
                        d={`M ${mapNodes.map(n => `${n.position.x}% ${n.position.y}%`).join(' L ')}`} 
                        stroke="#cbd5e1" 
                        strokeWidth="4" 
                        strokeDasharray="10 5" 
                        fill="none" 
                    />
                </svg>
            )}

            {/* Nodes */}
            <div style={{ position: 'relative', height: '1000px', zIndex: 2 }}>
                {loading ? <div style={{textAlign: 'center', paddingTop: '4rem'}}>Loading Peta...</div> : mapNodes.map((node) => (
                    <div
                        key={node.id}
                        onClick={() => handleNodeClick(node)}
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
                        <div style={{ marginTop: '1rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '2rem', boxShadow: 'var(--shadow-sm)', textAlign: 'center', whiteSpace: 'nowrap', fontWeight: '600', color: node.status === 'locked' ? 'var(--text-muted)' : 'var(--text-main)', minWidth: '150px' }}>
                            <div>{node.title}</div>
                            <div style={{fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'normal'}}>
                                {node.completedCount}/{node.materialsCount} Selesai
                            </div>
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
        title={locked ? "Coming Soon" : "Mulai Belajar"}
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
