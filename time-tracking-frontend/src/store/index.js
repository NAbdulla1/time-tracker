import { defineStore } from "pinia";
import timeTrackingService from "../services/timeTrackingService";
import settingsService from "../services/settingsService";

export const useStore = defineStore("main", {
    state: () => ({
        isClockedIn: false,
        lastClockInTime: null,
        todaysTotalTime: 0,
        todaysEntries: [],
        weekClockEntries: [],
        secondaryClockEntries: [],
        isSecondaryLoading: false,
        settings: {
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            firstDayOfWeek: 1,        // 1 = Monday
            secondaryWeekStartDay: 1, // 1 = Monday
            secondaryWeekEnabled: true,
            weeklyTargetHours: 40,
        },
        isSettingsLoading: false,
        isSidebarCollapsed: localStorage.getItem('time_tracker_sidebar_collapsed') === 'true',
    }),
    getters: {
        // Alias for backward compatibility
        thursdayClockEntries: (state) => state.secondaryClockEntries,
        isThursdayLoading: (state) => state.isSecondaryLoading,
    },
    actions: {
        toggleSidebar() {
            this.isSidebarCollapsed = !this.isSidebarCollapsed;
            localStorage.setItem('time_tracker_sidebar_collapsed', String(this.isSidebarCollapsed));
        },
        async fetchSettings() {
            this.isSettingsLoading = true;
            try {
                const data = await settingsService.getSettings();
                if (data && typeof data === 'object') {
                    this.settings = {
                        ...this.settings,
                        ...data,
                        timeZone: data.timeZone || this.settings.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
                    };
                    localStorage.setItem('user_timezone', this.settings.timeZone);
                }
                return this.settings;
            } catch (err) {
                console.error('Failed to fetch settings:', err);
                if (!this.settings.timeZone) {
                    this.settings.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
                }
            } finally {
                this.isSettingsLoading = false;
            }
        },
        async updateSettings(updateData) {
            this.isSettingsLoading = true;
            try {
                const data = await settingsService.updateSettings(updateData);
                this.settings = data;
                localStorage.setItem('user_timezone', data.timeZone);
                // Refresh time tracking data to reflect new timezone / week start settings
                await Promise.all([
                    this.getTodaysData(),
                    this.getWeekDays(),
                    this.getSecondaryWeekDays(),
                ]);
                return data;
            } finally {
                this.isSettingsLoading = false;
            }
        },
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
        async getSecondaryWeekDays() {
            this.isSecondaryLoading = true;
            try {
                const data = await timeTrackingService.getSecondaryWeekDays();
                this.secondaryClockEntries = data;
                return data;
            } finally {
                this.isSecondaryLoading = false;
            }
        },
        // Alias for backward compatibility
        async getThursdayWeekDays() {
            return this.getSecondaryWeekDays();
        },
        async deleteEntry(entryId) {
            await timeTrackingService.deleteEntry(entryId);
        }
    }
});
