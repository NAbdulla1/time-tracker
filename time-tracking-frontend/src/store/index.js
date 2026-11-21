import { defineStore } from "pinia";
import timeTrackingService from "../services/timeTrackingService";

export const useStore = defineStore("main", {
    state: () => ({
        isClockedIn: false,
        lastClockInTime: null,
        todaysTotalTime: 0,
        todaysEntries: [],
        weekClockEntries: [],
        thursdayClockEntries: [],
        isThursdayLoading: false
    }),
    actions: {
        async clockIn() {
            const data = await timeTrackingService.clockIn();
            this.isClockedIn = true;
            this.lastClockInTime = new Date(data.clockInTime);
        },
        async clockOut() {
            await timeTrackingService.clockOut();
            this.isClockedIn = false;
            this.lastClockInTime = null;
        },
        async getTodaysData() {
            const data = await timeTrackingService.getTodayData();
            this.todaysEntries = data.entries;
            this.todaysTotalTime = data.totalDuration;
        },
        async getClockStatus() {
            const data = await timeTrackingService.getClockStatus();
            this.isClockedIn = data.isClockedIn;
            this.lastClockInTime = data.isClockedIn ? new Date(data.clockInTime) : null;
        },
        async getWeekDays() {
            const data = await timeTrackingService.getWeekDays();
            this.weekClockEntries = data;
        },
        async getThursdayWeekDays() {
            this.isThursdayLoading = true;
            try {
                const data = await timeTrackingService.getThursdayWeekDays();
                this.thursdayClockEntries = data;
                return data;
            } finally {
                this.isThursdayLoading = false;
            }
        },
        async deleteEntry(entryId) {
            await timeTrackingService.deleteEntry(entryId);
        }
    }
});
