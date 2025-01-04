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
                <tr v-for="day in weekDays" :key="day.date">
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
    </div>
</template>

<script setup lang="js">
import axios from 'axios';
import { computed, onBeforeMount, ref } from 'vue';
import { formatTime, dateEquals, weekDay } from '../utils';

const weeklyTotal = 40 * 60 * 60; // 40 hours in minutes

const props = defineProps({
    todaysTotalTime: Number
});

const weekDays = ref([]);
const includeToday = ref(false);

onBeforeMount(async () => {
    weekDays.value = await fetchWeekDaysData();
});

const weekTotalTime = computed(() => {
    const today = new Date();
    let weekTotal = includeToday.value ? props.todaysTotalTime : 0;
    for (let entry of weekDays.value) {
        const date = new Date(entry.date);
        if (!dateEquals(date, today)) {
            weekTotal += entry.totalDuration;
        }
    }

    return weekTotal;
});

async function fetchWeekDaysData() {
    const response = await axios.get('http://localhost:5050/api/current-week');
    return response.data;
}
</script>
