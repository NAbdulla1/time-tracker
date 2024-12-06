<template>
  <div>
    <h1>Time Tracking</h1>
    <button @click="clockIn" :disabled="clockedIn">Clock In</button>
    <button @click="clockOut" :disabled="!clockedIn">Clock Out</button>

    <h2 v-if="clockedIn">Time Since Last Clock-In: {{ formattedElapsedTime }}</h2>

    <h3>Today's Total Time: {{ formattedTotalTime }}</h3>
    <div style="overflow-x: auto;">
      <table class="data-table">
        <thead>
          <tr>
            <th>SL</th>
            <th>Clock In</th>
            <th>Clock Out</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(entry, index) of todaysEntries" :key="entry._id">
            <td style="text-align: center;">{{ index + 1 }}</td>
            <td>{{ entry.clockIn && displayTime(entry.clockIn) }}</td>
            <td>{{ entry.clockOut && displayTime(entry.clockOut) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <Week />
  </div>
</template>

<script>
import axios from 'axios';
import { formatTime } from '../utils';
import Week from './Week.vue';

export default {
  components: { Week },
  data() {
    return {
      clockedIn: false,
      totalTime: 0,
      previousDays: [],
      lastClockInTime: null, // Store the last clock-in time
      elapsedTime: 0, // Store the elapsed time since last clock-in in seconds
      todaysEntries: []
    };
  },
  computed: {
    // Formatted elapsed time in HH:MM:SS
    formattedElapsedTime() {
      return formatTime(this.elapsedTime);
    },
    // Formatted total time for today in HH:MM:SS
    formattedTotalTime() {
      return formatTime(this.totalTime + this.elapsedTime);
    }
  },
  methods: {
    displayTime(dt) {
      const dd = new Date(dt);
      return `${dd.toDateString()} ${dd.toLocaleTimeString()}`;
    },
    async clockIn() {
      await axios.post('http://localhost:5050/api/clock-in');
      this.clockedIn = true;
      this.fetchTodayData(); // Update today's data after clocking in
      this.checkClockInStatus(); // Check if the user is clocked in after clocking in
    },
    async clockOut() {
      await axios.post('http://localhost:5050/api/clock-out');
      this.clockedIn = false;
      this.fetchTodayData(); // Update today's data after clocking out
      this.lastClockInTime = null; // Reset last clock-in time
      this.elapsedTime = 0; // Reset elapsed time
    },
    async fetchTodayData() {
      const response = await axios.get('http://localhost:5050/api/today');
      this.totalTime = response.data.totalDuration;
      this.todaysEntries = response.data.entries;
    },
    async checkClockInStatus() {
      try {
        const response = await axios.get('http://localhost:5050/api/is-clocked-in');
        if (response.data.isClockedIn) {
          this.clockedIn = true;
          // Fetch the clock-in time from the backend
          const entry = await axios.get('http://localhost:5050/api/last-clock-in');
          this.lastClockInTime = new Date(entry.data.clockInTime);
          this.calculateElapsedTime(); // Start calculating elapsed time
        } else {
          this.clockedIn = false;
          this.lastClockInTime = null; // If not clocked in, reset last clock-in time
          this.elapsedTime = 0; // Reset elapsed time if not clocked in
        }
      } catch (error) {
        console.error('Error checking clock-in status:', error);
      }
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
  },
  created() {
    this.fetchTodayData();
    this.checkClockInStatus(); // Check if user is clocked in when the component is created
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
</style>
