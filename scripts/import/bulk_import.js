import mongoose from "mongoose";
import dns from "dns";

// Fix for querySrv ECONNREFUSED on some networks
dns.setServers(['8.8.8.8', '8.8.4.4']);
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const MONGODB_URI = "mongodb+srv://boxfox:boxfox@cluster0.7oansfw.mongodb.net/boxfox";

const productSchema = new mongoose.Schema({
    wpId: { type: Number, required: true, unique: true },
    type: { type: String, default: 'simple' },
    sku: String,
    name: { type: String, required: true },
    isFeatured: { type: Boolean, default: false },
    short_description: String,
    description: String,
    regular_price: String,
    sale_price: String,
    price: String,
    minPrice: String,
    maxPrice: String,
    categories: [String],
    tags: [String],
    images: [String],
    stock_status: String,
    stock_quantity: Number,
    parent_id: { type: Number, default: 0 },
    brand: { type: String, default: 'BoxFox' },
    minOrderQuantity: { type: Number, default: 100 },
    badge: String,
    weight: Number,
    dimensions: {
        length: Number,
        width: Number,
        height: Number,
        unit: { type: String, default: 'inch' }
    },
    attributes: [{ name: String, options: [String] }],
    specifications: [{ key: String, value: String }],
    meta: {
        features_desc: String,
        lumise_customize: String,
        specifications: String
    },
    pacdoraId: String,
    lastSynced: { type: Date, default: Date.now }
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const rawData = `
Bakery Brownie 1 89*89*38 mm | 3.5*3.5*1.5 inch 6 2029 19.5 23
Bakery Brownie 2 180*70*35 mm | 7*2.75*1.4 inch 4 2029 19 20
Bakery Brownie 4 165*125*40 mm | 5*1.5*6.5 inch 1 1926 18 23
Bakery Brownie 6 230*125*50 mm | 5*2*9 inch 2 2029 18 28
Bakery Brownie 9 200*200*50 mm | 7.8*7.8*2 inch TB 1 2029 21 36
Bakery Burger 120*120*50 mm | 4.7*4.7*2 inch 1 1926 11.5 19.5
Bakery Cake Box 0.5 Kg 178*178*102 mm | 7*7*4 inch 1 1926 13 23
Bakery Cake Box 1Kg 9*9*6 inch 1 2840 20.75 31.5
Bakery Cake Box 0.5Kg 203*203*127 mm | 8*8*5 inch | 28*17 1 2029 20 28
Bakery Cake Box 1Kg 254*254*127 mm | 10*10*5 inch | 32*19 1 2840 20.75 31.5
Bakery Cake Box 2Kg 305*304*127 mm | 12*12*5 inch | 22*36 1 2840 23 36
Bakery Cake Box 1Kg 8*8*6 inch Bottom 1 1926 18 21
Bakery Cake Box 1Kg 8*8*6 | 8*8*2.5 inch Top 2 2029 13.4 28
Bakery Cake Box 6*6*6 inch Bottom 1 1926 18 19
Bakery Cake Box 6*6*6 | 6*6*2.5 inch Top 2 1926 12 23
Bakery Cake Box 10*10*6 inch Bottom 1 2029 19.5 23
Bakery Cake Box 10*10*6 | 10*10*2.5 inch Top 1 1926 18 19
Bakery Cake Box 12*12*6 inch Bottom 1 2029 20 25
Bakery Cake Box 12*12*6 | 12*12*2.5 inch Top 1 1926 18 19
Bakery Cake Box 14*18*6 inch Bottom 1 2840 25 30
Bakery Cake Box 14*18*6 | 14*18*2.5 inch Top 1 2029 19.5 23
Bakery Cake Box 7*7*5 inch W 5*10 inch 1 1926 15 25
Bakery Cake Box 70*130*110 mm | 2.75*5.1*4.3 inch set 2 2029 20 28
Bakery Cake Box 178*128*102 mm | 7*5*4 inch 2 2029 20 28
Bakery Cake Box 207*207*127 mm | 8*8*5 inch | 22*18 1 1926 19.5 23
Bakery Cake Box 356*356*127 mm | 14*14*5 inch | 24*40 1 2840 23 40
Bakery Cake Box 406*406*127 mm | 16*16*5 inch | 26*45 1 2840 26 45
Bakery Cake Box Tall Box 8*8*10 28*30 15*15 1 2840 30 43
Bakery Cake Box Tall Box 10*10*10 32*32 18*18 1 2840 32 47
Bakery Cake Box Tall Box 12*12*12 38*38 19*19 1 2840 38 55
Bakery Cake Box Tall Box 14*14*14 43*43 21*21 1 2840 43 63
Bakery Cake Box 178*178*120 mm | 7*7*4.75 inch 1 1926 15 25
Bakery Cakesicles 50*30*90 mm | 2*1.2*3.5 inch 9 1926 18 21
Bakery Carry Bag 95*90*350 mm | 3.5*3.74*13.8 inch 1 1926 18 19
Bakery Carry Bag 203*203*203 mm | 8*8*8 inch 1 1926 18 25
Bakery Carry Bag 268*268*203 mm | 10.5*10.5*8 inch 1 2840 22 28
Bakery Carry Bag 228*102*280 mm | 9*4*11 inch 1 2029 19 28
Bakery Carry Bag 178*102*178 mm | 7*4*7 inch 1 1926 13 23
Bakery Chocolate 12 Tray 250*80*40 mm | 9.9*3.15*1.6 inch 2 1926 18 23
Bakery Chocolate 12 Sleeve 250*80*40 mm | 9.9*3.15*1.6 inch 2 1926 12 23
Bakery Chocolate 15 Tray 200*125*40 mm | 7.8*4.9*1.6 inch 2 2029 19 26
Bakery Chocolate 15 Sleeve 200*125*40 mm | 7.8*4.9*1.6 inch 3 1926 15 25
Bakery Chocolate 24 250*165*40 mm | 9.9*6.5*1.6 inch 1 1926 18 25
Bakery Chocolate 24 Tray 250*165*40 mm | 9.9*6.5*1.6 inch 1 1926 15.75 20.75
Bakery Chocolate 24 Sleeve 250*165*40 mm | 9.9*6.5*1.6 inch 2 1926 15.75 20.75
Bakery Chocolate 4 Tray 80*80*30 mm | 3.15*3.15*1.1 inch 2 1926 11.5 19.5
Bakery Chocolate 4 Sleeve 80*80*30 mm | 3.15*3.15*1.1 inch 8 1926 14 20
Bakery Chocolate 5 Tray 210*45*30 mm | 8.2*1.7*1.1 inch 3 1926 14 22
Bakery Chocolate 5 Sleeve 210*45*30 mm | 8.2*1.7*1.1 inch 6 1926 18 21
Bakery Chocolate 5 Partition 210*45*30 mm | 8.2*1.7*1.1 inch 6 1926 12 18
Bakery Chocolate 9 Tray 125*125*40 mm | 4.9*4.9*1.6 inch 2 2029 13.5 28
Bakery Chocolate 9 Sleeve 125*125*40 mm | 4.9*4.9*1.6 inch 4 1926 15.75 20.75
Bakery Chocolate Tray 40*40*25 mm | 1.5*1.5*1 inch 24 1926 14 22
Bakery Cookies 76*102 mm | 3*4 inch W 2*2.5 inch 2 1926 15.75 20.75
Bakery Cookies 76*152 mm | 3*6 inch W 2*4 inch 2 1926 12 25
Bakery Cookies 1kg 178*165*64 mm | 7*6.5*2.5 inch 2 1926 19 26
Bakery Cookies 500g 165*127*51 mm | 6.5*5*2 inch 2 1926 18 23
Bakery Cookies 250g 102*102*45 mm | 4*4*1.75 inch 4 1926 18 25
Bakery Cookies 76*76*102 mm | 3*3*4 inch 4 1926 19.5 23
Bakery Cookies 76*76*152 mm | 3*3*6 inch 2 1926 14 22
Bakery Cupcake 1 90*90*90 mm | 3.5*3.5*3.5 inch 2 1926 15.75 20.75
Bakery Cupcake 1 Holder 90*90*90 mm | 3.5*3.5*3.5 inch 12 1926 15.75 20.75
Bakery Cupcake 12 320*235*75 mm | 12.5*9*3 inch 1 2840 23 36
Bakery Cupcake 12 Tray 320*235*75 mm | 12.5*9*3 inch 2 1926 18 23
Bakery Cupcake 2 185*115*75 mm | 4.5*7.3*2.9 inch 2 1926 18 23
Bakery Cupcake 2 Holder 185*115*75 mm | 4.5*7.3*2.9 inch 4 1926 15.75 20.75
Bakery Cupcake 4 160*160*75 mm | 6.3*6.3*2.9 inch 2 1926 20 25
Bakery Cupcake 4 Holder 160*160*75 mm | 6.3*6.3*2.9 inch 6 2029 19 26
Bakery Cupcake 6 235*160*75 mm | 9.2*6.3*2.9 inch 1 1926 15.75 20.75
Bakery Cupcake 6 Holder 235*160*75 mm | 9.2*6.3*2.9 inch 4 1926 18 23
Bakery Food Box 150*116*50 mm | 5.9*4.5*2 inch 2 1926 18 23
Bakery Fries 89*102 mm | 3.5*4 inch 4 1926 15.75 20.75
Bakery Fries 89*187 mm | 3.5*5 inch 4 1926 18 23
Bakery Macaron 10 185*115*50 mm | 4.6*2*7.3 inch 1 2029 18 28
Bakery Macaron 10 Inner 185*115*50 mm | 4.6*2*7.3 inch 2 2029 20 28
Bakery Macaron 10 Partition 185*115*50 mm | 4.6*2*7.3 inch 6 1926 18 23
Bakery Macaron 5 Sleeve 185*55*50 mm | 7.2*2.2*2 inch 4 1926 15.75 20.75
Bakery Macaron 5 Inner 185*55*50 mm | 7.2*2.2*2 inch 2 1926 18 23
Bakery Misc 83*69*102 mm | 3.25*2.7*4 inch IL 3 1926 13 25
Bakery Mithai Box 500gm 200*200*50 mm | 7.8*7.8*2 inch TB 1 2029 21 36
Bakery Pastry 100*120*60 mm | 4*4.7*2.4 inch 2 2029 19.5 23
Bakery Pastry Tray 100*120*60 mm | 4*4.7*2.4 inch 4 2029 18 23
Bakery Pastry 120*100*65 mm | 4.7*3.9*2.5 inch W 3.5*2.5 inch 4 2029 20 28
Bakery Pastry 127*127*89 mm | 5*5*3.5 inch 2 1926 18 23
Bakery Pastry 102*102*89 mm | 4*4*3.5 inch 2 1926 15.75 20.75
Bakery Pastry 171*127*89 mm | 6.75*5*3.5 inch 2 1926 18 25
Bakery Pizaa 104*104*27 mm | 4.1*4.1*1.5 inch | 15*28 4 2029 15 28
Bakery Pizaa 155*155*38 mm | 6*6*1.5 inch | 22*28 3 2029 22 28
Bakery Pizaa 175*175*38 mm | 6.9*6.9*1.5 inch | 22*30 3 2840 22 30
Bakery Pizaa 230*230*38 mm | 8.9*8.9*1.5 inch | 24*36 3 2840 24 36
Bakery Pizaa 254*254*38mm | 10*10*1.5 inch | 28*40 3 2840 28 40
Bakery Pizaa 307*307*38 mm | 12*12*1.5 inch | 16*32 1 2840 32 16
Bakery Pizza 310*310*38 mm | 12*12*1.5 inch | 30*16 1 2029 20 30
Bakery Pizza 260*260*38 mm | 10*10*1.5 inch | 26*14 1 1926 15 25
Bakery Pizza 186*186*38 mm | 7*7*1.5 inch | 22*22 2 1926 19.5 23
Bakery Sandwich 122*122*53 mm | 4.8*4.8*2.1 inch W 4.5*1 inch 3 1926 15 25
Bakery Sandwich 122*122*65 mm | 4.8*4.8*2.5 inch W 4.5*1.2 inch 3 1926 18 25
Bakery Sandwich 120*120*65 mm | 4.7*4.7*2.5 inch 2 2029 19 20
Bakery Sandwich 120*120*48 mm | 4.7*4.7*1.9 inch W 3.2*1.9 inch 4 2029 19 20
Bakery Wrap 64*210 mm | 2.5*8.25 inch 2 1926 12 23
`;

async function importData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("📡 Connected to MongoDB");

        console.log("🗑 Removing old products...");
        await Product.deleteMany({});
        console.log("✅ All old products deleted.");

        const lines = rawData.trim().split('\n');
        let count = 0;
        let wpIdCounter = 1772000000000;

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('Category')) continue;

            const parts = trimmedLine.split(/\s+/);
            const category = parts[0]; // Bakery

            // Refined SubCategory Grouping
            // We want to group like: Brownie, Cake Box, Carry Bag, Chocolate, etc.
            // We ignore numbers like "1", "2" or weights like "1Kg", "500g" for the CATEGORY name.

            let descriptiveParts = [];
            let specsStart = -1;
            for (let i = 1; i < parts.length; i++) {
                // If it looks like a dimension or a number isolated or weight
                if (parts[i].includes('*') || (parts[i].match(/^\d+/) && i > 1) || parts[i].match(/(Kg|gm|mm|inch)/i)) {
                    specsStart = i;
                    break;
                }
                descriptiveParts.push(parts[i]);
            }

            let subCategory = descriptiveParts.join(' ');
            // Consistency fixes
            if (subCategory.toUpperCase() === "PIZAA") subCategory = "Pizza";

            const remaining = parts.slice(specsStart).join(' ');

            // Dimension extraction for the NAME
            const mmMatch = remaining.match(/(\d+(\.\d+)?)\s*\*\s*(\d+(\.\d+)?)\s*\*\s*(\d+(\.\d+)?)\s*mm/i);
            const inchMatch = remaining.match(/(\d+(\.\d+)?)\s*\*\s*(\d+(\.\d+)?)\s*\*\s*(\d+(\.\d+)?)\s*inch/i);
            const fallbackMatch = remaining.match(/(\d+(\.\d+)?)\s*\*\s*(\d+(\.\d+)?)\s*\*\s*(\d+(\.\d+)?)/);

            let dims = { length: 8, width: 8, height: 4, unit: 'inch' };
            let sizeForName = "";

            if (mmMatch) {
                dims = { length: parseFloat(mmMatch[1]), width: parseFloat(mmMatch[3]), height: parseFloat(mmMatch[5]), unit: 'mm' };
                sizeForName = `${dims.length}x${dims.width}x${dims.height} mm`;
            } else if (inchMatch) {
                dims = { length: parseFloat(inchMatch[1]), width: parseFloat(inchMatch[3]), height: parseFloat(inchMatch[5]), unit: 'inch' };
                sizeForName = `${dims.length}x${dims.width}x${dims.height} inch`;
            } else if (fallbackMatch) {
                dims = { length: parseFloat(fallbackMatch[1]), width: parseFloat(fallbackMatch[3]), height: parseFloat(fallbackMatch[5]), unit: 'mm' };
                sizeForName = `${dims.length}x${dims.width}x${dims.height} mm`;
            }

            const currentWpId = wpIdCounter++;
            // Name includes the extra details stripped from category (like 1kg, etc)
            const detailText = parts.slice(descriptiveParts.length + 1, specsStart).join(' ');
            const cardName = `${subCategory} ${detailText} (${sizeForName || "Custom"})`.replace(/\s+/g, ' ').trim();

            const productData = {
                wpId: currentWpId,
                name: cardName,
                description: `Professional ${category} packaging for ${subCategory}. Built for durability. Specs: ${remaining}`,
                short_description: `${category} > ${subCategory}`,
                price: (Math.random() * 20 + 20).toFixed(0),
                minPrice: "20",
                maxPrice: "50",
                categories: [category, subCategory], // Categorized by GROUP name (e.g. "Cake Box")
                stock_status: "instock",
                images: ["https://boxfox.in/wp-content/uploads/2022/11/Mailer_Box_Mockup_1-copy-scaled.jpg"],
                dimensions: dims,
                specifications: [
                    { key: "Group", value: subCategory },
                    { key: "Size", value: sizeForName || "Custom" },
                    { key: "Details", value: remaining }
                ]
            };

            await Product.create(productData);
            count++;
        }

        // RE-INITIALIZE THE DEFAULT PRODUCT
        await Product.create({
            wpId: 1771670990303,
            name: "Classic Mailer Box (12x8x4 inch)",
            description: "Default sturdy mailer box for the Customize Lab.",
            categories: ["Bakery", "Mailer"],
            price: "15",
            minPrice: "15",
            maxPrice: "25",
            images: ["https://boxfox.in/wp-content/uploads/2022/11/Mailer_Box_Mockup_1-copy-scaled.jpg"],
            dimensions: { length: 12, width: 8, height: 4, unit: 'inch' }
        });

        console.log(`✅ Successfully imported ${count} new products with CLEAN categories.`);
        process.exit(0);
    } catch (err) {
        console.error("Critical Import Error:", err);
        process.exit(1);
    }
}

importData();
