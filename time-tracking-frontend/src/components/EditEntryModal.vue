<template>
  <div v-if="show" class="modal-backdrop" @click.self="onClose">
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-header">
        <h3 id="modal-title" class="modal-title">✏️ Edit Time Entry</h3>
        <button class="close-btn" @click="onClose" title="Close modal">✕</button>
      </div>

      <div class="modal-body">
        <div class="tz-info">
          Editing times in client timezone: <strong>{{ timeZone }}</strong>
        </div>

        <div v-if="errorMessage" class="error-banner">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="onSave">
          <!-- Fixed / Read-Only Date according to client timezone -->
          <div class="form-field date-field">
            <label>
              <strong>Date:</strong>
            </label>
            <div class="fixed-date-badge">
              <span>📅 {{ formattedEntryDate }}</span>
            </div>
            <small class="help-text">Entry date is locked according to client timezone ({{ timeZone }}).</small>
          </div>

          <!-- Clock In Time -->
          <div class="form-field">
            <label for="edit-clock-in-time">
              <strong>Clock In Time:</strong>
            </label>
            <input
              id="edit-clock-in-time"
              type="time"
              step="1"
              v-model="form.clockInTime"
              class="modal-input"
              required
            />
          </div>

          <!-- Clock Out Time -->
          <div class="form-field">
            <label for="edit-clock-out-time">
              <strong>Clock Out Time:</strong>
            </label>
            <input
              id="edit-clock-out-time"
              type="time"
              step="1"
              v-model="form.clockOutTime"
              class="modal-input"
              required
            />
          </div>

          <!-- Overnight Shift Notice -->
          <div v-if="isOvernight" class="overnight-note">
            🌙 <strong>Overnight shift:</strong> Clock-out finishes the next calendar day in {{ timeZone }}.
          </div>

          <!-- Duration Preview -->
          <div class="duration-preview" :class="{ invalid: durationSeconds <= 0 }">
            <span>Duration:</span>
            <strong>{{ formattedDuration }}</strong>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="onClose" :disabled="isSaving">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSaving || durationSeconds <= 0">
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch, onMounted, onUnmounted } from 'vue';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { formatTime } from '../utils';
import { useStore } from '../store';

dayjs.extend(utc);
dayjs.extend(timezone);

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  entry: {
    type: Object,
    default: null,
  },
  timeZone: {
    type: String,
    default: 'UTC',
  },
});

const emit = defineEmits(['close', 'saved']);
const store = useStore();

const form = reactive({
  clockInTime: '',
  clockOutTime: '',
});

const localDateStr = ref('');
const isSaving = ref(false);
const errorMessage = ref('');

// Format the fixed date for display using client timezone
const formattedEntryDate = computed(() => {
  if (!props.entry?.clockIn) return '';
  const tz = props.timeZone || 'UTC';
  return dayjs(props.entry.clockIn).tz(tz).format('dddd, MMMM DD, YYYY');
});

// Populate form whenever modal is opened
watch(
  () => [props.show, props.entry, props.timeZone],
  ([show, entry, tzProp]) => {
    if (show && entry) {
      errorMessage.value = '';
      isSaving.value = false;
      const tz = tzProp || 'UTC';

      // Lock to original calendar date in client timezone
      localDateStr.value = dayjs(entry.clockIn).tz(tz).format('YYYY-MM-DD');

      // Populate only the time portion (HH:mm:ss) in client timezone
      form.clockInTime = entry.clockIn
        ? dayjs(entry.clockIn).tz(tz).format('HH:mm:ss')
        : '';
      form.clockOutTime = entry.clockOut
        ? dayjs(entry.clockOut).tz(tz).format('HH:mm:ss')
        : '';
    }
  },
  { immediate: true }
);

// Detect overnight shift (e.g. clock-in 22:00, clock-out 02:00)
const isOvernight = computed(() => {
  if (!form.clockInTime || !form.clockOutTime) return false;
  return form.clockOutTime < form.clockInTime;
});

