const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);
if (dns.setDefaultResultOrder) dns.setDefaultResultOrder('ipv4first');

const MONGODB_URI = "mongodb://boxfox:boxfox@ac-59fu0fz-shard-00-00.7oansfw.mongodb.net:27017,ac-59fu0fz-shard-00-01.7oansfw.mongodb.net:27017,ac-59fu0fz-shard-00-02.7oansfw.mongodb.net:27017/?ssl=true&replicaSet=atlas-vg6wst-shard-0&authSource=admin&appName=Cluster0";

async function checkUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        const dbName = mongoose.connection.db.databaseName;
        console.log(`📡 Connected to database: ${dbName}`);

        const db = mongoose.connection.db;
        const users = await db.collection('users').find({}).toArray();

        console.log(`\n📋 Users found (${users.length}):`);
        users.forEach(u => {
            console.log(`   - Email: ${u.email}, Role: ${u.role}, HasPassword: ${!!u.password}`);
        });

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

checkUsers();
