import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, FileText, Loader, User, ExternalLink } from 'lucide-react';
import { classesAPI } from '../../utils/api';

interface Book {
    id: string;
    title: string;
    author?: string;
    description?: string;
    coverUrl?: string;
    contentType: string;
    content?: string;
    pdfUrl?: string;
    createdAt?: string;
}

export const BookReader: React.FC = () => {
    const { classId, bookId } = useParams<{ classId: string; bookId: string }>();
    const navigate = useNavigate();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [fontSize, setFontSize] = useState(16);

    useEffect(() => {
        if (classId && bookId) {
            fetchBook();
        }
    }, [classId, bookId]);

    const fetchBook = async () => {
        try {
            setLoading(true);
            const books = await classesAPI.getBooks(classId!);
            const foundBook = (books as Book[]).find(b => b.id === bookId);
            if (foundBook) {
                setBook(foundBook);
            }
        } catch (err) {
            console.error('Failed to fetch book', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                background: '#f8fafc'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader className="animate-spin" size={48} style={{ color: 'var(--primary)' }} />
                    <p style={{ color: '#64748b', marginTop: '1rem' }}>Memuat buku...</p>
                </div>
            </div>
        );
    }

    if (!book) {
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                background: '#f8fafc'
            }}>
                <BookOpen size={64} style={{ color: '#94a3b8', marginBottom: '1rem' }} />
                <h2 style={{ color: '#334155', marginBottom: '0.5rem' }}>Buku tidak ditemukan</h2>
                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Buku yang Anda cari mungkin sudah dihapus.</p>
                <button 
                    onClick={() => navigate(`/student/class/${classId}/library`)}
                    className="btn btn-primary"
                >
                    Kembali ke Perpustakaan
                </button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
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
                        onClick={() => navigate(`/student/class/${classId}/library`)}
                        style={{ 
                            padding: '0.5rem', 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer',
                            color: '#64748b',
                            display: 'flex'
                        }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>
                            {book.title}
                        </h1>
                        {book.author && (
                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>oleh {book.author}</p>
                        )}
                    </div>
                </div>

                {/* Font size controls for rich text */}
                {book.contentType === 'rich_text' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Ukuran:</span>
                        <button
                            onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                            style={{
                                padding: '0.25rem 0.5rem',
                                background: '#f1f5f9',
                                border: 'none',
                                borderRadius: '0.25rem',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            A-
                        </button>
                        <span style={{ fontSize: '0.85rem', color: '#64748b', minWidth: '30px', textAlign: 'center' }}>
                            {fontSize}
                        </span>
                        <button
                            onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                            style={{
                                padding: '0.25rem 0.5rem',
                                background: '#f1f5f9',
                                border: 'none',
                                borderRadius: '0.25rem',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            A+
                        </button>
                    </div>
                )}

                {/* Open PDF in new tab */}
                {book.contentType === 'pdf' && book.pdfUrl && (
                    <a
                        href={book.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: '#f1f5f9',
                            borderRadius: '0.5rem',
                            color: '#475569',
                            textDecoration: 'none',
                            fontSize: '0.9rem'
                        }}
                    >
                        <ExternalLink size={16} />
                        Buka di Tab Baru
                    </a>
                )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                {book.contentType === 'pdf' && book.pdfUrl ? (
                    <div style={{ width: '100%', maxWidth: '1000px' }}>
                        <iframe
                            src={book.pdfUrl}
                            style={{ 
                                width: '100%', 
                                height: 'calc(100vh - 150px)', 
                                border: 'none',
                                borderRadius: '0.5rem',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                            title={book.title}
                        />
                    </div>
                ) : book.content ? (
                    <div style={{ 
                        width: '100%', 
                        maxWidth: '800px', 
                        background: 'white',
                        borderRadius: '1rem',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                        overflow: 'hidden'
                    }}>
                        {/* Book Cover Header */}
                        <div style={{
                            background: book.coverUrl 
                                ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${book.coverUrl}) center/cover`
                                : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                            padding: '3rem 2rem',
                            color: 'white',
                            textAlign: 'center'
                        }}>
                            <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.9 }} />
                            <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                                {book.title}
                            </h1>
                            {book.author && (
                                <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: 0.9 }}>
                                    <User size={16} />
                                    {book.author}
                                </p>
                            )}
                            {book.description && (
                                <p style={{ marginTop: '1rem', opacity: 0.8, maxWidth: '500px', margin: '1rem auto 0' }}>
                                    {book.description}
                                </p>
                            )}
                        </div>

                        {/* Book Content */}
                        <div 
                            className="book-content"
                            dangerouslySetInnerHTML={{ __html: book.content }}
                            style={{ 
                                padding: '2.5rem',
                                lineHeight: 1.9, 
                                color: '#334155',
                                fontSize: `${fontSize}px`
                            }}
                        />
                    </div>
                ) : (
                    <div style={{ 
                        textAlign: 'center', 
                        color: '#64748b', 
                        padding: '3rem',
                        background: 'white',
                        borderRadius: '1rem'
                    }}>
                        <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>Konten buku belum tersedia.</p>
                    </div>
                )}
            </div>

            {/* Styles */}
            <style>{`
                .book-content h1, .book-content h2, .book-content h3, .book-content h4 {
                    margin-top: 1.5em;
                    margin-bottom: 0.75em;
                    font-weight: 600;
                    color: #1e293b;
                }
                .book-content h1 { font-size: 1.75em; }
                .book-content h2 { font-size: 1.5em; }
                .book-content h3 { font-size: 1.25em; }
                .book-content p {
                    margin-bottom: 1em;
                }
                .book-content ul, .book-content ol {
                    margin-left: 1.5em;
                    margin-bottom: 1em;
                }
                .book-content li {
                    margin-bottom: 0.25em;
                }
                .book-content blockquote {
                    border-left: 4px solid var(--primary);
                    padding-left: 1em;
                    margin: 1.5em 0;
                    color: #64748b;
                    font-style: italic;
                }
                .book-content img {
                    max-width: 100%;
                    border-radius: 0.5rem;
                    margin: 1em 0;
                }
                .book-content pre {
                    background: #1e293b;
                    color: #e2e8f0;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    overflow-x: auto;
                    margin: 1em 0;
                }
                .book-content a {
                    color: var(--primary);
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

export default BookReader;
