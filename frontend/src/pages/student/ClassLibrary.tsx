import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Library, BookOpen, FileText, Loader, ChevronRight } from 'lucide-react';
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
}

export const ClassLibrary: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (classId) {
            fetchBooks();
        }
    }, [classId]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const data = await classesAPI.getBooks(classId!);
            setBooks(data);
        } catch (err) {
            console.error('Failed to fetch books', err);
        } finally {
            setLoading(false);
        }
    };

    const openBook = (book: Book) => {
        navigate(`/student/class/${classId}/library/${book.id}`);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader className="animate-spin" size={48} style={{ color: 'var(--primary)' }} />
            </div>
        );
    }

    return (
        <div style={{ padding: '1rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Library size={28} style={{ color: 'var(--primary)', flexShrink: 0 }} /> Perpustakaan Kelas
                </h1>
                <p style={{ color: '#64748b' }}>Buku dan materi bacaan untuk kelas ini</p>
            </div>

            {books.length === 0 ? (
                <div className="card glass" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    <Library size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>Belum ada buku di perpustakaan kelas ini.</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Guru akan menambahkan buku sebentar lagi.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {books.map((book) => (
                        <div
                            key={book.id}
                            className="card glass"
                            style={{
                                padding: 0,
                                overflow: 'hidden',
                                transition: 'all 0.3s',
                                cursor: 'pointer',
                                transform: 'translateY(0)'
                            }}
                            onClick={() => openBook(book)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '';
                            }}
                        >
                            <div style={{
                                height: '180px',
                                background: book.coverUrl 
                                    ? `url(${book.coverUrl}) center/cover` 
                                    : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative'
                            }}>
                                {!book.coverUrl && <BookOpen size={48} color="white" />}
                                <div style={{
                                    position: 'absolute',
                                    top: '0.75rem',
                                    right: '0.75rem',
                                    background: book.contentType === 'pdf' ? '#ef4444' : 'var(--primary)',
                                    color: 'white',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '1rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '600'
                                }}>
                                    {book.contentType === 'pdf' ? 'PDF' : 'BUKU'}
                                </div>
                            </div>
                            <div style={{ padding: '1.25rem' }}>
                                <h3 style={{ 
                                    fontWeight: '700', 
                                    color: '#334155', 
                                    marginBottom: '0.25rem',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {book.title}
                                </h3>
                                {book.author && (
                                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                        oleh {book.author}
                                    </p>
                                )}
                                {book.description && (
                                    <p style={{ 
                                        fontSize: '0.85rem', 
                                        color: '#94a3b8',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        marginBottom: '0.75rem'
                                    }}>
                                        {book.description}
                                    </p>
                                )}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginTop: '0.75rem',
                                    paddingTop: '0.75rem',
                                    borderTop: '1px solid #f1f5f9'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.85rem',
                                        color: '#64748b'
                                    }}>
                                        <FileText size={14} />
                                        <span>{book.contentType === 'pdf' ? 'Dokumen PDF' : 'Buku Digital'}</span>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        color: 'var(--primary)',
                                        fontWeight: '600',
                                        fontSize: '0.85rem'
                                    }}>
                                        Baca <ChevronRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClassLibrary;

