const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbConnect = require('../lib/mongodb').default || require('../lib/mongodb');
const LabHierarchy = require('../models/LabHierarchy').default || require('../models/LabHierarchy');
const LabSpecification = require('../models/LabSpecification').default || require('../models/LabSpecification');

async function cleanup() {
    try {
        await dbConnect();
        
        const keepCategories = ["Bakery", "Bakery online", "Food"];
        
        console.log(`Deleting all hierarchies except: ${keepCategories.join(', ')}`);
        const hResult = await LabHierarchy.deleteMany({ category: { $nin: keepCategories } });
        console.log(`Deleted ${hResult.deletedCount} hierarchies.`);
        
        console.log(`Deleting all specifications except in: ${keepCategories.join(', ')}`);
        const sResult = await LabSpecification.deleteMany({ category: { $nin: keepCategories } });
        console.log(`Deleted ${sResult.deletedCount} specifications.`);
        
        // Ensure the 3 categories exist
        for (const cat of keepCategories) {
            const exists = await LabHierarchy.findOne({ category: cat });
            if (!exists) {
                console.log(`Creating missing category: ${cat}`);
                await LabHierarchy.create({ category: cat, subCategories: ["Custom"], isActive: true });
            }
        }

        console.log('Cleanup completed.');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit();
    }
}

cleanup();
