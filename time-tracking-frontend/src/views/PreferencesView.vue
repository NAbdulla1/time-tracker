<template>
  <div class="preferences-view">
    <div class="preferences-card">
      <h2>⚙️ User Preferences</h2>
      <p class="subtitle">Customize timezone, week cycles, and targets for calculations.</p>

      <div v-if="successMessage" class="alert success">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="alert error">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="onSave">
        <!-- Timezone -->
        <div class="form-group">
          <label for="timezone-select">
            <strong>Client Timezone</strong>
          </label>
          <div class="input-with-button">
            <select id="timezone-select" v-model="formData.timeZone" class="form-control">
              <option v-for="tz in timeZones" :key="tz" :value="tz">
                {{ tz }}
              </option>
            </select>
            <button type="button" class="btn secondary-btn" @click="onAutoDetectTimezone" title="Detect timezone from browser">
              Auto-detect
            </button>
          </div>
          <small class="help-text">Weekly calculations and daily hours will be computed according to this timezone.</small>
        </div>

        <!-- First Day of Week -->
        <div class="form-group">
          <label for="first-day-select">
            <strong>First Day of Week (Primary)</strong>
          </label>
          <select id="first-day-select" v-model.number="formData.firstDayOfWeek" class="form-control">
            <option v-for="(name, index) in dayOptions" :key="index" :value="index">
              {{ name }}
            </option>
          </select>
          <small class="help-text">Controls the starting day for your primary weekly calculations (Default: Monday).</small>
        </div>

        <!-- Secondary Week Enabled -->
        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="formData.secondaryWeekEnabled" />
            <span>Enable Secondary Week Cycle in Tracker</span>
          </label>
        </div>

        <!-- Secondary Week Start Day (shown only when enabled) -->
        <div v-if="formData.secondaryWeekEnabled" class="form-group">
          <label for="secondary-day-select">
            <strong>Secondary Week Start Day</strong>
          </label>
          <select id="secondary-day-select" v-model.number="formData.secondaryWeekStartDay" class="form-control">
            <option v-for="(name, index) in dayOptions" :key="index" :value="index">
              {{ name }}
            </option>
          </select>
          <div class="preview-badge">
            Cycle Preview: <strong>{{ secondaryCyclePreview }}</strong>
          </div>
          <small class="help-text">Controls the dynamic secondary cycle (e.g., Thursday to Wednesday or Monday to Sunday).</small>
        </div>

        <!-- Weekly Target Hours -->
        <div class="form-group">
          <label for="target-hours">
            <strong>Weekly Target Hours</strong>
          </label>
          <input
            id="target-hours"
            type="number"
            min="1"
            max="168"
            step="0.5"
            v-model.number="formData.weeklyTargetHours"
            class="form-control"
            required
          />
          <small class="help-text">Used to calculate remaining hours in the primary weekly view.</small>
        </div>

        <!-- Submit Button -->
        <div class="form-actions">
          <button type="submit" class="btn primary-btn" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : 'Save Preferences' }}
          </button>
          <router-link to="/" class="btn cancel-btn">
            Back to Tracker
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue';
import { useStore } from '../store';
import { DAY_NAMES, getCycleName, getAvailableTimeZones } from '../utils';

const store = useStore();
const timeZones = getAvailableTimeZones();
const dayOptions = DAY_NAMES;

const isSaving = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const formData = reactive({
  timeZone: 'UTC',
  firstDayOfWeek: 1,
  secondaryWeekStartDay: 1,
  secondaryWeekEnabled: true,
  weeklyTargetHours: 40,
});

onMounted(async () => {
  if (!store.settings.timeZone) {
    await store.fetchSettings();
  }
  Object.assign(formData, {
    timeZone: store.settings.timeZone || 'UTC',
    firstDayOfWeek: store.settings.firstDayOfWeek ?? 1,
    secondaryWeekStartDay: store.settings.secondaryWeekStartDay ?? 1,
    secondaryWeekEnabled: store.settings.secondaryWeekEnabled ?? true,
    weeklyTargetHours: store.settings.weeklyTargetHours ?? 40,
  });
});

const secondaryCyclePreview = computed(() => {
  return getCycleName(formData.secondaryWeekStartDay);
});

function onAutoDetectTimezone() {
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (detected) {
    formData.timeZone = detected;
    successMessage.value = `Detected browser timezone: ${detected}`;
    setTimeout(() => { successMessage.value = ''; }, 3000);
  }
}

async function onSave() {
  isSaving.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    await store.updateSettings({
      timeZone: formData.timeZone,
      firstDayOfWeek: formData.firstDayOfWeek,
      secondaryWeekStartDay: formData.secondaryWeekStartDay,
      secondaryWeekEnabled: formData.secondaryWeekEnabled,
      weeklyTargetHours: formData.weeklyTargetHours,
    });
    successMessage.value = 'Preferences saved successfully! Weekly calculations have been updated.';
  } catch (err) {
    console.error(err);
    errorMessage.value = 'Failed to save preferences. Please check your inputs and try again.';
  } finally {
    isSaving.value = false;
  }
}
</script>

<style scoped>
.preferences-view {
  max-width: 650px;
  margin: 0 auto;
  text-align: left;
}

.preferences-card {
  background: var(--card-bg, #2a2a2a);
  border: 1px solid var(--border-color, #444);
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.subtitle {
  color: #aaa;
  margin-top: -8px;
  margin-bottom: 20px;
  font-size: 0.95rem;
}

.alert {
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 0.95rem;
}

.alert.success {
  background-color: #1e4620;
  color: #a3e635;
  border: 1px solid #2e7d32;
}

.alert.error {
  background-color: #5c1d1d;
  color: #fca5a5;
  border: 1px solid #b91c1c;
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 6px;
  font-size: 0.95rem;
}

.input-with-button {
  display: flex;
  gap: 8px;
}

.form-control {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--input-border, #555);
  background-color: var(--input-bg, #1a1a1a);
  color: inherit;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #646cff;
}

.help-text {
  color: #888;
  font-size: 0.85rem;
  margin-top: 4px;
}

.preview-badge {
  display: inline-block;
  margin-top: 8px;
  padding: 4px 10px;
  border-radius: 4px;
  background: #3b3b4f;
  color: #cbd5e1;
  font-size: 0.9rem;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  padding: 10px 18px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.primary-btn {
  background-color: #646cff;
  color: white;
}

.primary-btn:hover {
  background-color: #535bf2;
}

.secondary-btn {
  background-color: #3f3f46;
  color: #e4e4e7;
  white-space: nowrap;
}

.secondary-btn:hover {
  background-color: #52525b;
}

.cancel-btn {
  background-color: transparent;
  color: #aaa;
  border: 1px solid #555;
}

.cancel-btn:hover {
  background-color: #333;
  color: #fff;
}
</style>
