import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import SavedDesign from '@/models/SavedDesign';
import User from '@/models/User';
import UserImage from '@/models/UserImage';
import { finalizeImagesInObject } from '@/lib/image-finalizer';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_purposes';

function getUserId(req) {
    const token = req.cookies.get('token')?.value;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded.id;
    } catch { return null; }
}

// GET — Fetch all saved designs for the logged-in user, or a single design by shareId
export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const shareId = searchParams.get('shareId');

        // Public share link — anyone can view if isPublic is true
        if (shareId) {
            const design = await SavedDesign.findOne({ shareId, isPublic: true });
            if (!design) return NextResponse.json({ error: 'Design not found' }, { status: 404 });
            return NextResponse.json(design);
        }

        // User's saved designs — requires auth
        const userId = getUserId(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const designs = await SavedDesign.find({ userId }).sort({ updatedAt: -1 });
        return NextResponse.json({ designs });
    } catch (e) {
        console.error('API Designs GET Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST — Save a new design draft
export async function POST(req) {
    try {
        await dbConnect();
        const userId = getUserId(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const design = await SavedDesign.create({
            userId,
            name: body.name || 'Untitled Design',
            customDesign: body.customDesign,
            productId: body.productId,
            isPublic: body.isPublic || false,
        });

        // Finalize any temporary images used in this design
        if (body.customDesign) {
            await finalizeImagesInObject(body.customDesign);
        }

        return NextResponse.json({ success: true, design });
    } catch (e) {
        console.error('API Designs POST Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// PATCH — Update a saved design
export async function PATCH(req) {
    try {
        await dbConnect();
        const userId = getUserId(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { designId, name, customDesign, isPublic } = await req.json();
        const update = {};
        if (name !== undefined) update.name = name;
        if (customDesign !== undefined) update.customDesign = customDesign;
        if (isPublic !== undefined) update.isPublic = isPublic;

        const design = await SavedDesign.findOneAndUpdate(
            { _id: designId, userId },
            update,
            { new: true }
        );

        if (!design) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        // Finalize any temporary images used in this updated design
        if (customDesign) {
            await finalizeImagesInObject(customDesign);
        }

        return NextResponse.json({ success: true, design });
    } catch (e) {
        console.error('API Designs PATCH Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE — Remove a saved design
export async function DELETE(req) {
    try {
        await dbConnect();
        const userId = getUserId(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const designId = searchParams.get('id');

        const result = await SavedDesign.findOneAndDelete({ _id: designId, userId });
        if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('API Designs DELETE Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
