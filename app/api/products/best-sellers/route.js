import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import StoreSettings from "@/models/StoreSettings";

export async function GET() {
    try {
        await dbConnect();

        // 1. Get best seller IDs from StoreSettings
        const settings = await StoreSettings.findOne({ key: 'best_sellers' });

        let products = [];
        if (settings && Array.isArray(settings.value) && settings.value.length > 0) {
            // Find products matching these IDs using their _id
            const bestSellerIds = settings.value.map(item => item._id).filter(Boolean);
            const foundProducts = await Product.find({ _id: { $in: bestSellerIds }, isActive: { $ne: false } }).lean();

            // Map and sort them according to the saved order
            products = bestSellerIds
                .map(id => foundProducts.find(p => p._id.toString() === id.toString()))
                .filter(Boolean);
        }

        // If no best sellers or search failed, get fallback
        if (products.length === 0) {
            products = await Product.find({ type: { $in: ["simple", "variable"] }, parent_id: 0, isActive: { $ne: false } }).limit(10).lean();
        }

        // Format similarly to what the frontend expects
        const formattedProducts = products.map((p) => {
            const p1 = p.priceAt1 || null;
            let p10 = p.priceAt10 || null;
            let p50 = p.priceAt50 || null;
            let p100 = p.priceAt100 || null;
            let p500 = p.priceAt500 || null;
            let p1000 = p.priceAt1000 || null;

            const d10 = p.discountAt10 !== undefined && p.discountAt10 !== null ? Number(p.discountAt10) : null;
            const d50 = p.discountAt50 !== undefined && p.discountAt50 !== null ? Number(p.discountAt50) : null;
            const d100 = p.discountAt100 !== undefined && p.discountAt100 !== null ? Number(p.discountAt100) : null;
            const d500 = p.discountAt500 !== undefined && p.discountAt500 !== null ? Number(p.discountAt500) : null;
            const d1000 = p.discountAt1000 !== undefined && p.discountAt1000 !== null ? Number(p.discountAt1000) : null;

            // Auto-correct / legacy fallback logic
            if (p1 > 0 && d10 === null && d50 === null && d100 === null && d500 === null && d1000 === null) {
                if (p10 && p10 > p1 * 1.5) p10 = p10 / 10;
                if (p50 && p50 > p1 * 1.5) p50 = p50 / 50;
                if (p100 && p100 > p1 * 1.5) p100 = p100 / 100;
                if (p500 && p500 > p1 * 1.5) p500 = p500 / 500;
                if (p1000 && p1000 > p1 * 1.5) p1000 = p1000 / 1000;

                if (!p50 || p50 === p1) {
                    p50 = Math.round(p1 * 0.90 * 100) / 100;
                }
                if (!p100 || p100 === p1) {
                    p100 = Math.round(p1 * 0.80 * 100) / 100;
                }
            }

            return {
                _id: p._id,
                id: p.wpId || p._id,
                name: p.name,
                price: (p.minPrice && !isNaN(p.minPrice)) ? Number(p.minPrice) : (p.price && !isNaN(p.price) ? Number(p.price) : 0),
                priceAt1: p1,
                priceAt10: p10,
                priceAt50: p50,
                priceAt100: p100,
                priceAt500: p500,
                priceAt1000: p1000,
                discountAt10: d10,
                discountAt50: d50,
                discountAt100: d100,
                discountAt500: d500,
                discountAt1000: d1000,
                minPrice: p.minPrice,
                maxPrice: p.maxPrice,
                badge: p.badge || (p.isFeatured ? "Featured" : null),
                img: p.images && p.images[0] ? p.images[0] : "/BOXFOX-1.png",
                images: p.images,
                hasVariants: p.type === "variable",
                outOfStock: p.stock_status === "outofstock",
                dimensions: p.dimensions || { length: 8.5, width: 6.5, height: 2, unit: 'inch' },
                pacdoraId: p.pacdoraId,
                minOrderQuantity: p.minOrderQuantity || 10,
                extraDiscountAbove500: !!p.extraDiscountAbove500
            };
        });

        // The TopSellingStrip component expects an array of simple products
        return NextResponse.json(formattedProducts);
    } catch (e) {
        console.error("API Error:", e);
        return NextResponse.json({ error: "Failed to fetch top products", details: e.message }, { status: 500 });
    }
}
