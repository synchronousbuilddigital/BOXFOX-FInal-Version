import { NextResponse } from 'next/server';
import dbConnect from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

export async function POST(req) {
    try {
        await dbConnect();
        const { code, amount } = await req.json();

        if (!code) {
            return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
        }

        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
            status: 'active'
        });

        if (!coupon) {
            return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
        }

        // Validate dates
        const now = new Date();
        if (coupon.validFrom && now < coupon.validFrom) {
            return NextResponse.json({ error: "Coupon is not yet active" }, { status: 400 });
        }
        if (coupon.validUntil && now > coupon.validUntil) {
            return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
        }

        // Validate usage limit
        if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
            return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
        }

        // Validate minimum order amount
        if (amount < coupon.minOrderAmount) {
            return NextResponse.json({
                error: `Minimum order amount for this coupon is ₹${coupon.minOrderAmount}`
            }, { status: 400 });
        }

        // Calculate discount
        let discount = 0;
        if (coupon.type === 'percentage') {
            discount = (amount * coupon.value) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else {
            discount = coupon.value;
        }

        // Ensure discount doesn't exceed total amount
        discount = Math.min(discount, amount);

        return NextResponse.json({
            success: true,
            code: coupon.code,
            discount: Math.round(discount),
            type: coupon.type,
            value: coupon.value
        });

    } catch (error) {
        console.error("Coupon validation error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
