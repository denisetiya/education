import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import env from '../config/env';

export const securityHeadersMiddleware = helmet({
    crossOriginResourcePolicy: false
});

export const apiRateLimitMiddleware = rateLimit({
    windowMs: env.generalRateLimitWindowMs,
    limit: env.generalRateLimitMax,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});

export const authRateLimitMiddleware = rateLimit({
    windowMs: env.authRateLimitWindowMs,
    limit: env.authRateLimitMax,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { error: 'Too many authentication attempts, please try again later.' }
});
