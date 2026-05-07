import dbConnect from '@/lib/mongodb';
import BoxProductGroup from '@/models/BoxProductGroup';
import { NextResponse } from 'next/server';

export async function GET(req) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    let filter = {};
    if (categoryId) filter.categoryId = categoryId;
    const data = await BoxProductGroup.find(filter);
    return NextResponse.json({ success: true, data });
}

export async function POST(req) {
    await dbConnect();
    try {
        const body = await req.json();
        const item = await BoxProductGroup.create(body);
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
        const item = await BoxProductGroup.findByIdAndUpdate(_id, updates, { new: true });
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
        await BoxProductGroup.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ success: false, error: e.message }, { status: 400 });
    }
}
