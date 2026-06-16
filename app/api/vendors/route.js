import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req) {
    try {
        await dbConnect();
        
        // Find approved vendors and select only public fields
        const vendors = await User.find({ 
            role: 'vendor', 
            vendorStatus: 'approved' 
        })
        .select('name businessName vendorCategory vendorCity vendorState vendorYearsInBusiness vendorContactOwnerName vendorDesignation createdAt')
        .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, vendors });
    } catch (error) {
        console.error('Public vendors fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
    }
}
