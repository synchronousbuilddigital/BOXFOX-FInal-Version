const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product').default || require('./models/Product');

const dimensionsMap = [
    { name: '16 CAVITY CHOCOLATE BAR', length: 9, width: 6, height: 1.5, unit: 'inch' },
    { name: '9 CAVITY CHOCOLATE BOX', length: 4.5, width: 4.5, height: 1.5, unit: 'inch' },
    { name: '16 CAVITY CHOCOLATE BOX', length: 6, width: 6, height: 1.5, unit: 'inch' },
    { name: '6 CAVITY CHOCOLATE BOX', length: 4.5, width: 3, height: 1.5, unit: 'inch' },
    { name: '5 Cavity Chocolate Box', length: 7.5, width: 1.5, height: 1.5, unit: 'inch' },
    { name: 'RECTANGULAR 6 CAVITY BOX', length: 10, width: 2, height: 1.5, unit: 'inch' }
];

async function update() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/boxfox');
        for (let item of dimensionsMap) {
            // Case insensitive search
            const regex = new RegExp(`^${item.name.replace(/ /g, '\\s*')}$`, 'i');
            const result = await Product.updateMany(
                { name: { $regex: regex } },
                { $set: { dimensions: { length: item.length, width: item.width, height: item.height, unit: item.unit } } }
            );
            console.log(`Updated ${item.name}: ${result.modifiedCount} documents.`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

update();
