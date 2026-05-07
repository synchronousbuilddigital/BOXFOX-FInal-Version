import mongoose from 'mongoose';

const GeneralInquirySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['partnership', 'contact'],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    location: String,
    contactNumber: String,
    subject: String,
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'completed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

export default mongoose.models.GeneralInquiry || mongoose.model('GeneralInquiry', GeneralInquirySchema);
