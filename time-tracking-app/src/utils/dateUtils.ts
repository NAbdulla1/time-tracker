import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { ITimeEntry } from '../models/TimeEntry';

dayjs.extend(utc);
dayjs.extend(timezone);

export function zeroPad(number: number, length: number): string {
    return String(number).padStart(length, '0');
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

/**
 * Returns a human-friendly name for a 7-day cycle starting on `startDayOfWeek` (0-6).
 * E.g., 1 -> "Monday to Sunday", 4 -> "Thursday to Wednesday"
 */
export function getCycleName(startDayOfWeek: number): string {
    const startIdx = ((startDayOfWeek % 7) + 7) % 7;
    const endIdx = (startIdx + 6) % 7;
    return `${DAY_NAMES[startIdx]} to ${DAY_NAMES[endIdx]}`;
}

/**
 * Formats a Date to a calendar date string (YYYY-MM-DD) in the specified timezone.
 */
export function formatDateInTimeZone(date: Date, timeZone: string = 'UTC'): string {
    return dayjs(date).tz(timeZone).format('YYYY-MM-DD');
}

/**
 * Groups time entries by local calendar date (YYYY-MM-DD) in the specified timezone
 * and calculates total duration per day.
 */
export function getEntriesGroupedByDate(
    entries: ITimeEntry[],
    timeZone: string = 'UTC'
): { [date: string]: { date: string; totalDuration: number; entries: ITimeEntry[] } } {
    return entries.reduce((acc, entry) => {
        const date = formatDateInTimeZone(entry.clockIn, timeZone);
        const duration = entry.clockOut
            ? (entry.clockOut.getTime() - entry.clockIn.getTime()) / 1000
            : 0;

        if (!acc[date]) {
            acc[date] = { date, totalDuration: 0, entries: [] };
        }

        acc[date].totalDuration += duration;
        acc[date].entries.push(entry);
        return acc;
    }, {} as { [date: string]: { date: string; totalDuration: number; entries: ITimeEntry[] } });
}

/**
 * Calculates start and end UTC bounds for a 7-day cycle starting on `startDayOfWeek` (0-6)
 * in the specified timezone using dayjs.
 */
export function getCycleRange(
    referenceDate: Date = new Date(),
    startDayOfWeek: number = 1,
    timeZone: string = 'UTC',
    lookbackOnSameDay: boolean = false
): { startDate: Date; endDate: Date } {
    const localNow = dayjs(referenceDate).tz(timeZone);
    const currentWeekday = localNow.day(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    let daysToSubtract = (currentWeekday - (startDayOfWeek % 7) + 7) % 7;

    if (lookbackOnSameDay && daysToSubtract === 0) {
        daysToSubtract = 7;
    }

    const start = localNow.subtract(daysToSubtract, 'day').startOf('day');
    const end = start.add(7, 'day');

    return {
        startDate: start.toDate(),
        endDate: end.toDate(),
    };
}

/**
 * Returns UTC boundaries for today (midnight to next day midnight) in the specified timezone.
 */
export function getTodayRange(
    referenceDate: Date = new Date(),
    timeZone: string = 'UTC'
): { startDate: Date; endDate: Date } {
    const start = dayjs(referenceDate).tz(timeZone).startOf('day');
    const end = start.add(1, 'day');
    return {
        startDate: start.toDate(),
        endDate: end.toDate(),
    };
}

// -------------------------------------------------------------
// Legacy / convenience helpers for backward compatibility
// -------------------------------------------------------------

export function getWeekStartDate(aWeekDate: Date, timeZone?: string): Date {
    if (timeZone) {
        return getCycleRange(aWeekDate, 1, timeZone, false).startDate;
    }
    let todayWeekDayNo: number = aWeekDate.getDay();
    const mondayWeekDayNoInJs: number = 1;
    if (todayWeekDayNo < mondayWeekDayNoInJs) {
        todayWeekDayNo += 7;
    }
    const weekStart: Date = new Date(aWeekDate);
    weekStart.setDate(weekStart.getDate() - (todayWeekDayNo - mondayWeekDayNoInJs));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
}

export function getNextWeekStartDate(now: Date, timeZone?: string): Date {
    if (timeZone) {
        return getCycleRange(now, 1, timeZone, false).endDate;
    }
    const nextWeeksFirstDay: Date = getWeekStartDate(now);
    nextWeeksFirstDay.setDate(nextWeeksFirstDay.getDate() + 7);
    return nextWeeksFirstDay;
}

export function getThursdayCycleRange(
    referenceDate: Date = new Date(),
    timeZone?: string
): { startDate: Date; endDate: Date } {
    if (timeZone) {
        return getCycleRange(referenceDate, 4, timeZone, true);
    }
    const day: number = referenceDate.getDay();
    let daysToSubtract: number = (day - 4 + 7) % 7;
    if (daysToSubtract === 0) {
        daysToSubtract = 7;
    }
    const startDate: Date = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    startDate.setHours(0, 0, 0, 0);

    const endDate: Date = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    endDate.setHours(0, 0, 0, 0);

    return { startDate, endDate };
}
