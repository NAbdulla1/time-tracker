import { describe, it, expect, vi, beforeEach } from 'vitest';
import { settingsService } from '../services/settings.service';
import Settings from '../models/Settings';

describe('SettingsService', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('getSettings', () => {
        it('should return existing settings if found', async () => {
            const mockSettings = {
                timeZone: 'America/New_York',
                firstDayOfWeek: 1,
                secondaryWeekStartDay: 1,
                secondaryWeekEnabled: true,
                weeklyTargetHours: 40,
            };

            vi.spyOn(Settings, 'findOne').mockResolvedValueOnce(mockSettings as any);

            const result = await settingsService.getSettings();
            expect(result.timeZone).toBe('America/New_York');
            expect(result.firstDayOfWeek).toBe(1);
            expect(result.secondaryWeekStartDay).toBe(1);
        });

        it('should create and return default settings if none exist', async () => {
            vi.spyOn(Settings, 'findOne').mockResolvedValueOnce(null);
            const createSpy = vi.spyOn(Settings, 'create').mockResolvedValueOnce({
                timeZone: 'UTC',
                firstDayOfWeek: 1,
                secondaryWeekStartDay: 1,
                secondaryWeekEnabled: true,
                weeklyTargetHours: 40,
            } as any);

            const result = await settingsService.getSettings();
            expect(createSpy).toHaveBeenCalledTimes(1);
            expect(result.firstDayOfWeek).toBe(1);
            expect(result.secondaryWeekStartDay).toBe(1);
        });
    });

    describe('updateSettings', () => {
        it('should update existing settings document', async () => {
            const mockDoc = {
                timeZone: 'UTC',
                firstDayOfWeek: 1,
                secondaryWeekStartDay: 1,
                secondaryWeekEnabled: true,
                weeklyTargetHours: 40,
                save: vi.fn().mockResolvedValue(true),
            };

            vi.spyOn(Settings, 'findOne').mockResolvedValueOnce(mockDoc as any);

            const result = await settingsService.updateSettings({
                timeZone: 'Europe/London',
                firstDayOfWeek: 0,
                secondaryWeekStartDay: 4,
            });

            expect(mockDoc.timeZone).toBe('Europe/London');
            expect(mockDoc.firstDayOfWeek).toBe(0);
            expect(mockDoc.secondaryWeekStartDay).toBe(4);
            expect(mockDoc.save).toHaveBeenCalledTimes(1);
            expect(result.timeZone).toBe('Europe/London');
        });
    });
});
