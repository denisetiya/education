import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Map, Loader, CheckCircle, Lock, Play, Star, ChevronDown, Trophy, PartyPopper, ArrowRight } from 'lucide-react';
import { classesAPI } from '../../utils/api';
import { getContentTypeIcon } from '../../components/common/IconHelpers';

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
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

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

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => {
            const next = new Set(prev);
            if (next.has(moduleId)) {
                next.delete(moduleId);
            } else {
                next.add(moduleId);
            }
            return next;
        });
    };

    const getModuleProgress = (module: Module) => {
        let completed = 0;
        module.materials.forEach(mat => {
            if (materialProgress[mat.id] === 'completed') completed++;
        });
        return { completed, total: module.materials.length };
    };

    const getNodeStatus = (moduleIdx: number, matIdx: number, materialId: string): 'completed' | 'in_progress' | 'locked' | 'available' => {
        const status = materialProgress[materialId];
        if (status === 'completed') return 'completed';
        if (status === 'in_progress') return 'in_progress';
        
        if (progressionMode === 'free') return 'available';
        if (moduleIdx === 0 && matIdx === 0) return 'available';
        
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
            case 'completed': return <CheckCircle size={16} color="#16a34a" />;
            case 'in_progress': return <Play size={16} color="#6366f1" />;
            case 'locked': return <Lock size={14} color="#94a3b8" />;
            default: return <Star size={14} color="#f59e0b" />;
        }
    };

    const getTypeEmoji = (type: string) => {
        return getContentTypeIcon(type, 18);
    };

    const getModuleColors = (module: Module) => {
        const { completed, total } = getModuleProgress(module);
        if (completed === total && total > 0) return { main: '#22c55e', light: '#dcfce7' };
        if (completed > 0) return { main: '#6366f1', light: '#e0e7ff' };
        return { main: '#64748b', light: '#f1f5f9' };
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

    // Calculate total height needed for SVG path
    const nodeSpacing = 200;
    const totalHeight = modules.length * nodeSpacing;

    return (
        <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Map size={28} style={{ color: 'var(--primary)', flexShrink: 0 }} /> Perjalanan Belajar
                </h1>
                <p style={{ color: '#64748b' }}>Kelas: {className}</p>
            </div>

            {/* Journey Path Container */}
            <div style={{ 
                position: 'relative',
                paddingTop: '40px',
                paddingBottom: '60px'
            }}>
                {/* SVG Curved Path */}
                <svg 
                    style={{ 
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '400px',
                        height: `${totalHeight + 100}px`,
                        pointerEvents: 'none',
                        zIndex: 0
                    }}
                    viewBox={`0 0 400 ${totalHeight + 100}`}
                >
                    <defs>
                        <linearGradient id="pathGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#c7d2fe" />
                            <stop offset="50%" stopColor="#a5b4fc" />
                            <stop offset="100%" stopColor="#818cf8" />
                        </linearGradient>
                    </defs>
                    
                    {/* Main curved snake path */}
                    <path 
                        d={modules.map((_, idx) => {
                            const y = idx * nodeSpacing + 60;
                            const nextY = (idx + 1) * nodeSpacing + 60;
                            const isLeft = idx % 2 === 0;
                            const x = isLeft ? 120 : 280;
                            const nextX = isLeft ? 280 : 120;
                            
                            if (idx === 0) {
                                if (modules.length === 1) return `M ${x} ${y}`;
                                return `M ${x} ${y} Q ${x} ${y + 80}, ${200} ${y + 100} Q ${nextX} ${y + 120}, ${nextX} ${nextY}`;
                            }
                            if (idx === modules.length - 1) return '';
                            return `Q ${x} ${y + 80}, ${200} ${y + 100} Q ${nextX} ${y + 120}, ${nextX} ${nextY}`;
                        }).join(' ')}
                        fill="none"
                        stroke="url(#pathGrad)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.6"
                    />
                    
                    {/* Dotted overlay for texture */}
                    <path 
                        d={modules.map((_, idx) => {
                            const y = idx * nodeSpacing + 60;
                            const nextY = (idx + 1) * nodeSpacing + 60;
                            const isLeft = idx % 2 === 0;
                            const x = isLeft ? 120 : 280;
                            const nextX = isLeft ? 280 : 120;
                            
                            if (idx === 0) {
                                if (modules.length === 1) return `M ${x} ${y}`;
                                return `M ${x} ${y} Q ${x} ${y + 80}, ${200} ${y + 100} Q ${nextX} ${y + 120}, ${nextX} ${nextY}`;
                            }
                            if (idx === modules.length - 1) return '';
                            return `Q ${x} ${y + 80}, ${200} ${y + 100} Q ${nextX} ${y + 120}, ${nextX} ${nextY}`;
                        }).join(' ')}
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray="0,15"
                        opacity="0.8"
                    />
                </svg>

                {/* Module Nodes */}
                {modules.map((module, idx) => {
                    const isExpanded = expandedModules.has(module.id);
                    const { completed, total } = getModuleProgress(module);
                    const colors = getModuleColors(module);
                    const isLeft = idx % 2 === 0;
                    const isComplete = completed === total && total > 0;

                    return (
                        <div
                            key={module.id}
                            style={{
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isLeft ? 'flex-start' : 'flex-end',
                                paddingLeft: isLeft ? '0' : '0',
                                paddingRight: isLeft ? '0' : '0',
                                marginBottom: isExpanded ? '40px' : '120px',
                                zIndex: 1
                            }}
                        >
                            {/* Node Circle + Content */}
                            <div 
                                style={{
                                    display: 'flex',
                                    flexDirection: isLeft ? 'row' : 'row-reverse',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    marginLeft: isLeft ? '20%' : '0',
                                    marginRight: isLeft ? '0' : '20%'
                                }}
                            >
                                {/* Circle Node */}
                                <div
                                    onClick={() => toggleModule(module.id)}
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        background: `linear-gradient(145deg, ${colors.main}, ${colors.main}dd)`,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        boxShadow: `0 8px 24px ${colors.main}40, 0 4px 8px rgba(0,0,0,0.1)`,
                                        border: '4px solid white',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        transform: isExpanded ? 'scale(1.15)' : 'scale(1)',
                                        position: 'relative'
                                    }}
                                >
                                    <span style={{ 
                                        fontSize: '1.75rem', 
                                        fontWeight: '800', 
                                        color: 'white',
                                        lineHeight: 1
                                    }}>
                                        {idx + 1}
                                    </span>
                                    {isComplete && (
                                        <CheckCircle 
                                            size={18} 
                                            color="white" 
                                            style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: colors.main, borderRadius: '50%', padding: '2px' }} 
                                        />
                                    )}
                                </div>

                                {/* Module Info Card */}
                                <div
                                    onClick={() => toggleModule(module.id)}
                                    style={{
                                        background: 'white',
                                        borderRadius: '16px',
                                        padding: '1rem 1.25rem',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                        border: `2px solid ${isExpanded ? colors.main : '#e2e8f0'}`,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        minWidth: '180px'
                                    }}
                                >
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <h3 style={{ 
                                            fontWeight: '700', 
                                            color: '#1e293b', 
                                            fontSize: '1rem',
                                            margin: 0 
                                        }}>
                                            {module.title}
                                        </h3>
                                        <ChevronDown 
                                            size={18} 
                                            color="#64748b"
                                            style={{ 
                                                transition: 'transform 0.3s',
                                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)'
                                            }}
                                        />
                                    </div>
                                    
                                    <div style={{ 
                                        fontSize: '0.8rem', 
                                        color: '#64748b',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {completed}/{total} materi selesai
                                    </div>

                                    {/* Progress Bar */}
                                    <div style={{
                                        height: '6px',
                                        background: '#e2e8f0',
                                        borderRadius: '3px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${total > 0 ? (completed / total) * 100 : 0}%`,
                                            background: `linear-gradient(90deg, ${colors.main}, ${colors.main}cc)`,
                                            borderRadius: '3px',
                                            transition: 'width 0.5s ease'
                                        }} />
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Materials */}
                            {isExpanded && (
                                <div
                                    style={{
                                        marginTop: '1rem',
                                        marginLeft: isLeft ? 'calc(20% + 96px)' : '20%',
                                        marginRight: isLeft ? '20%' : 'calc(20% + 96px)',
                                        animation: 'fadeSlideIn 0.3s ease-out',
                                        width: 'calc(60% - 96px)'
                                    }}
                                >
                                    <style>{`
                                        @keyframes fadeSlideIn {
                                            from { opacity: 0; transform: translateY(-12px); }
                                            to { opacity: 1; transform: translateY(0); }
                                        }
                                    `}</style>
                                    
                                    {module.materials.map((mat, matIdx) => {
                                        const status = getNodeStatus(idx, matIdx, mat.id);
                                        const isLocked = status === 'locked';
                                        
                                        return (
                                            <div
                                                key={mat.id}
                                                onClick={() => !isLocked && navigate(`/student/materials/${mat.id}`)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    padding: '0.75rem 1rem',
                                                    marginBottom: '0.5rem',
                                                    background: status === 'completed' ? '#f0fdf4' 
                                                        : status === 'available' ? 'white' 
                                                        : '#f8fafc',
                                                    borderRadius: '12px',
                                                    border: `2px solid ${
                                                        status === 'completed' ? '#86efac' 
                                                        : status === 'available' ? '#6366f1' 
                                                        : '#e2e8f0'
                                                    }`,
                                                    cursor: isLocked ? 'not-allowed' : 'pointer',
                                                    opacity: isLocked ? 0.5 : 1,
                                                    transition: 'all 0.2s',
                                                    boxShadow: status === 'available' 
                                                        ? '0 4px 12px rgba(99, 102, 241, 0.15)' 
                                                        : 'none'
                                                }}
                                            >
                                                <span style={{ fontSize: '1.2rem' }}>
                                                    {getTypeEmoji(mat.type)}
                                                </span>
                                                <span style={{ 
                                                    flex: 1, 
                                                    fontWeight: '500',
                                                    color: isLocked ? '#94a3b8' : '#334155',
                                                    fontSize: '0.9rem',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {mat.title}
                                                </span>
                                                {getStatusIcon(status)}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Per-Module Completion Banner */}
                            {isComplete && isExpanded && (
                                <div style={{
                                    marginTop: '0.75rem',
                                    marginLeft: isLeft ? 'calc(20% + 96px)' : '20%',
                                    marginRight: isLeft ? '20%' : 'calc(20% + 96px)',
                                    width: 'calc(60% - 96px)',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                                    border: '2px solid #86efac',
                                    textAlign: 'center',
                                    animation: 'fadeSlideIn 0.3s ease-out',
                                    boxShadow: '0 2px 12px rgba(34, 197, 94, 0.12)'
                                }}>
                                    <Trophy size={24} color="#16a34a" style={{ marginBottom: '0.35rem' }} />
                                    <p style={{ fontWeight: '700', color: '#166534', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                        Modul &quot;{module.title}&quot; Selesai!
                                    </p>
                                    <p style={{ color: '#15803d', fontSize: '0.8rem' }}>
                                        Lanjutkan semangatmu ke modul berikutnya.
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* End Trophy */}
                <div style={{
                    textAlign: 'center',
                    marginTop: '-60px',
                    position: 'relative',
                    zIndex: 2
                }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(145deg, #fbbf24, #f59e0b)',
                        boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)',
                        border: '3px solid white',
                        color: 'white'
                    }}>
                        <Trophy size={28} color="white" />
                    </div>
                </div>

                {/* Congratulations Banner - All Modules Complete */}
                {(() => {
                    const allModulesComplete = modules.length > 0 && modules.every(mod => {
                        const { completed, total } = getModuleProgress(mod);
                        return completed === total && total > 0;
                    });
                    if (!allModulesComplete) return null;

                    return (
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '2rem',
                            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #fef9c3 100%)',
                            borderRadius: '1.5rem',
                            border: '2px solid #86efac',
                            textAlign: 'center',
                            animation: 'fadeIn 0.5s ease-out',
                            boxShadow: '0 8px 32px rgba(34, 197, 94, 0.2)'
                        }}>
                            <PartyPopper size={48} color="#16a34a" style={{ marginBottom: '0.75rem' }} />
                            <h2 style={{
                                fontSize: '1.5rem',
                                fontWeight: '800',
                                color: '#166534',
                                marginBottom: '0.5rem'
                            }}>
                                Selamat! Kamu Telah Menyelesaikan Semua Modul!
                            </h2>
                            <p style={{
                                color: '#15803d',
                                fontSize: '1rem',
                                lineHeight: 1.6,
                                marginBottom: '1.5rem',
                                maxWidth: '500px',
                                margin: '0 auto 1.5rem'
                            }}>
                                Hebat! Semua materi di kelas <strong>{className}</strong> sudah kamu tuntaskan.
                                Teruskan semangat belajarmu ke kelas berikutnya!
                            </p>
                            <button
                                onClick={() => navigate('/student/classes')}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.85rem 2rem',
                                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '1rem',
                                    fontWeight: '700',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 24px rgba(22, 163, 74, 0.35)',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(22, 163, 74, 0.45)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(22, 163, 74, 0.35)';
                                }}
                            >
                                <Trophy size={20} /> Lanjut ke Kelas Berikutnya <ArrowRight size={20} />
                            </button>
                        </div>
                    );
                })()}
            </div>

            {/* Legend */}
            <div style={{
                marginTop: '2rem',
                display: 'flex',
                justifyContent: 'center',
                gap: '1.5rem',
                flexWrap: 'wrap',
                padding: '1rem',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
                {[
                    { color: '#22c55e', label: 'Selesai' },
                    { color: '#6366f1', label: 'Sedang Belajar' },
                    { color: '#64748b', label: 'Belum Dimulai' }
                ].map(item => (
                    <div key={item.label} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        fontSize: '0.85rem', 
                        color: '#64748b' 
                    }}>
                        <div style={{ 
                            width: '14px', 
                            height: '14px', 
                            borderRadius: '50%', 
                            background: item.color,
                            boxShadow: `0 2px 6px ${item.color}40`
                        }} />
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ClassJourney;
