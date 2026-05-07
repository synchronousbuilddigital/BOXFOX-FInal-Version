require('dotenv').config();
const dbConnect = require('./lib/mongodb').default || require('./lib/mongodb');
const Product = require('./models/Product').default || require('./models/Product');

async function activate() {
    try {
        await dbConnect();
        const result = await Product.updateOne({ wpId: 1771670990303 }, { $set: { isActive: true } });
        console.log('Activation result:', result);
        
        // Also check if any other products are available
        const activeCount = await Product.countDocuments({ isActive: true });
        console.log('Total active products:', activeCount);
        
    } catch (e) {
        console.error('Error during activation:', e);
    } finally {
        process.exit();
    }
}

activate();
