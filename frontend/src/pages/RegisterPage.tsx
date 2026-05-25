import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Check, Eye, EyeOff, GraduationCap, Loader, Lock, Mail, User, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getRoleBasedRedirect } from '../components/ProtectedRoute';

export const RegisterPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [mounted, setMounted] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const h = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', h);
        setTimeout(() => setMounted(true), 50);
        return () => window.removeEventListener('resize', h);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (password !== confirmPassword) { setError('Password tidak cocok.'); return; }
        if (password.length < 8) { setError('Password minimal 8 karakter.'); return; }
        setLoading(true);
        try {
            const u = await register(email, password, name);
            setStep('success');
            setTimeout(() => navigate(getRoleBasedRedirect(u.role || 'STUDENT')), 2000);
        } catch (err: any) {
            setError(err.message || 'Pendaftaran gagal.');
        } finally {
            setLoading(false);
        }
    };

    const strength = (() => {
        if (!password) return { w: '0%', c: '', l: '' };
        let s = 0;
        if (password.length >= 8) s++;
        if (/[A-Z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^A-Za-z0-9]/.test(password)) s++;
        return [
            { w: '25%', c: '#ef4444', l: 'Lemah' },
            { w: '50%', c: '#f59e0b', l: 'Cukup' },
            { w: '75%', c: '#eab308', l: 'Baik' },
            { w: '100%', c: '#22c55e', l: 'Kuat' },
        ][Math.min(s, 3)];
    })();

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.7rem 0.875rem 0.7rem 2.5rem',
        borderRadius: 12, border: '1.5px solid var(--gray-200)',
        background: 'var(--gray-50)', color: 'var(--gray-900)',
        fontSize: '0.9375rem', outline: 'none', transition: 'all 150ms'
    };
    const onFocus = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = '#10b981'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.08)'; };
    const onBlur = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = 'var(--gray-200)'; e.target.style.background = 'var(--gray-50)'; e.target.style.boxShadow = 'none'; };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #fafafa 0%, #ecfdf5 50%, #f0fdf4 100%)',
            position: 'relative', overflow: 'hidden',
            padding: isMobile ? '1.5rem' : '2rem'
        }}>
            {/* Animated background shapes */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '12%', left: '12%', width: 100, height: 100, borderRadius: 24, border: '2px solid rgba(16,185,129,0.1)', animation: 'float1 9s ease-in-out infinite' }} />
                <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 70, height: 70, borderRadius: '50%', background: 'rgba(6,182,212,0.05)', animation: 'float2 11s ease-in-out infinite' }} />
                <div style={{ position: 'absolute', top: '45%', right: '15%', width: 45, height: 45, borderRadius: 10, border: '2px solid rgba(16,185,129,0.08)', animation: 'float3 8s ease-in-out infinite', transform: 'rotate(45deg)' }} />
                <div style={{ position: 'absolute', bottom: '35%', left: '8%', width: 55, height: 55, borderRadius: 14, border: '2px solid rgba(99,102,241,0.06)', animation: 'float1 10s ease-in-out infinite' }} />
            </div>

            <style>{`
                @keyframes float1 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(3deg)} }
                @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-15px)} }
                @keyframes float3 { 0%,100%{transform:translateY(0) rotate(45deg)} 50%{transform:translateY(-12px) rotate(48deg)} }
            `}</style>

            <div style={{
                position: 'relative', zIndex: 10, width: '100%', maxWidth: 420,
                background: 'white', border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: 20, padding: isMobile ? '2rem 1.5rem' : '2.5rem',
                boxShadow: '0 20px 60px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03)',
                maxHeight: '92vh', overflowY: 'auto',
                opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)'
            }}>
                {step === 'success' ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                            <Check size={32} color="white" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>Akun Berhasil Dibuat!</h2>
                        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Selamat datang, {name}. Mengalihkan...</p>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.75rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <GraduationCap size={20} color="white" />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--gray-900)' }}>Geo Education</span>
                        </div>

                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.35rem' }}>Buat akun baru</h1>
                        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Daftar untuk mulai belajar.</p>

                        {error && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1rem', borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
                                <AlertTriangle size={16} /><span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '0.875rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.35rem' }}>Nama Lengkap</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nama kamu" required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '0.875rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.35rem' }}>Email</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@email.com" required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '0.875rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.35rem' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 karakter" required minLength={8}
                                        style={{ ...inputStyle, paddingRight: '2.5rem' }} onFocus={onFocus} onBlur={onBlur} />
                                    <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', padding: 0, background: 'none', border: 'none', cursor: 'pointer' }}>
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {password && (
                                    <div style={{ marginTop: '0.4rem' }}>
                                        <div style={{ height: 3, borderRadius: 2, background: 'var(--gray-200)', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: strength.w, background: strength.c, transition: 'width 200ms' }} />
                                        </div>
                                        <p style={{ fontSize: '0.6875rem', color: strength.c, marginTop: '0.2rem' }}>{strength.l}</p>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.35rem' }}>Konfirmasi Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                                    <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Ulangi password" required
                                        style={{ ...inputStyle, borderColor: confirmPassword && password !== confirmPassword ? '#ef4444' : undefined }} onFocus={onFocus} onBlur={onBlur} />
                                </div>
                                {confirmPassword && password !== confirmPassword && (
                                    <p style={{ fontSize: '0.6875rem', color: '#ef4444', marginTop: '0.25rem' }}>Password tidak cocok</p>
                                )}
                            </div>

                            <button type="submit" disabled={loading} style={{
                                width: '100%', padding: '0.75rem', background: '#10b981', color: 'white', borderRadius: 12,
                                fontSize: '0.9375rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'transform 150ms, box-shadow 150ms', boxShadow: '0 4px 16px rgba(16,185,129,0.2)'
                            }}
                                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,0.25)'; } }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(16,185,129,0.2)'; }}
                            >
                                {loading ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Mendaftarkan...</> : <><UserPlus size={18} /> Daftar</>}
                            </button>
                        </form>

                        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                            Sudah punya akun? <Link to="/login" style={{ color: '#10b981', fontWeight: 600 }}>Masuk</Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};
