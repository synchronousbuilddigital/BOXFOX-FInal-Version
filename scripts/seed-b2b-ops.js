const mongoose = require('mongoose');

// Define Schema (matching models/B2BConfig.js)
const B2BConfigSchema = new mongoose.Schema({
    category: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: String, required: true },
}, { timestamps: true });

const B2BConfig = mongoose.models.B2BConfig || mongoose.model('B2BConfig', B2BConfigSchema);

async function seed() {
    const MONGODB_URI = "mongodb+srv://boxfox:boxfox@cluster0.7oansfw.mongodb.net/test";
    
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        const seeds = [
            // Materials
            { category: 'material', label: 'SBS (Solid Bleached Sulfate)', value: 'SBS' },
            { category: 'material', label: 'FBB (Folding Box Board)', value: 'FBB' },
            { category: 'material', label: 'Duplex Board', value: 'Duplex' },
            { category: 'material', label: 'Kraft Board', value: 'Kraft' },

            // Brands
            { category: 'brand', label: 'ITC', value: 'ITC' },
            { category: 'brand', label: 'Century', value: 'Century' },
            { category: 'brand', label: 'Emami', value: 'Emami' },
            { category: 'brand', label: 'Khanna', value: 'Khanna' },

            // GSM
            { category: 'gsm', label: '280 GSM', value: '280' },
            { category: 'gsm', label: '300 GSM', value: '300' },
            { category: 'gsm', label: '350 GSM', value: '350' },
            { category: 'gsm', label: '400 GSM', value: '400' },

            // Print
            { category: 'printColours', label: 'Four Colour (CMYK)', value: 'Four Colour' },
            { category: 'printColours', label: 'Special Colour (Pantone)', value: 'Special Colour' },
            { category: 'printColours', label: 'Six Colour', value: 'Six Colour' },

            // Lamination
            { category: 'lamination', label: 'Plain (No Lamination)', value: 'Plain' },
            { category: 'lamination', label: 'Gloss Lamination', value: 'Gloss' },
            { category: 'lamination', label: 'Matt Lamination', value: 'Matt' },
            { category: 'lamination', label: 'Soft Touch Lamination', value: 'Soft Touch' },
            { category: 'lamination', label: 'Velvet Lamination', value: 'Velvet' }
        ];

        // Clear existing to avoid duplicates if desired, or just insert
        // await B2BConfig.deleteMany({}); 
        
        for (const item of seeds) {
            const exists = await B2BConfig.findOne({ category: item.category, value: item.value });
            if (!exists) {
                await B2BConfig.create(item);
                console.log(`Seeded: ${item.label}`);
            } else {
                console.log(`Skipped (exists): ${item.label}`);
            }
        }

        console.log("Seeding complete!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}

seed();
