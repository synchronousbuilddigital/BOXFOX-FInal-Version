import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import UserImage from '@/models/UserImage';

export async function PATCH(req) {
    try {
        await dbConnect();
        const { imageId, newName } = await req.json();
        
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_development_purposes');
        const userId = decoded.id;

        const image = await UserImage.findOneAndUpdate(
            { _id: imageId, userId },
            { name: newName },
            { new: true }
        );

        if (!image) return NextResponse.json({ error: 'Image not found' }, { status: 404 });

        return NextResponse.json({ success: true, image });
    } catch (error) {
        console.error('Rename error:', error);
        return NextResponse.json({ error: 'Failed to rename asset' }, { status: 500 });
    }
}
