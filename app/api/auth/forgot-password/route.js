import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { rateLimit, getIP } from "@/lib/rateLimit";

const limiter = rateLimit({ interval: 60 * 1000 }); // 60 seconds

export async function POST(req) {
    try {
        // Rate limiting
        try {
            const ip = getIP(req);
            await limiter.check(3, ip); // 3 requests per minute for password resets
        } catch {
            return NextResponse.json({ error: 'Too Many Requests. Please try again in a minute.' }, { status: 429 });
        }

        await dbConnect();
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Please provide an email address" }, { status: 400 });
        }

        // Case-insensitive user search
        const user = await User.findOne({ 
            email: { $regex: new RegExp(`^${email.trim()}$`, 'i') } 
        });

        if (!user) {
            // For security, don't reveal if user exists. 
            // But for this project, let's keep it helpful unless requested otherwise.
            return NextResponse.json({ error: "No account found with this email" }, { status: 404 });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpires;
        await user.save();

        // Send email
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: `"BoxFox Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Reset your BoxFox password",
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px; color: #1a1a1a;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #10b981; margin: 0; font-size: 28px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.05em;">BOXFOX.</h1>
                    </div>
                    <h2 style="color: #111827; text-align: left; font-size: 20px; font-weight: 700;">Password Reset Protocol</h2>
                    <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Hi ${user.name || "there"},</p>
                    <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">A request was made to reset your security credentials. Click the button below to define a new password:</p>
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${resetLink}" style="background-color: #111827; color: white; padding: 18px 36px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">Sync New Password</a>
                    </div>
                    <p style="font-size: 13px; line-height: 1.6; color: #9ca3af;">This link is valid for 60 minutes and can only be used once. If you did not request this, please secure your account immediately.</p>
                    <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 30px 0;" />
                    <p style="font-size: 12px; color: #9ca3af; text-align: center;">&copy; 2024 BoxFox Store. All Rights Reserved.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: "Reset link has been dispatched to your inbox" });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ error: "Failed to initialize reset protocol. Check system configuration." }, { status: 500 });
    }
}
