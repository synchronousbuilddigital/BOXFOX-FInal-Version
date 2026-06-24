import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    wpId: { type: Number, required: true, unique: true },
    type: { type: String, default: 'simple' }, // simple, variable, variation
    sku: { type: String, unique: true, sparse: true },
    patternImg: String,
    patternFormat: String,
    dielineImg: String,
    dielineFormat: String,
    name: { type: String, required: true },
    isFeatured: { type: Boolean, default: false },
    short_description: String,
    description: String,
    regular_price: String,
    sale_price: String,
    price: String,
    minPrice: String,
    maxPrice: String,
    categories: [String],
    tags: [String],
    images: [String],
    stock_status: String,
    stock_quantity: Number,
    parent_id: { type: Number, default: 0 },

    // New Enhanced Fields
    brand: { type: String, default: 'BoxFox' },
    minOrderQuantity: { type: Number, default: 10 },
    badge: String,
    weight: Number,
    dimensions: {
        length: Number,
        width: Number,
        height: Number,
        unit: { type: String, default: 'inch' }
    },
    // Optional explicit tiered prices provided by admin
    priceAt1: { type: Number },
    priceAt10: { type: Number },
    priceAt50: { type: Number },
    priceAt100: { type: Number },
    priceAt500: { type: Number },
    priceAt1000: { type: Number },
    discountAt10: { type: Number },
    discountAt50: { type: Number },
    discountAt100: { type: Number },
    discountAt500: { type: Number },
    discountAt1000: { type: Number },
    triggerValue: { type: Number, default: 500 },
    priceSlabs: [{
        minQty: { type: Number, required: true },
        maxQty: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    attributes: [{
        name: String,
        options: [String]
    }],
    specifications: [{
        key: String,
        value: String
    }],
    meta: {
        features_desc: String,
        lumise_customize: String,
        specifications: String
    },

    pacdoraId: String,

    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
    isApproved: { type: Boolean, default: true },

    isActive: { type: Boolean, default: true },
    pageVisibility: { type: String, enum: ['shop', 'gift', 'both'], default: 'shop' },
    pricingMode: { type: String, enum: ['tiered', 'slabs'], default: 'tiered' },
    colors: [String],
    lastSynced: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Add high-performance indexes
productSchema.index({ name: 1 });
productSchema.index({ categories: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ createdAt: -1 });

// Scalability: Compound Text Index for ultra-fast multi-field search
productSchema.index({
    name: 'text',
    sku: 'text',
    categories: 'text',
    tags: 'text',
    brand: 'text'
}, {
    weights: {
        name: 10,
        sku: 5,
        categories: 3,
        tags: 2,
        brand: 1
    },
    name: "ProductSearchIndex"
});

if (mongoose.models.Product && !mongoose.models.Product.schema.paths.colors) {
    delete mongoose.models.Product;
}

export default mongoose.models.Product || mongoose.model('Product', productSchema);

