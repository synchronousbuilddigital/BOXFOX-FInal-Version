import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

async function verifyAuth(req) {
    const token = req.cookies.get('token')?.value;
    if (!token) {
        console.log('[verifyAuth] No token found in cookies');
        return null;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_development_purposes');
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            console.log('[verifyAuth] User not found for id:', decoded.id);
        }
        return user;
    } catch (err) {
        console.log('[verifyAuth] JWT Error:', err.message);
        return null;
    }
}
export async function GET(req) {
    try {
        await connectDB();
        const user = await verifyAuth(req);
        if (!user) {
            console.log('[GET staff] Unauthorized: No user found from verifyAuth');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (user.role !== 'admin') {
            console.log(`[GET staff] Unauthorized: user.role is ${user.role}, requires admin`);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const staffIds = ['admin', 'staff_fulfillment'];
        const staff = await User.find({ role: { $in: staffIds } })
            .select('-password')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, staff });
    } catch (error) {
        console.error('Fetch Staff Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        await connectDB();
        const user = await verifyAuth(req);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { _id, role } = await req.json();

        if (!['user', 'admin', 'staff_fulfillment'].includes(role)) {
            return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 });
        }

        const targetUser = await User.findById(_id);
        if (!targetUser) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // Prevent admin from removing their own admin role
        if (targetUser._id.toString() === user.id && role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Cannot remove your own admin access' }, { status: 400 });
        }

        targetUser.role = role;
        await targetUser.save();

        return NextResponse.json({ success: true, user: targetUser });
    } catch (error) {
        console.error('Update Staff Role Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// Method to search and add a user as staff or create a new user
export async function POST(req) {
    try {
        await connectDB();
        const user = await verifyAuth(req);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, email, password, role } = await req.json();
        if (!email || !role) {
            return NextResponse.json({ success: false, error: 'Email and role are required' }, { status: 400 });
        }

        if (!['admin', 'staff_fulfillment'].includes(role)) {
            return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 });
        }

        let targetUser = await User.findOne({ email });

        if (targetUser) {
            targetUser.role = role;
            if (name) targetUser.name = name;
            if (password) {
                const salt = await bcryptjs.genSalt(10);
                targetUser.password = await bcryptjs.hash(password, salt);
            }
            await targetUser.save();
            return NextResponse.json({ success: true, staff: targetUser, message: 'Existing user updated successfully.' });
        } else {
            if (!name || !password) {
                return NextResponse.json({ success: false, error: 'Name and Password are required for new users' }, { status: 400 });
            }

            const salt = await bcryptjs.genSalt(10);
            const hashedPassword = await bcryptjs.hash(password, salt);

            targetUser = await User.create({
                name,
                email,
                password: hashedPassword,
                role
            });

            return NextResponse.json({ success: true, staff: targetUser, message: 'New user created and assigned successfully.' });
        }
    } catch (error) {
        console.error('Add Staff Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
