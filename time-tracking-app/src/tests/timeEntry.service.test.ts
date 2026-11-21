import { describe, it, expect, vi, beforeEach } from 'vitest';
import { timeEntryService } from '../services/timeEntry.service';
import TimeEntry from '../models/TimeEntry';

describe('TimeEntryService', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('clockIn', () => {
        it('should save and return a new clock-in entry', async () => {
            const saveSpy = vi.spyOn(TimeEntry.prototype, 'save').mockResolvedValueOnce({} as any);

            const testDate = new Date('2026-11-21T09:00:00.000Z');
            const result = await timeEntryService.clockIn(testDate);

            expect(result.clockInTime).toEqual(testDate);
            expect(saveSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('clockOut', () => {
        it('should update and save active entry if found', async () => {
            const mockEntry = {
                clockIn: new Date('2026-11-21T09:00:00.000Z'),
                clockOut: undefined,
                save: vi.fn().mockResolvedValue(true),
            };

            const sortMock = vi.fn().mockResolvedValueOnce(mockEntry);
            vi.spyOn(TimeEntry, 'findOne').mockReturnValueOnce({ sort: sortMock } as any);

            const clockOutTime = new Date('2026-11-21T17:00:00.000Z');
            const result = await timeEntryService.clockOut(clockOutTime);

            expect(result).not.toBeNull();
            expect(mockEntry.clockOut).toEqual(clockOutTime);
            expect(mockEntry.save).toHaveBeenCalledTimes(1);
        });

        it('should return null if no active clock-in session found', async () => {
            const sortMock = vi.fn().mockResolvedValueOnce(null);
            vi.spyOn(TimeEntry, 'findOne').mockReturnValueOnce({ sort: sortMock } as any);

            const result = await timeEntryService.clockOut();
            expect(result).toBeNull();
        });
    });

    describe('getClockStatus', () => {
        it('should return isClockedIn: true when active entry exists', async () => {
            const clockInDate = new Date('2026-11-21T09:00:00.000Z');
            const mockEntry = { clockIn: clockInDate };

            const sortMock = vi.fn().mockResolvedValueOnce(mockEntry);
            vi.spyOn(TimeEntry, 'findOne').mockReturnValueOnce({ sort: sortMock } as any);

            const status = await timeEntryService.getClockStatus();
            expect(status.isClockedIn).toBe(true);
            expect(status.clockInTime).toEqual(clockInDate);
        });

        it('should return isClockedIn: false when no active entry exists', async () => {
            const sortMock = vi.fn().mockResolvedValueOnce(null);
            vi.spyOn(TimeEntry, 'findOne').mockReturnValueOnce({ sort: sortMock } as any);

            const status = await timeEntryService.getClockStatus();
            expect(status.isClockedIn).toBe(false);
            expect(status.clockInTime).toBeNull();
        });
    });

    describe('updateEntry', () => {
        it('should update and return entry when found', async () => {
            const mockEntry = {
                clockIn: new Date('2026-11-21T09:00:00.000Z'),
                clockOut: new Date('2026-11-21T12:00:00.000Z'),
                save: vi.fn().mockResolvedValue(true),
            };

            vi.spyOn(TimeEntry, 'findById').mockResolvedValueOnce(mockEntry as any);

            const newIn = new Date('2026-11-21T10:00:00.000Z');
            const newOut = new Date('2026-11-21T13:00:00.000Z');
            const result = await timeEntryService.updateEntry('507f1f77bcf86cd799439011', newIn, newOut, 'UTC');

            expect(result).not.toBeNull();
            expect(mockEntry.clockIn).toEqual(newIn);
            expect(mockEntry.clockOut).toEqual(newOut);
            expect(mockEntry.save).toHaveBeenCalledTimes(1);
        });

        it('should return null when entry is not found', async () => {
            vi.spyOn(TimeEntry, 'findById').mockResolvedValueOnce(null);

            const result = await timeEntryService.updateEntry(
                '507f1f77bcf86cd799439011',
                new Date('2026-11-21T10:00:00.000Z'),
                new Date('2026-11-21T13:00:00.000Z'),
                'UTC'
            );
            expect(result).toBeNull();
        });

        it('should throw an error if the calendar date is changed', async () => {
            const mockEntry = {
                clockIn: new Date('2026-11-21T09:00:00.000Z'),
                clockOut: new Date('2026-11-21T12:00:00.000Z'),
            };

            vi.spyOn(TimeEntry, 'findById').mockResolvedValueOnce(mockEntry as any);

            const differentDateIn = new Date('2026-11-22T09:00:00.000Z');
            const differentDateOut = new Date('2026-11-22T12:00:00.000Z');

            await expect(
                timeEntryService.updateEntry('507f1f77bcf86cd799439011', differentDateIn, differentDateOut, 'UTC')
            ).rejects.toThrow('Changing the entry date is not allowed');
        });

        it('should validate calendar date using the client timezone, even across UTC midnight', async () => {
            // In Asia/Dhaka (+6), 2026-11-20T20:00:00Z is 2026-11-21 02:00:00 (local date 2026-11-21)
            const mockEntry = {
                clockIn: new Date('2026-11-20T20:00:00.000Z'),
                clockOut: new Date('2026-11-20T23:00:00.000Z'),
                save: vi.fn().mockResolvedValue(true),
            };

            vi.spyOn(TimeEntry, 'findById').mockResolvedValueOnce(mockEntry as any);

            // Updated time: 2026-11-21T04:00:00Z is 2026-11-21 10:00:00 in Asia/Dhaka (same local date 2026-11-21)
            // Even though in UTC the date changed from 2026-11-20 to 2026-11-21,
            // according to the client timezone Asia/Dhaka both are 2026-11-21.
            const updatedIn = new Date('2026-11-21T04:00:00.000Z');
            const updatedOut = new Date('2026-11-21T08:00:00.000Z');

            const result = await timeEntryService.updateEntry(
                '507f1f77bcf86cd799439011',
                updatedIn,
                updatedOut,
                'Asia/Dhaka'
            );

            expect(result).not.toBeNull();
            expect(mockEntry.clockIn).toEqual(updatedIn);
            expect(mockEntry.clockOut).toEqual(updatedOut);
            expect(mockEntry.save).toHaveBeenCalledTimes(1);
        });

        it('should reject update if the calendar date changes according to the client timezone', async () => {
            // In Asia/Dhaka (+6), 2026-11-20T20:00:00Z is 2026-11-21 02:00:00 (local date 2026-11-21)
            const mockEntry = {
                clockIn: new Date('2026-11-20T20:00:00.000Z'),
                clockOut: new Date('2026-11-20T23:00:00.000Z'),
                save: vi.fn(),
            };

            vi.spyOn(TimeEntry, 'findById').mockResolvedValueOnce(mockEntry as any);

            // Updated time: 2026-11-21T19:00:00Z is 2026-11-22 01:00:00 in Asia/Dhaka (date changed to 2026-11-22)
            const newDateIn = new Date('2026-11-21T19:00:00.000Z');
            const newDateOut = new Date('2026-11-21T22:00:00.000Z');

            await expect(
                timeEntryService.updateEntry('507f1f77bcf86cd799439011', newDateIn, newDateOut, 'Asia/Dhaka')
            ).rejects.toThrow('Changing the entry date is not allowed');
        });
    });

    describe('deleteEntry', () => {
        it('should delete entry by ID and return true', async () => {
            const deleteSpy = vi.spyOn(TimeEntry, 'findByIdAndDelete').mockResolvedValueOnce({} as any);

            const result = await timeEntryService.deleteEntry('507f1f77bcf86cd799439011');
            expect(result).toBe(true);
            expect(deleteSpy).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        });
    });
});
