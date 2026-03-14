import { Request, Response, NextFunction } from 'express';
import { AppRole } from '../utils/auth';
export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: AppRole;
    };
}
export declare const authMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const requireRole: (...roles: AppRole[]) => (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.middleware.d.ts.map