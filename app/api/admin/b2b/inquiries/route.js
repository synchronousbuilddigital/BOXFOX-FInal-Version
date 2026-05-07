import { NextResponse } from 'next/server';
import dbConnect from "@/lib/mongodb";
import B2BInquiry from "@/models/B2BInquiry";

export async function GET() {
    try {
        await dbConnect();
        const inquiries = await B2BInquiry.find({}).sort({ createdAt: -1 });
        return NextResponse.json(inquiries);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { id, status } = body;

        const inquiry = await B2BInquiry.findByIdAndUpdate(id, { status }, { new: true });
        return NextResponse.json(inquiry);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        await B2BInquiry.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete inquiry" }, { status: 500 });
    }
}
