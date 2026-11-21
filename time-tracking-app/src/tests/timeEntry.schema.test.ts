import { describe, it, expect } from 'vitest';
import {
    deleteEntryParamsSchema,
    clockInBodySchema,
    clockOutBodySchema,
    updateEntryBodySchema,
} from '../schemas/timeEntry.schema';

describe('TimeEntry Validation Schemas', () => {
    describe('deleteEntryParamsSchema', () => {
        it('should accept a valid 24-character hexadecimal MongoDB ObjectId', () => {
            const validResult = deleteEntryParamsSchema.safeParse({
                id: '507f1f77bcf86cd799439011',
            });
            expect(validResult.success).toBe(true);
        });

        it('should reject non-hex characters in ID', () => {
            const invalidResult = deleteEntryParamsSchema.safeParse({
                id: '507f1f77bcf86cd79943901Z',
            });
            expect(invalidResult.success).toBe(false);
            if (!invalidResult.success) {
                expect(invalidResult.error.issues[0].message).toContain('Invalid MongoDB ObjectId format');
            }
        });

        it('should reject IDs with incorrect length', () => {
            const tooShortResult = deleteEntryParamsSchema.safeParse({ id: '12345' });
            expect(tooShortResult.success).toBe(false);
        });

        it('should reject when id is missing', () => {
            const missingResult = deleteEntryParamsSchema.safeParse({});
            expect(missingResult.success).toBe(false);
        });
    });

    describe('clockInBodySchema', () => {
        it('should accept an empty object (defaults to current time on server)', () => {
            const result = clockInBodySchema.safeParse({});
            expect(result.success).toBe(true);
        });

        it('should accept a valid ISO-8601 datetime string', () => {
            const result = clockInBodySchema.safeParse({
                clockIn: '2026-11-21T09:00:00.000Z',
            });
            expect(result.success).toBe(true);
        });

        it('should reject invalid datetime string', () => {
            const result = clockInBodySchema.safeParse({
                clockIn: 'not-a-valid-date',
            });
            expect(result.success).toBe(false);
        });

        it('should reject unrecognized extra fields (strict schema)', () => {
            const result = clockInBodySchema.safeParse({
                clockIn: '2026-11-21T09:00:00.000Z',
                extraProperty: 'malicious-data',
            });
            expect(result.success).toBe(false);
        });
    });

    describe('clockOutBodySchema', () => {
        it('should accept an empty object', () => {
            const result = clockOutBodySchema.safeParse({});
            expect(result.success).toBe(true);
        });

        it('should accept a valid ISO-8601 datetime string', () => {
            const result = clockOutBodySchema.safeParse({
                clockOut: '2026-11-21T17:00:00.000Z',
            });
            expect(result.success).toBe(true);
        });

        it('should reject invalid datetime string', () => {
            const result = clockOutBodySchema.safeParse({
                clockOut: '2026-99-99',
            });
            expect(result.success).toBe(false);
        });

        it('should reject unexpected payload properties', () => {
            const result = clockOutBodySchema.safeParse({
                clockOut: '2026-11-21T17:00:00.000Z',
                isAdmin: true,
            });
            expect(result.success).toBe(false);
        });
    });

    describe('updateEntryBodySchema', () => {
        it('should accept valid clockIn and clockOut where clockOut > clockIn', () => {
            const result = updateEntryBodySchema.safeParse({
                clockIn: '2026-11-21T09:00:00.000Z',
                clockOut: '2026-11-21T17:00:00.000Z',
            });
            expect(result.success).toBe(true);
        });

        it('should accept an optional valid timeZone string', () => {
            const result = updateEntryBodySchema.safeParse({
                clockIn: '2026-11-21T09:00:00.000Z',
                clockOut: '2026-11-21T17:00:00.000Z',
                timeZone: 'Asia/Dhaka',
            });
            expect(result.success).toBe(true);
        });

        it('should reject an invalid timeZone string', () => {
            const result = updateEntryBodySchema.safeParse({
                clockIn: '2026-11-21T09:00:00.000Z',
                clockOut: '2026-11-21T17:00:00.000Z',
                timeZone: 'Invalid/City_Timezone',
            });
            expect(result.success).toBe(false);
        });

        it('should reject when clockOut is before clockIn', () => {
            const result = updateEntryBodySchema.safeParse({
                clockIn: '2026-11-21T17:00:00.000Z',
                clockOut: '2026-11-21T09:00:00.000Z',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('clockOut must be after clockIn');
            }
        });

        it('should reject when clockOut equals clockIn', () => {
            const result = updateEntryBodySchema.safeParse({
                clockIn: '2026-11-21T09:00:00.000Z',
                clockOut: '2026-11-21T09:00:00.000Z',
            });
            expect(result.success).toBe(false);
        });

        it('should reject when clockIn or clockOut is missing', () => {
            expect(updateEntryBodySchema.safeParse({ clockIn: '2026-11-21T09:00:00.000Z' }).success).toBe(false);
            expect(updateEntryBodySchema.safeParse({ clockOut: '2026-11-21T17:00:00.000Z' }).success).toBe(false);
        });
    });
});
