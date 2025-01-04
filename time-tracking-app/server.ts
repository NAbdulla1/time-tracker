import * as dotenv from 'dotenv';
dotenv.config();
import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { getEntriesGroupedByDate, getWeekStartDate, getNextWeekStartDate } from './utils';
import TimeEntry from './db/models/TimeEntry';

const app: Application = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.DB_URL || '')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err: Error) => console.error('MongoDB connection error:', err));

app.use(express.static(path.join(__dirname, 'frontend')));

app.post('/api/clock-in', async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const newEntry = new TimeEntry({ clockIn: now });
        await newEntry.save();
        res.status(201).send({ message: 'Clocked in', clockInTime: now });
    } catch (error) {
        res.status(500).send({ error: 'Error clocking in' });
    }
});

app.post('/api/clock-out', async (req: Request, res: Response) => {
    try {
        const entry = await TimeEntry.findOne({ clockOut: { $exists: false } }).sort({ clockIn: -1 });
        if (entry) {
            entry.clockOut = new Date();
            await entry.save();
            res.status(200).send({ message: 'Clocked out' });
        } else {
            res.status(400).send({ message: 'No active clock-in session found' });
        }
    } catch (error) {
        res.status(500).send({ error: 'Error clocking out' });
    }
});

app.get('/api/is-clocked-in', async (req: Request, res: Response) => {
    try {
        const entry = await TimeEntry.findOne({ clockOut: { $exists: false } }).sort({ clockIn: -1 });
        res.status(200).send({
            isClockedIn: !!entry,
            clockInTime: entry ? entry.clockIn : null
        });
    } catch (error) {
        res.status(500).send({ error: 'Error checking clock-in status' });
    }
});

app.get('/api/today', async (req: Request, res: Response) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const entries = await TimeEntry.find({
            clockIn: { $gte: startOfDay, $lt: endOfDay },
        });

        const totalDuration = entries.reduce((total, entry) => {
            if (entry.clockOut) {
                return total + (entry.clockOut.getTime() - entry.clockIn.getTime());
            }
            return total;
        }, 0);

        res.status(200).send({
            entries,
            totalDuration: totalDuration / 1000,
        });
    } catch (error) {
        res.status(500).send({ error: "Error retrieving today's entries" });
    }
});

app.get('/api/previous', async (req: Request, res: Response) => {
    try {
        const entries = await TimeEntry.find({ clockOut: { $exists: true } }).sort({ clockIn: -1 });
        const entriesGroupedByDate = getEntriesGroupedByDate(entries);
        res.status(200).send(Object.values(entriesGroupedByDate));
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving previous entries' });
    }
});

app.get('/api/current-week', async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const firstDay = getWeekStartDate(now);
        const nextWeeksFirstDay = getNextWeekStartDate(now);

        const entries = await TimeEntry.find({
            clockIn: { $gte: firstDay },
            clockOut: { $lt: nextWeeksFirstDay },
        });

        const entriesGroupedByDate = getEntriesGroupedByDate(entries);
        res.status(200).send(Object.values(entriesGroupedByDate));
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving current week entries' });
    }
});

app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const port = process.env.PORT || 5050;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
