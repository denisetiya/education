import type { AuthResponse, ClassItem, LeaderboardEntry, Material, Module, ProgressHistory, QuizResult, User } from '../types/api.types';

const API_BASE_URL = 'http://localhost:3001/api';

// Generic fetch wrapper with credentials (cookies)
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers
    };

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
    register: (data: { email: string; password: string; name: string; role?: string }) =>
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
    update: (id: string, data: any) =>
        apiFetch<any>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
        apiFetch<any>(`/users/${id}`, { method: 'DELETE' })
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
    create: (data: any) =>
        apiFetch<Material>('/materials', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
        apiFetch<Material>(`/materials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
        apiFetch<any>(`/materials/${id}`, { method: 'DELETE' })
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
    create: (data: any) =>
        apiFetch<Module>('/modules', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
        apiFetch<Module>(`/modules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    reorder: (orderedIds: string[]) =>
        apiFetch<any>('/modules/reorder', { method: 'PUT', body: JSON.stringify({ orderedIds }) }),
    assignMaterials: (moduleId: string, materialIds: string[]) =>
        apiFetch<any>(`/modules/${moduleId}/materials`, { method: 'POST', body: JSON.stringify({ materialIds }) }),
    getByClass: (classId: string) => apiFetch<Module[]>(`/modules/by-class/${classId}`),
    getUnassigned: () => apiFetch<Module[]>('/modules/unassigned'),
    assignToClass: (moduleId: string, classId: string | null) =>
        apiFetch<Module>(`/modules/${moduleId}/assign-class`, { method: 'PUT', body: JSON.stringify({ classId }) }),
    delete: (id: string) =>
        apiFetch<any>(`/modules/${id}`, { method: 'DELETE' })
};

// Leaderboard API
export const leaderboardAPI = {
    get: (limit: number = 10) => apiFetch<LeaderboardEntry[]>(`/leaderboard?limit=${limit}`)
};

// Dashboard API
export const dashboardAPI = {
    student: () => apiFetch<any>('/dashboard/student'),
    teacher: () => apiFetch<any>('/dashboard/teacher'),
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
        apiFetch<any>('/classes/join', { method: 'POST', body: JSON.stringify({ code }) }),
    addModule: (classId: string, moduleData: any) =>
        apiFetch<any>(`/classes/${classId}/modules`, { method: 'POST', body: JSON.stringify(moduleData) }),
    
    // Public class discovery
    getPublic: (filters?: { search?: string; subject?: string }) => {
        const params = new URLSearchParams();
        if (filters?.search) params.append('search', filters.search);
        if (filters?.subject) params.append('subject', filters.subject);
        return apiFetch<any[]>(`/classes/public/discover?${params.toString()}`);
    },
    getPublicById: (id: string) => apiFetch<any>(`/classes/public/${id}`),
    
    // Class settings
    updateSettings: (id: string, settings: { isPublic?: boolean; progressionMode?: string; thumbnail?: string; xpMultiplier?: number; geogebraEnabled?: boolean }) =>
        apiFetch<any>(`/classes/${id}/settings`, { method: 'PUT', body: JSON.stringify(settings) }),
    
    // Class dashboard
    getDashboard: (id: string) => apiFetch<any>(`/classes/${id}/dashboard`),
    
    // Achievements
    getAchievements: (classId: string) => apiFetch<any[]>(`/classes/${classId}/achievements`),
    createAchievement: (classId: string, data: { title: string; description: string; icon?: string; xpReward?: number; condition: any }) =>
        apiFetch<any>(`/classes/${classId}/achievements`, { method: 'POST', body: JSON.stringify(data) }),
    claimAchievement: (classId: string, achievementId: string) =>
        apiFetch<any>(`/classes/${classId}/achievements/${achievementId}/claim`, { method: 'POST' }),
    
    // Books (Library)
    getBooks: (classId: string) => apiFetch<any[]>(`/classes/${classId}/books`),
    createBook: (classId: string, data: { title: string; author?: string; description?: string; coverUrl?: string; contentType: string; content?: string; pdfUrl?: string }) =>
        apiFetch<any>(`/classes/${classId}/books`, { method: 'POST', body: JSON.stringify(data) }),
    updateBook: (classId: string, bookId: string, data: any) =>
        apiFetch<any>(`/classes/${classId}/books/${bookId}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteBook: (classId: string, bookId: string) =>
        apiFetch<any>(`/classes/${classId}/books/${bookId}`, { method: 'DELETE' })
};
