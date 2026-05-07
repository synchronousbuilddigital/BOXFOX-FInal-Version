import mongoose from 'mongoose';

const QuotationSchema = new mongoose.Schema({
    user: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        whatsapp: { type: String },
        company: { type: String },
    },
    items: [{
        productName: String,
        quantity: Number,
        notes: String,
    }],
    totalAmount: { type: Number, default: 0 },
    vendorAmount: { type: Number, default: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedVendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['requested', 'assigned', 'fulfilled', 'allotted', 'in-progress', 'completed', 'pending', 'cancelled'],
        default: 'requested',
    },
    adminNotes: { type: String },
    messages: [{
        sender: { type: String, enum: ['user', 'admin'] },
        text: String,
        createdAt: { type: Date, default: Date.now }
    }],
}, {
    timestamps: true,
});

export default mongoose.models.Quotation || mongoose.model('Quotation', QuotationSchema);
