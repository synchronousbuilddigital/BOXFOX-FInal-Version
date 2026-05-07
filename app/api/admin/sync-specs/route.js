import { NextResponse } from 'next/server';
import dbConnect from "@/lib/mongodb";
import LabHierarchy from "@/models/LabHierarchy";
import LabSpecification from "@/models/LabSpecification";
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        console.log("Starting Database Sync...");
        await dbConnect();

        // Path to the source of truth
        const dataPath = 'i:/BoxFox/boxfox-store/BoxFox_price_analyses-/dashboard/public/data.json';
        
        if (!fs.existsSync(dataPath)) {
            return NextResponse.json({ error: "Source data.json not found at " + dataPath }, { status: 404 });
        }

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
        // Bulk insert
        await LabSpecification.insertMany(specifications);

        console.log("Sync complete!");
        return NextResponse.json({ 
            success: true, 
            message: "Database synced successfully",
            hierarchies: hierarchies.length,
            specifications: specifications.length
        });

    } catch (error) {
        console.error("Sync failed:", error);
        return NextResponse.json({ error: "Sync failed: " + error.message }, { status: 500 });
    }
}
