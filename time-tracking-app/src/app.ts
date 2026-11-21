import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import timeEntryRoutes from './routes/timeEntry.routes';
import settingsRoutes from './routes/settings.routes';

const app: Application = express();

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// API Routes
app.use('/api', timeEntryRoutes);
app.use('/api', settingsRoutes);

// Static frontend serving
app.use(express.static(path.join(__dirname, 'frontend')));

// SPA Wildcard fallback
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

export default app;
