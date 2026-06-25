import { BOX_SPECIFICATIONS, findClosestSpec } from "./box-specifications";

/**
 * BoxFox Real Pricing Engine
 * ──────────────────────────
 * Exact replication of the Google Sheets Main tab formulas
 * from BoxFox_price_analyses- repository.
 *
 * Source: BoxFox_price_analyses-/dashboard/src/engine/pricing.js
 * Verified against: Bakery > Brownie 1, qty=10, SBS ITC 280GSM → ₹648.32/unit ✓
 */

// ─── PRINTING LOOKUP TABLE ─────────────────────────────────────────────────────
// Maps sheetQty ranges → printing cost per machine type
const PRINTING_TABLE = [
  { "from": 1, "p1926": 300, "p2029": 750, "p2840": 0, "die": 300 },
  { "from": 1081, "p1926": 425, "p2029": 750, "p2840": 0, "die": 600 },
  { "from": 2081, "p1926": 550, "p2029": 750, "p2840": 0, "die": 900 },
  { "from": 3081, "p1926": 675, "p2029": 925, "p2840": 0, "die": 1200 },
  { "from": 4081, "p1926": 800, "p2029": 875, "p2840": 0, "die": 1500 },
  { "from": 5081, "p1926": 925, "p2029": 1050, "p2840": 0, "die": 1800 },
  { "from": 6081, "p1926": 1050, "p2029": 1225, "p2840": 0, "die": 2100 },
  { "from": 7081, "p1926": 1175, "p2029": 1400, "p2840": 0, "die": 2400 },
  { "from": 8081, "p1926": 1300, "p2029": 1575, "p2840": 0, "die": 2700 },
  { "from": 9081, "p1926": 1425, "p2029": 1750, "p2840": 0, "die": 3000 },
  { "from": 10081, "p1926": 1550, "p2029": 1925, "p2840": 0, "die": 3300 },
  { "from": 11081, "p1926": 1675, "p2029": 2100, "p2840": 0, "die": 3600 },
  { "from": 12081, "p1926": 1800, "p2029": 2275, "p2840": 0, "die": 3900 },
  { "from": 13081, "p1926": 1925, "p2029": 2450, "p2840": 0, "die": 4200 },
  { "from": 14081, "p1926": 2050, "p2029": 2625, "p2840": 0, "die": 4500 },
  { "from": 15081, "p1926": 2175, "p2029": 2800, "p2840": 0, "die": 4800 },
  { "from": 16081, "p1926": 2300, "p2029": 2975, "p2840": 0, "die": 5100 },
  { "from": 17081, "p1926": 2425, "p2029": 3150, "p2840": 0, "die": 5400 },
  { "from": 18081, "p1926": 2550, "p2029": 3325, "p2840": 0, "die": 5700 },
  { "from": 19081, "p1926": 2675, "p2029": 3500, "p2840": 0, "die": 6000 },
  { "from": 20081, "p1926": 2800, "p2029": 3675, "p2840": 0, "die": 6300 },
  { "from": 21081, "p1926": 2925, "p2029": 3850, "p2840": 0, "die": 6600 },
  { "from": 22081, "p1926": 3050, "p2029": 4025, "p2840": 0, "die": 6900 },
  { "from": 23081, "p1926": 3175, "p2029": 4200, "p2840": 0, "die": 7200 },
  { "from": 24081, "p1926": 3300, "p2029": 4375, "p2840": 0, "die": 7500 },
  { "from": 25081, "p1926": 3425, "p2029": 4550, "p2840": 0, "die": 7800 },
  { "from": 26081, "p1926": 3550, "p2029": 4725, "p2840": 0, "die": 8100 },
  { "from": 27081, "p1926": 3675, "p2029": 4900, "p2840": 0, "die": 8400 },
  { "from": 28081, "p1926": 3800, "p2029": 5075, "p2840": 0, "die": 8700 },
  { "from": 29081, "p1926": 3925, "p2029": 5250, "p2840": 0, "die": 9000 },
  { "from": 30081, "p1926": 4050, "p2029": 5425, "p2840": 0, "die": 9300 }
];

// ─── PLATE PRICES (one-time per colour per machine) ────────────────────────────
const PLATE_PRICE = { 1926: 250, 2029: 275, 2840: 650 };

