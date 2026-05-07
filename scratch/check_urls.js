const mongoose = require('mongoose');
require('dns').setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config();

async function checkProductUrls() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
        
        const products = await Product.find({}, 'name images img');
        
        console.log(`Found ${products.length} products.`);
        
        products.forEach(p => {
            console.log(`\nProduct: ${p.name}`);
            console.log(`Primary Img: ${p.img}`);
            console.log(`Gallery Images: ${p.images}`);
            
            if (p.images && typeof p.images === 'string') {
                const urls = p.images.split(',').map(u => u.trim());
                urls.forEach((url, i) => {
                    if (url && !url.startsWith('http')) {
                        console.warn(`  [!] Invalid URL at index ${i}: ${url}`);
                    }
                });
            }
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkProductUrls();
