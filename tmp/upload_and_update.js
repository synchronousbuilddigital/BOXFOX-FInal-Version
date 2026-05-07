const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const dns = require('dns');

// Fix for MongoDB connection issues
try {
    dns.setServers(['1.1.1.1', '8.8.8.8', '8.8.4.4']);
    if (dns.setDefaultOrder) {
        dns.setDefaultOrder('ipv4first');
    }
} catch (err) {
    console.warn("DNS setup failed, proceeding with default.");
}

// Env loader
const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) env[key.trim()] = rest.join('=').trim();
});

// Configure Cloudinary
cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
});

// Define Product Model (simplified for the update)
const ProductSchema = new mongoose.Schema({
    wpId: Number,
    name: String,
    images: [String]
}, { collection: 'products' });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const productData = [
    { wpId: 1883000000010, files: ['1883000000010_1.png', '1883000000010_2.png'] },
    { wpId: 1883000000009, files: ['1883000000009_1.png', '1883000000009_2.png'] },
    { wpId: 1883000000008, files: ['1883000000008_1.png', '1883000000008_2.png'] },
    { wpId: 1883000000007, files: ['1883000000007_1.png', '1883000000007_2.png'] }
];

async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(env.MONGODB_URI, { family: 4, bufferCommands: false });
        console.log('Connected.');

        for (const item of productData) {
            console.log(`Processing wpId: ${item.wpId}...`);
            const uploadedUrls = [];

            for (const fileName of item.files) {
                const filePath = path.join(process.cwd(), 'public', 'products', fileName);
                if (!fs.existsSync(filePath)) {
                    console.error(`File NOT found: ${filePath}`);
                    continue;
                }

                console.log(`  Uploading ${fileName}...`);
                const result = await cloudinary.uploader.upload(filePath, {
                    folder: 'products',
                    public_id: fileName.split('.')[0], // use the ID as base filename
                    overwrite: true
                });
                console.log(`  Uploaded: ${result.secure_url}`);
                uploadedUrls.push(result.secure_url);
            }

            if (uploadedUrls.length > 0) {
                const updatedProduct = await Product.findOneAndUpdate(
                    { wpId: item.wpId },
                    { $set: { images: uploadedUrls } },
                    { new: true }
                );
                if (updatedProduct) {
                    console.log(`  Successfully updated database for ${updatedProduct.name}`);
                } else {
                    console.error(`  Product with wpId ${item.wpId} not found in database.`);
                }
            }
        }
    } catch (err) {
        console.error('An error occurred:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

run();
