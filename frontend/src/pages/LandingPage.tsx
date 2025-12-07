import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Shield, ArrowRight, Sparkles, Zap, Award, Layers, CheckCircle } from 'lucide-react';

export const LandingPage: React.FC = () => {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-gradient)',
            display: 'flex',
            flexDirection: 'column',
            overflowX: 'hidden'
        }}>

            {/* Navbar / Header - Glassmorphism */}
            <nav style={{
                padding: '1rem 2rem',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255,255,255,0.5)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '40px', height: '40px',
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '1.5rem',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                    }}>🎓</div>
                    <span className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Geo Education</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/student" className="btn btn-primary animate-pulse" style={{ padding: '0.6rem 2rem', borderRadius: '2rem' }}>Login</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header style={{
                position: 'relative',
                padding: '6rem 2rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '85vh',
                overflow: 'hidden'
            }}>
                {/* Dynamic Background Blobs */}
                <div className="animate-blob" style={{ position: 'absolute', top: '10%', left: '15%', width: '400px', height: '400px', background: 'var(--primary)', opacity: 0.2, borderRadius: '50%', filter: 'blur(80px)', zIndex: 0 }}></div>
                <div className="animate-blob" style={{ position: 'absolute', bottom: '20%', right: '15%', width: '350px', height: '350px', background: 'var(--secondary)', opacity: 0.2, borderRadius: '50%', filter: 'blur(80px)', zIndex: 0, animationDelay: '2s' }}></div>
                <div className="animate-blob" style={{ position: 'absolute', top: '40%', left: '40%', width: '300px', height: '300px', background: 'var(--accent)', opacity: 0.2, borderRadius: '50%', filter: 'blur(60px)', zIndex: 0, animationDelay: '4s' }}></div>

                <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1000px' }}>

                    <div className="animate-slide-up" style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.5rem 1.25rem', borderRadius: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <Sparkles size={18} color="var(--warning)" className="animate-spin-slow" />
                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>Platform Edukasi Terinteraktif #1 di Indonesia</span>
                    </div>

                    <h1 className="text-gradient-animated animate-slide-up" style={{ fontSize: 'clamp(3.5rem, 6vw, 5.5rem)', fontWeight: '900', marginBottom: '2rem', lineHeight: 1.1, letterSpacing: '-2px' }}>
                        Jelajahi Dunia Ilmu <br /> Tanpa Batas 🌍
                    </h1>

                    <p className="animate-slide-up" style={{ fontSize: '1.35rem', color: 'var(--text-muted)', marginBottom: '4rem', maxWidth: '750px', margin: '0 auto 3.5rem auto', lineHeight: 1.6, animationDelay: '0.2s' }}>
                        Transformasi cara belajar tradisional menjadi petualangan seru dengan teknologi <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Gamifikasi</span> dan <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>Interaktif</span>.
                    </p>

                    <div className="animate-slide-up" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.3s' }}>
                        <Link to="/student" className="btn btn-primary" style={{ padding: '1.2rem 3rem', fontSize: '1.1rem', borderRadius: '3rem', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)' }}>
                            Mulai Petualangan <ArrowRight size={20} />
                        </Link>
                        <a href="#features" className="btn btn-secondary" style={{ padding: '1.2rem 3rem', fontSize: '1.1rem', borderRadius: '3rem', background: 'white', border: 'none', boxShadow: 'var(--shadow-md)' }}>
                            Pelajari Fitur
                        </a>
                    </div>

                    {/* Dashboard Preview / Illustration */}
                    <div className="animate-float-slow" style={{
                        marginTop: '5rem',
                        background: 'rgba(255,255,255,0.6)',
                        backdropFilter: 'blur(20px)',
                        padding: '1rem',
                        borderRadius: '2rem',
                        border: '1px solid rgba(255,255,255,0.8)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
                    }}>
                        <div style={{ height: '12px', display: 'flex', gap: '8px', marginBottom: '1rem', paddingLeft: '1rem' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }}></div>
                        </div>
                        <div style={{
                            height: '300px', width: '100%',
                            background: 'linear-gradient(135deg, #e0e7ff 0%, #f0f4f8 100%)',
                            borderRadius: '1.5rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '4rem'
                        }}>
                            🖥️ Tampilan Dashboard Interaktif
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Stats Section */}
            <div style={{ background: 'var(--surface)', padding: '4rem 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem', textAlign: 'center' }}>
                    <StatItem value="10rb+" label="Siswa Aktif" color="var(--primary)" />
                    <StatItem value="500+" label="Materi Pelajaran" color="var(--secondary)" />
                    <StatItem value="98%" label="Tingkat Kelulusan" color="var(--success)" />
                    <StatItem value="24/7" label="Akses Belajar" color="var(--accent)" />
                </div>
            </div>

            {/* Features Section */}
            <section id="features" style={{ padding: '8rem 2rem', background: '#fff' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem' }}>Keunggulan Kami</span>
                        <h2 style={{ fontSize: '3rem', fontWeight: '800', margin: '1rem 0 1.5rem 0', color: 'var(--text-main)' }}>Mengapa Memilih Geo Education?</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>Platform kami dirancang khusus untuk memaksimalkan potensi setiap siswa dengan metode modern.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
                        <FeatureCard
                            icon={<Zap size={40} />}
                            title="Pembelajaran Interaktif"
                            desc="Lupakan metode hafal mati. Di sini kamu akan belajar dengan simulasi, rotasi objek 3D, dan puzzle yang menantang logika."
                            color="var(--primary)"
                        />
                        <FeatureCard
                            icon={<Award size={40} />}
                            title="Sistem Gamifikasi"
                            desc="Dapatkan Instant Feedback, XP, dan Badges setiap kali menyelesaikan misi. Kompetisi sehat melalui Leaderboard kelas."
                            color="var(--warning)"
                        />
                        <FeatureCard
                            icon={<Layers size={40} />}
                            title="Kurikulum Adaptif"
                            desc="Sistem kami menyesuaikan tingkat kesulitan soal berdasarkan kemampuanmu. Setiap siswa punya 'Peta Belajar' yang unik."
                            color="var(--success)"
                        />
                    </div>
                </div>
            </section>

            {/* Get Started / Roles Section */}
            <section style={{ padding: '8rem 2rem', background: 'var(--bg-gradient)', position: 'relative', overflow: 'hidden' }}>
                {/* Decoration */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.05, background: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                <div className="container" style={{ maxWidth: '1100px', position: 'relative', zIndex: 1 }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>Siap Memulai?</h2>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Pilih pintu masukmu menuju masa depan pendidikan.</p>
                    </div>

                    <div className="animate-slide-up" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2.5rem',
                    }}>
                        <RoleCard
                            to="/student"
                            icon={<BookOpen size={40} />}
                            title="Siswa"
                            desc="Akses materi, kerjakan latihan, dan pantau progres belajarmu secara real-time."
                            color="var(--primary)"
                            bgColor="#eff6ff"
                            features={['Akses Materi Lengkap', 'Latihan Soal Interaktif', 'Pantau Rapor Digital']}
                        />
                        <RoleCard
                            to="/teacher"
                            icon={<Users size={40} />}
                            title="Guru"
                            desc="Dashboard canggih untuk mengelola kelas, membuat soal, dan analisis performa."
                            color="var(--secondary)"
                            bgColor="#fdf2f8"
                            features={['Manajemen Kelas Mudah', 'Bank Soal Otomatis', 'Analitik Siswa']}
                        />
                        <RoleCard
                            to="/admin"
                            icon={<Shield size={40} />}
                            title="Administrator"
                            desc="Kontrol penuh atas manajemen pengguna, lisensi, dan konfigurasi sistem."
                            color="var(--accent)"
                            bgColor="#f5f3ff"
                            features={['Manajemen User', 'Laporan Sekolah', 'Konfigurasi Sistem']}
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: '#0f172a', color: 'white', paddingTop: '5rem', paddingBottom: '2rem' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1rem' }}>🎓</div>
                            <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>Geo Education</span>
                        </div>
                        <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Platform edukasi masa depan yang menghubungkan teknologi dan pedagogi untuk hasil belajar terbaik.</p>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Menu</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', color: '#cbd5e1' }}>
                            <li><a href="#" style={{ transition: 'color 0.2s' }}>Beranda</a></li>
                            <li><a href="#features" style={{ transition: 'color 0.2s' }}>Fitur</a></li>
                            <li><a href="#" style={{ transition: 'color 0.2s' }}>Tentang Kami</a></li>
                            <li><a href="#" style={{ transition: 'color 0.2s' }}>Kontak</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Kontak</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', color: '#cbd5e1' }}>
                            <li>support@geoeducation.id</li>
                            <li>+62 812 3456 7890</li>
                            <li>Jakarta, Indonesia</li>
                        </ul>
                    </div>
                </div>
                <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', color: '#64748b', fontSize: '0.9rem' }}>
                    &copy; 2025 Geo Education. Hak Cipta Dilindungi.
                </div>
            </footer>

        </div>
    );
};

