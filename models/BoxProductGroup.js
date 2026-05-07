import mongoose from 'mongoose';

const BoxProductGroupSchema = new mongoose.Schema({
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'BoxCategory', required: true },
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
}, { timestamps: true });

export default mongoose.models.BoxProductGroup || mongoose.model('BoxProductGroup', BoxProductGroupSchema);
