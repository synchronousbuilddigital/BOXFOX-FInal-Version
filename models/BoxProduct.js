import mongoose from 'mongoose';

const BoxProductSchema = new mongoose.Schema({
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'BoxProductGroup', required: true },
    name: { type: String, required: true },

    // Dimensions
    defaultLength: { type: Number, required: true },
    defaultBreadth: { type: Number, required: true },
    defaultHeight: { type: Number, required: true },
    minDimensions: {
        l: { type: Number }, b: { type: Number }, h: { type: Number }
    },
    maxDimensions: {
        l: { type: Number }, b: { type: Number }, h: { type: Number }
    },

    // Attributes
    defaultMaterial: { type: String, default: 'cardboard' },
    defaultColor: { type: String, default: '#D4B483' },
    defaultTexture: { type: String },

    // Pricing
    priceFormulaType: { type: String, enum: ['area', 'volume', 'fixed'], default: 'area' },
    basePrice: { type: Number, default: 0 },
    multiplier: { type: Number, default: 1 },

    // Flap Config
    flapType: { type: String, enum: ['rsc', 'mailer', 'tuck_top', 'auto_bottom'], default: 'rsc' },
    has3DPreview: { type: Boolean, default: true },
    pacdoraId: { type: String },
}, { timestamps: true });

export default mongoose.models.BoxProduct || mongoose.model('BoxProduct', BoxProductSchema);
