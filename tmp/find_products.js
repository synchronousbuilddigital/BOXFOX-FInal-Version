const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Simple env loader
const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const ProductSchema = new mongoose.Schema({
    name: String,
    price: Number,
    category: String,
    _id: mongoose.Schema.Types.ObjectId
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function run() {
    try {
        await mongoose.connect(env.MONGODB_URI);
        const products = await Product.find({ name: { $regex: /Wrap/i } });
        console.log(JSON.stringify(products, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}
run();
