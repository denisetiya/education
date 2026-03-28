import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, FileText, PlayCircle, Sparkles } from 'lucide-react';
import { classesAPI } from '../../utils/api';

interface MaterialItem {
    id: string;
    title: string;
    type: string;
    moduleOrder: number;
}

interface Module {
    id: string;
    title: string;
    order: number;
    materials: MaterialItem[];
}

const getMaterialMeta = (type: string) => {
    const meta: Record<string, { label: string; background: string; color: string }> = {
        article: { label: 'Artikel', background: '#eff6ff', color: '#1d4ed8' },
        video: { label: 'Video', background: '#eef2ff', color: '#4338ca' },
        quiz: { label: 'Kuis', background: '#fef3c7', color: '#92400e' },
        book: { label: 'E-book', background: '#ecfeff', color: '#155e75' }
    };

    return meta[type] || { label: 'Materi', background: '#f8fafc', color: '#475569' };
};

export const ClassMaterials: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [className, setClassName] = useState('');

    useEffect(() => {
        if (!classId) {
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await classesAPI.getDashboard(classId);
                setModules(data.class.modules);
                setClassName(data.class.name);
            } catch (err) {
                console.error('Failed to fetch materials', err);
            } finally {
                setLoading(false);
            }
        };

        void fetchData();
    }, [classId]);

    const totalMaterials = useMemo(
        () => modules.reduce((sum, module) => sum + module.materials.length, 0),
        [modules]
    );

    if (loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                Memuat materi kelas...
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <section
                className="card glass"
                style={{
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08), rgba(37, 99, 235, 0.08))',
                    border: '1px solid rgba(37, 99, 235, 0.14)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ maxWidth: '760px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: '#0369a1', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.55rem' }}>
                            <Sparkles size={16} />
                            Materi terstruktur
                        </div>
                        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>Materi {className}</h1>
                        <p style={{ color: '#475569', lineHeight: 1.65 }}>
                            Semua modul disusun supaya kamu bisa membaca materi utama lebih rapi sebelum lanjut ke latihan.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(140px, 1fr))', gap: '0.75rem', minWidth: '280px' }}>
                        <div className="card" style={{ padding: '1rem', boxShadow: 'none', border: '1px solid #dbeafe' }}>
                            <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Total modul</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{modules.length}</p>
                        </div>
                        <div className="card" style={{ padding: '1rem', boxShadow: 'none', border: '1px solid #dbeafe' }}>
                            <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Total materi</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{totalMaterials}</p>
                        </div>
                    </div>
                </div>
            </section>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Daftar modul</h2>
                    <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Masuk ke materi yang ingin kamu baca atau ulangi.</p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate(`/student/class/${classId}/exercises`)}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.85rem 1.05rem',
                        borderRadius: '0.95rem',
                        border: '1px solid rgba(37, 99, 235, 0.18)',
                        background: 'white',
                        color: '#0f172a',
                        fontWeight: 700,
                        cursor: 'pointer'
                    }}
                >
                    <PlayCircle size={16} />
                    Buka latihan kelas
                </button>
            </div>

            {modules.length === 0 ? (
                <div className="card glass" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    Belum ada materi di kelas ini.
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {modules.map((module, index) => (
                        <section key={module.id} className="card glass" style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                <div>
                                    <p style={{ color: '#2563eb', fontSize: '0.76rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                                        Modul {index + 1}
                                    </p>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{module.title}</h3>
                                </div>
                                <span style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 700 }}>{module.materials.length} materi</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
                                {module.materials.map((material) => {
                                    const meta = getMaterialMeta(material.type);

                                    return (
                                        <Link
                                            key={material.id}
                                            to={`/student/materials/${material.id}`}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.8rem',
                                                padding: '1rem',
                                                borderRadius: '1rem',
                                                textDecoration: 'none',
                                                background: 'white',
                                                border: '1px solid #e2e8f0',
                                                color: '#0f172a'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center' }}>
                                                <span style={{ padding: '0.32rem 0.58rem', borderRadius: '999px', background: meta.background, color: meta.color, fontSize: '0.72rem', fontWeight: 700 }}>
                                                    {meta.label}
                                                </span>
                                                <FileText size={16} color="#94a3b8" />
                                            </div>

                                            <div>
                                                <p style={{ fontWeight: 800, marginBottom: '0.3rem' }}>{material.title}</p>
                                                <p style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.5 }}>
                                                    Masuk untuk membaca materi dan tandai progres belajarmu.
                                                </p>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center', color: '#2563eb', fontWeight: 700 }}>
                                                <span>Buka materi</span>
                                                <ArrowRight size={16} />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClassMaterials;
