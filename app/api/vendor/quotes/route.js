import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Quotation from '@/models/Quotation';

const VENDOR_PROGRESS = ['allotted', 'in-progress', 'completed'];

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

        const quotes = await Quotation.find({ assignedVendor: vendor._id }).sort({ createdAt: -1 });
        
        // Resolve customer shipping addresses and mask contact details to ensure customer-vendor anonymity
        const sanitizedQuotes = await Promise.all(quotes.map(async (q) => {
            const quoteObj = q.toObject();
            
            if (quoteObj.user) {
                quoteObj.user.email = "Confidential (Via BoxFox)";
                quoteObj.user.phone = "Confidential (Via BoxFox)";
                quoteObj.user.whatsapp = "Confidential (Via BoxFox)";
            }
            
            let shippingAddress = null;
            if (quoteObj.userId) {
                const clientUser = await User.findById(quoteObj.userId).select('shippingAddress');
                if (clientUser && clientUser.shippingAddress && clientUser.shippingAddress.street) {
                    shippingAddress = clientUser.shippingAddress;
                }
            }
            
            if (!shippingAddress) {
                shippingAddress = {
                    street: "BoxFox Central Distribution Hub",
                    apartment: "Sector 18",
                    city: "Gurugram",
                    state: "Haryana",
                    zipCode: "122015",
                    country: "India"
                };
            }
            
            quoteObj.shippingAddress = shippingAddress;
            return quoteObj;
        }));

        return NextResponse.json({ success: true, quotes: sanitizedQuotes });
    } catch (error) {
        console.error('Vendor quotes GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        await dbConnect();
        const vendor = await verifyVendor(req);
        if (!vendor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { quoteId, status } = await req.json();
        if (!quoteId || !VENDOR_PROGRESS.includes(status)) {
            return NextResponse.json({ error: 'Invalid status update' }, { status: 400 });
        }

        const quote = await Quotation.findById(quoteId);
        if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
        if (!quote.assignedVendor || String(quote.assignedVendor) !== String(vendor._id)) {
            return NextResponse.json({ error: 'You cannot update this project' }, { status: 403 });
        }

        const allowedNext = {
            allotted: ['in-progress', 'completed'],
            'in-progress': ['completed'],
            completed: []
        };

        const current = quote.status === 'assigned' || quote.status === 'requested' || quote.status === 'pending'
            ? 'allotted'
            : quote.status;

        if (!allowedNext[current]?.includes(status)) {
            return NextResponse.json({ error: 'Invalid workflow transition' }, { status: 400 });
        }

        quote.status = status;
        await quote.save();

        return NextResponse.json({ success: true, quote });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update project status' }, { status: 500 });
    }
}
