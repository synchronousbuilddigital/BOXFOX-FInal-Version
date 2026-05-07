import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_purposes';

async function getAuthenticatedUser(req) {
    const token = req.cookies.get('token')?.value;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        await dbConnect();
        return await User.findById(decoded.id);
    } catch (e) {
        return null;
    }
}

export async function GET(req) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        return NextResponse.json({ brandVault: user.brandVault || { logos: [], colors: [], fonts: [] } });
    } catch (error) {
        console.error('Brand Vault GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { type, value, name } = body;

        if (!user.brandVault) {
            user.brandVault = { logos: [], colors: [], fonts: [] };
        }

        if (type === 'logo') {
            user.brandVault.logos.unshift({ url: value, name: name || 'Untitled Logo', createdAt: new Date() });
            // Keep only top 10 logos
            user.brandVault.logos = user.brandVault.logos.slice(0, 10);
        } else if (type === 'color') {
            if (!user.brandVault.colors.includes(value)) {
                user.brandVault.colors.unshift(value);
                user.brandVault.colors = user.brandVault.colors.slice(0, 12);
            }
        } else if (type === 'font') {
            if (!user.brandVault.fonts.includes(value)) {
                user.brandVault.fonts.unshift(value);
                user.brandVault.fonts = user.brandVault.fonts.slice(0, 5);
            }
        }

        await user.save();
        return NextResponse.json({ success: true, brandVault: user.brandVault });
    } catch (error) {
        console.error('Brand Vault POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const value = searchParams.get('value');

        if (!user.brandVault) return NextResponse.json({ success: true });

        if (type === 'logo') {
            user.brandVault.logos = user.brandVault.logos.filter(l => l.url !== value);
        } else if (type === 'color') {
            user.brandVault.colors = user.brandVault.colors.filter(c => c !== value);
        } else if (type === 'font') {
            user.brandVault.fonts = user.brandVault.fonts.filter(f => f !== value);
        }

        await user.save();
        return NextResponse.json({ success: true, brandVault: user.brandVault });
    } catch (error) {
        console.error('Brand Vault DELETE Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