// ─── MATERIAL RATES (₹ per 1000 sheets — CC5) ──────────────────────────────────
export const MATERIAL_RATES = {
  "SBS": {
    "ITC": { "230 GSM": 85.0 },
    "Century": { "250 GSM": 80.0 },
    "Normal": { "280 GSM": 82.0 },
    "Custom": 82
  },
  "WhiteBack": {
    "Khanna": { "230 GSM": 78.0 },
    "Sinar Mas": { "250 GSM": 55.0 },
    "Normal": { "280 GSM": 52.0 },
    "Custom": 52
  },
  "GreyBack": {
    "Khanna": { "230 GSM": 70.0 },
    "Sinar Mas": { "250 GSM": 50.0 },
    "Normal": { "280 GSM": 47.0 },
    "Custom": 47
  },
  "Maplitho": {
    "Normal": {
      "65 GSM": 78.0,
      "90 GSM": 78.0,
      "100 GSM": 78.0,
      "110 GSM": 78.0,
      "130 GSM": 78.0,
      "150 GSM": 78.0
    },
    "Custom": 78
  },
  "Art Card": {
    "Normal": {
      "90 GSM": 115.0,
      "100 GSM": 115.0,
      "110 GSM": 115.0,
      "130 GSM": 115.0,
      "150 GSM": 115.0,
      "170 GSM": 115.0,
      "220 GSM": 115.0,
      "250 GSM": 115.0,
      "300 GSM": 115.0,
      "350 GSM": 115.0,
      "80 GSM": 115.0
    },
    "Custom": 115
  },
  "Duplex": { "Custom": 75 },
  "Other Type": { "Custom": 75 },
  "Custom Paper": { "Custom": 75 },
};

// ─── LAMINATION RATES (per sq cm per sheet) ────────────────────────────────────
export const LAM_RATES = {
  'Plain': 0,
  'Lamination Thermal': 0.008,
  'Lamination Normal Gloss': 0.004,
  'Lamination Normal Matt': 0.0044,
  'Varnish': 0.0014,
  'UV Flat': 0.0025,
  'UV Hybrid': 0.0045,
  'UV Crystal': 0.0055,
  'Spot UV': 1,
};

// ─── COLOUR FACTORS ────────────────────────────────────────────────────────────
export const COLOUR_FACTORS = {
  'Without Print': 0,
  'Single Colour': 1,
  'Double Colour': 2,
  'Four Colour': 4,
  'Four + One Colour': 6.75,
  'Four + Two Colour': 7.75,
  'Four + Four Colour': 9.75,
};

// ─── MARKUP TYPES ──────────────────────────────────────────────────────────────
export const MARKUP_TYPES = {
  'Retail': 0.16,
  'Corporate': 0.28,
  'Special': 0.12,
  'None': 0,
};

// ─── ADD-ON OPTIONS ────────────────────────────────────────────────────────────
export const ADDON_OPTIONS = {
  'Plain': { type: 'lam', rate: 0 },
  'Lamination Thermal': { type: 'lam', rate: 0.008 },
  'Lamination Normal Gloss': { type: 'lam', rate: 0.004 },
  'Lamination Normal Matt': { type: 'lam', rate: 0.0044 },
  'Varnish': { type: 'lam', rate: 0.0014 },
  'UV Flat': { type: 'lam', rate: 0.0025 },
  'UV Hybrid': { type: 'lam', rate: 0.0045 },
  'UV Crystal': { type: 'lam', rate: 0.0055 },
  'Spot UV': { type: 'lam', rate: 1 },
  'Carry Bag Single Pasting': { type: 'carry', rate: 5 },
  'Carry Bag Double Pasting': { type: 'carry', rate: 6 },
  'Gumming Full': { type: 'gumming', rate: 0.0125 },
  'Gumming Top Bottom': { type: 'gumming', rate: 0.017 },
};

// ─── EXPORTED OPTION LISTS ─────────────────────────────────────────────────────
export const MATERIALS = Object.keys(MATERIAL_RATES);
export const LAMINATIONS = Object.keys(LAM_RATES);
export const ADDONS = Object.keys(ADDON_OPTIONS);
export const PRINT_TYPES = Object.keys(COLOUR_FACTORS);
export const GSM_OPTIONS = ['230', '250', '280', '300', '330', '350', '400'];

// ─── HELPER FUNCTIONS ──────────────────────────────────────────────────────────

const ru = (x) => Math.ceil(x);

