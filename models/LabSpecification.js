import mongoose from 'mongoose';

const LabSpecificationSchema = new mongoose.Schema({
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    spec: { type: String, required: true },
    l: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true },
    unit: { type: String, enum: ['mm', 'in'], default: 'mm' },
    ups: { type: Number },
    machine: { type: String },
    sheetW: { type: Number },
    sheetH: { type: Number },
    designing: { type: Number },
    pasting: { type: Number },
    dieRate: { type: Number },
    window: { type: Number },
    leafing: { type: Number },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.LabSpecification || mongoose.model('LabSpecification', LabSpecificationSchema);
