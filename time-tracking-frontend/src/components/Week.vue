<template>
  <div
    class="weeks-wrapper"
    :class="{
      'side-by-side': store.settings?.secondaryWeekEnabled,
      'single-center': !store.settings?.secondaryWeekEnabled,
    }"
  >
    <!-- Primary Week Table -->
    <div class="week-card">
      <table class="data-table">
        <thead>
          <tr>
            <th colspan="3" class="table-header-title">
              Week Days ({{ primaryCycleTitle }})
            </th>
          </tr>
          <tr>
            <th>Date</th>
            <th>Day</th>
            <th>Total Time</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="day in store.weekClockEntries" :key="day.date">
            <td>{{ day.date }}</td>
            <td>{{ weekDay(day.date) }}</td>
            <td>{{ formatTime(day.totalDuration) }}</td>
          </tr>
          <tr v-if="store.weekClockEntries.length === 0">
            <td colspan="3" class="empty-state">No entries found for this period</td>
          </tr>
          <tr>
            <td colspan="2">
              Week Total
              <input type="checkbox" v-model="includeToday" title="Include Today" />
            </td>
            <td>{{ formatTime(weekTotalTime) }}</td>
          </tr>
          <tr v-if="includeToday">
            <td colspan="2">
              {{ remainingWeeklySeconds < 0 ? 'Remaining Weekly (Overtime)' : 'Remaining Weekly' }}
            </td>
            <td
              :style="{
                color: remainingWeeklySeconds < 0 ? '#4ade80' : 'inherit',
                fontWeight: remainingWeeklySeconds < 0 ? '600' : 'normal',
              }"
            >
              {{ formatTime(remainingWeeklySeconds) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Secondary Week Table (shown when secondaryWeekEnabled is true) -->
    <div v-if="store.settings?.secondaryWeekEnabled" class="week-card">
      <table class="data-table">
        <thead>
          <tr>
            <th colspan="3" class="table-header-title">
              Week Days ({{ secondaryCycleTitle }})
            </th>
          </tr>
          <tr>
            <th>Date</th>
            <th>Day</th>
            <th>Total Time</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="day in store.secondaryClockEntries" :key="day.date">
            <td>{{ day.date }}</td>
            <td>{{ weekDay(day.date) }}</td>
            <td>{{ formatTime(day.totalDuration) }}</td>
          </tr>
          <tr v-if="store.secondaryClockEntries.length === 0 && !store.isSecondaryLoading">
            <td colspan="3" class="empty-state">No entries found for this period</td>
          </tr>
          <tr>
            <td colspan="2">
              Week Total
              <input type="checkbox" v-model="includeToday" title="Include Today" />
            </td>
            <td>{{ formatTime(secondaryWeekTotalTime) }}</td>
          </tr>
          <tr v-if="includeToday">
            <td colspan="2">
              {{ secondaryRemainingWeeklySeconds < 0 ? 'Remaining Weekly (Overtime)' : 'Remaining Weekly' }}
            </td>
            <td
              :style="{
                color: secondaryRemainingWeeklySeconds < 0 ? '#4ade80' : 'inherit',
                fontWeight: secondaryRemainingWeeklySeconds < 0 ? '600' : 'normal',
              }"
            >
              {{ formatTime(secondaryRemainingWeeklySeconds) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="js">
import { computed, onBeforeMount, ref, watch } from 'vue';
import { formatTime, weekDay, getCycleName, getTodayDateString, getCycleRange } from '../utils';
import { useStore } from '../store';

const store = useStore();
const props = defineProps({
  elapsedTime: Number,
});

const includeToday = ref(false);

const primaryCycleTitle = computed(() => {
  return getCycleName(store.settings?.firstDayOfWeek ?? 1);
});

const secondaryCycleTitle = computed(() => {
  return getCycleName(store.settings?.secondaryWeekStartDay ?? 1);
});

const weeklyTargetSeconds = computed(() => {
  return (store.settings?.weeklyTargetHours || 40) * 3600;
});

const weekTotalTime = computed(() => {
  const todayStr = getTodayDateString(store.settings?.timeZone);
  let weekTotal = includeToday.value ? (store.todaysTotalTime + (props.elapsedTime || 0)) : 0;
  for (let entry of store.weekClockEntries) {
    if (entry.date !== todayStr) {
      weekTotal += entry.totalDuration;
    }
  }
  return weekTotal;
});

const remainingWeeklySeconds = computed(() => {
  return weeklyTargetSeconds.value - weekTotalTime.value;
});

const isRunningInSecondaryCycle = computed(() => {
  if (!store.isClockedIn || !props.elapsedTime) return false;
  const tz = store.settings?.timeZone || 'UTC';
  const startDay = store.settings?.secondaryWeekStartDay ?? 1;
  const currentCycle = getCycleRange(new Date(), startDay, tz, true);
  const clockInTime = store.lastClockInTime ? new Date(store.lastClockInTime) : new Date();
  return clockInTime >= currentCycle.startDate && clockInTime < currentCycle.endDate;
});

const secondaryWeekTotalTime = computed(() => {
  const todayStr = getTodayDateString(store.settings?.timeZone);
  let total = 0;
  for (const entry of store.secondaryClockEntries) {
    if (entry.date !== todayStr) {
      total += entry.totalDuration;
    } else if (includeToday.value) {
      total += entry.totalDuration;
    }
  }

  if (includeToday.value && isRunningInSecondaryCycle.value) {
    total += (props.elapsedTime || 0);
  }

  return total;
});

const secondaryRemainingWeeklySeconds = computed(() => {
  return weeklyTargetSeconds.value - secondaryWeekTotalTime.value;
});

onBeforeMount(async () => {
  await store.getWeekDays();
  if (store.settings?.secondaryWeekEnabled) {
    await store.getSecondaryWeekDays();
  }
});

watch(
  () => store.settings?.secondaryWeekEnabled,
  async (enabled) => {
    if (enabled && store.secondaryClockEntries.length === 0) {
      await store.getSecondaryWeekDays();
    }
  }
);
</script>

<style scoped>
.weeks-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 24px;
  margin: 24px auto 0;
  width: 100%;
  box-sizing: border-box;
}

.weeks-wrapper.side-by-side {
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
}

.weeks-wrapper.single-center {
  flex-direction: column;
  align-items: center;
}

.week-card {
  flex: 1 1 360px;
  max-width: 500px;
  min-width: 300px;
  width: 100%;
  box-sizing: border-box;
}

.week-card .data-table {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}

.table-header-title {
  text-align: center;
  font-weight: 600;
  background-color: rgba(255, 255, 255, 0.04);
}

.empty-state {
  text-align: center;
  color: var(--text-muted, #888);
  font-style: italic;
  padding: 12px 8px;
}
</style>
