import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req) {
    try {
        await dbConnect();

        // 1. Authenticate and check if admin
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (e) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        if (decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized: Admins only' }, { status: 403 });
        }

        // 2. Get update data
        const { currentPassword, newEmail, newPassword } = await req.json();

        // 3. Find admin user
        const user = await User.findById(decoded.id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 4. Verify current password
        const isMatch = await bcryptjs.compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }

        // 5. Apply updates
        let message = "Security settings updated successfully.";
        
        if (newEmail && newEmail !== user.email) {
            // Check if email already exists
            const existingUser = await User.findOne({ email: newEmail });
            if (existingUser) {
                return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
            }
            user.email = newEmail;
        }

        if (newPassword) {
            const salt = await bcryptjs.genSalt(10);
            user.password = await bcryptjs.hash(newPassword, salt);
        }

        await user.save();

        return NextResponse.json({ success: true, message });

    } catch (error) {
        console.error('Admin security update error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
