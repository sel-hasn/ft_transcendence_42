import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export const signJwt = (
    object: Object,
    options?: jwt.SignOptions | undefined
) => {
    return jwt.sign(object, config.jwtSecret, {
        ...(options && options),
    });
};

export const verifyJwt = (token: string) => {
    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        return {
            valid: true,
            expired: false,
            decoded,
        };
    } catch (e: any) {
        return {
            valid: false,
            expired: e.message === 'jwt expired',
            decoded: null,
        };
    }
};
