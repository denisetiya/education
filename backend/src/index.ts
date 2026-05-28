import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import materialRoutes from './routes/material.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import dashboardRoutes from './routes/dashboard.routes';
import progressRoutes from './routes/progress.routes';
import moduleRoutes from './routes/module.routes';
import classRoutes from './routes/class.routes';
import analyticsRoutes from './routes/analytics.routes';
import env from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { apiRateLimitMiddleware, securityHeadersMiddleware } from './middleware/security.middleware';


const app = express();

app.disable('x-powered-by');
app.set('trust proxy', env.isProduction ? 1 : false);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) {
                return callback(null, true);
            }

            if (env.frontendOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true
    })
);
app.use(securityHeadersMiddleware);
app.use(cookieParser());
app.use(express.json({ limit: env.requestBodyLimit }));
app.use(express.urlencoded({ extended: true, limit: env.requestBodyLimit }));
app.use(apiRateLimitMiddleware);

app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        environment: env.nodeEnv,
        timestamp: new Date().toISOString()
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
});

export default app;
