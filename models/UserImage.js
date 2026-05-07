import mongoose from 'mongoose';

const UserImageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    name: { type: String },
    format: { type: String }, // e.g., 'jpg', 'png', 'pdf'
    isTemporary: { type: Boolean, default: true },
    type: { type: String, default: 'other', trim: true }
}, {
    timestamps: true
});

export default mongoose.models.UserImage || mongoose.model('UserImage', UserImageSchema);
