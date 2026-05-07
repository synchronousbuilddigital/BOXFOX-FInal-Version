import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Quotation from '@/models/Quotation';
import User from '@/models/User';

function getUserId(req) {
    const token = req.cookies.get('token')?.value;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_development_purposes');
        return decoded?.id || null;
    } catch { return null; }
}

export async function POST(req) {
    try {
        await dbConnect();
        const userId = getUserId(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { quoteId, text } = await req.json();
        if (!text) return NextResponse.json({ error: 'Message text is required' }, { status: 400 });

        const user = await User.findById(userId);
        const quote = await Quotation.findById(quoteId);

        if (!quote) return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });

        // Identify sender role
        let sender = 'user';
        if (user.role === 'admin') sender = 'admin';

        // Add message
        quote.messages.push({
            sender,
            text,
            createdAt: new Date()
        });

        await quote.save();

        return NextResponse.json({ success: true, messages: quote.messages });
    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
