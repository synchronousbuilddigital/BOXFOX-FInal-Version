import mongoose from 'mongoose';

const LabHierarchySchema = new mongoose.Schema({
    category: { type: String, required: true, unique: true },
    subCategories: [{ type: String }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.LabHierarchy || mongoose.model('LabHierarchy', LabHierarchySchema);
