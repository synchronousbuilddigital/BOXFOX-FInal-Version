import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import StoreSettings from "@/models/StoreSettings";

export async function GET() {
    try {
        await dbConnect();
        const settings = await StoreSettings.findOne({ key: 'best_sellers' });
        return NextResponse.json(settings ? settings.value : []);
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await dbConnect();
        const data = await req.json();
        const settings = await StoreSettings.findOneAndUpdate(
            { key: 'best_sellers' },
            { value: data.bestSellers },
            { new: true, upsert: true }
        );
        return NextResponse.json({ success: true, data: settings.value });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
