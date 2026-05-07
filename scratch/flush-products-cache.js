import 'dotenv/config';
import redis from '../lib/redis.js';

async function flushProductsCache() {
    try {
        const keys = await redis.keys('products:*');

        if (!keys.length) {
            console.log('No products:* keys found.');
            process.exit(0);
        }

        await redis.del(...keys);
        console.log(`Deleted ${keys.length} products:* cache keys.`);
        process.exit(0);
    } catch (err) {
        console.error('Failed to flush products cache:', err);
        process.exit(1);
    }
}

flushProductsCache();
