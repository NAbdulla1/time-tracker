function zeroPad(number, length) {
    return String(number).padStart(length, '0');
}

/**
 * Groups time entries by date and calculates the total duration per day.
 *
 * @param {Array} entries - An array of time entry objects, each containing `clockIn` and `clockOut` Date properties.
 * @returns {Object} An object where each key is a date string in the format 'YYYY-MM-DD', 
 * and each value is an object containing the `date`, `totalDuration` in seconds, and an array of `entries` for that date.
 */
function getEntriesGroupedByDate(entries) {
    return entries.reduce((acc, entry) => {
        const date = `${entry.clockIn.getFullYear()}-${zeroPad(entry.clockIn.getMonth() + 1, 2)}-${zeroPad(entry.clockIn.getDate(), 2)}`; // Extract the date part
        const duration = (entry.clockOut - entry.clockIn) / 1000; // Duration in seconds

        if (!acc[date]) {
            acc[date] = { date, totalDuration: 0, entries: [] };
        }

        acc[date].totalDuration += duration;
        acc[date].entries.push(entry);
        return acc;
    }, {});
}

/**
 * Returns the first day of the week for a given date.
 *
 * @param {Date} aWeekDate - The date for which to find the first day of the week.
 * @returns {Date} A new Date object representing the first day of the week, with the time set to 00:00:00.
 */
function getWeekStartDate(aWeekDate) {
    const todayWeekDayNo = aWeekDate.getDay();

    //Consider Monday as first day of week
    const mondayWeekDayNoInJs = 1; //Sunday is 0, Monday is 1, Friday is 5, Saturday is 6
    if (todayWeekDayNo < mondayWeekDayNoInJs) {
        todayWeekDayNo += 7;
    }

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (todayWeekDayNo - mondayWeekDayNoInJs));
    weekStart.setHours(0, 0, 0, 0);

    return weekStart;
}

function getNextWeekStartDate(now) {
    const nextWeeksFirstDay = getWeekStartDate(now);
    nextWeeksFirstDay.setDate(nextWeeksFirstDay.getDate() + 7);

    return nextWeeksFirstDay;
}

module.exports = {
    getEntriesGroupedByDate,
    getWeekStartDate,
    getNextWeekStartDate
};
