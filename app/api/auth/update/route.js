import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function PUT(req) {
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

        const { name, phone, businessName, address, shippingAddress } = await req.json();

        // Find user and update
        const updatedUser = await User.findByIdAndUpdate(
            decoded.id,
            {
                $set: {
                    name,
                    phone,
                    businessName,
                    address,
                    shippingAddress
                }
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: updatedUser
        }, { status: 200 });

    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
