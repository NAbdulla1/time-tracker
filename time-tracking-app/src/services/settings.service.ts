import Settings, { ISettings } from '../models/Settings';

export class SettingsService {
    /**
     * Retrieve the settings document, creating a default one if none exists
     */
    async getSettings(): Promise<ISettings> {
        let settings = await Settings.findOne();
        if (!settings) {
            const defaultTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
            settings = await Settings.create({
                timeZone: defaultTz,
                firstDayOfWeek: 1, // Monday
                secondaryWeekStartDay: 1, // Monday
                secondaryWeekEnabled: true,
                weeklyTargetHours: 40,
            });
        } else if (!settings.timeZone) {
            // Repair legacy or incomplete document if timeZone is empty
            settings.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
            await settings.save();
        }
        return settings;
    }

    /**
     * Update the settings document
     */
    async updateSettings(updateData: Partial<ISettings>): Promise<ISettings> {
        let settings = await Settings.findOne();
        if (!settings) {
            const defaultTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
            settings = await Settings.create({
                timeZone: defaultTz,
                firstDayOfWeek: 1,
                secondaryWeekStartDay: 1,
                secondaryWeekEnabled: true,
                weeklyTargetHours: 40,
                ...updateData,
            });
            return settings;
        }

        Object.assign(settings, updateData);
        await settings.save();
        return settings;
    }
}

export const settingsService = new SettingsService();