function lookupPrinting(sheetQty, machine, printingTable) {
  const table = (printingTable && printingTable.length) ? printingTable : PRINTING_TABLE;
  let printVal = 0;
  const key = machine === 2029 ? 'p2029' : machine === 2840 ? 'p2840' : 'p1926';
  for (const row of table) {
    if (sheetQty >= row.from) { printVal = row[key] ?? 0; }
    else break;
  }
  return printVal;
}

function getCC5(material, brand, gsm, customRate, paperRates) {
  if (['Duplex', 'Other Type', 'Custom Paper'].includes(material)) return customRate ?? 75;
  const rateMap = paperRates || MATERIAL_RATES;
  const mData = rateMap[material];
  if (!mData) return 82;

  const bData = mData[brand] || mData['Normal'] || mData['Custom'];
  if (typeof bData === 'number') return bData;
  if (typeof bData === 'object') {
    const gsmKey = `${gsm} GSM`;
    return bData[gsmKey] || Object.values(bData)[0] || 82;
  }
  return 82;
}

function calcPaper(W, H, sheetQty, gsm, cc5) {
  return ru(((W * H) / 1550) * (gsm / 1000) * (cc5 + 2) * sheetQty + (sheetQty / 144) * 15);
}

function calcLam(W, H, sheetQty, qty, lamType, lamRates) {
  const rateMap = lamRates || LAM_RATES;
  const rate = rateMap[lamType] ?? 0;
  if (!lamType || lamType === 'Plain' || rate === 0) return 0;

  const uvFlat = rateMap['UV Flat'] ?? 0.0025;
  const uvHybrid = rateMap['UV Hybrid'] ?? 0.0045;
  const uvCryst = rateMap['UV Crystal'] ?? 0.0055;
  const thermal = rateMap['Lamination Thermal'] ?? LAM_RATES['Lamination Thermal'];

  if (lamType === 'UV Flat') {
    return Math.max((W * H * uvFlat * sheetQty) / qty + 350 / qty, 500 / qty);
  }
  if (lamType === 'UV Hybrid') {
    return Math.max((W * H * uvHybrid * sheetQty) / qty + 350 / qty, 2500 / qty);
  }
  if (lamType === 'UV Crystal') {
    const base = Math.max((W * H * uvCryst * sheetQty) / qty + 350 / qty, 2500 / qty);
    const th = Math.max((W * H * thermal * sheetQty) / qty, 300 / qty);
    return base + th;
  }
  return Math.max((W * H * rate * sheetQty) / qty, 300 / qty);
}

// ─── MAIN CALCULATOR ──────────────────────────────────────────────────────────

