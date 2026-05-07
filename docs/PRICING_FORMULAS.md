# BOXFOX Pricing Formula Documentation
**Version 1.0** | Last Updated: April 1, 2026

---

## Executive Summary

This document outlines the complete pricing formula system for BOXFOX customizable boxes and products. The system supports dynamic pricing based on dimensions, materials, quantity tiers, and user type (B2C vs B2B).

---

## 1. Product Categories & Types

### 1.1 Customizable Box Products (BoxProduct)
- **RSC Boxes** (Regular Slotted Containers) - Most common
- **Mailer Boxes** - Shipping with built-in handles
- **Tuck Top Boxes** - Auto-closing mechanism
- **Auto Bottom Boxes** - Self-locking base

### 1.2 Regular Catalog Products
- Pre-designed packaging solutions
- Fixed pricing with optional discounts
- Direct bulk pricing tiers

---

## 2. Core Pricing Formulas

### 2.1 Customizable Box Pricing

#### Formula Type A: **Area-Based Pricing** (For flat surfaces)
```
Base Price = (Box Dimensions / 1000) × Area Rate × Material Multiplier
Unit Price = Base Price × Quantity Multiplier

Example:
- Box: 10" × 8" × 6" (RSC)
- Area: (10×8 + 8×6 + 10×6) × 2 = 376 sq inches
- Area Rate: ₹1.50 per sq inch
- Base Price = (376/100) × ₹1.50 = ₹5.64
```

#### Formula Type B: **Volume-Based Pricing** (For 3D boxes)
```
Base Price = (Length × Breadth × Height / 1000) × Volume Rate × Material Multiplier
Unit Price = Base Price × Quantity Multiplier

Example:
- Box: 10" × 8" × 6"
- Volume: 480 cubic inches
- Volume Rate: ₹0.075 per cubic inch
- Base Price = (480/1000) × ₹0.075 = ₹0.036 (very economical for volume pricing)
```

#### Formula Type C: **Fixed Pricing** (Premium/Standard boxes)
```
Unit Price = Base Price + Customization Surcharge
- No dimension calculation required
- Fixed price per unit
- Applied to pre-defined box types
```

---

## 3. Pricing Modifiers

### 3.1 Material Multiplier
| Material | Multiplier | Notes |
|----------|-----------|-------|
| Cardboard (Standard) | 1.0x | Default |
| Kraft Paper (Eco) | 1.15x | +15% premium |
| Corrugated Heavy | 1.25x | +25% premium |
| Specialty Grade | 1.5x | +50% premium |

### 3.2 Quantity-Based Pricing Tiers

**B2C Pricing (Single to Mid-Volume)**
| Quantity Range | Discount | Status |
|---|---|---|
| 1 - 50 units | 0% | Standard |
| 51 - 100 units | 5% | Tier 1 |
| 101 - 250 units | 10% | Tier 2 |
| 251 - 500 units | 15% | Tier 3 |
| 501+ units | 20% | Tier 4 |

**B2B Pricing (Bulk Orders)**
| Quantity Range | Discount | Status | MOQ |
|---|---|---|---|
| 500 - 1,000 units | 20% | B2B Tier 1 | 500 |
| 1,001 - 5,000 units | 25% | B2B Tier 2 | 500 |
| 5,001 - 10,000 units | 30% | B2B Tier 3 | 1,000 |
| 10,001+ units | 35% | B2B Tier 4 | 2,000 |

---

## 4. Complete Pricing Calculation Example

### Scenario 1: Custom RSC Box Order (B2C) - Basic

**Order Details:**
- Box Type: RSC (Regular Slotted Container)
- Dimensions: 12" × 10" × 8"
- Material: Kraft Paper (Eco)
- Quantity: 250 units
- Pricing Formula: Area-based
- Area Rate: ₹1.87 per sq inch

**Calculation Steps:**

