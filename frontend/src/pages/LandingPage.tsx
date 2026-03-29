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
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { Login3D } from '../components/Login3D';

type ProductHighlight = {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
};

type WorkflowStep = {
  title: string;
  description: string;
};

type Capability = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  accent: string;
};

type RoleCardData = {
  title: string;
  description: string;
  accent: string;
  bullets: string[];
};

const productHighlights: ProductHighlight[] = [
  {
    icon: <LayoutDashboard size={22} />,
    title: 'Manajemen kelas yang tidak berantakan',
    description:
      'Join code, daftar siswa, materi, latihan, forum, dan leaderboard berada dalam satu struktur kelas yang konsisten.',
    accent: '#6366f1',
  },
  {
    icon: <NotebookPen size={22} />,
    title: 'Builder latihan yang lebih nyata',
    description:
      'Guru dapat menyusun paket soal campuran: pilihan ganda, numerik, jawaban singkat, bangun datar, dan canvas visual.',
    accent: 'var(--accent)',
  },
  {
    icon: <ClipboardCheck size={22} />,
    title: 'Evaluasi dari pengerjaan sampai feedback',
    description:
      'Siswa mengerjakan dari kelas yang sama, guru meninjau hasil, memberi nilai, dan tindak lanjut tanpa pindah-pindah konteks.',
    accent: 'var(--secondary)',
  },
  {
    icon: <Award size={22} />,
    title: 'Kelas terasa hidup untuk siswa',
    description:
      'Badge, leaderboard, dan forum membuat progres lebih mudah dipantau sekaligus menjaga interaksi belajar tetap aktif.',
    accent: 'var(--primary)',
  },
];

const teacherWorkflow: WorkflowStep[] = [
  {
    title: 'Bangun kelas dengan struktur yang jelas',
    description:
      'Guru mulai dari kelas, kemudian mengatur materi, buku, modul, dan latihan dari workspace yang sama.',
  },
  {
    title: 'Rancang aktivitas belajar yang sesuai',
    description:
      'Latihan bisa dibuat sederhana atau visual, dengan opsi grafik dan canvas hanya saat benar-benar dibutuhkan.',
  },
  {
    title: 'Review hasil secara terpusat',
    description:
      'Submission siswa, status penilaian, dan umpan balik kelas dibangun dalam satu alur yang mudah ditindaklanjuti.',
  },
];

const studentWorkflow: WorkflowStep[] = [
  {
    title: 'Masuk kelas dan langsung tahu prioritas',
    description:
      'Siswa melihat materi, latihan, pencapaian, dan diskusi tanpa harus menebak-nebak langkah berikutnya.',
  },
  {
    title: 'Kerjakan soal dengan konteks yang pas',
    description:
      'Tiap tipe soal menampilkan interaksi yang sesuai, sehingga pengalaman mengerjakan tetap jelas dan tidak melelahkan.',
  },
  {
    title: 'Lihat hasil dan progres per kelas',
    description:
      'Feedback guru, badge, ranking kelas, dan forum hadir sebagai bagian dari perjalanan belajar yang sama.',
  },
];

const capabilityCards: Capability[] = [
  {
    eyebrow: 'Operasional kelas',
    title: 'Untuk guru yang ingin cepat mengelola kelas tanpa kehilangan detail penting.',
    description:
      'Struktur kelas menjadi pusat navigasi agar pengelolaan siswa, materi, latihan, dan diskusi lebih mudah dipahami.',
    bullets: [
      'Join code dan daftar kelas tersusun rapi',
      'Akses cepat ke materi, buku, latihan, dan forum',
      'Navigasi guru lebih fokus pada tindakan utama',
    ],
    accent: '#6366f1',
  },
  {
    eyebrow: 'Konten belajar',
    title: 'Untuk materi dan buku yang tetap nyaman dibaca sekaligus mudah dihubungkan ke aktivitas kelas.',
    description:
      'Pembuatan materi, pengelompokan modul, dan library dibuat menyatu agar guru tidak bekerja dalam panel-panel terpisah.',
    bullets: [
      'Materi dan buku tetap berada dalam konteks kelas',
      'Susunan modul mendukung alur belajar yang runtut',
      'Siswa menerima akses yang lebih terarah',
    ],
    accent: '#0f766e',
  },
  {
    eyebrow: 'Latihan dan penilaian',
    title: 'Untuk workflow soal yang lengkap, dari pembuatan hingga penilaian akhir.',
    description:
      'Latihan tidak berhenti di editor. Hasil siswa, review guru, dan feedback dibangun sebagai satu siklus kerja utuh.',
    bullets: [
      'Multi-soal dan multi-tipe dalam satu paket',
      'Visual soal dapat diaktifkan atau dimatikan',
      'Review guru dan hasil siswa tetap saling terhubung',
    ],
    accent: '#ec4899',
  },
  {
    eyebrow: 'Motivasi dan komunitas',
    title: 'Untuk pengalaman siswa yang lebih hidup tanpa mengganggu fokus belajar inti.',
    description:
      'Leaderboard, badge, dan forum hadir sebagai lapisan engagement yang tetap relevan dengan progres kelas.',
    bullets: [
      'Leaderboard tersedia per kelas',
      'Badge mendukung pencapaian yang terlihat',
      'Forum diskusi menjaga interaksi tetap aktif',
    ],
    accent: '#7c3aed',
  },
];

