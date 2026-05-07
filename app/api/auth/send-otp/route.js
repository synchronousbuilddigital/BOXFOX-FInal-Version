import { NextResponse } from 'next/server';
import dbConnect from "@/lib/mongodb";
import OTP from "@/models/OTP";
import User from "@/models/User";
import { sendEmail, getOTPTemplate } from "@/lib/mail";

export async function POST(req) {
    try {
        await dbConnect();
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Optional: Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to DB (upsert for same email)
        await OTP.findOneAndUpdate(
            { email },
            { otp, createdAt: new Date() },
            { upsert: true, returnDocument: 'after' }
        );

        // Send Email
        const res = await sendEmail({
            to: email,
            subject: "Verify your email - BoxFox",
            html: getOTPTemplate(otp)
        });

        if (!res.success) {
            return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        console.error("OTP Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
