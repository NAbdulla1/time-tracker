import { Request, Response } from 'express';
import { timeEntryService } from '../services/timeEntry.service';

export const clockIn = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clockInTime } = await timeEntryService.clockIn();
        res.status(201).send({ message: 'Clocked in', clockInTime });
    } catch (error) {
        res.status(500).send({ error: 'Error clocking in' });
    }
};

export const clockOut = async (req: Request, res: Response): Promise<void> => {
    try {
        const entry = await timeEntryService.clockOut();
        if (entry) {
            res.status(200).send({ message: 'Clocked out' });
        } else {
            res.status(400).send({ message: 'No active clock-in session found' });
        }
    } catch (error) {
        res.status(500).send({ error: 'Error clocking out' });
    }
};

export const getClockStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const status = await timeEntryService.getClockStatus();
        res.status(200).send(status);
    } catch (error) {
        res.status(500).send({ error: 'Error checking clock-in status' });
    }
};

export const getToday = async (req: Request, res: Response): Promise<void> => {
    try {
        const todayData = await timeEntryService.getTodayEntries();
        res.status(200).send(todayData);
    } catch (error) {
        res.status(500).send({ error: "Error retrieving today's entries" });
    }
};

export const getPrevious = async (req: Request, res: Response): Promise<void> => {
    try {
        const previousEntries = await timeEntryService.getPreviousEntries();
        res.status(200).send(previousEntries);
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving previous entries' });
    }
};

export const getCurrentWeek = async (req: Request, res: Response): Promise<void> => {
    try {
        const currentWeekEntries = await timeEntryService.getCurrentWeekEntries();
        res.status(200).send(currentWeekEntries);
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving current week entries' });
    }
};

export const getThursdayWeek = async (req: Request, res: Response): Promise<void> => {
    try {
        const thursdayWeekEntries = await timeEntryService.getThursdayCycleEntries();
        res.status(200).send(thursdayWeekEntries);
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving Thursday-to-Wednesday entries' });
    }
};

export const deleteEntry = async (req: Request, res: Response): Promise<void> => {
    try {
        const entryId = req.params.id;
        await timeEntryService.deleteEntry(entryId);
        res.status(200).send({ message: 'Entry deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Error deleting entry' });
    }
};
