import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req) {
    try {
        await dbConnect();
        const users = await User.find({}, 'email role').lean();
        return NextResponse.json({
            success: true,
            totalUsers: users.length,
            users
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
