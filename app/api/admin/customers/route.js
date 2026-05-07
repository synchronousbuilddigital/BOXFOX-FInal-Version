import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

import Order from '@/models/Order';

export async function GET() {
    try {
        await dbConnect();
        const users = await User.find({}).sort({ createdAt: -1 }).lean();

        const enhancedUsers = await Promise.all(users.map(async (u) => {
            const orders = await Order.find({ userId: u._id }).lean();
            const totalOrders = orders.length;
            const totalSpent = orders.reduce((acc, order) => acc + (order.total || 0), 0);
            const productsOrdered = orders.reduce((acc, order) => {
                return acc + (order.items?.reduce((iAcc, item) => iAcc + (item.quantity || 1), 0) || 0);
            }, 0);

            return {
                ...u,
                totalOrders,
                totalSpent,
                productsOrdered,
                cartCount: u.cart?.length || 0,
                wishlistCount: u.wishlist?.length || 0
            };
        }));

        return NextResponse.json(enhancedUsers);
    } catch (e) {
        console.error("Customer API Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await User.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
