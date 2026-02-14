import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes.js';
import todoRoutes from './routes/todoRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import urlRoutes from './routes/urlRoutes.js';
import toolsRoutes from './routes/toolsRoutes.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { connectDB } from './database/index.js';

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json());
app.use(cookieParser());

// routes
app.use('/user', userRoutes);
app.use('/todo', todoRoutes);
app.use('/note', noteRoutes);
app.use('/url', urlRoutes);
app.use('/tools', toolsRoutes);

// global error handling middlware
app.use(errorMiddleware);

connectDB()
.then(() => {
    console.log('Database connected successfully.');
    app.listen(5000, (err: Error | undefined) => {
        if (err) {
            console.log('Server startup failed.');
            console.log('Reason: ', err.message);
            process.exit(1);
        }
        console.log('Server is listening on port:', 5000);
    });
})
.catch((err: Error) => {
    console.log('Database connection failed.');
    console.log('Reason: ', err.message);
    process.exit(1);
})