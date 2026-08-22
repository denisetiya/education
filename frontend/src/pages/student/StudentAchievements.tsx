import React from 'react';
import { Award, Trophy, Medal, BookOpen } from 'lucide-react';

const mockAchievements = [
    { id: 1, title: 'Pembelajar Rajin', desc: 'Login 7 hari berturut-turut', icon: <Trophy color="#eab308" size={32} />, unlocked: true },
    { id: 2, title: 'Jago Aljabar', desc: 'Selesaikan Bab Aljabar 100%', icon: <Medal color="#94a3b8" size={32} />, unlocked: true },
    { id: 3, title: 'Kutu Buku', desc: 'Baca 20 materi perpustakaan', icon: <BookOpen color="#3b82f6" size={32} />, unlocked: false },
    { id: 4, title: 'Quiz Master', desc: 'Dapatkan nilai 100 di 5 kuis', icon: <Award color="#f97316" size={32} />, unlocked: false },
];

export const StudentAchievements: React.FC = () => {
    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h1 className="text-gradient" style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: '800', marginBottom: '0.5rem' }}>Pencapaian Saya</h1>
                <p style={{ color: 'var(--text-muted)' }}>Koleksi lencana dan prestasimu selama belajar di Geo Education.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
                {mockAchievements.map((ach, index) => (
                    <div key={ach.id} className={`card glass card-hover-effect animate-slide-up`} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        padding: '2rem',
                        opacity: ach.unlocked ? 1 : 0.7,
                        filter: ach.unlocked ? 'none' : 'grayscale(0.8)',
                        background: ach.unlocked ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
                        animationDelay: `${index * 0.1}s`
                    }}>
                        <div className={ach.unlocked ? 'animate-float' : ''} style={{
                            padding: '1.25rem',
                            background: ach.unlocked ? 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' : '#f1f5f9',
                            borderRadius: '50%',
                            boxShadow: ach.unlocked ? '0 10px 20px -5px rgba(0,0,0,0.1)' : 'none',
                            border: ach.unlocked ? '1px solid rgba(255,255,255,0.5)' : 'none'
                        }}>
                            {ach.icon}
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{ach.title}</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{ach.desc}</p>
                            {ach.unlocked ? (
                                <span style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.75rem', color: 'white', background: 'var(--success)', padding: '0.2rem 0.8rem', borderRadius: '1rem', fontWeight: '600' }}>Tercapai!</span>
                            ) : (
                                <span style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', background: '#e2e8f0', padding: '0.2rem 0.8rem', borderRadius: '1rem', fontWeight: '600' }}>Belum Terbuka</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
