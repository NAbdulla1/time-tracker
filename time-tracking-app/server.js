require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { getEntriesGroupedByDate, getWeekStartDate, getNextWeekStartDate } = require('./utils');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define a schema and model for time entries
const timeEntrySchema = new mongoose.Schema({
    clockIn: { type: Date, required: true },
    clockOut: { type: Date },
});

const TimeEntry = mongoose.model('TimeEntry', timeEntrySchema);

// Serve the static files from the Vue.js build folder
app.use(express.static(path.join(__dirname, 'frontend')));

// Route to clock in
app.post('/api/clock-in', async (req, res) => {
    try {
        const newEntry = new TimeEntry({ clockIn: new Date() });
        await newEntry.save();
        res.status(201).send({ message: 'Clocked in' });
    } catch (error) {
        res.status(500).send({ error: 'Error clocking in' });
    }
});

// Route to clock out
app.post('/api/clock-out', async (req, res) => {
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

// Route to check if the user is currently clocked in
app.get('/api/is-clocked-in', async (req, res) => {
    try {
        // Find the latest entry where clockOut is missing (indicating the user is clocked in)
        const entry = await TimeEntry.findOne({ clockOut: { $exists: false } }).sort({ clockIn: -1 });

        if (entry) {
            res.status(200).send({ isClockedIn: true });
        } else {
            res.status(200).send({ isClockedIn: false });
        }
    } catch (error) {
        res.status(500).send({ error: 'Error checking clock-in status' });
    }
});

// Route to get the most recent clock-in entry
app.get('/api/last-clock-in', async (req, res) => {
    try {
        const entry = await TimeEntry.findOne({ clockOut: { $exists: false } }).sort({ clockIn: -1 });

        if (entry) {
            // Send the clockIn time to the frontend
            res.status(200).send({ clockInTime: entry.clockIn });
        } else {
            res.status(200).send({ clockInTime: null }); // No active clock-in session
        }
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving last clock-in time' });
    }
});


// Route to get today's clock-in durations
app.get('/api/today', async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const entries = await TimeEntry.find({
            clockIn: { $gte: startOfDay, $lt: endOfDay },
        });

        const totalDuration = entries.reduce((total, entry) => {
            if (entry.clockOut) {
                return total + (entry.clockOut - entry.clockIn);
            }
            return total;
        }, 0);

        res.status(200).send({
            entries,
            totalDuration: totalDuration / 1000, // Duration in seconds
        });
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving today\'s entries' });
    }
});

// Route to get previous days' clock-in durations
app.get('/api/previous', async (req, res) => {
    try {
        const entries = await TimeEntry.find({ clockOut: { $exists: true } }).sort({ clockIn: -1 });

        const entriesGroupedByDate = getEntriesGroupedByDate(entries);

        res.status(200).send(Object.values(entriesGroupedByDate));
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving previous entries' });
    }
});

app.get('/api/current-week', async (req, res) => {
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

// Serve the index.html for any other routes (for Vue.js frontend)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start the server
const port = process.env.PORT || 5050;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
