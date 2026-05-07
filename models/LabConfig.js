import mongoose from 'mongoose';

const LabConfigSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    description: { type: String },
    lastUpdatedBy: { type: String }
}, { timestamps: true });

export default mongoose.models.LabConfig || mongoose.model('LabConfig', LabConfigSchema);
