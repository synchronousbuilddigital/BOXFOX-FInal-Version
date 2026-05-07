import { NextResponse } from 'next/server';
import dbConnect from "@/lib/mongodb";
import LabHierarchy from "@/models/LabHierarchy";

export async function GET() {
    try {
        await dbConnect();
        const hierarchies = await LabHierarchy.find({ isActive: true }).sort({ category: 1 });
        return NextResponse.json(hierarchies);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch lab hierarchies" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const hierarchy = await LabHierarchy.create(body);
        return NextResponse.json(hierarchy, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create lab hierarchy" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { _id, ...updateData } = body;
        const hierarchy = await LabHierarchy.findByIdAndUpdate(_id, updateData, { new: true });
        return NextResponse.json(hierarchy);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update lab hierarchy" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        await LabHierarchy.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete lab hierarchy" }, { status: 500 });
    }
}
