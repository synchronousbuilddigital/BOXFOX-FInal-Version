import dns from 'dns';

// Force use of Google's public DNS to fix MongoDB SRV resolution on restricted networks
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    if (dns.setDefaultResultOrder) {
        dns.setDefaultResultOrder('ipv4first');
    }
} catch (err) {
    console.warn("DNS setup failed, proceeding with default.");
}

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function updatePizzaBoxes() {
    try {
        const { default: dbConnect } = await import('../lib/mongodb.js');
        const { default: Product } = await import('../models/Product.js');
        
        await dbConnect();
        console.log("Connected to DB");
        
        const activeSizes = ["4.5", "6.9", "7", "8", "10", "12"];
        
        // Find all products with "Pizza Box" in name
        const pizzaBoxes = await Product.find({
            name: /Pizza Box/i
        });

        console.log(`Processing ${pizzaBoxes.length} pizza boxes...`);

        let activated = 0;
        let deactivated = 0;

        for (const product of pizzaBoxes) {
            const name = product.name;
            const hasActiveSize = activeSizes.some(size => {
                // Check for size with word boundaries or specific patterns
                // e.g. "10x10", "10×10", "10 inch"
                // Using regex to match the size followed by 'x', 'inch', or end of string
                const regex = new RegExp(`(^|[^0-9.])${size}([^0-9.]|$)`);
                return regex.test(name.replace(/×/g, 'x'));
            });

            if (hasActiveSize) {
                if (!product.isActive) {
                    product.isActive = true;
                    await product.save();
                    activated++;
                    console.log(`ACTIVATED: ${name}`);
                } else {
                    console.log(`STAY ACTIVE: ${name}`);
                }
            } else {
                if (product.isActive !== false) {
                    product.isActive = false;
                    await product.save();
                    deactivated++;
                    console.log(`DEACTIVATED: ${name}`);
                } else {
                    console.log(`STAY INACTIVE: ${name}`);
                }
            }
        }

        console.log(`\nSummary:`);
        console.log(`Activated: ${activated}`);
        console.log(`Deactivated: ${deactivated}`);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

updatePizzaBoxes();
