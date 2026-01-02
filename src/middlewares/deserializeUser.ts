import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt.utils';
import { getDb } from '../core/database';
import { User } from '../types';

export const deserializeUser = async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = (req.headers.authorization || '').replace(/^Bearer\s/, '');

    if (!accessToken) {
        return next();
    }

    const { decoded, valid } = verifyJwt(accessToken);

    if (decoded && valid) {
        // @ts-ignore - attaching user to req
        const userId = (decoded as any).id;

        // Check if user still exists in DB
        const db = getDb();
        try {
            const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User | undefined;
            if (user) {
                res.locals.user = user;
            }
        } catch (e) {
            // DB error or user not found, just continue without user
        }
    }

    return next();
};
