const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(["8.8.8.8", "8.8.4.4"]);
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

const productSchema = new mongoose.Schema({
    wpId: Number,
    type: String,
    parent_id: Number,
    isActive: Boolean,
    name: String
}, { collection: 'products' });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function check() {
    try {
        console.log("Connecting to:", MONGODB_URI);
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");
        
        const total = await Product.countDocuments({});
        console.log("Total Products in collection:", total);
        
        const activeCount = await Product.countDocuments({ isActive: { $ne: false } });
        console.log("Active Products ($ne false):", activeCount);
        
        const types = await Product.aggregate([
            { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);
        console.log("Types:", JSON.stringify(types, null, 2));
        
        const parents = await Product.aggregate([
            { $group: { _id: "$parent_id", count: { $sum: 1 } } }
        ]);
        console.log("Parent IDs:", JSON.stringify(parents, null, 2));
        
        const sample = await Product.findOne({}).lean();
        console.log("Sample Document:", JSON.stringify(sample, null, 2));
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
