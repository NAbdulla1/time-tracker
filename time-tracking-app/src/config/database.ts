import mongoose from 'mongoose';

/**
 * Connect to MongoDB using DB_URL from environment
 */
export const connectDB = async (): Promise<typeof mongoose> => {
    const dbUrl = process.env.DB_URL || '';
    try {
        const conn = await mongoose.connect(dbUrl);
        console.log('Connected to MongoDB');
        return conn;
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
};
