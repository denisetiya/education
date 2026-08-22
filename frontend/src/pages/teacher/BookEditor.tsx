import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { ArrowLeft, Save, Eye, Loader, BookOpen, Check, Lightbulb } from 'lucide-react';
import { classesAPI } from '../../utils/api';

interface BookData {
    id?: string;
    title: string;
    author: string;
    description: string;
    content: string;
}

export const BookEditor: React.FC = () => {
    const { classId, bookId } = useParams<{ classId: string; bookId?: string }>();
    const navigate = useNavigate();
    const classDetailPath = `/teacher/classes/${classId}?tab=library`;
    
    const [bookData, setBookData] = useState<BookData>({
        title: '',
        author: '',
        description: '',
        content: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [wordCount, setWordCount] = useState(0);

    // Quill modules configuration - full toolbar like Word
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'script': 'sub' }, { 'script': 'super' }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'indent': '-1' }, { 'indent': '+1' }],
                [{ 'direction': 'rtl' }],
                [{ 'align': [] }],
                ['blockquote', 'code-block'],
                ['link', 'image', 'video'],
                ['clean']
            ]
        },
        clipboard: {
            matchVisual: false
        }
    }), []);

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'script',
        'list', 'bullet', 'indent',
        'direction', 'align',
        'blockquote', 'code-block',
        'link', 'image', 'video'
    ];

    // Fetch existing book if editing
    useEffect(() => {
        if (bookId && classId) {
            fetchBook();
        }
    }, [bookId, classId]);

    const fetchBook = async () => {
        if (!classId) return;
        setLoading(true);
        try {
            const books = await classesAPI.getBooks(classId);
            const book = (books as any[]).find(b => b.id === bookId);
            if (book) {
                setBookData({
                    id: book.id,
                    title: book.title,
                    author: book.author || '',
                    description: book.description || '',
                    content: book.content || ''
                });
            }
        } catch (error) {
            console.error('Failed to fetch book', error);
        } finally {
            setLoading(false);
        }
    };

    // Update word count when content changes
    useEffect(() => {
        const text = bookData.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const words = text ? text.split(' ').length : 0;
        setWordCount(words);
    }, [bookData.content]);

    const handleSave = async () => {
        if (!classId || !bookData.title) return;
        setSaving(true);
        try {
            if (bookId) {
                // Update existing book
                await classesAPI.updateBook(classId, bookId, {
                    title: bookData.title,
                    author: bookData.author || undefined,
                    description: bookData.description || undefined,
                    contentType: 'rich_text',
                    content: bookData.content
                });
                setSuccess('Buku berhasil disimpan!');
            } else {
                // Create new book
                const result = await classesAPI.createBook(classId, {
                    title: bookData.title,
                    author: bookData.author || undefined,
                    description: bookData.description || undefined,
                    contentType: 'rich_text',
                    content: bookData.content
                });
                setSuccess('Buku berhasil dibuat!');
                // Navigate to edit mode with new book ID
                if ((result as any).id) {
                    navigate(`/teacher/classes/${classId}/book-editor/${(result as any).id}`, { replace: true });
                }
            }
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error('Failed to save book', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader size={40} className="animate-spin" style={{ color: 'var(--primary)' }} />
                    <p style={{ color: '#64748b', marginTop: '1rem' }}>Memuat editor...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
            {/* Top Bar */}
            <div style={{
                background: 'white',
                borderBottom: '1px solid #e2e8f0',
                padding: '0.75rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button 
                        onClick={() => navigate(classDetailPath)}
                        style={{ 
                            padding: '0.5rem', background: 'none', border: 'none', 
                            cursor: 'pointer', color: '#64748b', display: 'flex' 
                        }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BookOpen size={20} color="var(--primary)" />
                        <span style={{ fontWeight: '600', color: '#1e293b' }}>
                            {bookId ? 'Edit Buku' : 'Buku Baru'}
                        </span>
                    </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                        {wordCount} kata
                    </span>
                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        style={{
                            padding: '0.5rem 1rem',
                            background: previewMode ? 'var(--primary)' : '#f1f5f9',
                            color: previewMode ? 'white' : '#64748b',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Eye size={18} />
                        Preview
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !bookData.title}
                        style={{
                            padding: '0.5rem 1.25rem',
                            background: 'linear-gradient(135deg, var(--primary), #4f46e5)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: saving || !bookData.title ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: '600',
                            opacity: saving || !bookData.title ? 0.6 : 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                        {saving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '2rem', overflow: 'auto' }}>
                <div style={{ width: '100%', maxWidth: '900px' }}>
                    {/* Book Info Section */}
                    <div style={{
                        background: 'white',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        marginBottom: '1.5rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <input
                                type="text"
                                value={bookData.title}
                                onChange={(e) => setBookData({...bookData, title: e.target.value})}
                                placeholder="Judul Buku"
                                style={{
                                    width: '100%',
                                    fontSize: '1.75rem',
                                    fontWeight: '700',
                                    border: 'none',
                                    outline: 'none',
                                    color: '#1e293b',
                                    background: 'transparent'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input
                                type="text"
                                value={bookData.author}
                                onChange={(e) => setBookData({...bookData, author: e.target.value})}
                                placeholder="Penulis (opsional)"
                                style={{
                                    flex: 1,
                                    padding: '0.75rem 1rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.95rem',
                                    outline: 'none'
                                }}
                            />
                            <input
                                type="text"
                                value={bookData.description}
                                onChange={(e) => setBookData({...bookData, description: e.target.value})}
                                placeholder="Deskripsi singkat (opsional)"
                                style={{
                                    flex: 2,
                                    padding: '0.75rem 1rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.95rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Editor / Preview */}
                    <div style={{
                        background: 'white',
                        borderRadius: '1rem',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        minHeight: '600px'
                    }}>
                        {previewMode ? (
                            <div style={{ padding: '2rem' }}>
                                <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1e293b' }}>
                                    {bookData.title || 'Judul Buku'}
                                </h1>
                                {bookData.author && (
                                    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Oleh: {bookData.author}</p>
                                )}
                                <div 
                                    className="book-content"
                                    style={{ 
                                        lineHeight: '1.8', 
                                        fontSize: '1.05rem',
                                        color: '#334155'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: bookData.content || '<p style="color: #94a3b8; font-style: italic;">Belum ada konten...</p>' }}
                                />
                            </div>
                        ) : (
                            <div className="book-editor-container">
                                <ReactQuill
                                    theme="snow"
                                    value={bookData.content}
                                    onChange={(value) => setBookData({...bookData, content: value})}
                                    modules={modules}
                                    formats={formats}
                                    placeholder="Mulai menulis buku Anda di sini..."
                                    style={{ minHeight: '500px' }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Writing Tips */}
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem 1.25rem',
                        background: '#f0fdf4',
                        borderRadius: '0.75rem',
                        border: '1px solid #bbf7d0'
                    }}>
                        <p style={{ fontSize: '0.9rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Lightbulb size={16} style={{ flexShrink: 0 }} /> <span><strong>Tips:</strong> Gunakan toolbar di atas untuk memformat teks. Anda bisa menambahkan heading, 
                            daftar, gambar, video, dan berbagai format lainnya seperti di Microsoft Word.</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Success Toast */}
            {success && (
                <div style={{
                    position: 'fixed', bottom: '2rem', right: '2rem',
                    background: '#10b981', color: 'white',
                    padding: '1rem 1.5rem', borderRadius: '0.75rem',
                    boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    zIndex: 1100
                }}>
                    <Check size={20} />
                    {success}
                </div>
            )}

            {/* Custom styles for Quill editor */}
            <style>{`
                .book-editor-container .ql-container {
                    min-height: 500px;
                    font-size: 16px;
                    font-family: inherit;
                }
                .book-editor-container .ql-editor {
                    min-height: 500px;
                    padding: 2rem;
                    line-height: 1.8;
                }
                .book-editor-container .ql-toolbar {
                    border: none;
                    border-bottom: 1px solid #e2e8f0;
                    background: #f8fafc;
                    padding: 0.75rem;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                .book-editor-container .ql-container {
                    border: none;
                }
                .book-editor-container .ql-editor.ql-blank::before {
                    font-style: italic;
                    color: #94a3b8;
                }
                .book-editor-container .ql-snow .ql-picker {
                    color: #475569;
                }
                .book-editor-container .ql-snow.ql-toolbar button:hover,
                .book-editor-container .ql-snow .ql-toolbar button:hover,
                .book-editor-container .ql-snow.ql-toolbar button:focus,
                .book-editor-container .ql-snow .ql-toolbar button:focus {
                    color: var(--primary);
                }
                .book-editor-container .ql-snow.ql-toolbar button.ql-active,
                .book-editor-container .ql-snow .ql-toolbar button.ql-active {
                    color: var(--primary);
                }
                .book-content h1, .book-content h2, .book-content h3 {
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                    font-weight: 600;
                    color: #1e293b;
                }
                .book-content p {
                    margin-bottom: 1rem;
                }
                .book-content ul, .book-content ol {
                    margin-left: 1.5rem;
                    margin-bottom: 1rem;
                }
                .book-content blockquote {
                    border-left: 4px solid var(--primary);
                    padding-left: 1rem;
                    margin: 1rem 0;
                    color: #64748b;
                    font-style: italic;
                }
                .book-content img {
                    max-width: 100%;
                    border-radius: 0.5rem;
                    margin: 1rem 0;
                }
                .book-content pre {
                    background: #1e293b;
                    color: #e2e8f0;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    overflow-x: auto;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
};
