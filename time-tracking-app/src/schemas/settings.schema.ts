import { z } from 'zod';

export function isValidTimeZone(timeZone: string): boolean {
    try {
        Intl.DateTimeFormat(undefined, { timeZone });
        return true;
    } catch {
        return false;
    }
}

export const updateSettingsSchema = z
    .object({
        timeZone: z
            .string()
            .refine(isValidTimeZone, { message: 'Invalid IANA timezone string' })
            .optional(),
        firstDayOfWeek: z
            .number()
            .int('firstDayOfWeek must be an integer')
            .min(0, 'firstDayOfWeek must be between 0 (Sunday) and 6 (Saturday)')
            .max(6, 'firstDayOfWeek must be between 0 (Sunday) and 6 (Saturday)')
            .optional(),
        secondaryWeekStartDay: z
            .number()
            .int('secondaryWeekStartDay must be an integer')
            .min(0, 'secondaryWeekStartDay must be between 0 (Sunday) and 6 (Saturday)')
            .max(6, 'secondaryWeekStartDay must be between 0 (Sunday) and 6 (Saturday)')
            .optional(),
        secondaryWeekEnabled: z.boolean().optional(),
        weeklyTargetHours: z
            .number()
            .positive('weeklyTargetHours must be positive')
            .max(168, 'weeklyTargetHours cannot exceed 168 hours')
            .optional(),
    })
    .strict();

export type UpdateSettingsBody = z.infer<typeof updateSettingsSchema>;
