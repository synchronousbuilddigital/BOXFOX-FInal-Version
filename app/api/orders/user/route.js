import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(req) {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'fallback_secret_for_development_purposes'
        );

        const orders = await Order.find({ userId: decoded.id }).sort({ createdAt: -1 });

        return NextResponse.json({ orders }, { status: 200 });

    } catch (error) {
        console.error('Fetch user orders error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
