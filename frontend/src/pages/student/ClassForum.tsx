import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import ClassDiscussionPanel from '../../components/classes/ClassDiscussionPanel';

export const ClassForum: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();

    if (!classId) {
        return null;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1360px', margin: '0 auto', padding: '1.5rem' }}>
            <button
                onClick={() => navigate(`/student/class/${classId}`)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', fontWeight: '600' }}
            >
                <ArrowLeft size={18} />
                Kembali ke kelas
            </button>

            <ClassDiscussionPanel classId={classId} viewer="student" />
        </div>
    );
};

export default ClassForum;
