import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Map, Loader, CheckCircle, Lock, Play, Star } from 'lucide-react';
import { classesAPI } from '../../utils/api';

interface MaterialNode {
    id: string;
    title: string;
    type: string;
    status: 'completed' | 'in_progress' | 'locked' | 'available';
    moduleIndex: number;
    materialIndex: number;
}

interface Module {
    id: string;
    title: string;
    order: number;
    materials: Array<{
        id: string;
        title: string;
        type: string;
    }>;
}

export const ClassJourney: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [modules, setModules] = useState<Module[]>([]);
    const [materialProgress, setMaterialProgress] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [className, setClassName] = useState('');
    const [progressionMode, setProgressionMode] = useState('free');

    useEffect(() => {
        if (classId) {
            fetchData();
        }
    }, [classId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await classesAPI.getDashboard(classId!);
            setModules(data.class.modules);
            setClassName(data.class.name);
            setProgressionMode(data.class.progressionMode);
            
            // Build progress map
            const progressMap: Record<string, string> = {};
            data.materialProgress.forEach((p: any) => {
                progressMap[p.materialId] = p.status;
            });
            setMaterialProgress(progressMap);
        } catch (err) {
            console.error('Failed to fetch journey', err);
        } finally {
            setLoading(false);
        }
    };

    const getNodeStatus = (moduleIdx: number, matIdx: number, materialId: string): 'completed' | 'in_progress' | 'locked' | 'available' => {
        const status = materialProgress[materialId];
        if (status === 'completed') return 'completed';
        if (status === 'in_progress') return 'in_progress';
        
        if (progressionMode === 'free') return 'available';
        
        // Check if previous is completed for sequential mode
        if (moduleIdx === 0 && matIdx === 0) return 'available';
        
        // Get previous material
        let prevCompleted = false;
        if (matIdx > 0) {
            const prevMat = modules[moduleIdx].materials[matIdx - 1];
            prevCompleted = materialProgress[prevMat.id] === 'completed';
        } else if (moduleIdx > 0) {
            const prevModule = modules[moduleIdx - 1];
            const lastMat = prevModule.materials[prevModule.materials.length - 1];
            prevCompleted = materialProgress[lastMat?.id] === 'completed';
        }
        
        return prevCompleted ? 'available' : 'locked';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle size={20} color="#16a34a" />;
            case 'in_progress': return <Play size={20} color="#6366f1" />;
            case 'locked': return <Lock size={16} color="#94a3b8" />;
            default: return <Star size={18} color="#f59e0b" />;
        }
    };

    const getTypeEmoji = (type: string) => {
        switch (type) {
            case 'video': return '🎥';
            case 'book': return '📖';
            case 'quiz': return '📝';
            case 'article': return '📄';
            default: return '📚';
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader className="animate-spin" size={48} style={{ color: 'var(--primary)' }} />
            </div>
        );
    }

    if (modules.length === 0) {
        return (
            <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div className="card glass" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    <Map size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>Belum ada modul di kelas ini.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>
                    🗺️ Perjalanan Belajar
                </h1>
                <p style={{ color: '#64748b' }}>Kelas: {className}</p>
            </div>

            {/* Journey Map */}
            <div style={{ position: 'relative' }}>
                {modules.map((module, moduleIdx) => (
                    <div key={module.id} style={{ marginBottom: '3rem' }}>
                        {/* Module Header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: '800',
                                fontSize: '1.2rem'
                            }}>
                                {moduleIdx + 1}
                            </div>
                            <div>
                                <h2 style={{ fontWeight: '700', color: '#334155', fontSize: '1.2rem' }}>
                                    {module.title}
                                </h2>
                                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                    {module.materials.length} materi
                                </p>
                            </div>
                        </div>

                        {/* Materials as Nodes */}
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '1rem',
                            paddingLeft: '25px',
                            borderLeft: '3px solid #e2e8f0',
                            marginLeft: '25px'
                        }}>
                            {module.materials.map((material, matIdx) => {
                                const status = getNodeStatus(moduleIdx, matIdx, material.id);
                                const isLocked = status === 'locked';
                                
                                return (
                                    <div
                                        key={material.id}
                                        onClick={() => !isLocked && navigate(`/student/materials/${material.id}`)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '1rem 1.25rem',
                                            background: status === 'completed' ? '#f0fdf4' : isLocked ? '#f8fafc' : 'white',
                                            borderRadius: '1rem',
                                            border: `2px solid ${status === 'completed' ? '#86efac' : isLocked ? '#e2e8f0' : '#6366f1'}`,
                                            cursor: isLocked ? 'not-allowed' : 'pointer',
                                            opacity: isLocked ? 0.6 : 1,
                                            transition: 'all 0.2s',
                                            minWidth: '200px',
                                            boxShadow: status === 'available' ? '0 4px 12px rgba(99, 102, 241, 0.2)' : 'none'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.5rem' }}>{getTypeEmoji(material.type)}</span>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: '600', color: isLocked ? '#94a3b8' : '#334155', fontSize: '0.95rem' }}>
                                                {material.title}
                                            </p>
                                        </div>
                                        {getStatusIcon(status)}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ClassJourney;
