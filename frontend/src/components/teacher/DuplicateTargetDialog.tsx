import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Loader, X } from 'lucide-react';
import { classesAPI } from '../../utils/api';
import type { ClassItem } from '../../types/api.types';

type DuplicateKind = 'material' | 'exercise' | 'book';

interface DuplicateTargetDialogProps {
    open: boolean;
    kind: DuplicateKind;
    itemTitle: string;
    sourceClassId?: string | null;
    onClose: () => void;
    onConfirm: (target: { targetClassId: string; targetModuleId: string | null; copyLinkedContent: boolean }) => Promise<void>;
}

interface ModuleOption {
    id: string;
    title: string;
}

const KIND_LABEL: Record<DuplicateKind, string> = {
    material: 'materi',
    exercise: 'latihan',
    book: 'buku'
};

/**
 * Dialog pilih kelas (dan modul) tujuan untuk duplikasi konten antar kelas.
 * Alasan: guru sering mengajar beberapa kelas dengan materi sama, jadi
 * duplikasi harus bisa menargetkan kelas + modul tertentu tanpa memindah data siswa.
 */
export const DuplicateTargetDialog: React.FC<DuplicateTargetDialogProps> = ({
    open,
    kind,
    itemTitle,
    sourceClassId,
    onClose,
    onConfirm
}) => {
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [modules, setModules] = useState<ModuleOption[]>([]);
    const [targetClassId, setTargetClassId] = useState('');
    const [targetModuleId, setTargetModuleId] = useState('');
    const [copyLinkedContent, setCopyLinkedContent] = useState(true);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingModules, setLoadingModules] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const firstFieldRef = useRef<HTMLSelectElement>(null);

    const needsModule = kind !== 'book';

    useEffect(() => {
        if (!open) {
            return;
        }

        setError(null);
        setTargetClassId('');
        setTargetModuleId('');
        setModules([]);
        setCopyLinkedContent(true);
        setLoadingClasses(true);

        classesAPI.getAll()
            .then((data) => {
                setClasses((data || []).filter((item) => item.id !== sourceClassId));
            })
            .catch(() => setError('Gagal memuat daftar kelas.'))
            .finally(() => setLoadingClasses(false));
    }, [open, sourceClassId]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !submitting) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        firstFieldRef.current?.focus();

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose, submitting]);

    useEffect(() => {
        if (!targetClassId) {
            setModules([]);
            setTargetModuleId('');
            return;
        }

        setLoadingModules(true);
        setTargetModuleId('');
        classesAPI.getDashboard(targetClassId)
            .then((data) => {
                const classModules: ModuleOption[] = (data?.class?.modules || []).map((module: { id: string; title: string }) => ({
                    id: module.id,
                    title: module.title
                }));
                setModules(classModules);
                if (classModules.length > 0) {
                    setTargetModuleId(classModules[0].id);
                }
            })
            .catch(() => setError('Gagal memuat modul kelas tujuan.'))
            .finally(() => setLoadingModules(false));
    }, [targetClassId]);

    const targetClass = useMemo(
        () => classes.find((item) => item.id === targetClassId) || null,
        [classes, targetClassId]
    );

    const canSubmit = useMemo(() => {
        if (loadingClasses || loadingModules || submitting) {
            return false;
        }
        if (!targetClassId) {
            return false;
        }
        if (needsModule) {
            return Boolean(targetModuleId);
        }
        return true;
    }, [loadingClasses, loadingModules, submitting, targetClassId, targetModuleId, needsModule]);

    if (!open) {
        return null;
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!canSubmit) {
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            await onConfirm({
                targetClassId,
                targetModuleId: needsModule ? targetModuleId : null,
                copyLinkedContent: kind === 'material' ? copyLinkedContent : false
            });
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : 'Duplikasi gagal.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}
            onClick={() => { if (!submitting) onClose(); }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="duplicate-dialog-title"
                className="card"
                style={{ width: '100%', maxWidth: '480px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem' }}
                onClick={(event) => event.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem' }}>
                    <div>
                        <h2 id="duplicate-dialog-title" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>
                            Duplikat {KIND_LABEL[kind]} ke kelas lain
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                            {itemTitle}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        aria-label="Tutup dialog"
                        style={{ padding: '0.4rem', cursor: submitting ? 'not-allowed' : 'pointer', background: 'transparent', border: 'none', color: '#64748b' }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {error && (
                    <div role="alert" style={{ padding: '0.7rem 1rem', borderRadius: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.82rem', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="duplicate-target-class" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                            Kelas tujuan
                        </label>
                        <select
                            id="duplicate-target-class"
                            ref={firstFieldRef}
                            value={targetClassId}
                            onChange={(event) => setTargetClassId(event.target.value)}
                            disabled={loadingClasses || submitting}
                            className="input"
                        >
                            <option value="">{loadingClasses ? 'Memuat kelas...' : 'Pilih kelas'}</option>
                            {classes.map((item) => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                        {!loadingClasses && classes.length === 0 && (
                            <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem' }}>
                                Tidak ada kelas lain. Buat kelas dulu untuk memakai duplikasi.
                            </p>
                        )}
                    </div>

                    {needsModule && targetClassId && (
                        <div style={{ marginBottom: '1rem' }}>
                            <label htmlFor="duplicate-target-module" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                                Modul tujuan di {targetClass?.name}
                            </label>
                            <select
                                id="duplicate-target-module"
                                value={targetModuleId}
                                onChange={(event) => setTargetModuleId(event.target.value)}
                                disabled={loadingModules || submitting}
                                className="input"
                            >
                                <option value="">{loadingModules ? 'Memuat modul...' : 'Pilih modul'}</option>
                                {modules.map((module) => (
                                    <option key={module.id} value={module.id}>{module.title}</option>
                                ))}
                            </select>
                            {!loadingModules && modules.length === 0 && (
                                <p style={{ fontSize: '0.78rem', color: '#92400e', marginTop: '0.35rem' }}>
                                    Kelas tujuan belum punya modul. Buat modul dulu di kelas itu.
                                </p>
                            )}
                        </div>
                    )}

                    {kind === 'material' && (
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.82rem', color: '#334155', marginBottom: '1rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={copyLinkedContent}
                                onChange={(event) => setCopyLinkedContent(event.target.checked)}
                                disabled={submitting}
                                style={{ marginTop: '0.15rem' }}
                            />
                            <span>
                                Ikut gandakan kuis/latihan yang tertaut.
                                <span style={{ display: 'block', color: '#64748b' }}>
                                    Salinan mandiri, jadi perubahan di kelas asal tidak memengaruhi kelas tujuan.
                                </span>
                            </span>
                        </label>
                    )}

                    <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '1.25rem' }}>
                        {kind === 'exercise'
                            ? 'Latihan hasil salinan berstatus draft. Data pengerjaan siswa tidak ikut disalin.'
                            : 'Data siswa tidak ikut disalin.'}
                    </p>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
                            Batal
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
                            {submitting ? <><Loader size={16} className="animate-spin" /> Menduplikat...</> : 'Duplikat'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