const roleCards: RoleCardData[] = [
  {
    title: 'Portal guru',
    description:
      'Cocok untuk mengatur kelas, menyusun materi, membuat latihan interaktif, dan memantau hasil siswa dengan alur yang lebih profesional.',
    accent: '#6366f1',
    bullets: [
      'Class hub yang lebih jelas',
      'Builder latihan yang lebih fleksibel',
      'Review hasil dan aktivitas kelas dalam satu tempat',
    ],
  },
  {
    title: 'Portal siswa',
    description:
      'Cocok untuk belajar per kelas dengan navigasi yang ringan, instruksi yang jelas, dan umpan balik yang mudah dilihat.',
    accent: '#0f766e',
    bullets: [
      'Akses materi, latihan, dan forum',
      'Hasil, badge, dan ranking yang transparan',
      'Langkah berikutnya lebih mudah dipahami',
    ],
  },
  {
    title: 'Portal admin',
    description:
      'Cocok untuk pengelolaan akses dan fondasi operasional, sementara pengalaman utama tetap difokuskan untuk guru dan siswa.',
    accent: '#7c3aed',
    bullets: [
      'Kontrol akses berbasis peran',
      'Dasar operasional tetap tersedia',
      'Siap dikembangkan sesuai kebutuhan institusi',
    ],
  },
];

const GlassNote = ({ eyebrow, title }: { eyebrow: string; title: string }) => (
  <div
    className="glass animate-float"
    style={{
      padding: '1rem 1.5rem',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      boxShadow: 'var(--shadow-lg)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
      minWidth: '220px',
    }}
  >
    <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)' }}>{eyebrow}</div>
    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--slate-800)' }}>{title}</div>
  </div>
);

