import React, { useState, useEffect } from 'react';
import { Plus, FileText, Video, HelpCircle, Trash, BookOpen, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';
import { modulesAPI, materialsAPI } from '../../utils/api';

// Interface definitions
interface ModuleItem {
    id: string;
    title: string;
    description?: string;
    grade: number;
    semester: number;
    subject: string;
    order: number;
    materials: any[];
}

interface MaterialItem {
    id: string;
    title: string;
    type: string;
}

export const TeacherCurriculum: React.FC = () => {
    const [modules, setModules] = useState<ModuleItem[]>([]);
    const [libraryMaterials, setLibraryMaterials] = useState<MaterialItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // New Module Form State
    const [newModule, setNewModule] = useState({
        title: '',
        description: '',
        grade: 10,
        semester: 1,
        subject: 'MATEMATIKA'
    });

    const refreshData = async () => {
        setLoading(true);
        try {
            const [modulesData, materialsData] = await Promise.all([
                modulesAPI.getAll(),
                materialsAPI.getAll()
            ]);
            setModules(modulesData);
            setLibraryMaterials(materialsData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const handleCreateModule = async () => {
        try {
            await modulesAPI.create({
                ...newModule,
                order: modules.length // Append to end
            });
            setShowCreateModal(false);
            refreshData();
            // Reset form
            setNewModule({ title: '', description: '', grade: 10, semester: 1, subject: 'MATEMATIKA' });
        } catch (error) {
            console.error("Failed to create module", error);
            alert("Gagal membuat modul");
        }
    };

    const handleDeleteModule = async (id: string) => {
        if (!confirm("Hapus modul ini? Materi di dalamnya tidak akan terhapus dari sistem, hanya dilepas dari modul.")) return;
        try {
            await modulesAPI.delete(id);
            refreshData();
        } catch (error) {
            console.error("Failed to delete module", error);
        }
    };

    const handleAddMaterialToModule = async (moduleId: string, materialId: string) => {
        try {
            const module = modules.find(m => m.id === moduleId);
            if (!module) return;

            // Current materials in this module
            const currentMaterialIds = module.materials.map(m => m.id);
            // Check if already exists
            if (currentMaterialIds.includes(materialId)) {
                alert("Materi ini sudah ada di modul tersebut.");
                return;
            }

            // Append new material
            const updatedIds = [...currentMaterialIds, materialId];
            await modulesAPI.assignMaterials(moduleId, updatedIds);
            refreshData();
        } catch (error) {
           console.error("Failed to add material", error);
        }
    };

    const handleRemoveMaterialFromModule = async (moduleId: string, materialId: string) => {
         try {
            // Optimistic update or just refetch. Using specific delete endpoint.
            // But API definition might need adjustment or we use assignMaterials with filtered list.
            // Using the delete endpoint defined in routes: DELETE /:moduleId/materials/:materialId
            
            // Wait, I defined specific DELETE endpoint in backend. Let's use it directly via generic fetch if not in API wrapper?
            // Actually, I put `delete: (id) => ...` in wrapper but that is for module delete.
            // I forgot to add specific `removeMaterial` to modulesAPI in api.ts? 
            // Let's check api.ts later. For now, re-assigning with filtered list is safest using `assignMaterials`.
            
            const module = modules.find(m => m.id === moduleId);
            if (!module) return;
            const updatedIds = module.materials.filter(m => m.id !== materialId).map(m => m.id);
            await modulesAPI.assignMaterials(moduleId, updatedIds);
            refreshData();
        } catch (error) {
            console.error("Failed to remove material", error);
        }
    };

    const handleReorderModule = async (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === modules.length - 1)) return;
        
        const newModules = [...modules];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        
        [newModules[index], newModules[swapIndex]] = [newModules[swapIndex], newModules[index]];
        
        setModules(newModules); // Optimistic UI
        
        try {
            await modulesAPI.reorder(newModules.map(m => m.id));
        } catch (error) {
            console.error("Failed to reorder", error);
            refreshData(); // Revert on error
        }
    };

    // Drag-and-drop handler for Toolbox -> Module could be complex. 
    // Simplified: "Add" button in helper tool or drag icon?
    // Let's implement Drag Start on Library Item and Drop on Module.
    
    const handleDragStart = (e: React.DragEvent, materialId: string) => {
        e.dataTransfer.setData("materialId", materialId);
    };

    const handleDrop = async (e: React.DragEvent, moduleId: string) => {
        e.preventDefault();
        const materialId = e.dataTransfer.getData("materialId");
        if (materialId) {
            await handleAddMaterialToModule(moduleId, materialId);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
            <div className="animate-slide-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b' }}>Penyusun Kurikulum</h1>
                    <p style={{ color: '#64748b' }}>Susun materi pembelajaran secara terstruktur.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={refreshData} className="btn btn-secondary" title="Refresh">
                        <RefreshCw size={18} />
                    </button>
                    <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
                        <Plus size={18} /> Tambah Modul
                    </button>
                </div>
            </div>

            {loading ? (
                 <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>
            ) : (
                <div className="animate-slide-up" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', animationDelay: '0.1s' }}>

                    {/* Editor Canvas */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {modules.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed #cbd5e1', borderRadius: '1rem', color: '#94a3b8' }}>
                                <p>Belum ada modul. Silakan buat modul baru.</p>
                            </div>
                        ) : modules.map((module, index) => (
                            <div 
                                key={module.id} 
                                className="card glass" 
                                style={{ padding: '0', overflow: 'hidden', borderLeft: '4px solid var(--primary)' }}
                                onDrop={(e) => handleDrop(e, module.id)}
                                onDragOver={handleDragOver}
                            >
                                {/* Module Header */}
                                <div style={{ padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.5)', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <button onClick={() => handleReorderModule(index, 'up')} disabled={index === 0} style={{ opacity: index === 0 ? 0.3 : 1, cursor: 'pointer' }}><ChevronUp size={16} /></button>
                                            <button onClick={() => handleReorderModule(index, 'down')} disabled={index === modules.length - 1} style={{ opacity: index === modules.length - 1 ? 0.3 : 1, cursor: 'pointer' }}><ChevronDown size={16} /></button>
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{module.title}</h3>
                                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{module.description} • Sem {module.semester}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleDeleteModule(module.id)} style={{ color: '#ef4444', padding: '0.4rem', borderRadius: '4px' }} title="Hapus Modul"><Trash size={18} /></button>
                                    </div>
                                </div>

                                {/* Module Items */}
                                <div style={{ padding: '1.5rem', background: '#f8fafc', minHeight: '100px' }}>
                                    {module.materials.length === 0 ? (
                                        <div style={{ border: '2px dashed #cbd5e1', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                                            <p>Drop materi dari Library di sini</p>
                                        </div>
                                    ) : (
                                        module.materials.map((item) => (
                                            <div key={item.id} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                padding: '1rem',
                                                marginBottom: '0.8rem',
                                                background: 'white',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '0.75rem',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                            }}>
                                                <div style={{
                                                    padding: '0.6rem',
                                                    borderRadius: '0.5rem',
                                                    background: item.type === 'video' ? '#eff6ff' : item.type === 'quiz' ? '#fef2f2' : '#f0fdf4',
                                                    color: item.type === 'video' ? '#2563eb' : item.type === 'quiz' ? '#dc2626' : '#166534'
                                                }}>
                                                    {item.type === 'video' ? <Video size={18} /> : item.type === 'quiz' ? <HelpCircle size={18} /> : item.type === 'book' ? <BookOpen size={18} /> : <FileText size={18} />}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>{item.title}</p>
                                                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'capitalize' }}>{item.type}</p>
                                                </div>
                                                <button onClick={() => handleRemoveMaterialFromModule(module.id, item.id)} style={{ color: '#cbd5e1', padding: '0.4rem' }} className="hover:text-red-500">
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Toolbox Sidebar (Library) */}
                    <div style={{ position: 'sticky', top: '2rem', height: 'fit-content' }}>
                        <div className="card glass" style={{ padding: '1.5rem', maxHeight: '80vh', overflowY: 'auto' }}>
                            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: '700' }}>Library Materi</h3>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Drag materi ke dalam modul.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {libraryMaterials.map(mat => (
                                    <div 
                                        key={mat.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, mat.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '1rem',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '0.75rem',
                                            cursor: 'grab',
                                            background: 'white',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                                            transition: 'all 0.2s'
                                        }}
                                        className="hover:border-primary"
                                    >
                                         <div style={{
                                            padding: '0.5rem',
                                            borderRadius: '0.4rem',
                                            background: mat.type === 'video' ? '#eff6ff' : mat.type === 'quiz' ? '#fef2f2' : '#f0fdf4',
                                            color: mat.type === 'video' ? '#2563eb' : mat.type === 'quiz' ? '#dc2626' : '#166534'
                                        }}>
                                            {mat.type === 'video' ? <Video size={16} /> : mat.type === 'quiz' ? <HelpCircle size={16} /> : mat.type === 'book' ? <BookOpen size={16} /> : <FileText size={16} />}
                                        </div>
                                        <div style={{ overflow: 'hidden' }}>
                                            <p style={{ fontWeight: '600', fontSize: '0.9rem', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mat.title}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* Create Module Modal */}
            {showCreateModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 50,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="card" style={{ width: '400px', background: 'white' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Buat Modul Baru</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Judul Modul</label>
                                <input 
                                    type="text" 
                                    className="input" 
                                    value={newModule.title} 
                                    onChange={e => setNewModule({...newModule, title: e.target.value})}
                                    placeholder="Contoh: Bab 1 - Aljabar"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Deskripsi</label>
                                <input 
                                    type="text" 
                                    className="input" 
                                    value={newModule.description} 
                                    onChange={e => setNewModule({...newModule, description: e.target.value})}
                                    placeholder="Singkat tentang modul ini"
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Semester</label>
                                    <select 
                                        className="input" 
                                        value={newModule.semester}
                                        onChange={e => setNewModule({...newModule, semester: Number(e.target.value)})}
                                    >
                                        <option value={1}>1</option>
                                        <option value={2}>2</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Mata Pelajaran</label>
                                    <select 
                                        className="input" 
                                        value={newModule.subject}
                                        onChange={e => setNewModule({...newModule, subject: e.target.value})}
                                    >
                                        <option value="MATEMATIKA">Matematika</option>
                                        <option value="IPA">IPA</option>
                                        <option value="IPS">IPS</option>
                                        <option value="BAHASA_INDONESIA">B. Indonesia</option>
                                        <option value="BAHASA_INGGRIS">B. Inggris</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)} style={{ flex: 1 }}>Batal</button>
                                <button className="btn btn-primary" onClick={handleCreateModule} style={{ flex: 1 }}>Simpan</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
