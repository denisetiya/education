import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Library, BookOpen, FileText, Loader, Eye } from 'lucide-react';
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
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

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

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader className="animate-spin" size={48} style={{ color: 'var(--primary)' }} />
            </div>
        );
    }

    return (
        <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>
                    📖 Perpustakaan Kelas
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    {books.map((book) => (
                        <div
                            key={book.id}
                            className="card glass"
                            style={{
                                padding: 0,
                                overflow: 'hidden',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }}
                            onClick={() => setSelectedBook(book)}
                        >
                            <div style={{
                                height: '180px',
                                background: book.coverUrl 
                                    ? `url(${book.coverUrl}) center/cover` 
                                    : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {!book.coverUrl && <BookOpen size={48} color="white" />}
                            </div>
                            <div style={{ padding: '1.25rem' }}>
                                <h3 style={{ fontWeight: '700', color: '#334155', marginBottom: '0.25rem' }}>
                                    {book.title}
                                </h3>
                                {book.author && (
                                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                        oleh {book.author}
                                    </p>
                                )}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginTop: '0.75rem',
                                    fontSize: '0.85rem',
                                    color: '#64748b'
                                }}>
                                    <FileText size={14} />
                                    <span>{book.contentType === 'pdf' ? 'PDF' : 'Buku Digital'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Book Reader Modal */}
            {selectedBook && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '1rem',
                        width: '100%',
                        maxWidth: '900px',
                        maxHeight: '90vh',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{
                            padding: '1.5rem',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{selectedBook.title}</h2>
                                {selectedBook.author && (
                                    <p style={{ color: '#64748b' }}>oleh {selectedBook.author}</p>
                                )}
                            </div>
                            <button
                                onClick={() => setSelectedBook(null)}
                                style={{
                                    background: '#f1f5f9',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Tutup
                            </button>
                        </div>
                        <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
                            {selectedBook.contentType === 'pdf' && selectedBook.pdfUrl ? (
                                <iframe
                                    src={selectedBook.pdfUrl}
                                    style={{ width: '100%', height: '70vh', border: 'none' }}
                                    title={selectedBook.title}
                                />
                            ) : selectedBook.content ? (
                                <div 
                                    dangerouslySetInnerHTML={{ __html: selectedBook.content }}
                                    style={{ lineHeight: 1.8, color: '#334155' }}
                                />
                            ) : (
                                <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                                    Konten buku belum tersedia.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassLibrary;
