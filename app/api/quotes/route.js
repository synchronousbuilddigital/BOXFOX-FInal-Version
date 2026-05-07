import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Quotation from '@/models/Quotation';

import jwt from 'jsonwebtoken';

function getUserId(req) {
    const token = req.cookies.get('token')?.value;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_development_purposes');
        return decoded?.id || null;
    } catch { return null; }
}

export async function GET(req) {
    try {
        await dbConnect();
        const userId = getUserId(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Fetch user email to filter quotes
        const User = (await import('@/models/User')).default;
        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const escapedEmail = user.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedPhone = (user.phone || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedName = (user.name || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedBusiness = (user.businessName || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const quotes = await Quotation.find({
            $or: [
                { userId: user._id },
                { "user.email": { $regex: new RegExp(`^${escapedEmail}$`, 'i') } }
                ,{ "user.phone": { $regex: new RegExp(`^${escapedPhone}$`, 'i') } }
                ,{ "user.name": { $regex: new RegExp(`^${escapedName}$`, 'i') } }
                ,{ "user.company": { $regex: new RegExp(`^${escapedBusiness}$`, 'i') } }
            ]
        }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, quotes });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { user, items } = body;
        const authenticatedUserId = getUserId(req);

        if (!user || !user.name || !user.email || !user.phone || !items || items.length === 0) {
            return NextResponse.json({ error: 'Incomplete information' }, { status: 400 });
        }

        const quotation = await Quotation.create({
            user,
            items,
            ...(authenticatedUserId ? { userId: authenticatedUserId } : {}),
            status: 'requested'
        });

        return NextResponse.json({ success: true, message: 'Quote requested successfully', quotation }, { status: 201 });
    } catch (error) {
        console.error('Quote request error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
