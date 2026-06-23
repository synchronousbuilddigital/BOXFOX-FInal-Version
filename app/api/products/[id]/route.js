import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { getOptimizedImageUrl } from '@/lib/image-finalizer';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        console.log(`🔍 Fetching product with ID: ${id}`);
        let product = null;
        // Try to find by wpId (number) if it's a valid integer
        const wpIdNum = parseInt(id);
        if (!isNaN(wpIdNum)) {
            product = await Product.findOne({ wpId: wpIdNum });
            if (product) console.log(`✅ Found product by wpId: ${wpIdNum}`);
        }

        // If not found by wpId, try by MongoDB _id (various methods)
        if (!product) {
            try {
                // Method 1: findById (handles ObjectId conversion)
                if (mongoose.Types.ObjectId.isValid(id)) {
                    product = await Product.findById(id);
                }

                // Method 2: findOne by _id as string (just in case)
                if (!product) {
                    product = await Product.findOne({ _id: id });
                }
            } catch (err) {
                console.warn(`⚠️ DB error during product lookup for ${id}:`, err.message);
            }
            if (product) console.log(`✅ Found product by MongoDB ID: ${id}`);
        }

        const { searchParams } = new URL(req.url);
        const isAdmin = searchParams.get('admin') === 'true';

        if (!product) {
            console.warn(`❌ Product not found for ID: ${id}`);
            return NextResponse.json({ error: "Product not found", reason: "not_in_db", id }, { status: 404 });
        }

        if (product.isActive === false && !isAdmin) {
            console.warn(`❌ Product inactive for ID: ${id}`);
            return NextResponse.json({ error: "Product not found", reason: "inactive", id }, { status: 404 });
        }

        if (product.isApproved === false && !isAdmin) {
            console.warn(`❌ Product not approved for ID: ${id}`);
            return NextResponse.json({ error: "Product is pending approval", reason: "unapproved", id }, { status: 404 });
        }

        const p1 = Number(product.priceAt1) || null;
        let p10 = Number(product.priceAt10) || null;
        let p50 = Number(product.priceAt50) || null;
        let p100 = Number(product.priceAt100) || null;
        let p500 = Number(product.priceAt500) || null;
        let p1000 = Number(product.priceAt1000) || null;

        if (p1 > 0) {
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

        const result = {
            id: product.wpId,
            _id: product._id,
            source: 'core',
            allowWishlist: true,
            name: product.name,
            price: (product.minPrice && !isNaN(product.minPrice)) ? Number(product.minPrice) : (product.price && !isNaN(product.price) ? Number(product.price) : 0),
            priceAt1: p1,
            priceAt10: p10,
            priceAt50: p50,
            priceAt100: p100,
            priceAt500: p500,
            priceAt1000: p1000,
            triggerValue: product.triggerValue !== undefined ? product.triggerValue : 500,
            stock_quantity: product.stock_quantity,
            badge: product.badge,
            regular_price: product.regular_price,
            sale_price: product.sale_price,
            description: product.description,
            short_description: product.short_description,
            images: ((Array.isArray(product.images) && product.images.length > 0) ? product.images : (product.img ? [product.img] : [])).map(getOptimizedImageUrl),
            img: getOptimizedImageUrl((Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : product.img) || "/BOXFOX-1.png"),
            category: (product.categories && product.categories.length > 0) ? (product.categories[product.categories.length - 1] || "Packaging") : "Packaging",
            stock_status: product.stock_status,
            type: product.type,
            weight: product.weight,
            dimensions: product.dimensions,
            attributes: product.attributes,
            brand: product.brand || 'BoxFox',
            minOrderQuantity: product.minOrderQuantity || 10,
            minPrice: product.minPrice,
            maxPrice: product.maxPrice,
            tags: product.tags || [],
            colors: product.colors || [],
            specifications: product.specifications || [],
            meta: product.meta,
            pacdoraId: product.pacdoraId,
            patternImg: product.patternImg,
            patternFormat: product.patternFormat,
            dielineImg: product.dielineImg,
            dielineFormat: product.dielineFormat
        };

        return NextResponse.json(result);
    } catch (e) {
        console.error("API Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
