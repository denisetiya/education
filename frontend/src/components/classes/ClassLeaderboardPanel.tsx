import React from 'react';
import {
    Award,
    Crown,
    Medal,
    MessageSquare,
    Sparkles,
    Star,
    Target,
    Trophy
} from 'lucide-react';
import type { ClassLeaderboardBadge, ClassLeaderboardEntry } from '../../types/api.types';
import { classesAPI } from '../../utils/api';

interface ClassLeaderboardPanelProps {
    classId: string;
    className?: string;
    viewer: 'student' | 'teacher';
}

const badgeToneMap: Record<string, { background: string; color: string }> = {
    amber: { background: '#fef3c7', color: '#92400e' },
    gold: { background: '#fde68a', color: '#92400e' },
    emerald: { background: '#dcfce7', color: '#166534' },
    blue: { background: '#dbeafe', color: '#1d4ed8' },
    violet: { background: '#ede9fe', color: '#6d28d9' }
};

const renderBadgeIcon = (icon: string) => {
    switch (icon) {
        case 'crown':
            return <Crown size={14} />;
        case 'medal':
            return <Medal size={14} />;
        case 'target':
            return <Target size={14} />;
        case 'sparkles':
            return <Sparkles size={14} />;
        case 'star':
            return <Star size={14} />;
        case 'message-circle':
            return <MessageSquare size={14} />;
        case 'compass':
            return <Award size={14} />;
        default:
            return <Trophy size={14} />;
    }
};

const getBadgeStyle = (badge: ClassLeaderboardBadge) => badgeToneMap[badge.tone] || badgeToneMap.blue;

export const ClassLeaderboardPanel: React.FC<ClassLeaderboardPanelProps> = ({ classId, className, viewer }) => {
    const [entries, setEntries] = React.useState<ClassLeaderboardEntry[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const loadLeaderboard = async () => {
            try {
                setLoading(true);
                const data = await classesAPI.getLeaderboard(classId);
                setEntries(data);
            } catch (error) {
                console.error('Failed to load class leaderboard', error);
            } finally {
                setLoading(false);
            }
        };

        void loadLeaderboard();
    }, [classId]);

    const completionAverage = entries.length > 0
        ? Math.round(entries.reduce((sum, entry) => sum + entry.completionRate, 0) / entries.length)
        : 0;

    const topDiscussant = entries.slice().sort((left, right) => right.discussionCount - left.discussionCount)[0];
    const topBadgeCollector = entries.slice().sort((left, right) => right.badges.length - left.badges.length)[0];

    if (loading) {
        return (
            <div className="card glass" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                Memuat leaderboard kelas...
            </div>
        );
    }

    if (entries.length === 0) {
        return (
            <div className="card glass" style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                Belum ada data leaderboard untuk kelas ini.
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card glass" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                        <p style={{ color: '#7c3aed', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                            Papan Kompetisi Kelas
                        </p>
                        <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                            Leaderboard {className || 'Kelas'}
                        </h2>
                        <p style={{ color: '#64748b', lineHeight: 1.6 }}>
                            XP kelas dihitung dari materi, latihan, badge, dan aktivitas diskusi.
                        </p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', minWidth: '320px' }}>
                        <div style={{ padding: '0.9rem 1rem', borderRadius: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Peserta aktif</p>
                            <p style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a' }}>{entries.length}</p>
                        </div>
                        <div style={{ padding: '0.9rem 1rem', borderRadius: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Rata progress</p>
                            <p style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a' }}>{completionAverage}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {viewer === 'teacher' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    <div className="card glass" style={{ padding: '1.1rem 1.2rem' }}>
                        <p style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: '0.35rem' }}>Peringkat pertama</p>
                        <p style={{ fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>{entries[0]?.name || '-'}</p>
                        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{entries[0]?.classXp || 0} XP kelas</p>
                    </div>
                    <div className="card glass" style={{ padding: '1.1rem 1.2rem' }}>
                        <p style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: '0.35rem' }}>Paling aktif diskusi</p>
                        <p style={{ fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>{topDiscussant?.name || '-'}</p>
                        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{topDiscussant?.discussionCount || 0} kontribusi</p>
                    </div>
                    <div className="card glass" style={{ padding: '1.1rem 1.2rem' }}>
                        <p style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: '0.35rem' }}>Kolektor badge</p>
                        <p style={{ fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>{topBadgeCollector?.name || '-'}</p>
                        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{topBadgeCollector?.badges.length || 0} badge aktif</p>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {entries.map((entry) => (
                    <div
                        key={entry.studentId}
                        className="card glass"
                        style={{
                            padding: '1rem 1.1rem',
                            border: entry.isCurrentUser ? '2px solid #6366f1' : '1px solid rgba(226, 232, 240, 0.9)',
                            background: entry.rank === 1
                                ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.18), rgba(255, 255, 255, 0.92))'
                                : 'white'
                        }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: '72px minmax(0, 1fr) auto', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <div
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '999px',
                                        background: entry.rank === 1 ? '#facc15' : entry.rank <= 3 ? '#e2e8f0' : '#f8fafc',
                                        color: entry.rank === 1 ? '#92400e' : '#334155',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '800'
                                    }}
                                >
                                    #{entry.rank}
                                </div>
                            </div>

                            <div style={{ minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>{entry.name}</h3>
                                    {entry.isCurrentUser && (
                                        <span style={{ padding: '0.25rem 0.55rem', borderRadius: '999px', background: '#eef2ff', color: '#4338ca', fontSize: '0.72rem', fontWeight: '700' }}>
                                            Kamu
                                        </span>
                                    )}
                                    <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Level {entry.level}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.55rem' }}>
                                    {entry.badges.map((badge) => {
                                        const style = getBadgeStyle(badge);
                                        return (
                                            <span
                                                key={badge.id}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.35rem',
                                                    padding: '0.3rem 0.55rem',
                                                    borderRadius: '999px',
                                                    background: style.background,
                                                    color: style.color,
                                                    fontSize: '0.72rem',
                                                    fontWeight: '700'
                                                }}
                                            >
                                                {renderBadgeIcon(badge.icon)}
                                                {badge.label}
                                            </span>
                                        );
                                    })}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.55rem' }}>
                                    <span style={{ color: '#475569', fontSize: '0.82rem' }}>Materi: <strong>{entry.materialXp} XP</strong></span>
                                    <span style={{ color: '#475569', fontSize: '0.82rem' }}>Latihan: <strong>{entry.exerciseXp} XP</strong></span>
                                    <span style={{ color: '#475569', fontSize: '0.82rem' }}>Badge: <strong>{entry.achievementXp} XP</strong></span>
                                    <span style={{ color: '#475569', fontSize: '0.82rem' }}>Diskusi: <strong>{entry.discussionCount}</strong></span>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right', minWidth: '110px' }}>
                                <p style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a' }}>{entry.classXp}</p>
                                <p style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: '0.55rem' }}>XP kelas</p>
                                <div style={{ width: '120px', height: '8px', borderRadius: '999px', background: '#e2e8f0', overflow: 'hidden', marginLeft: 'auto' }}>
                                    <div
                                        style={{
                                            width: `${Math.max(8, entry.completionRate)}%`,
                                            height: '100%',
                                            borderRadius: '999px',
                                            background: 'linear-gradient(90deg, #6366f1, #0ea5e9)'
                                        }}
                                    />
                                </div>
                                <p style={{ color: '#64748b', fontSize: '0.76rem', marginTop: '0.4rem' }}>{entry.completionRate}% materi selesai</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ClassLeaderboardPanel;
