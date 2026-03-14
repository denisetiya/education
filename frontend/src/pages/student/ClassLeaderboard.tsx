import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import ClassLeaderboardPanel from '../../components/classes/ClassLeaderboardPanel';
import { classesAPI } from '../../utils/api';

export const ClassLeaderboard: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [className, setClassName] = React.useState<string>('');

    React.useEffect(() => {
        if (!classId) {
            return;
        }

        void classesAPI.getById(classId).then((data) => {
            setClassName(data.name);
        }).catch((error) => {
            console.error('Failed to load class info for leaderboard', error);
        });
    }, [classId]);

    if (!classId) {
        return null;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1280px', margin: '0 auto', padding: '1.5rem' }}>
            <button
                onClick={() => navigate(`/student/class/${classId}`)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', fontWeight: '600' }}
            >
                <ArrowLeft size={18} />
                Kembali ke kelas
            </button>

            <ClassLeaderboardPanel classId={classId} className={className} viewer="student" />
        </div>
    );
};

export default ClassLeaderboard;
