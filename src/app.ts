import express, { Application, Request, Response, NextFunction } from "express";
import { deserializeUser } from './middlewares/deserializeUser.js';
import authRoutes from './routes/auth.routes.js';
import twoFARoutes from './routes/2fa.routes.js';
import userRoutes from './routes/user.routes.js';
import { AppError } from './utils/AppError.js';
import morgan from 'morgan';
import cors from 'cors';
import { config } from './config/index.js';

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

const app: Application = express();

// Middleware
app.use(cors({
    origin: config.corsOrigin,
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Custom Middleware
app.use(deserializeUser);

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Hello from Express! 🚀' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/auth/2fa', twoFARoutes);
app.use('/api/users', userRoutes);

// 404 Handler
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

export default app;