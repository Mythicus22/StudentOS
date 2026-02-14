import { connect } from "mongoose";

export const connectDB = async () => {
    const url = process.env.MONGODB_URL!
    return connect(url);
}