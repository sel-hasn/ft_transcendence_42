import { getDb } from './database.js';

export const startCleanupJob = () => {
    // Run every hour
    const INTERVAL = 60 * 60 * 1000;

    console.log('⏰ Token cleanup job initialized (Interval: 1 hour)');

    const runCleanup = () => {
        try {
            const db = getDb();
            const now = new Date().toISOString();

            // Delete tokens where expiration date is in the past
            const info = db.prepare('DELETE FROM token_blacklist WHERE expires_at < ?').run(now);

            if (info.changes > 0) {
                console.log(`🧹 Cleanup: Removed ${info.changes} expired tokens from blacklist`);
            }
        } catch (error) {
            console.error('❌ Error during token cleanup:', error);
        }
    };

    // Initial run (optional, maybe not needed immediately on startup, but harmless)
    // runCleanup(); 

    setInterval(runCleanup, INTERVAL);
};
