import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_FRONTEND_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:1420',
    'http://localhost:1420',
    'http://tauri.localhost',
    'https://tauri.localhost'
];
const DEFAULT_DEV_DATABASE_URL = 'file:./dev.db';
const DEFAULT_DEV_JWT_SECRET = 'development-only-secret-change-before-production';

const parseOrigins = (value?: string) =>
    (value || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

const parseInteger = (value: string | undefined, fallback: number) => {
    if (!value) {
        return fallback;
    }

    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const nodeEnv = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const isProduction = nodeEnv === 'production';

process.env.DATABASE_URL ??= DEFAULT_DEV_DATABASE_URL;

if (isProduction && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be configured in production');
}

process.env.JWT_SECRET ??= DEFAULT_DEV_JWT_SECRET;

const env = {
    nodeEnv,
    isProduction,
    port: parseInteger(process.env.PORT, 3001),
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtIssuer: process.env.JWT_ISSUER || 'geo-education',
    jwtAudience: process.env.JWT_AUDIENCE || 'geo-education-app',
    authCookieName: process.env.AUTH_COOKIE_NAME || 'token',
    frontendOrigins: Array.from(
        new Set([
            ...DEFAULT_FRONTEND_ORIGINS,
            ...parseOrigins(process.env.FRONTEND_URL),
            ...parseOrigins(process.env.FRONTEND_ADDITIONAL_ORIGINS)
        ])
    ),
    requestBodyLimit: process.env.REQUEST_BODY_LIMIT || '5mb',
    bcryptRounds: parseInteger(process.env.BCRYPT_ROUNDS, 10),
    generalRateLimitWindowMs: parseInteger(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    generalRateLimitMax: parseInteger(process.env.RATE_LIMIT_MAX, isProduction ? 400 : 2000),
    authRateLimitWindowMs: parseInteger(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    authRateLimitMax: parseInteger(process.env.AUTH_RATE_LIMIT_MAX, isProduction ? 10 : 50)
} as const;

export default env;