export function calculateBoxPrice(params, customConfigs = null) {
  const {
    spec,
    qty,
    gsm = 300,
    material = 'SBS',
    brand = 'ITC',
    customRate = 75,
    colours = 'Four Colour',
    lamination = 'Plain',
    addon = 'Plain',
    dieCutting = true,
    markupType = 'Retail',
    sides = 'One',
  } = params;

  const rates = customConfigs || {};

  // Ground Truth Correction: Ensure we use verified manufacturing data from lib/box-specifications.js
  // even if the database is out of sync.
  let activeSpec = spec;
  if (spec?.l && spec?.w && spec?.h) {
    const verified = findClosestSpec(spec.l, spec.w, spec.h, spec.category || "All", spec.unit || "mm");
    if (verified) {
      activeSpec = { ...spec, ...verified };
    }
  }

  const ups = Math.max(parseFloat(activeSpec?.ups) || 1, 0.5);
  const machine = parseInt(activeSpec?.machine) || 2029;
  const W = parseFloat(activeSpec?.sheetW) || 20;
  const H = parseFloat(activeSpec?.sheetH) || 29;
  const design = parseFloat(activeSpec?.designing) || 100;
  const pasting = parseFloat(activeSpec?.pasting) || 0;
  const leafing = parseFloat(activeSpec?.leafing) || 0;
  const window_ = parseFloat(activeSpec?.window) || 0;
  const dblChg = parseFloat(activeSpec?.double_charges) || 1;

  // Use live lam rates from rates if available
  const lamRates = {
    'Plain': 0,
    'Lamination Thermal': rates.lam_thermal ?? LAM_RATES['Lamination Thermal'],
    'Lamination Normal Gloss': rates.lam_gloss ?? LAM_RATES['Lamination Normal Gloss'],
    'Lamination Normal Matt': rates.lam_matt ?? LAM_RATES['Lamination Normal Matt'],
    'Varnish': rates.varnish ?? LAM_RATES['Varnish'],
    'UV Flat': rates.uv_flat ?? LAM_RATES['UV Flat'],
    'UV Hybrid': rates.uv_hybrid ?? LAM_RATES['UV Hybrid'],
    'UV Crystal': rates.uv_crystal ?? LAM_RATES['UV Crystal'],
    'Spot UV': LAM_RATES['Spot UV'],
  };

  const cc5 = getCC5(material, brand, gsm, customRate, MATERIAL_RATES);

  // sheetQty = ROUNDUP(qty/ups) + 80
  const sheetQty = Math.ceil(qty / ups) + 80;

  // X2 = LOOKUP(sheetQty, printingCol) × colourFactor + platePrice × colourFactor
  const printLookup = lookupPrinting(sheetQty, machine, rates.printing_table);
  const rawPrint = typeof printLookup === 'object' ? printLookup.printVal : printLookup;

  const cf = COLOUR_FACTORS[colours] ?? 4;
  const platePriceRaw = machine === 2029 ? (rates.plate_2029 ?? PLATE_PRICE[2029])
    : machine === 2840 ? (rates.plate_2840 ?? PLATE_PRICE[2840])
      : (rates.plate_1926 ?? PLATE_PRICE[1926]);

  const plateCost = platePriceRaw * cf;
  const X2 = ru(rawPrint * cf) + plateCost;

  // Z2 = Dangler Making rate per sheet (0.25 or 0.20)
  const dieRatePerSheet = sheetQty <= 5080 ? 0.25 : 0.20;
  const Z2 = dieCutting ? dieRatePerSheet : 0;
  const totalDieCost = dieCutting ? ru(dieRatePerSheet * sheetQty) : 0; // Only for breakdown

  // AE2 = ROUNDUP(designing + Z2_rate + leafing + window + pasting)
  const AE2 = ru(design + Z2 + leafing + window_ + pasting);

  // AD2 = ROUNDUP((qty×window×1.05) + MAX(sheetQty×ups×pasting, 200) + 1)
  const AD2 = ru((qty * window_ * 1.05) + Math.max(sheetQty * ups * pasting, 200) + 1);

  // P2: Paper cost
  const P2 = calcPaper(W, H, sheetQty, gsm, cc5);

  // AG2: base per unit
  const AG2 = (P2 + AE2 + X2 + AD2) / qty;

  // Lamination per unit
  const sidesFactor = sides === 'Two' ? 2 : 1;
  const lamPerUnit = calcLam(W, H, sheetQty, qty, lamination, lamRates) * sidesFactor;

  // Addon per unit
  const addonDef = ADDON_OPTIONS[addon];
  let addonPerUnit = 0;
  if (addonDef && addon !== 'Plain') {
    if (addonDef.type === 'carry') {
      const carryRate = addon === 'Carry Bag Single Pasting'
        ? (rates.carry_single ?? 5)
        : (rates.carry_double ?? 6);
      addonPerUnit = Math.max(qty * carryRate, 300) / qty;
    } else if (addonDef.type === 'gumming') {
      const gRate = addon === 'Gumming Full'
        ? (rates.gumming_full ?? 0.0125)
        : (rates.gumming_tb ?? 0.017);
      addonPerUnit = Math.max((W * H * gRate * sheetQty) / qty, 500 / qty);
    } else {
      addonPerUnit = calcLam(W, H, sheetQty, qty, addon, lamRates);
    }
  }

  // Subtotal per unit
  const subtotalPerUnit = (AG2 + lamPerUnit + addonPerUnit) * dblChg;

  // Markup
  const markupMap = {
    'Retail': rates.markup_retail ?? MARKUP_TYPES['Retail'],
    'Corporate': rates.markup_corporate ?? MARKUP_TYPES['Corporate'],
    'Special': rates.markup_special ?? MARKUP_TYPES['Special'],
    'None': 0,
  };
  const markup = markupMap[markupType] ?? MARKUP_TYPES['Retail'];
  const finalPerUnit = subtotalPerUnit * (1 + markup);
  const finalTotal = ru(finalPerUnit * qty);

  return {
    qty, gsm, material, brand, colours, lamination, addon, dieCutting, markupType, sides,
    ups, machine, sheetW: W, sheetH: H, sheetQty, cc5,
    paperCost: P2, printCost: X2, fixedCharges: AE2, otherCharges: AD2,
    plateCost, printingRate: rawPrint, dieRate: dieRatePerSheet, dieCost: totalDieCost,
    basePerUnit: AG2, lamPerUnit, addonPerUnit, subtotalPerUnit, markup,
    markupAmount: finalPerUnit - subtotalPerUnit, finalPerUnit, finalTotal,
    breakdown: {
      paper: P2, print: X2, fixed: AE2, other: AD2, lamination: lamPerUnit * qty,
      addon: addonPerUnit * qty, windowPerUnitCharge: (qty * window_ * 1.05),
      pastingSheetCharge: Math.max(sheetQty * ups * pasting, 200) + 1,
      design: design, die: totalDieCost,
    },
    dieToolingCharge: dieCutting ? (spec?.dieRate || 0) : 0,
    grandTotal: ru(finalPerUnit * qty) + (dieCutting ? (spec?.dieRate || 0) : 0),
  };
}

