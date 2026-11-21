import TimeEntry, { ITimeEntry } from '../models/TimeEntry';
import { getEntriesGroupedByDate, getWeekStartDate, getNextWeekStartDate, getThursdayCycleRange } from '../utils/dateUtils';

export interface GroupedDateEntry {
    date: string;
    totalDuration: number;
    entries: ITimeEntry[];
}

export class TimeEntryService {
    /**
     * Create a new clock-in entry
     */
    async clockIn(): Promise<{ clockInTime: Date }> {
        const now = new Date();
        const newEntry = new TimeEntry({ clockIn: now });
        await newEntry.save();
        return { clockInTime: now };
    }

    /**
     * Clock out the currently active session
     */
    async clockOut(): Promise<ITimeEntry | null> {
        const entry = await TimeEntry.findOne({ clockOut: { $exists: false } }).sort({ clockIn: -1 });
        if (!entry) {
            return null;
        }
        entry.clockOut = new Date();
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
     * Get entries and total duration for today
     */
    async getTodayEntries(): Promise<{ entries: ITimeEntry[]; totalDuration: number }> {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const entries = await TimeEntry.find({
            clockIn: { $gte: startOfDay, $lt: endOfDay },
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
     * Get all previous completed entries grouped by date
     */
    async getPreviousEntries(): Promise<GroupedDateEntry[]> {
        const entries = await TimeEntry.find({ clockOut: { $exists: true } }).sort({ clockIn: -1 });
        const entriesGroupedByDate = getEntriesGroupedByDate(entries);
        return Object.values(entriesGroupedByDate);
    }

    /**
     * Get current week entries grouped by date
     */
    async getCurrentWeekEntries(): Promise<GroupedDateEntry[]> {
        const now = new Date();
        const firstDay = getWeekStartDate(now);
        const nextWeeksFirstDay = getNextWeekStartDate(now);

        const entries = await TimeEntry.find({
            clockIn: { $gte: firstDay },
            clockOut: { $lt: nextWeeksFirstDay },
        });

        const entriesGroupedByDate = getEntriesGroupedByDate(entries);
        return Object.values(entriesGroupedByDate);
    }

    /**
     * Get entries for Thursday-to-Wednesday cycle grouped by date
     */
    async getThursdayCycleEntries(): Promise<GroupedDateEntry[]> {
        const now = new Date();
        const { startDate, endDate } = getThursdayCycleRange(now);

        const entries = await TimeEntry.find({
            clockIn: { $gte: startDate },
            clockOut: { $lt: endDate },
        });

        const entriesGroupedByDate = getEntriesGroupedByDate(entries);
        return Object.values(entriesGroupedByDate);
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
