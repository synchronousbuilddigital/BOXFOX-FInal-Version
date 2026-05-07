const { Redis } = require('@upstash/redis');
require('dotenv').config();

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function clearCache() {
  try {
    console.log("Connecting to Redis...");
    const keys = await redis.keys('products:*');
    console.log(`Found ${keys.length} product cache keys.`);
    if (keys.length > 0) {
      const deleted = await redis.del(...keys);
      console.log(`Deleted ${deleted} keys.`);
    }
    console.log("Cache cleared successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Redis Error:", err);
    process.exit(1);
  }
}

clearCache();
