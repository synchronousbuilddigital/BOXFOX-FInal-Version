/**
 * BOXFOX Pricing Calculator
 * Implements all pricing formulas defined in PRICING_FORMULAS.md
 */

// Material multipliers
const MATERIAL_MULTIPLIERS = {
  cardboard: 1.0,
  kraft: 1.15,
  corrugated_heavy: 1.25,
  specialty: 1.5,
};

// B2C Quantity-based discounts
const B2C_DISCOUNT_TIERS = [
  { min: 1, max: 50, discount: 0 },
  { min: 51, max: 100, discount: 0.05 },
  { min: 101, max: 250, discount: 0.1 },
  { min: 251, max: 500, discount: 0.15 },
  { min: 501, max: Infinity, discount: 0.2 },
];

// B2B Quantity-based discounts
const B2B_DISCOUNT_TIERS = [
  { min: 500, max: 1000, discount: 0.2, moq: 500 },
  { min: 1001, max: 5000, discount: 0.25, moq: 500 },
  { min: 5001, max: 10000, discount: 0.3, moq: 1000 },
  { min: 10001, max: Infinity, discount: 0.35, moq: 2000 },
];

/**
 * Calculate base price for customizable boxes
 * @param {Object} box - Box configuration
 * @param {number} box.length - Length in inches
 * @param {number} box.breadth - Width in inches
 * @param {number} box.height - Height in inches
 * @param {string} box.material - Material type (cardboard, kraft, etc)
 * @param {string} formulaType - Formula type: 'area' or 'volume'
 * @param {number} baseRate - Price rate per sq inch or cubic inch
 * @returns {number} Base price in rupees
 */
function calculateBasePrice(box, formulaType, baseRate, material = 'cardboard') {
  let basePrice = 0;

  if (formulaType === 'area') {
    // Calculate surface area (excluding bottom)
    const area = calculateSurfaceArea(box);
    basePrice = (area / 100) * baseRate; // Convert sq inches to standard unit
  } else if (formulaType === 'volume') {
    // Calculate volume
    const volume = box.length * box.breadth * box.height;
    basePrice = (volume / 1000) * baseRate; // Convert cubic inches
  } else if (formulaType === 'fixed') {
    basePrice = baseRate; // Fixed price
  }

  // Apply material multiplier
  const materialMultiplier = MATERIAL_MULTIPLIERS[material] || 1.0;
  basePrice *= materialMultiplier;

  return Math.round(basePrice * 100) / 100; // Round to 2 decimals
}

/**
 * Calculate surface area of a box
 * @param {Object} box - Box dimensions
 * @returns {number} Total surface area in square inches
 */
function calculateSurfaceArea(box) {
  const { length, breadth, height } = box;
  // Front & Back + Sides + Top & Bottom
  return (length * height * 2) + (breadth * height * 2) + (length * breadth * 2);
}

/**
 * Get applicable discount tier
 * @param {number} quantity - Order quantity
 * @param {boolean} isB2B - Is B2B customer
 * @returns {Object} Discount tier information
 */
function getDiscountTier(quantity, isB2B = false) {
  const tiers = isB2B ? B2B_DISCOUNT_TIERS : B2C_DISCOUNT_TIERS;
  return tiers.find(tier => quantity >= tier.min && quantity <= tier.max) || tiers[0];
}

/**
 * Calculate unit price with discounts applied
 * @param {number} basePrice - Base unit price
 * @param {number} quantity - Order quantity
 * @param {boolean} isB2B - Is B2B customer
 * @returns {Object} Unit price and discount information
 */
function calculateUnitPrice(basePrice, quantity, isB2B = false) {
  const tier = getDiscountTier(quantity, isB2B);
  const discountAmount = basePrice * tier.discount;
  const unitPrice = basePrice - discountAmount;

  return {
    basePrice,
    quantity,
    tier: tier.min + (tier.max === Infinity ? '+' : `-${tier.max}`),
    discount: tier.discount * 100, // Convert to percentage
    discountAmount: Math.round(discountAmount * 100) / 100,
    unitPrice: Math.round(unitPrice * 100) / 100,
    moq: tier.moq || null,
  };
}

