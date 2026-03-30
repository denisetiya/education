import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    AlertTriangle,
    Eye,
    EyeOff,
    FlaskConical,
    Loader,
    Lock,
    LogIn,
    Mail
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getRoleBasedRedirect } from '../components/ProtectedRoute';
import { Login3D } from '../components/Login3D';

const demoAccounts = [
    {
        label: 'Student',
        credential: 'alya@siswa.edu / Siswa12345'
    },
    {
        label: 'Teacher',
        credential: 'guru@geo.edu / Guru12345'
    }
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
            setError(caughtError.message || 'Login gagal. Periksa lagi email dan password Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: isMobile ? 'center' : 'flex-start',
                alignItems: isMobile ? 'center' : 'stretch',
                background:
                    'radial-gradient(circle at top left, rgba(129, 140, 248, 0.28), transparent 32%), linear-gradient(135deg, #141b3a 0%, #27226f 52%, #1b1f46 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0,
                    pointerEvents: 'none'
                }}
            >
                <Login3D isMobile={isMobile} />
            </div>

            <div
                className="animate-slide-up"
                style={{
                    display: isMobile ? 'none' : 'flex',
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '3rem',
                    color: 'white',
                    zIndex: 1,
                    position: 'relative',
                    textAlign: 'left'
                }}
            >
                {!isMobile && (
                    <div
                        style={{
                            background: 'rgba(19, 29, 65, 0.28)',
                            backdropFilter: 'blur(18px)',
                            padding: '2.5rem',
                            borderRadius: '2rem',
                            border: '1px solid rgba(255,255,255,0.12)',
                            maxWidth: '560px',
                            boxShadow: '0 32px 80px rgba(2, 6, 23, 0.35)'
                        }}
                    >
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '1rem',
                                padding: '0.5rem 0.875rem',
                                borderRadius: '999px',
                                background: 'rgba(99, 102, 241, 0.18)',
                                border: '1px solid rgba(165, 180, 252, 0.22)',
                                color: '#dbe4ff',
                                fontSize: '0.85rem',
                                fontWeight: 700
                            }}
                        >
                            Workspace pembelajaran modern
                        </div>

                        <h1
                            style={{
                                fontSize: 'clamp(2.3rem, 5vw, 4rem)',
                                fontWeight: 800,
                                lineHeight: 1.05,
                                marginBottom: '1rem',
                                background: 'linear-gradient(135deg, #c7d2fe 0%, #eef2ff 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            Geo Education
                        </h1>

                        <p
                            style={{
                                fontSize: '1.05rem',
                                color: '#d6ddff',
                                lineHeight: 1.75,
                                marginBottom: '2rem',
                                maxWidth: '46ch'
                            }}
                        >
                            Satu app untuk guru dan siswa: kelas, materi, latihan interaktif, forum
                            diskusi, leaderboard, dan penilaian yang rapi dalam pengalaman desktop
                            yang konsisten.
                        </p>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                                gap: '1rem'
                            }}
                        >
                            {[
                                ['Kelas', 'Join code, forum, dan progress'],
                                ['Latihan', 'Multi-tipe dengan review guru'],
                            ].map(([title, subtitle]) => (
                                <div
                                    key={title}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '1.1rem',
                                        background: 'rgba(255,255,255,0.08)',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}
                                >
                                    <div style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                                        {title}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', lineHeight: 1.5, color: '#cbd5ff' }}>
                                        {subtitle}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div
                style={{
                    width: isMobile ? '100%' : '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: isMobile ? '1rem' : '3rem',
                    zIndex: 10
                }}
            >
                <div
                    className="glass animate-slide-up"
                    style={{
                        width: '100%',
                        maxWidth: '460px',
                        padding: isMobile ? '2rem' : '3rem',
                        borderRadius: '2rem',
                        background: 'rgba(255,255,255,0.96)',
                        boxShadow: '0 25px 60px rgba(15, 23, 42, 0.32)',
                        border: '1px solid rgba(226, 232, 240, 0.8)'
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div
                            style={{
                                width: '56px',
                                height: '56px',
                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                borderRadius: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1rem',
                                boxShadow: '0 14px 32px rgba(79, 70, 229, 0.28)'
                            }}
                        >
                            <LogIn color="white" size={26} />
                        </div>
                        <h2
                            style={{
                                fontSize: '1.9rem',
                                fontWeight: 800,
                                color: '#0f172a',
                                marginBottom: '0.5rem'
                            }}
                        >
                            Selamat Datang
                        </h2>
                        <p style={{ color: '#64748b', lineHeight: 1.6 }}>
                            Masuk untuk melanjutkan pengelolaan kelas dan pembelajaran interaktif.
                        </p>
                    </div>

                    {error && (
                        <div
                            style={{
                                background: '#fef2f2',
                                color: '#b91c1c',
                                padding: '1rem',
                                borderRadius: '0.9rem',
                                marginBottom: '1.5rem',
                                fontSize: '0.92rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.65rem',
                                border: '1px solid #fecaca'
                            }}
                        >
                            <AlertTriangle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: 700,
                                    color: '#334155',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Email
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail
                                    size={18}
                                    color="#94a3b8"
                                    style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)'
                                    }}
                                />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="nama@email.com"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '1rem 1rem 1rem 3rem',
                                        borderRadius: '0.9rem',
                                        border: '2px solid #e2e8f0',
                                        fontSize: '1rem',
                                        transition: 'all 0.2s',
                                        outline: 'none',
                                        background: '#f8fafc'
                                    }}
                                    onFocus={(event) => {
                                        event.target.style.borderColor = '#6366f1';
                                        event.target.style.background = 'white';
                                        event.target.style.boxShadow =
                                            '0 0 0 3px rgba(99, 102, 241, 0.12)';
                                    }}
                                    onBlur={(event) => {
                                        event.target.style.borderColor = '#e2e8f0';
                                        event.target.style.background = '#f8fafc';
                                        event.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: 700,
                                    color: '#334155',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock
                                    size={18}
                                    color="#94a3b8"
                                    style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)'
                                    }}
                                />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Masukkan password"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '1rem 3rem 1rem 3rem',
                                        borderRadius: '0.9rem',
                                        border: '2px solid #e2e8f0',
                                        fontSize: '1rem',
                                        transition: 'all 0.2s',
                                        outline: 'none',
                                        background: '#f8fafc'
                                    }}
                                    onFocus={(event) => {
                                        event.target.style.borderColor = '#6366f1';
                                        event.target.style.background = 'white';
                                        event.target.style.boxShadow =
                                            '0 0 0 3px rgba(99, 102, 241, 0.12)';
                                    }}
                                    onBlur={(event) => {
                                        event.target.style.borderColor = '#e2e8f0';
                                        event.target.style.background = '#f8fafc';
                                        event.target.style.boxShadow = 'none';
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((current) => !current)}
                                    style={{
                                        position: 'absolute',
                                        right: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: 0,
                                        color: '#94a3b8'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1.75rem'
                            }}
                        >
                            <label
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    cursor: 'pointer'
                                }}
                            >
                                <input
                                    type="checkbox"
                                    style={{ width: '16px', height: '16px', accentColor: '#6366f1' }}
                                />
                                <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                                    Ingat saya
                                </span>
                            </label>
                            <Link
                                to="/forgot-password"
                                style={{ fontSize: '0.9rem', color: '#4f46e5', fontWeight: 700 }}
                            >
                                Lupa password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.9rem',
                                fontSize: '1rem',
                                fontWeight: 700,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s',
                                opacity: loading ? 0.75 : 1,
                                boxShadow: '0 14px 30px rgba(79, 70, 229, 0.28)'
                            }}
                            onMouseEnter={(event) => {
                                if (!loading) {
                                    event.currentTarget.style.transform = 'translateY(-2px)';
                                    event.currentTarget.style.boxShadow =
                                        '0 18px 36px rgba(79, 70, 229, 0.34)';
                                }
                            }}
                            onMouseLeave={(event) => {
                                event.currentTarget.style.transform = 'translateY(0)';
                                event.currentTarget.style.boxShadow =
                                    '0 14px 30px rgba(79, 70, 229, 0.28)';
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

                    <div
                        style={{
                            textAlign: 'center',
                            marginTop: '1.75rem',
                            paddingTop: '1.5rem',
                            borderTop: '1px solid #e2e8f0'
                        }}
                    >
                        <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
                            Belum punya akun?{' '}
                            <Link to="/register" style={{ color: '#4f46e5', fontWeight: 700 }}>
                                Daftar sekarang
                            </Link>
                        </p>
                    </div>

                    <div
                        style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            background: '#f8fafc',
                            borderRadius: '0.95rem',
                            border: '1px solid #e2e8f0'
                        }}
                    >
                        <p
                            style={{
                                fontSize: '0.82rem',
                                color: '#334155',
                                fontWeight: 800,
                                marginBottom: '0.65rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <FlaskConical size={14} />
                            <span>Demo Login</span>
                        </p>
                        <div style={{ display: 'grid', gap: '0.35rem' }}>
                            {demoAccounts.map((account) => (
                                <div
                                    key={account.label}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        gap: '1rem',
                                        fontSize: '0.82rem',
                                        color: '#475569'
                                    }}
                                >
                                    <span>{account.label}:</span>
                                    <span style={{ fontFamily: 'monospace' }}>{account.credential}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
