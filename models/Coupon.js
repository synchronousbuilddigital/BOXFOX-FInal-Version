import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    value: { type: Number, required: true }, // 10 for 10% or 100 for ₹100
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number }, // Only for percentage type
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date },
    usageCount: { type: Number, default: 0 },
    maxUsage: { type: Number }, // Limit total uses of this coupon
}, {
    timestamps: true
});

export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
