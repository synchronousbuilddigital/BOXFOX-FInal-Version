import dbConnect from '@/lib/mongodb';
import BoxCategory from '@/models/BoxCategory';
import { NextResponse } from 'next/server';

export async function GET() {
    await dbConnect();
    const data = await BoxCategory.find();
    return NextResponse.json({ success: true, data });
}

export async function POST(req) {
    await dbConnect();
    try {
        const body = await req.json();
        const item = await BoxCategory.create(body);
        return NextResponse.json({ success: true, data: item });
    } catch (e) {
        return NextResponse.json({ success: false, error: e.message }, { status: 400 });
    }
}

export async function PUT(req) {
    await dbConnect();
    try {
        const body = await req.json();
        const { _id, ...updates } = body;
        const item = await BoxCategory.findByIdAndUpdate(_id, updates, { new: true });
        return NextResponse.json({ success: true, data: item });
    } catch (e) {
        return NextResponse.json({ success: false, error: e.message }, { status: 400 });
    }
}

export async function DELETE(req) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        await BoxCategory.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ success: false, error: e.message }, { status: 400 });
    }
}
