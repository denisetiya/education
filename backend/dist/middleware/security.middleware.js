"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRateLimitMiddleware = exports.apiRateLimitMiddleware = exports.securityHeadersMiddleware = void 0;
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = __importDefault(require("../config/env"));
exports.securityHeadersMiddleware = (0, helmet_1.default)({
    crossOriginResourcePolicy: false
});
exports.apiRateLimitMiddleware = (0, express_rate_limit_1.default)({
    windowMs: env_1.default.generalRateLimitWindowMs,
    limit: env_1.default.generalRateLimitMax,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});
exports.authRateLimitMiddleware = (0, express_rate_limit_1.default)({
    windowMs: env_1.default.authRateLimitWindowMs,
    limit: env_1.default.authRateLimitMax,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { error: 'Too many authentication attempts, please try again later.' }
});
//# sourceMappingURL=security.middleware.js.map