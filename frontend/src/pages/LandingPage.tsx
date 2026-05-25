import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { Login3D } from '../components/Login3D';

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

export const LandingPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const u = () => setIsMobile(window.innerWidth < 768);
    u();
    window.addEventListener('resize', u);
    return () => window.removeEventListener('resize', u);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      {/* ===== HERO ===== */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 40%, #f5f3ff 100%)',
        minHeight: isMobile ? 'auto' : '100vh',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* 3D Background */}
        <Login3D isMobile={isMobile} variant="light" />

        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.06)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(139, 92, 246, 0.05)', filter: 'blur(80px)', pointerEvents: 'none' }} />

        {/* Nav */}
        <nav style={{
          position: 'relative', zIndex: 20,
          padding: '1rem 1.5rem', maxWidth: 1200, margin: '0 auto', width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,102,241,0.2)' }}>
              <GraduationCap size={17} color="white" />
            </div>
            <span style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: '1.0625rem' }}>Geo Education</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {!isMobile && (
              <>
                <a href="#features" style={{ fontSize: '0.875rem', color: 'var(--gray-600)', padding: '0.4rem 0.75rem', borderRadius: 8, transition: 'color 150ms' }}>Fitur</a>
                <a href="#workflow" style={{ fontSize: '0.875rem', color: 'var(--gray-600)', padding: '0.4rem 0.75rem', borderRadius: 8, transition: 'color 150ms' }}>Alur Kerja</a>
              </>
            )}
            <Link to="/login" style={{
              padding: '0.5rem 1.25rem', borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', fontSize: '0.875rem', fontWeight: 500,
              boxShadow: '0 4px 12px rgba(99,102,241,0.2)'
            }}>
              Masuk
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div style={{
          position: 'relative', zIndex: 10, flex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: isMobile ? '3rem 1.5rem 5rem' : '0 1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: 700 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.4rem 0.875rem', borderRadius: 999,
              background: 'white', border: '1px solid var(--gray-200)',
              color: '#6366f1', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1.75rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              ✦ Platform Pembelajaran Modern
            </div>

            <h1 style={{
              fontSize: isMobile ? '2.25rem' : '3.75rem',
              fontWeight: 800, lineHeight: 1.1,
              color: 'var(--gray-900)', marginBottom: '1.25rem',
              letterSpacing: '-0.03em'
            }}>
              Belajar lebih terarah,{' '}
              <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                mengajar lebih ringan.
              </span>
            </h1>

            <p style={{
              color: 'var(--gray-500)', fontSize: isMobile ? '1rem' : '1.2rem',
              lineHeight: 1.7, maxWidth: 540, margin: '0 auto 2.5rem'
            }}>
              Satu platform untuk guru dan siswa. Kelola kelas, materi interaktif, latihan multi-tipe, dan evaluasi — semua terintegrasi.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.8rem 1.75rem', borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', fontSize: '0.9375rem', fontWeight: 600,
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.25)',
                transition: 'transform 150ms, box-shadow 150ms'
              }}>
                Mulai Gratis <ArrowRight size={16} />
              </Link>
              <Link to="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.8rem 1.75rem', borderRadius: 12,
                background: 'white', border: '1px solid var(--gray-200)',
                color: 'var(--gray-700)', fontSize: '0.9375rem', fontWeight: 500,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                Masuk
              </Link>
            </div>

            {/* Trust indicators */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginTop: '3.5rem', flexWrap: 'wrap' }}>
              {[['Multi-tipe', 'Soal'], ['Real-time', 'Feedback'], ['Gamifikasi', 'Belajar']].map(([t, b]) => (
                <div key={t} style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: '0.9375rem' }}>{t}</p>
                  <p style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" style={{ padding: isMobile ? '4rem 1.5rem' : '6rem 1.5rem', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: isMobile ? '1.5rem' : '2.25rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
              Fitur yang mendukung fokus
            </h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '1rem', maxWidth: 500, margin: '0 auto' }}>
              Guru mengelola dengan mudah, siswa belajar dengan tenang.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1rem' }}>
            {features.map((f) => (
              <div key={f.title} style={{
                padding: '1.75rem', background: 'white',
                border: '1px solid var(--gray-200)', borderRadius: 16,
                transition: 'border-color 150ms, box-shadow 150ms'
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#c7d2fe'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)', color: '#6366f1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.4rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.9375rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WORKFLOW ===== */}
      <section id="workflow" style={{ padding: isMobile ? '4rem 1.5rem' : '6rem 1.5rem', background: 'var(--gray-50)', borderTop: '1px solid var(--gray-100)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: isMobile ? '1.5rem' : '2.25rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
              Alur kerja yang jelas
            </h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '1rem', maxWidth: 500, margin: '0 auto' }}>
              Guru punya kendali penuh, siswa mendapat navigasi yang bersih.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
            <WorkflowCard title="Guru" color="#6366f1" icon={<Users size={16} />} steps={workflows.teacher} />
            <WorkflowCard title="Siswa" color="#0891b2" icon={<BookOpen size={16} />} steps={workflows.student} />
          </div>
        </div>
      </section>

      {/* ===== ROLES ===== */}
      <section style={{ padding: isMobile ? '4rem 1.5rem' : '6rem 1.5rem', background: 'white', borderTop: '1px solid var(--gray-100)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: isMobile ? '1.5rem' : '2.25rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
              Satu platform, tiga peran
            </h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '1rem' }}>Guru, siswa, dan admin punya portal masing-masing.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { title: 'Guru', desc: 'Kelola kelas, buat materi & latihan, review hasil.', color: '#6366f1', bullets: ['Class hub', 'Builder latihan', 'Review & feedback'] },
              { title: 'Siswa', desc: 'Akses materi, kerjakan latihan, lihat progres.', color: '#0891b2', bullets: ['Materi & latihan', 'Badge & ranking', 'Forum diskusi'] },
              { title: 'Admin', desc: 'Kelola akses dan operasional platform.', color: '#7c3aed', bullets: ['Kontrol akses', 'Manajemen user', 'Monitoring'] },
            ].map((r) => (
              <div key={r.title} style={{ padding: '1.75rem', background: 'white', border: '1px solid var(--gray-200)', borderRadius: 16 }}>
                <div style={{ display: 'inline-block', padding: '0.25rem 0.7rem', borderRadius: 8, background: `${r.color}0a`, color: r.color, fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.875rem' }}>{r.title}</div>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1rem' }}>{r.desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {r.bullets.map(b => (
                    <li key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--gray-600)' }}>
                      <CheckCircle2 size={14} style={{ color: r.color, flexShrink: 0 }} />{b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={{
        padding: isMobile ? '4rem 1.5rem' : '5rem 1.5rem',
        background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)',
        borderTop: '1px solid var(--gray-100)'
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.75rem' }}>
            Siap untuk mulai?
          </h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: '2rem', fontSize: '1rem' }}>
            Buat akun gratis dan langsung akses semua fitur.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              padding: '0.8rem 1.75rem', borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', fontSize: '0.9375rem', fontWeight: 600,
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.25)',
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
            }}>
              Daftar Gratis <ArrowRight size={16} />
            </Link>
            <Link to="/login" style={{
              padding: '0.8rem 1.75rem', borderRadius: 12,
              background: 'white', border: '1px solid var(--gray-200)',
              color: 'var(--gray-700)', fontSize: '0.9375rem', fontWeight: 500,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              Masuk
            </Link>
          </div>
        </div>
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

const WorkflowCard = ({ title, color, icon, steps }: { title: string; color: string; icon: React.ReactNode; steps: { title: string; desc: string }[] }) => (
  <div style={{ padding: '1.75rem', background: 'white', border: '1px solid var(--gray-200)', borderRadius: 16 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${color}30` }}>{icon}</div>
      <span style={{ fontWeight: 600, color: 'var(--gray-900)', fontSize: '1.0625rem' }}>{title}</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {steps.map((s, i) => (
        <div key={s.title} style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: `${color}12`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700, marginTop: 2 }}>{i + 1}</div>
          <div>
            <p style={{ fontWeight: 500, color: 'var(--gray-800)', fontSize: '0.9375rem' }}>{s.title}</p>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.8125rem', lineHeight: 1.5 }}>{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);
