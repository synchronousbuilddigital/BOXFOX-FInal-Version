const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const dns = require('dns');

// Force DNS resolution to IPv4
dns.setServers(['8.8.8.8', '8.8.4.4']);
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

// Env extraction
const env = {};
try {
    const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, ...rest] = line.split('=');
        if (key && rest.length > 0) env[key.trim()] = rest.join('=').trim();
    });
} catch(e) {}

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
});

const ProductSchema = new mongoose.Schema({
    wpId: Number,
    name: String,
    images: [String]
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const updates = [
    { 
        wpId: 1884000000002, 
        paths: [
            'C:\\Users\\prasa\\.gemini\\antigravity\\brain\\481a1c8d-40c8-4916-9520-fc22c3bafe97\\large_burrito_box_1_1774544835718.png',
            'C:\\Users\\prasa\\.gemini\\antigravity\\brain\\481a1c8d-40c8-4916-9520-fc22c3bafe97\\large_burrito_box_2_1774544858239.png'
        ] 
    },
    { 
        wpId: 1884000000001, 
        paths: [
            'C:\\Users\\prasa\\.gemini\\antigravity\\brain\\481a1c8d-40c8-4916-9520-fc22c3bafe97\\small_wrap_box_1_1774544875613.png',
            'C:\\Users\\prasa\\.gemini\\antigravity\\brain\\481a1c8d-40c8-4916-9520-fc22c3bafe97\\small_wrap_box_2_1774544893441.png'
        ] 
    },
    { 
        wpId: 1884000000000, 
        paths: [
            'C:\\Users\\prasa\\.gemini\\antigravity\\brain\\481a1c8d-40c8-4916-9520-fc22c3bafe97\\wrap_sleeve_1_1774544913869.png',
            'C:\\Users\\prasa\\.gemini\\antigravity\\brain\\481a1c8d-40c8-4916-9520-fc22c3bafe97\\wrap_sleeve_2_1774544932713.png'
        ] 
    }
];

async function run() {
    try {
        await mongoose.connect(env.MONGODB_URI, { family: 4, bufferCommands: false });
        console.log("Connected to MongoDB via IPv4");

        for (const update of updates) {
            console.log(`Processing wpId: ${update.wpId}...`);
            const urls = [];
            for (const localPath of update.paths) {
                if (fs.existsSync(localPath)) {
                    console.log(`Uploading ${localPath}...`);
                    const result = await cloudinary.uploader.upload(localPath, {
                        folder: 'boxfox/products',
                        public_id: path.basename(localPath, '.png')
                    });
                    urls.push(result.secure_url);
                }
            }

            const result = await Product.findOneAndUpdate(
                { wpId: update.wpId },
                { $set: { images: urls } },
                { new: true }
            );

            if (result) {
                console.log(`Updated ${result.name} with ${urls.length} images.`);
            } else {
                console.log(`Product with wpId ${update.wpId} not found.`);
            }
        }
    } catch (err) {
        console.error("Execution error:", err);
    } finally {
        process.exit(0);
    }
}
run();
