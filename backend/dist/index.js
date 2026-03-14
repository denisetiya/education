"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const material_routes_1 = __importDefault(require("./routes/material.routes"));
const leaderboard_routes_1 = __importDefault(require("./routes/leaderboard.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const progress_routes_1 = __importDefault(require("./routes/progress.routes"));
const module_routes_1 = __importDefault(require("./routes/module.routes"));
const class_routes_1 = __importDefault(require("./routes/class.routes"));
const env_1 = __importDefault(require("./config/env"));
const error_middleware_1 = require("./middleware/error.middleware");
const security_middleware_1 = require("./middleware/security.middleware");
const app = (0, express_1.default)();
app.disable('x-powered-by');
app.set('trust proxy', env_1.default.isProduction ? 1 : false);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }
        if (env_1.default.frontendOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(security_middleware_1.securityHeadersMiddleware);
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: env_1.default.requestBodyLimit }));
app.use(express_1.default.urlencoded({ extended: true, limit: env_1.default.requestBodyLimit }));
app.use(security_middleware_1.apiRateLimitMiddleware);
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        environment: env_1.default.nodeEnv,
        timestamp: new Date().toISOString()
    });
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/materials', material_routes_1.default);
app.use('/api/leaderboard', leaderboard_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/progress', progress_routes_1.default);
app.use('/api/modules', module_routes_1.default);
app.use('/api/classes', class_routes_1.default);
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
app.listen(env_1.default.port, () => {
    console.log(`Server running on http://localhost:${env_1.default.port}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map