export const LandingPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 1024);

    document.title = 'Geo Education | Modern Class, Simple Workflow';

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }

    metaDescription.setAttribute(
      'content',
      'Geo Education unites class management, materials, interactive exercises, forum, and leaderboard in one premium experience.'
    );

    updateViewport();
    window.addEventListener('resize', updateViewport);

    // Intersection Observer for Reveal Animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    const revealedElements = document.querySelectorAll('.reveal');
    revealedElements.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener('resize', updateViewport);
      revealedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--slate-50)',
        color: 'var(--text-main)',
      }}
    >
      <nav
        className="glass"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderBottom: '1px solid var(--slate-200)',
          padding: '0.5rem 0',
        }}
      >
        <div
          className="container"
          style={{
            minHeight: isMobile ? '64px' : '76px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              className="animate-float"
              style={{
                width: isMobile ? '40px' : '48px',
                height: isMobile ? '40px' : '48px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 10px 20px var(--primary-glow)',
              }}
            >
              <GraduationCap size={isMobile ? 22 : 26} />
            </div>
            <div>
              <div style={{ color: 'var(--slate-900)', fontWeight: 900, fontSize: isMobile ? '1.1rem' : '1.25rem', letterSpacing: '-0.02em' }}>
                Geo Education
              </div>
              {!isMobile && (
                <div style={{ color: 'var(--slate-500)', fontSize: '0.8rem', fontWeight: 600 }}>
                  Pembelajaran modern dengan alur yang rapi
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '1.5rem' }}>
            {!isMobile && (
              <div style={{ display: 'flex', gap: '1.5rem', marginRight: '1rem' }}>
                <TopNavLink href="#experience" label="Experience" />
                <TopNavLink href="#workflow" label="Workflow" />
              </div>
            )}
            <Link
              to="/login"
              className="btn btn-primary"
              style={{
                padding: isMobile ? '0.6rem 1rem' : '0.75rem 1.5rem',
                fontSize: isMobile ? '0.85rem' : '0.95rem',
              }}
            >
              Masuk aplikasi
            </Link>
          </div>
        </div>
      </nav>

      <header
        style={{
          position: 'relative',
          minHeight: isMobile ? 'auto' : '90vh',
          padding: isMobile ? '3rem 0 4rem' : '5rem 0',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          background: 'radial-gradient(circle at 50% -20%, var(--primary-light) 0%, transparent 70%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <Login3D isMobile={isMobile} />
          </div>
          <div
            className="blob"
            style={{
              position: 'absolute',
              top: '10%',
              left: '5%',
              width: '400px',
              height: '400px',
              background: 'var(--primary-glow)',
              filter: 'blur(80px)',
              opacity: 0.3,
            }}
          />
          <div
            className="blob"
            style={{
              position: 'absolute',
              bottom: '10%',
              right: '5%',
              width: '300px',
              height: '300px',
              background: 'var(--secondary-glow)',
              filter: 'blur(80px)',
              opacity: 0.2,
            }}
          />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1.1fr 0.9fr',
              gap: isMobile ? '3rem' : '4rem',
              alignItems: 'center',
            }}
          >
            <div className="reveal">
              <div
                className="reveal"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '999px',
                  background: 'white',
                  border: '1px solid var(--slate-200)',
                  boxShadow: 'var(--shadow-sm)',
                  marginBottom: '2.5rem',
                }}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    boxShadow: '0 0 12px var(--primary)',
                  }}
                />
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--slate-700)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  Modern Learning Experience
                </span>
              </div>

              <h1
                className="reveal"
                style={{
                  fontSize: isMobile ? '3.25rem' : '5rem',
                  lineHeight: 1.05,
                  letterSpacing: '-0.05em',
                  fontWeight: 950,
                  marginBottom: '2rem',
                  color: 'var(--slate-950)',
                }}
              >
                Guru <span className="text-gradient">Terarah</span>, <br />
                Siswa <span className="text-gradient" style={{ animationDelay: '0.2s' }}>Paham</span>, <br />
                Kelas <span style={{ color: 'var(--slate-950)' }}>Hidup.</span>
              </h1>

              <p
                className="reveal"
                style={{
                  color: 'var(--slate-500)',
                  lineHeight: 1.7,
                  fontSize: '1.25rem',
                  marginBottom: '3.5rem',
                  maxWidth: '540px',
                  fontWeight: 500,
                }}
              >
                Platform pendidikan yang menyatukan alur kerja guru dan siswa dalam satu ekosistem premium. 
                Dari materi interaktif hingga evaluasi yang cerdas, semua dalam satu genggaman.
              </p>

              <div className="reveal" style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                <Link
                  to="/login"
                  className="btn btn-primary"
                  style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}
                >
                  Mulai Sekarang
                  <ArrowRight size={20} />
                </Link>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}
                >
                  Lihat Demo
                </button>
              </div>

              <div
                className="reveal"
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  marginTop: '4rem',
                  flexWrap: 'wrap',
                }}
              >
                <HeroTag label="Materi Interaktif" />
                <HeroTag label="Latihan Visual" />
                <HeroTag label="Smart Analytics" />
              </div>
            </div>

            <div className="reveal" style={{ position: 'relative' }}>
              <div
                className="blob"
                style={{
                  position: 'absolute',
                  top: '10%',
                  right: '10%',
                  width: '400px',
                  height: '400px',
                  background: 'var(--primary-glow)',
                  filter: 'blur(80px)',
                  zIndex: 0,
                  borderRadius: '50%',
                }}
              />
              
              <div
                className="card-premium animate-float"
                style={{
                  position: 'relative',
                  zIndex: 1,
                  padding: '2.5rem',
                  background: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                  <StageBadge icon={<CheckCircle2 size={14} />} label="V5.0 Ready" />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--slate-900)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShieldCheck size={20} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {[{ title: 'Class Cockpit', desc: 'Dashboard terpadu untuk monitoring progres seluruh siswa.', icon: <Users size={22} />, accent: 'var(--primary)' },
                    { title: 'Interactive Modules', desc: 'Editor materi yang mendukung visualisasi interaktif.', icon: <Sparkles size={22} />, accent: 'var(--accent)' },
                    { title: 'Student Rhythm', desc: 'Gamifikasi pembelajaran dengan leaderboard dinamis.', icon: <BookOpen size={22} />, accent: 'var(--secondary)' }
                  ].map((item) => (
                    <div
                      key={item.title}
                      style={{
                        padding: '1.25rem',
                        borderRadius: '20px',
                        background: 'white',
                        border: '1px solid var(--slate-100)',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        gap: '1.25rem',
                        alignItems: 'start',
                      }}
                    >
                      <div style={{ 
                        padding: '0.75rem', 
                        borderRadius: '14px', 
                        background: `${item.accent}15`, 
                        color: item.accent,
                        boxShadow: `0 4px 12px ${item.accent}20`
                      }}>
                        {item.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--slate-950)', marginBottom: '0.25rem', fontSize: '1.05rem' }}>{item.title}</div>
                        <div style={{ color: 'var(--slate-500)', fontSize: '0.9rem', lineHeight: 1.5, fontWeight: 500 }}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative elements */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-20px',
                  left: '-20px',
                  zIndex: 2,
                }}
              >
                <GlassNote eyebrow="Real-time" title="Siswa sedang mengerjakan latihan..." />
              </div>
            </div>
          </div>
        </div>
      </header>

      <section
        id="experience"
        style={{
          padding: isMobile ? '4rem 0' : '8rem 0',
          background: 'white',
        }}
      >
        <div className="container">
          <SectionHeader
            eyebrow="Premium Experience"
            title="Desain yang menunjang fokus dan produktivitas."
            description="Setiap interaksi dirancang untuk memberikan kejelasan. Guru mengelola dengan mudah, siswa belajar dengan tenang."
            isMobile={isMobile}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '2rem',
            }}
          >
            {productHighlights.map((item) => (
              <HighlightCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="workflow"
        style={{
          padding: isMobile ? '4rem 0' : '8rem 0',
          background: 'var(--slate-50)',
          position: 'relative',
          overflow: 'hidden',
          borderTop: '1px solid var(--slate-100)',
          borderBottom: '1px solid var(--slate-100)',
        }}
      >
        <div
          className="blob"
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '600px',
            height: '600px',
            background: 'var(--primary-glow)',
            filter: 'blur(120px)',
            opacity: 0.1,
          }}
        />
        
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <SectionHeader
            eyebrow="Workflow Logic"
            title="Alur kerja yang dipisahkan secara cerdas."
            description="Guru memiliki kendali penuh atas konten dan evaluasi, sementara siswa mendapatkan navigasi yang bersih dan terfokus."
            isMobile={isMobile}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '2rem',
            }}
          >
            <WorkflowColumn
              title="Portal Guru"
              accent="var(--primary)"
              icon={<Users size={24} />}
              steps={teacherWorkflow}
            />
            <WorkflowColumn
              title="Portal Siswa"
              accent="var(--secondary)"
              icon={<BookOpen size={24} />}
              steps={studentWorkflow}
            />
          </div>
        </div>
      </section>

      <section
        style={{
          padding: isMobile ? '4rem 0' : '8rem 0',
        }}
      >
        <div className="container">
          <SectionHeader
            eyebrow="Capability Map"
            title="Kemampuan inti yang matang dan handal."
            description="Bukan sekadar fitur, tapi solusi nyata untuk tantangan pembelajaran sehari-hari."
            isMobile={isMobile}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '2rem',
            }}
          >
            {capabilityCards.map((item) => (
              <CapabilityCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          padding: isMobile ? '4rem 0' : '8rem 0',
        }}
      >
        <div className="container">
          <SectionHeader
            eyebrow="Portal Access"
            title="Satu pintu untuk seluruh ekosistem."
            description="Pilih peran Anda dan mulai pengalaman belajar yang tak terlupakan."
            isMobile={isMobile}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '2rem',
            }}
          >
            {roleCards.map((item) => (
              <RoleCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <footer
        style={{
          background: 'white',
          borderTop: '1px solid var(--slate-100)',
          padding: '4rem 0',
        }}
      >
        <div
          className="container"
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
            gap: '3rem',
            alignItems: 'start',
          }}
        >
          <div className="reveal">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <GraduationCap size={18} />
              </div>
              <div style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--slate-950)' }}>
                Geo Education
              </div>
            </div>
            <p style={{ color: 'var(--slate-500)', maxWidth: '480px', lineHeight: 1.6, fontWeight: 500 }}>
              Platform pendidikan modern yang dirancang untuk mendukung alur kerja guru dan siswa 
              yang lebih lancar, terukur, dan menyenangkan.
            </p>
          </div>

          <div
            className="reveal"
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: isMobile ? 'flex-start' : 'flex-end',
              gap: '2rem',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontWeight: 800, color: 'var(--slate-900)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform</div>
              <a href="#experience" style={{ color: 'var(--slate-500)', fontWeight: 600 }}>Experience</a>
              <a href="#workflow" style={{ color: 'var(--slate-500)', fontWeight: 600 }}>Workflow</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontWeight: 800, color: 'var(--slate-900)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account</div>
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Masuk Aplikasi</Link>
            </div>
          </div>
        </div>
        
        <div className="container" style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--slate-50)', textAlign: 'center' }}>
          <div style={{ color: 'var(--slate-400)', fontSize: '0.85rem', fontWeight: 600 }}>
            &copy; {new Date().getFullYear()} Geo Education. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

