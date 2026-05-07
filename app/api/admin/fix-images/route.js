import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { default as redis } from '@/lib/redis';

async function invalidateProductCache() {
  try {
    const keys = await redis.keys('products:*');
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`[Redis] Invalidated ${keys.length} product cache keys`);
    }
  } catch (err) {
    console.error("[Redis] Cache invalidation failed:", err);
  }
}

export async function GET(req) {
    try {
        await dbConnect();
        
        console.log('🔍 Starting database image URL cleanup...');

        const products = await Product.find({ 
            $or: [
                { images: { $regex: 'f_auto' } },
                { images: { $regex: 'q_auto' } },
                { img: { $regex: 'f_auto' } },
                { img: { $regex: 'q_auto' } },
                { img: { $exists: false } },
                { img: "" }
            ]
        });

        console.log(`Found ${products.length} products to check.`);

        let fixedCount = 0;
        for (const product of products) {
            let updated = false;
            
            // 1. Clean URLs in gallery
            if (product.images) {
                let currentImages = [];
                if (Array.isArray(product.images)) {
                    currentImages = product.images;
                } else if (typeof product.images === 'string') {
                    currentImages = product.images.split(',').map(s => s.trim()).filter(Boolean);
                }

                const newImages = currentImages.map(url => 
                    url.replace('/f_auto,q_auto/', '/')
                       .replace('/f_auto/', '/')
                       .replace('/q_auto/', '/')
                );

                if (JSON.stringify(newImages) !== JSON.stringify(product.images)) {
                    product.images = newImages;
                    updated = true;
                }

                // 2. Sync Primary Image (img)
                if (newImages.length > 0) {
                    const firstImage = newImages[0];
                    if (!product.img || product.img !== firstImage || product.img.includes('auto')) {
                        product.img = firstImage.replace('/f_auto,q_auto/', '/')
                                               .replace('/f_auto/', '/')
                                               .replace('/q_auto/', '/');
                        updated = true;
                    }
                }
            }

            if (updated) {
                await product.save();
                fixedCount++;
            }
        }

        if (fixedCount > 0) {
            await invalidateProductCache();
        }

        return NextResponse.json({ 
            success: true, 
            message: `Successfully fixed ${fixedCount} products.`,
            found: products.length
        });

    } catch (error) {
        console.error('Fix Images Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
