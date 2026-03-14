import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Lightbulb } from 'lucide-react';
import { GeometryCanvas } from '../../components/geometry/GeometryCanvas';

export const GeometryPractice: React.FC = () => {
    const navigate = useNavigate();
    const { classId } = useParams();
    const [activeLesson, setActiveLesson] = useState<string | null>(null);

    // Sample geometry lessons/exercises
    const lessons = [
        {
            id: '1',
            title: 'Mengenal Titik dan Garis',
            description: 'Pelajari cara menggambar titik dan garis pada bidang koordinat',
            instructions: [
                'Gunakan tool Point (titik) untuk membuat beberapa titik',
                'Hubungkan titik dengan tool Segment (segmen)',
                'Ukur jarak antara dua titik menggunakan tool Measure Distance'
            ]
        },
        {
            id: '2',
            title: 'Segitiga dan Sifatnya',
            description: 'Pelajari berbagai jenis segitiga dan propertinya',
            instructions: [
                'Gambar segitiga sama sisi dengan tool Triangle',
                'Ukur ketiga sudutnya menggunakan tool Measure Angle',
                'Perhatikan bahwa jumlah ketiga sudut = 180°'
            ]
        },
        {
            id: '3',
            title: 'Lingkaran dan Jari-jari',
            description: 'Eksplorasi lingkaran, diameter, dan jari-jari',
            instructions: [
                'Gambar lingkaran dengan tool Circle',
                'Ukur jarak dari pusat ke tepi (jari-jari)',
                'Coba gambar beberapa lingkaran dengan jari-jari berbeda'
            ]
        },
        {
            id: '4',
            title: 'Persegi dan Persegi Panjang',
            description: 'Mengenal sifat-sifat segiempat',
            instructions: [
                'Gambar persegi dengan tool Rectangle',
                'Ukur keempat sisinya dan perhatikan panjangnya',
                'Gambar persegi panjang dan bandingkan sisinya'
            ]
        },
        {
            id: '5',
            title: 'Latihan Bebas',
            description: 'Eksplorasi bebas dengan semua alat geometri',
            instructions: [
                'Gunakan semua tool yang tersedia',
                'Coba kombinasikan berbagai bentuk',
                'Ekspor hasil karyamu sebagai gambar'
            ]
        }
    ];

    return (
        <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <button 
                    onClick={() => navigate(classId ? `/student/class/${classId}` : '/student/classes')}
                    style={{
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#64748b',
                        cursor: 'pointer',
                        marginBottom: '1rem'
                    }}
                >
                    <ArrowLeft size={20} /> Kembali
                </button>
                
                <h1 style={{ 
                    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', 
                    fontWeight: '800', 
                    color: '#1e293b',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    📐 Praktik Geometri Interaktif
                </h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
                    Eksplorasi bentuk geometri dengan canvas interaktif
                </p>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 300px', 
                gap: '1.5rem',
                alignItems: 'start'
            }}>
                {/* Canvas Area */}
                <div>
                    <GeometryCanvas width={800} height={500} />
                    
                    {/* Instructions Panel */}
                    {activeLesson && (
                        <div className="card glass" style={{ 
                            marginTop: '1rem', 
                            padding: '1.5rem',
                            background: 'linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%)',
                            border: '2px solid #fbbf24'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Lightbulb size={24} color="#d97706" />
                                <h3 style={{ fontWeight: '700', color: '#92400e' }}>
                                    {lessons.find(l => l.id === activeLesson)?.title}
                                </h3>
                            </div>
                            <ol style={{ paddingLeft: '1.5rem', color: '#78350f' }}>
                                {lessons.find(l => l.id === activeLesson)?.instructions.map((inst, i) => (
                                    <li key={i} style={{ marginBottom: '0.5rem' }}>{inst}</li>
                                ))}
                            </ol>
                        </div>
                    )}
                </div>

                {/* Lessons Sidebar */}
                <div>
                    <h2 style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: '700', 
                        color: '#334155', 
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <BookOpen size={20} />
                        Panduan Latihan
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {lessons.map(lesson => (
                            <button
                                key={lesson.id}
                                onClick={() => setActiveLesson(activeLesson === lesson.id ? null : lesson.id)}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '0.75rem',
                                    border: activeLesson === lesson.id ? '2px solid var(--primary)' : '2px solid #e2e8f0',
                                    background: activeLesson === lesson.id ? '#e0e7ff' : 'white',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <h4 style={{ 
                                    fontWeight: '600', 
                                    color: activeLesson === lesson.id ? 'var(--primary)' : '#334155',
                                    marginBottom: '0.25rem',
                                    fontSize: '0.95rem'
                                }}>
                                    {lesson.title}
                                </h4>
                                <p style={{ 
                                    fontSize: '0.85rem', 
                                    color: '#64748b',
                                    lineHeight: 1.4
                                }}>
                                    {lesson.description}
                                </p>
                            </button>
                        ))}
                    </div>

                    {/* Tips */}
                    <div className="card glass" style={{ 
                        marginTop: '1.5rem', 
                        padding: '1.25rem',
                        background: '#f0fdf4',
                        border: '2px solid #86efac'
                    }}>
                        <h4 style={{ fontWeight: '600', color: '#166534', marginBottom: '0.75rem' }}>
                            💡 Tips Penggunaan
                        </h4>
                        <ul style={{ fontSize: '0.85rem', color: '#15803d', paddingLeft: '1rem' }}>
                            <li>Gunakan grid untuk menggambar lebih presisi</li>
                            <li>Zoom in/out dengan tombol +/-</li>
                            <li>Pan (geser) dengan tool Move</li>
                            <li>Undo/Redo untuk membatalkan aksi</li>
                            <li>Export untuk menyimpan gambar</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeometryPractice;
