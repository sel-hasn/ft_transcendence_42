//server.ts
import { config } from './config';
import app from './app';

const server = app.listen(config.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.port}`);
    console.log(`📁 Environment: ${config.nodeEnv}`);
});

// const gracefulShutdown = (signal: string) => {
//     console.log(`${signal} signal received: closing HTTP server`);

//     server.close(() => {
//         console.log('HTTP server closed');

//         db.close((err) => {
//             if (err) {
//                 console.error('Error closing SQLite connection', err);
//                 process.exit(1);
//             }

//             console.log('SQLite connection closed');
//             process.exit(0);
//         });
//     });
// };

// process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
// process.on('SIGINT', () => gracefulShutdown('SIGINT'));