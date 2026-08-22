import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, Users, CheckCircle, AlertCircle, Clock,
    BookOpen, Target, RefreshCw, ArrowUp, ArrowDown,
    Brain, ExternalLink, BarChart3
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Area, Line, Legend, ComposedChart
} from 'recharts';
import type { TeacherAnalyticsData } from '../../types/api.types';
import { analyticsAPI } from '../../utils/api';
import { useNotifications } from '../../contexts/NotificationContext';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16'];

type TimePreset = '7d' | '30d' | '90d' | 'custom';

const getDateRange = (preset: TimePreset, customStart?: string, customEnd?: string) => {
    const end = customEnd ? new Date(customEnd) : new Date();
    end.setHours(23, 59, 59, 999);

    let start: Date;
    if (preset === 'custom' && customStart) {
        start = new Date(customStart);
    } else {
        const days = preset === '7d' ? 7 : preset === '90d' ? 90 : 30;
        start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    }
    start.setHours(0, 0, 0, 0);

    return {
        startDate: start.toISOString(),
        endDate: end.toISOString()
    };
};

const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}j ${m}m`;
    return `${m}m`;
};

const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

const formatDateFull = (iso: string) => new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
});

export const TeacherAnalytics: React.FC = () => {
    const navigate = useNavigate();
    const notifications = useNotifications();
    const [data, setData] = useState<TeacherAnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timePreset, setTimePreset] = useState<TimePreset>('30d');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const { startDate, endDate } = getDateRange(timePreset, customStart, customEnd);
            const result = await analyticsAPI.getTeacherAnalytics(startDate, endDate);
            setData(result);
        } catch (error) {
            console.error('Failed to fetch analytics', error);
            notifications.error('Gagal memuat data analitik');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [timePreset]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <BarChart3 size={40} className="animate-pulse" color="var(--primary)" style={{ display: 'inline-block', marginBottom: '1rem' }} />
                    <p style={{ color: '#64748b' }}>Memuat data analitik...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: '#94a3b8' }}>Tidak dapat memuat data analitik.</p>
                <button onClick={fetchData} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    <RefreshCw size={16} style={{ marginRight: '0.5rem' }} /> Coba Lagi
                </button>
            </div>
        );
    }

    const { overview, weeklyPerformance, studentsAtRisk, classSummaries } = data;

    const weeklyChartData = weeklyPerformance.map(d => ({
        date: formatDate(d.date),
        'Rata-rata Nilai': d.avgScore,
        'Partisipasi': d.participation,
        'Penyelesaian': d.completions
    }));

    const classChartData = classSummaries
        .sort((a, b) => b.averageProgress - a.averageProgress)
        .map(c => ({
            name: c.name.length > 15 ? c.name.substring(0, 14) + '...' : c.name,
            progress: c.averageProgress,
            students: c.activeStudents,
            fullName: c.name
        }));

    const now = new Date();
    const inactiveThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div className="animate-slide-up">
                <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: '800' }}>
                    Analitik Pembelajaran
                </h1>
                <p style={{ color: '#64748b' }}>
                    Wawasan mendalam tentang performa siswa dan efektivitas materi pembelajaran.
                </p>
            </div>

            {/* Time Filter */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '1rem',
                padding: '1rem 1.25rem', background: '#f8fafc', borderRadius: '1rem',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Periode:</span>
                    {([
                        ['7d', '7 Hari'],
                        ['30d', '30 Hari'],
                        ['90d', '3 Bulan'],
                        ['custom', 'Custom']
                    ] as const).map(([preset, label]) => (
                        <button
                            key={preset}
                            onClick={() => {
                                setTimePreset(preset);
                                if (preset !== 'custom') { setCustomStart(''); setCustomEnd(''); }
                                else {
                                    const n = new Date();
                                    const a = new Date(n.getTime() - 30 * 24 * 60 * 60 * 1000);
                                    setCustomStart(a.toISOString().split('T')[0]);
                                    setCustomEnd(n.toISOString().split('T')[0]);
                                }
                            }}
                            style={{
                                padding: '0.4rem 0.85rem', borderRadius: '0.5rem',
                                border: '1px solid #e2e8f0', cursor: 'pointer',
                                fontSize: '0.8rem', fontWeight: timePreset === preset ? '600' : '400',
                                background: timePreset === preset ? 'var(--primary)' : 'white',
                                color: timePreset === preset ? 'white' : '#64748b',
                                transition: 'all 0.2s'
                            }}
                        >
                            {label}
                        </button>
                    ))}

                    {timePreset === 'custom' && (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
                                style={{ padding: '0.35rem 0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.8rem' }} />
                            <span style={{ color: '#94a3b8' }}>-</span>
                            <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                                style={{ padding: '0.35rem 0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.8rem' }} />
                            <button onClick={fetchData} className="btn btn-primary"
                                style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <RefreshCw size={14} /> Terapkan
                            </button>
                        </div>
                    )}
                </div>

                <button onClick={fetchData} style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.5rem 0.85rem', borderRadius: '0.5rem',
                    border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.8rem',
                    background: 'white', color: '#64748b'
                }}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Overview Cards */}
            <div className="animate-slide-up" style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem',
                animationDelay: '0.1s'
            }}>
                <StatCard icon={<TrendingUp size={22} color="white" />} label="Rata-rata Nilai" value={overview.avgScore.toString()} change={overview.participationRate > 70 ? '+Aktif' : '-Perlu Perhatian'} isPositive={overview.participationRate > 70} color="#6366f1" />
                <StatCard icon={<Users size={22} color="white" />} label="Tingkat Partisipasi" value={`${overview.participationRate}%`} change={`${overview.activeStudents}/${overview.totalStudents} siswa`} isPositive={true} color="#06b6d4" />
                <StatCard icon={<CheckCircle size={22} color="white" />} label="Tugas Selesai" value={overview.totalTasks.toString()} change={`${overview.totalClasses} kelas`} isPositive={true} color="#10b981" />
                <StatCard icon={<Clock size={22} color="white" />} label="Rata-rata Waktu/Siswa" value={formatDuration(overview.avgTimeSpent)} change="per sesi" isPositive={true} color="#f59e0b" />
                <StatCard icon={<Brain size={22} color="white" />} label="Nilai Latihan" value={overview.exerciseAvgScore.toString()} change="rata-rata" isPositive={overview.exerciseAvgScore >= 60} color="#8b5cf6" />
            </div>

            {/* Main Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                {/* Weekly Performance Chart */}
                <div className="card glass animate-slide-up" style={{ padding: '1.75rem', animationDelay: '0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrendingUp size={18} color="var(--primary)" /> Performa Harian
                        </h3>
                    </div>
                    <div style={{ height: '320px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={weeklyChartData}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Legend />
                                <Area yAxisId="left" type="monotone" dataKey="Partisipasi" stroke="#06b6d4" fill="url(#colorScore)" strokeWidth={2} />
                                <Bar yAxisId="right" dataKey="Penyelesaian" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                                <Line yAxisId="left" type="monotone" dataKey="Rata-rata Nilai" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Students At Risk */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card glass animate-slide-up" style={{ padding: '1.5rem', animationDelay: '0.3s' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertCircle size={18} color="#ef4444" /> Siswa Perlu Perhatian
                        </h3>
                        {studentsAtRisk.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {studentsAtRisk.map((student, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        padding: '0.75rem', borderRadius: '0.75rem',
                                        background: '#fef2f2', border: '1px solid #fee2e2'
                                    }}>
                                        <AlertCircle size={18} color="#ef4444" />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1f2937' }}>{student.name}</p>
                                            <p style={{ fontSize: '0.8rem', color: '#ef4444' }}>{student.issue} — Progress: {student.progress} materi</p>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: student.score < 50 ? '#ef4444' : '#f59e0b' }}>
                                            {student.score}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                <CheckCircle size={32} style={{ marginBottom: '0.5rem', color: '#10b981' }} />
                                <p>Semua siswa menunjukkan performa baik!</p>
                            </div>
                        )}
                    </div>

                    <div className="card glass animate-slide-up" style={{
                        padding: '1.5rem', flex: 1, animationDelay: '0.4s',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white'
                    }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>Ringkasan Cepat</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ opacity: 0.9 }}>Total Kelas</span>
                                <span style={{ fontWeight: '600' }}>{overview.totalClasses}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ opacity: 0.9 }}>Total Siswa</span>
                                <span style={{ fontWeight: '600' }}>{overview.totalStudents}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ opacity: 0.9 }}>Total Materi</span>
                                <span style={{ fontWeight: '600' }}>{overview.totalMaterials}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ opacity: 0.9 }}>Siswa Aktif</span>
                                <span style={{ fontWeight: '600' }}>{overview.activeStudents} ({overview.participationRate}%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Class Summaries */}
            {classSummaries.length > 0 && (
                <div className="card glass animate-slide-up" style={{ padding: '1.75rem', animationDelay: '0.5s' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BookOpen size={18} color="var(--primary)" /> Performa Per Kelas
                    </h3>
                    <div style={{ height: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={classChartData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
                                <Tooltip
                                    formatter={((value: any, name: any) => [`${value}${name === 'progress' ? '%' : ''}`, name === 'progress' ? 'Progress Rata-rata' : 'Siswa Aktif']) as any}
                                    labelFormatter={((label: any) => classChartData.find(d => d.name === label)?.fullName || label) as any}
                                />
                                <Bar dataKey="progress" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={16} name="Progress Rata-rata" />
                                <Bar dataKey="students" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={16} name="Siswa Aktif" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '0.6rem', textAlign: 'left', fontWeight: '600', color: '#64748b' }}>Kelas</th>
                                    <th style={{ padding: '0.6rem', textAlign: 'center', fontWeight: '600', color: '#64748b' }}>Siswa</th>
                                    <th style={{ padding: '0.6rem', textAlign: 'center', fontWeight: '600', color: '#64748b' }}>Progress</th>
                                    <th style={{ padding: '0.6rem', textAlign: 'center', fontWeight: '600', color: '#64748b' }}>Nilai Latihan</th>
                                    <th style={{ padding: '0.6rem', textAlign: 'center', fontWeight: '600', color: '#64748b' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classSummaries.map((c, i) => (
                                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '0.75rem 0.6rem' }}>
                                            <div style={{ fontWeight: '500' }}>{c.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.subject || 'Umum'}</div>
                                        </td>
                                        <td style={{ padding: '0.75rem 0.6rem', textAlign: 'center' }}>
                                            {c.activeStudents}/{c.studentCount}
                                        </td>
                                        <td style={{ padding: '0.75rem 0.6rem', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{
                                                    flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        height: '100%', borderRadius: '3px',
                                                        background: c.averageProgress >= 60 ? '#10b981' : c.averageProgress >= 30 ? '#f59e0b' : '#ef4444',
                                                        width: `${c.averageProgress}%`
                                                    }} />
                                                </div>
                                                <span style={{ fontSize: '0.8rem', minWidth: '36px' }}>{c.averageProgress}%</span>
                                            </div>
                                        </td>
                                        <td style={{
                                            padding: '0.75rem 0.6rem', textAlign: 'center', fontWeight: '600',
                                            color: c.avgExerciseScore >= 60 ? '#10b981' : c.avgExerciseScore >= 40 ? '#d97706' : '#dc2626'
                                        }}>
                                            {c.avgExerciseScore || '-'}
                                        </td>
                                        <td style={{ padding: '0.75rem 0.6rem', textAlign: 'center' }}>
                                            <button
                                                onClick={() => navigate(`/teacher/classes/${c.id}?tab=statistics`)}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                                    padding: '0.35rem 0.75rem', borderRadius: '0.5rem',
                                                    border: 'none', cursor: 'pointer', fontSize: '0.8rem',
                                                    background: 'var(--primary)', color: 'white'
                                                }}
                                            >
                                                <ExternalLink size={14} /> Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// Sub-components

const StatCard: React.FC<{
    icon: React.ReactNode; label: string; value: string;
    change: string; isPositive: boolean; color: string;
}> = ({ icon, label, value, change, isPositive, color }) => (
    <div className="card glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                {icon}
            </div>
            <span style={{
                fontSize: '0.75rem', fontWeight: '500',
                color: isPositive ? '#10b981' : '#ef4444',
                background: isPositive ? '#dcfce7' : '#fee2e2',
                padding: '0.2rem 0.5rem', borderRadius: '1rem'
            }}>
                {change}
            </span>
        </div>
        <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b' }}>{value}</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{label}</p>
        </div>
    </div>
);
