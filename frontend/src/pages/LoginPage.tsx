import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getRoleBasedRedirect } from '../components/ProtectedRoute';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Decorations */}
            <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
            <div className="animate-blob" style={{ position: 'absolute', top: '30%', left: '10%', width: '200px', height: '200px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%', filter: 'blur(40px)' }}></div>

            {/* Left Side - Branding */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '3rem',
                color: 'white'
            }} className="animate-slide-up">
                <div style={{ marginBottom: '2rem', fontSize: '4rem' }}>🎓</div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', textAlign: 'center' }}>Geo Education</h1>
                <p style={{ fontSize: '1.1rem', opacity: 0.9, textAlign: 'center', maxWidth: '400px', lineHeight: 1.6 }}>
                    Platform pembelajaran interaktif dengan gamifikasi untuk meningkatkan semangat belajar siswa.
                </p>
                <div style={{ marginTop: '3rem', display: 'flex', gap: '2rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>1000+</div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Siswa Aktif</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>50+</div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Materi</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>98%</div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Kepuasan</div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div style={{
                width: '500px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem'
            }}>
                <div className="glass animate-slide-up" style={{
                    width: '100%',
                    padding: '3rem',
                    borderRadius: '2rem',
                    background: 'rgba(255,255,255,0.95)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    animationDelay: '0.2s'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>Selamat Datang! 👋</h2>
                        <p style={{ color: '#64748b' }}>Masuk ke akun Anda untuk melanjutkan</p>
                    </div>

                    {error && (
                        <div style={{
                            background: '#fee2e2',
                            color: '#991b1b',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            marginBottom: '1.5rem',
                            fontSize: '0.9rem'
                        }}>
                            {error}
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
                                        transition: 'border-color 0.2s, box-shadow 0.2s',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#667eea';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e5e7eb';
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
                                        transition: 'border-color 0.2s, box-shadow 0.2s',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#667eea';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e5e7eb';
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
                                        padding: 0
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} color="#9ca3af" /> : <Eye size={18} color="#9ca3af" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember & Forgot */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#667eea' }} />
                                <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>Ingat saya</span>
                            </label>
                            <Link to="/forgot-password" style={{ fontSize: '0.9rem', color: '#667eea', fontWeight: '600' }}>Lupa password?</Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                opacity: loading ? 0.7 : 1
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.3)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
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
                            <Link to="/register" style={{ color: '#667eea', fontWeight: '600' }}>Daftar sekarang</Link>
                        </p>
                    </div>

                    {/* Demo Credentials */}
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0fdf4', borderRadius: '0.75rem', border: '1px solid #bbf7d0' }}>
                        <p style={{ fontSize: '0.8rem', color: '#166534', fontWeight: '600', marginBottom: '0.5rem' }}>🧪 Demo Login:</p>
                        <p style={{ fontSize: '0.8rem', color: '#15803d' }}>Student: budi@siswa.edu / siswa123</p>
                        <p style={{ fontSize: '0.8rem', color: '#15803d' }}>Teacher: guru@geo.edu / teacher123</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
