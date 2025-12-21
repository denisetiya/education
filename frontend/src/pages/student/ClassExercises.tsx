import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PenTool, Clock, Award, Loader } from 'lucide-react';
import { classesAPI } from '../../utils/api';

interface Exercise {
    id: string;
    title: string;
    type: string;
    module: { title: string };
}

export const ClassExercises: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const [exercises, setExercises] = useState<Exercise[]>([]);
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
            setClassName(data.class.name);
            
            // Extract quiz/exercise type materials
            const allExercises: Exercise[] = [];
            data.class.modules.forEach((mod: any) => {
                mod.materials.forEach((mat: any) => {
                    if (mat.type === 'quiz') {
                        allExercises.push({
                            id: mat.id,
                            title: mat.title,
                            type: mat.type,
                            module: { title: mod.title }
                        });
                    }
                });
            });
            setExercises(allExercises);
        } catch (err) {
            console.error('Failed to fetch exercises', err);
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

    return (
        <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>
                    ✏️ Latihan & Kuis
                </h1>
                <p style={{ color: '#64748b' }}>Kelas: {className}</p>
            </div>

            {exercises.length === 0 ? (
                <div className="card glass" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    <PenTool size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>Belum ada latihan/kuis di kelas ini.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {exercises.map((exercise) => (
                        <Link
                            key={exercise.id}
                            to={`/student/practice/${exercise.id}`}
                            className="card glass"
                            style={{
                                padding: '1.5rem',
                                textDecoration: 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '1rem',
                                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <PenTool size={24} color="white" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontWeight: '700', color: '#334155', marginBottom: '0.25rem' }}>
                                        {exercise.title}
                                    </h3>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                        {exercise.module.title}
                                    </p>
                                </div>
                            </div>
                            
                            <div style={{
                                marginTop: '1rem',
                                display: 'flex',
                                gap: '1rem',
                                fontSize: '0.85rem',
                                color: '#64748b'
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <Clock size={14} /> ~10 menit
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <Award size={14} /> +50 XP
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClassExercises;
