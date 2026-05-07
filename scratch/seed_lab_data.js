const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbConnect = require('../lib/mongodb').default || require('../lib/mongodb');
const LabHierarchy = require('../models/LabHierarchy').default || require('../models/LabHierarchy');
const LabSpecification = require('../models/LabSpecification').default || require('../models/LabSpecification');
const LabConfig = require('../models/LabConfig').default || require('../models/LabConfig');

// We need to read the specifications from the file
const fs = require('fs');
const specificationsPath = path.resolve(__dirname, '../lib/box-specifications.js');
const pricingPath = path.resolve(__dirname, '../lib/boxfoxPricing.js');

// Since they are ES modules, we might need a trick to read them in a CommonJS script
// Or we can just use regex to extract the arrays if they are simple enough.
// Actually, let's just use a simple regex for now or assume they are exported as CJS too?
// No, they are 'export const'.

async function seed() {
    try {
        await dbConnect();
        console.log('DB Connected. Starting seed...');

        // Import the data - using a dynamic import or reading the file
        // For simplicity, I'll just use the logic from the route but adapted for Node
        
        // Actually, let's just use the logic from the route but I need the data.
        // I'll read the file and eval it or parse it.
        
        const specContent = fs.readFileSync(specificationsPath, 'utf8');
        // Extract the array
        const match = specContent.match(/export const BOX_SPECIFICATIONS = (\[[\s\S]*?\]);/);
        if (!match) throw new Error("Could not find BOX_SPECIFICATIONS in file");
        const BOX_SPECIFICATIONS = eval(match[1]);

        const keepCategories = ["Bakery", "Bakery online", "Food"];
        const filteredSpecs = BOX_SPECIFICATIONS.filter(s => keepCategories.includes(s.category));

        console.log(`Filtered to ${filteredSpecs.length} specifications.`);

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

        // Ensure all required categories are present
        keepCategories.forEach(cat => {
            if (!hierarchiesMap[cat]) hierarchiesMap[cat] = new Set(["Custom"]);
        });

        const initialHierarchies = Object.keys(hierarchiesMap).map(cat => ({
            category: cat,
            subCategories: Array.from(hierarchiesMap[cat]),
            isActive: true
        }));

        console.log(`Clean up hierarchies and specifications...`);
        await LabHierarchy.deleteMany({});
        await LabSpecification.deleteMany({});
        
        console.log(`Inserting ${initialHierarchies.length} hierarchies...`);
        await LabHierarchy.insertMany(initialHierarchies);
        
        console.log(`Inserting specifications in chunks...`);
        const chunkSize = 500;
        for (let i = 0; i < filteredSpecs.length; i += chunkSize) {
            const chunk = filteredSpecs.slice(i, i + chunkSize).map(s => ({
                ...s,
                isActive: true
            }));
            await LabSpecification.insertMany(chunk);
            console.log(`Inserted chunk ${i / chunkSize + 1}`);
        }

        console.log('Seed completed successfully.');
    } catch (e) {
        console.error('Error during seed:', e);
    } finally {
        process.exit();
    }
}

seed();
