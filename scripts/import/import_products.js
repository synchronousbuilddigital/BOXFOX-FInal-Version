import mongoose from "mongoose";
import dns from "dns";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Fix DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);
if (dns.setDefaultResultOrder) dns.setDefaultResultOrder("ipv4first");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MONGODB_URI = "mongodb+srv://boxfox:boxfox@cluster0.7oansfw.mongodb.net/";

// Product Schema - cleaned up, only minPrice (no maxPrice)
const productSchema = new mongoose.Schema({
    wpId: { type: Number, required: true, unique: true },
    type: { type: String, default: "simple" },
    sku: String,
    name: { type: String, required: true },
    isFeatured: { type: Boolean, default: false },
    short_description: String,
    description: String,
    price: String,
    minPrice: String,
    categories: [String],
    tags: [String],
    images: [String],
    stock_status: { type: String, default: "instock" },
    stock_quantity: Number,
    parent_id: { type: Number, default: 0 },
    brand: { type: String, default: "BoxFox" },
    minOrderQuantity: { type: Number, default: 10 },
    badge: String,
    dimensions: {
        length: Number,
        width: Number,
        height: Number,
        unit: { type: String, default: "inch" },
    },
    specifications: [{ key: String, value: String }],
    pacdoraId: String,
    lastSynced: { type: Date, default: Date.now },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

async function importData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("📡 Connected to MongoDB");

        // Load all 3 data files
        const p1 = JSON.parse(readFileSync(join(__dirname, "data/products.json"), "utf-8"));
        const p2 = JSON.parse(readFileSync(join(__dirname, "data/products_part2.json"), "utf-8"));
        const p3 = JSON.parse(readFileSync(join(__dirname, "data/products_part3.json"), "utf-8"));
        const allProducts = [...p1, ...p2, ...p3];

        console.log(`📦 Loaded ${allProducts.length} products from data files`);

        // Remove duplicates by name + price (keep last occurrence)
        const seen = new Map();
        for (const p of allProducts) {
            const key = `${p.name}__${p.price}__${p.l}__${p.w}__${p.h}`;
            seen.set(key, p);
        }
        const uniqueProducts = [...seen.values()];
        console.log(`✅ ${uniqueProducts.length} unique products after dedup (removed ${allProducts.length - uniqueProducts.length} duplicates)`);

        // Clear old products
        console.log("🗑  Removing old products...");
        await Product.deleteMany({});
        console.log("✅ All old products deleted.");

        let count = 0;
        const wpIdBase = 1772000000000;

        for (const p of uniqueProducts) {
            const wpId = wpIdBase + p.id;
            const tagsList = p.tags ? p.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

            const productData = {
                wpId,
                name: p.name,
                description: p.desc,
                short_description: p.short,
                price: p.price,
                minPrice: p.price,
                categories: [p.cat, p.sub],
                tags: tagsList,
                stock_status: "instock",
                images: [],  // Leave empty - will add later
                dimensions: {
                    length: p.l || 0,
                    width: p.w || 0,
                    height: p.h || 0,
                    unit: "inch",
                },
                specifications: [
                    { key: "Category", value: p.cat },
                    { key: "Sub Category", value: p.sub },
                    { key: "Specification", value: p.spec },
                ],
                pacdoraId: "",  // Leave empty - will add later
            };

            await Product.create(productData);
            count++;
            if (count % 25 === 0) console.log(`   Imported ${count}/${uniqueProducts.length}...`);
        }

        console.log(`\n🎉 Successfully imported ${count} products!`);
        console.log("\n📊 Category breakdown:");
        const catCount = {};
        for (const p of uniqueProducts) {
            catCount[p.sub] = (catCount[p.sub] || 0) + 1;
        }
        Object.entries(catCount).sort((a, b) => b[1] - a[1]).forEach(([cat, n]) => {
            console.log(`   ${cat}: ${n} products`);
        });

        process.exit(0);
    } catch (err) {
        console.error("❌ Import Error:", err);
        process.exit(1);
    }
}

importData();
