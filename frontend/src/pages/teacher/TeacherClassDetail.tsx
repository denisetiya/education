import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeft, Users, BookOpen, Settings, Copy, Plus,
    Award, BarChart3, Clock, ExternalLink, FileText, X
} from 'lucide-react';
import { classesAPI, modulesAPI } from '../../utils/api';

interface ClassData {
    id: string;
    name: string;
    subject: string;
    description: string;
    code: string;
    isPublic: boolean;
    progressionMode: string;
    xpMultiplier: number;
    _count?: {
        students: number;
        modules: number;
    };
    modules?: Array<{
        id: string;
        title: string;
        order: number;
        _count?: { materials: number };
    }>;
    students?: Array<{
        student: {
            id: string;
            name: string;
            email: string;
        };
        joinedAt: string;
    }>;
}

interface ModuleItem {
    id: string;
    title: string;
    description?: string;
    materials: Array<{ id: string; title: string; type: string }>;
}

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    xpReward: number;
    condition: string;
    unlockedCount?: number;
}

export const TeacherClassDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [classData, setClassData] = useState<ClassData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'students' | 'settings'>('overview');
    const [success, setSuccess] = useState<string | null>(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [unassignedModules, setUnassignedModules] = useState<ModuleItem[]>([]);
    const [classModules, setClassModules] = useState<ModuleItem[]>([]);
    const [loadingModules, setLoadingModules] = useState(false);
    
    // Achievements state
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loadingAchievements, setLoadingAchievements] = useState(false);
    const [showAchievementModal, setShowAchievementModal] = useState(false);
    const [newAchievement, setNewAchievement] = useState({
        title: '',
        description: '',
        icon: '🏆',
        xpReward: 50,
        conditionType: 'complete_materials',
        conditionTarget: 5
    });

    useEffect(() => {
        if (id) fetchClassData();
    }, [id]);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const fetchClassData = async () => {
        try {
            const data = await classesAPI.getById(id!) as ClassData;
            setClassData(data);
        } catch (error) {
            console.error('Failed to fetch class', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchModules = async () => {
        if (!id) return;
        setLoadingModules(true);
        try {
            const [assigned, unassigned] = await Promise.all([
                modulesAPI.getByClass(id),
                modulesAPI.getUnassigned()
            ]);
            setClassModules(assigned as ModuleItem[]);
            setUnassignedModules(unassigned as ModuleItem[]);
        } catch (error) {
            console.error('Failed to fetch modules', error);
        } finally {
            setLoadingModules(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'curriculum' && id) {
            fetchModules();
        }
    }, [activeTab, id]);

    const handleAssignModule = async (moduleId: string) => {
        if (!id) return;
        try {
            await modulesAPI.assignToClass(moduleId, id);
            setSuccess('Modul berhasil ditambahkan ke kelas!');
            fetchModules();
            fetchClassData();
        } catch (error) {
            console.error('Failed to assign module', error);
        }
    };

    const handleUnassignModule = async (moduleId: string) => {
        try {
            await modulesAPI.assignToClass(moduleId, null);
            setSuccess('Modul dihapus dari kelas');
            fetchModules();
            fetchClassData();
        } catch (error) {
            console.error('Failed to unassign module', error);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setSuccess('Kode kelas disalin!');
    };

    const handleUpdateSettings = async (newMode: string) => {
        if (!id || !classData) return;
        try {
            await classesAPI.updateSettings(id, { progressionMode: newMode });
            setClassData({ ...classData, progressionMode: newMode });
            setSuccess(`Mode pembelajaran diubah ke ${newMode === 'sequential' ? 'Sequential' : 'Free Access'}!`);
        } catch (error) {
            console.error('Failed to update settings', error);
        }
    };

    const fetchAchievements = async () => {
        if (!id) return;
        setLoadingAchievements(true);
        try {
            const data = await classesAPI.getAchievements(id);
            setAchievements(data as Achievement[]);
        } catch (error) {
            console.error('Failed to fetch achievements', error);
        } finally {
            setLoadingAchievements(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'settings' && id) {
            fetchAchievements();
        }
    }, [activeTab, id]);

    const handleCreateAchievement = async () => {
        if (!id) return;
        try {
            const condition = JSON.stringify({
                type: newAchievement.conditionType,
                target: newAchievement.conditionTarget
            });
            await classesAPI.createAchievement(id, {
                title: newAchievement.title,
                description: newAchievement.description,
                icon: newAchievement.icon,
                xpReward: newAchievement.xpReward,
                condition
            });
            setSuccess('Achievement berhasil dibuat!');
            setShowAchievementModal(false);
            setNewAchievement({
                title: '',
                description: '',
                icon: '🏆',
                xpReward: 50,
                conditionType: 'complete_materials',
                conditionTarget: 5
            });
            fetchAchievements();
        } catch (error) {
            console.error('Failed to create achievement', error);
        }
    };
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="animate-pulse" style={{ fontSize: '2rem', marginBottom: '1rem' }}>📚</div>
                    <p style={{ color: '#64748b' }}>Memuat data kelas...</p>
                </div>
            </div>
        );
    }

    if (!classData) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: '#64748b' }}>Kelas tidak ditemukan</p>
                <button onClick={() => navigate('/teacher/classes')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    Kembali ke Daftar Kelas
                </button>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Ringkasan', icon: <BarChart3 size={18} /> },
        { id: 'curriculum', label: 'Kurikulum', icon: <BookOpen size={18} /> },
        { id: 'students', label: 'Siswa', icon: <Users size={18} /> },
        { id: 'settings', label: 'Pengaturan', icon: <Settings size={18} /> }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div className="animate-slide-up">
                <button 
                    onClick={() => navigate('/teacher/classes')}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.5rem', 
                        color: '#64748b', marginBottom: '1rem', background: 'none', 
                        border: 'none', cursor: 'pointer', fontSize: '0.9rem'
                    }}
                >
                    <ArrowLeft size={18} /> Kembali ke Daftar Kelas
                </button>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>
                            {classData.name}
                        </h1>
                        <p style={{ color: '#64748b' }}>{classData.subject || 'Umum'}</p>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div 
                            onClick={() => copyToClipboard(classData.code)}
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                background: '#f1f5f9', padding: '0.75rem 1rem', 
                                borderRadius: '0.75rem', cursor: 'pointer'
                            }}
                        >
                            <span style={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                {classData.code}
                            </span>
                            <Copy size={16} color="#64748b" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="card glass" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                            width: '48px', height: '48px', borderRadius: '12px', 
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Users size={24} color="white" />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Siswa</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{classData._count?.students || 0}</p>
                        </div>
                    </div>
                </div>
                
                <div className="card glass" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                            width: '48px', height: '48px', borderRadius: '12px', 
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <BookOpen size={24} color="white" />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Modul</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{classData._count?.modules || 0}</p>
                        </div>
                    </div>
                </div>
                
                <div className="card glass" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                            width: '48px', height: '48px', borderRadius: '12px', 
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Award size={24} color="white" />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>XP Multiplier</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{classData.xpMultiplier || 1}x</p>
                        </div>
                    </div>
                </div>
                
                <div className="card glass" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                            width: '48px', height: '48px', borderRadius: '12px', 
                            background: classData.isPublic ? 'linear-gradient(135deg, #06b6d4, #0891b2)' : 'linear-gradient(135deg, #94a3b8, #64748b)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Clock size={24} color="white" />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Status</p>
                            <p style={{ fontSize: '1rem', fontWeight: '600' }}>
                                {classData.isPublic ? '🌐 Publik' : '🔒 Privat'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: activeTab === tab.id ? 'var(--primary)' : '#64748b',
                            fontWeight: activeTab === tab.id ? '600' : '500',
                            borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                            marginBottom: '-2px',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="card glass" style={{ padding: '1.5rem', minHeight: '300px' }}>
                {activeTab === 'overview' && (
                    <div>
                        <h3 style={{ marginBottom: '1rem', fontWeight: '600' }}>Deskripsi Kelas</h3>
                        <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                            {classData.description || 'Belum ada deskripsi untuk kelas ini.'}
                        </p>
                        
                        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', fontWeight: '600' }}>Mode Pembelajaran</h3>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button 
                                onClick={() => handleUpdateSettings('sequential')}
                                style={{ 
                                    flex: 1, padding: '1.25rem', background: '#f8fafc', borderRadius: '0.75rem',
                                    border: classData.progressionMode === 'sequential' ? '2px solid var(--primary)' : '2px solid #e2e8f0',
                                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                                }}
                            >
                                <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>📚 Sequential</p>
                                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Siswa harus menyelesaikan materi secara berurutan</p>
                            </button>
                            <button 
                                onClick={() => handleUpdateSettings('free')}
                                style={{ 
                                    flex: 1, padding: '1.25rem', background: '#f8fafc', borderRadius: '0.75rem',
                                    border: classData.progressionMode === 'free' ? '2px solid var(--primary)' : '2px solid #e2e8f0',
                                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                                }}
                            >
                                <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>🎯 Free Access</p>
                                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Siswa bebas memilih materi apapun</p>
                            </button>
                        </div>
                        
                        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', fontWeight: '600' }}>Visibilitas Kelas</h3>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button 
                                onClick={async () => {
                                    if (!classData.isPublic) {
                                        await classesAPI.updateSettings(id!, { isPublic: true });
                                        setClassData({ ...classData, isPublic: true });
                                        setSuccess('Kelas sekarang bisa ditemukan oleh siswa di halaman Discover!');
                                    }
                                }}
                                style={{ 
                                    flex: 1, padding: '1.25rem', background: '#f8fafc', borderRadius: '0.75rem',
                                    border: classData.isPublic ? '2px solid #10b981' : '2px solid #e2e8f0',
                                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                                }}
                            >
                                <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>🌐 Publik</p>
                                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Kelas terlihat di halaman Discover siswa</p>
                            </button>
                            <button 
                                onClick={async () => {
                                    if (classData.isPublic) {
                                        await classesAPI.updateSettings(id!, { isPublic: false });
                                        setClassData({ ...classData, isPublic: false });
                                        setSuccess('Kelas sekarang privat - hanya bisa join dengan kode');
                                    }
                                }}
                                style={{ 
                                    flex: 1, padding: '1.25rem', background: '#f8fafc', borderRadius: '0.75rem',
                                    border: !classData.isPublic ? '2px solid #6366f1' : '2px solid #e2e8f0',
                                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                                }}
                            >
                                <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>🔒 Privat</p>
                                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Hanya bisa bergabung dengan kode kelas</p>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'curriculum' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontWeight: '600' }}>Kurikulum Kelas</h3>
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Kelola modul dan materi pembelajaran untuk kelas ini</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button 
                                    onClick={() => setShowAssignModal(true)}
                                    className="btn btn-secondary"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <Plus size={18} /> Assign Modul
                                </button>
                                <Link 
                                    to="/teacher/curriculum"
                                    className="btn btn-primary"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <ExternalLink size={18} /> Penyusun Kurikulum
                                </Link>
                            </div>
                        </div>
                        
                        {loadingModules ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                Memuat modul...
                            </div>
                        ) : classModules.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {classModules.map((module, index) => (
                                    <div 
                                        key={module.id}
                                        style={{ 
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '1rem 1.25rem', background: '#f8fafc', borderRadius: '0.75rem',
                                            borderLeft: '4px solid var(--primary)',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ 
                                                width: '36px', height: '36px', borderRadius: '10px',
                                                background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 'bold', fontSize: '0.9rem'
                                            }}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{module.title}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                                                        <FileText size={14} /> {module.materials?.length || 0} materi
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <button 
                                                onClick={() => handleUnassignModule(module.id)}
                                                style={{ padding: '0.5rem', color: '#ef4444', borderRadius: '0.5rem', background: 'white', border: '1px solid #fecaca', cursor: 'pointer' }}
                                                title="Hapus dari kelas"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '1rem', border: '2px dashed #cbd5e1' }}>
                                <BookOpen size={48} style={{ marginBottom: '1rem', color: '#94a3b8' }} />
                                <p style={{ color: '#64748b', marginBottom: '1rem' }}>Belum ada modul untuk kelas ini</p>
                                <button 
                                    onClick={() => setShowAssignModal(true)}
                                    className="btn btn-primary"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <Plus size={16} /> Assign Modul dari Kurikulum
                                </button>
                            </div>
                        )}
                        
                        {/* Info Card */}
                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#eff6ff', borderRadius: '0.75rem', border: '1px solid #bfdbfe' }}>
                            <p style={{ fontSize: '0.9rem', color: '#1e40af' }}>
                                💡 <strong>Tip:</strong> Buat modul di halaman Penyusun Kurikulum, lalu assign ke kelas ini menggunakan tombol "Assign Modul".
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'students' && (
                    <div>
                        <h3 style={{ fontWeight: '600', marginBottom: '1.5rem' }}>Daftar Siswa ({classData._count?.students || 0})</h3>
                        
                        {classData.students && classData.students.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {classData.students.map((enrollment) => (
                                    <div 
                                        key={enrollment.student.id}
                                        style={{ 
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '1rem 1.25rem', background: '#f8fafc', borderRadius: '0.75rem'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ 
                                                width: '40px', height: '40px', borderRadius: '50%',
                                                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white', fontWeight: 'bold'
                                            }}>
                                                {enrollment.student.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: '600' }}>{enrollment.student.name}</p>
                                                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{enrollment.student.email}</p>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                            Bergabung: {new Date(enrollment.joinedAt).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>Belum ada siswa yang bergabung.</p>
                                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                    Bagikan kode <strong>{classData.code}</strong> kepada siswa
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontWeight: '600' }}>Achievements Kelas</h3>
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Buat pencapaian yang bisa diraih siswa</p>
                            </div>
                            <button 
                                onClick={() => setShowAchievementModal(true)}
                                className="btn btn-primary"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Plus size={18} /> Buat Achievement
                            </button>
                        </div>
                        
                        {loadingAchievements ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                Memuat achievements...
                            </div>
                        ) : achievements.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                {achievements.map(ach => (
                                    <div 
                                        key={ach.id}
                                        className="card"
                                        style={{ 
                                            padding: '1.25rem', background: '#f8fafc', 
                                            border: '1px solid #e2e8f0', borderRadius: '1rem'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                            <div style={{ 
                                                fontSize: '2rem', width: '48px', height: '48px', 
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                                                borderRadius: '12px'
                                            }}>
                                                {ach.icon}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{ach.title}</h4>
                                                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>{ach.description}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <span style={{ 
                                                        fontSize: '0.8rem', padding: '0.25rem 0.5rem', 
                                                        background: '#dbeafe', color: '#1e40af', borderRadius: '0.25rem' 
                                                    }}>
                                                        +{ach.xpReward} XP
                                                    </span>
                                                    {ach.unlockedCount !== undefined && (
                                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                            {ach.unlockedCount} siswa unlock
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '1rem', border: '2px dashed #cbd5e1' }}>
                                <Award size={48} style={{ marginBottom: '1rem', color: '#94a3b8' }} />
                                <p style={{ color: '#64748b', marginBottom: '1rem' }}>Belum ada achievement untuk kelas ini</p>
                                <button 
                                    onClick={() => setShowAchievementModal(true)}
                                    className="btn btn-primary"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <Plus size={16} /> Buat Achievement Pertama
                                </button>
                            </div>
                        )}
                        
                        {/* Info Card */}
                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fefce8', borderRadius: '0.75rem', border: '1px solid #fef08a' }}>
                            <p style={{ fontSize: '0.9rem', color: '#854d0e' }}>
                                🏆 <strong>Tip:</strong> Achievement otomatis diberikan saat siswa memenuhi syarat (menyelesaikan materi, skor kuis, dll).
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Assign Module Modal */}
            {showAssignModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="card glass" style={{ width: '500px', maxHeight: '80vh', padding: '2rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontWeight: '700' }}>Assign Modul ke Kelas</h2>
                            <button onClick={() => setShowAssignModal(false)} style={{ padding: '0.5rem', cursor: 'pointer', background: 'none', border: 'none' }}>
                                <X size={20} color="#64748b" />
                            </button>
                        </div>
                        
                        {unassignedModules.length > 0 ? (
                            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                    Pilih modul untuk ditambahkan ke kelas ini:
                                </p>
                                {unassignedModules.map(module => (
                                    <div 
                                        key={module.id}
                                        style={{ 
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem',
                                            border: '1px solid #e2e8f0'
                                        }}
                                    >
                                        <div>
                                            <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{module.title}</p>
                                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                {module.materials?.length || 0} materi
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => handleAssignModule(module.id)}
                                            className="btn btn-primary"
                                            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                        >
                                            <Plus size={16} style={{ marginRight: '0.25rem' }} /> Assign
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p style={{ marginBottom: '1rem' }}>Tidak ada modul yang tersedia untuk di-assign.</p>
                                <p style={{ fontSize: '0.9rem' }}>
                                    Buat modul baru di halaman <Link to="/teacher/curriculum" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Penyusun Kurikulum</Link>
                                </p>
                            </div>
                        )}
                        
                        <button 
                            onClick={() => setShowAssignModal(false)}
                            className="btn btn-secondary"
                            style={{ marginTop: '1rem', width: '100%' }}
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}

            {/* Create Achievement Modal */}
            {showAchievementModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="card glass" style={{ width: '500px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontWeight: '700' }}>Buat Achievement</h2>
                            <button onClick={() => setShowAchievementModal(false)} style={{ padding: '0.5rem', cursor: 'pointer', background: 'none', border: 'none' }}>
                                <X size={20} color="#64748b" />
                            </button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: '0 0 80px' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Icon</label>
                                    <select 
                                        value={newAchievement.icon}
                                        onChange={(e) => setNewAchievement({...newAchievement, icon: e.target.value})}
                                        className="form-input"
                                        style={{ padding: '0.75rem', fontSize: '1.5rem', textAlign: 'center' }}
                                    >
                                        <option value="🏆">🏆</option>
                                        <option value="⭐">⭐</option>
                                        <option value="🎯">🎯</option>
                                        <option value="🔥">🔥</option>
                                        <option value="💎">💎</option>
                                        <option value="🎖️">🎖️</option>
                                        <option value="🏅">🏅</option>
                                        <option value="🌟">🌟</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Judul Achievement</label>
                                    <input 
                                        type="text"
                                        value={newAchievement.title}
                                        onChange={(e) => setNewAchievement({...newAchievement, title: e.target.value})}
                                        className="form-input"
                                        placeholder="contoh: Pelajar Rajin"
                                        style={{ width: '100%', padding: '0.75rem' }}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Deskripsi</label>
                                <input 
                                    type="text"
                                    value={newAchievement.description}
                                    onChange={(e) => setNewAchievement({...newAchievement, description: e.target.value})}
                                    className="form-input"
                                    placeholder="contoh: Selesaikan 5 materi pembelajaran"
                                    style={{ width: '100%', padding: '0.75rem' }}
                                />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Syarat</label>
                                    <select 
                                        value={newAchievement.conditionType}
                                        onChange={(e) => setNewAchievement({...newAchievement, conditionType: e.target.value})}
                                        className="form-input"
                                        style={{ width: '100%', padding: '0.75rem' }}
                                    >
                                        <option value="complete_materials">Selesaikan Materi</option>
                                        <option value="quiz_score">Skor Kuis Minimal</option>
                                        <option value="complete_module">Selesaikan Modul</option>
                                    </select>
                                </div>
                                <div style={{ flex: '0 0 100px' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Target</label>
                                    <input 
                                        type="number"
                                        value={newAchievement.conditionTarget}
                                        onChange={(e) => setNewAchievement({...newAchievement, conditionTarget: parseInt(e.target.value) || 0})}
                                        className="form-input"
                                        min="1"
                                        style={{ width: '100%', padding: '0.75rem' }}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Reward XP</label>
                                <input 
                                    type="number"
                                    value={newAchievement.xpReward}
                                    onChange={(e) => setNewAchievement({...newAchievement, xpReward: parseInt(e.target.value) || 0})}
                                    className="form-input"
                                    min="0"
                                    style={{ width: '100%', padding: '0.75rem' }}
                                />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button 
                                    onClick={() => setShowAchievementModal(false)}
                                    className="btn btn-secondary"
                                    style={{ flex: 1 }}
                                >
                                    Batal
                                </button>
                                <button 
                                    onClick={handleCreateAchievement}
                                    className="btn btn-primary"
                                    style={{ flex: 1 }}
                                    disabled={!newAchievement.title || !newAchievement.description}
                                >
                                    Buat Achievement
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {success && (
                <div style={{
                    position: 'fixed', bottom: '2rem', right: '2rem',
                    background: '#10b981', color: 'white',
                    padding: '1rem 1.5rem', borderRadius: '0.75rem',
                    boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    animation: 'slideUp 0.3s ease-out', zIndex: 1100
                }}>
                    ✓ {success}
                </div>
            )}
        </div>
    );
};