1. **Calculate Surface Area**
   - Front/Back: 12 × 8 × 2 = 192 sq in
   - Sides: 10 × 8 × 2 = 160 sq in
   - Top/Bottom: 12 × 10 × 2 = 240 sq in
   - **Total Area: 592 sq inches**

2. **Apply Area Rate**
   - Area Rate: ₹1.87 per sq inch
   - Base Price = (592/100) × ₹1.87 = **₹11.07**

3. **Apply Material Multiplier**
   - Kraft Paper Multiplier: 1.15x
   - Adjusted Price = ₹11.07 × 1.15 = **₹12.73**

4. **Apply Quantity Discount**
   - Quantity: 250 units (falls in 251-500 tier)
   - Discount: 15%
   - **Unit Price = ₹12.73 × 0.85 = ₹10.82**

5. **Calculate Total Order Cost**
   - Total = ₹10.82 × 250 = **₹2,705**

---

### Scenario 2: Premium Customized Box Order (B2C) - With Add-ons

**Order Details:**
- Box Type: RSC (Regular Slotted Container)
- Dimensions: 14" × 12" × 10"
- Material: Specialty Grade
- Quantity: 100 units
- Pricing Formula: Area-based
- Area Rate: ₹2.50 per sq inch
- Customizations: Gloss Finish + Embossing

**Calculation Steps:**

1. **Calculate Surface Area**
   - Front/Back: 14 × 10 × 2 = 280 sq in
   - Sides: 12 × 10 × 2 = 240 sq in
   - Top/Bottom: 14 × 12 × 2 = 336 sq in
   - **Total Area: 856 sq inches**

2. **Apply Area Rate**
   - Area Rate: ₹2.50 per sq inch
   - Base Price = (856/100) × ₹2.50 = **₹21.40**

3. **Apply Material Multiplier**
   - Specialty Grade Multiplier: 1.5x
   - Adjusted Price = ₹21.40 × 1.5 = **₹32.10**

4. **Add Customization Surcharges**
   - Gloss Finish: +₹3.75 per unit
   - Embossing: +₹7.50 per unit
   - Total Surcharge: ₹11.25 per unit
   - **Price Before Discount = ₹32.10 + ₹11.25 = ₹43.35**

5. **Apply Quantity Discount**
   - Quantity: 100 units (falls in 101-250 tier)
   - Discount: 10%
   - **Unit Price = ₹43.35 × 0.90 = ₹39.02**

6. **Calculate Total Order Cost**
   - Subtotal = ₹39.02 × 100 = **₹3,902**
   - Design Proof (included): ₹4,000 (one-time, not per unit)
   - **Grand Total = ₹3,902 + ₹4,000 = ₹7,902**

---

### Scenario 3: Bulk B2B Order (High Volume)

**Order Details:**
- Box Type: RSC (Regular Slotted Container)
- Dimensions: 10" × 8" × 6"
- Material: Cardboard (Standard)
- Quantity: 5,000 units
- Pricing Formula: Area-based
- Area Rate: ₹1.50 per sq inch
- User Type: B2B

**Calculation Steps:**

1. **Calculate Surface Area**
   - Front/Back: 10 × 6 × 2 = 120 sq in
   - Sides: 8 × 6 × 2 = 96 sq in
   - Top/Bottom: 10 × 8 × 2 = 160 sq in
   - **Total Area: 376 sq inches**

2. **Apply Area Rate**
   - Area Rate: ₹1.50 per sq inch
   - Base Price = (376/100) × ₹1.50 = **₹5.64**

3. **Apply Material Multiplier**
   - Cardboard Multiplier: 1.0x (standard)
   - Adjusted Price = ₹5.64 × 1.0 = **₹5.64**

4. **Apply B2B Quantity Discount**
   - Quantity: 5,000 units (falls in 5,001-10,000 B2B tier)
   - Discount: 30%
   - **Unit Price = ₹5.64 × 0.70 = ₹3.95**

5. **Calculate Total Order Cost**
   - Total = ₹3.95 × 5,000 = **₹19,750**
   - Savings vs B2C pricing: ₹5.64 - ₹3.95 = ₹1.69/unit = **₹8,450 total savings**

