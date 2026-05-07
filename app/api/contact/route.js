import { NextResponse } from 'next/server';
import dbConnect from "@/lib/mongodb";
import GeneralInquiry from "@/models/GeneralInquiry";

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { name, email, subject, message } = body;

        if (!name || !email || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const inquiry = await GeneralInquiry.create({
            type: 'contact',
            name,
            email,
            subject,
            message
        });

        return NextResponse.json({ success: true, inquiry }, { status: 201 });
    } catch (error) {
        console.error("Contact submission error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
