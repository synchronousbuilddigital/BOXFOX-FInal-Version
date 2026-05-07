import mongoose from 'mongoose';

// Force deletion of the model in development to ensure schema changes are picked up
if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.B2BInquiry;
}

const B2BInquirySchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    contactEmail: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    
    // Product Specs
    category: { type: String },
    subCategory: { type: String },
    spec: { type: String },
    quantity: { type: String }, // Store as string to handle formatted numbers safely
    material: { type: String },
    brand: { type: String },
    gsm: { type: String },
    printColours: { type: String },
    printingSides: { type: String },
    lamination: { type: String },
    
    // Legacy fields (kept for compatibility)
    boxType: { type: String },
    timeline: { type: String },
    printing: { type: String },
    finish: { type: String },
    sustainability: { type: String },
    
    requirements: { type: String },
    status: { type: String, default: 'pending', enum: ['pending', 'reviewed', 'completed'] }
}, { timestamps: true });

export default mongoose.models.B2BInquiry || mongoose.model('B2BInquiry', B2BInquirySchema);
