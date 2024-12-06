function padZero(number) {
    return number < 10 ? '0' + number : number;
}

// Format the time in HH:MM:SS
export function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    // Format as HH:MM:SS
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(remainingSeconds.toFixed(3))}`;
}

export function dateEquals(date1, date2) {
    return date1.getDate() === date2.getDate()
        && date1.getMonth() === date2.getMonth()
        && date1.getFullYear() === date2.getFullYear();
}

export function weekDay(date) {
    const weekDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return weekDayNames[new Date(date).getDay()];
}