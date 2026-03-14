import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';

export const validateBody = <T extends ZodTypeAny>(schema: T): RequestHandler => {
    return (req, res, next) => {
        const parsed = schema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                error: 'Invalid request body',
                details: parsed.error.issues.map((issue) => ({
                    path: issue.path.join('.'),
                    message: issue.message
                }))
            });
        }

        req.body = parsed.data;
        next();
    };
};
