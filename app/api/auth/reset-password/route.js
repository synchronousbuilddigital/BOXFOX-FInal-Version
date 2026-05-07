import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { rateLimit, getIP } from "@/lib/rateLimit";

const limiter = rateLimit({ interval: 60 * 1000 }); // 60 seconds

export async function POST(req) {
    try {
        // Rate limiting
        try {
            const ip = getIP(req);
            await limiter.check(5, ip); // 5 attempts per minute
        } catch {
            return NextResponse.json({ error: 'Too Many Requests. Please try again in a minute.' }, { status: 429 });
        }

        await dbConnect();
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Find user by valid reset token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return NextResponse.json({ error: "Your reset link has expired or is invalid" }, { status: 400 });
        }

        // Hash new password (using 10 salt rounds to be consistent)
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return NextResponse.json({ message: "Security credentials updated successfully" });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ error: "Failed to finalize reset protocol" }, { status: 500 });
    }
}
