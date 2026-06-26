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

        const d10 = product.discountAt10 !== undefined && product.discountAt10 !== null ? Number(product.discountAt10) : null;
        const d50 = product.discountAt50 !== undefined && product.discountAt50 !== null ? Number(product.discountAt50) : null;
        const d100 = product.discountAt100 !== undefined && product.discountAt100 !== null ? Number(product.discountAt100) : null;
        const d500 = product.discountAt500 !== undefined && product.discountAt500 !== null ? Number(product.discountAt500) : null;
        const d1000 = product.discountAt1000 !== undefined && product.discountAt1000 !== null ? Number(product.discountAt1000) : null;

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
            discountAt10: d10,
            discountAt50: d50,
            discountAt100: d100,
            discountAt500: d500,
            discountAt1000: d1000,
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
            dielineFormat: product.dielineFormat,
            priceSlabs: product.priceSlabs || [],
            pricingMode: product.pricingMode || (product.priceSlabs && product.priceSlabs.length > 0 ? 'slabs' : 'tiered'),
            extraDiscountAbove500: !!product.extraDiscountAbove500
        };

        return NextResponse.json(result);
    } catch (e) {
        console.error("API Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
