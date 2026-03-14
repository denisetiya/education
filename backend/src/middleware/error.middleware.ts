import type { ErrorRequestHandler, RequestHandler } from 'express';

export const notFoundHandler: RequestHandler = (req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(err);

    if (res.headersSent) {
        return;
    }

    const statusCode = typeof err?.statusCode === 'number' ? err.statusCode : 500;
    const message = statusCode >= 500 ? 'Internal server error' : err?.message || 'Request failed';

    res.status(statusCode).json({ error: message });
};
