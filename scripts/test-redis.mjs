import 'dotenv/config';
import { Redis } from '@upstash/redis';

async function testRedis() {
    console.log('--- Upstash Redis Connection Test ---');
    
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        console.error('❌ ERROR: Redis credentials missing in .env file!');
        console.log('Please add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to your .env');
        return;
    }

    console.log('Connecting to:', url.substring(0, 20) + '...');

    try {
        const redis = new Redis({
            url: url,
            token: token,
        });

        // Test SET
        const testKey = 'boxfox_test_connection';
        const testValue = { status: 'ok', timestamp: Date.now() };
        
        console.log('Testing SET operation...');
        await redis.set(testKey, JSON.stringify(testValue), { ex: 60 });
        console.log('✅ SET Successful');

        // Test GET
        console.log('Testing GET operation...');
        const result = await redis.get(testKey);
        
        if (result) {
            console.log('✅ GET Successful');
            console.log('Data retrieved from Redis:', result);
            console.log('\n✨ CONGRATULATIONS! Redis is properly configured.');
        } else {
            console.error('❌ ERROR: Could not retrieve data after setting it.');
        }

    } catch (error) {
        console.error('❌ CONNECTION FAILED!');
        console.error('Error details:', error.message);
        console.log('\nTips:');
        console.log('1. Check if your URL and Token are copied correctly.');
        console.log('2. Ensure your IP is not blocked (Upstash usually allows all by default).');
        console.log('3. Check if you have internet connectivity.');
    }
}

testRedis();
