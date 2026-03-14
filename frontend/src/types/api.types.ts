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

export interface TeacherSummary {
    id?: string;
    name: string;
    email?: string;
}

export interface LinkedQuizSummary {
    id: string;
    title: string;
    type: string;
}

export interface ClassItem {
    id: string;
    name: string;
    subject: string;
    description?: string;
    code: string;
    isPublic: boolean;
    progressionMode: string;
    thumbnail?: string;
    xpMultiplier: number;
    geogebraEnabled?: boolean;
    teacherId: string;
    teacher?: TeacherSummary;
    _count?: {
        students: number;
        modules: number;
    };
    modules?: Module[];
}

export interface Material {
    id: string;
    title: string;
    type: string;
    category: string;
    level: string;
    content: string | null;
    semester: number;
    grade: number;
    createdAt: string;
    updatedAt?: string;
    moduleId?: string | null;
    moduleOrder?: number | null;
    linkedQuizId?: string | null;
    linkedQuiz?: LinkedQuizSummary | null;
    minPassingScore?: number | null;
    order?: number | null;
    createdBy?: { name: string };
}

export interface Module {
    id: string;
    title: string;
    description?: string;
    grade: number;
    semester: number;
    subject: string;
    order: number;
    classId?: string | null;
    materials: Material[];
}

export interface LeaderboardEntry {
    rank: number;
    id: string;
    name: string;
    xp: number;
    level: number;
    avatar?: string | null;
}

export interface ProgressHistory {
    id: string;
    materialId: string;
    status: string;
    score?: number;
    timeSpent: number;
    completedAt: string | null;
    updatedAt: string;
    material: {
        id: string;
        title: string;
        type: string;
        category: string;
        level: string;
        grade: number;
        semester: number;
    };
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

export type ExerciseGradingStatus = 'graded' | 'pending_review';

export interface ExerciseAttemptSummary {
    id: string;
    isCorrect: boolean;
    score: number;
    createdAt: string;
    gradingStatus: ExerciseGradingStatus;
    feedback?: string | null;
    gradedAt?: string | null;
    answer?: string | null;
    canvasData?: string | null;
    timeSpent?: number;
    student?: {
        id: string;
        name: string;
        email?: string;
    };
}

export interface ClassExerciseSummary {
    id: string;
    title: string;
    description?: string | null;
    instructions?: string | null;
    exerciseType: string;
    difficulty: string;
    points: number;
    hasTimer: boolean;
    timerMinutes?: number | null;
    canvasState?: string | null;
    canvasMode: string;
    answerType: string;
    correctAnswer?: string | null;
    options?: string | null;
    isPublished: boolean;
    attempts?: ExerciseAttemptSummary[];
}

export interface TeacherDashboardData {
    stats: {
        totalClasses: number;
        totalStudents: number;
        totalMaterials: number;
        totalExercises: number;
        publishedExercises: number;
        pendingReviews: number;
    };
    classes: Array<ClassItem & {
        _count: {
            students: number;
            modules: number;
            exercises: number;
        };
    }>;
    recentMaterials: Array<Pick<Material, 'id' | 'title' | 'type' | 'category' | 'grade' | 'semester' | 'createdAt'>>;
    pendingReviews: Array<{
        id: string;
        createdAt: string;
        exerciseId: string;
        exercise: {
            id: string;
            title: string;
            points: number;
            class: {
                id: string;
                name: string;
            };
        };
        student: {
            id: string;
            name: string;
            email: string;
        };
    }>;
    recentSubmissions: Array<{
        id: string;
        createdAt: string;
        gradingStatus: ExerciseGradingStatus;
        score: number;
        exercise: {
            id: string;
            title: string;
            class: {
                id: string;
                name: string;
            };
        };
        student: {
            id: string;
            name: string;
        };
    }>;
}
