import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PricingFormula from '@/models/PricingFormula';
import PricingEngine from '@/lib/pricingEngine';
import { getOrSetCache } from '@/lib/redis';

export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();
        const {
            productData, // { length, breadth, height, weight }
            pricingFormulaId,
            quantity = 1,
            customizations = [],
            finishingOptions = [],
            isB2B = false,
            couponCode = null
        } = body;

        // Validate input
        if (!productData || !pricingFormulaId) {
            return NextResponse.json(
                { error: 'Product data and pricing formula ID are required' },
                { status: 400 }
            );
        }

        // Build a unique cache key based on calculation parameters
        // This ensures the exact same box configuration returns instantly from cache
        const configHash = Buffer.from(JSON.stringify({
            productData,
            pricingFormulaId,
            quantity,
            customizations,
            finishingOptions,
            isB2B,
            couponCode
        })).toString('base64');
        const cacheKey = `pricing:calc:${configHash}`;

        const calculateNow = async () => {
            // Fetch pricing formula
            const formula = await PricingFormula.findById(pricingFormulaId);
            if (!formula || !formula.isActive) {
                throw new Error('Pricing formula not found or inactive');
            }

            // Calculate price
            const result = PricingEngine.calculatePrice(
                productData,
                formula,
                {
                    quantity,
                    customizations,
                    finishingOptions,
                    isB2B,
                    applyCoupon: couponCode
                }
            );

            return {
                pricing: result,
                formulaDetails: {
                    id: formula._id,
                    type: formula.pricingModel,
                    productType: formula.productType
                }
            };
        };

        const result = await getOrSetCache(cacheKey, calculateNow, 3600); // Cache for 1 hour

        return NextResponse.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('Pricing calculation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to calculate price' },
            { status: 500 }
        );
    }
}

// GET - Retrieve all active pricing formulas
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const productType = searchParams.get('productType');
        const category = searchParams.get('category');

        let query = { isActive: true };

        if (productType) query.productType = productType;
        if (category) query.productCategory = category;

        const formulas = await PricingFormula.find(query).select({
            productType: 1,
            productCategory: 1,
            pricingModel: 1,
            basePrice: 1,
            minOrderQuantity: 1,
            b2bMultiplier: 1
        });

        return NextResponse.json({
            success: true,
            count: formulas.length,
            data: formulas
        });

    } catch (error) {
        console.error('Error fetching pricing formulas:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pricing formulas' },
            { status: 500 }
        );
    }
}
