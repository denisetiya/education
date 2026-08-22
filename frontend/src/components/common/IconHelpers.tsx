import React from 'react';
import {
    Calculator,
    Atom,
    FlaskConical,
    Dna,
    BookOpen,
    Scroll,
    Globe,
    Palette,
    Music,
    Trophy,
    Code,
    GraduationCap,
    Languages,
    Activity,
    Star,
    Target,
    Flame,
    Gem,
    Award,
    Medal,
    Sparkles,
    FileText,
    Video,
    FileQuestion
} from 'lucide-react';

/**
 * Returns a suitable Lucide icon based on subject name
 */
export const getSubjectIcon = (subject: string, size = 18, className = ''): React.ReactNode => {
    const key = (subject || '').toLowerCase();
    
    if (key.includes('matematika') || key.includes('geometri') || key.includes('math') || key.includes('aljabar')) {
        return <Calculator size={size} className={className} />;
    }
    if (key.includes('fisika') || key.includes('physics')) {
        return <Atom size={size} className={className} />;
    }
    if (key.includes('kimia') || key.includes('chemistry')) {
        return <FlaskConical size={size} className={className} />;
    }
    if (key.includes('biologi') || key.includes('biology')) {
        return <Dna size={size} className={className} />;
    }
    if (key.includes('inggris') || key.includes('english') || key.includes('bahasa')) {
        return <Languages size={size} className={className} />;
    }
    if (key.includes('sejarah') || key.includes('history')) {
        return <Scroll size={size} className={className} />;
    }
    if (key.includes('geografi') || key.includes('ips') || key.includes('geography')) {
        return <Globe size={size} className={className} />;
    }
    if (key.includes('seni') || key.includes('art') || key.includes('budaya')) {
        return <Palette size={size} className={className} />;
    }
    if (key.includes('musik') || key.includes('music')) {
        return <Music size={size} className={className} />;
    }
    if (key.includes('olahraga') || key.includes('penjas') || key.includes('sport')) {
        return <Activity size={size} className={className} />;
    }
    if (key.includes('komputer') || key.includes('informatika') || key.includes('coding') || key.includes('program')) {
        return <Code size={size} className={className} />;
    }
    
    return <GraduationCap size={size} className={className} />;
};

/**
 * Returns a suitable Lucide icon based on material category
 */
export const getCategoryIcon = (category: string, size = 20, className = ''): React.ReactNode => {
    const key = (category || '').toUpperCase();
    
    switch (key) {
        case 'MATEMATIKA':
            return <Calculator size={size} className={className} />;
        case 'IPA':
            return <FlaskConical size={size} className={className} />;
        case 'IPS':
            return <Globe size={size} className={className} />;
        case 'BAHASA_INDONESIA':
            return <BookOpen size={size} className={className} />;
        case 'BAHASA_INGGRIS':
            return <Languages size={size} className={className} />;
        case 'SENI':
            return <Palette size={size} className={className} />;
        case 'OLAHRAGA':
            return <Activity size={size} className={className} />;
        default:
            return <BookOpen size={size} className={className} />;
    }
};

/**
 * Returns a suitable Lucide icon for content types (video, book, quiz, article)
 */
export const getContentTypeIcon = (type: string, size = 18, className = ''): React.ReactNode => {
    const key = (type || '').toLowerCase();
    
    switch (key) {
        case 'video':
            return <Video size={size} className={className} />;
        case 'book':
            return <BookOpen size={size} className={className} />;
        case 'quiz':
            return <FileQuestion size={size} className={className} />;
        case 'article':
        default:
            return <FileText size={size} className={className} />;
    }
};

/**
 * Component to render an Achievement icon from either an icon key or legacy emoji
 */
export const AchievementIcon: React.FC<{
    icon: string;
    size?: number;
    color?: string;
    className?: string;
}> = ({ icon, size = 28, color, className = '' }) => {
    const key = (icon || '').trim();
    
    // Map emoji or string key to icon
    if (key === '🏆' || key === 'trophy') {
        return <Trophy size={size} color={color || '#f59e0b'} className={className} />;
    }
    if (key === '⭐' || key === 'star' || key === '🌟') {
        return <Star size={size} color={color || '#eab308'} fill={color || '#eab308'} className={className} />;
    }
    if (key === '🎯' || key === 'target') {
        return <Target size={size} color={color || '#ef4444'} className={className} />;
    }
    if (key === '🔥' || key === 'flame' || key === 'fire') {
        return <Flame size={size} color={color || '#f97316'} className={className} />;
    }
    if (key === '💎' || key === 'gem' || key === 'diamond') {
        return <Gem size={size} color={color || '#3b82f6'} className={className} />;
    }
    if (key === '🎖️' || key === 'medal' || key === '🎖') {
        return <Medal size={size} color={color || '#8b5cf6'} className={className} />;
    }
    if (key === '🏅' || key === 'award') {
        return <Award size={size} color={color || '#10b981'} className={className} />;
    }
    if (key === '📖' || key === 'book' || key === '📚') {
        return <BookOpen size={size} color={color || '#6366f1'} className={className} />;
    }
    if (key === '🎓' || key === 'grad') {
        return <GraduationCap size={size} color={color || '#6366f1'} className={className} />;
    }
    if (key === '✨' || key === 'sparkles') {
        return <Sparkles size={size} color={color || '#ec4899'} className={className} />;
    }
    
    return <Award size={size} color={color || 'var(--primary)'} className={className} />;
};
