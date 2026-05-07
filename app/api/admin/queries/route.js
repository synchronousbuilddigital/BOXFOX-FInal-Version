import { NextResponse } from 'next/server';
import dbConnect from "@/lib/mongodb";
import GeneralInquiry from "@/models/GeneralInquiry";

export async function GET() {
    try {
        await dbConnect();
        const inquiries = await GeneralInquiry.find({}).sort({ createdAt: -1 });
        return NextResponse.json(inquiries);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch queries" }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { id, status } = body;

        const inquiry = await GeneralInquiry.findByIdAndUpdate(id, { status }, { new: true });
        return NextResponse.json(inquiry);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update query" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        await GeneralInquiry.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete query" }, { status: 500 });
    }
}