/**
 * Calculate total order cost
 * @param {number} unitPrice - Per-unit price
 * @param {number} quantity - Number of units
 * @returns {number} Total cost
 */
function calculateTotalCost(unitPrice, quantity) {
  return Math.round(unitPrice * quantity * 100) / 100;
}

/**
 * Apply customization surcharges
 * @param {number} basePrice - Base unit price
 * @param {Array} customizations - Array of customization options
 * @returns {Object} Price with surcharges
 */
function applyCustomizations(basePrice, customizations = []) {
  const surcharges = {
    glossFinish: 0.05,
    matteFinish: 0.04,
    embossing: 0.1,
    foilStamping: 0.08,
    designProof: 50, // Fixed cost
    designRevision: 25, // Per revision
    customColorMatching: 75, // Fixed cost
  };

  let totalSurcharge = 0;
  const appliedSurcharges = [];

  customizations.forEach(custom => {
    if (surcharges[custom.type] !== undefined) {
      const cost = surcharges[custom.type];
      // If custom.quantity is provided, multiply surcharge
      const surchargeAmount = custom.quantity ? cost * custom.quantity : cost;
      totalSurcharge += surchargeAmount;
      appliedSurcharges.push({
        type: custom.type,
        cost: surchargeAmount,
      });
    }
  });

  return {
    basePrice,
    surcharges: appliedSurcharges,
    totalSurcharge: Math.round(totalSurcharge * 100) / 100,
    finalPrice: Math.round((basePrice + totalSurcharge) * 100) / 100,
  };
}

/**
 * Comprehensive price calculation
 * @param {Object} params - Calculation parameters
 * @returns {Object} Complete pricing breakdown
 */
function calculatePrice(params) {
  const {
    length,
    breadth,
    height,
    material = 'cardboard',
    formulaType = 'area',
    baseRate,
    quantity,
    isB2B = false,
    customizations = [],
  } = params;

  // Validate inputs
  if (!length || !breadth || !height || !baseRate || !quantity) {
    throw new Error('Missing required pricing parameters');
  }

  // Step 1: Calculate base price
  const basePrice = calculateBasePrice(
    { length, breadth, height },
    formulaType,
    baseRate,
    material
  );

  // Step 2: Apply customizations
  const customizationResult = applyCustomizations(basePrice, customizations);
  const priceWithCustomizations = customizationResult.finalPrice;

  // Step 3: Apply quantity discounts
  const unitPriceInfo = calculateUnitPrice(priceWithCustomizations, quantity, isB2B);

  // Step 4: Calculate total
  const totalCost = calculateTotalCost(unitPriceInfo.unitPrice, quantity);

  return {
    summary: {
      quantity,
      userType: isB2B ? 'B2B' : 'B2C',
      orderTotal: totalCost,
      unitPrice: unitPriceInfo.unitPrice,
    },
    breakdown: {
      basePrice,
      material,
      materialMultiplier: MATERIAL_MULTIPLIERS[material] || 1.0,
      customizations: customizationResult.surcharges,
      customizationTotal: customizationResult.totalSurcharge,
      priceBeforeDiscount: priceWithCustomizations,
      quantityTier: unitPriceInfo.tier,
      discountPercentage: unitPriceInfo.discount,
      discountAmount: unitPriceInfo.discountAmount * quantity,
      moq: unitPriceInfo.moq,
    },
    pricing: {
      basePerUnit: basePrice,
      afterCustomizations: priceWithCustomizations,
      afterDiscount: unitPriceInfo.unitPrice,
      total: totalCost,
    },
  };
}

export {
  calculateBasePrice,
  calculateSurfaceArea,
  getDiscountTier,
  calculateUnitPrice,
  calculateTotalCost,
  applyCustomizations,
  calculatePrice,
  MATERIAL_MULTIPLIERS,
  B2C_DISCOUNT_TIERS,
  B2B_DISCOUNT_TIERS,
};
