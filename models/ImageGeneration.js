import mongoose from 'mongoose';

const ImageGenerationSchema = new mongoose.Schema({
    ip: { type: String, required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    count: { type: Number, default: 0 }
}, { timestamps: true });

// Index for fast lookup
ImageGenerationSchema.index({ ip: 1, date: 1 }, { unique: true });

export default mongoose.models.ImageGeneration || mongoose.model('ImageGeneration', ImageGenerationSchema);
