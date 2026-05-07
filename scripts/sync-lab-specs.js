import 'dotenv/config';
import mongoose from 'mongoose';
import { BOX_SPECIFICATIONS } from '../lib/box-specifications.js';
import dbConnect from '../lib/mongodb.js';
import LabSpecification from '../models/LabSpecification.js';
import LabHierarchy from '../models/LabHierarchy.js';

async function syncLabSpecs() {
    try {
        await dbConnect();
        console.log('Connected to MongoDB.');

        // 1. Sync Specifications
        console.log('Syncing Specifications...');
        for (const specData of BOX_SPECIFICATIONS) {
            await LabSpecification.findOneAndUpdate(
                { 
                    category: specData.category, 
                    subCategory: specData.subCategory,
                    spec: specData.spec 
                },
                { ...specData, isActive: true },
                { upsert: true, new: true }
            );
        }
        console.log(`Synced ${BOX_SPECIFICATIONS.length} specifications.`);

        // 2. Sync Hierarchies
        console.log('Syncing Hierarchies...');
        const hierarchies = {};
        
        BOX_SPECIFICATIONS.forEach(spec => {
            if (!hierarchies[spec.category]) {
                hierarchies[spec.category] = new Set();
            }
            hierarchies[spec.category].add(spec.subCategory);
        });

        for (const [category, subCatsSet] of Object.entries(hierarchies)) {
            const subCategories = Array.from(subCatsSet).sort();
            await LabHierarchy.findOneAndUpdate(
                { category },
                { subCategories, isActive: true },
                { upsert: true, new: true }
            );
            console.log(`Updated hierarchy for category: ${category} with ${subCategories.length} sub-categories.`);
        }

        console.log('Sync complete!');
        process.exit(0);
    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
}

syncLabSpecs();
