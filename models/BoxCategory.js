import mongoose from 'mongoose';

const BoxCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
}, { timestamps: true });

export default mongoose.models.BoxCategory || mongoose.model('BoxCategory', BoxCategorySchema);
