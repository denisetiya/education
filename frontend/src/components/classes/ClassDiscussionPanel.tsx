import React from 'react';
import {
    Lock,
    MessageSquare,
    Pin,
    Send,
    Shield,
    Unlock
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import type { ClassDiscussionReply, ClassDiscussionThread } from '../../types/api.types';
import { classesAPI, getApiErrorMessage } from '../../utils/api';

interface ClassDiscussionPanelProps {
    classId: string;
    viewer: 'student' | 'teacher';
}

export const ClassDiscussionPanel: React.FC<ClassDiscussionPanelProps> = ({ classId, viewer }) => {
    const notifications = useNotifications();
    const [threads, setThreads] = React.useState<ClassDiscussionThread[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedThreadId, setSelectedThreadId] = React.useState<string>('');
    const [newThreadTitle, setNewThreadTitle] = React.useState('');
    const [newThreadContent, setNewThreadContent] = React.useState('');
    const [replyContent, setReplyContent] = React.useState('');
    const [saving, setSaving] = React.useState(false);

    const selectedThread = React.useMemo(
        () => threads.find((thread) => thread.id === selectedThreadId) || threads[0] || null,
        [threads, selectedThreadId]
    );

    React.useEffect(() => {
        const loadThreads = async () => {
            try {
                setLoading(true);
                const data = await classesAPI.getDiscussions(classId);
                setThreads(data);
                if (data[0]) {
                    setSelectedThreadId(data[0].id);
                }
            } catch (error) {
                console.error('Failed to load class discussions', error);
            } finally {
                setLoading(false);
            }
        };

        void loadThreads();
    }, [classId]);

    const upsertThread = (thread: ClassDiscussionThread) => {
        setThreads((prev) => {
            const nextThreads = prev.some((item) => item.id === thread.id)
                ? prev.map((item) => item.id === thread.id ? thread : item)
                : [thread, ...prev];

            return nextThreads.sort((left, right) => {
                if (left.isPinned !== right.isPinned) {
                    return left.isPinned ? -1 : 1;
                }

                return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
            });
        });
    };

    const handleCreateThread = async () => {
        if (!newThreadTitle.trim() || !newThreadContent.trim()) {
            notifications.warning('Isi judul dan isi diskusi terlebih dahulu.', 'Thread belum lengkap');
            return;
        }

        try {
            setSaving(true);
            const createdThread = await classesAPI.createDiscussion(classId, {
                title: newThreadTitle.trim(),
                content: newThreadContent.trim()
            });
            upsertThread(createdThread);
            setSelectedThreadId(createdThread.id);
            setNewThreadTitle('');
            setNewThreadContent('');
        } catch (error) {
            console.error('Failed to create discussion thread', error);
            notifications.error(
                getApiErrorMessage(error, 'Gagal membuat thread diskusi.'),
                'Thread belum dibuat'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleReply = async () => {
        if (!selectedThread || !replyContent.trim()) {
            return;
        }

        try {
            setSaving(true);
            const createdReply = await classesAPI.replyDiscussion(classId, selectedThread.id, {
                content: replyContent.trim()
            });

            setThreads((prev) => prev.map((thread) => {
                if (thread.id !== selectedThread.id) {
                    return thread;
                }

                const replies = [...thread.replies, createdReply as ClassDiscussionReply];
                return {
                    ...thread,
                    replies,
                    updatedAt: new Date().toISOString(),
                    _count: {
                        replies: replies.length
                    }
                };
            }));
            setReplyContent('');
        } catch (error) {
            console.error('Failed to create reply', error);
            notifications.error(
                getApiErrorMessage(error, 'Gagal mengirim balasan.'),
                'Balasan belum terkirim'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleModeration = async (mode: 'pin' | 'lock', value: boolean) => {
        if (!selectedThread) {
            return;
        }

        try {
            const updatedThread = mode === 'pin'
                ? await classesAPI.pinDiscussion(classId, selectedThread.id, value)
                : await classesAPI.lockDiscussion(classId, selectedThread.id, value);

            upsertThread({
                ...selectedThread,
                ...updatedThread
            });
        } catch (error) {
            console.error(`Failed to ${mode} thread`, error);
            notifications.error(
                getApiErrorMessage(error, 'Gagal memperbarui status thread.'),
                'Status forum belum berubah'
            );
        }
    };

    if (loading) {
        return (
            <div className="card glass" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                Memuat forum diskusi kelas...
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr)', gap: '1.25rem', alignItems: 'start' }}>
            <aside className="card glass" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>Forum Diskusi</h3>
                    <p style={{ color: '#64748b', fontSize: '0.86rem', lineHeight: 1.6 }}>
                        Siswa bisa bertanya, berbagi strategi, dan guru dapat mem-pin diskusi penting.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: '0.85rem', borderRadius: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <input
                        value={newThreadTitle}
                        onChange={(event) => setNewThreadTitle(event.target.value)}
                        placeholder="Judul thread baru"
                        style={{ width: '100%', padding: '0.85rem 0.95rem', borderRadius: '0.85rem', border: '1px solid #cbd5e1' }}
                    />
                    <textarea
                        value={newThreadContent}
                        onChange={(event) => setNewThreadContent(event.target.value)}
                        rows={4}
                        placeholder={viewer === 'teacher' ? 'Tulis pengumuman, arahan, atau topik diskusi baru.' : 'Tulis pertanyaan atau ide diskusimu.'}
                        style={{ width: '100%', padding: '0.85rem 0.95rem', borderRadius: '0.85rem', border: '1px solid #cbd5e1', resize: 'vertical', lineHeight: 1.6 }}
                    />
                    <button
                        onClick={() => void handleCreateThread()}
                        disabled={saving}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '0.85rem 1rem',
                            borderRadius: '0.9rem',
                            border: 'none',
                            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                            color: 'white',
                            fontWeight: '700',
                            cursor: saving ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <MessageSquare size={16} />
                        Buat Thread
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {threads.length === 0 ? (
                        <div style={{ padding: '1rem', borderRadius: '0.9rem', background: '#f8fafc', color: '#64748b', textAlign: 'center' }}>
                            Belum ada thread. Mulai diskusi pertama.
                        </div>
                    ) : (
                        threads.map((thread) => (
                            <button
                                key={thread.id}
                                onClick={() => setSelectedThreadId(thread.id)}
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '0.95rem 1rem',
                                    borderRadius: '1rem',
                                    border: selectedThread?.id === thread.id ? '2px solid #6366f1' : '1px solid #e2e8f0',
                                    background: selectedThread?.id === thread.id ? '#eef2ff' : 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.45rem' }}>
                                    {thread.isPinned && (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.45rem', borderRadius: '999px', background: '#fef3c7', color: '#92400e', fontSize: '0.72rem', fontWeight: '700' }}>
                                            <Pin size={12} />
                                            Pin
                                        </span>
                                    )}
                                    {thread.isLocked && (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.45rem', borderRadius: '999px', background: '#fee2e2', color: '#b91c1c', fontSize: '0.72rem', fontWeight: '700' }}>
                                            <Lock size={12} />
                                            Terkunci
                                        </span>
                                    )}
                                </div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>{thread.title}</h4>
                                <p style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.55, marginBottom: '0.55rem' }}>
                                    {thread.content.length > 88 ? `${thread.content.slice(0, 88)}...` : thread.content}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', color: '#64748b', fontSize: '0.74rem' }}>
                                    <span>{thread.author.name}</span>
                                    <span>{thread._count?.replies || thread.replies.length} balasan</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </aside>

            <div className="card glass" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {selectedThread ? (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>{selectedThread.title}</h3>
                                    {selectedThread.isPinned && (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', borderRadius: '999px', background: '#fef3c7', color: '#92400e', fontSize: '0.72rem', fontWeight: '700' }}>
                                            <Pin size={12} />
                                            Dipin
                                        </span>
                                    )}
                                    {selectedThread.isLocked && (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', borderRadius: '999px', background: '#fee2e2', color: '#b91c1c', fontSize: '0.72rem', fontWeight: '700' }}>
                                            <Lock size={12} />
                                            Terkunci
                                        </span>
                                    )}
                                </div>
                                <p style={{ color: '#64748b', fontSize: '0.86rem' }}>
                                    Dibuat oleh {selectedThread.author.name} pada {new Date(selectedThread.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                </p>
                            </div>

                            {viewer === 'teacher' && (
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={() => void handleModeration('pin', !selectedThread.isPinned)}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.45rem',
                                            padding: '0.65rem 0.9rem',
                                            borderRadius: '0.85rem',
                                            border: '1px solid #e2e8f0',
                                            background: 'white',
                                            cursor: 'pointer',
                                            fontWeight: '700'
                                        }}
                                    >
                                        <Pin size={14} />
                                        {selectedThread.isPinned ? 'Lepas Pin' : 'Pin'}
                                    </button>
                                    <button
                                        onClick={() => void handleModeration('lock', !selectedThread.isLocked)}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.45rem',
                                            padding: '0.65rem 0.9rem',
                                            borderRadius: '0.85rem',
                                            border: '1px solid #e2e8f0',
                                            background: 'white',
                                            cursor: 'pointer',
                                            fontWeight: '700'
                                        }}
                                    >
                                        {selectedThread.isLocked ? <Unlock size={14} /> : <Shield size={14} />}
                                        {selectedThread.isLocked ? 'Buka Thread' : 'Kunci Thread'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div style={{ padding: '1rem 1.05rem', borderRadius: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                            {selectedThread.content}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {selectedThread.replies.length === 0 ? (
                                <div style={{ padding: '1rem', borderRadius: '0.9rem', background: '#f8fafc', color: '#64748b', textAlign: 'center' }}>
                                    Belum ada balasan. Jadilah penjawab pertama.
                                </div>
                            ) : (
                                selectedThread.replies.map((reply) => (
                                    <div key={reply.id} style={{ padding: '0.95rem 1rem', borderRadius: '1rem', border: '1px solid #e2e8f0', background: 'white' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.45rem', flexWrap: 'wrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#0f172a', fontWeight: '700' }}>
                                                <span>{reply.author.name}</span>
                                                <span style={{ padding: '0.2rem 0.45rem', borderRadius: '999px', background: reply.author.role === 'TEACHER' ? '#dbeafe' : '#f8fafc', color: reply.author.role === 'TEACHER' ? '#1d4ed8' : '#475569', fontSize: '0.72rem' }}>
                                                    {reply.author.role === 'TEACHER' ? 'Guru' : 'Siswa'}
                                                </span>
                                            </div>
                                            <span style={{ color: '#64748b', fontSize: '0.76rem' }}>
                                                {new Date(reply.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </span>
                                        </div>
                                        <p style={{ color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{reply.content}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        <div style={{ padding: '0.95rem', borderRadius: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <textarea
                                value={replyContent}
                                onChange={(event) => setReplyContent(event.target.value)}
                                rows={4}
                                disabled={selectedThread.isLocked && viewer !== 'teacher'}
                                placeholder={selectedThread.isLocked && viewer !== 'teacher'
                                    ? 'Thread ini sedang dikunci guru.'
                                    : 'Tulis balasan yang membantu dan sopan.'}
                                style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: '0.9rem', border: '1px solid #cbd5e1', resize: 'vertical', background: 'white', lineHeight: 1.6 }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                <p style={{ color: '#64748b', fontSize: '0.82rem' }}>
                                    Balasan yang baik akan membantu badge "Aktif Diskusi" di leaderboard.
                                </p>
                                <button
                                    onClick={() => void handleReply()}
                                    disabled={saving || (selectedThread.isLocked && viewer !== 'teacher')}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.8rem 1rem',
                                        borderRadius: '0.9rem',
                                        border: 'none',
                                        background: saving || (selectedThread.isLocked && viewer !== 'teacher')
                                            ? '#94a3b8'
                                            : 'linear-gradient(135deg, #0f766e, #2563eb)',
                                        color: 'white',
                                        fontWeight: '700',
                                        cursor: saving || (selectedThread.isLocked && viewer !== 'teacher') ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    <Send size={16} />
                                    Kirim Balasan
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                        Pilih atau buat thread diskusi untuk mulai berinteraksi.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassDiscussionPanel;
