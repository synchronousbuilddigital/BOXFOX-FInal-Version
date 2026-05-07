/**
 * Sample Pricing Formulas Based on Excel Analysis
 * Types: Custom Paper, UV Crystal, Gumming Options, Dangler, Half Cut, etc.
 */

export const SAMPLE_PRICING_FORMULAS = [
    // FOOD PACKAGING - WRAP
    {
        productType: 'wrap',
        productCategory: 'Food',
        baseCost: 50, // ₹50 per unit cost
        basePrice: 85, // ₹85 minimum price
        profitMarginPercent: 40,
        pricingModel: 'area-based',
        areaRate: 0.25, // ₹0.25 per sq inch
        minOrderQuantity: 100,
        b2bMultiplier: 0.85, // 15% discount for B2B
        
        finishingOptions: [
            {
                optionName: 'Custom Paper',
                surchargeAmount: 15,
                surchargePercent: 0,
                applicableFor: ['wrap', 'box']
            },
            {
                optionName: 'UV Crystal',
                surchargeAmount: 25,
                surchargePercent: 0,
                applicableFor: ['wrap', 'box']
            },
            {
                optionName: 'UV Flat',
                surchargeAmount: 20,
                surchargePercent: 0,
                applicableFor: ['wrap', 'box']
            }
        ],
        
        customizationCharges: {
            colorPrinting: 50,
            logoEmbedding: 100,
            designFile: 75,
            customDimensions: 200
        },
        
        bulkDiscounts: [
            { fromQuantity: 100, toQuantity: 500, discountPercent: 5 },
            { fromQuantity: 500, toQuantity: 1000, discountPercent: 10 },
            { fromQuantity: 1000, discountPercent: 15 }
        ],
        
        shippingCostPerUnit: 2,
        taxPercent: 18,
        gsm: 200,
        materialType: 'Kraft Paper'
    },

    // PACKAGING - RIGID BOX
    {
        productType: 'box',
        productCategory: 'Apparel',
        baseCost: 150,
        basePrice: 250,
        profitMarginPercent: 40,
        pricingModel: 'volume-based',
        volumeRate: 0.5, // ₹0.5 per cubic inch
        minOrderQuantity: 50,
        b2bMultiplier: 0.80, // 20% discount for B2B
        
        finishingOptions: [
            {
                optionName: 'Gumming Full',
                surchargeAmount: 35,
                applicableFor: ['box']
            },
            {
                optionName: 'Gumming Top Bottom',
                surchargeAmount: 25,
                applicableFor: ['box']
            },
            {
                optionName: 'Gumming 4 Sides',
                surchargeAmount: 45,
                applicableFor: ['box']
            },
            {
                optionName: 'Half Cut Front',
                surchargeAmount: 40,
                applicableFor: ['box']
            },
            {
                optionName: 'Half Cut Back',
                surchargeAmount: 40,
                applicableFor: ['box']
            }
        ],
        
        customizationCharges: {
            colorPrinting: 100,
            logoEmbedding: 150,
            designFile: 100,
            customDimensions: 300
        },
        
        bulkDiscounts: [
            { fromQuantity: 50, toQuantity: 200, discountPercent: 8 },
            { fromQuantity: 200, toQuantity: 500, discountPercent: 12 },
            { fromQuantity: 500, discountPercent: 18 }
        ],
        
        shippingCostPerUnit: 5,
        taxPercent: 18,
        gsm: 300,
        materialType: 'Corrugated Cardboard'
    },

    // CARRIER BAG
    {
        productType: 'carrier',
        productCategory: 'Retail',
        baseCost: 30,
        basePrice: 60,
        profitMarginPercent: 50,
        pricingModel: 'area-based',
        areaRate: 0.15, // ₹0.15 per sq inch
        minOrderQuantity: 200,
        b2bMultiplier: 0.75, // 25% discount for B2B
        
        finishingOptions: [
            {
                optionName: 'Carry Bag Single Pasting',
                surchargeAmount: 10,
                applicableFor: ['carrier']
            },
            {
                optionName: 'Carry Bag Double Pasting',
                surchargeAmount: 15,
                applicableFor: ['carrier']
            },
            {
                optionName: 'Dangler Making',
                surchargeAmount: 20,
                applicableFor: ['carrier', 'box']
            },
            {
                optionName: 'Dangler With Rivet',
                surchargeAmount: 25,
                applicableFor: ['carrier', 'box']
            }
        ],
        
        customizationCharges: {
            colorPrinting: 40,
            logoEmbedding: 80,
            designFile: 50,
            customDimensions: 150
        },
        
        bulkDiscounts: [
            { fromQuantity: 200, toQuantity: 1000, discountPercent: 10 },
            { fromQuantity: 1000, toQuantity: 2000, discountPercent: 15 },
            { fromQuantity: 2000, discountPercent: 20 }
        ],
        
        shippingCostPerUnit: 1.5,
        taxPercent: 18,
        gsm: 120,
        materialType: 'Kraft Paper with Handles'
    },

    // CUSTOM OFFSET PRINTING
    {
        productType: 'custom',
        productCategory: 'Printing',
        baseCost: 200,
        basePrice: 400,
        profitMarginPercent: 50,
        pricingModel: 'tiered-quantity',
        minOrderQuantity: 1000,
        b2bMultiplier: 0.70, // 30% discount for B2B
        
        quantityTiers: [
            { minQuantity: 1000, maxQuantity: 2500, pricePerUnit: 400 },
            { minQuantity: 2500, maxQuantity: 5000, pricePerUnit: 320 },
            { minQuantity: 5000, maxQuantity: 10000, pricePerUnit: 280 },
            { minQuantity: 10000, pricePerUnit: 250 }
        ],
        
        finishingOptions: [
            {
                optionName: 'Offset Printing',
                surchargeAmount: 0,
                applicableFor: ['custom']
            },
            {
                optionName: 'Varnish',
                surchargeAmount: 100,
                applicableFor: ['custom']
            },
            {
                optionName: 'Packaging',
                surchargeAmount: 50,
                applicableFor: ['custom']
            }
        ],
        
        customizationCharges: {
            colorPrinting: 200,
            logoEmbedding: 300,
            designFile: 200,
            customDimensions: 500
        },
        
        bulkDiscounts: [],
        
        shippingCostPerUnit: 10,
        taxPercent: 18,
        gsm: 250,
        materialType: 'Premium Paper'
    }
];

/**
 * Import sample pricing formulas to database
 * Usage: node scripts/import/pricing-formulas.js
 */
export async function importPricingFormulas() {
    try {
        const mongoose = await import('mongoose');
        const connectDB = (await import('@/lib/mongodb')).default;
        const PricingFormula = (await import('@/models/PricingFormula')).default;

        await connectDB();

        // Clear existing formulas (optional)
        // await PricingFormula.deleteMany({});

        // Insert sample formulas
        const result = await PricingFormula.insertMany(SAMPLE_PRICING_FORMULAS, { ordered: false });

        console.log(`✅ Imported ${result.length} pricing formulas successfully!`);
        return result;

    } catch (error) {
        console.error('❌ Error importing pricing formulas:', error.message);
        throw error;
    }
}
