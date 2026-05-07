import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
    name: String,
    dimensions: {
        length: Number,
        width: Number,
        height: Number,
        unit: String
    }
}));

async function checkDimensions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");
        
        const products = await Product.find({
            $or: [
                { "dimensions.length": 0 },
                { "dimensions.width": 0 },
                { "dimensions.height": 0 },
                { "dimensions": null }
            ]
        });
        
        console.log(`Found ${products.length} products with missing or zero dimensions.`);
        
        let fixable = 0;
        products.forEach(p => {
            const match = p.name?.match(/(\d+(?:\.\d+)?)\s*[x*]\s*(\d+(?:\.\d+)?)\s*[x*]\s*(\d+(?:\.\d+)?)\s*(mm|inch|in|cm)?/i);
            if (match) {
                fixable++;
                console.log(`Fixable: "${p.name}" -> ${match[1]}x${match[2]}x${match[3]} ${match[4] || 'mm'}`);
            }
        });
        
        console.log(`Total fixable: ${fixable}`);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDimensions();
