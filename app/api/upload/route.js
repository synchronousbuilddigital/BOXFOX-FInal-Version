import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import UserImage from '@/models/UserImage';
import { cleanupTemporaryImages } from '@/lib/image-finalizer';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const normalizeImageType = (rawType, fileFormat) => {
    const normalizedType = String(rawType || 'other').toLowerCase();
    return {
        product: 'other',
        dieline: 'document',
    }[normalizedType] || (fileFormat === 'pdf' ? 'document' : normalizedType);
};

export const POST = async (req) => {
    try {
        await dbConnect();
        
        let image, name, type;
        const contentType = req.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            const body = await req.json();
            image = body.image;
            name = body.name;
            type = body.type || 'other';
        } else {
            const formData = await req.formData();
            const file = formData.get('image');
            name = formData.get('name');
            type = formData.get('type') || 'other';

            if (file && typeof file !== 'string') {
                const buffer = await file.arrayBuffer();
                const base64Image = Buffer.from(buffer).toString('base64');
                image = `data:${file.type};base64,${base64Image}`;
            } else {
                image = file;
            }
        }

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        const token = req.cookies.get('token')?.value;
        let userId = null;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_development_purposes');
                userId = decoded.id;
            } catch (err) {
                console.error('Token verification failed:', err);
            }
        }

        // Determine if it is a standard image (not a PDF or other document) to convert to WebP
        let isImage = false;
        if (typeof image === 'string') {
            if (image.startsWith('data:')) {
                isImage = image.startsWith('data:image/');
            } else {
                isImage = !image.toLowerCase().endsWith('.pdf');
            }
        }

        const uploadOptions = {
            folder: 'boxfox_customizations',
            resource_type: 'auto',
        };

        if (isImage) {
            uploadOptions.format = 'webp';
            uploadOptions.transformation = [{ flags: 'force_strip' }];
        }

        const result = await cloudinary.uploader.upload(image, uploadOptions);

        const fileFormat = result.format || (result.url.endsWith('.pdf') ? 'pdf' : 'unknown');
        const finalType = normalizeImageType(type, fileFormat);

        if (userId) {
            await UserImage.create({
                userId,
                url: result.secure_url,
                publicId: result.public_id,
                name: name || `Uploaded ${fileFormat.toUpperCase()}`,
                format: fileFormat,
                isTemporary: !['product', 'pattern', 'document'].includes(type),
                type: finalType
            });
        }

        // cleanupTemporaryImages().catch(err => console.error('Cleanup Error:', err));

        return NextResponse.json({ 
            url: result.secure_url, 
            publicId: result.public_id,
            format: fileFormat,
            isTemporary: !['product', 'pattern', 'document'].includes(type)
        });
    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Upload failed', details: error.message }, { status: 500 });
    }
};

export const DELETE = async (req) => {
    try {
        await dbConnect();
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
        }

        const imageRecord = await UserImage.findOne({ url });
        let publicId = imageRecord?.publicId;

        if (!publicId && url && url.includes('cloudinary.com')) {
            const parts = url.split('/');
            const filenameWithExt = parts[parts.length - 1];
            const filename = filenameWithExt.split('.')[0];
            if (url.includes('boxfox_customizations')) {
                publicId = `boxfox_customizations/${filename}`;
            } else if (url.includes('boxfox/products')) {
                publicId = `boxfox/products/${filename}`;
            } else {
                publicId = filename;
            }
        }

        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
            if (imageRecord) await UserImage.deleteOne({ _id: imageRecord._id });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    } catch (error) {
        console.error('Delete Error:', error);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
};
