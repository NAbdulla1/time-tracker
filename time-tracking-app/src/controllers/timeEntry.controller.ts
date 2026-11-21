import { Request, Response } from 'express';
import { timeEntryService } from '../services/timeEntry.service';
import { isValidTimeZone } from '../schemas/settings.schema';

function extractTimeZone(req: Request): string | undefined {
    const bodyTz = req.body?.timeZone as string | undefined;
    const headerTz = (req.headers['x-timezone'] || req.headers['timezone']) as string | undefined;
    const queryTz = (req.query.tz || req.query.timeZone) as string | undefined;
    const candidate = bodyTz || queryTz || headerTz;
    if (candidate && isValidTimeZone(candidate)) {
        return candidate;
    }
    return undefined;
}

export const clockIn = async (req: Request, res: Response): Promise<void> => {
    try {
        const customClockIn = req.body?.clockIn ? new Date(req.body.clockIn) : undefined;
        const { clockInTime } = await timeEntryService.clockIn(customClockIn);
        res.status(201).send({ message: 'Clocked in', clockInTime });
    } catch (error) {
        res.status(500).send({ error: 'Error clocking in' });
    }
};

export const clockOut = async (req: Request, res: Response): Promise<void> => {
    try {
        const customClockOut = req.body?.clockOut ? new Date(req.body.clockOut) : undefined;
        const entry = await timeEntryService.clockOut(customClockOut);
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
        const timeZone = extractTimeZone(req);
        const todayData = await timeEntryService.getTodayEntries(timeZone);
        res.status(200).send(todayData);
    } catch (error) {
        res.status(500).send({ error: "Error retrieving today's entries" });
    }
};

export const getPrevious = async (req: Request, res: Response): Promise<void> => {
    try {
        const timeZone = extractTimeZone(req);
        const previousEntries = await timeEntryService.getPreviousEntries(timeZone);
        res.status(200).send(previousEntries);
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving previous entries' });
    }
};

export const getCurrentWeek = async (req: Request, res: Response): Promise<void> => {
    try {
        const timeZone = extractTimeZone(req);
        const currentWeekEntries = await timeEntryService.getCurrentWeekEntries(timeZone);
        res.status(200).send(currentWeekEntries);
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving current week entries' });
    }
};

export const getSecondaryWeek = async (req: Request, res: Response): Promise<void> => {
    try {
        const timeZone = extractTimeZone(req);
        const secondaryWeekEntries = await timeEntryService.getSecondaryWeekEntries(timeZone);
        res.status(200).send(secondaryWeekEntries);
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving secondary week entries' });
    }
};

export const getThursdayWeek = async (req: Request, res: Response): Promise<void> => {
    try {
        const timeZone = extractTimeZone(req);
        const thursdayWeekEntries = await timeEntryService.getThursdayCycleEntries(timeZone);
        res.status(200).send(thursdayWeekEntries);
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving Thursday-to-Wednesday entries' });
    }
};

export const updateEntry = async (req: Request, res: Response): Promise<void> => {
    try {
        const entryId = req.params.id;
        const clockIn = new Date(req.body.clockIn);
        const clockOut = new Date(req.body.clockOut);
        const timeZone = extractTimeZone(req);
        const updated = await timeEntryService.updateEntry(entryId, clockIn, clockOut, timeZone);
        if (!updated) {
            res.status(404).send({ error: 'Entry not found' });
            return;
        }
        res.status(200).send({ message: 'Entry updated successfully', entry: updated });
    } catch (error: any) {
        if (error.message === 'Changing the entry date is not allowed') {
            res.status(400).send({ error: error.message });
            return;
        }
        res.status(500).send({ error: 'Error updating entry' });
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
