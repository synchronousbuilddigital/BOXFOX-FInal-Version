const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

try {
    dns.setServers(['1.1.1.1', '8.8.8.8', '8.8.4.4']);
    if (dns.setDefaultOrder) {
        dns.setDefaultOrder('ipv4first');
    }
} catch (err) {}

const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) env[key.trim()] = rest.join('=').trim();
});

const ProductSchema = new mongoose.Schema({
    wpId: Number,
    name: String,
    images: [String]
}, { collection: 'products' });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function run() {
    try {
        await mongoose.connect(env.MONGODB_URI, { family: 4, bufferCommands: false });
        const ids = [1883000000010, 1883000000009, 1883000000008, 1883000000007];
        const products = await Product.find({ wpId: { $in: ids } });
        console.log('Final Products:');
        console.log(JSON.stringify(products, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}
run();
