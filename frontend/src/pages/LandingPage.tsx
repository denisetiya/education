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
  {
    icon: <LayoutDashboard size={20} />,
    title: 'Manajemen kelas terpusat',
    description: 'Join code, daftar siswa, materi, latihan, forum, dan leaderboard dalam satu struktur kelas.',
  },
  {
    icon: <NotebookPen size={20} />,
    title: 'Builder latihan fleksibel',
    description: 'Soal campuran: pilihan ganda, numerik, jawaban singkat, bangun datar, dan canvas visual.',
  },
  {
    icon: <ClipboardCheck size={20} />,
    title: 'Evaluasi end-to-end',
    description: 'Siswa mengerjakan, guru meninjau hasil dan memberi feedback tanpa pindah konteks.',
  },
  {
    icon: <Award size={20} />,
    title: 'Engagement yang terukur',
    description: 'Badge, leaderboard, dan forum menjaga interaksi belajar tetap aktif.',
  },
];

const workflows = {
  teacher: [
    { title: 'Bangun kelas', desc: 'Atur materi, buku, modul, dan latihan dari satu workspace.' },
    { title: 'Rancang aktivitas', desc: 'Latihan sederhana atau visual, sesuai kebutuhan.' },
    { title: 'Review terpusat', desc: 'Submission, penilaian, dan feedback dalam satu alur.' },
  ],
  student: [
    { title: 'Masuk kelas', desc: 'Lihat materi, latihan, dan langkah berikutnya dengan jelas.' },
    { title: 'Kerjakan soal', desc: 'Tiap tipe soal menampilkan interaksi yang sesuai.' },
    { title: 'Lihat progres', desc: 'Feedback guru, badge, dan ranking per kelas.' },
  ],
};

