import { describe, it, expect } from 'vitest';
import {
    zeroPad,
    getWeekStartDate,
    getNextWeekStartDate,
    getThursdayCycleRange,
    getEntriesGroupedByDate,
    getCycleRange,
    getTodayRange,
    getCycleName,
    formatDateInTimeZone,
} from '../utils/dateUtils';
import { ITimeEntry } from '../models/TimeEntry';

describe('Date Utilities (dateUtils)', () => {
    describe('zeroPad', () => {
        it('should pad numbers with leading zeros up to requested length', () => {
            expect(zeroPad(5, 2)).toBe('05');
            expect(zeroPad(12, 2)).toBe('12');
            expect(zeroPad(7, 3)).toBe('007');
        });
    });

    describe('getCycleName', () => {
        it('should return correct name for different start days', () => {
            expect(getCycleName(1)).toBe('Monday to Sunday');
            expect(getCycleName(4)).toBe('Thursday to Wednesday');
            expect(getCycleName(0)).toBe('Sunday to Saturday');
            expect(getCycleName(5)).toBe('Friday to Thursday');
        });
    });

    describe('formatDateInTimeZone', () => {
        it('should format dates to YYYY-MM-DD according to timezone', () => {
            // 2026-11-21 02:00:00 UTC
            const instant = new Date('2026-11-21T02:00:00Z');
            // In NY (UTC-5), it is 2026-11-20 21:00:00
            expect(formatDateInTimeZone(instant, 'America/New_York')).toBe('2026-11-20');
            // In Dhaka (UTC+6), it is 2026-11-21 08:00:00
            expect(formatDateInTimeZone(instant, 'Asia/Dhaka')).toBe('2026-11-21');
            // In UTC
            expect(formatDateInTimeZone(instant, 'UTC')).toBe('2026-11-21');
        });
    });

    describe('getCycleRange', () => {
        it('should calculate Monday to Sunday cycle in UTC', () => {
            // Wednesday Nov 19, 2025
            const wednesday = new Date('2025-11-19T14:30:00Z');
            const { startDate, endDate } = getCycleRange(wednesday, 1, 'UTC', false);

            expect(startDate.toISOString()).toBe('2025-11-17T00:00:00.000Z'); // Monday 00:00 UTC
            expect(endDate.toISOString()).toBe('2025-11-24T00:00:00.000Z'); // Next Monday 00:00 UTC
        });

        it('should calculate Monday to Sunday cycle in America/New_York (UTC-5)', () => {
            // Wednesday Nov 19, 2025 14:30 UTC
            const wednesday = new Date('2025-11-19T14:30:00Z');
            const { startDate, endDate } = getCycleRange(wednesday, 1, 'America/New_York', false);

            // Monday Nov 17 00:00 EST = Nov 17 05:00 UTC
            expect(startDate.toISOString()).toBe('2025-11-17T05:00:00.000Z');
            // Next Monday Nov 24 00:00 EST = Nov 24 05:00 UTC
            expect(endDate.toISOString()).toBe('2025-11-24T05:00:00.000Z');
        });

        it('should calculate dynamic secondary week cycle with lookback on same day', () => {
            // Thursday Nov 20, 2025 12:00 UTC
            const thursday = new Date('2025-11-20T12:00:00Z');
            const { startDate, endDate } = getCycleRange(thursday, 4, 'UTC', true);

            // Starts previous Thursday Nov 13, ends today Thursday Nov 20
            expect(startDate.toISOString()).toBe('2025-11-13T00:00:00.000Z');
            expect(endDate.toISOString()).toBe('2025-11-20T00:00:00.000Z');
        });

        it('should calculate secondary week cycle starting on Monday', () => {
            // Tuesday Nov 18, 2025
            const tuesday = new Date('2025-11-18T10:00:00Z');
            const { startDate, endDate } = getCycleRange(tuesday, 1, 'UTC', true);

            expect(startDate.toISOString()).toBe('2025-11-17T00:00:00.000Z');
            expect(endDate.toISOString()).toBe('2025-11-24T00:00:00.000Z');
        });
    });

    describe('getTodayRange', () => {
        it('should return midnight-to-midnight bounds for client timezone', () => {
            // 2026-11-21 12:00 UTC
            const refDate = new Date('2026-11-21T12:00:00Z');
            const nyRange = getTodayRange(refDate, 'America/New_York');

            // NY is Nov 21 00:00 EST = Nov 21 05:00 UTC
            expect(nyRange.startDate.toISOString()).toBe('2026-11-21T05:00:00.000Z');
            // Next midnight = Nov 22 05:00 UTC
            expect(nyRange.endDate.toISOString()).toBe('2026-11-22T05:00:00.000Z');
        });
    });

    describe('getWeekStartDate (backward compatibility)', () => {
        it('should return Monday 00:00:00 for a date in the middle of the week', () => {
            const wednesday = new Date(2025, 10, 19, 14, 30, 0);
            const monday = getWeekStartDate(wednesday);

            expect(monday.getDay()).toBe(1); // Monday
            expect(monday.getDate()).toBe(17); // Nov 17, 2025
            expect(monday.getHours()).toBe(0);
        });

        it('should return the same day at 00:00:00 if the reference date is already Monday', () => {
            const mondayInput = new Date(2025, 10, 17, 10, 0, 0);
            const result = getWeekStartDate(mondayInput);

            expect(result.getDay()).toBe(1);
            expect(result.getDate()).toBe(17);
            expect(result.getHours()).toBe(0);
        });

        it('should return preceding Monday when given a Sunday', () => {
            const sunday = new Date(2025, 10, 23, 18, 0, 0);
            const monday = getWeekStartDate(sunday);

            expect(monday.getDay()).toBe(1);
            expect(monday.getDate()).toBe(17);
        });
    });

    describe('getNextWeekStartDate (backward compatibility)', () => {
        it('should return 7 days after the start of the current week', () => {
            const wednesday = new Date(2025, 10, 19, 14, 30, 0);
            const nextWeekStart = getNextWeekStartDate(wednesday);

            expect(nextWeekStart.getDay()).toBe(1);
            expect(nextWeekStart.getDate()).toBe(24);
            expect(nextWeekStart.getHours()).toBe(0);
        });
    });

    describe('getThursdayCycleRange (backward compatibility)', () => {
        it('should query previous Thursday when referenceDate is Thursday', () => {
            const thursday = new Date(2025, 10, 20, 12, 0, 0);
            const { startDate, endDate } = getThursdayCycleRange(thursday);

            expect(startDate.getDay()).toBe(4);
            expect(startDate.getDate()).toBe(13);
            expect(endDate.getDay()).toBe(4);
            expect(endDate.getDate()).toBe(20);
        });

        it('should query most recent Thursday when referenceDate is Friday', () => {
            const friday = new Date(2025, 10, 21, 15, 0, 0);
            const { startDate, endDate } = getThursdayCycleRange(friday);

            expect(startDate.getDay()).toBe(4);
            expect(startDate.getDate()).toBe(20);
            expect(endDate.getDay()).toBe(4);
            expect(endDate.getDate()).toBe(27);
        });
    });

    describe('getEntriesGroupedByDate', () => {
        it('should group entries by date and compute total duration in seconds', () => {
            const mockEntries = [
                {
                    clockIn: new Date('2025-11-20T09:00:00.000Z'),
                    clockOut: new Date('2025-11-20T12:00:00.000Z'), // 3 hours = 10800s
                },
                {
                    clockIn: new Date('2025-11-20T13:00:00.000Z'),
                    clockOut: new Date('2025-11-20T17:00:00.000Z'), // 4 hours = 14400s
                },
                {
                    clockIn: new Date('2025-11-21T09:00:00.000Z'),
                    clockOut: new Date('2025-11-21T10:30:00.000Z'), // 1.5 hours = 5400s
                },
            ] as unknown as ITimeEntry[];

            const grouped = getEntriesGroupedByDate(mockEntries, 'UTC');
            const dates = Object.keys(grouped);

            expect(dates.length).toBe(2);
            expect(grouped['2025-11-20']).toBeDefined();
            expect(grouped['2025-11-20'].totalDuration).toBe(10800 + 14400);
            expect(grouped['2025-11-20'].entries.length).toBe(2);

            expect(grouped['2025-11-21']).toBeDefined();
            expect(grouped['2025-11-21'].totalDuration).toBe(5400);
            expect(grouped['2025-11-21'].entries.length).toBe(1);
        });

        it('should group entries according to client timezone calendar day', () => {
            // An entry at 2026-11-21 02:00 UTC is Nov 20 in New York
            const mockEntries = [
                {
                    clockIn: new Date('2026-11-21T02:00:00.000Z'),
                    clockOut: new Date('2026-11-21T04:00:00.000Z'), // 2 hours = 7200s
                },
            ] as unknown as ITimeEntry[];

            const groupedNY = getEntriesGroupedByDate(mockEntries, 'America/New_York');
            expect(groupedNY['2026-11-20']).toBeDefined();
            expect(groupedNY['2026-11-20'].totalDuration).toBe(7200);

            const groupedUTC = getEntriesGroupedByDate(mockEntries, 'UTC');
            expect(groupedUTC['2026-11-21']).toBeDefined();
            expect(groupedUTC['2026-11-21'].totalDuration).toBe(7200);
        });
    });
});
