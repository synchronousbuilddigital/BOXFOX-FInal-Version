import { Redis } from '@upstash/redis'

/**
 * Initialize Upstash Redis client
 * This client is serverless-friendly and works in Edge runtimes.
 */
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

/**
 * Cache helper to get or set data
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Async function to fetch data if cache miss
 * @param {number} ttl - Time to live in seconds (default 1 hour)
 */
export async function getOrSetCache(key, fetchFn, ttl = 3600) {
    try {
        // Try to get from cache
        const cachedData = await redis.get(key);
        
        if (cachedData) {
            console.log(`[Redis] Cache Hit: ${key}`);
            return cachedData;
        }

        console.log(`[Redis] Cache Miss: ${key}. Fetching from DB...`);
        // If not in cache, fetch from source
        const data = await fetchFn();

        // Store in cache with TTL
        if (data) {
            await redis.set(key, JSON.stringify(data), { ex: ttl });
        }

        return data;
    } catch (error) {
        console.error(`[Redis] Error for key ${key}:`, error);
        // On error, just fetch directly from source as failover
        return await fetchFn();
    }
}

export default redis;
