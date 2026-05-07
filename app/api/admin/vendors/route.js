import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

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
    const user = await User.findById(adminId);
    if (!user || user.role !== 'admin') return null;
    return user;
}

export async function GET(req) {
    try {
        await dbConnect();
        if (!await verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const vendors = await User.find({ role: 'vendor' }).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, vendors });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        await dbConnect();
        if (!await verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { vendorId, vendorStatus, vendorCategory } = await req.json();
        const vendor = await User.findById(vendorId);

        if (!vendor || vendor.role !== 'vendor') return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

        if (vendorStatus) vendor.vendorStatus = vendorStatus;
        if (vendorCategory !== undefined) vendor.vendorCategory = vendorCategory;

        await vendor.save();
        return NextResponse.json({ success: true, vendor });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 });
    }
}
