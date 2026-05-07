import { NextResponse } from 'next/server';
import dbConnect from "@/lib/mongodb";
import LabHierarchy from "@/models/LabHierarchy";
import LabSpecification from "@/models/LabSpecification";
import LabConfig from "@/models/LabConfig";
import { BOX_SPECIFICATIONS } from "@/lib/box-specifications";
import { MATERIAL_RATES, MARKUP_TYPES, LAM_RATES } from "@/lib/boxfoxPricing";

export async function POST(req) {
    try {
        await dbConnect();
        
        // 1. Extract Hierarchies from BOX_SPECIFICATIONS
        const keepCategories = ["Bakery", "Bakery online", "Food"];
        const filteredSpecs = BOX_SPECIFICATIONS.filter(s => keepCategories.includes(s.category));

        const hierarchiesMap = {};
        filteredSpecs.forEach(s => {
            if (!s.category) return;
            if (!hierarchiesMap[s.category]) {
                hierarchiesMap[s.category] = new Set();
            }
            if (s.subCategory) {
                hierarchiesMap[s.category].add(s.subCategory);
            }
        });

        // Ensure all required categories are present even if no specs found
        keepCategories.forEach(cat => {
            if (!hierarchiesMap[cat]) hierarchiesMap[cat] = new Set(["Custom"]);
        });

        const initialHierarchies = Object.keys(hierarchiesMap).map(cat => ({
            category: cat,
            subCategories: Array.from(hierarchiesMap[cat]),
            isActive: true
        }));

        // 2. Clean up and Insert
        await LabHierarchy.deleteMany({});
        await LabSpecification.deleteMany({});
        
        await LabHierarchy.insertMany(initialHierarchies);
        
        // Insert specifications in chunks
        const chunkSize = 1000;
        for (let i = 0; i < filteredSpecs.length; i += chunkSize) {
            const chunk = filteredSpecs.slice(i, i + chunkSize).map(s => ({
                ...s,
                isActive: true
            }));
            await LabSpecification.insertMany(chunk);
        }

        // 3. Seed Pricing Configs if they don't exist
        const defaultConfigs = [
            { key: 'PAPER_RATES', value: MATERIAL_RATES },
            { key: 'MARKUP_TYPES', value: MARKUP_TYPES },
            { key: 'LAM_RATES', value: LAM_RATES },
            { 
                key: 'MACHINE_CONFIGS', 
                value: {
                    '1926': { plateCost: 250, wastage: 80, minCharge: 300 },
                    '2029': { plateCost: 275, wastage: 80, minCharge: 750 },
                    '2840': { plateCost: 650, wastage: 80, minCharge: 0 }
                }
            }
        ];

        for (const config of defaultConfigs) {
            await LabConfig.findOneAndUpdate(
                { key: config.key },
                { value: config.value },
                { upsert: true }
            );
        }
        
        return NextResponse.json({ 
            success: true, 
            message: `Lab data seeded successfully. ${BOX_SPECIFICATIONS.length} specifications and ${initialHierarchies.length} industries registered.` 
        });
    } catch (error) {
        console.error("Seed Error:", error);
        return NextResponse.json({ error: "Failed to seed lab data: " + error.message }, { status: 500 });
    }
}