export const LandingPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--gray-100)',
        padding: '0 1.5rem'
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={16} color="white" />
            </div>
            <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--gray-900)' }}>Geo Education</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {!isMobile && (
              <>
                <a href="#features" style={{ fontSize: '0.875rem', color: 'var(--gray-600)', padding: '0.4rem 0.75rem', borderRadius: 6 }}>Fitur</a>
                <a href="#workflow" style={{ fontSize: '0.875rem', color: 'var(--gray-600)', padding: '0.4rem 0.75rem', borderRadius: 6 }}>Alur Kerja</a>
              </>
            )}
            <Link to="/login" style={{
              padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)',
              background: 'var(--primary)', color: 'white',
              fontSize: '0.875rem', fontWeight: 500
            }}>
              Masuk
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        padding: isMobile ? '3rem 1.5rem' : '5rem 1.5rem',
        maxWidth: 1100, margin: '0 auto',
        textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        {/* 3D Background */}
        <Login3D isMobile={isMobile} variant="light" />
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.35rem 0.75rem', borderRadius: 999,
          background: 'var(--primary-light)', color: 'var(--primary)',
          fontSize: '0.75rem', fontWeight: 600, marginBottom: '1.5rem',
          position: 'relative', zIndex: 1
        }}>
          Platform Pembelajaran Modern
        </div>

        <h1 style={{
          fontSize: isMobile ? '2rem' : '3.25rem',
          fontWeight: 700, lineHeight: 1.15,
          color: 'var(--gray-900)', marginBottom: '1rem',
          letterSpacing: '-0.02em', maxWidth: 700, margin: '0 auto 1rem',
          position: 'relative', zIndex: 1
        }}>
          Kelola kelas, materi, dan evaluasi dalam satu tempat
        </h1>

        <p style={{
          color: 'var(--gray-500)', fontSize: isMobile ? '0.9375rem' : '1.125rem',
          lineHeight: 1.7, maxWidth: 560, margin: '0 auto 2rem',
          position: 'relative', zIndex: 1
        }}>
          Geo Education menyatukan alur kerja guru dan siswa. Dari pembuatan materi hingga penilaian, semua terintegrasi.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <Link to="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.7rem 1.5rem', borderRadius: 'var(--radius-md)',
            background: 'var(--primary)', color: 'white',
            fontSize: '0.9375rem', fontWeight: 500
          }}>
            Mulai Sekarang <ArrowRight size={16} />
          </Link>
          <Link to="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.7rem 1.5rem', borderRadius: 'var(--radius-md)',
            background: 'white', color: 'var(--gray-700)',
            border: '1px solid var(--gray-200)',
            fontSize: '0.9375rem', fontWeight: 500
          }}>
            Daftar Gratis
          </Link>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: isMobile ? '1.5rem' : '3rem',
          marginTop: '3rem', flexWrap: 'wrap', position: 'relative', zIndex: 1
        }}>
          {[['Multi-tipe', 'Soal'], ['Real-time', 'Feedback'], ['Gamifikasi', 'Belajar']].map(([top, bottom]) => (
            <div key={top} style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: '1rem' }}>{top}</p>
              <p style={{ color: 'var(--gray-400)', fontSize: '0.8125rem' }}>{bottom}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{
        padding: isMobile ? '3rem 1.5rem' : '5rem 1.5rem',
        background: 'var(--gray-50)', borderTop: '1px solid var(--gray-100)'
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
              Fitur yang mendukung fokus
            </h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.9375rem', maxWidth: 500, margin: '0 auto' }}>
              Setiap interaksi dirancang untuk kejelasan. Guru mengelola dengan mudah, siswa belajar dengan tenang.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1rem' }}>
            {features.map((f) => (
              <div key={f.title} style={{
                padding: '1.5rem', background: 'white',
                border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)',
                transition: 'box-shadow 150ms'
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'var(--primary-light)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.35rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', lineHeight: 1.6 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" style={{ padding: isMobile ? '3rem 1.5rem' : '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
              Alur kerja yang jelas
            </h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.9375rem', maxWidth: 500, margin: '0 auto' }}>
              Guru punya kendali penuh atas konten, siswa mendapat navigasi yang bersih.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
            {/* Teacher */}
            <div style={{ padding: '1.5rem', background: 'var(--gray-50)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={16} />
                </div>
                <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>Guru</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {workflows.teacher.map((step, i) => (
                  <div key={step.title} style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      background: 'var(--primary)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6875rem', fontWeight: 600, marginTop: 2
                    }}>{i + 1}</div>
                    <div>
                      <p style={{ fontWeight: 500, color: 'var(--gray-800)', fontSize: '0.875rem' }}>{step.title}</p>
                      <p style={{ color: 'var(--gray-500)', fontSize: '0.8125rem' }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Student */}
            <div style={{ padding: '1.5rem', background: 'var(--gray-50)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0891b2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={16} />
                </div>
                <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>Siswa</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {workflows.student.map((step, i) => (
                  <div key={step.title} style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      background: '#0891b2', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6875rem', fontWeight: 600, marginTop: 2
                    }}>{i + 1}</div>
                    <div>
                      <p style={{ fontWeight: 500, color: 'var(--gray-800)', fontSize: '0.875rem' }}>{step.title}</p>
                      <p style={{ color: 'var(--gray-500)', fontSize: '0.8125rem' }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roles CTA */}
      <section style={{
        padding: isMobile ? '3rem 1.5rem' : '5rem 1.5rem',
        background: 'var(--gray-50)', borderTop: '1px solid var(--gray-100)'
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
              Satu platform, tiga peran
            </h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.9375rem' }}>
              Guru, siswa, dan admin masing-masing punya portal yang sesuai.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { title: 'Guru', desc: 'Kelola kelas, buat materi & latihan, review hasil siswa.', color: 'var(--primary)', bullets: ['Class hub', 'Builder latihan', 'Review & feedback'] },
              { title: 'Siswa', desc: 'Akses materi, kerjakan latihan, lihat progres.', color: '#0891b2', bullets: ['Materi & latihan', 'Badge & ranking', 'Forum diskusi'] },
              { title: 'Admin', desc: 'Kelola akses dan fondasi operasional platform.', color: '#7c3aed', bullets: ['Kontrol akses', 'Manajemen user', 'Monitoring'] },
            ].map((role) => (
              <div key={role.title} style={{
                padding: '1.5rem', background: 'white',
                border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)'
              }}>
                <div style={{
                  display: 'inline-block', padding: '0.25rem 0.6rem',
                  borderRadius: 6, background: `${role.color}12`, color: role.color,
                  fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem'
                }}>{role.title}</div>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>{role.desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {role.bullets.map(b => (
                    <li key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--gray-600)' }}>
                      <CheckCircle2 size={14} style={{ color: role.color, flexShrink: 0 }} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--gray-100)', padding: '2rem 1.5rem' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={12} color="white" />
            </div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>© {new Date().getFullYear()} Geo Education</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/login" style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>Masuk</Link>
            <Link to="/register" style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>Daftar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
