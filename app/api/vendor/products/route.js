import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import redis from '@/lib/redis';
import { finalizeImagesInObject, getOptimizedImageUrl } from "@/lib/image-finalizer";

async function invalidateProductCache() {
  try {
    if (redis && typeof redis.keys === 'function') {
      const keys = await redis.keys('products:*');
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`[Redis] Invalidated ${keys.length} product cache keys`);
      }
    }
  } catch (err) {
    console.error("[Redis] Cache invalidation failed:", err);
  }
}

async function verifyVendor(req) {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_development_purposes');
    if (!decoded || !decoded.id) return null;
    
    await dbConnect();
    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'vendor' || user.vendorStatus !== 'approved') return null;
    return user;
  } catch {
    return null;
  }
}

// Generate SKU using the same logic as the main product API
async function generateSKU(category) {
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
  const lastProduct = await Product.findOne({ sku: new RegExp(`^BFX-${catCode}-`) }).sort({ sku: -1 }).lean();

  let nextNum = 1;
  if (lastProduct && lastProduct.sku) {
    const parts = lastProduct.sku.split('-');
    const lastNum = parseInt(parts[parts.length - 1]);
    if (!isNaN(lastNum)) {
      nextNum = lastNum + 1;
    }
  }

  return `BFX-${catCode}-${String(nextNum).padStart(3, '0')}`;
}

