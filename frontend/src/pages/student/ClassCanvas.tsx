import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Hexagon, Loader, AlertCircle } from 'lucide-react';
import { classesAPI } from '../../utils/api';
import { GeometryCanvas } from '../../components/geometry/GeometryCanvas';

export const ClassCanvas: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [className, setClassName] = useState('');
    const [geogebraEnabled, setGeogebraEnabled] = useState(false);

    useEffect(() => {
        if (classId) {
            fetchClassData();
        }
    }, [classId]);

    const fetchClassData = async () => {
        try {
            setLoading(true);
            const data = await classesAPI.getDashboard(classId!);
            setClassName(data.class.name);
            // Check if geogebra is enabled for this class
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

    return (
        <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>
                    🔷 Canvas Geometri
                </h1>
                <p style={{ color: '#64748b' }}>Kelas: {className}</p>
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
                    <li>Pilih tool dari toolbar untuk menggambar bentuk</li>
                    <li>Gunakan <strong>Ruler</strong> untuk mengukur jarak</li>
                    <li>Gunakan <strong>Angle</strong> untuk mengukur sudut</li>
                    <li>Klik <strong>Export</strong> untuk menyimpan gambar</li>
                </ul>
            </div>
        </div>
    );
};

export default ClassCanvas;
