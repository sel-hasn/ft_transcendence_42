//server.ts
import { config } from './config';
import app from './app';
import { closeDb, initDatabase } from './core/database';

// Initialize the database before starting the server
initDatabase();

const server = app.listen(config.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.port}`);
    console.log(`📁 Environment: ${config.nodeEnv}`);
});

const gracefulShutdown = (signal: string) => {
    console.log(`${signal} signal received: Closing server...`);

    server.close(() => {
        closeDb();
        process.exit(0);
    });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));