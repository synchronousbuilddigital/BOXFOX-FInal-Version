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

async function syncActiveWithDieline() {
    try {
        const { default: dbConnect } = await import('../lib/mongodb.js');
        const { default: Product } = await import('../models/Product.js');
        
        await dbConnect();
        console.log("Connected to DB");
        
        // 1. Deactivate all products first? Or just do it in one pass.
        // The requirement: "if dieline upload -> active, else -> inactive"
        
        console.log("Fetching all products...");
        const allProducts = await Product.find({});
        console.log(`Processing ${allProducts.length} products...`);

        let activated = 0;
        let deactivated = 0;
        let stayActive = 0;
        let stayInactive = 0;

        for (const product of allProducts) {
            // Check if dieline exists. We check dielineImg field.
            const hasDieline = product.dielineImg && product.dielineImg.trim() !== "";
            
            if (hasDieline) {
                if (!product.isActive) {
                    product.isActive = true;
                    await product.save();
                    activated++;
                    console.log(`ACTIVATED (Dieline Found): ${product.name} (ID: ${product._id})`);
                } else {
                    stayActive++;
                }
            } else {
                if (product.isActive !== false) {
                    product.isActive = false;
                    await product.save();
                    deactivated++;
                    console.log(`DEACTIVATED (No Dieline): ${product.name} (ID: ${product._id})`);
                } else {
                    stayInactive++;
                }
            }
        }

        console.log(`\nSummary:`);
        console.log(`Total Products: ${allProducts.length}`);
        console.log(`Newly Activated: ${activated}`);
        console.log(`Stayed Active: ${stayActive}`);
        console.log(`Newly Deactivated: ${deactivated}`);
        console.log(`Stayed Inactive: ${stayInactive}`);
        console.log(`Total Active Now: ${activated + stayActive}`);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

syncActiveWithDieline();
