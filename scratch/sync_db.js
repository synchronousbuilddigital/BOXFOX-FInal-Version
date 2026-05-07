const mongoose = require('mongoose');
const fs = require('fs');

const MONGODB_URI = 'mongodb+srv://boxfox:boxfox@cluster0.7oansfw.mongodb.net/test';
const dataPath = 'i:/BoxFox/boxfox-store/BoxFox_price_analyses-/dashboard/public/data.json';

const LabHierarchySchema = new mongoose.Schema({
    category: { type: String, required: true, unique: true },
    subCategories: [{ type: String }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const LabSpecificationSchema = new mongoose.Schema({
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    spec: { type: String, required: true },
    l: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true },
    unit: { type: String, enum: ['mm', 'in'], default: 'mm' },
    ups: { type: Number },
    machine: { type: String },
    sheetW: { type: Number },
    sheetH: { type: Number },
    designing: { type: Number },
    pasting: { type: Number },
    dieRate: { type: Number },
    window: { type: Number },
    leafing: { type: Number },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const LabHierarchy = mongoose.models.LabHierarchy || mongoose.model('LabHierarchy', LabHierarchySchema);
const LabSpecification = mongoose.models.LabSpecification || mongoose.model('LabSpecification', LabSpecificationSchema);

async function sync() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected.");

        const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const categoriesData = rawData.categories;

        const hierarchies = [];
        const specifications = [];

        for (const [catName, subCats] of Object.entries(categoriesData)) {
            const subCatList = Object.keys(subCats);
            hierarchies.push({
                category: catName,
                subCategories: subCatList,
                isActive: true
            });

            for (const [subCatName, subCatData] of Object.entries(subCats)) {
                if (!subCatData.specs) continue;
                
                for (const [specName, specData] of Object.entries(subCatData.specs)) {
                    let l = 0, w = 0, h = 0, unit = "mm";
                    
                    const mmMatch = specName.match(/(\d+\.?\d*)\*(\d+\.?\d*)\*(\d+\.?\d*)\s*mm/i);
                    const inMatch = specName.match(/(\d+\.?\d*)\*(\d+\.?\d*)\*(\d+\.?\d*)\s*inch/i);
                    
                    if (mmMatch) {
                        l = parseFloat(mmMatch[1]);
                        w = parseFloat(mmMatch[2]);
                        h = parseFloat(mmMatch[3]);
                        unit = "mm";
                    } else if (inMatch) {
                        l = parseFloat(inMatch[1]);
                        w = parseFloat(inMatch[2]);
                        h = parseFloat(inMatch[3]);
                        unit = "in";
                    } else {
                        const parts = specName.split(/[^\d.]+/).filter(p => p.length > 0);
                        if (parts.length >= 3) {
                            l = parseFloat(parts[0]);
                            w = parseFloat(parts[1]);
                            h = parseFloat(parts[2]);
                        }
                    }

                    specifications.push({
                        category: catName,
                        subCategory: subCatName,
                        spec: specName,
                        ups: specData.ups,
                        machine: specData.machine,
                        sheetW: specData.sheet_w,
                        sheetH: specData.sheet_h,
                        l, w, h,
                        unit,
                        designing: specData.designing || 100,
                        pasting: specData.pasting || 0,
                        window: specData.window || 0,
                        leafing: specData.leafing || 0,
                        dieRate: 0,
                        isActive: true
                    });
                }
            }
        }

        console.log(`Clearing existing data...`);
        await LabHierarchy.deleteMany({});
        await LabSpecification.deleteMany({});

        console.log(`Inserting ${hierarchies.length} hierarchies...`);
        await LabHierarchy.insertMany(hierarchies);

        console.log(`Inserting ${specifications.length} specifications...`);
        // Use chunks for large inserts
        const chunkSize = 500;
        for (let i = 0; i < specifications.length; i += chunkSize) {
            const chunk = specifications.slice(i, i + chunkSize);
            await LabSpecification.insertMany(chunk);
            console.log(`Inserted ${i + chunk.length} / ${specifications.length}`);
        }

        console.log("Sync complete!");
        process.exit(0);
    } catch (err) {
        console.error("Sync failed:", err);
        process.exit(1);
    }
}

sync();
