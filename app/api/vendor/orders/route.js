import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { sendEmail, getStatusUpdateTemplate } from '@/lib/mail';

function getVendorId(req) {
    const token = req.cookies.get('token')?.value;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_development_purposes');
        return decoded?.id || null;
    } catch { return null; }
}

async function verifyVendor(req) {
    const vendorId = getVendorId(req);
    if (!vendorId) return null;
    const user = await User.findById(vendorId);
    if (!user || user.role !== 'vendor' || user.vendorStatus !== 'approved') return null;
    return user;
}

export async function GET(req) {
    try {
        await dbConnect();
        const vendor = await verifyVendor(req);
        if (!vendor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // 1. Fetch all products belonging to this vendor
        const vendorProducts = await Product.find({ vendorId: vendor._id });
        
        // 2. Collect wpIds (numeric) and MongoDB _ids (ObjectIds/Strings)
        const wpIds = vendorProducts.map(p => p.wpId).filter(Boolean);
        const mongoIds = vendorProducts.map(p => p._id.toString());
        
        // Combine all possible IDs as strings or numbers
        const searchProductIds = [
            ...wpIds,
            ...wpIds.map(id => id.toString()),
            ...mongoIds
        ];

        if (searchProductIds.length === 0) {
            return NextResponse.json({ success: true, orders: [] });
        }

        // 3. Find orders containing these products that are paid or Processing/Shipped/Delivered
        const orders = await Order.find({
            $or: [
                { paid: true },
                { status: { $in: ['Processing', 'Shipped', 'Delivered'] } }
            ],
            'items.productId': { $in: searchProductIds }
        }).sort({ createdAt: -1 });

        // 4. Filter items inside each order so that only items belonging to this vendor are returned
        const filteredOrders = [];
        for (const order of orders) {
            const orderObj = order.toObject();
            
            // Keep only items matching vendor's products
            orderObj.items = orderObj.items.filter(item => {
                if (!item.productId) return false;
                const pIdStr = item.productId.toString();
                return searchProductIds.includes(pIdStr) || searchProductIds.includes(item.productId);
            });

            // If there's at least one item matching, add to results list
            if (orderObj.items.length > 0) {
                filteredOrders.push(orderObj);
            }
        }

        return NextResponse.json({ success: true, orders: filteredOrders });
    } catch (error) {
        console.error('Error fetching vendor orders:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        await dbConnect();
        const vendor = await verifyVendor(req);
        if (!vendor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { orderId, deliveryPartner, trackingId, status } = await req.json();

        if (!orderId || !deliveryPartner || !trackingId) {
            return NextResponse.json({ error: 'Missing required fields: orderId, deliveryPartner, and trackingId are mandatory.' }, { status: 400 });
        }

        // Find the order
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(orderId);
        const query = isValidObjectId ? { $or: [{ orderId: orderId }, { _id: orderId }] } : { orderId: orderId };
        const order = await Order.findOne(query);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Verify that the order has items belonging to this vendor to ensure authorization
        const vendorProducts = await Product.find({ vendorId: vendor._id });
        const wpIds = vendorProducts.map(p => p.wpId).filter(Boolean);
        const mongoIds = vendorProducts.map(p => p._id.toString());
        const searchProductIds = [
            ...wpIds,
            ...wpIds.map(id => id.toString()),
            ...mongoIds
        ];

        const hasVendorItems = order.items.some(item => {
            if (!item.productId) return false;
            const pIdStr = item.productId.toString();
            return searchProductIds.includes(pIdStr) || searchProductIds.includes(item.productId);
        });

        if (!hasVendorItems) {
            return NextResponse.json({ error: 'Unauthorized to dispatch this order' }, { status: 403 });
        }

        // Update tracking info and set status to Shipped or the provided status (e.g. Shipped)
        const newStatus = status || 'Shipped';
        const prevStatus = order.status;

        order.deliveryPartner = deliveryPartner;
        order.trackingId = trackingId;
        order.status = newStatus;

        await order.save();

        // Trigger status update email if status changed
        if (newStatus !== prevStatus && order.customer?.email) {
            try {
                await sendEmail({
                    to: order.customer.email,
                    subject: `Update on Order ${order.orderId}: ${newStatus}`,
                    html: getStatusUpdateTemplate(order)
                });
            } catch (err) {
                console.error('Failed to send tracking status email:', err);
            }
        }

        return NextResponse.json({ success: true, order });
    } catch (error) {
        console.error('Error updating order tracking:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
