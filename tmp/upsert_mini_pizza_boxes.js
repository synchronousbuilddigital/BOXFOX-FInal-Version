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

const miniPizzaProducts = [
    {
        wpId: 1883000000010,
        name: "Pocket Pizza / Calzone Box - 2.6×1.4×3.9",
        price: "10",
        regular_price: "15",
        categories: ["Pizza Box", "Calzone"],
        short_description: "Unique structural pocket box for calzones and single-serving pizzas.",
        dimensions: { length: 2.6, width: 1.4, height: 3.9 },
        paths: [
            'C:\\Users\\prasa\\.gemini\\antigravity\\brain\\481a1c8d-40c8-4916-9520-fc22c3bafe97\\pocket_calzone_box_1_1774545542882.png',
            'C:\\Users\\prasa\\.gemini\\antigravity\\brain\\481a1c8d-40c8-4916-9520-fc22c3bafe97\\pocket_calzone_box_2_1774545560609.png'
        ]
    },
    {
        wpId: 1883000000009,
        name: "Party Favor Pizza Box (Mini) - 4.5×4.5×1.5",
        price: "12",
        regular_price: "18",
        categories: ["Pizza Box", "Gifts"],
        short_description: "Miniature party favor pizza box for events and gifting. High gloss finish.",
        dimensions: { length: 4.5, width: 4.5, height: 1.5 },
        paths: [
            'C:\\Users\\prasa\\.gemini\\antigravity\\brain\\481a1c8d-40c8-4916-9520-fc22c3bafe97\\party_favor_box_1_1774545577138.png'
        ]
    },
    {
        wpId: 1883000000008,
        name: "Mini Pizza Box (6 inch) - 6×6×1.5",
        price: "15",
        regular_price: "20",
        categories: ["Pizza Box", "Snacks"],
        short_description: "Standard 6-inch mini pizza box for individual snacks.",
        dimensions: { length: 6, width: 6, height: 1.5 },
        paths: []
    },
    {
        wpId: 1883000000007,
        name: "Snack Pizza Box (7 inch) - 6.9×6.9×1.5",
        price: "18",
        regular_price: "22",
        categories: ["Pizza Box", "Snacks"],
        short_description: "7-inch snack pizza box for personal dining.",
        dimensions: { length: 6.9, width: 6.9, height: 1.5 },
        paths: []
    }
];

async function run() {
    try {
        await mongoose.connect(env.MONGODB_URI, { family: 4, bufferCommands: false });
        console.log("Connected to MongoDB");

        for (const pInfo of miniPizzaProducts) {
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
