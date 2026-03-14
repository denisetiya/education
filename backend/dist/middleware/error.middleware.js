"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
const notFoundHandler = (req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
};
exports.notFoundHandler = notFoundHandler;
const errorHandler = (err, _req, res, _next) => {
    console.error(err);
    if (res.headersSent) {
        return;
    }
    const statusCode = typeof err?.statusCode === 'number' ? err.statusCode : 500;
    const message = statusCode >= 500 ? 'Internal server error' : err?.message || 'Request failed';
    res.status(statusCode).json({ error: message });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map