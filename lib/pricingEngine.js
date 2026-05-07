/**
 * Pricing Engine - Calculate prices based on multiple factors
 * Supports: Area-based, Volume-based, Tiered, Custom, B2B pricing
 */

class PricingEngine {
    /**
     * Main price calculation method
     * @param {Object} productData - Product details
     * @param {Object} pricingFormula - Pricing formula from DB
     * @param {Object} options - Customization options
     * @returns {Object} Detailed pricing breakdown
     */
    static calculatePrice(productData, pricingFormula, options = {}) {
        try {
            const {
                quantity = 1,
                customizations = [],
                finishingOptions = [],
                isB2B = false,
                applyCoupon = null
            } = options;

            // Start with base calculation
            let basePrice = this.calculateBasePrice(productData, pricingFormula, quantity);
            
            // Add customization charges
            let customizationCharges = this.calculateCustomizationCharges(customizations, pricingFormula);
            
            // Add finishing options surcharges
            let finishingSurcharges = this.calculateFinishingSurcharges(finishingOptions, pricingFormula);
            
            // Apply quantity discounts
            let discountAmount = this.calculateQuantityDiscount(quantity, basePrice, pricingFormula);
            
            // Apply B2B discount if applicable
            let b2bDiscount = 0;
            if (isB2B && quantity >= pricingFormula.minOrderQuantity) {
                b2bDiscount = (basePrice + customizationCharges + finishingSurcharges - discountAmount) * 
                             (1 - pricingFormula.b2bMultiplier);
            }
            
            // Calculate subtotal
            let subtotal = basePrice + customizationCharges + finishingSurcharges - discountAmount - b2bDiscount;
            
            // Add shipping
            let shippingCost = this.calculateShipping(quantity, productData, pricingFormula);
            
            // Calculate tax
            let taxAmount = (subtotal + shippingCost) * (pricingFormula.taxPercent / 100);
            
            // Apply coupon if available
            let couponDiscount = 0;
            if (applyCoupon) {
                couponDiscount = this.applyCoupon(applyCoupon, subtotal + shippingCost);
            }
            
            // Final total
            let totalPrice = subtotal + shippingCost + taxAmount - couponDiscount;
            let pricePerUnit = totalPrice / quantity;
            
            return {
                breakdown: {
                    basePrice: basePrice.toFixed(2),
                    customizationCharges: customizationCharges.toFixed(2),
                    finishingSurcharges: finishingSurcharges.toFixed(2),
                    quantityDiscount: (-discountAmount).toFixed(2),
                    b2bDiscount: (-b2bDiscount).toFixed(2),
                    subtotal: subtotal.toFixed(2),
                    shippingCost: shippingCost.toFixed(2),
                    taxAmount: taxAmount.toFixed(2),
                    couponDiscount: (-couponDiscount).toFixed(2)
                },
                summary: {
                    unitPrice: pricePerUnit.toFixed(2),
                    totalPrice: totalPrice.toFixed(2),
                    quantity: quantity,
                    originalPrice: (basePrice + customizationCharges + finishingSurcharges).toFixed(2),
                    totalDiscount: (discountAmount + b2bDiscount + couponDiscount).toFixed(2),
                    savingsPercent: (((discountAmount + b2bDiscount + couponDiscount) / (basePrice + customizationCharges + finishingSurcharges)) * 100).toFixed(2)
                }
            };
        } catch (error) {
            throw new Error(`Pricing calculation failed: ${error.message}`);
        }
    }

    /**
     * Calculate base price based on pricing model
     */
    static calculateBasePrice(productData, formula, quantity) {
        const { length = 0, breadth = 0, height = 0, weight = 0 } = productData;
        let price = 0;

        switch (formula.pricingModel) {
            case 'fixed':
                price = formula.basePrice * quantity;
                break;

            case 'area-based':
                // Surface area = 2(LB + BH + HL)
                const area = 2 * (length * breadth + breadth * height + height * length);
                price = formula.areaRate * area * quantity;
                break;

            case 'volume-based':
                // Volume = L × B × H
                const volume = length * breadth * height;
                price = formula.volumeRate * volume * quantity;
                break;

            case 'weight-based':
                price = formula.weightRate * weight * quantity;
                break;

            case 'tiered-quantity':
                // Find applicable tier
                const tier = formula.quantityTiers.find(t => 
                    quantity >= t.minQuantity && (!t.maxQuantity || quantity <= t.maxQuantity)
                );
                price = (tier ? tier.pricePerUnit : formula.basePrice) * quantity;
                break;

            default:
                price = formula.basePrice * quantity;
        }

        return Math.max(price, formula.basePrice * quantity);
    }

    /**
     * Calculate customization charges
     */
    static calculateCustomizationCharges(customizations, formula) {
        let charges = 0;
        
        if (customizations.includes('colorPrinting')) {
            charges += formula.customizationCharges.colorPrinting;
        }
        if (customizations.includes('logoEmbedding')) {
            charges += formula.customizationCharges.logoEmbedding;
        }
        if (customizations.includes('designFile')) {
            charges += formula.customizationCharges.designFile;
        }
        if (customizations.includes('customDimensions')) {
            charges += formula.customizationCharges.customDimensions;
        }

        return charges;
    }

    /**
     * Calculate finishing option surcharges
     */
    static calculateFinishingSurcharges(finishingOptions, formula) {
        let surcharges = 0;

        if (!finishingOptions || finishingOptions.length === 0) return 0;

        finishingOptions.forEach(optionName => {
            const option = formula.finishingOptions.find(f => f.optionName === optionName);
            if (option) {
                surcharges += option.surchargeAmount || 0;
            }
        });

        return surcharges;
    }

    /**
     * Calculate quantity-based discounts
     */
    static calculateQuantityDiscount(quantity, basePrice, formula) {
        if (!formula.bulkDiscounts || formula.bulkDiscounts.length === 0) return 0;

        const applicable = formula.bulkDiscounts.find(d => 
            quantity >= d.fromQuantity && (!d.toQuantity || quantity <= d.toQuantity)
        );

        if (applicable) {
            return basePrice * (applicable.discountPercent / 100);
        }

        return 0;
    }

    /**
     * Calculate shipping cost
     */
    static calculateShipping(quantity, productData, formula) {
        return formula.shippingCostPerUnit * quantity;
    }

    /**
     * Apply coupon discount
     */
    static applyCoupon(coupon, subtotal) {
        if (subtotal < (coupon.minOrderAmount || 0)) return 0;

        if (coupon.type === 'percentage') {
            let discount = subtotal * (coupon.value / 100);
            if (coupon.maxDiscount) {
                discount = Math.min(discount, coupon.maxDiscount);
            }
            return discount;
        } else if (coupon.type === 'fixed') {
            return Math.min(coupon.value, subtotal);
        }

        return 0;
    }

    /**
     * Validate pricing formula before saving
     */
    static validateFormula(formula) {
        if (!formula.pricingModel) {
            throw new Error('Pricing model is required');
        }

        if (formula.pricingModel === 'area-based' && !formula.areaRate) {
            throw new Error('Area rate is required for area-based pricing');
        }

        if (formula.pricingModel === 'volume-based' && !formula.volumeRate) {
            throw new Error('Volume rate is required for volume-based pricing');
        }

        if (formula.pricingModel === 'weight-based' && !formula.weightRate) {
            throw new Error('Weight rate is required for weight-based pricing');
        }

        return true;
    }
}

export default PricingEngine;
