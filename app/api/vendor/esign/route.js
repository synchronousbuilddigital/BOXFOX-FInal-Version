import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const TAC_VERSION = 'v1.0';

function getVendorId(req) {
    const token = req.cookies.get('token')?.value;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_development_purposes');
        return decoded?.id || null;
    } catch { return null; }
}

// GET — check current e-sign status for the logged-in vendor
export async function GET(req) {
    try {
        await dbConnect();
        const vendorId = getVendorId(req);
        if (!vendorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const vendor = await User.findById(vendorId).select(
            'vendorEsignAgreed vendorEsignName vendorEsignDesignation vendorEsignTimestamp vendorEsignIp vendorTacVersion vendorStatus commissionRate commissionSetByAdmin commissionSetAt businessName name'
        );
        if (!vendor || vendor.role === undefined) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

        return NextResponse.json({
            success: true, esign: {
                agreed: vendor.vendorEsignAgreed,
                name: vendor.vendorEsignName,
                designation: vendor.vendorEsignDesignation,
                timestamp: vendor.vendorEsignTimestamp,
                ip: vendor.vendorEsignIp,
                tacVersion: vendor.vendorTacVersion,
                commissionRate: vendor.commissionRate,
                commissionSetByAdmin: vendor.commissionSetByAdmin,
                vendorStatus: vendor.vendorStatus,
                businessName: vendor.businessName,
                vendorName: vendor.name,
            }
        });
    } catch (error) {
        console.error('E-sign GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch e-sign status' }, { status: 500 });
    }
}

// POST — vendor submits their e-signature
export async function POST(req) {
    try {
        await dbConnect();
        const vendorId = getVendorId(req);
        if (!vendorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const vendor = await User.findById(vendorId);
        if (!vendor || vendor.role !== 'vendor') return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

        // Must be approved before they can sign
        if (vendor.vendorStatus !== 'approved') {
            return NextResponse.json({ error: 'Your account must be approved by admin before signing the agreement.' }, { status: 403 });
        }

        const { esignName, esignDesignation, agreed } = await req.json();

        if (!agreed) return NextResponse.json({ error: 'You must agree to the terms and conditions.' }, { status: 400 });
        if (!esignName || esignName.trim().length < 3) return NextResponse.json({ error: 'Please provide your full legal name (minimum 3 characters).' }, { status: 400 });

        // Capture IP from request headers
        const forwarded = req.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0].trim() : (req.headers.get('x-real-ip') || 'Unknown');

        vendor.vendorEsignAgreed = true;
        vendor.vendorEsignName = esignName.trim();
        vendor.vendorEsignDesignation = esignDesignation?.trim() || vendor.vendorDesignation || '';
        vendor.vendorEsignTimestamp = new Date();
        vendor.vendorEsignIp = ip;
        vendor.vendorTacVersion = TAC_VERSION;

        await vendor.save();

        return NextResponse.json({ success: true, message: 'E-signature recorded successfully. Welcome to BoxFox Vendor Network!', timestamp: vendor.vendorEsignTimestamp });
    } catch (error) {
        console.error('E-sign POST error:', error);
        return NextResponse.json({ error: 'Failed to save e-signature' }, { status: 500 });
    }
}
