import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authAPI } from '../utils/api';
import { setStoredAuthToken } from '../utils/auth-token';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    xp?: number;
    level?: number;
    streak?: number;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<User>;
    register: (email: string, password: string, name: string) => Promise<User>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is authenticated by calling /me endpoint
        authAPI.me()
            .then(setUser)
            .catch(() => {
                setStoredAuthToken(null);
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const login = async (email: string, password: string): Promise<User> => {
        const { user, token } = await authAPI.login({ email, password });
        setStoredAuthToken(token || null);
        setUser(user);
        return user;
    };

    const register = async (email: string, password: string, name: string): Promise<User> => {
        const { user, token } = await authAPI.register({ email, password, name });
        setStoredAuthToken(token || null);
        setUser(user);
        return user;
    };

    const logout = async () => {
        await authAPI.logout();
        setStoredAuthToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

