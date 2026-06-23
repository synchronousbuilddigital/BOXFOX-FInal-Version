import mongoose from 'mongoose';

const BoxCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    stats: { type: String, default: 'DURABLE' },
    needsBranding: { type: Boolean, default: false },
    index: { type: String }
}, { timestamps: true });

export default mongoose.models.BoxCategory || mongoose.model('BoxCategory', BoxCategorySchema);
