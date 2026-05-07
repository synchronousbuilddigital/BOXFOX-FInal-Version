const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const env = {};
try {
    const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
    envContent.split('\n').filter(Boolean).forEach(line => {
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
    wpId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    price: String,
    regular_price: String,
    categories: [String],
    images: [String],
    short_description: String,
    dimensions: {
        length: Number,
        width: Number,
        height: Number,
        unit: { type: String, default: 'inch' }
    },
    stock_status: { type: String, default: 'instock' }
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const pizzaProducts = [
    {
        wpId: 1883000000003,
        name: "Standard Food Pizza Box (Large) - 12×12×1.5",
        price: "30",
        regular_price: "35",
        categories: ["Pizza Box", "Takeaway"],
        short_description: "Standard large corrugated pizza box for food delivery. Sustainable and rigid.",
        dimensions: { length: 12, width: 12, height: 1.5 },
        paths: [
            'C:\\Users\\prasa\\.gemini\\antigravity\\brain\\481a1c8d-40c8-4916-9520-fc22c3bafe97\\standard_pizza_box_1_1774545296909.png',
            'C:\\Users\\prasa\\.gemini\\antigravity\\brain\\481a1c8d-40c8-4916-9520-fc22c3bafe97\\standard_pizza_box_2_1774545314402.png'
        ]
    },
    {
        wpId: 1883000000002,
        name: "Small Pizza Box - 7×7×1.5",
        price: "22",
        regular_price: "25",
        categories: ["Pizza Box", "Individual"],
        short_description: "Compact pizza box for individual portions or desserts. Sleek and durable.",
        dimensions: { length: 7, width: 7, height: 1.5 },
        paths: [
            'C:\\Users\\prasa\\.gemini\\antigravity\\brain\\481a1c8d-40c8-4916-9520-fc22c3bafe97\\small_pizza_box_1_1774545336396.png',
            'C:\\Users\\prasa\\.gemini\\antigravity\\brain\\481a1c8d-40c8-4916-9520-fc22c3bafe97\\small_pizza_box_2_1774545355996.png'
        ]
    },
    {
        wpId: 1883000000001,
        name: "Classic Pizza Box (Medium) - 10×10×1.5",
        price: "28",
        regular_price: "30",
        categories: ["Pizza Box", "Classic"],
        short_description: "Classic medium pizza box. E-flute corrugated material with high print quality.",
        dimensions: { length: 10, width: 10, height: 1.5 },
        paths: [
            'C:\\Users\\prasa\\.gemini\\antigravity\\brain\\481a1c8d-40c8-4916-9520-fc22c3bafe97\\classic_pizza_box_1_1774545377606.png',
            'C:\\Users\\prasa\\.gemini\\antigravity\\brain\\481a1c8d-40c8-4916-9520-fc22c3bafe97\\classic_pizza_box_2_1774545396556.png'
        ]
    },
    {
        wpId: 1883000000000,
        name: "Premium Pizza Box (Large) - 12×12×1.5",
        price: "32",
        regular_price: "40",
        categories: ["Pizza Box", "Luxury"],
        short_description: "Luxury gourmet pizza box with premium finishing. Spot UV and foil stamping available.",
        dimensions: { length: 12, width: 12, height: 1.5 },
        paths: [
            'C:\\Users\\prasa\\.gemini\\antigravity\\brain\\481a1c8d-40c8-4916-9520-fc22c3bafe97\\premium_pizza_box_1_1774545413060.png',
            'C:\\Users\\prasa\\.gemini\\antigravity\\brain\\481a1c8d-40c8-4916-9520-fc22c3bafe97\\premium_pizza_box_2_1774545431215.png'
        ]
    }
];

async function run() {
    try {
        await mongoose.connect(env.MONGODB_URI, { family: 4, bufferCommands: false });
        console.log("Connected to MongoDB");

        for (const pInfo of pizzaProducts) {
            console.log(`Processing ${pInfo.name}...`);
            const urls = [];
            for (const localPath of pInfo.paths) {
                if (fs.existsSync(localPath)) {
                    console.log(`Uploading ${path.basename(localPath)}...`);
                    const result = await cloudinary.uploader.upload(localPath, {
                        folder: 'boxfox/pizza-boxes',
                        public_id: path.basename(localPath, '.png')
                    });
                    urls.push(result.secure_url);
                }
            }

            const updateData = {
                name: pInfo.name,
                price: pInfo.price,
                regular_price: pInfo.regular_price,
                categories: pInfo.categories,
                short_description: pInfo.short_description,
                dimensions: pInfo.dimensions,
                images: urls,
                stock_status: 'instock'
            };

            const result = await Product.findOneAndUpdate(
                { wpId: pInfo.wpId },
                { $set: updateData },
                { upsert: true, new: true }
            );
            console.log(`Upserted: ${result.name} (wpid: ${result.wpId})`);
        }
    } catch (err) {
        console.error("Execution error:", err);
    } finally {
        process.exit(0);
    }
}
run();
