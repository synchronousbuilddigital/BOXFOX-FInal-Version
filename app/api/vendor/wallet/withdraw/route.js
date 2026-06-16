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

export async function POST(req) {
    try {
        const vendor = await verifyVendor(req);
        if (!vendor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const data = await req.json();
        const amount = parseFloat(data.amount);

        if (isNaN(amount) || amount <= 0) {
            return NextResponse.json({ error: 'Invalid withdrawal amount' }, { status: 400 });
        }

        if (amount < 500) {
            return NextResponse.json({ error: 'Minimum withdrawal amount is ₹500' }, { status: 400 });
        }

        const currentBalance = vendor.walletBalance || 0;
        if (amount > currentBalance) {
            return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
        }

        // Deduct from wallet immediately to prevent double withdrawal
        vendor.walletBalance -= amount;
        await vendor.save();

        const transaction = await WalletTransaction.create({
            vendorId: vendor._id,
            type: 'withdrawal',
            amount: amount,
            status: 'pending',
            description: `Withdrawal Request - Bank Transfer`
        });

        return NextResponse.json({ success: true, transaction, newBalance: vendor.walletBalance });
    } catch (error) {
        console.error('Vendor withdrawal POST error:', error);
        return NextResponse.json({ error: 'Failed to process withdrawal request' }, { status: 500 });
    }
}
