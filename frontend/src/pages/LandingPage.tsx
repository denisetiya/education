import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Shield, ArrowRight, Sparkles, Zap, Award, Layers, CheckCircle } from 'lucide-react';
import { Login3D } from '../components/Login3D';

export const LandingPage: React.FC = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    
    // Parallax Refs
    const heroRef = useRef<HTMLDivElement>(null);
    const dashboardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // SEO Optimization
        document.title = "Geo Education | Platform Pembelajaran Interaktif 3D & Gamifikasi";
        
        // ... (Meta tag logic remains same)
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', 'Platform pendidikan 3D interaktif nomor 1 di Indonesia dengan sistem gamifikasi, visualisasi 3D, dan analitik cerdas untuk Siswa dan Guru.');

        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);

        // Parallax Scroll Handler
        const handleScroll = () => {
            const scrollY = window.scrollY;
            
            if (heroRef.current) {
                // Hero Text moves slower (0.4x)
                heroRef.current.style.transform = `translateY(${scrollY * 0.4}px)`;
                heroRef.current.style.opacity = `${1 - scrollY / 700}`;
            }
            if (dashboardRef.current) {
                // Dashboard moves slightly slower (0.2x) for depth difference
                dashboardRef.current.style.transform = `translateY(${scrollY * 0.2}px)`;
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div style={{
            minHeight: '200vh', // Ensure scrollable
            background: '#020617', // Very dark base
            display: 'flex',
            flexDirection: 'column',
            overflowX: 'hidden',
            color: '#f8fafc',
            position: 'relative'
        }}>
            
            {/* FIXED 3D BACKGROUND (Global Parallax Layer) */}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 0 }}>
                <Login3D isMobile={isMobile} />
                {/* Gradient Overlay for blending */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '300px',
                    background: 'linear-gradient(to bottom, transparent, #020617)'
                }}></div>
            </div>

            {/* Navbar */}
            <nav style={{
                position: 'fixed',
                width: '100%',
                top: 0,
                zIndex: 100,
                background: 'rgba(2, 6, 23, 0.7)', // Darker glass
                backdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div className="container" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: isMobile ? '0.75rem' : '1rem',
                    paddingBottom: isMobile ? '0.75rem' : '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: isMobile ? '32px' : '40px', height: isMobile ? '32px' : '40px',
                            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                            borderRadius: isMobile ? '8px' : '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: isMobile ? '1.2rem' : '1.5rem',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                        }}>🎓</div>
                        <span style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: '800', letterSpacing: '-0.5px', color: 'white' }}>Geo Education</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/login" className="btn btn-primary animate-pulse" style={{ padding: isMobile ? '0.5rem 1.25rem' : '0.6rem 2rem', borderRadius: '2rem', fontSize: isMobile ? '0.9rem' : '0.95rem' }}>Login</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header style={{
                position: 'relative',
                zIndex: 1, // Above 3D bg
                padding: isMobile ? '7rem 1.5rem 4rem 1.5rem' : '10rem 2rem 6rem 2rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                overflow: 'hidden'
            }}>
                <div className="container" style={{ maxWidth: '1000px' }}>
                    
                    {/* Parallax Group: Text */}
                    <div ref={heroRef} style={{ willChange: 'transform, opacity' }}>
                        <div className="animate-slide-up" style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', padding: '0.5rem 1.25rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Sparkles size={18} color="#fbbf24" className="animate-spin-slow" />
                            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#e2e8f0' }}>Platform Edukasi Terinteraktif #1 di Indonesia</span>
                        </div>

                        <h1 className="animate-slide-up" style={{ 
                            fontSize: isMobile ? '2.5rem' : 'clamp(3.5rem, 6vw, 5.5rem)', 
                            fontWeight: '900', 
                            marginBottom: '1.5rem', 
                            lineHeight: 1.1, 
                            letterSpacing: '-2px',
                            color: 'white',
                            textShadow: '0 4px 30px rgba(0,0,0,0.8)' // Stronger shadow for Readability
                        }}>
                            Jelajahi Dunia Ilmu <br /> 
                            <span style={{ 
                                background: 'linear-gradient(135deg, #a5b4fc 0%, #c4b5fd 100%)', 
                                WebkitBackgroundClip: 'text', 
                                WebkitTextFillColor: 'transparent' 
                            }}>Tanpa Batas 🚀</span>
                        </h1>

                        <p className="animate-slide-up" style={{ fontSize: isMobile ? '1rem' : '1.35rem', color: '#cbd5e1', marginBottom: '2.5rem', maxWidth: '750px', margin: isMobile ? '0 auto 2.5rem auto' : '0 auto 3.5rem auto', lineHeight: 1.6, animationDelay: '0.2s', padding: isMobile ? '0 1rem' : 0 }}>
                            Transformasi cara belajar tradisional menjadi petualangan seru dengan teknologi <span style={{ color: '#818cf8', fontWeight: 'bold' }}>Gamifikasi</span> dan <span style={{ color: '#f472b6', fontWeight: 'bold' }}>Interaktif 3D</span>.
                        </p>

                        <div className="animate-slide-up" style={{ display: 'flex', gap: isMobile ? '1rem' : '1.5rem', justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.3s', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center' }}>
                            <Link to="/student" className="btn btn-primary" style={{ padding: isMobile ? '0.9rem 2rem' : '1.2rem 3rem', fontSize: isMobile ? '0.95rem' : '1.1rem', borderRadius: '3rem', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)', width: isMobile ? '100%' : 'auto', maxWidth: isMobile ? '280px' : 'none' }}>
                                Mulai Petualangan <ArrowRight size={isMobile ? 16 : 20} />
                            </Link>
                            <a href="#features" className="btn" style={{ padding: isMobile ? '0.9rem 2rem' : '1.2rem 3rem', fontSize: isMobile ? '0.95rem' : '1.1rem', borderRadius: '3rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', width: isMobile ? '100%' : 'auto', maxWidth: isMobile ? '280px' : 'none' }}>
                                Pelajari Fitur
                            </a>
                        </div>
                    </div>

                    {/* Parallax Group: Dashboard Preview */}
                    <div ref={dashboardRef} className="animate-float-slow" style={{
                        marginTop: isMobile ? '2.5rem' : '5rem',
                        willChange: 'transform',
                        background: 'rgba(30, 41, 59, 0.4)', // Dark Glass
                        backdropFilter: 'blur(20px)',
                        padding: isMobile ? '0.75rem' : '1rem',
                        borderRadius: isMobile ? '1rem' : '2rem',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{ height: isMobile ? '8px' : '12px', display: 'flex', gap: isMobile ? '6px' : '8px', marginBottom: isMobile ? '0.5rem' : '1rem', paddingLeft: isMobile ? '0.5rem' : '1rem' }}>
                            <div style={{ width: isMobile ? '8px' : '12px', height: isMobile ? '8px' : '12px', borderRadius: '50%', background: '#ef4444' }}></div>
                            <div style={{ width: isMobile ? '8px' : '12px', height: isMobile ? '8px' : '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
                            <div style={{ width: isMobile ? '8px' : '12px', height: isMobile ? '8px' : '12px', borderRadius: '50%', background: '#22c55e' }}></div>
                        </div>
                        <div style={{
                            height: isMobile ? '150px' : '300px', width: '100%',
                            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.5) 100%)',
                            borderRadius: isMobile ? '0.75rem' : '1.5rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: isMobile ? '1rem' : '4rem',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.05)',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            padding: isMobile ? '1rem' : '2rem',
                            textAlign: 'center'
                        }}>
                            <span style={{ fontSize: isMobile ? '2rem' : '4rem' }}>🖥️</span>
                            {!isMobile && <span>Tampilan Dashboard Interaktif</span>}
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Stats Section - TRANSPARENT/GLASS */}
            <div style={{ position: 'relative', zIndex: 2, background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(20px)', padding: isMobile ? '2.5rem 1rem' : '4rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? '1.5rem' : '2rem', textAlign: 'center' }}>
                    <StatItem value="10rb+" label="Siswa Aktif" color="#818cf8" isMobile={isMobile} />
                    <StatItem value="500+" label="Materi" color="#f472b6" isMobile={isMobile} />
                    <StatItem value="98%" label="Kelulusan" color="#34d399" isMobile={isMobile} />
                    <StatItem value="24/7" label="Akses" color="#fbbf24" isMobile={isMobile} />
                </div>
            </div>

            {/* Features Section - SEMI-TRANSPARENT */}
            <section id="features" style={{ position: 'relative', zIndex: 2, padding: isMobile ? '4rem 1.5rem' : '8rem 2rem', background: 'rgba(15, 23, 42, 0.9)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: isMobile ? '3rem' : '5rem' }}>
                        <span style={{ color: '#818cf8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>Keunggulan Kami</span>
                        <h2 style={{ fontSize: isMobile ? '2rem' : '3rem', fontWeight: '800', margin: '1rem 0 1.5rem 0', color: 'white' }}>Mengapa Memilih Geo Education?</h2>
                        <p style={{ color: '#94a3b8', fontSize: isMobile ? '1rem' : '1.1rem', maxWidth: '600px', margin: '0 auto' }}>Platform kami dirancang khusus untuk memaksimalkan potensi setiap siswa dengan metode modern.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: isMobile ? '1.5rem' : '2.5rem' }}>
                        <FeatureCard
                            icon={<Zap size={40} />}
                            title="Pembelajaran Interaktif"
                            desc="Lupakan metode hafal mati. Di sini kamu akan belajar dengan simulasi, rotasi objek 3D, dan puzzle yang menantang logika."
                            color="#818cf8"
                        />
                        <FeatureCard
                            icon={<Award size={40} />}
                            title="Sistem Gamifikasi"
                            desc="Dapatkan Instant Feedback, XP, dan Badges setiap kali menyelesaikan misi. Kompetisi sehat melalui Leaderboard kelas."
                            color="#fbbf24"
                        />
                        <FeatureCard
                            icon={<Layers size={40} />}
                            title="Kurikulum Adaptif"
                            desc="Sistem kami menyesuaikan tingkat kesulitan soal berdasarkan kemampuanmu. Setiap siswa punya 'Peta Belajar' yang unik."
                            color="#34d399"
                        />
                    </div>
                </div>
            </section>

            {/* Get Started / Roles Section */}
            <section style={{ padding: isMobile ? '4rem 1rem' : '8rem 2rem', background: '#1e1b4b', position: 'relative', overflow: 'hidden' }}>
                {/* Decoration */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.1, background: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                <div className="container" style={{ maxWidth: '1100px', position: 'relative', zIndex: 1 }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: isMobile ? '2rem' : '3rem', fontWeight: '800', marginBottom: '1rem', color: 'white' }}>Siap Memulai?</h2>
                        <p style={{ fontSize: isMobile ? '1rem' : '1.2rem', color: '#94a3b8' }}>Pilih pintu masukmu menuju masa depan pendidikan.</p>
                    </div>

                    <div className="animate-slide-up" style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: isMobile ? '1.5rem' : '2.5rem',
                    }}>
                        <RoleCard
                            to="/student"
                            icon={<BookOpen size={40} />}
                            title="Siswa"
                            desc="Akses materi, kerjakan latihan, dan pantau progres belajarmu secara real-time."
                            color="#818cf8"
                            bgColor="rgba(129, 140, 248, 0.1)"
                            features={['Akses Materi Lengkap', 'Latihan Soal Interaktif', 'Pantau Rapor Digital']}
                        />
                        <RoleCard
                            to="/teacher"
                            icon={<Users size={40} />}
                            title="Guru"
                            desc="Dashboard canggih untuk mengelola kelas, membuat soal, dan analisis performa."
                            color="#f472b6"
                            bgColor="rgba(244, 114, 182, 0.1)"
                            features={['Manajemen Kelas Mudah', 'Bank Soal Otomatis', 'Analitik Siswa']}
                        />
                        <RoleCard
                            to="/admin"
                            icon={<Shield size={40} />}
                            title="Administrator"
                            desc="Kontrol penuh atas manajemen pengguna, lisensi, dan konfigurasi sistem."
                            color="#c084fc"
                            bgColor="rgba(192, 132, 252, 0.1)"
                            features={['Manajemen User', 'Laporan Sekolah', 'Konfigurasi Sistem']}
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: '#020617', color: 'white', paddingTop: isMobile ? '3rem' : '5rem', paddingBottom: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: isMobile ? '2rem' : '4rem', marginBottom: isMobile ? '2rem' : '4rem' }}>
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
                            <li><a href="#" style={{ transition: 'color 0.2s', color: '#94a3b8', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>Beranda</a></li>
                            <li><a href="#features" style={{ transition: 'color 0.2s', color: '#94a3b8', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>Fitur</a></li>
                            <li><a href="#" style={{ transition: 'color 0.2s', color: '#94a3b8', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>Tentang Kami</a></li>
                            <li><a href="#" style={{ transition: 'color 0.2s', color: '#94a3b8', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>Kontak</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Kontak</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', color: '#cbd5e1' }}>
                            <li style={{ color: '#94a3b8' }}>support@geoeducation.id</li>
                            <li style={{ color: '#94a3b8' }}>+62 812 3456 7890</li>
                            <li style={{ color: '#94a3b8' }}>Jakarta, Indonesia</li>
                        </ul>
                    </div>
                </div>
                <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem', color: '#64748b', fontSize: '0.9rem' }}>
                    &copy; 2025 Geo Education. Hak Cipta Dilindungi.
                </div>
            </footer>

        </div>
    );
};

const StatItem: React.FC<{ value: string, label: string, color: string, isMobile?: boolean }> = ({ value, label, color, isMobile }) => (
    <div className="animate-slide-up">
        <div style={{ fontSize: isMobile ? '1.75rem' : '3rem', fontWeight: '800', color: color, marginBottom: '0.25rem' }}>{value}</div>
        <div style={{ fontSize: isMobile ? '0.8rem' : '1rem', fontWeight: '600', color: '#94a3b8' }}>{label}</div>
    </div>
);

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, desc: string, color: string }> = ({ icon, title, desc, color }) => (
    <div className="card card-hover-effect" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '1rem', backdropFilter: 'blur(10px)' }}>
        <div style={{
            width: '60px', height: '60px', borderRadius: '1rem',
            background: `${color}15`, color: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1.25rem',
            transform: 'rotate(-5deg)'
        }}>
            {icon}
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem', color: 'white' }}>{title}</h3>
        <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem' }}>{desc}</p>
    </div>
);

const RoleCard: React.FC<{ to: string, icon: React.ReactNode, title: string, desc: string, color: string, bgColor: string, features: string[] }> = ({ to, icon, title, desc, color, bgColor, features }) => (
    <Link to={to} className="card glass card-hover-effect" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        textAlign: 'center',
        padding: '2rem 1.5rem',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(30, 41, 59, 0.4)',
        borderRadius: '1.25rem',
        backdropFilter: 'blur(10px)',
        textDecoration: 'none'
    }}>
        <div className="animate-float" style={{
            padding: '1.5rem',
            background: bgColor,
            borderRadius: '50%',
            color: color,
            boxShadow: `0 20px 40px -10px ${color}20`
        }}>
            {icon}
        </div>
        <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem', color: 'white' }}>{title}</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>{desc}</p>

            <div style={{ textAlign: 'left', background: 'rgba(15, 23, 42, 0.5)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                {features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#e2e8f0', fontWeight: '500' }}>
                        <CheckCircle size={14} color={color} /> {feat}
                    </div>
                ))}
            </div>
        </div>
        <div className="btn" style={{ marginTop: 'auto', background: color, color: 'white', fontWeight: 'bold', width: '100%', borderRadius: '3rem', padding: '0.85rem', fontSize: '0.9rem' }}>
            Masuk Portal {title}
        </div>
    </Link>
);
