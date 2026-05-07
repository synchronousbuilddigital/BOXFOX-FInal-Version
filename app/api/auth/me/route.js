import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import dns from 'dns';

// Fix for querySrv ECONNREFUSED on some networks/machines
if (typeof window === 'undefined') {
    try {
        dns.setServers(['1.1.1.1', '8.8.8.8', '8.8.4.4']);
        if (dns.setDefaultResultOrder) {
            dns.setDefaultResultOrder('ipv4first');
        }
    } catch (err) {
        // Silently fail
    }
}

export async function GET(req) {
    try {
        await dbConnect();

        // Get token from cookies
        const token = req.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ user: null, authenticated: false }, { status: 200 });
        }

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'fallback_secret_for_development_purposes'
        );

        // Fetch user completely minus password
        let user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Robust Daily Reset Logic
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        if (user.lastAiGenerationDate) {
            const lastGenDate = new Date(user.lastAiGenerationDate);
            const lastGenStart = new Date(lastGenDate.getFullYear(), lastGenDate.getMonth(), lastGenDate.getDate()).getTime();

            if (lastGenStart < todayStart && user.aiGenerationCount > 0) {
                user.aiGenerationCount = 0;
                await user.save();
            }
        }

        return NextResponse.json({ user }, {
            status: 200,
            headers: { 'Cache-Control': 'no-store, max-age=0' }
        });

    } catch (error) {
        console.error('Session error:', error);
        const response = NextResponse.json({ user: null, authenticated: false }, { status: 200 });
        response.cookies.delete('token');
        return response;
    }
}
