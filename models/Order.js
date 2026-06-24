import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    orderId: { type: String, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customer: {
        name: String,
        email: String,
        phone: String
    },
    shipping: {
        address: String,
        city: String,
        state: String,
        pincode: String
    },
    billingDetails: {
        isB2b: { type: Boolean, default: false },
        companyName: String,
        gstNumber: String
    },
    items: [
        {
            productId: mongoose.Schema.Types.Mixed, // Used for String (Custom IDs) and Numbers (WP IDs)
            name: String,
            quantity: Number,
            price: String,
            variant: String,
            color: String,
            image: String,
            customDesign: mongoose.Schema.Types.Mixed
        }
    ],
    total: Number,
    subtotal: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    paid: { type: Boolean, default: false },
    paymentDetails: {
        transactionId: String,
        senderName: String,
        method: { type: String, default: 'UPI/Manual' },
        submittedAt: Date
    },
    labNotes: { type: String, default: "" },
    deliveryPartner: { type: String, default: "" },
    trackingId: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
