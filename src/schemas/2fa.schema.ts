import { z } from 'zod';

export const twoFASchema = z.object({
    body: z.object({
        code: z.string().length(6, 'Code must be exactly 6 digits'),
    }),
});

export const verify2FASchema = z.object({
    body: z.object({
        code: z.string().length(6, 'Code must be exactly 6 digits'),
        tempToken: z.string().min(1, 'Temporary token is required'),
    }),
});
