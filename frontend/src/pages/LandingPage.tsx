import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  NotebookPen,
  Users,
  Sparkles,
} from 'lucide-react';

const features = [
  { icon: <LayoutDashboard size={20} />, title: 'Manajemen kelas terpusat', desc: 'Join code, siswa, materi, latihan, forum, dan leaderboard dalam satu struktur.' },
  { icon: <NotebookPen size={20} />, title: 'Builder latihan fleksibel', desc: 'Pilihan ganda, numerik, jawaban singkat, bangun datar, dan canvas visual.' },
  { icon: <ClipboardCheck size={20} />, title: 'Evaluasi end-to-end', desc: 'Siswa mengerjakan, guru review dan beri feedback tanpa pindah konteks.' },
  { icon: <Award size={20} />, title: 'Engagement terukur', desc: 'Badge, leaderboard, dan forum menjaga interaksi belajar tetap aktif.' },
];

const workflows = {
  teacher: [
    { title: 'Bangun kelas', desc: 'Atur materi, modul, dan latihan dari satu workspace.' },
    { title: 'Rancang aktivitas', desc: 'Latihan sederhana atau visual, sesuai kebutuhan.' },
    { title: 'Review terpusat', desc: 'Submission, penilaian, dan feedback dalam satu alur.' },
  ],
  student: [
    { title: 'Masuk kelas', desc: 'Lihat materi, latihan, dan langkah berikutnya.' },
    { title: 'Kerjakan soal', desc: 'Tiap tipe soal menampilkan interaksi yang sesuai.' },
    { title: 'Lihat progres', desc: 'Feedback guru, badge, dan ranking per kelas.' },
  ],
};

// Hook for scroll-based parallax
const useParallax = () => {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  return scrollY;
};

// Hook for intersection observer reveal
const useReveal = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
};

const Reveal: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
    }}>
      {children}
    </div>
  );
};

