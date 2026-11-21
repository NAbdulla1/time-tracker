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
            <td style="text-align: center; white-space: nowrap;">
              <span
                v-if="entry.clockIn && entry.clockOut"
                @click="onOpenEditModal(entry)"
                class="material-symbols-outlined icon-btn edit-btn"
                title="Edit entry"
                style="margin-right: 8px;"
              >
                edit
              </span>
              <span
                @click="onDeleteEntry(entry._id)"
                class="material-symbols-outlined icon-btn delete-btn"
                title="Delete entry"
              >
                delete
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Week :elapsedTime="elapsedTime" />

    <!-- Edit Entry Modal -->
    <EditEntryModal
      :show="isEditModalOpen"
      :entry="editingEntry"
      :timeZone="clientTimeZone"
      @close="onCloseEditModal"
      @saved="onCloseEditModal"
    />
  </div>
</template>

<script>
import { formatTime, formatDisplayDateTime } from '../utils';
import Week from './Week.vue';
import EditEntryModal from './EditEntryModal.vue';
import { mapActions, mapState } from 'pinia';
import { useStore } from '../store';

export default {
  components: { Week, EditEntryModal },
  data() {
    return {
      elapsedTime: 0, // Store the elapsed time since last clock-in in seconds
      isEditModalOpen: false,
      editingEntry: null,
    };
  },
  computed: {
    ...mapState(useStore, ['isClockedIn', 'todaysTotalTime', 'todaysEntries', 'lastClockInTime', 'secondaryClockEntries', 'settings']),
    clientTimeZone() {
      return (
        this.settings?.timeZone ||
        localStorage.getItem('user_timezone') ||
        (typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone) ||
        'UTC'
      );
    },
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
    ...mapActions(useStore, [
      'clockIn',
      'clockOut',
      'getTodaysData',
      'getClockStatus',
      'getWeekDays',
      'getSecondaryWeekDays',
      'updateEntry',
      'deleteEntry',
    ]),
    displayTime(dt) {
      return formatDisplayDateTime(dt, this.clientTimeZone);
    },
    onOpenEditModal(entry) {
      if (entry.clockIn && entry.clockOut) {
        this.editingEntry = entry;
        this.isEditModalOpen = true;
      }
    },
    onCloseEditModal() {
      this.isEditModalOpen = false;
      this.editingEntry = null;
    },
    async onClockIn() {
      await this.clockIn();
      await this.getTodaysData();
    },
    async onClockOut() {
      await this.clockOut();
      await this.getTodaysData();
      await this.getWeekDays();
      if (this.settings?.secondaryWeekEnabled) {
        await this.getSecondaryWeekDays();
      }
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
      await this.deleteEntry(id);
      await this.getClockStatus();
      await this.getTodaysData();
      await this.getWeekDays();
      if (this.settings?.secondaryWeekEnabled) {
        await this.getSecondaryWeekDays();
      }
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
  vertical-align: middle;
  font-size: 18px;
  transition: color 0.2s, transform 0.1s;
}

.icon-btn:hover {
  transform: scale(1.15);
}

.edit-btn:hover {
  color: #646cff;
}

.delete-btn:hover {
  color: #ef4444;
}
</style>
