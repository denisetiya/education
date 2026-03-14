import type { CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';

export type AppRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface AuthTokenPayload {
    userId: string;
    role: AppRole;
}

export const authCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
};

export const clearAuthCookieOptions: CookieOptions = {
    ...authCookieOptions,
    maxAge: 0
};

export const signAuthToken = (payload: AuthTokenPayload) =>
    jwt.sign(payload, env.jwtSecret, {
        expiresIn: '7d',
        issuer: env.jwtIssuer,
        audience: env.jwtAudience
    });

export const verifyAuthToken = (token: string) =>
    jwt.verify(token, env.jwtSecret, {
        issuer: env.jwtIssuer,
        audience: env.jwtAudience
    }) as AuthTokenPayload;

export const extractAuthToken = (cookieToken?: string, authorizationHeader?: string) => {
    if (cookieToken) {
        return cookieToken;
    }

    if (!authorizationHeader) {
        return null;
    }

    const [scheme, token] = authorizationHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return null;
    }

    return token;
};

export const sanitizeRoleForSelfRegistration = (requestedRole?: string): AppRole => {
    if (!requestedRole || requestedRole === 'STUDENT') {
        return 'STUDENT';
    }

    throw new Error('SELF_REGISTRATION_ROLE_NOT_ALLOWED');
};
