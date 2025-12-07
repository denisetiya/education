import React, { useRef, useEffect, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { X, Link2, Upload, Image as ImageIcon, Video } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

// Static toolbar configuration
const toolbarOptions = [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean']
];

// Fixed formats - removed 'bullet' as it's handled by 'list'
const formats = [
    'header', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
];

// Image/Video Modal Component
interface MediaModalProps {
    isOpen: boolean;
    type: 'image' | 'video';
    onClose: () => void;
    onInsert: (url: string) => void;
}

const MediaModal: React.FC<MediaModalProps> = ({ isOpen, type, onClose, onInsert }) => {
    const [url, setUrl] = useState('');
    const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setUrl('');
            setError('');
            setActiveTab('url');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleUrlSubmit = () => {
        if (!url.trim()) {
            setError('URL tidak boleh kosong');
            return;
        }

        let finalUrl = url.trim();

        // Convert YouTube URL to embed format for videos
        if (type === 'video') {
            if (finalUrl.includes('youtube.com/watch')) {
                const videoId = finalUrl.split('v=')[1]?.split('&')[0];
                if (videoId) {
                    finalUrl = `https://www.youtube.com/embed/${videoId}`;
                }
            } else if (finalUrl.includes('youtu.be/')) {
                const videoId = finalUrl.split('youtu.be/')[1]?.split('?')[0];
                if (videoId) {
                    finalUrl = `https://www.youtube.com/embed/${videoId}`;
                }
            }
        }

        onInsert(finalUrl);
        onClose();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (max 1MB for safety)
        const maxSize = 1 * 1024 * 1024; // 1MB
        if (file.size > maxSize) {
            setError('Ukuran file maksimal 1MB. Gunakan URL untuk gambar lebih besar.');
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            setError('Hanya file gambar yang diperbolehkan');
            return;
        }

        setUploading(true);
        setError('');

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            onInsert(base64);
            setUploading(false);
            onClose();
        };
        reader.onerror = () => {
            setError('Gagal membaca file');
            setUploading(false);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
        }} onClick={onClose}>
            <div
                style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    width: '100%',
                    maxWidth: '450px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {type === 'image' ? <ImageIcon size={20} /> : <Video size={20} />}
                        Sisipkan {type === 'image' ? 'Gambar' : 'Video'}
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                        <X size={20} color="#64748b" />
                    </button>
                </div>

                {/* Tabs - only show for images */}
                {type === 'image' && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <button
                            onClick={() => setActiveTab('url')}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                background: activeTab === 'url' ? '#6366f1' : '#f1f5f9',
                                color: activeTab === 'url' ? 'white' : '#64748b'
                            }}
                        >
                            <Link2 size={18} /> URL
                        </button>
                        <button
                            onClick={() => setActiveTab('upload')}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                background: activeTab === 'upload' ? '#6366f1' : '#f1f5f9',
                                color: activeTab === 'upload' ? 'white' : '#64748b'
                            }}
                        >
                            <Upload size={18} /> Upload
                        </button>
                    </div>
                )}

                {error && (
                    <div style={{
                        padding: '0.75rem',
                        background: '#fee2e2',
                        borderRadius: '0.5rem',
                        color: '#dc2626',
                        fontSize: '0.9rem',
                        marginBottom: '1rem'
                    }}>
                        {error}
                    </div>
                )}

                {/* URL Input */}
                {(activeTab === 'url' || type === 'video') && (
                    <div>
                        <input
                            type="text"
                            value={url}
                            onChange={e => { setUrl(e.target.value); setError(''); }}
                            placeholder={type === 'image' ? 'https://example.com/image.jpg' : 'https://www.youtube.com/watch?v=...'}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                border: '1px solid #e2e8f0',
                                borderRadius: '0.5rem',
                                fontSize: '0.95rem',
                                marginBottom: '1rem',
                                boxSizing: 'border-box'
                            }}
                            onKeyDown={e => e.key === 'Enter' && handleUrlSubmit()}
                            autoFocus
                        />
                        <button
                            onClick={handleUrlSubmit}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: '#6366f1',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Sisipkan
                        </button>
                    </div>
                )}

                {/* File Upload */}
                {activeTab === 'upload' && type === 'image' && (
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            style={{
                                width: '100%',
                                padding: '2rem',
                                border: '2px dashed #e2e8f0',
                                borderRadius: '0.5rem',
                                background: '#f8fafc',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: '#64748b'
                            }}
                        >
                            <Upload size={32} />
                            <span style={{ fontWeight: '600' }}>
                                {uploading ? 'Mengupload...' : 'Klik untuk pilih gambar'}
                            </span>
                            <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>Maksimal 1MB</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
    const quillRef = useRef<ReactQuill>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'image' | 'video'>('image');

    const insertMedia = (url: string) => {
        const quill = quillRef.current?.getEditor();
        if (quill) {
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, modalType, url);
            quill.setSelection(range.index + 1);
        }
    };

    // Setup custom handlers after component mounts
    useEffect(() => {
        if (quillRef.current) {
            const quill = quillRef.current.getEditor();
            const toolbar = quill.getModule('toolbar') as any;

            // Custom image handler - show modal
            toolbar.addHandler('image', () => {
                setModalType('image');
                setShowModal(true);
            });

            // Custom video handler - show modal
            toolbar.addHandler('video', () => {
                setModalType('video');
                setShowModal(true);
            });
        }
    }, []);

    const modules = {
        toolbar: toolbarOptions,
        clipboard: {
            matchVisual: false
        }
    };

    return (
        <div className="rich-text-editor">
            <style>{`
                .rich-text-editor .ql-container {
                    min-height: 250px;
                    font-size: 1rem;
                    font-family: inherit;
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                }
                .rich-text-editor .ql-toolbar {
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    background: #f8fafc;
                    border-color: #e2e8f0;
                    flex-wrap: wrap;
                }
                .rich-text-editor .ql-container {
                    border-color: #e2e8f0;
                }
                .rich-text-editor .ql-editor {
                    min-height: 200px;
                    line-height: 1.8;
                }
                .rich-text-editor .ql-editor.ql-blank::before {
                    font-style: normal;
                    color: #94a3b8;
                }
                .rich-text-editor .ql-snow .ql-picker-label {
                    color: #475569;
                }
                .rich-text-editor .ql-snow .ql-stroke {
                    stroke: #475569;
                }
                .rich-text-editor .ql-snow .ql-fill {
                    fill: #475569;
                }
                .rich-text-editor .ql-editor img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 0.5rem;
                    margin: 0.5rem 0;
                }
                .rich-text-editor .ql-editor iframe {
                    max-width: 100%;
                    border-radius: 0.5rem;
                }
                .rich-text-editor .ql-video {
                    width: 100%;
                    height: 400px;
                }
            `}</style>

            <MediaModal
                isOpen={showModal}
                type={modalType}
                onClose={() => setShowModal(false)}
                onInsert={insertMedia}
            />

            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder || 'Tulis konten materi di sini...'}
            />
        </div>
    );
};
