import { z } from 'zod';

// MongoDB ObjectId format: 24-character hexadecimal string
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const deleteEntryParamsSchema = z.object({
    id: z
        .string()
        .regex(objectIdRegex, 'Invalid MongoDB ObjectId format (must be 24 hex characters)'),
});

export const clockInBodySchema = z
    .object({
        clockIn: z.string().datetime('clockIn must be a valid ISO-8601 datetime string').optional(),
    })
    .strict();

export const clockOutBodySchema = z
    .object({
        clockOut: z.string().datetime('clockOut must be a valid ISO-8601 datetime string').optional(),
    })
    .strict();

export type ClockInBody = z.infer<typeof clockInBodySchema>;
export type ClockOutBody = z.infer<typeof clockOutBodySchema>;
export type DeleteEntryParams = z.infer<typeof deleteEntryParamsSchema>;
