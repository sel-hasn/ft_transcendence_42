import { z } from 'zod';

export const updateUserSchema = z.object({
    body: z.object({
        displayName: z.string().min(2).optional(),
        username: z.string().min(3).optional(),
        avatarUrl: z.string().url().optional(),
    }),
});
