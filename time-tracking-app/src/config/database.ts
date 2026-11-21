import mongoose from 'mongoose';
import { env } from './env';

/**
 * Connect to MongoDB using validated DB_URL from environment
 */
export const connectDB = async (): Promise<typeof mongoose> => {
    try {
        const conn = await mongoose.connect(env.DB_URL);
        console.log('Connected to MongoDB');
        return conn;
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
};
