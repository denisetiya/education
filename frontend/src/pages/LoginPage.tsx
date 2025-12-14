import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getRoleBasedRedirect } from '../components/ProtectedRoute';
import { Login3D } from '../components/Login3D';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    // Responsive state
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const loggedInUser = await login(email, password);
            // Redirect based on user role
            const redirectPath = getRoleBasedRedirect(loggedInUser?.role || 'STUDENT');
            navigate(redirectPath);
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: isMobile ? 'center' : 'flex-start',
            alignItems: isMobile ? 'center' : 'stretch',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', 
            position: 'relative',
            overflow: 'hidden'
        }}>
            
            {/* 3D Scene Background Layer (Full Screen) */}
             <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none' 
            }}>
                <Login3D isMobile={isMobile} />
            </div>

            {/* Left Side - Branding Content (Hidden on Mobile) */}
            <div style={{
                display: isMobile ? 'none' : 'flex',
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '3rem',
                color: 'white',
                zIndex: 1,
                position: 'relative',
                textAlign: 'center',
            }} className="animate-slide-up">
                
                {!isMobile && (
                <div style={{ 
                    background: 'rgba(255,255,255,0.1)', 
                    backdropFilter: 'blur(10px)', 
                    padding: '2rem', 
                    borderRadius: '2rem', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    maxWidth: '500px'
                }}>
                    <h1 style={{ 
                        fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
                        fontWeight: '800', 
                        marginBottom: '1rem', 
                        background: 'linear-gradient(135deg, #a5b4fc 0%, #e0e7ff 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Geo Education
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '2rem' }}>
                        Jelajahi dunia pengetahuan dengan platform pembelajaran interaktif.
                    </p>

                    <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
                        <div className="glass-panel" style={{ padding: '1rem', borderRadius: '1rem', minWidth: '100px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>1k+</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Siswa</div>
                        </div>
                        <div className="glass-panel" style={{ padding: '1rem', borderRadius: '1rem', minWidth: '100px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>50+</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Modul</div>
                        </div>
                    </div>
                </div>
                )}
            </div>

            {/* Right Side - Login Form */}
            <div style={{
                width: isMobile ? '100%' : '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: isMobile ? '1rem' : '3rem',
                zIndex: 10,
                background: 'transparent',
                marginTop: 0
            }}>
                <div className="glass animate-slide-up" style={{
                    width: '100%',
                    maxWidth: '450px',
                    padding: isMobile ? '2rem' : '3rem',
                    borderRadius: '2rem',
                    background: 'rgba(255,255,255,0.95)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ width: '50px', height: '50px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <LogIn color="white" size={24} />
                        </div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>Selamat Datang!</h2>
                        <p style={{ color: '#64748b' }}>Masuk untuk melanjutkan pembelajaran</p>
                    </div>

                    {error && (
                        <div style={{
                            background: '#fee2e2',
                            color: '#991b1b',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            marginBottom: '1.5rem',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                             ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Email Input */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.9rem' }}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} color="#9ca3af" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nama@email.com"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '1rem 1rem 1rem 3rem',
                                        borderRadius: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        fontSize: '1rem',
                                        transition: 'all 0.2s',
                                        outline: 'none',
                                        background: '#f8fafc'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#6366f1';
                                        e.target.style.background = 'white';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e5e7eb';
                                        e.target.style.background = '#f8fafc';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.9rem' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} color="#9ca3af" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '1rem 3rem 1rem 3rem',
                                        borderRadius: '0.75rem',
                                        border: '2px solid #e5e7eb',
                                        fontSize: '1rem',
                                        transition: 'all 0.2s',
                                        outline: 'none',
                                        background: '#f8fafc'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#6366f1';
                                        e.target.style.background = 'white';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e5e7eb';
                                        e.target.style.background = '#f8fafc';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: 0,
                                        color: '#9ca3af'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember & Forgot */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#6366f1' }} />
                                <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>Ingat saya</span>
                            </label>
                            <Link to="/forgot-password" style={{ fontSize: '0.9rem', color: '#6366f1', fontWeight: '600' }}>Lupa password?</Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.75rem',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s',
                                opacity: loading ? 0.7 : 1,
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(99, 102, 241, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                            }}
                        >
                            {loading ? (
                                <>
                                    <Loader size={20} className="animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    Masuk
                                </>
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                            Belum punya akun?{' '}
                            <Link to="/register" style={{ color: '#4f46e5', fontWeight: '600' }}>Daftar sekarang</Link>
                        </p>
                    </div>

                    {/* Demo Credentials */}
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                        <p style={{ fontSize: '0.8rem', color: '#334155', fontWeight: '700', marginBottom: '0.5rem' }}>🧪 Demo Login:</p>
                        <div style={{ display: 'grid', gap: '0.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#475569' }}>
                                <span>Student:</span>
                                <span style={{ fontFamily: 'monospace' }}>budi@siswa.edu / siswa123</span>
                            </div>
                             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#475569' }}>
                                <span>Teacher:</span>
                                <span style={{ fontFamily: 'monospace' }}>guru@geo.edu / teacher123</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