const TopNavLink: React.FC<{ href: string; label: string }> = ({ href, label }) => (
  <a
    href={href}
    style={{
      color: 'var(--slate-600)',
      fontWeight: 700,
      fontSize: '0.95rem',
      padding: '0.5rem 0.75rem',
      borderRadius: '8px',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.color = 'var(--primary)';
      e.currentTarget.style.background = 'rgba(79, 70, 229, 0.05)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.color = 'var(--slate-600)';
      e.currentTarget.style.background = 'transparent';
    }}
  >
    {label}
  </a>
);

const HeroTag: React.FC<{ label: string }> = ({ label }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      borderRadius: '999px',
      background: 'var(--slate-100)',
      color: 'var(--slate-700)',
      fontWeight: 700,
      fontSize: '0.8rem',
      border: '1px solid var(--slate-200)',
    }}
  >
    <Sparkles size={14} className="text-primary" />
    {label}
  </div>
);

const StageBadge: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      borderRadius: '999px',
      background: 'var(--slate-900)',
      color: 'white',
      fontWeight: 700,
      fontSize: '0.75rem',
      boxShadow: 'var(--shadow-lg)',
    }}
  >
    {icon}
    <span>{label}</span>
  </div>
);

const SectionHeader: React.FC<{
  eyebrow: string;
  title: string;
  description: string;
  isMobile: boolean;
  dark?: boolean;
}> = ({ eyebrow, title, description, isMobile, dark = false }) => (
  <div className="reveal" style={{ marginBottom: '4rem', textAlign: isMobile && !dark ? 'left' : 'center', marginLeft: 'auto', marginRight: 'auto', maxWidth: '800px' }}>
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: dark ? 'var(--primary-light)' : 'var(--primary)',
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontSize: '0.85rem',
        marginBottom: '1rem',
      }}
    >
      <Sparkles size={16} />
      <span>{eyebrow}</span>
    </div>
    <h2
      style={{
        fontSize: isMobile ? '2.25rem' : '3.5rem',
        lineHeight: 1.1,
        letterSpacing: '-0.04em',
        fontWeight: 900,
        marginBottom: '1.5rem',
        color: dark ? '#ffffff' : 'var(--slate-950)',
      }}
    >
      {title}
    </h2>
    <p
      style={{
        color: dark ? 'var(--slate-300)' : 'var(--slate-600)',
        lineHeight: 1.7,
        fontSize: '1.15rem',
        fontWeight: 500,
      }}
    >
      {description}
    </p>
  </div>
);

