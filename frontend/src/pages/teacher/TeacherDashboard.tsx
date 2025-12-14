import React from 'react';
import { Users, BookOpen, Clock, TrendingUp, Calendar } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Header Text */}
            <div className="animate-slide-up">
                <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b' }}>Ringkasan Aktivitas</h1>
                <p style={{ color: '#64748b' }}>Pantau perkembangan siswa dan kelas Anda hari ini.</p>
            </div>

            {/* Quick Stats Rows */}
            <div className="animate-slide-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', animationDelay: '0.1s' }}>
                <DashboardCard
                    title="Total Siswa"
                    value="124"
                    icon={<Users size={24} color="white" />}
                    color="var(--primary)"
                    trend="+12% bulan ini"
                />
                <DashboardCard
                    title="Kelas Aktif"
                    value="4"
                    icon={<BookOpen size={24} color="white" />}
                    color="var(--secondary)"
                    trend="2 kelas baru"
                />
                <DashboardCard
                    title="Rata-rata Nilai"
                    value="85.4"
                    icon={<TrendingUp size={24} color="white" />}
                    color="var(--success)"
                    trend="+4.2 poin"
                />
                <DashboardCard
                    title="Total Jam Mengajar"
                    value="32h"
                    icon={<Clock size={24} color="white" />}
                    color="var(--warning)"
                    trend="Minggu ini"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                {/* Recent Activity Table */}
                <div className="card glass animate-slide-up" style={{ padding: '0', overflow: 'hidden', animationDelay: '0.2s', border: '1px solid #e2e8f0' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Aktivitas Kelas Terbaru</h3>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Lihat Semua</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                            <tr>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left' }}>Nama Kelas</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Topik</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Kehadiran</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { class: 'Matematika VII-A', topic: 'Aljabar Dasar', att: '98%', status: 'Sedang Berlangsung' },
                                { class: 'Fisika VIII-C', topic: 'Hukum Newton', att: '85%', status: 'Selesai' },
                                { class: 'Biologi X-B', topic: 'Sel Hewan', att: '92%', status: 'Dijadwalkan' },
                            ].map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: '#334155' }}>{row.class}</td>
                                    <td style={{ padding: '1.25rem', color: '#64748b' }}>{row.topic}</td>
                                    <td style={{ padding: '1.25rem', textAlign: 'center', fontWeight: '600' }}>{row.att}</td>
                                    <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                                        <span style={{
                                            background: row.status === 'Sedang Berlangsung' ? '#dbeafe' : row.status === 'Selesai' ? '#dcfce7' : '#f1f5f9',
                                            color: row.status === 'Sedang Berlangsung' ? '#1e40af' : row.status === 'Selesai' ? '#166534' : '#64748b',
                                            padding: '0.3rem 0.8rem',
                                            borderRadius: '2rem',
                                            fontSize: '0.8rem',
                                            fontWeight: '600'
                                        }}>{row.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Upcoming Schedule */}
                <div className="card glass animate-slide-up" style={{ padding: '1.5rem', animationDelay: '0.3s', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'fit-content' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Jadwal Hari Ini</h3>
                        <Calendar size={18} color="#94a3b8" />
                    </div>

                    {[
                        { time: '08:00 - 09:30', title: 'Matematika VII-A', type: 'Online Meeting', color: 'var(--primary)' },
                        { time: '10:00 - 11:30', title: 'Fisika XI-B', type: 'Kuis Review', color: 'var(--secondary)' },
                        { time: '13:00 - 14:30', title: 'Biologi X-A', type: 'Materi Video', color: 'var(--success)' },
                    ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, marginTop: '5px' }}></div>
                                {i !== 2 && <div style={{ width: '2px', height: '40px', background: '#f1f5f9' }}></div>}
                            </div>
                            <div>
                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>{item.time}</p>
                                <h4 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.2rem' }}>{item.title}</h4>
                                <span style={{ fontSize: '0.8rem', background: '#f8fafc', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0', color: '#64748b' }}>{item.type}</span>
                            </div>
                        </div>
                    ))}

                    <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }}>Lihat Kalender</button>
                </div>

            </div>
        </div>
    );
};

const DashboardCard: React.FC<{ title: string, value: string, icon: React.ReactNode, trend: string, color: string }> = ({ title, value, icon, trend, color }) => (
    <div className="card glass" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', borderLeft: `4px solid ${color}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
                <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>{title}</p>
                <h3 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '0.5rem', color: '#1e293b' }}>{value}</h3>
            </div>
            <div style={{
                width: '48px', height: '48px',
                background: color,
                borderRadius: '1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 12px ${color}44`
            }}>
                {icon}
            </div>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '600', background: '#ecfdf5', width: 'fit-content', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>
            <TrendingUp size={14} /> {trend}
        </div>
    </div>
);
