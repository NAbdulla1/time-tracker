import { ITimeEntry } from '../models/TimeEntry';

export function zeroPad(number: number, length: number): string {
    return String(number).padStart(length, '0');
}

/**
 * Groups time entries by date and calculates the total duration per day.
 *
 * @param {ITimeEntry[]} entries - An array of time entry objects.
 * @returns {{ [date: string]: { date: string, totalDuration: number, entries: ITimeEntry[] } }} An object grouped by date string.
 */
export function getEntriesGroupedByDate(entries: ITimeEntry[]): { [date: string]: { date: string, totalDuration: number, entries: ITimeEntry[] } } {
    return entries.reduce((acc, entry) => {
        const date = `${entry.clockIn.getFullYear()}-${zeroPad(entry.clockIn.getMonth() + 1, 2)}-${zeroPad(entry.clockIn.getDate(), 2)}`;
        const duration = (entry.clockOut!.getTime() - entry.clockIn.getTime()) / 1000;

        if (!acc[date]) {
            acc[date] = { date, totalDuration: 0, entries: [] };
        }

        acc[date].totalDuration += duration;
        acc[date].entries.push(entry);
        return acc;
    }, {} as { [date: string]: { date: string, totalDuration: number, entries: ITimeEntry[] } });
}

/**
 * Returns the first day of the week for a given date (Monday).
 *
 * @param {Date} aWeekDate - The date for which to find the first day of the week.
 * @returns {Date} Start of the week at 00:00:00.
 */
export function getWeekStartDate(aWeekDate: Date): Date {
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

/**
 * Returns the first day of the next week for a given date.
 *
 * @param {Date} now - The date for which to find the next week's first day.
 * @returns {Date} Start of next week at 00:00:00.
 */
export function getNextWeekStartDate(now: Date): Date {
    const nextWeeksFirstDay: Date = getWeekStartDate(now);
    nextWeeksFirstDay.setDate(nextWeeksFirstDay.getDate() + 7);

    return nextWeeksFirstDay;
}

/**
 * Returns the date range for the Thursday-to-Wednesday cycle.
 *
 * @param {Date} referenceDate - The reference date.
 * @returns {{ startDate: Date, endDate: Date }}
 */
export function getThursdayCycleRange(referenceDate: Date = new Date()): { startDate: Date; endDate: Date } {
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
