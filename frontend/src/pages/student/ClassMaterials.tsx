import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Play, CheckCircle, Lock, Loader, BookOpen } from 'lucide-react';
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

export const ClassMaterials: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [className, setClassName] = useState('');

    useEffect(() => {
        if (classId) {
            fetchData();
        }
    }, [classId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await classesAPI.getDashboard(classId!);
            setModules(data.class.modules);
            setClassName(data.class.name);
        } catch (err) {
            console.error('Failed to fetch materials', err);
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video': return '🎥';
            case 'book': return '📖';
            case 'quiz': return '📝';
            case 'article': return '📄';
            default: return '📚';
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader className="animate-spin" size={48} style={{ color: 'var(--primary)' }} />
            </div>
        );
    }

    return (
        <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>
                    📚 Materi Pembelajaran
                </h1>
                <p style={{ color: '#64748b' }}>Kelas: {className}</p>
            </div>

            {modules.length === 0 ? (
                <div className="card glass" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>Belum ada materi di kelas ini.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {modules.map((module, modIdx) => (
                        <div key={module.id} className="card glass" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#334155', marginBottom: '1rem' }}>
                                Modul {modIdx + 1}: {module.title}
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {module.materials.map((material) => (
                                    <Link
                                        key={material.id}
                                        to={`/student/materials/${material.id}`}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '1rem',
                                            background: 'white',
                                            borderRadius: '0.75rem',
                                            border: '2px solid #e2e8f0',
                                            textDecoration: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.5rem' }}>{getTypeIcon(material.type)}</span>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: '600', color: '#334155' }}>{material.title}</p>
                                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                                            </p>
                                        </div>
                                        <FileText size={20} color="#64748b" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClassMaterials;
