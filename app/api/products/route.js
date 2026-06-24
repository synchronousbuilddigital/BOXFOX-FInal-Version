import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { getOrSetCache, default as redis } from "@/lib/redis";
import { finalizeImagesInObject, getOptimizedImageUrl } from "@/lib/image-finalizer";

async function invalidateProductCache() {
  try {
    // We use a simple approach for now: clear all keys starting with 'products:'
    // Upstash Redis supports the 'keys' command
    const keys = await redis.keys('products:*');
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`[Redis] Invalidated ${keys.length} product cache keys`);
    }
  } catch (err) {
    console.error("[Redis] Cache invalidation failed:", err);
  }
}

function formatCurrencyPrice(item) {
  return item.minPrice
    ? (item.maxPrice ? `₹${item.minPrice} - ₹${item.maxPrice}` : `₹${item.minPrice}`)
    : (item.price ? (String(item.price).startsWith('₹') ? item.price : `₹${item.price}`) : "Price on Request");
}

function toStoreProduct(product, source = 'core') {
  const category = (product.categories && product.categories.length > 0)
    ? (product.categories[product.categories.length - 1] || "Packaging")
    : (product.category || "Packaging");

  // Extract numeric price value - be thorough with fallbacks
  let numericPrice = null;

  // Try minPrice first
  if (product.minPrice && !isNaN(product.minPrice)) {
    numericPrice = Number(product.minPrice);
  }
  // Try price field
  else if (product.price && !isNaN(product.price)) {
    numericPrice = Number(product.price);
  }
  // Try priceAt1 as last resort
  else if (product.priceAt1 && !isNaN(product.priceAt1)) {
    numericPrice = Number(product.priceAt1);
  }

  const optimizedImages = (Array.isArray(product.images) ? product.images : []).map(getOptimizedImageUrl);
  const primaryImg = (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : product.img) || "/BOXFOX-1.png";

  const p1 = product.priceAt1 || null;
  let p10 = product.priceAt10 || null;
  let p50 = product.priceAt50 || null;
  let p100 = product.priceAt100 || null;
  let p500 = product.priceAt500 || null;
  let p1000 = product.priceAt1000 || null;

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

  return {
    _id: product._id,
    id: product._id || product.wpId,
    source,
    name: product.name || 'Untitled Product',
    sku: product.sku || '',
    category,
    price: numericPrice || 0, // Always return a number, even if 0
    minPrice: product.minPrice || null,
    maxPrice: product.maxPrice || null,
    priceAt1: p1,
    priceAt10: p10,
    priceAt50: p50,
    priceAt100: p100,
    priceAt500: p500,
    priceAt1000: p1000,
    triggerValue: product.triggerValue !== undefined ? product.triggerValue : 500,
    stock_quantity: product.stock_quantity,
    originalPrice: product.regular_price || null,
    discount: product.sale_price ? "Sale" : null,
    status: product.stock_status || 'instock',
    images: optimizedImages,
    img: getOptimizedImageUrl(primaryImg),
    outOfStock: product.stock_status === "outofstock" || (product.stock_quantity === 0),
    badge: product.badge || (product.isFeatured ? "Featured" : null),
    hasVariants: product.type === "variable",
    description: product.description || '',
    short_description: product.short_description || '',
    brand: product.brand || 'BoxFox',
    minOrderQuantity: product.minOrderQuantity || 10,
    tags: Array.isArray(product.tags) ? product.tags : [],
    colors: Array.isArray(product.colors) ? product.colors : [],
    specifications: Array.isArray(product.specifications) ? product.specifications : [],
    dimensions: product.dimensions || null,
    pacdoraId: product.pacdoraId || null,
    patternImg: product.patternImg || null,
    patternFormat: product.patternFormat || null,
    dielineImg: product.dielineImg || null,
    dielineFormat: product.dielineFormat || null,
    isActive: product.isActive !== false,
    pageVisibility: product.pageVisibility || 'shop',
    allowWishlist: true,
    priceSlabs: product.priceSlabs || [],
    pricingMode: product.pricingMode || (product.priceSlabs && product.priceSlabs.length > 0 ? 'slabs' : 'tiered'),
  };
}



