import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Quotation from '@/models/Quotation';
import { generateInvoicePDF, sendEmail, getUserOrderTemplate } from '@/lib/mail';

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

export async function POST(req) {
    try {
        await dbConnect();
        const admin = await verifyAdmin(req);
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { quoteId } = await req.json();
        if (!quoteId) return NextResponse.json({ error: 'Missing quoteId' }, { status: 400 });

        const quote = await Quotation.findById(quoteId).populate('assignedVendor', 'name email phone vendorCategory vendorStatus');
        if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });

        // Build an order-like payload for the PDF generator
        const totalQty = (quote.items || []).reduce((s, it) => s + (Number(it.quantity) || 0), 0) || 1;
        const perUnit = totalQty > 0 ? (Number(quote.totalAmount || 0) / totalQty) : 0;
        const items = (quote.items || []).map(it => ({ name: it.productName || 'Item', quantity: Number(it.quantity) || 1, price: Number(perUnit.toFixed(2)) }));

        const order = {
            orderId: `Q-${String(quote._id).slice(-8)}`,
            customerName: quote.user?.name || 'Client',
            customerEmail: quote.user?.email || '',
            shippingAddress: quote.user?.company || '',
            items,
            totalAmount: Number(quote.totalAmount || 0),
            discount: 0,
            status: 'Quotation'
        };

        const pdfBuffer = await generateInvoicePDF(order);

        const emailHtml = getUserOrderTemplate(order);
        const sent = await sendEmail({ to: order.customerEmail, subject: 'Your BoxFox Quotation', html: emailHtml, attachments: [{ filename: `Quotation_${quote._id}.pdf`, content: pdfBuffer }] });

        if (!sent.success) {
            return NextResponse.json({ error: 'Failed to send email', details: sent.error }, { status: 500 });
        }

        quote.status = 'pending';
        quote.adminNotes = (quote.adminNotes || '') + `\nFinalized by ${admin.name} and emailed on ${new Date().toISOString()}`;
        await quote.save();

        return NextResponse.json({ success: true, message: 'Quotation finalized and emailed', quote });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to finalize quote' }, { status: 500 });
    }
}
