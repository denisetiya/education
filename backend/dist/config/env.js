"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const DEFAULT_FRONTEND_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:1420',
    'http://localhost:1420',
    'http://tauri.localhost',
    'https://tauri.localhost'
];
const DEFAULT_DEV_DATABASE_URL = 'file:./dev.db';
const DEFAULT_DEV_JWT_SECRET = 'development-only-secret-change-before-production';
const parseOrigins = (value) => (value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const parseInteger = (value, fallback) => {
    if (!value) {
        return fallback;
    }
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
};
const nodeEnv = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const isProduction = nodeEnv === 'production';
(_a = process.env).DATABASE_URL ?? (_a.DATABASE_URL = DEFAULT_DEV_DATABASE_URL);
if (isProduction && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be configured in production');
}
(_b = process.env).JWT_SECRET ?? (_b.JWT_SECRET = DEFAULT_DEV_JWT_SECRET);
const env = {
    nodeEnv,
    isProduction,
    port: parseInteger(process.env.PORT, 3001),
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtIssuer: process.env.JWT_ISSUER || 'geo-education',
    jwtAudience: process.env.JWT_AUDIENCE || 'geo-education-app',
    authCookieName: process.env.AUTH_COOKIE_NAME || 'token',
    frontendOrigins: Array.from(new Set([...DEFAULT_FRONTEND_ORIGINS, ...parseOrigins(process.env.FRONTEND_URL)])),
    requestBodyLimit: process.env.REQUEST_BODY_LIMIT || '5mb',
    bcryptRounds: parseInteger(process.env.BCRYPT_ROUNDS, 10),
    generalRateLimitWindowMs: parseInteger(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    generalRateLimitMax: parseInteger(process.env.RATE_LIMIT_MAX, isProduction ? 400 : 2000),
    authRateLimitWindowMs: parseInteger(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    authRateLimitMax: parseInteger(process.env.AUTH_RATE_LIMIT_MAX, isProduction ? 10 : 50)
};
exports.default = env;
//# sourceMappingURL=env.js.map