const HighlightCard: React.FC<{ item: ProductHighlight }> = ({ item }) => (
  <div
    className="reveal card-premium"
    style={{
      padding: '2.5rem',
    }}
  >
    <div
      style={{
        width: '64px',
        height: '64px',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        background: `linear-gradient(135deg, ${item.accent} 0%, var(--accent) 100%)`,
        marginBottom: '1.5rem',
        boxShadow: `0 10px 20px ${item.accent}33`,
      }}
    >
      {item.icon}
    </div>
    <h3
      style={{
        color: 'var(--slate-950)',
        fontSize: '1.5rem',
        fontWeight: 900,
        lineHeight: 1.2,
        marginBottom: '1rem',
        letterSpacing: '-0.02em',
      }}
    >
      {item.title}
    </h3>
    <p style={{ color: 'var(--slate-600)', lineHeight: 1.7, fontWeight: 500 }}>{item.description}</p>
  </div>
);

const WorkflowColumn: React.FC<{
  title: string;
  accent: string;
  icon: React.ReactNode;
  steps: WorkflowStep[];
}> = ({ title, accent, icon, steps }) => (
  <div
    className="reveal"
    style={{
      borderRadius: '32px',
      background: 'white',
      border: '1px solid var(--slate-100)',
      padding: '2rem',
      boxShadow: 'var(--shadow-sm)',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '18px',
          background: accent,
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 10px 20px ${accent}33`,
        }}
      >
        {icon}
      </div>
      <div style={{ color: 'var(--slate-900)', fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>{title}</div>
    </div>

    <div style={{ display: 'grid', gap: '1.25rem' }}>
      {steps.map((step, index) => (
        <div
          key={step.title}
          style={{
            borderRadius: '24px',
            padding: '1.5rem',
            background: 'white',
            border: '1px solid var(--slate-100)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.borderColor = accent;
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'var(--slate-100)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: accent,
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '0.9rem',
              marginBottom: '1rem',
            }}
          >
            {index + 1}
          </div>
          <div style={{ color: 'var(--slate-900)', fontWeight: 800, marginBottom: '0.5rem', fontSize: '1.1rem' }}>{step.title}</div>
          <div style={{ color: 'var(--slate-500)', lineHeight: 1.6, fontWeight: 500 }}>{step.description}</div>
        </div>
      ))}
    </div>
  </div>
);

const CapabilityCard: React.FC<{ item: Capability }> = ({ item }) => (
  <div
    className="reveal card-premium"
    style={{
      padding: '2.5rem',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.5rem 1rem',
        borderRadius: '999px',
        background: `${item.accent}15`,
        color: item.accent,
        fontWeight: 800,
        fontSize: '0.8rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '1.5rem',
        width: 'fit-content',
      }}
    >
      {item.eyebrow}
    </div>

    <h3
      style={{
        color: 'var(--slate-950)',
        fontSize: '1.5rem',
        fontWeight: 900,
        lineHeight: 1.25,
        marginBottom: '1rem',
        letterSpacing: '-0.02em',
      }}
    >
      {item.title}
    </h3>

    <p style={{ color: 'var(--slate-600)', lineHeight: 1.7, marginBottom: '1.5rem', fontWeight: 500 }}>{item.description}</p>

    <div style={{ display: 'grid', gap: '0.875rem', marginTop: 'auto' }}>
      {item.bullets.map((bullet) => (
        <div key={bullet} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div style={{ color: item.accent, marginTop: '0.2rem', flexShrink: 0 }}>
            <CheckCircle2 size={18} />
          </div>
          <div style={{ color: 'var(--slate-700)', lineHeight: 1.5, fontWeight: 600 }}>{bullet}</div>
        </div>
      ))}
    </div>
  </div>
);


const RoleCard: React.FC<{ item: RoleCardData }> = ({ item }) => (
  <div
    className="reveal card-premium"
    style={{
      padding: '2.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      textAlign: 'center',
      alignItems: 'center',
    }}
  >
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.5rem 1.25rem',
        borderRadius: '999px',
        background: `${item.accent}15`,
        color: item.accent,
        fontWeight: 800,
        fontSize: '0.85rem',
        textTransform: 'uppercase',
      }}
    >
      {item.title}
    </div>

    <div>
      <h3 style={{ color: 'var(--slate-950)', fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
        {item.title}
      </h3>
      <p style={{ color: 'var(--slate-600)', lineHeight: 1.7, fontWeight: 500 }}>{item.description}</p>
    </div>

    <div style={{ display: 'grid', gap: '0.75rem', width: '100%', textAlign: 'left' }}>
      {item.bullets.map((bullet) => (
        <div key={bullet} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div style={{ color: item.accent, marginTop: '0.2rem', flexShrink: 0 }}>
            <CheckCircle2 size={18} />
          </div>
          <div style={{ color: 'var(--slate-700)', lineHeight: 1.5, fontWeight: 600 }}>{bullet}</div>
        </div>
      ))}
    </div>

    <Link
      to="/login"
      className="btn"
      style={{
        marginTop: 'auto',
        width: '100%',
        background: item.accent,
        color: '#ffffff',
        boxShadow: `0 10px 20px ${item.accent}33`,
      }}
    >
      Mulai Belajar
      <ArrowRight size={20} />
    </Link>
  </div>
);

