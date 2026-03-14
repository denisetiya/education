import type {
    AuthResponse,
    ClassDiscussionReply,
    ClassDiscussionThread,
    ClassExerciseSummary,
    ClassLeaderboardEntry,
    ClassItem,
    ExerciseAttemptSummary,
    LeaderboardEntry,
    Material,
    Module,
    ProgressHistory,
    QuizResult,
    TeacherDashboardData,
    User
} from '../types/api.types';
import { getStoredAuthToken } from './auth-token';

// In production, VITE_API_URL is empty and we use relative /api path (proxied by nginx)
// In development, VITE_API_URL defaults to http://localhost:3001/api
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Generic fetch wrapper with credentials (cookies)
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const headers = new Headers({
        'Content-Type': 'application/json',
        ...options.headers
    });

    const authToken = getStoredAuthToken();
    if (authToken && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${authToken}`);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include' // Include cookies in requests
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Request failed');
    }

    return response.json();
}

// Auth API
export const authAPI = {
    register: (data: { email: string; password: string; name: string }) =>
        apiFetch<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

    login: (data: { email: string; password: string }) =>
        apiFetch<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

    logout: () =>
        apiFetch<{ message: string }>('/auth/logout', {
            method: 'POST'
        }),

    me: () => apiFetch<User>('/auth/me')
};

// Users API
export const usersAPI = {
    getAll: () => apiFetch<User[]>('/users'),
    getById: (id: string) => apiFetch<User>(`/users/${id}`),
    update: (id: string, data: Record<string, unknown>) =>
        apiFetch<Record<string, unknown>>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
        apiFetch<Record<string, unknown>>(`/users/${id}`, { method: 'DELETE' })
};

// Materials API
export const materialsAPI = {
    getAll: (filters?: { category?: string; type?: string; grade?: number; semester?: number; search?: string }) => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) params.append(key, String(value));
            });
        }
        return apiFetch<Material[]>(`/materials?${params.toString()}`);
    },
    getById: (id: string) => apiFetch<Material>(`/materials/${id}`),
    getQuizzes: () => apiFetch<Material[]>('/materials/quizzes'),
    create: (data: Record<string, unknown>) =>
        apiFetch<Material>('/materials', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
        apiFetch<Material>(`/materials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
        apiFetch<Record<string, unknown>>(`/materials/${id}`, { method: 'DELETE' })
};

