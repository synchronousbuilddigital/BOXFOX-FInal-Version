const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://boxfox:boxfox@ac-59fu0fz-shard-00-00.7oansfw.mongodb.net:27017,ac-59fu0fz-shard-00-01.7oansfw.mongodb.net:27017,ac-59fu0fz-shard-00-02.7oansfw.mongodb.net:27017/?ssl=true&replicaSet=atlas-vg6wst-shard-0&authSource=admin&appName=Cluster0';

async function main() {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    console.log("Connected DB name:", db.databaseName);
    const collections = await db.listCollections().toArray();
    console.log("Collections in DB:");
    collections.forEach(c => console.log(c.name));
    process.exit(0);
}

main().catch(console.error);
