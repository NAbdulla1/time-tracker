<template>
    <div style="text-align: left;">
        <h3>Week Days</h3>

        <table class="data-table">
            <thead>
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
                    <td colspan="2">Reamining Weekly</td>
                    <td>{{ formatTime(weeklyTotal - weekTotalTime) }}</td>
                </tr>
            </tbody>
        </table>

        <div style="margin-top: 15px;">
            <label style="cursor: pointer;">
                <input type="checkbox" v-model="showThursdayCycle" @change="onToggleThursdayCycle">
                Show Thursday to Wednesday
            </label>
        </div>

        <div v-if="showThursdayCycle" style="margin-top: 15px;">
            <h3>Thursday to Wednesday</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Day</th>
                        <th>Total Time</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="day in store.thursdayClockEntries" :key="day.date">
                        <td>{{ day.date }}</td>
                        <td>{{ weekDay(day.date) }}</td>
                        <td>{{ formatTime(day.totalDuration) }}</td>
                    </tr>
                    <tr v-if="store.thursdayClockEntries.length === 0 && !store.isThursdayLoading">
                        <td colspan="3" style="text-align: center; color: #888;">No entries found for this period</td>
                    </tr>
                    <tr>
                        <td colspan="2"><strong>Total</strong></td>
                        <td><strong>{{ formatTime(thursdayTotalTime) }}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="js">
import { computed, onBeforeMount, ref } from 'vue';
import { formatTime, dateEquals, weekDay } from '../utils';
import { useStore } from '../store';

const store = useStore();
const props = defineProps({
    elapsedTime: Number
});

const weeklyTotal = 40 * 60 * 60; // 40 hours in minutes

const includeToday = ref(false);
const showThursdayCycle = ref(false);

onBeforeMount(async () => {
    await store.getWeekDays();
});

async function onToggleThursdayCycle() {
    if (showThursdayCycle.value) {
        await store.getThursdayWeekDays();
    }
}

const weekTotalTime = computed(() => {
    const today = new Date();
    let weekTotal = includeToday.value ? (store.todaysTotalTime + props.elapsedTime) : 0;
    for (let entry of store.weekClockEntries) {
        const date = new Date(entry.date);
        if (!dateEquals(date, today)) {
            weekTotal += entry.totalDuration;
        }
    }

    return weekTotal;
});

const thursdayTotalTime = computed(() => {
    return store.thursdayClockEntries.reduce((total, entry) => total + (entry.totalDuration || 0), 0);
});
</script>
