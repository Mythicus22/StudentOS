import { connect } from "mongoose";

export const connectDB = async () => {
    const url = process.env.MONGODB_URL;
    
    if (!url) {
        throw new Error('MONGODB_URL environment variable is not set. Please configure it in .env file.');
    }
    
    try {
        const connection = await connect(url, {
            retryWrites: true,
            w: 'majority'
        });
        return connection;
    } catch (error) {
        console.error('MongoDB connection error:', error instanceof Error ? error.message : error);
        throw error;
    }
}