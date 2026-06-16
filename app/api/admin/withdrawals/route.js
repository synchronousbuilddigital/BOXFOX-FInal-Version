import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import WalletTransaction from '@/models/WalletTransaction';
import User from '@/models/User';

async function verifyAdmin(req) {
    const token = req.cookies.get('token')?.value;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_development_purposes');
        if (!decoded || !decoded.id) return null;
        
        await dbConnect();
        const user = await User.findById(decoded.id);
        if (!user || user.role !== 'admin') return null;
        return user;
    } catch {
        return null;
    }
}

export async function GET(req) {
    try {
        const admin = await verifyAdmin(req);
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Fetch all withdrawals with vendor details
        const withdrawals = await WalletTransaction.find({ type: 'withdrawal' })
            .populate('vendorId', 'name email phone businessName vendorBankName vendorBankAccountNo vendorBankBranch vendorIfscCode vendorPan')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, withdrawals });
    } catch (error) {
        console.error('Admin withdrawals GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch withdrawals' }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const admin = await verifyAdmin(req);
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const data = await req.json();
        const { id, action, adminNotes } = data; // action: 'approve' or 'reject'

        if (!id || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
        }

        const transaction = await WalletTransaction.findById(id);
        if (!transaction || transaction.type !== 'withdrawal' || transaction.status !== 'pending') {
            return NextResponse.json({ error: 'Transaction not found or already processed' }, { status: 404 });
        }

        const vendor = await User.findById(transaction.vendorId);
        if (!vendor) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }

        if (action === 'approve') {
            transaction.status = 'completed';
            transaction.adminNotes = adminNotes;
            vendor.totalWithdrawn = (vendor.totalWithdrawn || 0) + transaction.amount;
        } else if (action === 'reject') {
            transaction.status = 'rejected';
            transaction.adminNotes = adminNotes;
            // Refund the wallet
            vendor.walletBalance = (vendor.walletBalance || 0) + transaction.amount;
        }

        await transaction.save();
        await vendor.save();

        return NextResponse.json({ success: true, transaction });
    } catch (error) {
        console.error('Admin withdrawal PATCH error:', error);
        return NextResponse.json({ error: 'Failed to process withdrawal' }, { status: 500 });
    }
}