export async function GET(req) {
  try {
    const vendor = await verifyVendor(req);
    if (!vendor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const products = await Product.find({ vendorId: vendor._id }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Vendor products fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const vendor = await verifyVendor(req);
    if (!vendor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();

    // Verify specialties restriction
    const specialties = vendor.vendorSpecialties || [];
    if (specialties.length === 0) {
      return NextResponse.json({ error: 'You do not have any specialties assigned by the admin yet.' }, { status: 400 });
    }
    
    if (!specialties.includes(data.category)) {
      return NextResponse.json({ 
        error: `Category restriction: You can only upload products in your assigned specialties: ${specialties.join(', ')}` 
      }, { status: 400 });
    }

    let wpId = parseInt(data.id);
    if (isNaN(wpId)) {
      wpId = Date.now();
    }

    const processedImages = typeof data.images === 'string'
      ? data.images.split(',').map(s => s.trim()).filter(Boolean)
      : (Array.isArray(data.images) ? data.images : [data.img || "/BOXFOX-1.png"]);

    // If updating existing product
    if (data._id) {
      const existingProduct = await Product.findOne({ _id: data._id, vendorId: vendor._id });
      if (!existingProduct) {
        return NextResponse.json({ error: 'Product not found or access denied' }, { status: 404 });
      }

      const sku = data.generateSku ? await generateSKU(data.category) : (data.sku || existingProduct.sku || await generateSKU(data.category));

      const updatedProduct = await Product.findOneAndUpdate(
        { _id: data._id, vendorId: vendor._id },
        {
          ...data,
          sku,
          price: data.minPrice ? String(data.minPrice) : undefined,
          minPrice: data.minPrice,
          maxPrice: data.maxPrice,
          priceAt1: data.priceAt1 !== undefined && data.priceAt1 !== "" ? parseFloat(data.priceAt1) : undefined,
          priceAt10: data.priceAt10 !== undefined && data.priceAt10 !== "" ? parseFloat(data.priceAt10) : undefined,
          priceAt50: data.priceAt50 !== undefined && data.priceAt50 !== "" ? parseFloat(data.priceAt50) : undefined,
          priceAt100: data.priceAt100 !== undefined && data.priceAt100 !== "" ? parseFloat(data.priceAt100) : undefined,
          priceAt500: data.priceAt500 !== undefined && data.priceAt500 !== "" ? parseFloat(data.priceAt500) : undefined,
          priceAt1000: data.priceAt1000 !== undefined && data.priceAt1000 !== "" ? parseFloat(data.priceAt1000) : undefined,
          triggerValue: data.triggerValue !== undefined && data.triggerValue !== "" ? parseInt(data.triggerValue) : 500,
          stock_quantity: data.stock_quantity !== undefined && data.stock_quantity !== "" ? parseInt(data.stock_quantity) : undefined,
          stock_status: (data.stock_quantity !== undefined && data.stock_quantity !== "" && parseInt(data.stock_quantity) <= 0) ? "outofstock" : "instock",
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
          brand: data.brand || 'BoxFox',
          minOrderQuantity: parseInt(data.minOrderQuantity) || 10,
          tags: typeof data.tags === 'string' ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : data.tags,
          specifications: data.specifications,
          description: data.description,
          short_description: data.short_description,
          pacdoraId: data.pacdoraId,
          isActive: data.isActive !== undefined ? data.isActive : true,
          pricingMode: data.pricingMode || (data.priceSlabs && data.priceSlabs.length > 0 ? 'slabs' : 'tiered'),
          priceSlabs: Array.isArray(data.priceSlabs) ? data.priceSlabs : [],
          // Re-evaluate approval when edited
          isApproved: false,
          approvalStatus: 'pending'
        },
        { returnDocument: 'after' }
      );

      await invalidateProductCache();
      await finalizeImagesInObject(updatedProduct.toObject());

      return NextResponse.json({ success: true, product: updatedProduct });
    }

    // Creating new product
    const sku = data.sku || await generateSKU(data.category);

    const product = await Product.create({
      ...data,
      sku,
      vendorId: vendor._id,
      isApproved: false,
      approvalStatus: 'pending',
      price: data.minPrice ? String(data.minPrice) : undefined,
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,
      priceAt1: data.priceAt1 !== undefined && data.priceAt1 !== "" ? parseFloat(data.priceAt1) : undefined,
      priceAt10: data.priceAt10 !== undefined && data.priceAt10 !== "" ? parseFloat(data.priceAt10) : undefined,
      priceAt50: data.priceAt50 !== undefined && data.priceAt50 !== "" ? parseFloat(data.priceAt50) : undefined,
      priceAt100: data.priceAt100 !== undefined && data.priceAt100 !== "" ? parseFloat(data.priceAt100) : undefined,
      priceAt500: data.priceAt500 !== undefined && data.priceAt500 !== "" ? parseFloat(data.priceAt500) : undefined,
      priceAt1000: data.priceAt1000 !== undefined && data.priceAt1000 !== "" ? parseFloat(data.priceAt1000) : undefined,
      triggerValue: data.triggerValue !== undefined && data.triggerValue !== "" ? parseInt(data.triggerValue) : 500,
      stock_quantity: data.stock_quantity !== undefined && data.stock_quantity !== "" ? parseInt(data.stock_quantity) : undefined,
      stock_status: (data.stock_quantity !== undefined && data.stock_quantity !== "" && parseInt(data.stock_quantity) <= 0) ? "outofstock" : "instock",
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
      specifications: data.specifications,
      description: data.description,
      short_description: data.short_description,
      pacdoraId: data.pacdoraId,
      isActive: data.isActive !== undefined ? data.isActive : true,
      pricingMode: data.pricingMode || (data.priceSlabs && data.priceSlabs.length > 0 ? 'slabs' : 'tiered'),
      priceSlabs: Array.isArray(data.priceSlabs) ? data.priceSlabs : []
    });

    await invalidateProductCache();
    await finalizeImagesInObject(product.toObject());

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Vendor product POST error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'SKU';
      const value = Object.values(error.keyValue || {})[0];
      return NextResponse.json(
        { success: false, error: `Duplicate ${field}: "${value}" is already in use.` },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const vendor = await verifyVendor(req);
    if (!vendor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const deletedProduct = await Product.findOneAndDelete({ _id: id, vendorId: vendor._id });
    if (!deletedProduct) {
      return NextResponse.json({ error: 'Product not found or access denied' }, { status: 404 });
    }

    await invalidateProductCache();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vendor product DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
