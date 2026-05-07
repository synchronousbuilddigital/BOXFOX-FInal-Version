const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbConnect = require('../lib/mongodb').default || require('../lib/mongodb');
const LabHierarchy = require('../models/LabHierarchy').default || require('../models/LabHierarchy');
const LabSpecification = require('../models/LabSpecification').default || require('../models/LabSpecification');

async function checkData() {
    try {
        await dbConnect();
        const hCount = await LabHierarchy.countDocuments({});
        const sCount = await LabSpecification.countDocuments({});
        console.log(`Hierarchies: ${hCount}`);
        console.log(`Specifications: ${sCount}`);
        
        if (hCount > 0) {
            const firstH = await LabHierarchy.findOne({});
            console.log('First Hierarchy:', JSON.stringify(firstH, null, 2));
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit();
    }
}

checkData();
