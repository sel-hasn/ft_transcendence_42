import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        username: z.string().min(3, 'Username must be at least 3 characters').max(30),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string(),
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    }),
});

export const refreshSchema = z.object({
    body: z.object({
        refreshToken: z.string().min(1, 'Refresh token is required'),
    }),
});

export const requestOtpSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
    }),
});

export const verifyOtpSchema = z.object({
    body: z.object({
        email: z.string().email(),
        otp: z.string().length(6, 'OTP must be 6 digits'),
    }),
});
