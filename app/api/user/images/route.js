import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import UserImage from '@/models/UserImage';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req) {
    try {
        await dbConnect();
        const token = req.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_development_purposes');
        const userId = decoded.id;

        const images = await UserImage.find({ userId }).sort({ createdAt: -1 });

        return NextResponse.json({ images });
    } catch (error) {
        console.error('Fetch images error:', error);
        return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const imageId = searchParams.get('id');
        const token = req.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_development_purposes');
        const userId = decoded.id;

        const image = await UserImage.findOne({ _id: imageId, userId });

        if (!image) {
            return NextResponse.json({ error: 'Image not found or unauthorized' }, { status: 404 });
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(image.publicId);

        // Delete from DB
        await UserImage.deleteOne({ _id: imageId });

        return NextResponse.json({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Delete image error:', error);
        return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
    }
}
