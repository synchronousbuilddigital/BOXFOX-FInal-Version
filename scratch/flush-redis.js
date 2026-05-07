import 'dotenv/config';
import redis from '../lib/redis.js';

async function flush() {
    try {
        console.log('Flushing all Redis keys...');
        await redis.flushall();
        console.log('Redis cache cleared successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Failed to flush Redis:', err);
        process.exit(1);
    }
}

flush();
