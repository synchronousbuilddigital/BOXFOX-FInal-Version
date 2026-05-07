import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';

export async function POST(req) {
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

        const { orderId } = await req.json();
        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Check if the order belongs to the user
        if (order.userId.toString() !== decoded.id) {
            return NextResponse.json({ error: 'Unauthorized to cancel this order' }, { status: 403 });
        }

        // Check if the order is within the 6-hour window
        const now = new Date();
        const createdAt = new Date(order.createdAt);
        const hoursDiff = (now - createdAt) / (1000 * 60 * 60);

        if (hoursDiff > 6) {
            return NextResponse.json({ error: 'Orders can only be cancelled within 6 hours of placement' }, { status: 400 });
        }

        // Check if order is already cancelled or in a state that cannot be cancelled
        if (order.status === 'Cancelled') {
            return NextResponse.json({ error: 'Order is already cancelled' }, { status: 400 });
        }
        
        if (order.status !== 'Pending') {
            return NextResponse.json({ error: 'Only pending orders can be cancelled' }, { status: 400 });
        }

        // Update status to Cancelled
        order.status = 'Cancelled';
        await order.save();

        // Restore stock for items
        if (order.items && order.items.length > 0) {
            for (const item of order.items) {
                const isVObjectId = /^[0-9a-fA-F]{24}$/.test(item.productId);
                const isNumeric = item.productId && !isNaN(Number(item.productId));

                if (item.productId && (isVObjectId || isNumeric)) {
                    try {
                        const productQuery = isVObjectId 
                            ? { $or: [{ _id: item.productId }, { wpId: isNumeric ? Number(item.productId) : undefined }] }
                            : { wpId: Number(item.productId) };

                        await Product.findOneAndUpdate(
                            productQuery,
                            { $inc: { stock_quantity: (item.quantity || 1) } }
                        );
                    } catch (err) {
                        console.error(`Failed to restore stock for product ${item.productId}:`, err.message);
                    }
                }
            }
        }

        return NextResponse.json({ success: true, message: 'Order cancelled successfully' }, { status: 200 });

    } catch (error) {
        console.error('Cancel order error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
