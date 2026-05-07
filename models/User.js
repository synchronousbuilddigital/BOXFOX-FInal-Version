import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emailOptIn: { type: Boolean, default: true, required: true },
    password: { type: String },
    role: { type: String, enum: ['user', 'admin', 'staff_fulfillment', 'vendor'], default: 'user' },
    vendorStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    vendorCategory: { type: String },
    phone: { type: String },
    businessName: { type: String },
    address: String,
    shippingAddress: {
        street: String,
        apartment: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: 'India' }
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    lastLogin: { type: Date, default: Date.now },
    aiGenerationCount: { type: Number, default: 0 },
    lastAiGenerationDate: { type: Date },
    aiUnlimitedUntil: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    aiPatterns: [{
        url: String,
        prompt: String,
        createdAt: { type: Date, default: Date.now }
    }],
    brandVault: {
        logos: [{
            url: String,
            name: String,
            createdAt: { type: Date, default: Date.now }
        }],
        colors: [String], // Saved hex codes
        fonts: [String], // Saved preferred font options
    }
}, {
    timestamps: true,
    strict: false
});

export default mongoose.models.User || mongoose.model('User', UserSchema);