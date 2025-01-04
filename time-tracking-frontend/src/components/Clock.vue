<template>
  <div>
    <h1>Time Tracking</h1>
    <button @click="onClockIn" :disabled="isClockedIn">Clock In</button>
    <button @click="onClockOut" :disabled="!isClockedIn">Clock Out</button>

    <h2 v-if="isClockedIn">Time Since Last Clock-In: {{ formattedElapsedTime }}</h2>

    <h3>Today's Total Time: {{ formattedTotalTime }}</h3>
    <div style="overflow-x: auto;">
      <table class="data-table">
        <thead>
          <tr>
            <th>SL</th>
            <th>Clock In</th>
            <th>Clock Out</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(entry, index) of todaysEntries" :key="entry._id">
            <td style="text-align: center;">{{ index + 1 }}</td>
            <td>{{ entry.clockIn && displayTime(entry.clockIn) }}</td>
            <td>{{ entry.clockOut && displayTime(entry.clockOut) }}</td>
            <td style="text-align: center;">
              <span @click="onDeleteEntry(entry._id)" class="material-symbols-outlined icon-btn">
                delete
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Week :elapsedTime="elapsedTime" />
  </div>
</template>

<script>
import { formatTime } from '../utils';
import Week from './Week.vue';
import { mapActions, mapState } from 'pinia';
import { useStore } from '../store';

export default {
  components: { Week },
  data() {
    return {
      elapsedTime: 0, // Store the elapsed time since last clock-in in seconds
    };
  },
  computed: {
    ...mapState(useStore, ['isClockedIn', 'todaysTotalTime', 'todaysEntries', 'lastClockInTime']),
    // Formatted elapsed time in HH:MM:SS
    formattedElapsedTime() {
      return formatTime(this.elapsedTime);
    },
    // Formatted total time for today in HH:MM:SS
    formattedTotalTime() {
      return formatTime(this.todaysTotalTime + this.elapsedTime);
    },
  },
  methods: {
    ...mapActions(useStore, ['clockIn', 'clockOut', 'getTodaysData', 'getClockStatus', 'getWeekDays', 'deleteEntry']),
    displayTime(dt) {
      const dd = new Date(dt);
      return `${dd.toDateString()} ${dd.toLocaleTimeString()}`;
    },
    async onClockIn() {
      await this.clockIn();
      await this.getTodaysData();
    },
    async onClockOut() {
      await this.clockOut();
      await this.getTodaysData();
      await this.getWeekDays();
      this.elapsedTime = 0; // Reset elapsed time
    },
    calculateElapsedTime() {
      // Update the elapsed time every second
      setInterval(() => {
        if (!this.lastClockInTime) return; // Exit if no clock-in time
        const now = new Date();
        const elapsed = Math.floor((now - this.lastClockInTime) / 1000); // Duration in seconds
        this.elapsedTime = elapsed;
      }, 1000); // Update every second
    },
    async onDeleteEntry(id) {
      //TODO confirm before deleting
      await this.deleteEntry(id);
      await this.getClockStatus();
      await this.getTodaysData();
      await this.getWeekDays();
      if (!this.isClockedIn) {
        this.elapsedTime = 0;
      }
    }
  },
  async created() {
    await this.getTodaysData();
    await this.getClockStatus();
    this.calculateElapsedTime();
  },
};
</script>

<style scoped>
button {
  margin: 10px;
  padding: 10px 20px;
  font-size: 16px;
}

.data-table {
  margin: 0 auto;
}

.icon-btn {
  cursor: pointer;
}
</style>
