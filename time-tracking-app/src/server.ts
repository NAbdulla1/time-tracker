import app from './app';
import { env } from './config/env';
import { connectDB } from './config/database';

connectDB()
    .then(() => {
        app.listen(env.PORT, () => {
            console.log(`Server running on port ${env.PORT}.\nURL: http://localhost:${env.PORT}\nPress Ctrl+C to quit.`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to database on startup:', err);
    });
