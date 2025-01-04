import axios from "axios";
import { defineStore } from "pinia";

const apiBaseUrl = 'http://localhost:5050/api';

export const useStore = defineStore("main", {
    state: () => ({
        isClockedIn: false,
        lastClockInTime: null,
        todaysTotalTime: [],
        todaysEntries: [],
        weekClockEntries: []
    }),
    actions: {
        async clockIn() {
            const { data } = await axios.post(`${apiBaseUrl}/clock-in`);
            this.isClockedIn = true;
            this.lastClockInTime = new Date(data.clockInTime);
        },
        async clockOut() {
            await axios.post(`${apiBaseUrl}/clock-out`);
            this.isClockedIn = false;
            this.lastClockInTime = null;
        },
        async getTodaysData() {
            const { data } = await axios.get(`${apiBaseUrl}/today`);
            this.todaysEntries = data.entries;
            this.todaysTotalTime = data.totalDuration;
        },
        async getClockStatus() {
            const { data } = await axios.get(`${apiBaseUrl}/is-clocked-in`);
            this.isClockedIn = data.isClockedIn;
            this.lastClockInTime = data.isClockedIn ? new Date(data.clockInTime) : null;
        },
        async getWeekDays() {
            const {data} = await axios.get(`${apiBaseUrl}/current-week`);
            this.weekClockEntries = data;
        },
        async deleteEntry(entryId) {
            await axios.delete(`${apiBaseUrl}/clock-entry/${entryId}`);
        }
    }
});
