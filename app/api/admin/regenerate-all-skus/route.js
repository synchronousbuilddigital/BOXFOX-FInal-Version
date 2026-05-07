import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { default as redis } from "@/lib/redis";

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

export async function POST(req) {
  try {
    await dbConnect();
    
    // 1. Fetch all products
    const products = await Product.find({ parent_id: 0 }).sort({ createdAt: 1 });
    
    const CATEGORY_MAP = {
      'CupCake': 'CPC',
      'Brownie': 'BRW',
      'Hamper Box': 'HMP',
      'Macaron': 'MCR',
      'Chocolate Box': 'CHB',
      'Pastry': 'PST',
      'Gifting': 'GFT',
      'Loaf': 'LOA',
      'Platter': 'PLT',
      'Cake Box': 'CKB',
      'Burger Box': 'BGB',
      'Food Box': 'FDB',
      'Pizza Box': 'PZA',
      'Wok Box': 'WOK',
      'Wrap Box': 'WRP',
      'Popcorn': 'PCN',
      'Carry Bag': 'CBG',
      'Packaging': 'PKG',
      'Custom': 'CST'
    };

    const counters = {};
    let updatedCount = 0;

    // 2. Clear current SKUs to avoid unique collision during re-assignment
    // We update them to a temporary unique string based on ID
    const allProds = await Product.find({});
    for (const p of allProds) {
        await Product.findByIdAndUpdate(p._id, { $set: { sku: `TEMP_${p._id}` } });
    }

    // 3. Assign new sequential SKUs
    for (const product of products) {
      const category = (product.categories && product.categories.length > 0) 
        ? product.categories[0] 
        : (product.category || 'Packaging');
      
      const catCode = CATEGORY_MAP[category] || (category || "GEN").substring(0, 3).toUpperCase();
      
      if (!counters[catCode]) counters[catCode] = 1;
      
      const newSku = `BFX-${catCode}-${String(counters[catCode]).padStart(3, '0')}`;
      counters[catCode]++;

      await Product.findByIdAndUpdate(product._id, { $set: { sku: newSku } });
      updatedCount++;
    }

    await invalidateProductCache();

    return NextResponse.json({ 
      success: true, 
      message: `Successfully regenerated ${updatedCount} SKUs across ${Object.keys(counters).length} categories.`,
      updatedCount 
    });

  } catch (e) {
    console.error("Regenerate All SKUs Error:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
