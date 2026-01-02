import { z } from 'zod';

export const updateUserSchema = z.object({
    body: z.object({
        username: z.string().min(3).optional(),
        avatarUrl: z.string().url().optional(),
    }),
});
