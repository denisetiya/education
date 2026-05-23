import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    AlertTriangle,
    Eye,
    EyeOff,
    Loader,
    Lock,
    Mail,
    UserPlus,
    User,
    ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getRoleBasedRedirect } from '../components/ProtectedRoute';
import { Login3D } from '../components/Login3D';

export const RegisterPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [step, setStep] = useState<'form' | 'success'>('form');
    const { register } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Password dan konfirmasi password tidak cocok.');
            return;
        }

        if (password.length < 8) {
            setError('Password minimal 8 karakter.');
            return;
        }

        setLoading(true);

        try {
            const newUser = await register(email, password, name);
            setStep('success');
            setTimeout(() => {
                navigate(getRoleBasedRedirect(newUser.role || 'STUDENT'));
            }, 2000);
        } catch (caughtError: any) {
            setError(caughtError.message || 'Pendaftaran gagal. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const passwordStrength = (() => {
        if (password.length === 0) return { label: '', color: '', width: '0%' };
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        const levels = [
            { label: 'Sangat Lemah', color: '#dc2626', width: '25%' },
            { label: 'Lemah', color: '#f59e0b', width: '50%' },
            { label: 'Cukup', color: '#eab308', width: '75%' },
            { label: 'Kuat', color: '#10b981', width: '100%' }
        ];
        return levels[Math.min(strength, 3)];
    })();

    const inputStyle = (event: React.FocusEvent<HTMLInputElement>, focus: boolean) => {
        const el = event.target;
        if (focus) {
            el.style.borderColor = '#6366f1';
            el.style.background = 'white';
            el.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.12)';
        } else {
            el.style.borderColor = '#e2e8f0';
            el.style.background = '#f8fafc';
            el.style.boxShadow = 'none';
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
                background: 'radial-gradient(circle at top left, rgba(16, 185, 129, 0.22), transparent 32%), linear-gradient(135deg, #0f2b1d 0%, #1a4d2e 52%, #0d1f14 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
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
                            background: 'rgba(13, 31, 20, 0.28)',
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
                                background: 'rgba(16, 185, 129, 0.18)',
                                border: '1px solid rgba(52, 211, 153, 0.22)',
                                color: '#d1fae5',
                                fontSize: '0.85rem',
                                fontWeight: 700
                            }}
                        >
                            Mulai perjalanan belajar
                        </div>

                        <h1
                            style={{
                                fontSize: 'clamp(2.3rem, 5vw, 4rem)',
                                fontWeight: 800,
                                lineHeight: 1.05,
                                marginBottom: '1rem',
                                background: 'linear-gradient(135deg, #a7f3d0 0%, #ecfdf5 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            Gabung Geo Education
                        </h1>

                        <p
                            style={{
                                fontSize: '1.05rem',
                                color: '#d1fae5',
                                lineHeight: 1.75,
                                marginBottom: '2rem',
                                maxWidth: '46ch'
                            }}
                        >
                            Daftar akun siswa dan langsung akses kelas, materi interaktif, kuis,
                            leaderboard, dan forum diskusi dalam satu platform.
                        </p>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                                gap: '1rem'
                            }}
                        >
                            {[
                                ['Belajar Fleksibel', 'Akses materi kapan saja, dari mana saja.'],
                                ['Evaluasi Lengkap', 'Kuis, latihan, dan review dari guru.'],
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
                                    <div style={{ fontSize: '0.8rem', lineHeight: 1.5, color: '#a7f3d0' }}>
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
                    {step === 'success' ? (
                        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                            <div
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1.5rem',
                                    boxShadow: '0 14px 32px rgba(16, 185, 129, 0.28)'
                                }}
                            >
                                <UserPlus size={36} color="white" />
                            </div>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                                Akun Berhasil Dibuat!
                            </h2>
                            <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                                Selamat datang, {name}! Kamu akan diarahkan ke dashboard dalam beberapa detik.
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <Loader className="animate-spin" size={24} color="#10b981" />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <div
                                    style={{
                                        width: '56px',
                                        height: '56px',
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        borderRadius: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1rem',
                                        boxShadow: '0 14px 32px rgba(16, 185, 129, 0.28)'
                                    }}
                                >
                                    <UserPlus color="white" size={26} />
                                </div>
                                <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                                    Daftar Akun Siswa
                                </h2>
                                <p style={{ color: '#64748b', lineHeight: 1.6 }}>
                                    Buat akun untuk mulai belajar dan bergabung dengan kelas.
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
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#334155', fontSize: '0.9rem' }}>
                                        Nama Lengkap
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Nama lengkap kamu"
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '1rem 1rem 1rem 3rem',
                                                borderRadius: '0.9rem',
                                                border: '2px solid #e2e8f0',
                                                fontSize: '1rem',
                                                outline: 'none',
                                                background: '#f8fafc'
                                            }}
                                            onFocus={(e) => inputStyle(e, true)}
                                            onBlur={(e) => inputStyle(e, false)}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#334155', fontSize: '0.9rem' }}>
                                        Email
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="nama@email.com"
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '1rem 1rem 1rem 3rem',
                                                borderRadius: '0.9rem',
                                                border: '2px solid #e2e8f0',
                                                fontSize: '1rem',
                                                outline: 'none',
                                                background: '#f8fafc'
                                            }}
                                            onFocus={(e) => inputStyle(e, true)}
                                            onBlur={(e) => inputStyle(e, false)}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#334155', fontSize: '0.9rem' }}>
                                        Password
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Minimal 8 karakter"
                                            required
                                            minLength={8}
                                            style={{
                                                width: '100%',
                                                padding: '1rem 3rem 1rem 3rem',
                                                borderRadius: '0.9rem',
                                                border: '2px solid #e2e8f0',
                                                fontSize: '1rem',
                                                outline: 'none',
                                                background: '#f8fafc'
                                            }}
                                            onFocus={(e) => inputStyle(e, true)}
                                            onBlur={(e) => inputStyle(e, false)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((c) => !c)}
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
                                    {password.length > 0 && (
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <div style={{ height: '4px', borderRadius: '999px', background: '#e2e8f0', overflow: 'hidden' }}>
                                                <div
                                                    style={{
                                                        height: '100%',
                                                        width: passwordStrength.width,
                                                        background: passwordStrength.color,
                                                        borderRadius: '999px',
                                                        transition: 'all 0.3s'
                                                    }}
                                                />
                                            </div>
                                            <p style={{ fontSize: '0.8rem', color: passwordStrength.color, fontWeight: 600, marginTop: '0.3rem' }}>
                                                {passwordStrength.label}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginBottom: '1.75rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#334155', fontSize: '0.9rem' }}>
                                        Konfirmasi Password
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Ulangi password"
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '1rem 1rem 1rem 3rem',
                                                borderRadius: '0.9rem',
                                                border: confirmPassword && password !== confirmPassword ? '2px solid #ef4444' : '2px solid #e2e8f0',
                                                fontSize: '1rem',
                                                outline: 'none',
                                                background: '#f8fafc'
                                            }}
                                            onFocus={(e) => inputStyle(e, true)}
                                            onBlur={(e) => inputStyle(e, false)}
                                        />
                                    </div>
                                    {confirmPassword && password !== confirmPassword && (
                                        <p style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 500, marginTop: '0.3rem' }}>
                                            Password tidak cocok
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
                                        boxShadow: '0 14px 30px rgba(16, 185, 129, 0.28)'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!loading) {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 18px 36px rgba(16, 185, 129, 0.34)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 14px 30px rgba(16, 185, 129, 0.28)';
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <Loader size={20} className="animate-spin" />
                                            Mendaftarkan...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={20} />
                                            Daftar
                                        </>
                                    )}
                                </button>
                            </form>

                            <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                                <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
                                    Sudah punya akun?{' '}
                                    <Link to="/login" style={{ color: '#059669', fontWeight: 700 }}>
                                        Masuk sekarang
                                    </Link>
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
