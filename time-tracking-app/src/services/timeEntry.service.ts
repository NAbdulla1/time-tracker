import TimeEntry, { ITimeEntry } from '../models/TimeEntry';
import {
    getEntriesGroupedByDate,
    getCycleRange,
    getTodayRange,
    formatDateInTimeZone,
} from '../utils/dateUtils';
import { settingsService } from './settings.service';

export interface GroupedDateEntry {
    date: string;
    totalDuration: number;
    entries: ITimeEntry[];
}

export class TimeEntryService {
    /**
     * Create a new clock-in entry
     * @param clockInDate Optional custom clockIn Date, defaults to now
     */
    async clockIn(clockInDate?: Date): Promise<{ clockInTime: Date }> {
        const now = clockInDate || new Date();
        const newEntry = new TimeEntry({ clockIn: now });
        await newEntry.save();
        return { clockInTime: now };
    }

    /**
     * Clock out the currently active session
     * @param clockOutDate Optional custom clockOut Date, defaults to now
     */
    async clockOut(clockOutDate?: Date): Promise<ITimeEntry | null> {
        const entry = await TimeEntry.findOne({ clockOut: { $exists: false } }).sort({ clockIn: -1 });
        if (!entry) {
            return null;
        }
        entry.clockOut = clockOutDate || new Date();
        await entry.save();
        return entry;
    }

    /**
     * Check if currently clocked in
     */
    async getClockStatus(): Promise<{ isClockedIn: boolean; clockInTime: Date | null }> {
        const entry = await TimeEntry.findOne({ clockOut: { $exists: false } }).sort({ clockIn: -1 });
        return {
            isClockedIn: !!entry,
            clockInTime: entry ? entry.clockIn : null,
        };
    }

    /**
     * Get entries and total duration for today in the target timezone
     */
    async getTodayEntries(timeZoneOverride?: string): Promise<{ entries: ITimeEntry[]; totalDuration: number }> {
        const timeZone = timeZoneOverride || (await settingsService.getSettings()).timeZone || 'UTC';
        const { startDate, endDate } = getTodayRange(new Date(), timeZone);

        const entries = await TimeEntry.find({
            clockIn: { $gte: startDate, $lt: endDate },
        });

        const totalDuration = entries.reduce((total, entry) => {
            if (entry.clockOut) {
                return total + (entry.clockOut.getTime() - entry.clockIn.getTime());
            }
            return total;
        }, 0);

        return {
            entries,
            totalDuration: totalDuration / 1000,
        };
    }

    /**
     * Get all previous completed entries grouped by date in the target timezone
     */
    async getPreviousEntries(timeZoneOverride?: string): Promise<GroupedDateEntry[]> {
        const timeZone = timeZoneOverride || (await settingsService.getSettings()).timeZone || 'UTC';

        const entries = await TimeEntry.find({ clockOut: { $exists: true } }).sort({ clockIn: -1 });
        const entriesGroupedByDate = getEntriesGroupedByDate(entries, timeZone);
        return Object.values(entriesGroupedByDate);
    }

    /**
     * Get current week entries grouped by date according to configured firstDayOfWeek and timezone
     */
    async getCurrentWeekEntries(timeZoneOverride?: string): Promise<GroupedDateEntry[]> {
        const settings = await settingsService.getSettings();
        const timeZone = timeZoneOverride || settings.timeZone || 'UTC';
        const firstDayOfWeek = settings.firstDayOfWeek ?? 1;

        const { startDate, endDate } = getCycleRange(new Date(), firstDayOfWeek, timeZone, false);

        const entries = await TimeEntry.find({
            clockIn: { $gte: startDate },
            clockOut: { $lt: endDate },
        });

        const entriesGroupedByDate = getEntriesGroupedByDate(entries, timeZone);
        return Object.values(entriesGroupedByDate);
    }

    /**
     * Get secondary week cycle entries according to configured secondaryWeekStartDay and timezone
     */
    async getSecondaryWeekEntries(timeZoneOverride?: string): Promise<GroupedDateEntry[]> {
        const settings = await settingsService.getSettings();
        if (!settings.secondaryWeekEnabled) {
            return [];
        }

        const timeZone = timeZoneOverride || settings.timeZone || 'UTC';
        const startDay = settings.secondaryWeekStartDay ?? 1;

        const { startDate, endDate } = getCycleRange(new Date(), startDay, timeZone, true);

        const entries = await TimeEntry.find({
            clockIn: { $gte: startDate },
            clockOut: { $lt: endDate },
        });

        const entriesGroupedByDate = getEntriesGroupedByDate(entries, timeZone);
        return Object.values(entriesGroupedByDate);
    }

    /**
     * Alias for secondary week cycle entries (for backward compatibility)
     */
    async getThursdayCycleEntries(timeZoneOverride?: string): Promise<GroupedDateEntry[]> {
        return this.getSecondaryWeekEntries(timeZoneOverride);
    }

    /**
     * Update an existing completed entry by ID.
     * Prevents changing the calendar date of the entry in the specified timezone.
     */
    async updateEntry(
        entryId: string,
        clockIn: Date,
        clockOut: Date,
        timeZoneOverride?: string
    ): Promise<ITimeEntry | null> {
        const entry = await TimeEntry.findById(entryId);
        if (!entry) {
            return null;
        }

        const timeZone = timeZoneOverride || (await settingsService.getSettings()).timeZone || 'UTC';

        const originalDate = formatDateInTimeZone(entry.clockIn, timeZone);
        const newDate = formatDateInTimeZone(clockIn, timeZone);
        if (originalDate !== newDate) {
            throw new Error('Changing the entry date is not allowed');
        }

        entry.clockIn = clockIn;
        entry.clockOut = clockOut;
        await entry.save();
        return entry;
    }

    /**
     * Delete an entry by ID
     */
    async deleteEntry(entryId: string): Promise<boolean> {
        await TimeEntry.findByIdAndDelete(entryId);
        return true;
    }
}

export const timeEntryService = new TimeEntryService();
