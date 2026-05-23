import React, { useRef, useEffect, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { X, Link2, Upload, Image as ImageIcon, Video, Sigma } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

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
    ['formula'],
    ['clean']
];

const formats = [
    'header', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video',
    'formula'
];

// ─── Media Modal ────────────────────────────────────────────────────────────

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

        if (type === 'video') {
            if (finalUrl.includes('youtube.com/watch')) {
                const videoId = finalUrl.split('v=')[1]?.split('&')[0];
                if (videoId) finalUrl = `https://www.youtube.com/embed/${videoId}`;
            } else if (finalUrl.includes('youtu.be/')) {
                const videoId = finalUrl.split('youtu.be/')[1]?.split('?')[0];
                if (videoId) finalUrl = `https://www.youtube.com/embed/${videoId}`;
            }
        }

        onInsert(finalUrl);
        onClose();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const maxSize = 1 * 1024 * 1024;
        if (file.size > maxSize) {
            setError('Ukuran file maksimal 1MB. Gunakan URL untuk gambar lebih besar.');
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError('Hanya file gambar yang diperbolehkan');
            return;
        }

        setUploading(true);
        setError('');

        const reader = new FileReader();
        reader.onload = () => {
            onInsert(reader.result as string);
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={onClose}>
            <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', width: '100%', maxWidth: '450px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {type === 'image' ? <ImageIcon size={20} /> : <Video size={20} />}
                        Sisipkan {type === 'image' ? 'Gambar' : 'Video'}
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                        <X size={20} color="#64748b" />
                    </button>
                </div>

                {type === 'image' && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <button onClick={() => setActiveTab('url')} style={{ flex: 1, padding: '0.75rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: activeTab === 'url' ? '#6366f1' : '#f1f5f9', color: activeTab === 'url' ? 'white' : '#64748b' }}>
                            <Link2 size={18} /> URL
                        </button>
                        <button onClick={() => setActiveTab('upload')} style={{ flex: 1, padding: '0.75rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: activeTab === 'upload' ? '#6366f1' : '#f1f5f9', color: activeTab === 'upload' ? 'white' : '#64748b' }}>
                            <Upload size={18} /> Upload
                        </button>
                    </div>
                )}

                {error && (
                    <div style={{ padding: '0.75rem', background: '#fee2e2', borderRadius: '0.5rem', color: '#dc2626', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                {(activeTab === 'url' || type === 'video') && (
                    <div>
                        <input type="text" value={url} onChange={e => { setUrl(e.target.value); setError(''); }}
                            placeholder={type === 'image' ? 'https://example.com/image.jpg' : 'https://www.youtube.com/watch?v=...'}
                            style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.95rem', marginBottom: '1rem', boxSizing: 'border-box' }}
                            onKeyDown={e => e.key === 'Enter' && handleUrlSubmit()} autoFocus />
                        <button onClick={handleUrlSubmit} style={{ width: '100%', padding: '0.75rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
                            Sisipkan
                        </button>
                    </div>
                )}

                {activeTab === 'upload' && type === 'image' && (
                    <div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                        <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ width: '100%', padding: '2rem', border: '2px dashed #e2e8f0', borderRadius: '0.5rem', background: '#f8fafc', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                            <Upload size={32} />
                            <span style={{ fontWeight: '600' }}>{uploading ? 'Mengupload...' : 'Klik untuk pilih gambar'}</span>
                            <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>Maksimal 1MB</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Formula Modal ──────────────────────────────────────────────────────────

interface FormulaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInsert: (latex: string, displayMode: boolean) => void;
}

const FormulaModal: React.FC<FormulaModalProps> = ({ isOpen, onClose, onInsert }) => {
    const [latex, setLatex] = useState('');
    const [displayMode, setDisplayMode] = useState(false);
    const [preview, setPreview] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setLatex('');
            setDisplayMode(false);
            setPreview('');
            setError('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (!latex.trim()) {
            setPreview('');
            setError('');
            return;
        }
        try {
            const html = katex.renderToString(latex, { throwOnError: true, displayMode });
            setPreview(html);
            setError('');
        } catch (e: any) {
            setPreview('');
            setError(e.message || 'Invalid LaTeX');
        }
    }, [latex, displayMode]);

    if (!isOpen) return null;

    const handleInsert = () => {
        if (!latex.trim() || error) return;
        onInsert(latex.trim(), displayMode);
        onClose();
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={onClose}>
            <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', width: '100%', maxWidth: '550px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sigma size={20} /> Sisipkan Formula (LaTeX)
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                        <X size={20} color="#64748b" />
                    </button>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
                        <input type="checkbox" checked={displayMode} onChange={e => setDisplayMode(e.target.checked)} style={{ accentColor: '#6366f1' }} />
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Display mode (centered, larger)</span>
                    </label>

                    <textarea
                        value={latex}
                        onChange={e => setLatex(e.target.value)}
                        placeholder={displayMode ? 'Contoh: \\int_{0}^{\\infty} x^2 dx' : 'Contoh: E = mc^2'}
                        style={{ width: '100%', minHeight: '80px', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.95rem', fontFamily: 'monospace', resize: 'vertical', boxSizing: 'border-box' }}
                        autoFocus
                    />
                </div>

                {/* Live Preview */}
                {preview && !error && (
                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0', marginBottom: '1rem', minHeight: '50px', display: 'flex', alignItems: 'center', justifyContent: displayMode ? 'center' : 'flex-start', overflow: 'auto' }}>
                        <div dangerouslySetInnerHTML={{ __html: preview }} />
                    </div>
                )}

                {error && (
                    <div style={{ padding: '0.75rem', background: '#fee2e2', borderRadius: '0.5rem', color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                <button onClick={handleInsert} disabled={!latex.trim() || !!error} style={{ width: '100%', padding: '0.75rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: !latex.trim() || !!error ? 'not-allowed' : 'pointer', opacity: !latex.trim() || !!error ? 0.5 : 1 }}>
                    Sisipkan Formula
                </button>
            </div>
        </div>
    );
};

// ─── Render KaTeX in editor content ─────────────────────────────────────────

const renderFormulas = (html: string): string => {
    let result = html;

    // Block formulas: $$...$$
    result = result.replace(/\$\$([\s\S]*?)\$\$/g, (_match, latex) => {
        try {
            return katex.renderToString(latex.trim(), { displayMode: true, throwOnError: false });
        } catch {
            return _match;
        }
    });

    // Inline formulas: $...$
    result = result.replace(/\$(?!\$)(.*?)\$/g, (_match, latex) => {
        try {
            return katex.renderToString(latex.trim(), { displayMode: false, throwOnError: false });
        } catch {
            return _match;
        }
    });

    return result;
};

// ─── Main RichTextEditor ────────────────────────────────────────────────────

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
    const quillRef = useRef<ReactQuill>(null);
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
    const [showFormulaModal, setShowFormulaModal] = useState(false);

    const insertMedia = (url: string) => {
        const quill = quillRef.current?.getEditor();
        if (quill) {
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, mediaType, url);
            quill.setSelection(range.index + 1);
        }
    };

    const insertFormula = (latex: string, displayMode: boolean) => {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;

        const range = quill.getSelection(true);
        const wrapper = displayMode ? `\n$$\n${latex}\n$$\n` : `$${latex}$`;
        quill.insertText(range.index, wrapper);
        quill.setSelection(range.index + wrapper.length);

        // Trigger change
        const html = quill.root.innerHTML;
        onChange(html);
    };

    useEffect(() => {
        if (quillRef.current) {
            const quill = quillRef.current.getEditor();
            const toolbar = quill.getModule('toolbar') as any;

            toolbar.addHandler('image', () => {
                setMediaType('image');
                setShowMediaModal(true);
            });

            toolbar.addHandler('video', () => {
                setMediaType('video');
                setShowMediaModal(true);
            });

            toolbar.addHandler('formula', () => {
                setShowFormulaModal(true);
            });
        }
    }, []);

    // Render formulas when value changes (for display in read-only contexts)
    const displayHtml = renderFormulas(value);

    const modules = {
        toolbar: toolbarOptions,
        clipboard: { matchVisual: false }
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
                .rich-text-editor .katex {
                    font-size: 1.1em;
                }
                .rich-text-editor .katex-display {
                    margin: 1rem 0;
                }
                .rich-text-editor .ql-formula {
                    display: inline-block;
                    padding: 0.2rem 0.4rem;
                    background: #f1f5f9;
                    border-radius: 0.25rem;
                    font-family: monospace;
                    color: #6366f1;
                }
                .rich-text-editor .ql-snow .ql-picker.ql-formula .ql-picker-label::before {
                    content: '\\03A3';
                    font-size: 1.2em;
                }
            `}</style>

            <MediaModal isOpen={showMediaModal} type={mediaType} onClose={() => setShowMediaModal(false)} onInsert={insertMedia} />

            <FormulaModal isOpen={showFormulaModal} onClose={() => setShowFormulaModal(false)} onInsert={insertFormula} />

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
