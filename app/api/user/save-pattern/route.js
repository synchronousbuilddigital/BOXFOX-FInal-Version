import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req) {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_development_purposes');
        const { url, prompt } = await req.json();

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        user.aiPatterns = user.aiPatterns || [];

        // Check if already exists to avoid duplicates
        const exists = user.aiPatterns.some(p => p.url === url);
        if (!exists) {
            user.aiPatterns.push({
                url,
                prompt: prompt || "AI Generated Design",
                createdAt: new Date()
            });
            await user.save();
        }

        return NextResponse.json({ success: true, aiPatterns: user.aiPatterns });
    } catch (error) {
        console.error("Save pattern error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
