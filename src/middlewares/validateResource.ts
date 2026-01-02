import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validateResource = (schema: AnyZodObject) => (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (e: any) {
        if (e instanceof ZodError) {
            return res.status(400).json({
                status: 'fail',
                errors: e.errors.map((err) => ({
                    code: err.code,
                    message: err.message,
                    path: err.path
                })),
            });
        }
        return res.status(400).send(e.errors);
    }
};