// Calculate duration in seconds
const durationSeconds = computed(() => {
  if (!localDateStr.value || !form.clockInTime || !form.clockOutTime) return 0;
  const tz = props.timeZone || 'UTC';
  const start = dayjs.tz(`${localDateStr.value} ${form.clockInTime}`, tz);
  let end = dayjs.tz(`${localDateStr.value} ${form.clockOutTime}`, tz);
  if (isOvernight.value) {
    end = end.add(1, 'day');
  }
  return end.diff(start, 'second', true);
});

const formattedDuration = computed(() => {
  if (durationSeconds.value <= 0) {
    return 'Invalid (Clock Out must be after Clock In)';
  }
  return formatTime(durationSeconds.value);
});

function onClose() {
  if (!isSaving.value) {
    emit('close');
  }
}

async function onSave() {
  if (durationSeconds.value <= 0) {
    errorMessage.value = 'Clock out time must be strictly after clock in time.';
    return;
  }

  isSaving.value = true;
  errorMessage.value = '';

  try {
    const tz = props.timeZone || 'UTC';
    // Recombine the fixed date with the edited times in client timezone
    const start = dayjs.tz(`${localDateStr.value} ${form.clockInTime}`, tz);
    let end = dayjs.tz(`${localDateStr.value} ${form.clockOutTime}`, tz);
    if (isOvernight.value) {
      end = end.add(1, 'day');
    }

    const clockInUtc = start.toISOString();
    const clockOutUtc = end.toISOString();

    await store.updateEntry(props.entry._id, {
      clockIn: clockInUtc,
      clockOut: clockOutUtc,
      timeZone: tz,
    });

    emit('saved');
    emit('close');
  } catch (err) {
    console.error('Failed to update entry:', err);
    errorMessage.value =
      err?.response?.data?.error || err?.message || 'Failed to update entry. Please check your inputs.';
  } finally {
    isSaving.value = false;
  }
}

// Close on Escape key
function onKeydown(e) {
  if (e.key === 'Escape' && props.show) {
    onClose();
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  box-sizing: border-box;
}

.modal-card {
  background: var(--card-bg, #28282d);
  border: 1px solid var(--border-color, #444);
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  text-align: left;
  overflow: hidden;
  animation: modal-enter 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color, #38383f);
}

.modal-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-heading, #fff);
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  color: var(--text-muted, #aaa);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  color: var(--text-heading, #fff);
  background-color: rgba(125, 125, 125, 0.15);
}

.modal-body {
  padding: 20px;
}

.tz-info {
  font-size: 0.85rem;
  color: var(--text-muted, #94a3b8);
  margin-bottom: 16px;
  background: rgba(100, 108, 255, 0.08);
  border: 1px solid rgba(100, 108, 255, 0.2);
  padding: 8px 12px;
  border-radius: 6px;
}

.error-banner {
  background-color: #5c1d1d;
  color: #fca5a5;
  border: 1px solid #b91c1c;
  padding: 10px 14px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 0.9rem;
}

.form-field {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  color: var(--text-heading, #fff);
  font-size: 0.95rem;
}

.fixed-date-badge {
  padding: 10px 12px;
  border-radius: 6px;
  background: rgba(100, 108, 255, 0.08);
  border: 1px solid var(--border-color, #444);
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-heading, #fff);
  user-select: none;
}

.help-text {
  color: var(--text-muted, #888);
  font-size: 0.8rem;
  margin-top: 2px;
}

.overnight-note {
  margin-top: -6px;
  margin-bottom: 14px;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #f59e0b;
  font-size: 0.82rem;
}

.modal-input {
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid var(--input-border, #44444e);
  background-color: var(--input-bg, #18181b);
  color: inherit;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.modal-input:focus {
  outline: none;
  border-color: #646cff;
}

.duration-preview {
  margin: 18px 0;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
  color: var(--text-heading, #fff);
}

.duration-preview.invalid {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.btn-secondary {
  background: transparent;
  border-color: var(--border-color, #555);
  color: var(--nav-text-color, #ccc);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-heading, #fff);
}

.btn-primary {
  background-color: #646cff;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background-color: #535bf2;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>