---

## 5. B2B vs B2C Pricing Strategy

### 5.1 B2C (Business to Consumer)
- Minimum Order: 1 unit
- Pricing Visibility: Full (all tiers visible)
- Standard Discounts: Applied at checkout
- Payment: Immediate/Credit Card
- Delivery: Standard shipping rates apply

### 5.2 B2B (Business to Business)
- Minimum Order Quantity (MOQ): 500 units
- Pricing Visibility: Hidden until B2B account approved
- Special Discounts: Deeper bulk discounts (20-35%)
- Payment: Net 30/60 terms available
- Delivery: Negotiated shipping rates
- Account Manager: Dedicated support

---

## 6. Customization & Add-on Pricing

### 6.1 Design Services
| Service | Cost | Time |
|---------|------|------|
| Digital Design Proof | ₹4,000 | 24 hours |
| Design Revisions (per round) | ₹2,000 | 24 hours |
| Custom Color Matching | ₹6,000 | 24 hours |
| Logo Integration | Free | Included |

### 6.2 Premium Materials
| Option | Surcharge | Description |
|--------|-----------|-------------|
| Gloss Finish | +₹3.75/unit | Shiny protective coating |
| Matte Finish | +₹3/unit | Non-reflective surface |
| Embossing | +₹7.50/unit | 3D raised design |
| Foil Stamping | +₹6/unit | Metallic accents |

---

## 7. Shipping & Handling

### 7.1 Domestic Shipping (India)
| Weight | Rate | Delivery |
|--------|------|----------|
| Up to 5kg | ₹150 | 3-5 days |
| 5-10kg | ₹300 | 3-5 days |
| 10-25kg | ₹500 | 5-7 days |
| 25kg+ | Custom Quote | 7-10 days |

### 7.2 International Shipping
- Calculated at checkout based on destination
- Express options available
- Duties & taxes calculated separately

---

## 8. Promotional & Special Pricing

### 8.1 Coupon System
- **Percentage Discount**: 5% - 50% off
- **Fixed Amount Discount**: ₹100 - ₹10,000 off
- **Free Shipping**: For orders above ₹5,000
- **Buy X Get Y**: Quantity-based promotions

### 8.2 Seasonal Offers
- Q1 (Jan-Mar): New Year Offers (10-15% off)
- Q2 (Apr-Jun): Summer Campaign (5-10% off)
- Q3 (Jul-Sep): Festival Season (15-20% off)
- Q4 (Oct-Dec): Year-End Clearance (20-30% off)

---

## 9. Price Validation Rules

### 9.1 Minimum Price Floor
- **B2C**: Minimum ₹50 per box
- **B2B**: Minimum ₹25 per box (bulk)
- **Custom Orders**: Minimum ₹100

### 9.2 Maximum Price Ceiling
- **B2C**: ₹5,000 per box (luxury tier)
- **B2B**: Negotiated pricing
- **Lock-in Period**: Valid for 30 days after quote

---

## 10. Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Apr 1, 2026 | Initial pricing formula documentation |

---

## 11. Client Sign-Off

**Please review and confirm the following:**

- [ ] Area-based and volume-based calculation methods are correct
- [ ] Material multipliers align with actual cost structure
- [ ] Quantity discount tiers are competitive and profitable
- [ ] B2B MOQ and pricing are acceptable
- [ ] Customization surcharges are reasonable
- [ ] Shipping rates are accurate
- [ ] Promotional structure meets business goals

**Client Name:** ___________________

**Date:** ___________________

**Signature:** ___________________

**Notes/Changes:** 
```


```

---

## Next Steps

1. ✅ Review pricing formulas with Finance team
2. ✅ Validate against competitor pricing
3. ✅ Confirm minimum margins are acceptable
4. ✅ Test calculations with sample orders
5. ✅ Integrate into backend API
6. ✅ Deploy to production

