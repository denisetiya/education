import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, AlertCircle, Maximize2, Minimize2, X } from 'lucide-react';
import { classesAPI } from '../../utils/api';
import { GeometryCanvas } from '../../components/geometry/GeometryCanvas';

export const ClassCanvas: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [className, setClassName] = useState('');
    const [geogebraEnabled, setGeogebraEnabled] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        if (classId) {
            fetchClassData();
        }
    }, [classId]);

    // Prevent body scroll when fullscreen
    useEffect(() => {
        if (isFullscreen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isFullscreen]);

    // Handle escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isFullscreen]);

    const fetchClassData = async () => {
        try {
            setLoading(true);
            const data = await classesAPI.getDashboard(classId!);
            setClassName(data.class.name);
            setGeogebraEnabled(data.class.geogebraEnabled ?? false);
        } catch (err) {
            console.error('Failed to fetch class data', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader className="animate-spin" size={48} style={{ color: 'var(--primary)' }} />
            </div>
        );
    }

    if (!geogebraEnabled) {
        return (
            <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div className="card glass" style={{ padding: '3rem', textAlign: 'center' }}>
                    <AlertCircle size={48} style={{ marginBottom: '1rem', color: '#f59e0b' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>
                        Canvas Geometri Tidak Aktif
                    </h2>
                    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                        Guru belum mengaktifkan fitur Canvas Geometri untuk kelas ini.
                    </p>
                    <button
                        onClick={() => navigate(`/student/class/${classId}`)}
                        className="btn btn-primary"
                    >
                        Kembali ke Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Fullscreen overlay mode
    if (isFullscreen) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                background: '#f8fafc',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Minimal Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'white',
                    borderBottom: '1px solid #e2e8f0',
                    flexShrink: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>🔷</span>
                        <span style={{ fontWeight: '600', color: '#1e293b' }}>Canvas Geometri</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>• {className}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setIsFullscreen(false)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #e2e8f0',
                                background: 'white',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                color: '#64748b'
                            }}
                        >
                            <Minimize2 size={16} />
                            Exit Fullscreen
                        </button>
                        <button
                            onClick={() => setIsFullscreen(false)}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '0.5rem',
                                border: 'none',
                                background: '#fee2e2',
                                color: '#dc2626',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
                
                {/* Full canvas area */}
                <div style={{ flex: 1, padding: '0.75rem', overflow: 'hidden' }}>
                    <GeometryCanvas 
                        width={window.innerWidth - 24}
                        height={window.innerHeight - 80}
                    />
                </div>
            </div>
        );
    }

    // Normal mode
    return (
        <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '1.5rem' 
            }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>
                        🔷 Canvas Geometri
                    </h1>
                    <p style={{ color: '#64748b' }}>Kelas: {className}</p>
                </div>
                <button
                    onClick={() => setIsFullscreen(true)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        background: 'linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                    }}
                >
                    <Maximize2 size={18} />
                    Mode Fullscreen
                </button>
            </div>

            <div className="card glass" style={{ padding: '0.5rem', overflow: 'hidden' }}>
                <GeometryCanvas 
                    width={1200}
                    height={600}
                />
            </div>

            <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: '#f0f9ff',
                borderRadius: '0.75rem',
                border: '1px solid #bae6fd'
            }}>
                <h3 style={{ fontWeight: '600', color: '#0369a1', marginBottom: '0.5rem' }}>
                    💡 Tips Menggunakan Canvas
                </h3>
                <ul style={{ color: '#0369a1', fontSize: '0.9rem', paddingLeft: '1.25rem' }}>
                    <li>Klik <strong>Mode Fullscreen</strong> untuk layar penuh</li>
                    <li>Masukkan rumus di panel <strong>Grafik Fungsi</strong> (contoh: x^2, sin(x))</li>
                    <li>Gunakan <strong>Ruler</strong> untuk mengukur jarak</li>
                    <li>Tekan <strong>ESC</strong> untuk keluar dari fullscreen</li>
                </ul>
            </div>
        </div>
    );
};

export default ClassCanvas;
