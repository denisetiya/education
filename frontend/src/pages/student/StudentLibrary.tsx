import React, { useState } from 'react';
import { Search, Book, Video, FileText, Sparkles, Globe } from 'lucide-react';

const mockMaterials = [
    { id: 1, title: 'Aljabar Dasar: Pengenalan', type: 'video', category: 'Matematika', level: 'Mudah' },
    { id: 2, title: 'Hukum Newton I, II, III', type: 'book', category: 'Fisika', level: 'Menengah' },
    { id: 3, title: 'Latihan Soal Aljabar', type: 'quiz', category: 'Matematika', level: 'Mudah' },
    { id: 4, title: 'Sejarah Kemerdekaan', type: 'book', category: 'Sejarah', level: 'Mudah' },
    { id: 5, title: 'Biologi Sel', type: 'video', category: 'Biologi', level: 'Sulit' },
];

export const StudentLibrary: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');

    const filteredMaterials = mockMaterials.filter(m =>
        (filter === 'All' || m.type === filter) &&
        m.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h1 className="text-gradient" style={{ fontSize: 'clamp(1.75rem, 5vw, 2rem)' }}>Perpustakaan Digital</h1>
                <p style={{ color: 'var(--text-muted)' }}>Jelajahi ribuan materi belajar</p>
            </div>

            {/* Featured Section */}
            <div className="card glass animate-slide-up" style={{
                background: 'linear-gradient(120deg, var(--secondary), #8b5cf6)',
                color: 'white',
                padding: 'clamp(1.5rem, 4vw, 2.5rem)',
                position: 'relative',
                overflow: 'hidden',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '2rem'
            }}>
                <div style={{ flex: '1 1 300px', zIndex: 1 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.75rem', background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                        <Sparkles size={14} /> REKOMENDASI MINGGU INI
                    </div>
                    <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '800', marginBottom: '1rem' }}>Ensiklopedia Alam Semesta</h2>
                    <p style={{ fontSize: '1.05rem', opacity: 0.9, marginBottom: '2rem', maxWidth: '500px' }}>
                        Jelajahi misteri galaksi, bintang, dan planet dalam buku interaktif yang memukau ini.
                    </p>
                    <button className="btn" style={{ background: 'white', color: 'var(--secondary)', fontWeight: 'bold', border: 'none', padding: '0.8rem 2rem' }}>
                        Baca Sekarang
                    </button>
                </div>
                <div className="animate-float" style={{ zIndex: 1, display: 'flex', justifyContent: 'center', flex: '1 1 120px', minWidth: '120px' }}>
                    <Globe size={96} color="rgba(255,255,255,0.85)" />
                </div>

                {/* Decoration Circles */}
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'white', opacity: 0.1, borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', bottom: '-30px', left: '20%', width: '100px', height: '100px', background: 'white', opacity: 0.1, borderRadius: '50%' }}></div>
            </div>

            {/* Search and Filter */}
            <div className="card glass" style={{ display: 'flex', gap: '1rem', padding: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 300px', position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem' }} />
                    <input
                        type="text"
                        placeholder="Cari materi, buku, atau video..."
                        style={{
                            width: '100%',
                            padding: '0.8rem 1rem 0.8rem 3rem',
                            borderRadius: '2rem',
                            border: '1px solid rgba(0,0,0,0.1)',
                            outline: 'none',
                            background: 'rgba(255,255,255,0.5)',
                            transition: 'all 0.2s',
                            fontSize: '0.95rem'
                        }}
                        onFocus={(e) => e.target.style.background = 'white'}
                        onBlur={(e) => e.target.style.background = 'rgba(255,255,255,0.5)'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                    {['All', 'video', 'book', 'quiz'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            style={{
                                padding: '0.6rem 1.25rem',
                                borderRadius: '2rem',
                                background: filter === type ? 'var(--primary)' : 'transparent',
                                color: filter === type ? 'white' : 'var(--text-muted)',
                                border: filter === type ? 'none' : '1px solid rgba(0,0,0,0.1)',
                                textTransform: 'capitalize',
                                fontWeight: '600',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s'
                            }}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', paddingBottom: '2rem' }}>
                {filteredMaterials.map((item, index) => (
                    <div key={item.id} className="card glass card-hover-effect animate-slide-up" style={{
                        padding: '0',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        animationDelay: `${index * 0.1}s`
                    }}>
                        <div style={{ height: '160px', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            <div className="animate-float" style={{ animationDelay: `${index * 0.2}s` }}>{getIcon(item.type)}</div>
                            <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.8)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                                {item.level}
                            </div>
                        </div>
                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.category}</span>
                            </div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)', lineHeight: 1.4 }}>{item.title}</h3>
                            <button className="btn-secondary" style={{ marginTop: 'auto', width: '100%', justifyContent: 'center', borderRadius: '0.75rem' }}>Buka Materi</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const getIcon = (type: string) => {
    switch (type) {
        case 'video': return <Video size={48} color="var(--primary)" />;
        case 'book': return <Book size={48} color="var(--secondary)" />;
        case 'quiz': return <FileText size={48} color="var(--accent)" />;
        default: return <Book size={48} />;
    }
};
