<template>
    <div style="text-align: left;">
        <table class="data-table">
            <thead>
                <tr>
                    <th colspan="3" style="text-align: center;">Week Days ({{ primaryCycleTitle }})</th>
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
                <tr>
                    <td colspan="2">Week Total <input type="checkbox" v-model="includeToday" title="Include Today"></td>
                    <td>{{ formatTime(weekTotalTime) }}</td>
                </tr>
                <tr v-if="includeToday">
                    <td colspan="2">
                        {{ remainingWeeklySeconds < 0 ? 'Remaining Weekly (Overtime)' : 'Remaining Weekly' }}
                    </td>
                    <td :style="{ color: remainingWeeklySeconds < 0 ? '#4ade80' : 'inherit', fontWeight: remainingWeeklySeconds < 0 ? '600' : 'normal' }">
                        {{ formatTime(remainingWeeklySeconds) }}
                    </td>
                </tr>
            </tbody>
        </table>

        <div v-if="store.settings.secondaryWeekEnabled" style="margin-top: 16px; text-align: center;">
            <label style="cursor: pointer;">
                <input type="checkbox" v-model="showSecondaryCycle" @change="onToggleSecondaryCycle">
                Show {{ secondaryCycleTitle }}
            </label>
        </div>

        <div v-if="store.settings.secondaryWeekEnabled && showSecondaryCycle" style="margin-top: 15px;">
            <table class="data-table">
                <thead>
                    <tr>
                        <th colspan="3" style="text-align: center;">Week Days ({{ secondaryCycleTitle }})</th>
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
                        <td colspan="3" style="text-align: center; color: #888;">No entries found for this period</td>
                    </tr>
                    <tr>
                        <td colspan="2"><strong>Total</strong></td>
                        <td><strong>{{ formatTime(secondaryTotalTime) }}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="js">
import { computed, onBeforeMount, ref } from 'vue';
import { formatTime, weekDay, getCycleName, getTodayDateString } from '../utils';
import { useStore } from '../store';

const store = useStore();
const props = defineProps({
    elapsedTime: Number
});

const includeToday = ref(false);
const showSecondaryCycle = ref(false);

const primaryCycleTitle = computed(() => {
    return getCycleName(store.settings.firstDayOfWeek ?? 1);
});

const secondaryCycleTitle = computed(() => {
    return getCycleName(store.settings.secondaryWeekStartDay ?? 1);
});

const weeklyTargetSeconds = computed(() => {
    return (store.settings.weeklyTargetHours || 40) * 3600;
});

const remainingWeeklySeconds = computed(() => {
    return weeklyTargetSeconds.value - weekTotalTime.value;
});

onBeforeMount(async () => {
    await store.getWeekDays();
});

async function onToggleSecondaryCycle() {
    if (showSecondaryCycle.value) {
        await store.getSecondaryWeekDays();
    }
}

const weekTotalTime = computed(() => {
    const todayStr = getTodayDateString(store.settings.timeZone);
    let weekTotal = includeToday.value ? (store.todaysTotalTime + props.elapsedTime) : 0;
    for (let entry of store.weekClockEntries) {
        if (entry.date !== todayStr) {
            weekTotal += entry.totalDuration;
        }
    }

    return weekTotal;
});

const secondaryTotalTime = computed(() => {
    return store.secondaryClockEntries.reduce((total, entry) => total + (entry.totalDuration || 0), 0);
});
</script>
