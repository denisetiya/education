import React from 'react';
import { TrendingUp, Users, CheckCircle, AlertCircle } from 'lucide-react';

export const TeacherAnalytics: React.FC = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="animate-slide-up">
                <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: '800' }}>Analitik Pembelajaran</h1>
                <p style={{ color: '#64748b' }}>Wawasan mendalam tentang performa siswa dan efektivitas materi.</p>
            </div>

            {/* Overview Cards */}
            <div className="animate-slide-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', animationDelay: '0.1s' }}>
                <AnalyticsCard
                    title="Rata-rata Nilai"
                    value="85.4"
                    change="+2.5%"
                    isPositive={true}
                    icon={<TrendingUp size={24} color="var(--primary)" />}
                    chartColor="var(--primary)"
                />
                <AnalyticsCard
                    title="Tingkat Partisipasi"
                    value="92%"
                    change="-1.2%"
                    isPositive={false}
                    icon={<Users size={24} color="var(--secondary)" />}
                    chartColor="var(--secondary)"
                />
                <AnalyticsCard
                    title="Tugas Selesai"
                    value="1,240"
                    change="+15%"
                    isPositive={true}
                    icon={<CheckCircle size={24} color="var(--success)" />}
                    chartColor="var(--success)"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Main Performance Chart (Mock using CSS bars) */}
                <div className="card glass animate-slide-up" style={{ padding: '2rem', animationDelay: '0.2s', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Performa Kelas Minggu Ini</h3>
                        <select style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'transparent' }}>
                            <option>Semua Kelas</option>
                            <option>Matematika VII-A</option>
                            <option>Fisika VIII-C</option>
                        </select>
                    </div>

                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                        {[65, 70, 45, 80, 55, 90, 75].map((h, i) => (
                            <div key={i} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                <div className="bar-animate" style={{
                                    width: '100%',
                                    height: `${h * 3}px`,
                                    background: `linear-gradient(to top, ${i % 2 === 0 ? 'var(--primary)' : 'var(--secondary)'}, transparent)`,
                                    borderRadius: '8px 8px 0 0',
                                    opacity: 0.8,
                                    position: 'relative',
                                    transition: 'height 1s ease-out'
                                }}>
                                    <div style={{ position: 'absolute', top: '-25px', width: '100%', textAlign: 'center', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b' }}>{h}%</div>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'][i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Engagement / At Risk */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="card glass animate-slide-up" style={{ padding: '1.5rem', animationDelay: '0.3s' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Siswa Perlu Perhatian</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { name: 'Andi Saputra', issue: 'Nilai Kuis Rendah', score: 45 },
                                { name: 'Budi Santoso', issue: 'Jarang Login', score: 20 },
                                { name: 'Citra Kirana', issue: 'Tugas Terlambat', score: 60 },
                            ].map((student, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '0.75rem', background: '#fef2f2', border: '1px solid #fee2e2' }}>
                                    <AlertCircle size={20} color="#ef4444" />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1f2937' }}>{student.name}</p>
                                        <p style={{ fontSize: '0.8rem', color: '#ef4444' }}>{student.issue}</p>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#ef4444' }}>{student.score}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card glass animate-slide-up" style={{ padding: '1.5rem', flex: 1, animationDelay: '0.4s', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Tips AI</h3>
                        <p style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.6 }}>"Berdasarkan data, siswa lebih aktif mengerjakan kuis di pagi hari. Pertimbangkan untuk menjadwalkan kuis pada jam 08:00 - 10:00."</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AnalyticsCard = ({ title, value, change, isPositive, icon, chartColor }: any) => (
    <div className="card glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: `${chartColor}15` }}>
                {icon}
            </div>
            <span style={{
                fontSize: '0.8rem', fontWeight: 'bold',
                color: isPositive ? 'var(--success)' : '#ef4444',
                background: isPositive ? '#dcfce7' : '#fee2e2',
                padding: '0.2rem 0.5rem', borderRadius: '1rem'
            }}>
                {change}
            </span>
        </div>
        <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b' }}>{value}</h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{title}</p>
        </div>
    </div>
);
