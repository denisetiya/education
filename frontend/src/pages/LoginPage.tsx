import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Eye, EyeOff, FlaskConical, GraduationCap, Loader, Lock, LogIn, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getRoleBasedRedirect } from '../components/ProtectedRoute';

const demoAccounts = [
    { label: 'Student', credential: 'alya@siswa.edu / Siswa12345' },
    { label: 'Teacher', credential: 'guru@geo.edu / Guru12345' }
];

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const loggedInUser = await login(email, password);
            navigate(getRoleBasedRedirect(loggedInUser?.role || 'STUDENT'));
        } catch (caughtError: any) {
            setError(caughtError.message || 'Login gagal. Periksa email dan password Anda.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.7rem 0.875rem 0.7rem 2.5rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--gray-200)',
        fontSize: '0.9375rem',
        outline: 'none',
        background: 'white',
        transition: 'border-color 150ms, box-shadow 150ms'
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.style.borderColor = 'var(--primary)';
        e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.08)';
    };
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.style.borderColor = 'var(--gray-200)';
        e.target.style.boxShadow = 'none';
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            background: isMobile ? 'white' : 'var(--gray-50)'
        }}>
            {/* Left Panel - Desktop only */}
            {!isMobile && (
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', alignItems: 'center',
                    padding: '3rem',
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
                    color: 'white', position: 'relative', overflow: 'hidden'
                }}>
                    {/* Subtle decorative circles */}
                    <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)' }} />
                    <div style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(139, 92, 246, 0.08)' }} />

                    <div style={{ position: 'relative', maxWidth: 420, textAlign: 'center' }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: 14,
                            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem'
                        }}>
                            <GraduationCap size={28} color="white" />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem', lineHeight: 1.2 }}>
                            Geo Education
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
                            Platform pembelajaran terpadu untuk guru dan siswa. Kelola kelas, materi, latihan interaktif, dan pantau progres dalam satu tempat.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '2rem' }}>
                            {[['Kelas Terstruktur', 'Modul, materi, dan forum'], ['Latihan Interaktif', 'Multi-tipe dengan review']].map(([title, desc]) => (
                                <div key={title} style={{
                                    padding: '1rem', borderRadius: 'var(--radius-md)',
                                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                    textAlign: 'left'
                                }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.2rem' }}>{title}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Right Panel - Form */}
            <div style={{
                width: isMobile ? '100%' : '480px', minWidth: isMobile ? 'auto' : '480px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: isMobile ? '2rem 1.5rem' : '2rem 3rem',
                background: 'white'
            }}>
                <div style={{ width: '100%', maxWidth: 380 }}>
                    {/* Mobile logo */}
                    {isMobile && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <GraduationCap size={18} color="white" />
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>Geo Education</span>
                        </div>
                    )}

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.35rem' }}>Masuk</h2>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
                        Masukkan email dan password untuk melanjutkan.
                    </p>

                    {error && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                            background: 'var(--error-light)', color: 'var(--error)',
                            fontSize: '0.8125rem', marginBottom: '1.25rem',
                            border: '1px solid #fecaca'
                        }}>
                            <AlertTriangle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.4rem' }}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                                <input
                                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="nama@email.com" required
                                    style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.4rem' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'} value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Masukkan password" required
                                    style={{ ...inputStyle, paddingRight: '2.5rem' }}
                                    onFocus={handleFocus} onBlur={handleBlur}
                                />
                                <button type="button" onClick={() => setShowPassword(v => !v)} style={{
                                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                                    color: 'var(--gray-400)', padding: 0, background: 'none', border: 'none', cursor: 'pointer'
                                }}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--gray-600)' }}>
                                <input type="checkbox" style={{ width: 14, height: 14, accentColor: 'var(--primary)' }} />
                                Ingat saya
                            </label>
                            <Link to="/forgot-password" style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 500 }}>Lupa password?</Link>
                        </div>

                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '0.7rem',
                            background: 'var(--primary)', color: 'white',
                            borderRadius: 'var(--radius-md)', fontSize: '0.9375rem', fontWeight: 600,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background 150ms'
                        }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--primary-hover)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary)'; }}
                        >
                            {loading ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Memproses...</> : <><LogIn size={18} /> Masuk</>}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                        Belum punya akun? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 500 }}>Daftar</Link>
                    </p>

                    {/* Demo accounts */}
                    <div style={{
                        marginTop: '1.5rem', padding: '0.875rem',
                        background: 'var(--gray-50)', borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--gray-100)'
                    }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <FlaskConical size={12} /> Demo
                        </p>
                        {demoAccounts.map(acc => (
                            <div key={acc.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--gray-500)', padding: '0.2rem 0' }}>
                                <span>{acc.label}</span>
                                <code style={{ fontSize: '0.6875rem', color: 'var(--gray-600)' }}>{acc.credential}</code>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
