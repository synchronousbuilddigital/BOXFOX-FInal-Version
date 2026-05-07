import 'dotenv/config';
import dbConnect from '../lib/mongodb.js';
import Product from '../models/Product.js';

async function check() {
    try {
        await dbConnect();
        const total = await Product.countDocuments({});
        const noLen = await Product.countDocuments({ 'dimensions.length': { $exists: false } });
        const zeroLen = await Product.countDocuments({ 'dimensions.length': 0 });
        const nullLen = await Product.countDocuments({ 'dimensions.length': null });
        
        console.log(`Total Products: ${total}`);
        console.log(`No length field: ${noLen}`);
        console.log(`Length is 0: ${zeroLen}`);
        console.log(`Length is null: ${nullLen}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
