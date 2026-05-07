import { NextResponse } from 'next/server';
import dbConnect from "@/lib/mongodb";
import LabHierarchy from "@/models/LabHierarchy";
import LabSpecification from "@/models/LabSpecification";

export async function GET() {
    try {
        await dbConnect();
        
        const hierarchies = await LabHierarchy.find({ isActive: true }).sort({ category: 1 });
        const specifications = await LabSpecification.find({ isActive: true }).sort({ category: 1, subCategory: 1 });

        return NextResponse.json({
            hierarchies,
            specifications
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch lab config" }, { status: 500 });
    }
}
