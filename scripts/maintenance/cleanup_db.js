const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);
if (dns.setDefaultResultOrder) dns.setDefaultResultOrder('ipv4first');

const MONGODB_URI = "mongodb+srv://boxfox:boxfox@cluster0.7oansfw.mongodb.net/";

async function cleanup() {
    try {
        await mongoose.connect(MONGODB_URI);
        const dbName = mongoose.connection.db.databaseName;
        console.log(`📡 Connected to MongoDB (database: ${dbName})`);

        const db = mongoose.connection.db;

        // List all collections with counts
        const collections = await db.listCollections().toArray();
        console.log("\n📋 Collections BEFORE cleanup:");
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`   ${col.name}: ${count} documents`);
        }

        // Clean up ALL old data
        console.log("\n🗑  Cleaning up old test/mock data...");

        // Delete all orders
        if (collections.find(c => c.name === 'orders')) {
            const r = await db.collection('orders').deleteMany({});
            console.log(`   ✅ Deleted ${r.deletedCount} orders`);
        }

        // Delete all old products (we'll re-import fresh)
        if (collections.find(c => c.name === 'products')) {
            const r = await db.collection('products').deleteMany({});
            console.log(`   ✅ Deleted ${r.deletedCount} old products`);
        }

        // Delete test users (keep admin only)
        if (collections.find(c => c.name === 'users')) {
            const r = await db.collection('users').deleteMany({ role: { $ne: 'admin' } });
            console.log(`   ✅ Deleted ${r.deletedCount} non-admin users`);
        }

        // Clean all other test collections
        const cleanCollections = ['boxproducts', 'boxcategories', 'wishlists', 'designs',
            'queries', 'contacts', 'coupons', 'b2binquiries', 'partnerships', 'boxgroups'];
        for (const colName of cleanCollections) {
            if (collections.find(c => c.name === colName)) {
                const r = await db.collection(colName).deleteMany({});
                console.log(`   ✅ Deleted ${r.deletedCount} ${colName}`);
            }
        }

        // Show remaining data
        console.log("\n📊 Remaining data AFTER cleanup:");
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            if (count > 0) {
                console.log(`   ${col.name}: ${count} documents`);
            }
        }

        console.log("\n🎉 Database cleaned! Now run: node import_products.js");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

cleanup();
