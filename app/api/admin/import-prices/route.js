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
    const { updates } = await req.json();

    if (!Array.isArray(updates)) {
      return NextResponse.json({ success: false, error: "Invalid updates format" }, { status: 400 });
    }

    let updatedCount = 0;
    const errors = [];

    for (const item of updates) {
      try {
        const sku = item['Product SKU'];
        const name = item['Product Name'];
        
        const price1 = parseFloat(item['Price @ 1']);
        const price50 = parseFloat(item['Price @ 50']);
        const price100 = parseFloat(item['Price @ 100']);

        if (!sku && !name) {
          errors.push(`Row missing both SKU and Name`);
          continue;
        }

        // Build update object - STRICTLY PRICING ONLY
        const updateData = {};
        if (!isNaN(price1)) {
          updateData.priceAt1 = price1;
          updateData.minPrice = price1; // Sync display price
          updateData.price = String(price1); // Legacy display field
        }
        if (!isNaN(price50)) updateData.priceAt50 = price50;
        if (!isNaN(price100)) updateData.priceAt100 = price100;

        // Skip if no pricing data
        if (Object.keys(updateData).length === 0) continue;

        // Try matching by SKU first, then Name
        let query = sku ? { sku: sku } : { name: name };
        
        const result = await Product.findOneAndUpdate(query, { $set: updateData });
        
        if (result) {
          updatedCount++;
        } else {
          errors.push(`Could not find product: ${sku || name}`);
        }
      } catch (err) {
        errors.push(`Error processing row: ${err.message}`);
      }
    }

    if (updatedCount > 0) {
      await invalidateProductCache();
    }

    return NextResponse.json({ 
      success: true, 
      updatedCount, 
      errors: errors.length > 0 ? errors : undefined 
    });

  } catch (e) {
    console.error("Import API Error:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
