import { z } from 'zod';
import { isValidTimeZone } from './settings.schema';

// MongoDB ObjectId format: 24-character hexadecimal string
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const deleteEntryParamsSchema = z.object({
    id: z
        .string()
        .regex(objectIdRegex, 'Invalid MongoDB ObjectId format (must be 24 hex characters)'),
});

export const clockInBodySchema = z
    .object({
        clockIn: z.iso.datetime({ offset: true, message: 'clockIn must be a valid ISO-8601 datetime string' }).optional(),
    })
    .strict();

export const clockOutBodySchema = z
    .object({
        clockOut: z.iso.datetime({ offset: true, message: 'clockOut must be a valid ISO-8601 datetime string' }).optional(),
    })
    .strict();

export const updateEntryBodySchema = z
    .object({
        clockIn: z.iso.datetime({ offset: true, message: 'clockIn must be a valid ISO-8601 datetime string' }),
        clockOut: z.iso.datetime({ offset: true, message: 'clockOut must be a valid ISO-8601 datetime string' }),
        timeZone: z
            .string()
            .refine(isValidTimeZone, { message: 'Invalid IANA timezone string' })
            .optional(),
    })
    .strict()
    .refine((data) => new Date(data.clockOut).getTime() > new Date(data.clockIn).getTime(), {
        message: 'clockOut must be after clockIn',
        path: ['clockOut'],
    });

export type ClockInBody = z.infer<typeof clockInBodySchema>;
export type ClockOutBody = z.infer<typeof clockOutBodySchema>;
export type UpdateEntryBody = z.infer<typeof updateEntryBodySchema>;
export type DeleteEntryParams = z.infer<typeof deleteEntryParamsSchema>;
