const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
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

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
});

const ProductSchema = new mongoose.Schema({
    wpId: Number,
    name: String,
    images: [String]
}, { collection: 'products' });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const productData = [
    { wpId: 1883000000006, files: ['1883000000006_1.png', '1883000000006_2.png'] },
    { wpId: 1883000000005, files: ['1883000000005_1.png', '1883000000005_2.png'] },
    { wpId: 1883000000004, files: ['1883000000004_1.png', '1883000000004_2.png'] }
];

async function run() {
    try {
        await mongoose.connect(env.MONGODB_URI, { family: 4, bufferCommands: false });
        for (const item of productData) {
            console.log(`Processing wpId: ${item.wpId}...`);
            const uploadedUrls = [];
            for (const fileName of item.files) {
                const filePath = path.join(process.cwd(), 'public', 'products', fileName);
                if (!fs.existsSync(filePath)) continue;
                const result = await cloudinary.uploader.upload(filePath, {
                    folder: 'products',
                    public_id: fileName.split('.')[0],
                    overwrite: true
                });
                uploadedUrls.push(result.secure_url);
                console.log(`  Uploaded ${fileName} -> ${result.secure_url}`);
            }
            if (uploadedUrls.length > 0) {
                await Product.findOneAndUpdate({ wpId: item.wpId }, { $set: { images: uploadedUrls } });
                console.log(`  Updated database for wpId: ${item.wpId}`);
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}
run();
