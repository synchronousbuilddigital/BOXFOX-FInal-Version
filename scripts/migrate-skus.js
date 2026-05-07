const mongoose = require('mongoose');
const path = require('path');
const dns = require('dns');

// Fix for Windows/Restricted DNS environments with MongoDB SRV
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in environment.");
  process.exit(1);
}

const productSchema = new mongoose.Schema({
  sku: String,
  categories: [String],
  name: String
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const CATEGORY_MAP = {
    'CupCake': 'CPC',
    'Brownie': 'BRW',
    'Hamper Box': 'HMP',
    'Macaron': 'MCR',
    'Chocolate Box': 'CHB',
    'Pastry': 'PST',
    'Gifting': 'GFT',
    'Loaf': 'LOA',
    'Platter': 'PLT',
    'Cake Box': 'CKB',
    'Burger Box': 'BGB',
    'Food Box': 'FDB',
    'Pizza Box': 'PZA',
    'Wok Box': 'WOK',
    'Wrap Box': 'WRP',
    'Popcorn': 'PCN',
    'Packaging': 'PKG',
    'Custom': 'CST'
};

function getCategoryCode(category) {
    if (!category) return 'GEN';
    return CATEGORY_MAP[category] || category.substring(0, 3).toUpperCase();
}

async function migrate() {
  try {
    console.log("Connecting to Database...");
    const opts = {
      bufferCommands: false,
    };
    await mongoose.connect(MONGODB_URI, opts);
    console.log("Connected.");

    const products = await Product.find({ 
      $or: [
        { sku: { $exists: false } },
        { sku: "" },
        { sku: null },
        { sku: "0" },
        { sku: { $not: /^BFX-/ } }
      ] 
    });
    console.log(`Found ${products.length} products needing SKU migration.`);

    // Keep track of counts per category to generate sequential numbers
    const categoryCounts = {};

    for (const prod of products) {
      const category = (prod.categories && prod.categories.length > 0) ? prod.categories[prod.categories.length - 1] : "Packaging";
      const catCode = getCategoryCode(category);
      
      if (!categoryCounts[catCode]) {
        // Find the highest current number for this category
        const lastProduct = await Product.findOne({ sku: new RegExp(`^BFX-${catCode}-`) }).sort({ sku: -1 });
        if (lastProduct && lastProduct.sku) {
            const parts = lastProduct.sku.split('-');
            const lastNum = parseInt(parts[parts.length - 1]);
            categoryCounts[catCode] = isNaN(lastNum) ? 0 : lastNum;
        } else {
            categoryCounts[catCode] = 0;
        }
      }

      categoryCounts[catCode]++;
      const sequence = String(categoryCounts[catCode]).padStart(3, '0');
      const newSku = `BFX-${catCode}-${sequence}`;

      await Product.findByIdAndUpdate(prod._id, { sku: newSku });
      console.log(`Updated [${prod.name}] (${category}) -> SKU: ${newSku}`);
    }

    console.log("Migration Complete.");
  } catch (err) {
    console.error("Migration Failed:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrate();
