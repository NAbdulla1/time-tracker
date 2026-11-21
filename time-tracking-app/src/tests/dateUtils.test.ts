import { describe, it, expect } from 'vitest';
import {
    zeroPad,
    getWeekStartDate,
    getNextWeekStartDate,
    getThursdayCycleRange,
    getEntriesGroupedByDate,
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

    describe('getWeekStartDate', () => {
        it('should return Monday 00:00:00 for a date in the middle of the week', () => {
            // Wednesday, Nov 19, 2025
            const wednesday = new Date(2025, 10, 19, 14, 30, 0);
            const monday = getWeekStartDate(wednesday);

            expect(monday.getDay()).toBe(1); // Monday
            expect(monday.getDate()).toBe(17); // Nov 17, 2025
            expect(monday.getHours()).toBe(0);
            expect(monday.getMinutes()).toBe(0);
            expect(monday.getSeconds()).toBe(0);
        });

        it('should return the same day at 00:00:00 if the reference date is already Monday', () => {
            // Monday, Nov 17, 2025
            const mondayInput = new Date(2025, 10, 17, 10, 0, 0);
            const result = getWeekStartDate(mondayInput);

            expect(result.getDay()).toBe(1);
            expect(result.getDate()).toBe(17);
            expect(result.getHours()).toBe(0);
        });

        it('should return preceding Monday when given a Sunday', () => {
            // Sunday, Nov 23, 2025
            const sunday = new Date(2025, 10, 23, 18, 0, 0);
            const monday = getWeekStartDate(sunday);

            expect(monday.getDay()).toBe(1);
            expect(monday.getDate()).toBe(17);
        });
    });

    describe('getNextWeekStartDate', () => {
        it('should return 7 days after the start of the current week', () => {
            const wednesday = new Date(2025, 10, 19, 14, 30, 0);
            const nextWeekStart = getNextWeekStartDate(wednesday);

            expect(nextWeekStart.getDay()).toBe(1);
            expect(nextWeekStart.getDate()).toBe(24); // Nov 24, 2025
            expect(nextWeekStart.getHours()).toBe(0);
        });
    });

    describe('getThursdayCycleRange', () => {
        it('should query previous Thursday when referenceDate is Thursday', () => {
            // Thursday, Nov 20, 2025
            const thursday = new Date(2025, 10, 20, 12, 0, 0);
            const { startDate, endDate } = getThursdayCycleRange(thursday);

            expect(startDate.getDay()).toBe(4); // Thursday
            expect(startDate.getDate()).toBe(13); // Nov 13, 2025
            expect(startDate.getHours()).toBe(0);

            expect(endDate.getDay()).toBe(4);
            expect(endDate.getDate()).toBe(20); // Nov 20, 2025
            expect(endDate.getHours()).toBe(0);
        });

        it('should query most recent Thursday when referenceDate is Friday', () => {
            // Friday, Nov 21, 2025
            const friday = new Date(2025, 10, 21, 15, 0, 0);
            const { startDate, endDate } = getThursdayCycleRange(friday);

            expect(startDate.getDay()).toBe(4);
            expect(startDate.getDate()).toBe(20); // Nov 20, 2025

            expect(endDate.getDay()).toBe(4);
            expect(endDate.getDate()).toBe(27); // Nov 27, 2025
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

            const grouped = getEntriesGroupedByDate(mockEntries);
            const dates = Object.keys(grouped);

            expect(dates.length).toBe(2);

            const day1 = mockEntries[0].clockIn;
            const date1Key = `${day1.getFullYear()}-${zeroPad(day1.getMonth() + 1, 2)}-${zeroPad(day1.getDate(), 2)}`;
            expect(grouped[date1Key]).toBeDefined();
            expect(grouped[date1Key].totalDuration).toBe(10800 + 14400);
            expect(grouped[date1Key].entries.length).toBe(2);

            const day2 = mockEntries[2].clockIn;
            const date2Key = `${day2.getFullYear()}-${zeroPad(day2.getMonth() + 1, 2)}-${zeroPad(day2.getDate(), 2)}`;
            expect(grouped[date2Key]).toBeDefined();
            expect(grouped[date2Key].totalDuration).toBe(5400);
            expect(grouped[date2Key].entries.length).toBe(1);
        });
    });
});