export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get("admin") === "true";
    const searchTerm = searchParams.get("search") || "";
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const targetPage = searchParams.get("targetPage") || null;
    const skip = (page - 1) * limit;

    // Fetch query
    let query = {};

    if (!isAdmin) {
      query = {
        type: { $in: ["simple", "variable"] },
        parent_id: { $eq: 0 }, // Only top level for public
        isActive: { $ne: false },
        isApproved: { $ne: false } // Exclude products explicitly pending/rejected by admin (isApproved = false)
      };

      if (targetPage === 'gift') {
        query.pageVisibility = { $in: ['gift', 'both'] };
      } else if (targetPage === 'shop') {
        query.pageVisibility = { $in: ['shop', 'both', null] };
      }
    }

    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { categories: { $elemMatch: { $regex: searchTerm, $options: 'i' } } },
      ];
    }

    if (category && category !== "All") {
      query.categories = category;
    }

    // Build a unique cache key based on search parameters
    // We only cache public requests (non-admin) to keep the DB load low for users
    const all = searchParams.get("all") === "true";
    const cacheKey = `products:${isAdmin ? 'admin' : 'public'}:${all ? 'all' : 'sections'}:${category || 'all'}:${searchTerm}:${page}:${limit}:${targetPage || 'none'}`;

    const fetchProducts = async () => {
      // High Performance Fetch: Use projections to return only required fields for the UI
      // When all=true, fetch complete product data to ensure all fields are available
      const projection = all
        ? {} // Return ALL fields for complete product data on shop page
        : (isAdmin ? {} : {
          _id: 1, wpId: 1, name: 1, sku: 1, price: 1, minPrice: 1, maxPrice: 1,
          priceAt1: 1, priceAt10: 1, priceAt50: 1, priceAt100: 1, priceAt500: 1, priceAt1000: 1, triggerValue: 1, regular_price: 1, sale_price: 1,
          images: 1, img: 1, type: 1, stock_status: 1, stock_quantity: 1,
          dimensions: 1, pacdoraId: 1, badge: 1, isFeatured: 1, categories: 1, category: 1,
          minOrderQuantity: 1, brand: 1, description: 1, short_description: 1,
          tags: 1, specifications: 1, dielineImg: 1, patternImg: 1, dielineFormat: 1, patternFormat: 1,
          isActive: 1, parent_id: 1, pageVisibility: 1, colors: 1
        });

      let cursor = Product.find(query, projection).sort({ createdAt: -1 });

      const products = await cursor
        .skip(skip)
        .limit(all ? 0 : limit) // No limit when all=true
        .lean();

      const combinedProducts = products.map((product) => {
        // Add safety checks to ensure required fields exist
        if (!product.name) {
          console.warn('Product without name:', product._id);
        }
        return toStoreProduct(product, 'core');
      });

      // Transform into the sections structure or flat list for admin
      if (isAdmin) {
        return combinedProducts;
      }

      // If requesting all products (for shop/listing page), return flat array
      if (all) {
        return combinedProducts;
      }

      // For main site - Grouped by Category (default for homepage sections)
      const sectionsMap = {};

      combinedProducts.forEach((p) => {
        const primaryCat = p.category || ((p.categories && p.categories.length > 0) ? (p.categories[p.categories.length - 1] || "Packaging") : "Packaging");

        if (!sectionsMap[primaryCat]) {
          sectionsMap[primaryCat] = {
            category: primaryCat,
            tabs: ["All Items"],
            items: [],
          };
        }

        sectionsMap[primaryCat].items.push({
          ...p,
        });
      });

      return Object.values(sectionsMap)
        .filter((s) => s.items.length > 0)
        .map((s) => ({
          ...s,
          items: s.items.slice(0, 8), // Default: show 8 per category
        }));
    };

    // Use Redis Cache only for non-admin requests
    if (isAdmin) {
      const data = await fetchProducts();
      return NextResponse.json(data);
    }

    // Use Redis Cache with 30-minute expiry (1800s)
    // We stringify/parse because getOrSetCache handles JSON.stringify
    const data = await getOrSetCache(cacheKey, fetchProducts, 1800);

    return NextResponse.json(data);

  } catch (e) {
    console.error("API Error:", e);
    // Return 200 with error data to avoid console '500' noise, 
    // frontend components check for { error } already.
    return NextResponse.json({
      error: "Database Connectivity Issue",
      details: e.message
    });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();

    // Ensure wpId is a Number. If provided id is a string like "prod-123", strip it or use timestamp.
    let wpId = parseInt(data.id);
    if (isNaN(wpId)) {
      wpId = Date.now(); // Use timestamp as unique numeric ID for manual products
    }

    const processedImages = typeof data.images === 'string'
      ? data.images.split(',').map(s => s.trim()).filter(Boolean)
      : (Array.isArray(data.images) ? data.images : [data.img || "/BOXFOX-1.png"]);

    // SKU Auto-Generation Logic (Ensures Uniqueness)
    const generateSKU = async (category) => {
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

      const catCode = CATEGORY_MAP[category] || (category || "GEN").substring(0, 3).toUpperCase();

      // Find the highest current sequence for this category
      const lastProduct = await Product.findOne({ sku: new RegExp(`^BFX-${catCode}-`) }).sort({ sku: -1 }).lean();

      let nextNum = 1;
      if (lastProduct && lastProduct.sku) {
        const parts = lastProduct.sku.split('-');
        const lastNum = parseInt(parts[parts.length - 1]);
        if (!isNaN(lastNum)) {
          nextNum = lastNum + 1;
        }
      }

      // Format with 3 digits, e.g., 001, 002
      return `BFX-${catCode}-${String(nextNum).padStart(3, '0')}`;
    };

    if (data._id) {
      // UPDATE
      const existingProduct = await Product.findById(data._id);
      const sku = data.generateSku ? await generateSKU(data.category) : (data.sku || existingProduct?.sku || await generateSKU(data.category));

      // Destructure read-only/immutable properties to prevent conflicts in update payload
      const { _id, id, createdAt, updatedAt, __v, ...updateData } = data;

      const updatedProduct = await Product.findByIdAndUpdate(data._id, {
        ...updateData,
        sku,
        price: data.minPrice ? String(data.minPrice) : undefined, // fallback for legacy
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
        badge: data.badge,
        images: processedImages.map(getOptimizedImageUrl),
        img: getOptimizedImageUrl(processedImages[0] || undefined),
        categories: [data.category],
        type: data.hasVariants ? "variable" : "simple",
        dimensions: {
          length: (data.length && !isNaN(parseFloat(data.length))) ? parseFloat(data.length) : 0,
          width: (data.width && !isNaN(parseFloat(data.width))) ? parseFloat(data.width) : 0,
          height: (data.height && !isNaN(parseFloat(data.height))) ? parseFloat(data.height) : 0,
          unit: data.unit || 'inch'
        },
        brand: data.brand,
        minOrderQuantity: parseInt(data.minOrderQuantity) || 10,
        tags: typeof data.tags === 'string' ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : data.tags,
        colors: Array.isArray(data.colors) ? data.colors : [],
        specifications: data.specifications,
        description: data.description,
        short_description: data.short_description,
        pacdoraId: data.pacdoraId,
        isActive: data.isActive !== undefined ? data.isActive : true,
        pageVisibility: data.pageVisibility || 'shop',
        pricingMode: data.pricingMode || (data.priceSlabs && data.priceSlabs.length > 0 ? 'slabs' : 'tiered'),
        priceSlabs: Array.isArray(data.priceSlabs) ? data.priceSlabs : []
      }, { new: true });
      await invalidateProductCache();

      // Finalize images to prevent them from being deleted by cleanup script
      await finalizeImagesInObject(updatedProduct.toObject());

      return NextResponse.json({ success: true, product: updatedProduct });
    }

    const sku = data.sku || await generateSKU(data.category);

    const product = await Product.create({
      ...data,
      sku,
      price: data.minPrice ? String(data.minPrice) : undefined, // fallback for legacy
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,
      badge: data.badge,
      wpId,
      images: processedImages.map(getOptimizedImageUrl),
      img: getOptimizedImageUrl(processedImages[0] || undefined),
      categories: [data.category],
      type: data.hasVariants ? "variable" : "simple",
      dimensions: {
        length: (data.length && !isNaN(parseFloat(data.length))) ? parseFloat(data.length) : 0,
        width: (data.width && !isNaN(parseFloat(data.width))) ? parseFloat(data.width) : 0,
        height: (data.height && !isNaN(parseFloat(data.height))) ? parseFloat(data.height) : 0,
        unit: data.unit || 'inch'
      },
      brand: data.brand || 'BoxFox',
      minOrderQuantity: parseInt(data.minOrderQuantity) || 10,
      tags: typeof data.tags === 'string' ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : data.tags,
      colors: Array.isArray(data.colors) ? data.colors : [],
      specifications: data.specifications,
      description: data.description,
      short_description: data.short_description,
      pacdoraId: data.pacdoraId,
      isActive: data.isActive !== undefined ? data.isActive : true,
      pageVisibility: data.pageVisibility || 'shop',
      pricingMode: data.pricingMode || (data.priceSlabs && data.priceSlabs.length > 0 ? 'slabs' : 'tiered'),
      priceSlabs: Array.isArray(data.priceSlabs) ? data.priceSlabs : []
    });
    await invalidateProductCache();

    // Finalize images to prevent them from being deleted by cleanup script
    await finalizeImagesInObject(product.toObject());

    return NextResponse.json({ success: true, product });
  } catch (e) {
    console.error("POST Error:", e);

    // User-friendly handling for Duplicate SKU errors
    if (e.code === 11000) {
      const field = Object.keys(e.keyPattern || {})[0] || 'SKU';
      const value = Object.values(e.keyValue || {})[0];
      return NextResponse.json(
        { success: false, error: `Duplicate ${field}: "${value}" is already in use.` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 },
    );
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

    // First try deleting by wpId (if string is numeric), then string id, then objectId
    await Product.findOneAndDelete({
      $or: [
        { wpId: isNaN(parseInt(id)) ? 0 : parseInt(id) },
        { _id: id }
      ]
    });
    await invalidateProductCache();

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE Error:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
