import { NextResponse } from 'next/server';
import dbConnect from "@/lib/mongodb";
import LabConfig from "@/models/LabConfig";

export async function GET() {
    try {
        await dbConnect();
        const configs = await LabConfig.find({});
        
        // Convert array to object for easier consumption
        const configMap = {};
        configs.forEach(c => {
            configMap[c.key] = c.value;
        });
        
        return NextResponse.json(configMap);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch lab configs" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await dbConnect();
        const { key, value } = await req.json();
        
        if (!key || value === undefined) {
            return NextResponse.json({ error: "Key and value are required" }, { status: 400 });
        }
        
        const updated = await LabConfig.findOneAndUpdate(
            { key },
            { value },
            { upsert: true, new: true }
        );
        
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update lab config" }, { status: 500 });
    }
}
