"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeRoleForSelfRegistration = exports.extractAuthToken = exports.verifyAuthToken = exports.signAuthToken = exports.clearAuthCookieOptions = exports.authCookieOptions = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = __importDefault(require("../config/env"));
exports.authCookieOptions = {
    httpOnly: true,
    secure: env_1.default.isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
};
exports.clearAuthCookieOptions = {
    ...exports.authCookieOptions,
    maxAge: 0
};
const signAuthToken = (payload) => jsonwebtoken_1.default.sign(payload, env_1.default.jwtSecret, {
    expiresIn: '7d',
    issuer: env_1.default.jwtIssuer,
    audience: env_1.default.jwtAudience
});
exports.signAuthToken = signAuthToken;
const verifyAuthToken = (token) => jsonwebtoken_1.default.verify(token, env_1.default.jwtSecret, {
    issuer: env_1.default.jwtIssuer,
    audience: env_1.default.jwtAudience
});
exports.verifyAuthToken = verifyAuthToken;
const extractAuthToken = (cookieToken, authorizationHeader) => {
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
exports.extractAuthToken = extractAuthToken;
const sanitizeRoleForSelfRegistration = (requestedRole) => {
    if (!requestedRole || requestedRole === 'STUDENT') {
        return 'STUDENT';
    }
    throw new Error('SELF_REGISTRATION_ROLE_NOT_ALLOWED');
};
exports.sanitizeRoleForSelfRegistration = sanitizeRoleForSelfRegistration;
//# sourceMappingURL=auth.js.map