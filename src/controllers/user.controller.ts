import { Request, Response, NextFunction } from 'express';
import { getDb } from '../core/database.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import { User } from '../types.js';

// Helper to sanitize user object
const sanitizeUser = (user: any) => {
    const { password_hash, two_fa_secret, ...safeUser } = user;
    return safeUser;
};

// Get Current User
export const getCurrentUserHandler = (req: Request, res: Response) => {
    const user = res.locals.user;
    res.status(200).json({
        status: 'success',
        data: {
            user: sanitizeUser(user)
        }
    });
};

// Get All Users (Simplified)
export const getAllUsersHandler = catchAsync(async (req: Request, res: Response) => {
    const db = getDb();
    const users = db.prepare('SELECT id, username, avatar_url, level, status FROM users').all();

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    });
});

// Get User By ID
export const getUserByIdHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const db = getDb();

    const user = db.prepare('SELECT id, username, avatar_url, level, status, created_at, pong_wins, pong_losses, chess_wins, chess_losses FROM users WHERE id = ?').get(id);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

// Update User
export const updateUserHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { username, avatarUrl } = req.body;

    // @ts-ignore
    const userId = res.locals.user.id;

    const db = getDb();

    // Dynamic Update
    const updates: string[] = [];
    const values: any[] = [];

    if (username) {
        // Check uniqueness
        const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, userId);
        if (existing) {
            return next(new AppError('Username already taken', 409));
        }
        updates.push('username = ?');
        values.push(username);
    }
    if (avatarUrl) {
        updates.push('avatar_url = ?');
        values.push(avatarUrl);
    }

    if (updates.length > 0) {
        values.push(userId);
        const stmt = db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`);
        stmt.run(...values);
    }

    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    res.status(200).json({
        status: 'success',
        data: {
            user: sanitizeUser(updatedUser)
        }
    });
});
