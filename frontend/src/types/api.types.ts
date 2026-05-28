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
    questionResults?: string | null;
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
    questionSet?: string | null;
    questionCount?: number;
    questionTypes?: string[];
    isPublished: boolean;
    attempts?: ExerciseAttemptSummary[];
}

export interface ClassLeaderboardBadge {
    id: string;
    label: string;
    icon: string;
    tone: string;
}

export interface ClassLeaderboardEntry {
    rank: number;
    studentId: string;
    name: string;
    email: string;
    avatar?: string | null;
    level: number;
    globalXp: number;
    classXp: number;
    materialXp: number;
    exerciseXp: number;
    achievementXp: number;
    completionRate: number;
    completedMaterials: number;
    discussionCount: number;
    pendingReviews: number;
    solvedQuestions: number;
    isCurrentUser?: boolean;
    badges: ClassLeaderboardBadge[];
}

export interface ClassDiscussionReply {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    author: {
        id: string;
        name: string;
        role: string;
    };
}

export interface ClassDiscussionThread {
    id: string;
    title: string;
    content: string;
    isPinned: boolean;
    isLocked: boolean;
    createdAt: string;
    updatedAt: string;
    author: {
        id: string;
        name: string;
        role: string;
    };
    replies: ClassDiscussionReply[];
    _count?: {
        replies: number;
    };
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

// Analytics types
export interface TimeFilter {
    startDate: string;
    endDate: string;
}

export interface ClassAnalytics {
    classInfo: {
        id: string;
        name: string;
        subject: string;
        studentCount: number;
        moduleCount: number;
        materialCount: number;
        exerciseCount: number;
    };
    timeFilter: TimeFilter;
    overview: {
        completionRate: number;
        avgScore: number;
        avgTimeSpent: number;
        activeStudents: number;
        totalAccessCount: number;
        totalExerciseAttempts: number;
        totalDiscussions: number;
    };
    studentProgress: StudentProgressEntry[];
    materialActivity: MaterialActivityEntry[];
    dailyActivity: DailyActivityEntry[];
    quizPerformance: QuizPerformanceEntry[];
    exercisePerformance: ExercisePerformanceEntry[];
    behaviorOverview: BehaviorOverview;
}

export interface StudentProgressEntry {
    studentId: string;
    name: string;
    email: string;
    level: number;
    xp: number;
    completedMaterials: number;
    totalMaterials: number;
    completionPercent: number;
    avgScore: number;
    totalTimeSpent: number;
    quizPassed: number;
    quizTotal: number;
    quizPassPercent: number;
    isActive: boolean;
}

export interface MaterialActivityEntry {
    materialId: string;
    title: string;
    type: string;
    accessCount: number;
    uniqueStudents: number;
    avgTimeSpent: number;
    completionRate: number;
}

export interface DailyActivityEntry {
    date: string;
    accessCount: number;
    quizAttempts: number;
    exerciseAttempts: number;
    discussions: number;
    totalActions: number;
}

export interface QuizPerformanceEntry {
    materialId: string;
    title: string;
    attemptCount: number;
    passCount: number;
    passRate: number;
    avgScore: number;
    avgTimeSpent: number;
}

export interface ExercisePerformanceEntry {
    exerciseId: string;
    title: string;
    points: number;
    type: string;
    difficulty: string;
    attemptCount: number;
    uniqueStudents: number;
    avgScore: number;
    maxScore: number;
    passRate: number;
}

export interface BehaviorOverview {
    totalAccesses: number;
    totalQuizAttempts: number;
    totalExerciseAttempts: number;
    totalDiscussions: number;
    avgSessionDuration: number;
    peakActivityDay: string;
    mostActiveStudent: { name: string; completedMaterials: number } | null;
    leastActiveStudent: { name: string; completedMaterials: number } | null;
}

export interface TeacherAnalyticsData {
    timeFilter: TimeFilter;
    overview: {
        avgScore: number;
        participationRate: number;
        totalTasks: number;
        avgTimeSpent: number;
        totalStudents: number;
        totalClasses: number;
        totalMaterials: number;
        activeStudents: number;
        exerciseAvgScore: number;
    };
    weeklyPerformance: Array<{
        date: string;
        score: number;
        participation: number;
        completions: number;
        avgScore: number;
    }>;
    studentsAtRisk: Array<{
        name: string;
        issue: string;
        score: number;
        progress: number;
        lastActive: string;
    }>;
    classSummaries: Array<{
        id: string;
        name: string;
        subject: string;
        studentCount: number;
        averageProgress: number;
        activeStudents: number;
        avgExerciseScore: number;
        totalCompletions: number;
    }>;
}
