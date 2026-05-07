import { NextResponse } from 'next/server';
import dbConnect from "@/lib/mongodb";
import B2BInquiry from "@/models/B2BInquiry";

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();

        // Sanitize quantity: remove commas and convert to string (model expects String now, but handles Number cast if old model persists)
        const sanitizedQuantity = body.quantity ? body.quantity.toString().replace(/,/g, '') : "500";

        const inquiry = await B2BInquiry.create({
            companyName: body.companyName,
            contactEmail: body.contactEmail,
            phoneNumber: body.phoneNumber,
            
            // New Fields
            category: body.category,
            subCategory: body.subCategory,
            spec: body.spec,
            quantity: sanitizedQuantity,
            material: body.material,
            brand: body.brand,
            gsm: body.gsm,
            printColours: body.printColours,
            printingSides: body.printingSides,
            lamination: body.lamination,
            
            // Legacy / Fallback
            boxType: body.boxType || body.spec || "B2B Inquiry",
            timeline: body.timeline || "standard",
            printing: body.printing || body.printColours,
            finish: body.finish || body.lamination,
            sustainability: body.sustainability || "N/A",
            
            requirements: body.requirements
        });

        return NextResponse.json({ success: true, inquiry }, { status: 201 });
    } catch (error) {
        console.error("B2B Inquiry Error:", error);
        return NextResponse.json({ error: "Failed to submit inquiry" }, { status: 500 });
    }
}
