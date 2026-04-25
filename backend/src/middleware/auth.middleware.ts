import { Request, Response, NextFunction } from 'express';
import type { ParamsFlatDictionary } from 'express-serve-static-core';
import env from '../config/env';
import { AppRole, extractAuthToken, verifyAuthToken } from '../utils/auth';

export interface AuthRequest<P extends ParamsFlatDictionary = ParamsFlatDictionary> extends Request<P> {
    user?: {
        id: string;
        role: AppRole;
    };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = extractAuthToken(req.cookies?.[env.authCookieName], req.headers.authorization);

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = verifyAuthToken(token);
        req.user = {
            id: decoded.userId,
            role: decoded.role
        };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

export const requireRole = (...roles: AppRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user?.role || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};
