const mongoose = require('mongoose');
const path = require('path');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in environment.');
  process.exit(1);
}

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const CATEGORY_MAP = {
    'CupCake': 'CPC', 'Brownie': 'BRW', 'Hamper Box': 'HMP', 'Macaron': 'MCR',
    'Chocolate Box': 'CHB', 'Pastry': 'PST', 'Gifting': 'GFT', 'Loaf': 'LOA',
    'Platter': 'PLT', 'Cake Box': 'CKB', 'Burger Box': 'BGB', 'Food Box': 'FDB',
    'Pizza Box': 'PZA', 'Wok Box': 'WOK', 'Wrap Box': 'WRP', 'Popcorn': 'PCN',
    'Packaging': 'PKG', 'Custom': 'CST'
};

function getCategoryCode(category) {
    if (!category) return 'GEN';
    return CATEGORY_MAP[category] || (category.substring(0, 3) || 'GEN').toUpperCase();
}

async function findMaxSeqForCat(catCode) {
    const re = new RegExp(`^BFX-${catCode}-(\\d{3})$`, 'i');
    const docs = await Product.find({ sku: re }).select('sku').lean();
    let max = 0;
    for (const d of docs) {
        const m = d.sku.match(re);
        if (m && m[1]) {
            const n = parseInt(m[1], 10);
            if (!isNaN(n) && n > max) max = n;
        }
    }
    return max;
}

function pad(n) { return String(n).padStart(3, '0'); }

async function migrate() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(MONGODB_URI, { bufferCommands: false });
        console.log('Connected.');

        const toFix = await Product.find({ sku: /-copy/i }).lean();
        console.log(`Found ${toFix.length} products with '-copy' in SKU.`);

        for (const p of toFix) {
            const origSku = (p.sku || '').trim();
            if (!origSku) continue;

            // Remove trailing repeated '-copy' occurrences
            const baseSku = origSku.replace(/(-copy)+$/i, '');

            // If base SKU is empty, fallback to name-based generation
            let newSku = baseSku || null;

            // If baseSku already used by other product, need to allocate unique seq
            const other = await Product.findOne({ sku: baseSku, _id: { $ne: p._id } }).lean();

            if (!baseSku) {
                // fallback: generate from category
                const category = (p.categories && p.categories.length) ? p.categories[p.categories.length-1] : p.category || 'Packaging';
                const catCode = getCategoryCode(category);
                const max = await findMaxSeqForCat(catCode);
                newSku = `BFX-${catCode}-${pad(max + 1)}`;
            } else if (!other) {
                // baseSku not used by others — safe to set
                newSku = baseSku;
            } else {
                // baseSku already taken — parse catCode if possible
                const m = baseSku.match(/^BFX-([A-Z]{3})-(\d{3})$/i);
                if (m) {
                    const catCode = m[1].toUpperCase();
                    const max = await findMaxSeqForCat(catCode);
                    newSku = `BFX-${catCode}-${pad(max + 1)}`;
                } else {
                    // fallback to category from product
                    const category = (p.categories && p.categories.length) ? p.categories[p.categories.length-1] : p.category || 'Packaging';
                    const catCode = getCategoryCode(category);
                    const max = await findMaxSeqForCat(catCode);
                    newSku = `BFX-${catCode}-${pad(max + 1)}`;
                }
            }

            // Ensure newSku is unique (loop if needed)
            let attempt = 0;
            let candidate = newSku;
            while (await Product.findOne({ sku: candidate, _id: { $ne: p._id } })) {
                attempt++;
                const parsed = candidate.match(/^(.*)-(\d{3})$/);
                if (parsed) {
                    const next = parseInt(parsed[2], 10) + 1 + attempt;
                    candidate = `${parsed[1]}-${pad(next)}`;
                } else {
                    candidate = `${newSku}-${pad(attempt)}`;
                }
            }

            // Update document
            await Product.findByIdAndUpdate(p._id, { sku: candidate });
            console.log(`Fixed SKU for [${p.name || p._id}]: ${origSku} -> ${candidate}`);
        }

        console.log('SKU cleanup complete.');
    } catch (err) {
        console.error('SKU cleanup failed:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

migrate();
