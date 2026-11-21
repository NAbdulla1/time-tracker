import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

function padZero(number, length = 2) {
    return String(number).padStart(length, '0');
}

// Format duration seconds into HH:MM:SS or -HH:MM:SS
export function formatTime(seconds) {
    if (seconds === null || seconds === undefined || isNaN(seconds)) {
        return '00:00:00.000';
    }

    const isNegative = seconds < 0;
    const absSeconds = Math.abs(seconds);

    const hours = Math.floor(absSeconds / 3600);
    const minutes = Math.floor((absSeconds % 3600) / 60);
    const remainingSeconds = absSeconds % 60;

    const formatted = `${padZero(hours)}:${padZero(minutes)}:${remainingSeconds.toFixed(3).padStart(6, '0')}`;
    return isNegative ? `-${formatted}` : formatted;
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Returns full weekday name (e.g. 'Monday') for any date input using dayjs
 */
export function weekDay(dateInput) {
    if (!dateInput) return '';
    return dayjs(dateInput).format('dddd');
}

/**
 * Returns formatted date and time in the specified timezone
 */
export function formatDisplayDateTime(dateInput, timeZone = 'UTC') {
    if (!dateInput) return '';
    try {
        return dayjs(dateInput).tz(timeZone).format('ddd, MMM DD, YYYY hh:mm:ss A');
    } catch {
        return dayjs(dateInput).format('ddd, MMM DD, YYYY hh:mm:ss A');
    }
}

/**
 * Returns dynamic cycle name (e.g. 1 -> "Monday to Sunday", 4 -> "Thursday to Wednesday")
 */
export function getCycleName(startDayOfWeek) {
    const startIdx = ((startDayOfWeek % 7) + 7) % 7;
    const endIdx = (startIdx + 6) % 7;
    return `${DAY_NAMES[startIdx]} to ${DAY_NAMES[endIdx]}`;
}

/**
 * Compares two date objects or YYYY-MM-DD strings for date equality
 */
export function dateEquals(date1, date2) {
    if (!date1 || !date2) return false;
    const d1 = dayjs(date1).format('YYYY-MM-DD');
    const d2 = dayjs(date2).format('YYYY-MM-DD');
    return d1 === d2;
}

/**
 * Returns today's calendar date string (YYYY-MM-DD) in the specified timezone
 */
export function getTodayDateString(timeZone = 'UTC') {
    try {
        return dayjs().tz(timeZone).format('YYYY-MM-DD');
    } catch {
        return dayjs().format('YYYY-MM-DD');
    }
}

/**
 * Returns supported IANA timezones
 */
export function getAvailableTimeZones() {
    if (typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function') {
        try {
            return Intl.supportedValuesOf('timeZone');
        } catch {
            // fallback
        }
    }
    return [
        'UTC',
        'Africa/Cairo',
        'Africa/Johannesburg',
        'Africa/Lagos',
        'America/Anchorage',
        'America/Argentina/Buenos_Aires',
        'America/Bogota',
        'America/Chicago',
        'America/Denver',
        'America/Halifax',
        'America/Los_Angeles',
        'America/Mexico_City',
        'America/New_York',
        'America/Phoenix',
        'America/Santiago',
        'America/Sao_Paulo',
        'America/Toronto',
        'America/Vancouver',
        'Asia/Bangkok',
        'Asia/Dhaka',
        'Asia/Dubai',
        'Asia/Hong_Kong',
        'Asia/Jakarta',
        'Asia/Jerusalem',
        'Asia/Karachi',
        'Asia/Kolkata',
        'Asia/Manila',
        'Asia/Seoul',
        'Asia/Shanghai',
        'Asia/Singapore',
        'Asia/Taipei',
        'Asia/Tokyo',
        'Australia/Adelaide',
        'Australia/Brisbane',
        'Australia/Melbourne',
        'Australia/Perth',
        'Australia/Sydney',
        'Europe/Amsterdam',
        'Europe/Athens',
        'Europe/Berlin',
        'Europe/Brussels',
        'Europe/Dublin',
        'Europe/Helsinki',
        'Europe/Istanbul',
        'Europe/Lisbon',
        'Europe/London',
        'Europe/Madrid',
        'Europe/Moscow',
        'Europe/Paris',
        'Europe/Rome',
        'Europe/Stockholm',
        'Europe/Vienna',
        'Europe/Warsaw',
        'Europe/Zurich',
        'Pacific/Auckland',
        'Pacific/Fiji',
        'Pacific/Honolulu',
    ];
}
