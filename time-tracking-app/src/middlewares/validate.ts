import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodType } from 'zod';

export interface RequestValidationSchema {
    body?: ZodType;
    query?: ZodType;
    params?: ZodType;
}

/**
 * Express middleware to validate request body, query, and params using Zod
 */
export const validate = (schema: RequestValidationSchema) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (schema.params) {
                req.params = (await schema.params.parseAsync(req.params)) as any;
            }
            if (schema.query) {
                req.query = (await schema.query.parseAsync(req.query)) as any;
            }
            if (schema.body) {
                req.body = await schema.body.parseAsync(req.body);
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    error: 'Validation failed',
                    details: error.issues.map((issue) => ({
                        path: issue.path.join('.'),
                        message: issue.message,
                    })),
                });
                return;
            }
            next(error);
        }
    };
};
