import { Request, Response } from 'express';
import { settingsService } from '../services/settings.service';

export const getSettings = async (_req: Request, res: Response): Promise<void> => {
    try {
        const settings = await settingsService.getSettings();
        res.status(200).send(settings);
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving settings' });
    }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const updated = await settingsService.updateSettings(req.body);
        res.status(200).send(updated);
    } catch (error) {
        res.status(500).send({ error: 'Error updating settings' });
    }
};