// Modules API
export const modulesAPI = {
    getAll: (filters?: { grade?: number; semester?: number; subject?: string }) => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) params.append(key, String(value));
            });
        }
        return apiFetch<Module[]>(`/modules?${params.toString()}`);
    },
    create: (data: Record<string, unknown>) =>
        apiFetch<Module>('/modules', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
        apiFetch<Module>(`/modules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    reorder: (orderedIds: string[]) =>
        apiFetch<Record<string, unknown>>('/modules/reorder', { method: 'PUT', body: JSON.stringify({ orderedIds }) }),
    assignMaterials: (moduleId: string, materialIds: string[]) =>
        apiFetch<Record<string, unknown>>(`/modules/${moduleId}/materials`, { method: 'POST', body: JSON.stringify({ materialIds }) }),
    getByClass: (classId: string) => apiFetch<Module[]>(`/modules/by-class/${classId}`),
    getUnassigned: () => apiFetch<Module[]>('/modules/unassigned'),
    assignToClass: (moduleId: string, classId: string | null) =>
        apiFetch<Module>(`/modules/${moduleId}/assign-class`, { method: 'PUT', body: JSON.stringify({ classId }) }),
    delete: (id: string) =>
        apiFetch<Record<string, unknown>>(`/modules/${id}`, { method: 'DELETE' })
};

// Leaderboard API
export const leaderboardAPI = {
    get: (limit: number = 10) => apiFetch<LeaderboardEntry[]>(`/leaderboard?limit=${limit}`)
};

// Dashboard API
export const dashboardAPI = {
    student: () => apiFetch<any>('/dashboard/student'),
    teacher: () => apiFetch<TeacherDashboardData>('/dashboard/teacher'),
    admin: () => apiFetch<any>('/dashboard/admin')
};

// Progress API
export const progressAPI = {
    getHistory: (limit: number = 20, status?: string) => {
        const params = new URLSearchParams({ limit: String(limit) });
        if (status) params.append('status', status);
        return apiFetch<ProgressHistory[]>(`/progress/history?${params.toString()}`);
    },
    getMaterialProgress: (materialId: string) =>
        apiFetch<any>(`/progress/material/${materialId}`),
    start: (materialId: string) =>
        apiFetch<any>('/progress/start', {
            method: 'POST',
            body: JSON.stringify({ materialId })
        }),
    update: (materialId: string, data: { timeSpent?: number; progress?: number }) =>
        apiFetch<any>('/progress/update', {
            method: 'PUT',
            body: JSON.stringify({ materialId, ...data })
        }),
    complete: (materialId: string, timeSpent: number, score?: number) =>
        apiFetch<any>('/progress/complete', { method: 'POST', body: JSON.stringify({ materialId, timeSpent, score }) }),
    getMap: () => apiFetch<Record<string, { status: string; score: number | null }>>('/progress/map'),
    checkQuizPassed: (materialId: string) =>
        apiFetch<QuizResult>(`/progress/quiz-passed/${materialId}`)
};

// Classes API
export const classesAPI = {
    getAll: () => apiFetch<ClassItem[]>('/classes'),
    getById: (id: string) => apiFetch<ClassItem>(`/classes/${id}`),
    create: (data: { name: string; subject?: string; description?: string }) =>
        apiFetch<ClassItem>('/classes', { method: 'POST', body: JSON.stringify(data) }),
    join: (code: string) =>
        apiFetch<Record<string, unknown>>('/classes/join', { method: 'POST', body: JSON.stringify({ code }) }),
    addModule: (classId: string, moduleData: Record<string, unknown>) =>
        apiFetch<Record<string, unknown>>(`/classes/${classId}/modules`, { method: 'POST', body: JSON.stringify(moduleData) }),
    
    // Public class discovery
    getPublic: (filters?: { search?: string; subject?: string }) => {
        const params = new URLSearchParams();
        if (filters?.search) params.append('search', filters.search);
        if (filters?.subject) params.append('subject', filters.subject);
        return apiFetch<ClassItem[]>(`/classes/public/discover?${params.toString()}`);
    },
    getPublicById: (id: string) => apiFetch<ClassItem>(`/classes/public/${id}`),
    
    // Class settings
    updateSettings: (id: string, settings: { isPublic?: boolean; progressionMode?: string; thumbnail?: string; xpMultiplier?: number; geogebraEnabled?: boolean }) =>
        apiFetch<any>(`/classes/${id}/settings`, { method: 'PUT', body: JSON.stringify(settings) }),

    // Class dashboard
    getDashboard: (id: string) => apiFetch<any>(`/classes/${id}/dashboard`),

    // Achievements
    getAchievements: (classId: string) => apiFetch<any[]>(`/classes/${classId}/achievements`),
    createAchievement: (classId: string, data: { title: string; description: string; icon?: string; xpReward?: number; condition: string }) =>
        apiFetch<any>(`/classes/${classId}/achievements`, { method: 'POST', body: JSON.stringify(data) }),
    claimAchievement: (classId: string, achievementId: string) =>
        apiFetch<any>(`/classes/${classId}/achievements/${achievementId}/claim`, { method: 'POST' }),

    // Class leaderboard
    getLeaderboard: (classId: string) => apiFetch<ClassLeaderboardEntry[]>(`/classes/${classId}/leaderboard`),

    // Class discussions
    getDiscussions: (classId: string) => apiFetch<ClassDiscussionThread[]>(`/classes/${classId}/discussions`),
    createDiscussion: (classId: string, data: { title: string; content: string }) =>
        apiFetch<ClassDiscussionThread>(`/classes/${classId}/discussions`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    replyDiscussion: (classId: string, threadId: string, data: { content: string }) =>
        apiFetch<ClassDiscussionReply>(`/classes/${classId}/discussions/${threadId}/replies`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    pinDiscussion: (classId: string, threadId: string, value: boolean) =>
        apiFetch<ClassDiscussionThread>(`/classes/${classId}/discussions/${threadId}/pin`, {
            method: 'PATCH',
            body: JSON.stringify({ value })
        }),
    lockDiscussion: (classId: string, threadId: string, value: boolean) =>
        apiFetch<ClassDiscussionThread>(`/classes/${classId}/discussions/${threadId}/lock`, {
            method: 'PATCH',
            body: JSON.stringify({ value })
        }),

    // Books (Library)
    getBooks: (classId: string) => apiFetch<any[]>(`/classes/${classId}/books`),
    createBook: (classId: string, data: { title: string; author?: string; description?: string; coverUrl?: string; contentType: string; content?: string; pdfUrl?: string }) =>
        apiFetch<any>(`/classes/${classId}/books`, { method: 'POST', body: JSON.stringify(data) }),
    updateBook: (classId: string, bookId: string, data: Record<string, unknown>) =>
        apiFetch<any>(`/classes/${classId}/books/${bookId}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteBook: (classId: string, bookId: string) =>
        apiFetch<any>(`/classes/${classId}/books/${bookId}`, { method: 'DELETE' }),

    // Exercises (Interactive Geometry)
    getExercises: (classId: string) => apiFetch<ClassExerciseSummary[]>(`/classes/${classId}/exercises`),
    getExercise: (classId: string, exerciseId: string) => apiFetch<ClassExerciseSummary>(`/classes/${classId}/exercises/${exerciseId}`),
    createExercise: (classId: string, data: {
        title: string;
        description?: string;
        instructions?: string;
        exerciseType?: string;
        difficulty?: string;
        points?: number;
        hasTimer?: boolean;
        timerMinutes?: number | null;
        canvasState?: string | null;
        canvasMode?: string;
        answerType?: string;
        correctAnswer?: string | null;
        options?: string | null;
        questionSet?: unknown[];
        isPublished?: boolean;
        order?: number;
    }) => apiFetch<ClassExerciseSummary>(`/classes/${classId}/exercises`, { method: 'POST', body: JSON.stringify(data) }),
    updateExercise: (classId: string, exerciseId: string, data: Record<string, unknown>) =>
        apiFetch<ClassExerciseSummary>(`/classes/${classId}/exercises/${exerciseId}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteExercise: (classId: string, exerciseId: string) =>
        apiFetch<any>(`/classes/${classId}/exercises/${exerciseId}`, { method: 'DELETE' }),
    submitExerciseAttempt: (classId: string, exerciseId: string, data: { answer: unknown; canvasData?: string; timeSpent?: number }) =>
        apiFetch<{
            attempt: ExerciseAttemptSummary;
            gradingStatus: 'graded' | 'pending_review';
            isCorrect: boolean | null;
            score: number;
            message: string;
        }>(`/classes/${classId}/exercises/${exerciseId}/attempt`, { method: 'POST', body: JSON.stringify(data) }),
    gradeExerciseAttempt: (classId: string, exerciseId: string, attemptId: string, data: { score: number; isCorrect?: boolean; feedback?: string }) =>
        apiFetch<{ message: string; attempt: ExerciseAttemptSummary }>(
            `/classes/${classId}/exercises/${exerciseId}/attempts/${attemptId}/grade`,
            { method: 'POST', body: JSON.stringify(data) }
        )
};
