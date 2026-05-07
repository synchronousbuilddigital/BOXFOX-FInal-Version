import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
    try {
        await dbConnect();
        const { currentPassword, newPassword } = await req.json();

        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "fallback_secret_for_development_purposes"
        );

        const user = await User.findById(decoded.id).select("+password");
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return NextResponse.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Change password error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
