import { Request, Response, NextFunction } from 'express';

export const requireUser = (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;

    if (!user) {
        return res.status(401).json({
            status: 'fail',
            message: 'You must be logged in to access this resource'
        });
    }

    return next();
};
