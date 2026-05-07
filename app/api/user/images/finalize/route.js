import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import UserImage from '@/models/UserImage';

export async function POST(req) {
    try {
        await dbConnect();
        const { imageId } = await req.json();
        const token = req.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_development_purposes');
        const userId = decoded.id;

        const image = await UserImage.findOneAndUpdate(
            { _id: imageId, userId },
            { isTemporary: false },
            { new: true }
        );

        if (!image) {
            return NextResponse.json({ error: 'Image not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ success: true, image });
    } catch (error) {
        console.error('Finalize image error:', error);
        return NextResponse.json({ error: 'Failed to finalize image' }, { status: 500 });
    }
}
