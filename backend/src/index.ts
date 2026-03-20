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
const isProduction = process.env.NODE_ENV === 'production';

// CORS configuration for development and production
const getAllowedOrigins = (): string[] => {
  const frontendUrl = process.env.FRONTEND_URL;
  if (frontendUrl) return frontendUrl.split(',').map(u => u.trim()).filter(Boolean);
  if (!isProduction) return ['http://localhost:3000', 'http://localhost:5173'];
  console.error('[CORS] FRONTEND_URL is not set in production — all cross-origin requests will be blocked.');
  return [];
};

const allowedOrigins = getAllowedOrigins();
console.log(`[CORS] Allowed origins: ${allowedOrigins.join(', ')}`);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, same-origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 200
}));

// Health check endpoint (useful for Railway)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
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
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, (err: Error | undefined) => {
        if (err) {
            console.log('Server startup failed.');
            console.log('Reason: ', err.message);
            process.exit(1);
        }
        console.log('Server is listening on port:', PORT);
    });
})
.catch((err: Error) => {
    console.log('Database connection failed.');
    console.log('Reason: ', err.message);
    process.exit(1);
})