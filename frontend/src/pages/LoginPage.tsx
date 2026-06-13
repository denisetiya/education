import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, Eye, EyeOff, FlaskConical, Loader, Lock, LogIn, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getRoleBasedRedirect } from '../components/ProtectedRoute';

const demoAccounts = [
    { label: 'Student', credential: 'alya@siswa.edu / Siswa12345' },
    { label: 'Teacher', credential: 'guru@geo.edu / Guru12345' }
];

interface LocationState {
    from?: { pathname?: string };
    notice?: string;
}

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [mounted, setMounted] = useState(false);
    const { login, lastUnauthorized, clearUnauthorized } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const locationState = (location.state as LocationState | null) || null;
    const noticeFromState = locationState?.notice;
    const glowRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const h = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', h);
        setTimeout(() => setMounted(true), 50);
        return () => window.removeEventListener('resize', h);
    }, []);

    useEffect(() => {
        if (noticeFromState) {
            setError(noticeFromState);
            navigate(location.pathname, { replace: true, state: null });
        }
    }, [noticeFromState, location.pathname, navigate]);

    useEffect(() => {
        if (!lastUnauthorized) {
            return;
        }
        setError(
            lastUnauthorized.reason === 'expired'
                ? 'Sesi Anda telah berakhir. Silakan masuk kembali.'
                : 'Akses tidak diizinkan. Silakan masuk dengan akun yang sesuai.'
        );
        clearUnauthorized();
    }, [lastUnauthorized, clearUnauthorized]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (glowRef.current) {
            glowRef.current.style.setProperty('--mouse-x', e.clientX + 'px');
            glowRef.current.style.setProperty('--mouse-y', e.clientY + 'px');
            glowRef.current.classList.add('active');
        }
    };
    const handleMouseLeave = () => { glowRef.current?.classList.remove('active'); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const u = await login(email, password);
            navigate(getRoleBasedRedirect(u?.role || 'STUDENT'));
        } catch (err: any) {
            setError(err.message || 'Login gagal. Periksa email dan password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #fafafa 0%, #f0f0ff 50%, #f5f3ff 100%)',
            position: 'relative',
            padding: isMobile ? '1.5rem' : '2rem'
        }}>
            {/* Cursor glow */}
            <div ref={glowRef} className="bg-glow" />

            {/* Animated background shapes */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <div className="bg-grid" />
                <div className="bg-squares"><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/></div>
                <div style={{
                    position: 'absolute', top: '10%', right: '15%',
                    width: 120, height: 120, borderRadius: 30, border: '2px solid rgba(99,102,241,0.1)',
                    animation: 'float1 8s ease-in-out infinite'
                }} />
                <div style={{
                    position: 'absolute', bottom: '20%', left: '10%',
                    width: 80, height: 80, borderRadius: '50%', background: 'rgba(139,92,246,0.05)',
                    animation: 'float2 10s ease-in-out infinite'
                }} />
                <div style={{
                    position: 'absolute', top: '50%', left: '8%',
                    width: 50, height: 50, borderRadius: 12, border: '2px solid rgba(6,182,212,0.08)',
                    animation: 'float3 7s ease-in-out infinite', transform: 'rotate(45deg)'
                }} />
                <div style={{
                    position: 'absolute', top: '20%', left: '20%',
                    width: 30, height: 30, borderRadius: '50%', background: 'rgba(99,102,241,0.04)',
                    animation: 'float2 12s ease-in-out infinite'
                }} />
                <div style={{
                    position: 'absolute', bottom: '30%', right: '8%',
                    width: 60, height: 60, borderRadius: 16, border: '2px solid rgba(244,114,182,0.08)',
                    animation: 'float1 9s ease-in-out infinite'
                }} />
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes float1 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(3deg)} }
                @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-15px)} }
                @keyframes float3 { 0%,100%{transform:translateY(0) rotate(45deg)} 50%{transform:translateY(-12px) rotate(48deg)} }
            `}</style>

            {/* Form Card */}
            <div style={{
                position: 'relative', zIndex: 10, width: '100%', maxWidth: 420,
                background: 'white', border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: 20, padding: isMobile ? '2rem 1.5rem' : '2.5rem',
                boxShadow: '0 20px 60px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03)',
                opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)'
            }}>
                <div style={{ marginBottom: '2rem' }}>
                    <img src="/logo-with-teks-Photoroom.png" alt="Geo Education" style={{ height: 60, width: 'auto' }} />
                </div>

                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.35rem' }}>Selamat datang</h1>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>Masuk ke akun untuk melanjutkan.</p>

                {error && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1rem', borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
                        <AlertTriangle size={16} /><span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.4rem' }}>Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@email.com" required
                                style={{ width: '100%', padding: '0.7rem 0.875rem 0.7rem 2.5rem', borderRadius: 12, border: '1.5px solid var(--gray-200)', background: 'var(--gray-50)', color: 'var(--gray-900)', fontSize: '0.9375rem', outline: 'none', transition: 'all 150ms' }}
                                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)'; }}
                                onBlur={e => { e.target.style.borderColor = 'var(--gray-200)'; e.target.style.background = 'var(--gray-50)'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.4rem' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Masukkan password" required
                                style={{ width: '100%', padding: '0.7rem 2.5rem 0.7rem 2.5rem', borderRadius: 12, border: '1.5px solid var(--gray-200)', background: 'var(--gray-50)', color: 'var(--gray-900)', fontSize: '0.9375rem', outline: 'none', transition: 'all 150ms' }}
                                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)'; }}
                                onBlur={e => { e.target.style.borderColor = 'var(--gray-200)'; e.target.style.background = 'var(--gray-50)'; e.target.style.boxShadow = 'none'; }}
                            />
                            <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', padding: 0, background: 'none', border: 'none', cursor: 'pointer' }}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                        <Link to="/forgot-password" style={{ fontSize: '0.8125rem', color: '#6366f1', fontWeight: 500 }}>Lupa password?</Link>
                    </div>

                    <button type="submit" disabled={loading} style={{
                        width: '100%', padding: '0.75rem', background: '#6366f1', color: 'white', borderRadius: 12,
                        fontSize: '0.9375rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'transform 150ms, box-shadow 150ms', boxShadow: '0 4px 16px rgba(99,102,241,0.2)'
                    }}
                        onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.25)'; } }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.2)'; }}
                    >
                        {loading ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Memproses...</> : <><LogIn size={18} /> Masuk</>}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                    Belum punya akun? <Link to="/register" style={{ color: '#6366f1', fontWeight: 600 }}>Daftar</Link>
                </p>

                <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: 'var(--gray-50)', borderRadius: 12, border: '1px solid var(--gray-100)' }}>
                    <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <FlaskConical size={10} /> Demo
                    </p>
                    {demoAccounts.map(a => (
                        <div key={a.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--gray-500)', padding: '0.15rem 0' }}>
                            <span>{a.label}</span>
                            <code style={{ fontFamily: 'monospace', fontSize: '0.625rem' }}>{a.credential}</code>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
