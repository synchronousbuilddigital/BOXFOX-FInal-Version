import mongoose from 'mongoose';
import dns from 'dns';

// Force use of Google's public DNS to fix MongoDB SRV resolution on restricted networks
if (typeof window === 'undefined') {
    try {
        dns.setServers(['1.1.1.1', '8.8.8.8', '8.8.4.4']);
        if (dns.setDefaultResultOrder) {
            dns.setDefaultResultOrder('ipv4first');
        }
    } catch (err) {
        console.warn("DNS setup failed, proceeding with default.");
    }
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            family: 4, // Force IPv4 to resolve ECONNREFUSED issues on some networks
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