const StatItem: React.FC<{ value: string, label: string, color: string }> = ({ value, label, color }) => (
    <div className="animate-slide-up">
        <div style={{ fontSize: '3rem', fontWeight: '800', color: color, marginBottom: '0.5rem' }}>{value}</div>
        <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-muted)' }}>{label}</div>
    </div>
);

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, desc: string, color: string }> = ({ icon, title, desc, color }) => (
    <div className="card card-hover-effect" style={{ padding: '2.5rem', border: 'none', background: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{
            width: '80px', height: '80px', borderRadius: '1.5rem',
            background: `${color}15`, color: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '2rem',
            transform: 'rotate(-5deg)'
        }}>
            {icon}
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-main)' }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '1.05rem' }}>{desc}</p>
    </div>
);

const RoleCard: React.FC<{ to: string, icon: React.ReactNode, title: string, desc: string, color: string, bgColor: string, features: string[] }> = ({ to, icon, title, desc, color, bgColor, features }) => (
    <Link to={to} className="card glass card-hover-effect" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        textAlign: 'center',
        padding: '3rem 2rem',
        border: '1px solid rgba(255,255,255,0.8)',
        background: 'rgba(255,255,255,0.7)'
    }}>
        <div className="animate-float" style={{
            padding: '2rem',
            background: bgColor,
            borderRadius: '50%',
            color: color,
            boxShadow: `0 20px 40px -10px ${color}40`
        }}>
            {icon}
        </div>
        <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-main)' }}>{title}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>{desc}</p>

            <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.5)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(0,0,0,0.05)' }}>
                {features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '500' }}>
                        <CheckCircle size={16} color={color} /> {feat}
                    </div>
                ))}
            </div>
        </div>
        <div className="btn" style={{ marginTop: 'auto', background: color, color: 'white', fontWeight: 'bold', width: '100%', borderRadius: '3rem', padding: '1rem' }}>
            Masuk Portal {title}
        </div>
    </Link>
);