export const LandingPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const scrollY = useParallax();
  const glowRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const u = () => setIsMobile(window.innerWidth < 768);
    u();
    window.addEventListener('resize', u);
    return () => window.removeEventListener('resize', u);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (glowRef.current) {
      glowRef.current.style.setProperty('--mouse-x', e.clientX + 'px');
      glowRef.current.style.setProperty('--mouse-y', e.clientY + 'px');
      glowRef.current.classList.add('active');
    }
  };
  const handleMouseLeave = () => { glowRef.current?.classList.remove('active'); };

  return (
    <div onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ minHeight: '100vh', background: 'white', overflowX: 'hidden', position: 'relative' }}>
      {/* Cursor glow */}
      <div ref={glowRef} className="bg-glow" style={{ position: 'fixed' }} />
      {/* ===== HERO with Parallax ===== */}
      <section style={{
        position: 'relative',
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        background: 'linear-gradient(180deg, #fafafa 0%, #f0f0ff 100%)'
      }}>
        {/* Parallax floating shapes */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div className="bg-grid" />
          <div className="bg-squares"><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/></div>
          <div style={{
            position: 'absolute', top: '8%', left: '8%',
            width: 80, height: 80, borderRadius: 20, border: '2px solid rgba(99,102,241,0.15)',
            transform: `translateY(${scrollY * 0.15}px) rotate(${scrollY * 0.02}deg)`,
            transition: 'transform 0.1s linear'
          }} />
          <div style={{
            position: 'absolute', top: '20%', right: '12%',
            width: 60, height: 60, borderRadius: '50%', background: 'rgba(139,92,246,0.08)',
            transform: `translateY(${scrollY * 0.25}px)`,
          }} />
          <div style={{
            position: 'absolute', top: '55%', left: '5%',
            width: 40, height: 40, borderRadius: 10, background: 'rgba(99,102,241,0.06)',
            transform: `translateY(${scrollY * 0.3}px) rotate(45deg)`,
          }} />
          <div style={{
            position: 'absolute', top: '40%', right: '6%',
            width: 100, height: 100, borderRadius: 24, border: '2px solid rgba(6,182,212,0.1)',
            transform: `translateY(${scrollY * 0.2}px) rotate(${-scrollY * 0.015}deg)`,
          }} />
          <div style={{
            position: 'absolute', bottom: '15%', left: '20%',
            width: 50, height: 50, borderRadius: '50%', border: '2px solid rgba(16,185,129,0.12)',
            transform: `translateY(${scrollY * 0.35}px)`,
          }} />
          <div style={{
            position: 'absolute', top: '70%', right: '25%',
            width: 30, height: 30, borderRadius: 8, background: 'rgba(244,114,182,0.08)',
            transform: `translateY(${scrollY * 0.4}px) rotate(${scrollY * 0.03}deg)`,
          }} />
          {/* Large gradient blob */}
          <div style={{
            position: 'absolute', top: '10%', right: '-5%',
            width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)',
            transform: `translateY(${scrollY * 0.1}px)`,
          }} />
        </div>

        {/* Nav */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0,0,0,0.04)',
          padding: '0 1.5rem'
        }}>
          <div style={{
            maxWidth: 1100, margin: '0 auto', height: 60,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/logo-with-teks-Photoroom-v2.webp" alt="Geo Education" style={{ height: 40, width: 'auto' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {!isMobile && (
                <>
                  <a href="#features" style={{ fontSize: '0.875rem', color: 'var(--gray-600)', padding: '0.4rem 0.75rem' }}>Fitur</a>
                  <a href="#workflow" style={{ fontSize: '0.875rem', color: 'var(--gray-600)', padding: '0.4rem 0.75rem' }}>Alur Kerja</a>
                </>
              )}
              <Link to="/login" style={{
                padding: '0.5rem 1.25rem', borderRadius: 10,
                background: '#6366f1', color: 'white', fontSize: '0.875rem', fontWeight: 500
              }}>Masuk</Link>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: isMobile ? '6rem 1.5rem 4rem' : '6rem 1.5rem 4rem',
          textAlign: 'center', position: 'relative', zIndex: 10
        }}>
          <div style={{ maxWidth: 700 }}>
            <Reveal>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.4rem 0.875rem', borderRadius: 999,
                background: 'white', border: '1px solid var(--gray-200)',
                color: '#6366f1', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1.75rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <Sparkles size={13} style={{ color: '#6366f1' }} /> Platform Pembelajaran Modern
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h1 style={{
                fontSize: isMobile ? '2.5rem' : '4rem',
                fontWeight: 800, lineHeight: 1.08,
                color: 'var(--gray-900)', marginBottom: '1.25rem',
                letterSpacing: '-0.03em'
              }}>
                Belajar lebih terarah,{' '}
                <span style={{ color: '#6366f1' }}>mengajar lebih ringan.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <p style={{
                color: 'var(--gray-500)', fontSize: isMobile ? '1rem' : '1.2rem',
                lineHeight: 1.7, maxWidth: 540, margin: '0 auto 2.5rem'
              }}>
                Satu platform untuk guru dan siswa. Kelola kelas, materi interaktif, latihan multi-tipe, dan evaluasi — semua terintegrasi.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/register" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.85rem 2rem', borderRadius: 12,
                  background: '#6366f1', color: 'white', fontSize: '0.9375rem', fontWeight: 600,
                  boxShadow: '0 4px 16px rgba(99,102,241,0.25)',
                  transition: 'transform 150ms, box-shadow 150ms'
                }}>
                  Mulai Gratis <ArrowRight size={16} />
                </Link>
                <Link to="/login" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.85rem 2rem', borderRadius: 12,
                  background: 'white', border: '1.5px solid var(--gray-200)',
                  color: 'var(--gray-700)', fontSize: '0.9375rem', fontWeight: 500,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                  Masuk
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.4}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginTop: '4rem', flexWrap: 'wrap' }}>
                {[['Multi-tipe', 'Soal'], ['Real-time', 'Feedback'], ['Gamifikasi', 'Belajar']].map(([t, b]) => (
                  <div key={t} style={{ textAlign: 'center' }}>
                    <p style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: '1rem' }}>{t}</p>
                    <p style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>{b}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" style={{ padding: isMobile ? '4rem 1.5rem' : '7rem 1.5rem', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <h2 style={{ fontSize: isMobile ? '1.5rem' : '2.5rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                Fitur yang mendukung fokus
              </h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '1.0625rem', maxWidth: 500, margin: '0 auto' }}>
                Guru mengelola dengan mudah, siswa belajar dengan tenang.
              </p>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1.25rem' }}>
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.1}>
                <TiltCard>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: '#eef2ff', color: '#6366f1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1.25rem'
                  }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.4rem' }}>{f.title}</h3>
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.9375rem', lineHeight: 1.65 }}>{f.desc}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WORKFLOW ===== */}
      <section id="workflow" style={{ padding: isMobile ? '4rem 1.5rem' : '7rem 1.5rem', background: '#fafafa', borderTop: '1px solid var(--gray-100)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <h2 style={{ fontSize: isMobile ? '1.5rem' : '2.5rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                Alur kerja yang jelas
              </h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '1.0625rem', maxWidth: 500, margin: '0 auto' }}>
                Guru punya kendali penuh, siswa mendapat navigasi yang bersih.
              </p>
            </div>
          </Reveal>

          {/* Visual Timeline */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 80px 1fr', gap: isMobile ? '2rem' : '0', alignItems: 'start' }}>
            {/* Guru Column */}
            <div>
              <Reveal>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--gray-900)' }}>Guru</span>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={16} />
                  </div>
                </div>
              </Reveal>
              {workflows.teacher.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.15}>
                  <div style={{
                    padding: '1.5rem', background: 'white', borderRadius: 16,
                    border: '1.5px solid var(--gray-100)', marginBottom: '1rem',
                    position: 'relative', transition: 'border-color 200ms, box-shadow 200ms, transform 200ms'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#c7d2fe'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-100)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#eef2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>{i + 1}</div>
                      <h4 style={{ fontWeight: 600, color: 'var(--gray-900)', fontSize: '0.9375rem' }}>{s.title}</h4>
                    </div>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.8125rem', lineHeight: 1.55, paddingLeft: '2.75rem' }}>{s.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Center Timeline - Desktop only */}
            {!isMobile && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4.5rem' }}>
                <div style={{ width: 2, flex: 1, background: 'linear-gradient(180deg, #6366f1, #0891b2)', borderRadius: 1, position: 'relative', minHeight: 300 }}>
                  {/* Animated dot */}
                  <div style={{
                    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                    width: 12, height: 12, borderRadius: '50%', background: '#6366f1',
                    boxShadow: '0 0 12px rgba(99,102,241,0.4)',
                    animation: 'flowDot 4s ease-in-out infinite'
                  }} />
                  {/* Connection nodes */}
                  {[0, 33, 66, 100].map(p => (
                    <div key={p} style={{
                      position: 'absolute', top: `${p}%`, left: '50%', transform: 'translate(-50%, -50%)',
                      width: 8, height: 8, borderRadius: '50%',
                      background: 'white', border: '2px solid var(--gray-300)'
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* Siswa Column */}
            <div>
              <Reveal delay={0.1}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#0891b2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={16} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--gray-900)' }}>Siswa</span>
                </div>
              </Reveal>
              {workflows.student.map((s, i) => (
                <Reveal key={s.title} delay={0.1 + i * 0.15}>
                  <div style={{
                    padding: '1.5rem', background: 'white', borderRadius: 16,
                    border: '1.5px solid var(--gray-100)', marginBottom: '1rem',
                    transition: 'border-color 200ms, box-shadow 200ms, transform 200ms'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#a5f3fc'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(8,145,178,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-100)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#ecfeff', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>{i + 1}</div>
                      <h4 style={{ fontWeight: 600, color: 'var(--gray-900)', fontSize: '0.9375rem' }}>{s.title}</h4>
                    </div>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.8125rem', lineHeight: 1.55, paddingLeft: '2.75rem' }}>{s.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Flow arrow indicator */}
          <Reveal delay={0.3}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '2.5rem', padding: '1.25rem 2rem', background: 'white', borderRadius: 14, border: '1.5px solid var(--gray-100)', maxWidth: 500, margin: '2.5rem auto 0' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#6366f1' }} />
              <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg, #6366f1, #0891b2)', borderRadius: 1 }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#0891b2' }} />
              <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginLeft: '0.5rem' }}>Guru mengajar → Siswa belajar → Feedback loop</span>
            </div>
          </Reveal>
        </div>

        <style>{`
          @keyframes flowDot {
            0% { top: 0%; opacity: 1; }
            100% { top: 100%; opacity: 0.3; }
          }
        `}</style>
      </section>

      {/* ===== ROLES ===== */}
      <section style={{ padding: isMobile ? '4rem 1.5rem' : '7rem 1.5rem', background: 'white', borderTop: '1px solid var(--gray-100)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: isMobile ? '1.5rem' : '2.5rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                Satu platform, tiga peran
              </h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '1.0625rem' }}>Guru, siswa, dan admin punya portal masing-masing.</p>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {[
              { title: 'Guru', desc: 'Kelola kelas, buat materi & latihan, review hasil.', color: '#6366f1', bullets: ['Class hub', 'Builder latihan', 'Review & feedback'] },
              { title: 'Siswa', desc: 'Akses materi, kerjakan latihan, lihat progres.', color: '#0891b2', bullets: ['Materi & latihan', 'Badge & ranking', 'Forum diskusi'] },
              { title: 'Admin', desc: 'Kelola akses dan operasional platform.', color: '#7c3aed', bullets: ['Kontrol akses', 'Manajemen user', 'Monitoring'] },
            ].map((r, i) => (
              <Reveal key={r.title} delay={i * 0.1}>
                <div style={{ padding: '2rem', background: 'white', border: '1.5px solid var(--gray-100)', borderRadius: 18, height: '100%' }}>
                  <div style={{ display: 'inline-block', padding: '0.3rem 0.75rem', borderRadius: 8, background: `${r.color}0a`, color: r.color, fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem' }}>{r.title}</div>
                  <p style={{ color: 'var(--gray-600)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>{r.desc}</p>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {r.bullets.map(b => (
                      <li key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        <CheckCircle2 size={15} style={{ color: r.color, flexShrink: 0 }} />{b}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={{
        padding: isMobile ? '4rem 1.5rem' : '6rem 1.5rem',
        background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)',
        borderTop: '1px solid var(--gray-100)'
      }}>
        <Reveal>
          <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: isMobile ? '1.5rem' : '2.25rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.75rem' }}>
              Siap untuk mulai?
            </h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: '2rem', fontSize: '1.0625rem' }}>
              Buat akun gratis dan langsung akses semua fitur.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" style={{
                padding: '0.85rem 2rem', borderRadius: 12,
                background: '#6366f1', color: 'white', fontSize: '0.9375rem', fontWeight: 600,
                boxShadow: '0 4px 16px rgba(99,102,241,0.25)',
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
              }}>
                Daftar Gratis <ArrowRight size={16} />
              </Link>
              <Link to="/login" style={{
                padding: '0.85rem 2rem', borderRadius: 12,
                background: 'white', border: '1.5px solid var(--gray-200)',
                color: 'var(--gray-700)', fontSize: '0.9375rem', fontWeight: 500
              }}>
                Masuk
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ borderTop: '1px solid var(--gray-100)', padding: '1.5rem', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={10} color="white" />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>© {new Date().getFullYear()} Geo Education</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/login" style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Masuk</Link>
            <Link to="/register" style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Daftar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

// TiltCard - 3D tilt effect on hover like antigravity.google
const TiltCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    card.style.boxShadow = `${-rotateY}px ${rotateX}px 24px rgba(99,102,241,0.1)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    card.style.boxShadow = 'none';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        padding: '2rem', background: 'white',
        border: '1.5px solid var(--gray-100)', borderRadius: 18,
        transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out',
        willChange: 'transform'
      }}
    >
      {children}
    </div>
  );
};

// WorkflowCard removed - using inline timeline visualization
