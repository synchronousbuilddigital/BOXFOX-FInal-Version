const mongoose = require('mongoose');
require('dotenv').config();

const productSchema = new mongoose.Schema({
    images: [String],
    img: String,
}, { strict: false });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function fixCloudinaryUrls() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const products = await Product.find({ 
            $or: [
                { images: { $regex: 'f_auto,q_auto' } },
                { img: { $regex: 'f_auto,q_auto' } }
            ]
        });

        console.log(`Found ${products.length} products with f_auto,q_auto in URLs.`);

        for (const product of products) {
            let updated = false;
            
            if (product.images) {
                const newImages = product.images.map(url => url.replace('/f_auto,q_auto/', '/'));
                if (JSON.stringify(newImages) !== JSON.stringify(product.images)) {
                    product.images = newImages;
                    updated = true;
                }
            }

            if (product.img && product.img.includes('f_auto,q_auto')) {
                product.img = product.img.replace('/f_auto,q_auto/', '/');
                updated = true;
            }

            if (updated) {
                await product.save();
                console.log(`Fixed product: ${product._id}`);
            }
        }

        console.log('Done.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fixCloudinaryUrls();
