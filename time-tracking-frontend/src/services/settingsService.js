import api from './api';

export const settingsService = {
  /**
   * Fetch application settings
   * @returns {Promise<{ timeZone: string, firstDayOfWeek: number, secondaryWeekStartDay: number, secondaryWeekEnabled: boolean, weeklyTargetHours: number }>}
   */
  async getSettings() {
    const { data } = await api.get('/settings');
    return data;
  },

  /**
   * Update application settings
   * @param {Object} updateData
   * @returns {Promise<Object>}
   */
  async updateSettings(updateData) {
    const { data } = await api.put('/settings', updateData);
    return data;
  },
};

export default settingsService;
