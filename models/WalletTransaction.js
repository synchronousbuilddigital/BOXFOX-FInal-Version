import mongoose from 'mongoose';

const WalletTransactionSchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['credit', 'withdrawal'], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'completed', 'rejected'], default: 'completed' },
    description: { type: String },
    referenceId: { type: String }, // Can be Order ID or a transfer reference
    adminNotes: { type: String }
}, {
    timestamps: true
});

// Indexes for performance
WalletTransactionSchema.index({ vendorId: 1, createdAt: -1 });
WalletTransactionSchema.index({ status: 1 });

export default mongoose.models.WalletTransaction || mongoose.model('WalletTransaction', WalletTransactionSchema);
