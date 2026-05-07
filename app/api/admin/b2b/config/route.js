import { NextResponse } from 'next/server';
import dbConnect from "@/lib/mongodb";
import B2BConfig from "@/models/B2BConfig";

export async function GET() {
    try {
        await dbConnect();
        const configs = await B2BConfig.find({}).sort({ category: 1, label: 1 });
        return NextResponse.json(configs);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch configs" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();

        const config = await B2BConfig.create(body);
        return NextResponse.json(config, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create config" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { id, ...updateData } = body;

        const config = await B2BConfig.findByIdAndUpdate(id, updateData, { new: true });
        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        await B2BConfig.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete config" }, { status: 500 });
    }
}
