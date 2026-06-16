import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';

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

export async function GET(req) {
    try {
        const vendor = await verifyVendor(req);
        if (!vendor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Get the latest balance from User model
        const walletBalance = vendor.walletBalance || 0;
        const totalEarned = vendor.totalEarned || 0;
        const totalWithdrawn = vendor.totalWithdrawn || 0;

        const transactions = await WalletTransaction.find({ vendorId: vendor._id }).sort({ createdAt: -1 });

        return NextResponse.json({ 
            success: true, 
            wallet: {
                balance: walletBalance,
                totalEarned,
                totalWithdrawn
            },
            transactions 
        });
    } catch (error) {
        console.error('Vendor wallet GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 });
    }
}
