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

        const result = {
            id: product.wpId,
            _id: product._id,
            source: 'core',
            allowWishlist: true,
            name: product.name,
            price: (product.minPrice && !isNaN(product.minPrice)) ? Number(product.minPrice) : (product.price && !isNaN(product.price) ? Number(product.price) : 0),
            priceAt1: product.priceAt1 || null,
            priceAt100: product.priceAt100 || null,
            priceAt500: product.priceAt500 || null,
            badge: product.badge,
            regular_price: product.regular_price,
            sale_price: product.sale_price,
            description: product.description,
            short_description: product.short_description,
            images: ((Array.isArray(product.images) && product.images.length > 0) ? product.images : (product.img ? [product.img] : [])).map(getOptimizedImageUrl),
            img: getOptimizedImageUrl((Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : product.img) || "https://boxfox.in/wp-content/uploads/2022/11/Mailer_Box_Mockup_1-copy-scaled.jpg"),
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
