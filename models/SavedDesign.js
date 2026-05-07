import mongoose from 'mongoose';

const SavedDesignSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, default: 'Untitled Design' },
    shareId: { type: String, unique: true, sparse: true }, // Short ID for shareable links
    isPublic: { type: Boolean, default: false }, // Whether the share link works
    customDesign: {
        textures: mongoose.Schema.Types.Mixed,
        colors: mongoose.Schema.Types.Mixed,
        textureSettings: mongoose.Schema.Types.Mixed,
        text: String,
        textStyle: String,
        textColor: String,
        textSettings: mongoose.Schema.Types.Mixed,
        dimensions: mongoose.Schema.Types.Mixed,
        unit: String,
    },
    productId: String,
    thumbnail: String, // Optional: a snapshot URL for gallery card
}, {
    timestamps: true
});

// Generate a short share ID before saving
SavedDesignSchema.pre('save', function () {
    if (!this.shareId) {
        this.shareId = 'BF' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    }
});

export default mongoose.models.SavedDesign || mongoose.model('SavedDesign', SavedDesignSchema);
