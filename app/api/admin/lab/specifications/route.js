import { NextResponse } from 'next/server';
import dbConnect from "@/lib/mongodb";
import LabSpecification from "@/models/LabSpecification";

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const subCategory = searchParams.get('subCategory');

        let query = { isActive: true };
        if (category) query.category = category;
        if (subCategory) query.subCategory = subCategory;

        const specifications = await LabSpecification.find(query).sort({ category: 1, subCategory: 1 });
        return NextResponse.json(specifications);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch lab specifications" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const specification = await LabSpecification.create(body);
        return NextResponse.json(specification, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create lab specification" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { _id, ...updateData } = body;
        const specification = await LabSpecification.findByIdAndUpdate(_id, updateData, { new: true });
        return NextResponse.json(specification);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update lab specification" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        await LabSpecification.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete lab specification" }, { status: 500 });
    }
}
