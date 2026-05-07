import 'dotenv/config';
import dbConnect from '../lib/mongodb.js';
import Product from '../models/Product.js';

async function fix() {
    try {
        await dbConnect();
        console.log('Connected to MongoDB');

        const products = await Product.find({});
        let fixedCount = 0;

        for (const p of products) {
            const currentDim = p.dimensions || {};
            // Check if it has the "fake" default size
            const isFake = (currentDim.length === 8.5 && currentDim.width === 6.5 && currentDim.height === 2);
            
            // Even if not fake, we can try to "verify" from name if dimensions are empty
            const isEmpty = !currentDim.length && !currentDim.width;

            if (isFake || isEmpty) {
                // Try to extract from name
                // Patterns to look for: 10x10x1.5, 12x8x4, 3.8x10, 8.5x6.5x2, 10x10x5
                // Using regex to find numbers separated by x or ×
                const nameMatch = p.name.match(/(\d+\.?\d*)\s*[x×]\s*(\d+\.?\d*)(?:\s*[x×]\s*(\d+\.?\d*))?/i);
                
                if (nameMatch) {
                    const l = parseFloat(nameMatch[1]);
                    const w = parseFloat(nameMatch[2]);
                    const h = nameMatch[3] ? parseFloat(nameMatch[3]) : 0;

                    // Only update if it's actually different from the fake default OR if it was empty
                    if (l !== currentDim.length || w !== currentDim.width || h !== currentDim.height || isEmpty) {
                        console.log(`Fixing ${p.name}: [${currentDim.length}x${currentDim.width}x${currentDim.height}] -> [${l}x${w}x${h}]`);
                        p.dimensions = {
                            length: l,
                            width: w,
                            height: h,
                            unit: 'inch' // Default to inch as most names seem to be in inches
                        };
                        await p.save();
                        fixedCount++;
                    }
                }
            }
        }

        console.log(`Fixed ${fixedCount} products`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fix();
