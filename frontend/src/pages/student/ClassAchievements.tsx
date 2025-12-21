import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Trophy, Loader, Star, CheckCircle } from 'lucide-react';
import { classesAPI } from '../../utils/api';

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    xpReward: number;
    condition: any;
}

interface UnlockedAchievement {
    achievement: { id: string };
}

export const ClassAchievements: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [className, setClassName] = useState('');

    useEffect(() => {
        if (classId) {
            fetchData();
        }
    }, [classId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await classesAPI.getDashboard(classId!);
            setClassName(data.class.name);
            setAchievements(data.class.achievements || []);
            setUnlockedIds(
                (data.achievements?.unlocked || []).map((u: UnlockedAchievement) => u.achievement.id)
            );
        } catch (err) {
            console.error('Failed to fetch achievements', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader className="animate-spin" size={48} style={{ color: 'var(--primary)' }} />
            </div>
        );
    }

    const unlockedCount = unlockedIds.length;
    const totalCount = achievements.length;

    return (
        <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>
                    🏆 Achievements Kelas
                </h1>
                <p style={{ color: '#64748b' }}>Kelas: {className}</p>
            </div>

            {/* Progress */}
            <div className="card glass" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Trophy size={40} color="white" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#334155' }}>
                            {unlockedCount} / {totalCount}
                        </h2>
                        <p style={{ color: '#64748b' }}>Achievements Diraih</p>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{
                            height: '12px',
                            background: '#e2e8f0',
                            borderRadius: '6px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                                borderRadius: '6px',
                                transition: 'width 0.5s ease'
                            }} />
                        </div>
                    </div>
                </div>
            </div>

            {achievements.length === 0 ? (
                <div className="card glass" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    <Trophy size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>Belum ada achievement di kelas ini.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {achievements.map(ach => {
                        const isUnlocked = unlockedIds.includes(ach.id);
                        
                        return (
                            <div
                                key={ach.id}
                                className="card glass"
                                style={{
                                    padding: '1.5rem',
                                    opacity: isUnlocked ? 1 : 0.6,
                                    border: isUnlocked ? '2px solid #fbbf24' : '2px solid transparent',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {isUnlocked && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '0.75rem',
                                        right: '0.75rem'
                                    }}>
                                        <CheckCircle size={24} color="#16a34a" fill="#dcfce7" />
                                    </div>
                                )}
                                
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                    <span style={{ fontSize: '3rem' }}>{ach.icon}</span>
                                    <div>
                                        <h3 style={{ fontWeight: '700', color: '#334155', marginBottom: '0.25rem' }}>
                                            {ach.title}
                                        </h3>
                                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.75rem' }}>
                                            {ach.description}
                                        </p>
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.3rem',
                                            background: isUnlocked ? '#fef3c7' : '#f1f5f9',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.85rem',
                                            fontWeight: '700',
                                            color: isUnlocked ? '#92400e' : '#64748b'
                                        }}>
                                            <Star size={14} fill={isUnlocked ? '#f59e0b' : '#94a3b8'} />
                                            +{ach.xpReward} XP
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ClassAchievements;
