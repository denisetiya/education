import React, { useState, useEffect } from 'react';
import { Crown, TrendingUp, Loader, Trophy } from 'lucide-react';
import { leaderboardAPI } from '../../utils/api';
import type { LeaderboardEntry } from '../../types/api.types';

const getInitials = (name: string) => {
    if (!name) return 'S';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
};

export const StudentLeaderboard: React.FC = () => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        leaderboardAPI.get(10)
            .then(data => {
                setLeaderboard(data);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader className="animate-spin" size={40} color="var(--primary)" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: 'var(--error)' }}>Gagal memuat leaderboard: {error}</p>
            </div>
        );
    }

    if (leaderboard.length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>Belum ada data leaderboard.</p>
            </div>
        );
    }

    if (leaderboard.length < 3) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                    <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Papan Peringkat Kelas</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Top siswa dengan XP tertinggi minggu ini</p>
                </div>
                <div className="card glass" style={{ padding: '0', overflow: 'hidden' }}>
                    {leaderboard.map((student: LeaderboardEntry, index: number) => (
                        <div key={student.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '1rem 1.5rem',
                            borderBottom: index !== leaderboard.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none'
                        }}>
                            <div style={{ width: '30px', fontWeight: 'bold', color: 'var(--text-muted)' }}>{student.rank}</div>
                            <div style={{ marginLeft: '1rem', width: '40px', height: '40px', background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '700', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                {getInitials(student.name)}
                            </div>
                            <div style={{ marginLeft: '1rem', flex: 1 }}>
                                <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{student.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Level {student.level}</div>
                            </div>
                            <div style={{ fontWeight: 'bold', marginRight: '1rem', color: 'var(--text-muted)' }}>{student.xp} XP</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const topThree = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 className="text-gradient" style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: '800', marginBottom: '0.5rem' }}>Papan Peringkat Kelas</h1>
                <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                    <span>Top siswa dengan XP tertinggi minggu ini</span>
                    <Trophy size={16} color="#f59e0b" />
                </p>
            </div>

            {/* Podium Section */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                gap: 'clamp(0.5rem, 2vw, 1rem)',
                marginBottom: '3rem',
                paddingTop: '2rem',
                width: '100%',
                maxWidth: '500px',
                margin: '0 auto 3rem auto'
            }}>
                {/* 2nd Place */}
                <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 0', maxWidth: '140px', animationDelay: '0.2s' }}>
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <div style={{ width: 'clamp(60px, 15vw, 80px)', height: 'clamp(60px, 15vw, 80px)', borderRadius: '50%', background: '#fff', padding: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#e0e7ff', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(1rem, 3vw, 1.3rem)', fontWeight: '700' }}>{getInitials(topThree[1]?.name)}</div>
                        </div>
                        <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#94a3b8', color: 'white', padding: '2px 10px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold' }}>#2</div>
                    </div>
                    <div className="card glass" style={{
                        height: '160px', width: '100%',
                        background: 'linear-gradient(to top, #94a3b8 0%, rgba(148, 163, 184, 0.2) 100%)',
                        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', padding: '0.75rem',
                        border: 'none', borderRadius: '1rem'
                    }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem', textAlign: 'center', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{topThree[1]?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#475569' }}>{topThree[1]?.xp} XP</div>
                    </div>
                </div>

                {/* 1st Place */}
                <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1.2 1 0', maxWidth: '160px', zIndex: 10 }}>
                    <div className="animate-float" style={{ position: 'relative', marginBottom: '1rem' }}>
                        <Crown size={36} color="#fbbf24" style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', filter: 'drop-shadow(0 4px 4px rgba(251, 191, 36, 0.4))' }} />
                        <div style={{ width: 'clamp(75px, 18vw, 100px)', height: 'clamp(75px, 18vw, 100px)', borderRadius: '50%', background: '#fff', padding: '4px', boxShadow: '0 8px 20px rgba(251, 191, 36, 0.3)' }}>
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#fef3c7', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', fontWeight: '800' }}>{getInitials(topThree[0]?.name)}</div>
                        </div>
                        <div style={{ position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#fbbf24', color: 'white', padding: '4px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>#1</div>
                    </div>
                    <div className="card glass" style={{
                        height: '200px', width: '100%',
                        background: 'linear-gradient(to top, #fbbf24 0%, rgba(251, 191, 36, 0.2) 100%)',
                        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', padding: '0.75rem',
                        border: 'none', borderRadius: '1rem',
                        boxShadow: '0 0 30px rgba(251, 191, 36, 0.2)'
                    }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem', textAlign: 'center', color: '#92400e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{topThree[0]?.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 'bold' }}>{topThree[0]?.xp} XP</div>
                    </div>
                </div>

                {/* 3rd Place */}
                <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 0', maxWidth: '140px', animationDelay: '0.4s' }}>
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <div style={{ width: 'clamp(60px, 15vw, 80px)', height: 'clamp(60px, 15vw, 80px)', borderRadius: '50%', background: '#fff', padding: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#ffedd5', color: '#7c2d12', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(1rem, 3vw, 1.3rem)', fontWeight: '700' }}>{getInitials(topThree[2]?.name)}</div>
                        </div>
                        <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#ca8a04', color: 'white', padding: '2px 10px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold' }}>#3</div>
                    </div>
                    <div className="card glass" style={{
                        height: '140px', width: '100%',
                        background: 'linear-gradient(to top, #fdba74 0%, rgba(253, 186, 116, 0.2) 100%)',
                        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', padding: '0.75rem',
                        border: 'none', borderRadius: '1rem'
                    }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem', textAlign: 'center', color: '#7c2d12', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{topThree[2]?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9a3412' }}>{topThree[2]?.xp} XP</div>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="card glass" style={{ padding: '0', overflow: 'hidden' }}>
                {rest.map((student: LeaderboardEntry, index: number) => (
                    <div key={index} className="card-hover-effect" style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '1rem 1.5rem',
                        borderBottom: index !== rest.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                        background: student.name.includes('(You)') ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
                    }}>
                        <div style={{ width: '30px', fontWeight: 'bold', color: 'var(--text-muted)' }}>{student.rank}</div>
                        <div style={{ marginLeft: '1rem', width: '40px', height: '40px', background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', color: '#475569', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                            {getInitials(student.name)}
                        </div>
                        <div style={{ marginLeft: '1rem', flex: 1 }}>
                            <div style={{ fontWeight: '600', color: student.name.includes('(You)') ? 'var(--primary)' : 'var(--text-main)' }}>
                                {student.name}
                            </div>
                        </div>
                        <div style={{ fontWeight: 'bold', marginRight: '1rem', color: 'var(--text-muted)' }}>{student.xp} XP</div>
                        <div style={{ color: 'var(--success)' }}>
                            <TrendingUp size={18} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
