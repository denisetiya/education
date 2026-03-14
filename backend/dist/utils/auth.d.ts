import type { CookieOptions } from 'express';
export type AppRole = 'STUDENT' | 'TEACHER' | 'ADMIN';
export interface AuthTokenPayload {
    userId: string;
    role: AppRole;
}
export declare const authCookieOptions: CookieOptions;
export declare const clearAuthCookieOptions: CookieOptions;
export declare const signAuthToken: (payload: AuthTokenPayload) => string;
export declare const verifyAuthToken: (token: string) => AuthTokenPayload;
export declare const extractAuthToken: (cookieToken?: string, authorizationHeader?: string) => string | null;
export declare const sanitizeRoleForSelfRegistration: (requestedRole?: string) => AppRole;
//# sourceMappingURL=auth.d.ts.map