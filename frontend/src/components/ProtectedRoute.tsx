import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-gradient)'
            }}>
                <Loader size={40} className="animate-spin" color="var(--primary)" />
            </div>
        );
    }

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role if allowedRoles specified
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        const roleRedirects: Record<string, string> = {
            STUDENT: '/student',
            TEACHER: '/teacher',
            ADMIN: '/admin'
        };
        const redirectPath = roleRedirects[user.role] || '/';
        return <Navigate to={redirectPath} replace />;
    }

    return <>{children}</>;
};

// Helper function to get redirect path based on role
export const getRoleBasedRedirect = (role: string): string => {
    switch (role) {
        case 'STUDENT':
            return '/student';
        case 'TEACHER':
            return '/teacher';
        case 'ADMIN':
            return '/admin';
        default:
            return '/';
    }
};
