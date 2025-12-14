export interface User {
    id: string;
    email: string;
    name: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
    xp: number;
    level: number;
    streak: number;
    avatar?: string;
}

export interface AuthResponse {
    user: User;
    token?: string;
}

export interface ClassItem {
    id: string;
    name: string;
    subject: string;
    description?: string;
    code: string;
    teacherId: string;
    teacher?: { name: string };
    _count?: {
        students: number;
        modules: number;
    };
}

export interface Material {
    id: string;
    title: string;
    type: string;
    category: string;
    level: string;
    content?: string;
    moduleId?: string;
    moduleOrder?: number;
}

export interface Module {
    id: string;
    title: string;
    description?: string;
    grade: number;
    semester: number;
    subject: string;
    order: number;
    materials?: Material[];
}

export interface LeaderboardEntry {
    userId: string;
    user: { name: string; avatar?: string };
    xp: number;
    rank: number;
}

export interface ProgressHistory {
    id: string;
    materialId: string;
    status: string;
    score?: number;
    timeSpent: number;
    completedAt?: string;
    material: { title: string; type: string };
}

export interface QuizResult {
    hasLinkedQuiz: boolean;
    passed: boolean;
    score: number | null;
    minPassingScore: number | null;
    quizId?: string;
    quizTitle?: string;
    quizCompleted?: boolean;
}
