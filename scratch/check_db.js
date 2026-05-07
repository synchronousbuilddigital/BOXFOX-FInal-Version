import mongoose from 'mongoose';
import dbConnect from './lib/mongodb.js'; // Adjust path if needed
import Product from './models/Product.js'; // Adjust path if needed
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");
        
        const total = await Product.countDocuments({});
        console.log("Total Products:", total);
        
        const active = await Product.countDocuments({ isActive: { $ne: false } });
        console.log("Active Products ($ne false):", active);
        
        const inactive = await Product.countDocuments({ isActive: false });
        console.log("Inactive Products (false):", inactive);
        
        const query = {
            type: { $in: ["simple", "variable"] },
            parent_id: { $eq: 0 },
        };
        const matchingQuery = await Product.countDocuments(query);
        console.log("Matching Type/ParentID Query:", matchingQuery);
        
        const matchingBoth = await Product.countDocuments({ ...query, isActive: { $ne: false } });
        console.log("Matching Both Query:", matchingBoth);
        
        const sample = await Product.findOne(query).lean();
        console.log("Sample Product:", JSON.stringify(sample, null, 2));
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
