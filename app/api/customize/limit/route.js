import { NextResponse } from 'next/server';
import dbConnect from "@/lib/mongodb";
import ImageGeneration from "@/models/ImageGeneration";

const GUEST_DAILY_LIMIT = 5;

async function getGuestUsage(req) {
    await dbConnect();

    const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';
    const today = new Date().toISOString().split('T')[0];
    const record = await ImageGeneration.findOne({ ip, date: today });

    return {
        ip,
        today,
        count: record?.count || 0,
    };
}

export async function GET(req) {
    try {
        const { count } = await getGuestUsage(req);

        return NextResponse.json({
            success: true,
            remaining: Math.max(0, GUEST_DAILY_LIMIT - count),
            limit: GUEST_DAILY_LIMIT,
        }, {
            headers: { 'Cache-Control': 'no-store' }
        });
    } catch (error) {
        console.error('Rate limit read error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { ip, today, count } = await getGuestUsage(req);

        // Find or create record for today
        let record = await ImageGeneration.findOne({ ip, date: today });

        if (!record) {
            record = new ImageGeneration({ ip, date: today, count: 0 });
        }

        if (count >= GUEST_DAILY_LIMIT) {
            return NextResponse.json({
                error: "Daily limit reached",
                message: "You have reached your daily limit of 5 AI design generations. Please try again tomorrow."
            }, { status: 429 });
        }

        // Increment count
        record.count += 1;
        await record.save();

        return NextResponse.json({
            success: true,
            remaining: Math.max(0, GUEST_DAILY_LIMIT - record.count),
            limit: GUEST_DAILY_LIMIT
        });
    } catch (error) {
        console.error("Rate limit check error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
