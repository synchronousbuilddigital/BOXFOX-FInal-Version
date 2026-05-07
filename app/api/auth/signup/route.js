import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import OTP from '@/models/OTP';
import { rateLimit, getIP } from '@/lib/rateLimit';

const limiter = rateLimit({ interval: 60 * 1000 }); // 60 seconds

export async function POST(req) {
    try {
        try {
            const ip = getIP(req);
            await limiter.check(5, ip); // 5 requests per minute
        } catch {
            return NextResponse.json({ error: 'Too Many Requests. Please try again in a minute.' }, { status: 429 });
        }

        await dbConnect();

        const { name, email, password, phone, businessName, emailOptIn, otp } = await req.json();

        if (!name || !email || !password || !phone || emailOptIn === undefined || !otp) {
            return NextResponse.json({ error: 'Please provide all required fields including OTP and email consent' }, { status: 400 });
        }

        if (!emailOptIn) {
            return NextResponse.json({ error: 'Please accept email notifications to continue' }, { status: 400 });
        }

        // Verify OTP
        const otpRecord = await OTP.findOne({ email, otp });
        if (!otpRecord) {
            return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
        }

        // OTP is valid, proceed and delete it
        await OTP.deleteOne({ _id: otpRecord._id });

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
            emailOptIn
        });

        // Generate token for automatic login
        const token = jwt.sign(
            { id: user._id, role: user.role || 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Don't send password back in response
        const { password: _, ...userWithoutPassword } = user._doc;

        const response = NextResponse.json({
            message: 'User created successfully',
            user: userWithoutPassword
        }, { status: 201 });

        // Set the token in a cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 // 30 days
        });

        return response;

    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
