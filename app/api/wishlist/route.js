import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';

async function getUserIdFromRequest(req) {
    const token = req.cookies.get('token')?.value;
    if (!token) return null;
    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'fallback_secret_for_development_purposes'
        );
        return decoded.id;
    } catch (err) {
        return null;
    }
}

export async function GET(req) {
    try {
        await dbConnect();
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            // For guest users, return empty wishlist instead of 401 Unauthorized
            return NextResponse.json({ wishlist: [] }, { status: 200 });
        }

        const user = await User.findById(userId).populate({ path: 'wishlist', strictPopulate: false });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ wishlist: user.wishlist }, { status: 200 });
    } catch (error) {
        console.error('Wishlist GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { productId } = await req.json();
        if (!productId) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        let product = null;
        const productIdStr = String(productId);
        if (mongoose.Types.ObjectId.isValid(productIdStr)) {
            product = await Product.findById(productIdStr).select('_id');
        }
        if (!product) {
            const wpIdNum = parseInt(productIdStr);
            if (!isNaN(wpIdNum)) {
                product = await Product.findOne({ wpId: wpIdNum }).select('_id');
            }
        }
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const normalizedProductId = product._id.toString();

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!user.wishlist) user.wishlist = [];
        const index = user.wishlist.findIndex((item) => item?.toString() === normalizedProductId);
        if (index > -1) {
            user.wishlist.splice(index, 1);
            await user.save();
            return NextResponse.json({ message: 'Removed from wishlist', action: 'removed' }, { status: 200 });
        } else {
            user.wishlist.push(product._id);
            await user.save();
            return NextResponse.json({ message: 'Added to wishlist', action: 'added' }, { status: 200 });
        }
    } catch (error) {
        console.error('Wishlist POST error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
