import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt.utils.js';
import { getDb } from '../core/database.js';
import { User } from '../types.js';

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

        // Check blacklist
        const isBlacklisted = db.prepare('SELECT token FROM token_blacklist WHERE token = ?').get(accessToken);
        if (isBlacklisted) {
            return next();
        }

        try {
            const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User | undefined;
            if (user) {
                res.locals.user = user;
            }
        } catch (e: any) {
            console.error('Error in deserializeUser middleware:', e);
            // DB error or user not found, just continue without user
        }
    }

    return next();
};
