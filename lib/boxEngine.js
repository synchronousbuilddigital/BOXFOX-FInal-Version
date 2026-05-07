/**
 * Box Engine - Catalog Based Manufacturing Calculator
 * Standardized for BoxFox Admin Product Management.
 * 
 * Features: 
 * - Precise ₹/kg material calculation
 * - Machine-specific wastage and min charges
 * - Tiered profit margins (Wholesale, Retail, Corporate, Special)
 * - Category-based manufacturing templates
 */

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

export const PLATE_PRICE = { 1926: 450, 2029: 550, 2840: 650 };

export const MACHINE_SPECS = {
    1926: { wastage: 60, minCharge: 600 },
    2029: { wastage: 80, minCharge: 750 },
    2840: { wastage: 100, minCharge: 900 }
};

export const PAPER_RATES_KG = {
    'SBS': { 'ITC': 85, 'Normal': 78 },
    'FBB': { 'ITC': 92, 'Normal': 84 },
    'Duplex': { 'LWC': 55, 'Normal': 48 },
    'Kraft': { 'High Burst': 42, 'Normal': 36 }
};

export const PROFIT_MARGINS = {
    'Retail': 0.16,
    'Corporate': 0.28,
    'Special': 0.12,
    'Wholesale': 0.08
};

export const BOX_CATALOG = {
    'CupCake': { ups: 2, machine: 2029, material: 'SBS', brand: 'ITC', gsm: 280, lamination: 0.0044, pasting: 0.5 },
    'Brownie': { ups: 4, machine: 1926, material: 'SBS', brand: 'ITC', gsm: 300, lamination: 0.0033, pasting: 0.4 },
    'Hamper Box': { ups: 1, machine: 2840, material: 'FBB', brand: 'ITC', gsm: 350, lamination: 0.008, pasting: 1.5 },
    'Cake Box': { ups: 1, machine: 2029, material: 'Duplex', brand: 'Normal', gsm: 350, lamination: 0, pasting: 0.8 },
    'Carry Bag': { ups: 2, machine: 2029, material: 'Kraft', brand: 'Normal', gsm: 120, lamination: 0, pasting: 5.0 },
    'Pastry': { ups: 4, machine: 1926, material: 'SBS', brand: 'ITC', gsm: 280, lamination: 0.0033, pasting: 0.3 },
    'Default': { ups: 2, machine: 2029, material: 'SBS', brand: 'Normal', gsm: 300, lamination: 0.0044, pasting: 0.2 }
};

// ─── ENGINE LOGIC ────────────────────────────────────────────────────────────

/**
 * Calculates the exact manufacturing cost and selling price.
 * @param {Object} params - { category, length, width, height, qty, marginType }
 */
export function calculateBoxPrice(params) {
    const { category, length, width, height, unit = 'inch', qty, marginType = 'Retail' } = params;
    const template = BOX_CATALOG[category] || BOX_CATALOG['Default'];

    let L = parseFloat(length) || 0;
    let W = parseFloat(width) || 0;
    let H = parseFloat(height) || 0;

    if (!L || !W || !H) return 0;

    // Standardize to CM for area calculation
    if (unit === 'inch') {
        L *= 2.54; W *= 2.54; H *= 2.54;
    } else if (unit === 'mm') {
        L /= 10; W /= 10; H /= 10;
    }

    // 1. Paper Calculation (₹/kg)
    // Box Layout: (L+W)*2 + 4cm (flap) by (H+W) + 2cm (flap)
    const flatW = (L + W) * 2 + 4;
    const flatH = H + W + 2;
    const areaSqCm = flatW * flatH;

    // Weight in kg = (Area in sq cm * GSM) / (10,000 * 1000)
    const weightPerUnit = (areaSqCm * template.gsm) / 10000000;
    const rate = PAPER_RATES_KG[template.material]?.[template.brand] || 80;
    const paperCost = weightPerUnit * rate;

    // 2. Machine & Printing Calculation
    const mSpec = MACHINE_SPECS[template.machine] || MACHINE_SPECS[2029];
    const plateCost = PLATE_PRICE[template.machine] || 550;
    const totalPlates = 4; // Standard 4-color printing

    const totalSheets = Math.ceil(qty / template.ups) + mSpec.wastage;
    const printRatePerSheet = 0.60; // Standard processing rate per sheet
    const printingRunCost = Math.max(mSpec.minCharge, totalSheets * printRatePerSheet);
    const totalPrintingCost = printingRunCost + (plateCost * totalPlates);
    const printingCostPerUnit = totalPrintingCost / qty;

    // 3. Post-Press (Lamination, Die-Cutting, Pasting)
    const laminationCost = areaSqCm * template.lamination;
    const dieCuttingCost = 0.40; // Flat rate per unit for die-cutting
    const pastingCost = template.pasting;

    // 4. Total Cost & Markup
    const totalCost = paperCost + printingCostPerUnit + laminationCost + dieCuttingCost + pastingCost;
    const margin = PROFIT_MARGINS[marginType] || 0.16;
    const finalPrice = totalCost * (1 + margin);

    return Math.round(finalPrice * 100) / 100;
}

