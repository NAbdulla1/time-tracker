<template>
  <div>
    <h1>Time Tracking</h1>
    <button @click="clockIn" :disabled="clockedIn">Clock In</button>
    <button @click="clockOut" :disabled="!clockedIn">Clock Out</button>

    <h2>Time Since Last Clock-In: {{ formattedElapsedTime }}</h2>

    <h3>Today's Total Time: {{ formattedTotalTime }}</h3>
    <div style="overflow-x: auto;">
      <table class="todays-table">
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

    <h3>Previous Days</h3>
    <div v-for="day in previousDays" :key="day.date">
      <ul style="text-align: left;">
        <li>{{ day.date }} - Total Time: {{ formatTime(day.totalDuration) }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
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
      return this.formatTime(this.elapsedTime);
    },
    // Formatted total time for today in HH:MM:SS
    formattedTotalTime() {
      return this.formatTime(this.totalTime + this.elapsedTime);
    },
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
    async fetchPreviousDaysData() {
      const response = await axios.get('http://localhost:5050/api/previous');
      this.previousDays = response.data;
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
    // Format the time in HH:MM:SS
    formatTime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      // Format as HH:MM:SS
      return `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(remainingSeconds.toFixed(3))}`;
    },
    // Helper function to add leading zero if the number is less than 10
    padZero(number) {
      return number < 10 ? '0' + number : number;
    }
  },
  created() {
    this.fetchTodayData();
    this.fetchPreviousDaysData();
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

.todays-table {
  max-width: 600px;
  border: 1px solid black;
  border-collapse: collapse;
  margin: 0 auto;
}

.todays-table td,
.todays-table th {
  padding-left: 5px;
  padding-right: 5px;
  text-align: left;
  border: 1px solid black;
}
</style>