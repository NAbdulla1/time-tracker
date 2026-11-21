import api from './api';

export const timeTrackingService = {
  /**
   * Clock in active session
   * @returns {Promise<{ message: string, clockInTime: string }>}
   */
  async clockIn() {
    const { data } = await api.post('/clock-in');
    return data;
  },

  /**
   * Clock out active session
   * @returns {Promise<{ message: string }>}
   */
  async clockOut() {
    const { data } = await api.post('/clock-out');
    return data;
  },

  /**
   * Check if user is currently clocked in
   * @returns {Promise<{ isClockedIn: boolean, clockInTime: string | null }>}
   */
  async getClockStatus() {
    const { data } = await api.get('/is-clocked-in');
    return data;
  },

  /**
   * Fetch today's time entries and total duration
   * @returns {Promise<{ entries: Array, totalDuration: number }>}
   */
  async getTodayData() {
    const { data } = await api.get('/today');
    return data;
  },

  /**
   * Fetch previous completed entries grouped by date
   * @returns {Promise<Array>}
   */
  async getPreviousData() {
    const { data } = await api.get('/previous');
    return data;
  },

  /**
   * Fetch entries for the current week grouped by date
   * @returns {Promise<Array>}
   */
  async getWeekDays() {
    const { data } = await api.get('/current-week');
    return data;
  },

  /**
   * Fetch entries for the secondary week cycle grouped by date
   * @returns {Promise<Array>}
   */
  async getSecondaryWeekDays() {
    const { data } = await api.get('/secondary-week');
    return data;
  },

  /**
   * Alias for backward compatibility
   */
  async getThursdayWeekDays() {
    return this.getSecondaryWeekDays();
  },

  /**
   * Delete a clock entry by ID
   * @param {string} entryId
   * @returns {Promise<{ message: string }>}
   */
  async deleteEntry(entryId) {
    const { data } = await api.delete(`/clock-entry/${entryId}`);
    return data;
  },
};

export default timeTrackingService;