/**
 * Logic to calculate price for ANY quantity based on 3 points: Price@1, Price@50, Price@100
 * Formula: Uses a power decay curve (P = a * q^b) for extrapolation beyond 100.
 */
export function calculateDynamicPrice(qty, p1, p50, p100) {
    const q = Math.max(1, parseFloat(qty) || 1);
    const v1 = Math.max(0, parseFloat(p1) || 0);
    const v50 = Math.max(0, parseFloat(p50) || 0);
    const v100 = Math.max(0, parseFloat(p100) || 0);

    if (v1 === 0) return 0;
    if (q <= 1) return v1;

    const calcPowerPrice = (q1, val1, q2, val2, qTarget) => {
        if (val1 <= val2 || val1 <= 0 || val2 <= 0) {
            const ratio = (qTarget - q1) / (q2 - q1);
            return Math.max(0, val1 - (val1 - val2) * ratio);
        }
        try {
            const b = Math.log(val2 / val1) / Math.log(q2 / q1);
            const a = val1 / Math.pow(q1, b);
            return a * Math.pow(qTarget, b);
        } catch (e) {
            const ratio = (qTarget - q1) / (q2 - q1);
            return Math.max(0, val1 - (val1 - val2) * ratio);
        }
    };

    // Case 1: Both 50 and 100 points exist
    if (v50 > 0 && v100 > 0) {
        // Enforce decay
        const safeV50 = Math.min(v50, v1);
        const safeV100 = Math.min(v100, safeV50);

        if (q <= 50) return calcPowerPrice(1, v1, 50, safeV50, q);
        if (q <= 100) return calcPowerPrice(50, safeV50, 100, safeV100, q);
        
        const extrapolated = calcPowerPrice(50, safeV50, 100, safeV100, q);
        return Math.max(extrapolated, safeV100 * 0.7);
    }

    // Case 2: Only 100 point exists (skip 50)
    if (v100 > 0) {
        const safeV100 = Math.min(v100, v1);
        if (q <= 100) return calcPowerPrice(1, v1, 100, safeV100, q);
        const extrapolated = calcPowerPrice(1, v1, 100, safeV100, q);
        return Math.max(extrapolated, safeV100 * 0.7);
    }

    // Case 3: Only 50 point exists
    if (v50 > 0) {
        const safeV50 = Math.min(v50, v1);
        if (q <= 50) return calcPowerPrice(1, v1, 50, safeV50, q);
        const extrapolated = calcPowerPrice(1, v1, 50, safeV50, q);
        return Math.max(extrapolated, safeV50 * 0.7);
    }

    // Case 4: No tiered points, return base price
    return v1;
}

/**
 * Enhanced runBoxEngine to provide 1, 50, 100 tiers
 */
export function runBoxEngine(category, dimensions) {
    const p1 = calculateBoxPrice({ ...dimensions, category, qty: 1 });
    const p50 = calculateBoxPrice({ ...dimensions, category, qty: 50 });
    const p100 = calculateBoxPrice({ ...dimensions, category, qty: 100 });

    return {
        priceAt1: Math.round(p1 * 100) / 100,
        priceAt50: Math.round(p50 * 100) / 100,
        priceAt100: Math.round(p100 * 100) / 100
    };
}

/**
 * Manually extrapolate 50 and 100 prices from a single base price
 */
export function calculateTiersFromBase(basePrice, category, dimensions) {
    const engineTiers = runBoxEngine(category, dimensions);

    const r50 = engineTiers.priceAt50 / engineTiers.priceAt1;
    const r100 = engineTiers.priceAt100 / engineTiers.priceAt1;

    return {
        priceAt1: basePrice,
        priceAt50: Math.round(basePrice * r50 * 100) / 100,
        priceAt100: Math.round(basePrice * r100 * 100) / 100
    };
}
