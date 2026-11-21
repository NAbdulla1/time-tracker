import * as dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from './config/database';

const port = process.env.PORT || 5050;

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server running on port ${port}.\nURL: http://localhost:${port}\nPress Ctrl+C to quit.`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to database on startup:', err);
    });
