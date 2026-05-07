const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbConnect = require('../lib/mongodb').default || require('../lib/mongodb');
const Product = require('../models/Product').default || require('../models/Product');

async function ensureProduct() {
    try {
        await dbConnect();
        const wpId = 1771670990303;
        
        let product = await Product.findOne({ wpId });
        
        if (product) {
            console.log('Product found, activating...');
            product.isActive = true;
            await product.save();
            console.log('Product activated.');
        } else {
            console.log('Product not found, creating...');
            await Product.create({
                wpId,
                name: "Standard Mailer Box",
                description: "Premium customizable mailer box for high-end packaging.",
                price: "50",
                minPrice: "35",
                maxPrice: "65",
                categories: ["Mailers", "Packaging"],
                isActive: true,
                dimensions: {
                    length: 12,
                    width: 8,
                    height: 4,
                    unit: 'in'
                }
            });
            console.log('Product created and activated.');
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit();
    }
}

ensureProduct();
