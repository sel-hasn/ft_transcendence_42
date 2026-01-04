import { Request, Response, NextFunction } from 'express';
import { hashPassword, verifyPassword } from '../utils/crypt.js';
import { getDb } from '../core/database.js';
import { signJwt, verifyJwt } from '../utils/jwt.utils.js';
import { config } from '../config/index.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { User } from '../types.js';

// Cookie options
// const cookieOptions = {
//   httpOnly: true,
//   // secure: process.env.NODE_ENV === 'production', // Use secure in production
//   path: '/',
//   sameSite: 'strict' as const,
//   maxAge: 24 * 60 * 60 * 1000 // 1 day
// };

// Register
export const registerHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password } = req.body;
    const db = getDb();

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
    if (existingUser) {
        return next(new AppError('User with that email or username already exists', 409));
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert user
    const stmt = db.prepare(`
    INSERT INTO users (username, email, password_hash)
    VALUES (?, ?, ?)
  `);
    const info = stmt.run(username, email, passwordHash);

    // Get created user
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid) as User;

    res.status(201).json({
        status: 'success',
        data: {
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        }
    });
});

// Login
export const loginHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const db = getDb();

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;

    if (!user || !(await verifyPassword(password, user.password_hash))) {
        return next(new AppError('Invalid email or password', 401));
    }

    // Create tokens
    const accessToken = signJwt(
        { id: user.id, username: user.username },
        { expiresIn: config.jwtAccessExpiresIn }
    );

    const refreshToken = signJwt(
        { id: user.id, username: user.username },
        { expiresIn: config.jwtRefreshExpiresIn }
    );

    res.status(200).json({
        status: 'success',
        tokens: {
            accessToken,
            refreshToken
        }
    });
});

// Refresh Token
export const refreshAccessTokenHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = (req.body.refreshToken as string);

    if (!refreshToken) {
        return next(new AppError('Could not refresh access token', 403));
    }

    // Verify refresh token
    const { decoded } = verifyJwt(refreshToken);

    if (!decoded) {
        return next(new AppError('Could not refresh access token', 403));
    }

    // Check if user still exists
    const db = getDb();
    // @ts-ignore
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id) as User | undefined;

    if (!user) {
        return next(new AppError('User not found', 401));
    }

    // Sign new access token
    const accessToken = signJwt(
        { id: user.id, username: user.username },
        { expiresIn: config.jwtAccessExpiresIn }
    );

    res.status(200).json({
        status: 'success',
        token: accessToken
    });
});

// Logout
export const logoutHandler = (req: Request, res: Response) => {
    // Client should remove the token from storage
    res.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
    });
};
