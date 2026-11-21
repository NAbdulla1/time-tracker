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

    describe('deleteEntry', () => {
        it('should delete entry by ID and return true', async () => {
            const deleteSpy = vi.spyOn(TimeEntry, 'findByIdAndDelete').mockResolvedValueOnce({} as any);

            const result = await timeEntryService.deleteEntry('507f1f77bcf86cd799439011');
            expect(result).toBe(true);
            expect(deleteSpy).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        });
    });
});
