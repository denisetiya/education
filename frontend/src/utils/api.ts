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
        apiFetch<{ user: any }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

    login: (data: { email: string; password: string }) =>
        apiFetch<{ user: any }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

    logout: () =>
        apiFetch<{ message: string }>('/auth/logout', {
            method: 'POST'
        }),

    me: () => apiFetch<any>('/auth/me')
};

// Users API
export const usersAPI = {
    getAll: () => apiFetch<any[]>('/users'),
    getById: (id: string) => apiFetch<any>(`/users/${id}`),
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
        return apiFetch<any[]>(`/materials?${params.toString()}`);
    },
    getById: (id: string) => apiFetch<any>(`/materials/${id}`),
    create: (data: any) =>
        apiFetch<any>('/materials', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
        apiFetch<any>(`/materials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
        apiFetch<any>(`/materials/${id}`, { method: 'DELETE' })
};

// Leaderboard API
export const leaderboardAPI = {
    get: (limit: number = 10) => apiFetch<any[]>(`/leaderboard?limit=${limit}`)
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
        return apiFetch<any[]>(`/progress/history?${params.toString()}`);
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
    complete: (materialId: string, timeSpent?: number) =>
        apiFetch<any>('/progress/complete', {
            method: 'POST',
            body: JSON.stringify({ materialId, timeSpent })
        })
};
