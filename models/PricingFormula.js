import mongoose from 'mongoose';

const PricingFormulaSchema = new mongoose.Schema({
    // Product Identification
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'BoxProduct' },
    productType: { type: String, enum: ['box', 'packaging', 'wrap', 'carrier', 'custom'], required: true },
    productCategory: { type: String }, // e.g., "Food", "Apparel", "Electronics"
    
    // Core Pricing Parameters
    baseCost: { type: Number, required: true }, // Cost per unit (material + labor)
    basePrice: { type: Number, required: true }, // Minimum selling price
    profitMarginPercent: { type: Number, default: 40 }, // 40% default margin
    
    // Pricing Strategy Type
    pricingModel: { 
        type: String, 
        enum: ['fixed', 'area-based', 'volume-based', 'weight-based', 'tiered-quantity', 'custom'], 
        required: true 
    },
    
    // Dimension-based Pricing (for area/volume)
    areaRate: { type: Number }, // Price per sq inch/cm
    volumeRate: { type: Number }, // Price per cubic inch/cm
    weightRate: { type: Number }, // Price per gram/kg
    
    // Quantity Tiered Pricing
    quantityTiers: [{
        minQuantity: { type: Number, required: true },
        maxQuantity: { type: Number },
        pricePerUnit: { type: Number, required: true },
        discountPercent: { type: Number, default: 0 }
    }],
    
    // Finishing Options & Surcharges
    finishingOptions: [{
        optionName: { type: String }, // e.g., "UV Crystal", "Gumming Full", "Custom Paper"
        surchargeAmount: { type: Number, default: 0 },
        surchargePercent: { type: Number, default: 0 },
        applicableFor: [String] // Product types this applies to
    }],
    
    // Customization Surcharges
    customizationCharges: {
        colorPrinting: { type: Number, default: 0 }, // Additional cost for color
        logoEmbedding: { type: Number, default: 0 },
        designFile: { type: Number, default: 0 },
        customDimensions: { type: Number, default: 0 }
    },
    
    // Bulk & B2B Discounts
    bulkDiscounts: [{
        fromQuantity: { type: Number, required: true },
        toQuantity: { type: Number },
        discountPercent: { type: Number, required: true }
    }],
    
    // B2B Specific Pricing
    b2bMultiplier: { type: Number, default: 0.85 }, // 15% discount for B2B (0.85x)
    minOrderQuantity: { type: Number, default: 100 },
    
    // Shipping & Taxes
    shippingCostPerUnit: { type: Number, default: 0 },
    taxPercent: { type: Number, default: 18 }, // GST in India
    
    // GSM/Material Specifications
    gsm: { type: Number }, // Grams per square meter
    materialType: { type: String }, // "Cardboard", "Kraft", "Corrugated", etc
    
    // Status & Validity
    isActive: { type: Boolean, default: true },
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date },
    
    // Notes
    notes: String,
    
}, { timestamps: true });

// Index for quick lookups
PricingFormulaSchema.index({ productId: 1, isActive: 1 });
PricingFormulaSchema.index({ productType: 1, productCategory: 1 });

export default mongoose.models.PricingFormula || mongoose.model('PricingFormula', PricingFormulaSchema);
