import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
    Legend, RadialBarChart, RadialBar
} from 'recharts';
import {
    TrendingUp, Users, CheckCircle, Clock, FileSpreadsheet,
    BookOpen, Trophy, Zap, Download, RefreshCw,
    ArrowUp, ArrowDown, Target, Activity, Brain,
    PenTool, MessageSquare, BarChart3, Medal
} from 'lucide-react';
import type {
    ClassAnalytics, StudentProgressEntry, MaterialActivityEntry,
    DailyActivityEntry, QuizPerformanceEntry, ExercisePerformanceEntry
} from '../../types/api.types';
import { analyticsAPI, classesAPI } from '../../utils/api';
import { useNotifications } from '../../contexts/NotificationContext';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16', '#f97316', '#14b8a6'];

const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}j ${m}m`;
    if (m > 0) return `${m}m ${s}d`;
    return `${s}d`;
};

const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

const formatDateFull = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

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

interface Props {
    classId: string;
    className: string;
}

export const TeacherClassStatisticsTab: React.FC<Props> = ({ classId, className }) => {
    const notifications = useNotifications();
    const [data, setData] = useState<ClassAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [timePreset, setTimePreset] = useState<TimePreset>('30d');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [exporting, setExporting] = useState(false);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'completionPercent', direction: 'desc' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const { startDate, endDate } = getDateRange(timePreset, customStart, customEnd);
            const [stats, lb] = await Promise.all([
                analyticsAPI.getClassStatistics(classId, startDate, endDate),
                classesAPI.getLeaderboard(classId)
            ]);
            setData(stats);
            setLeaderboard(lb);
        } catch (error) {
            console.error('Failed to fetch statistics', error);
            notifications.error('Gagal memuat data statistik');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [classId, timePreset]);

    const handleExportCsv = async () => {
        try {
            setExporting(true);
            const { startDate, endDate } = getDateRange(timePreset, customStart, customEnd);
            await analyticsAPI.downloadCsv(classId, startDate, endDate);
        } catch (error) {
            notifications.error('Gagal meng-export CSV');
        } finally {
            setExporting(false);
        }
    };

    const handleExportPdf = async () => {
        try {
            setExporting(true);
            const jsPDF = (await import('jspdf')).default;
            const autoTable = (await import('jspdf-autotable')).default;
            const doc = new jsPDF('l', 'mm', 'a4');

            doc.setFontSize(18);
            doc.text(`Laporan Statistik: ${className}`, 14, 20);
            doc.setFontSize(11);
            doc.setTextColor(100);
            const { startDate, endDate } = getDateRange(timePreset, customStart, customEnd);
            doc.text(`Periode: ${formatDateFull(startDate)} - ${formatDateFull(endDate)}`, 14, 28);

            if (data) {
                doc.setFontSize(10);
                doc.setTextColor(0);
                doc.text(`Completion Rate: ${data.overview.completionRate}% | Rata-rata Nilai: ${data.overview.avgScore} | Siswa Aktif: ${data.overview.activeStudents}/${data.classInfo.studentCount}`, 14, 36);

                if (data.studentProgress.length > 0) {
                    autoTable(doc, {
                        startY: 42,
                        head: [['Nama', 'Progress', 'Nilai', 'Waktu', 'Quiz Lulus', 'Status']],
                        body: data.studentProgress.map(s => [
                            s.name,
                            `${s.completionPercent}% (${s.completedMaterials}/${s.totalMaterials})`,
                            s.avgScore,
                            formatDuration(s.totalTimeSpent),
                            `${s.quizPassed}/${s.quizTotal}`,
                            s.isActive ? 'Aktif' : 'Nonaktif'
                        ]),
                        styles: { fontSize: 9 },
                        headStyles: { fillColor: [99, 102, 241] }
                    });
                }
            }

            doc.save(`laporan_${className.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            notifications.error('Gagal meng-export PDF');
        } finally {
            setExporting(false);
        }
    };

    const sortedStudents = useMemo(() => {
        if (!data) return [];
        return [...data.studentProgress].sort((a, b) => {
            const aVal = (a as any)[sortConfig.key] || 0;
            const bVal = (b as any)[sortConfig.key] || 0;
            return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        });
    }, [data, sortConfig]);

    const handleSort = (key: string) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <div style={{ textAlign: 'center' }}>
                    <BarChart3 size={40} className="animate-pulse" color="var(--primary)" style={{ display: 'inline-block', marginBottom: '1rem' }} />
                    <p style={{ color: '#64748b' }}>Memuat data statistik...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                <BarChart3 size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>Tidak dapat memuat data statistik.</p>
                <button onClick={fetchData} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    Coba Lagi
                </button>
            </div>
        );
    }

    const { overview, studentProgress, materialActivity, dailyActivity, quizPerformance, exercisePerformance, behaviorOverview } = data;

    const progressChartData = studentProgress.slice(0, 10).map(s => ({
        name: s.name.length > 12 ? s.name.substring(0, 11) + '...' : s.name,
        'Progress (%)': s.completionPercent,
        'Nilai Rata-rata': s.avgScore,
        fullName: s.name
    }));

    const dailyChartData = dailyActivity.map(d => ({
        date: formatDate(d.date),
        Akses: d.accessCount,
        Kuis: d.quizAttempts,
        Latihan: d.exerciseAttempts,
        Diskusi: d.discussions
    }));

    const materialChartData = materialActivity.slice(0, 8).map(m => ({
        name: m.title.length > 18 ? m.title.substring(0, 17) + '...' : m.title,
        akses: m.accessCount,
        durasi: Math.round(m.avgTimeSpent / 60),
        fullName: m.title
    }));

    const quizChartData = quizPerformance.map(q => ({
        name: q.title.length > 15 ? q.title.substring(0, 14) + '...' : q.title,
        value: q.passRate,
        score: q.avgScore,
        fullName: q.title
    }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Time Filter Bar */}
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
                                if (preset !== 'custom') {
                                    setCustomStart('');
                                    setCustomEnd('');
                                } else {
                                    const now = new Date();
                                    const ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                                    setCustomStart(ago.toISOString().split('T')[0]);
                                    setCustomEnd(now.toISOString().split('T')[0]);
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
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="date"
                                value={customStart}
                                onChange={e => setCustomStart(e.target.value)}
                                style={{ padding: '0.35rem 0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}
                            />
                            <span style={{ alignSelf: 'center', color: '#94a3b8' }}>-</span>
                            <input
                                type="date"
                                value={customEnd}
                                onChange={e => setCustomEnd(e.target.value)}
                                style={{ padding: '0.35rem 0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}
                            />
                            <button
                                onClick={fetchData}
                                className="btn btn-primary"
                                style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                                <RefreshCw size={14} /> Terapkan
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={fetchData}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.5rem 0.85rem', borderRadius: '0.5rem',
                            border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.8rem',
                            background: 'white', color: '#64748b'
                        }}
                    >
                        <RefreshCw size={14} /> Refresh
                    </button>
                    <button
                        onClick={handleExportCsv}
                        disabled={exporting}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.5rem 0.85rem', borderRadius: '0.5rem',
                            border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.8rem',
                            background: 'white', color: '#10b981', opacity: exporting ? 0.6 : 1
                        }}
                    >
                        <FileSpreadsheet size={14} /> CSV
                    </button>
                    <button
                        onClick={handleExportPdf}
                        disabled={exporting}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.5rem 0.85rem', borderRadius: '0.5rem',
                            border: 'none', cursor: 'pointer', fontSize: '0.8rem',
                            background: 'var(--primary)', color: 'white', opacity: exporting ? 0.6 : 1
                        }}
                    >
                        <Download size={14} /> PDF
                    </button>
                </div>
            </div>

            {/* Overview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <StatCard icon={<CheckCircle size={22} color="white" />} label="Tingkat Penyelesaian" value={`${overview.completionRate}%`} color="#10b981" />
                <StatCard icon={<Target size={22} color="white" />} label="Rata-rata Nilai" value={overview.avgScore.toString()} color="#6366f1" />
                <StatCard icon={<Users size={22} color="white" />} label="Siswa Aktif" value={`${overview.activeStudents}/${data.classInfo.studentCount}`} color="#06b6d4" />
                <StatCard icon={<Clock size={22} color="white" />} label="Rata-rata Waktu" value={formatDuration(overview.avgTimeSpent)} color="#f59e0b" />
                <StatCard icon={<Activity size={22} color="white" />} label="Total Akses" value={overview.totalAccessCount.toString()} color="#ec4899" />
            </div>

            {/* Behavior Overview */}
            {behaviorOverview && (
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem',
                    padding: '1.25rem', background: 'linear-gradient(135deg, #eff6ff, #f0f9ff)',
                    borderRadius: '1rem', border: '1px solid #bfdbfe'
                }}>
                    <BehaviorItem icon={<Zap size={16} color="#6366f1" />} label="Total Kuis" value={behaviorOverview.totalQuizAttempts} />
                    <BehaviorItem icon={<PenTool size={16} color="#8b5cf6" />} label="Total Latihan" value={behaviorOverview.totalExerciseAttempts} />
                    <BehaviorItem icon={<MessageSquare size={16} color="#06b6d4" />} label="Total Diskusi" value={behaviorOverview.totalDiscussions} />
                    <BehaviorItem icon={<ArrowUp size={16} color="#10b981" />} label="Hari Teraktif" value={behaviorOverview.peakActivityDay ? formatDateFull(behaviorOverview.peakActivityDay) : '-'} />
                    {behaviorOverview.mostActiveStudent && (
                        <BehaviorItem icon={<Trophy size={16} color="#f59e0b" />} label="Siswa Teraktif" value={`${behaviorOverview.mostActiveStudent.name} (${behaviorOverview.mostActiveStudent.completedMaterials} materi)`} />
                    )}
                </div>
            )}

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.5rem' }}>
                {/* Student Progress Chart */}
                <div className="card glass" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={18} color="var(--primary)" /> Progress Siswa
                    </h3>
                    <div style={{ height: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={progressChartData} layout="vertical" margin={{ left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                                <Tooltip formatter={((value: any, name: any) => [`${value}%`, name]) as any} labelFormatter={((label: any) => progressChartData.find(d => d.name === label)?.fullName || label) as any} />
                                <Bar dataKey="Progress (%)" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Daily Activity Chart */}
                <div className="card glass" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={18} color="#06b6d4" /> Aktivitas Harian
                    </h3>
                    <div style={{ height: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyChartData}>
                                <defs>
                                    <linearGradient id="colorAccess" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="Akses" stroke="#6366f1" fill="url(#colorAccess)" strokeWidth={2} />
                                <Area type="monotone" dataKey="Kuis" stroke="#f59e0b" fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
                                <Area type="monotone" dataKey="Latihan" stroke="#10b981" fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Material Access Frequency */}
                <div className="card glass" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BookOpen size={18} color="#8b5cf6" /> Frekuensi Akses Materi
                    </h3>
                    <div style={{ height: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={materialChartData} layout="vertical" margin={{ left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis type="number" tick={{ fontSize: 11 }} />
                                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10 }} />
                                <Tooltip formatter={((value: any) => [`${value} akses`, 'Frekuensi']) as any} labelFormatter={((label: any) => materialChartData.find(d => d.name === label)?.fullName || label) as any} />
                                <Bar dataKey="akses" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={18} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quiz Performance */}
                <div className="card glass" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Brain size={18} color="#f59e0b" /> Performa Kuis ({quizPerformance.length})
                    </h3>
                    {quizPerformance.length > 0 ? (
                        <div style={{ height: '280px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={quizChartData} margin={{ left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                                    <Tooltip formatter={((value: any, name: any) => [`${value}%`, name]) as any} labelFormatter={((label: any) => quizChartData.find(d => d.name === label)?.fullName || label) as any} />
                                    <Bar dataKey="value" name="Tingkat Kelulusan" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={30} />
                                    <Bar dataKey="score" name="Rata-rata Nilai" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '280px', color: '#94a3b8' }}>
                            <p>Belum ada data kuis pada periode ini.</p>
                        </div>
                    )}
                </div>

                {/* Material Access Duration */}
                <div className="card glass" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={18} color="#ec4899" /> Durasi Akses Materi (menit)
                    </h3>
                    <div style={{ height: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={materialChartData} layout="vertical" margin={{ left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis type="number" tick={{ fontSize: 11 }} />
                                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10 }} />
                                <Tooltip formatter={((value: any) => [`${value} menit`, 'Durasi Rata-rata']) as any} labelFormatter={((label: any) => materialChartData.find(d => d.name === label)?.fullName || label) as any} />
                                <Bar dataKey="durasi" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={18} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Exercise Performance */}
                <div className="card glass" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PenTool size={18} color="#14b8a6" /> Performa Latihan ({exercisePerformance.length})
                    </h3>
                    {exercisePerformance.length > 0 ? (
                        <div style={{ maxHeight: '280px', overflow: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                        <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: '600', color: '#64748b' }}>Latihan</th>
                                        <th style={{ padding: '0.5rem', textAlign: 'center', fontWeight: '600', color: '#64748b' }}>Siswa</th>
                                        <th style={{ padding: '0.5rem', textAlign: 'center', fontWeight: '600', color: '#64748b' }}>Nilai</th>
                                        <th style={{ padding: '0.5rem', textAlign: 'center', fontWeight: '600', color: '#64748b' }}>Lulus</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exercisePerformance.map((ex, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '0.6rem 0.5rem' }}>
                                                <div style={{ fontWeight: '500' }}>{ex.title}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                    <span style={{
                                                        padding: '0.1rem 0.35rem', borderRadius: '0.25rem',
                                                        fontSize: '0.65rem',
                                                        background: ex.difficulty === 'hard' ? '#fef2f2' : ex.difficulty === 'medium' ? '#fef3c7' : '#dcfce7',
                                                        color: ex.difficulty === 'hard' ? '#dc2626' : ex.difficulty === 'medium' ? '#d97706' : '#16a34a'
                                                    }}>
                                                        {ex.difficulty === 'hard' ? 'Sulit' : ex.difficulty === 'medium' ? 'Menengah' : 'Mudah'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>{ex.uniqueStudents}</td>
                                            <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center', fontWeight: '600', color: ex.avgScore >= 70 ? '#10b981' : ex.avgScore >= 50 ? '#f59e0b' : '#ef4444' }}>
                                                {ex.avgScore}
                                            </td>
                                            <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>{ex.passRate}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '280px', color: '#94a3b8' }}>
                            <p>Belum ada data latihan pada periode ini.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Student Progress Table */}
            <div className="card glass" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={18} color="var(--primary)" /> Progress Siswa ({studentProgress.length})
                </h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <SortableHeader label="Siswa" sortKey="name" current={sortConfig} onSort={handleSort} align="left" />
                                <SortableHeader label="Progress" sortKey="completionPercent" current={sortConfig} onSort={handleSort} />
                                <SortableHeader label="Nilai Rata-rata" sortKey="avgScore" current={sortConfig} onSort={handleSort} />
                                <SortableHeader label="Waktu" sortKey="totalTimeSpent" current={sortConfig} onSort={handleSort} />
                                <SortableHeader label="Quiz Lulus" sortKey="quizPassPercent" current={sortConfig} onSort={handleSort} />
                                <SortableHeader label="Status" sortKey="isActive" current={sortConfig} onSort={handleSort} />
                            </tr>
                        </thead>
                        <tbody>
                            {sortedStudents.map((student, i) => (
                                <tr key={student.studentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: '50%',
                                                background: `linear-gradient(135deg, ${CHART_COLORS[i % CHART_COLORS.length]}, ${CHART_COLORS[(i + 1) % CHART_COLORS.length]})`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white', fontWeight: 'bold', fontSize: '0.8rem'
                                            }}>
                                                {student.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: '500' }}>{student.name}</p>
                                                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Lv.{student.level} | {student.xp} XP</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{
                                                flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    height: '100%', borderRadius: '3px',
                                                    background: student.completionPercent >= 80 ? '#10b981' : student.completionPercent >= 50 ? '#f59e0b' : '#ef4444',
                                                    width: `${student.completionPercent}%`
                                                }} />
                                            </div>
                                            <span style={{ fontSize: '0.8rem', minWidth: '36px' }}>{student.completionPercent}%</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontWeight: '500' }}>
                                        <span style={{ color: student.avgScore >= 70 ? '#10b981' : student.avgScore >= 50 ? '#d97706' : '#dc2626' }}>
                                            {student.avgScore}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: '#64748b' }}>
                                        {formatDuration(student.totalTimeSpent)}
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                                        <span style={{ color: student.quizPassPercent >= 70 ? '#10b981' : student.quizPassPercent > 0 ? '#d97706' : '#ef4444' }}>
                                            {student.quizPassed}/{student.quizTotal} ({student.quizPassPercent}%)
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem',
                                            background: student.isActive ? '#dcfce7' : '#f1f5f9',
                                            color: student.isActive ? '#16a34a' : '#94a3b8'
                                        }}>
                                            {student.isActive ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
                <div className="card glass" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Trophy size={18} color="#f59e0b" /> Leaderboard Kelas
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '0.5rem', fontWeight: '600', color: '#64748b', width: '50px' }}>#</th>
                                    <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: '600', color: '#64748b' }}>Siswa</th>
                                    <th style={{ padding: '0.5rem', textAlign: 'center', fontWeight: '600', color: '#64748b' }}>Class XP</th>
                                    <th style={{ padding: '0.5rem', textAlign: 'center', fontWeight: '600', color: '#64748b' }}>Materi XP</th>
                                    <th style={{ padding: '0.5rem', textAlign: 'center', fontWeight: '600', color: '#64748b' }}>Latihan XP</th>
                                    <th style={{ padding: '0.5rem', textAlign: 'center', fontWeight: '600', color: '#64748b' }}>Diskusi</th>
                                    <th style={{ padding: '0.5rem', textAlign: 'center', fontWeight: '600', color: '#64748b' }}>Selesai</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.slice(0, 10).map((entry: any, i: number) => (
                                    <tr key={entry.studentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>
                                            {entry.rank === 1 ? <Medal size={20} color="#eab308" style={{ display: 'inline-block' }} /> :
                                             entry.rank === 2 ? <Medal size={20} color="#94a3b8" style={{ display: 'inline-block' }} /> :
                                             entry.rank === 3 ? <Medal size={20} color="#d97706" style={{ display: 'inline-block' }} /> : (
                                                 <span style={{ fontWeight: '600', color: '#64748b' }}>{entry.rank}</span>
                                             )}
                                        </td>
                                        <td style={{ padding: '0.6rem 0.5rem' }}>
                                            <div style={{ fontWeight: '500' }}>{entry.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Lv.{entry.level}</div>
                                        </td>
                                        <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center', fontWeight: '600', color: 'var(--primary)' }}>{entry.classXp}</td>
                                        <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>{entry.materialXp}</td>
                                        <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>{entry.exerciseXp}</td>
                                        <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>{entry.discussionCount}</td>
                                        <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>
                                            <span style={{ color: entry.completionRate >= 80 ? '#10b981' : entry.completionRate >= 50 ? '#d97706' : '#64748b' }}>
                                                {entry.completionRate}%
                                            </span>
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

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => (
    <div className="card glass" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: `linear-gradient(135deg, ${color}, ${color}dd)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
        }}>
            {icon}
        </div>
        <div>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{label}</p>
            <p style={{ fontSize: '1.4rem', fontWeight: '700', color: '#1e293b' }}>{value}</p>
        </div>
    </div>
);

const BehaviorItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid #e2e8f0', flexShrink: 0
        }}>
            {icon}
        </div>
        <div>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{label}</p>
            <p style={{ fontSize: '0.95rem', fontWeight: '600', color: '#1e293b' }}>{value}</p>
        </div>
    </div>
);

const SortableHeader: React.FC<{
    label: string; sortKey: string;
    current: { key: string; direction: string };
    onSort: (key: string) => void;
    align?: 'left' | 'center';
}> = ({ label, sortKey, current, onSort, align = 'center' }) => (
    <th
        onClick={() => onSort(sortKey)}
        style={{
            padding: '0.5rem', textAlign: align, fontWeight: '600', color: '#64748b',
            cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap'
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: align === 'center' ? 'center' : 'flex-start', gap: '0.25rem' }}>
            {label}
            {current.key === sortKey && (
                current.direction === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />
            )}
        </div>
    </th>
);
