import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import dns from 'dns';
import { rateLimit, getIP } from '@/lib/rateLimit';

const limiter = rateLimit({ interval: 60 * 1000 }); // 60 seconds
// Fix for querySrv ECONNREFUSED on some networks/machines
if (typeof window === 'undefined') {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    if (dns.setDefaultResultOrder) {
        dns.setDefaultResultOrder('ipv4first');
    }
}

export async function POST(req) {
    try {
        try {
            const ip = getIP(req);
            await limiter.check(5, ip); // 5 requests per minute
        } catch {
            return NextResponse.json({ error: 'Too Many Requests. Please try again in a minute.' }, { status: 429 });
        }

        await dbConnect();

        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Please provide both email and password' }, { status: 400 });
        }

        const user = await User.findOne({ 
            email: { $regex: new RegExp(`^${email.trim()}$`, 'i') } 
        });

        if (!user) {
            console.log(`❌ Login failed: User not found with email [${email}]`);
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        if (user.role === 'vendor' && user.vendorStatus === 'pending') {
            return NextResponse.json({ error: 'Your vendor application is pending approval.' }, { status: 403 });
        }
        
        if (user.role === 'vendor' && user.vendorStatus === 'rejected') {
            return NextResponse.json({ error: 'Your vendor application has been rejected.' }, { status: 403 });
        }

        const isMatch = await bcryptjs.compare(password, user.password);

        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        const { password: _, ...userWithoutPassword } = user._doc;

        const response = NextResponse.json({
            message: 'Login successful',
            user: userWithoutPassword
        }, { status: 200 });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 // 30 days
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
