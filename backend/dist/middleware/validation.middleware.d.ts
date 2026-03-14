import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';
export declare const validateBody: <T extends ZodTypeAny>(schema: T) => RequestHandler;
//# sourceMappingURL=validation.middleware.d.ts.map