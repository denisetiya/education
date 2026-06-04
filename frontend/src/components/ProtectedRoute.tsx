import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, loading, isAuthenticated, lastUnauthorized } = useAuth();
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

    // Not authenticated - redirect to login (covers expired/invalid token from AuthContext reset)
    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location,
                    notice: lastUnauthorized
                        ? (lastUnauthorized.reason === 'expired'
                            ? 'Sesi Anda telah berakhir. Silakan masuk kembali.'
                            : 'Akses tidak diizinkan. Silakan masuk dengan akun yang sesuai.')
                        : null
                }}
            />
        );
    }

    // Check role if allowedRoles specified
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Role mismatch - kick back to landing/login instead of another role's dashboard
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location,
                    notice: 'Hak akses tidak sesuai. Silakan masuk dengan akun yang benar.'
                }}
            />
        );
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
