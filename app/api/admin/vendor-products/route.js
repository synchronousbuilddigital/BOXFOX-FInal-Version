import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import redis from '@/lib/redis';

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

function getAdminId(req) {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_development_purposes');
    return decoded?.id || null;
  } catch { return null; }
}

async function verifyAdmin(req) {
  const adminId = getAdminId(req);
  if (!adminId) return null;
  await dbConnect();
  const user = await User.findById(adminId);
  if (!user || user.role !== 'admin') return null;
  return user;
}

export async function GET(req) {
  try {
    if (!await verifyAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch products that have a vendorId, and populate vendor info
    const products = await Product.find({ vendorId: { $exists: true, $ne: null } })
      .populate('vendorId', 'businessName name email phone')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Admin vendor products fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch vendor products' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    if (!await verifyAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, approvalStatus } = await req.json();

    if (!productId || !approvalStatus) {
      return NextResponse.json({ error: 'Product ID and Approval Status are required' }, { status: 400 });
    }

    if (!['pending', 'approved', 'rejected'].includes(approvalStatus)) {
      return NextResponse.json({ error: 'Invalid approval status value' }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    product.approvalStatus = approvalStatus;
    product.isApproved = (approvalStatus === 'approved');

    await product.save();
    await invalidateProductCache();

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Admin vendor product PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update product approval status' }, { status: 500 });
  }
}
