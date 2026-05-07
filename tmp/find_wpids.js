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
    name: String
}, { collection: 'products' });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function run() {
    try {
        await mongoose.connect(env.MONGODB_URI, { family: 4, bufferCommands: false });
        const targets = [
            'Personal Pizza Box (8 inch) - 8×8×1.5',
            'Slim Pizza Box (8.9 inch) - 8.9×8.9×1.5',
            'Food Grade Pizza Box (Medium) - 10×10×1.5'
        ];
        const products = await Product.find({ name: { $in: targets } });
        console.log('--- FOUND PRODUCTS ---');
        products.forEach(p => console.log(`${p.wpId}: ${p.name}`));
        console.log('--- END ---');
    } catch (err) {
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}
run();
