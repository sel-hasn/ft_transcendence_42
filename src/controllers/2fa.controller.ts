import { Request, Response, NextFunction } from 'express';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import { getDb } from '../core/database.js';
import { signJwt, verifyJwt } from '../utils/jwt.utils.js';
import { config } from '../config/index.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { User } from '../types.js';

// 1. Generate QR Code
export const generate2FAHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // User must be logged in (via requireUser middleware)
    const user = res.locals.user as User;

    // Generate Secret
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, 'ft_transcendence', secret);

    // Generate QR Code Image (Base64)
    const imageUrl = await qrcode.toDataURL(otpauth);

    // Save secret to DB (but don't enable it yet!)
    const db = getDb();
    db.prepare('UPDATE users SET two_fa_secret = ? WHERE id = ?').run(secret, user.id);

    res.status(200).json({
        status: 'success',
        data: {
            qrCode: imageUrl, // Postman user: Copy this string!
            secret // Optional: meaningful for manual entry if camera breaks
        }
    });
});

// 2. Turn On 2FA (Verify the first code)
export const turnOn2FAHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.body;
    const user = res.locals.user as User;
    const db = getDb();

    // Fetch the secret we just saved
    // We need to fetch fresh data in case it was updated recently
    const userData = db.prepare('SELECT two_fa_secret FROM users WHERE id = ?').get(user.id) as User;

    if (!userData.two_fa_secret) {
        return next(new AppError('Please generate a QR code first', 400));
    }

    const isValid = authenticator.verify({
        token: code,
        secret: userData.two_fa_secret
    });

    if (!isValid) {
        return next(new AppError('Invalid 2FA code', 400));
    }

    // Enable 2FA
    db.prepare('UPDATE users SET is_2fa_enabled = 1 WHERE id = ?').run(user.id);

    res.status(200).json({
        status: 'success',
        message: '2FA has been enabled'
    });
});

// 3. Authenticate (Login Step 2)
export const authenticate2FAHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { code, tempToken } = req.body;

    // Verify the temporary token
    const { decoded, valid } = verifyJwt(tempToken);

    // Check if it's a valid object and has the special flag
    if (!valid || !decoded || typeof decoded === 'string' || (decoded as any).login_step !== '2fa') {
        return next(new AppError('Invalid or expired login session', 401));
    }

    const userId = (decoded as any).id;
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User | undefined;

    if (!user || !user.two_fa_secret) {
        return next(new AppError('User not found or 2FA not set up', 401));
    }

    // Verify Code
    const isValid = authenticator.verify({
        token: code,
        secret: user.two_fa_secret
    });

    if (!isValid) {
        return next(new AppError('Invalid 2FA code', 401));
    }

    // Success! Issue Real Tokens
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
        tokens: { accessToken, refreshToken }
    });
});
