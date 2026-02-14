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
const getAllowedOrigins = () => {
  const frontendUrl = process.env.FRONTEND_URL;
  
  if (!frontendUrl) {
    // Only allow localhost in development
    if (!isProduction) {
      return ['http://localhost:5173', 'http://localhost:3000'];
    }
    // In production, FRONTEND_URL is required
    console.warn('⚠️  WARNING: FRONTEND_URL not set in production. CORS may fail.');
    return [];
  }
  
  // Split by comma and trim whitespace (supports multiple origins)
  return frontendUrl.split(',').map(url => url.trim());
};

const allowedOrigins = getAllowedOrigins();

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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