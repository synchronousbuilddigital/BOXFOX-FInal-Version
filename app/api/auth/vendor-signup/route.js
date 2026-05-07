import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { rateLimit, getIP } from '@/lib/rateLimit';

const limiter = rateLimit({ interval: 60 * 1000 }); // 60 seconds

export async function POST(req) {
    try {
        try {
            const ip = getIP(req);
            await limiter.check(5, ip);
        } catch {
            return NextResponse.json({ error: 'Too Many Requests.' }, { status: 429 });
        }

        await dbConnect();

        const { name, email, password, phone, businessName, vendorCategory } = await req.json();

        if (!name || !email || !password || !phone || !businessName || !vendorCategory) {
            return NextResponse.json({ error: 'Please provide all required fields' }, { status: 400 });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            businessName,
            role: 'vendor',
            vendorStatus: 'pending',
            vendorCategory
        });

        return NextResponse.json({
            message: 'Application submitted successfully. Waiting for admin approval.',
        }, { status: 201 });

    } catch (error) {
        console.error('Vendor Signup error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
