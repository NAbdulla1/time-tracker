import { ITimeEntry } from "./db/models/TimeEntry";

function zeroPad(number: number, length: number) {
    return String(number).padStart(length, '0');
}

/**
 * Groups time entries by date and calculates the total duration per day.
 *
 * @param {ITimeEntryEntry[]} entries - An array of time entry objects, each containing `clockIn` and `clockOut` Date properties.
 * @returns {{ [date: string]: { date: string, totalDuration: number, entries: ITimeEntry[] } }} An object where each key is a date string in the format 'YYYY-MM-DD', 
 * and each value is an object containing the `date`, `totalDuration` in seconds, and an array of `entries` for that date.
 */
export function getEntriesGroupedByDate(entries: ITimeEntry[]): { [date: string]: { date: string, totalDuration: number, entries: ITimeEntry[] } } {
    return entries.reduce((acc, entry) => {
        const date = `${entry.clockIn.getFullYear()}-${zeroPad(entry.clockIn.getMonth() + 1, 2)}-${zeroPad(entry.clockIn.getDate(), 2)}`; // Extract the date part
        const duration = (entry.clockOut!.getTime() - entry.clockIn.getTime()) / 1000; // Duration in seconds

        if (!acc[date]) {
            acc[date] = { date, totalDuration: 0, entries: [] };
        }

        acc[date].totalDuration += duration;
        acc[date].entries.push(entry);
        return acc;
    }, {} as { [date: string]: { date: string, totalDuration: number, entries: ITimeEntry[] } });
}


/**
 * Returns the first day of the week for a given date.
 *
 * @param {Date} aWeekDate - The date for which to find the first day of the week.
 * @returns {Date} A new Date object representing the first day of the week, with the time set to 00:00:00.
 */
export function getWeekStartDate(aWeekDate: Date): Date {
    let todayWeekDayNo: number = aWeekDate.getDay();

    //Consider Monday as first day of week
    const mondayWeekDayNoInJs: number = 1; //Sunday is 0, Monday is 1, Friday is 5, Saturday is 6
    if (todayWeekDayNo < mondayWeekDayNoInJs) {
        todayWeekDayNo += 7;
    }

    const weekStart: Date = new Date();
    weekStart.setDate(weekStart.getDate() - (todayWeekDayNo - mondayWeekDayNoInJs));
    weekStart.setHours(0, 0, 0, 0);

    return weekStart;
}

/**
 * Returns the first day of the next week for a given date.
 *
 * @param {Date} now - The date for which to find the first day of the next week.
 * @returns {Date} A new Date object representing the first day of the next week, with the time set to 00:00:00.
 */
export function getNextWeekStartDate(now: Date): Date {
    const nextWeeksFirstDay: Date = getWeekStartDate(now);
    nextWeeksFirstDay.setDate(nextWeeksFirstDay.getDate() + 7);

    return nextWeeksFirstDay;
}