export function unitPriceFromSixPoints(product, qty) {
  const q = Math.max(1, Number(qty) || 1);
  const basePrice = Math.max(0, Number(product?.priceAt1 || 0));
  if (basePrice === 0) return 0;

  if (product?.pricingMode === 'slabs' && Array.isArray(product?.priceSlabs) && product.priceSlabs.length > 0) {
    const sortedSlabs = [...product.priceSlabs].sort((a, b) => b.minQty - a.minQty);
    for (const slab of sortedSlabs) {
      if (q >= slab.minQty) {
        const withinMax = slab.maxQty === undefined || slab.maxQty === null || slab.maxQty === 0 || q <= slab.maxQty;
        if (withinMax) {
          if (slab.price !== undefined && slab.price !== null && slab.price !== 0) {
            return Number(slab.price);
          }
          if (slab.discount !== undefined && slab.discount !== null) {
            return Math.round(basePrice * (1 - Number(slab.discount) / 100) * 100) / 100;
          }
        }
      }
    }
    return basePrice;
  }

  const {
    priceAt1,
    priceAt10,
    priceAt50,
    priceAt100,
    priceAt500,
    priceAt1000,
    discountAt10,
    discountAt50,
    discountAt100,
    discountAt500,
    discountAt1000
  } = product || {};

  const tiers = [
    { qty: 1000, price: priceAt1000, discount: discountAt1000 },
    { qty: 500, price: priceAt500, discount: discountAt500 },
    { qty: 100, price: priceAt100, discount: discountAt100 },
    { qty: 50, price: priceAt50, discount: discountAt50 },
    { qty: 10, price: priceAt10, discount: discountAt10 }
  ];

  for (const tier of tiers) {
    if (q >= tier.qty) {
      const hasPrice = tier.price !== undefined && tier.price !== null && tier.price !== '';
      const hasDiscount = tier.discount !== undefined && tier.discount !== null && tier.discount !== '';

      if (hasPrice || hasDiscount) {
        if (hasDiscount) {
          return Math.round(basePrice * (1 - Number(tier.discount) / 100) * 100) / 100;
        }
        if (hasPrice) {
          const pVal = Number(tier.price);
          // Legacy check: if discount is not set and price is <= 100 (except 0), treat it as a discount percentage
          if (pVal <= 100 && pVal > 0) {
            return Math.round(basePrice * (1 - pVal / 100) * 100) / 100;
          }
          return pVal;
        }
      }
    }
  }

  return basePrice;
}

/**
 * Compute per-unit price from three admin-entered price points:
 * price at q=1, q=50 and q=100. Uses power-law interpolation
 * between (1, p1) -> (50, p50) and (50, p50) -> (100, p100).
 * Returns a number (per-unit price) or 0 if insufficient data provided.
 */
export function unitPriceFromThreePoints({ priceAt1, priceAt50, priceAt100 }, qty) {
  return unitPriceFromSixPoints({ priceAt1, priceAt50, priceAt100 }, qty);
}

/**
 * Get the default brand for a material type.
 */
export function getDefaultBrand(material) {
  const brands = Object.keys(MATERIAL_RATES[material] || {});
  return brands[0] || 'Custom';
}

/**
 * Get available brands for a material type.
 */
export function getBrandsForMaterial(material) {
  return Object.keys(MATERIAL_RATES[material] || { 'Custom': 75 });
}
