import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
// Touch to force recompile after integrating 0.png stamp
import { generateInvoicePDF } from '@/lib/mail';

const buildShippingAddress = (shipping = {}) => {
    const parts = [shipping.address, shipping.city, shipping.state].filter(Boolean);
    return parts.join(', ');
};

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
        }

        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
        const query = isValidObjectId ? { $or: [{ orderId: id }, { _id: id }] } : { orderId: id };
        const order = await Order.findOne(query);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const emailCommonData = {
            orderId: order.orderId,
            customerName: order.customer?.name || 'Customer',
            customerEmail: order.customer?.email,
            totalAmount: order.total || 0,
            discount: order.discount || 0,
            shippingAddress: buildShippingAddress(order.shipping),
            billingDetails: order.billingDetails,
            status: order.status,
            items: order.items || [],
            createdAt: order.createdAt
        };

        const pdfBuffer = generateInvoicePDF(emailCommonData);

        return new Response(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Invoice-${order.orderId}.pdf"`
            }
        });
    } catch (e) {
        console.error("Invoice Download API Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
