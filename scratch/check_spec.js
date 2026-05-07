const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbConnect = require('../lib/mongodb').default || require('../lib/mongodb');
const LabSpecification = require('../models/LabSpecification').default || require('../models/LabSpecification');

async function checkSpec() {
    try {
        await dbConnect();
        const spec = await LabSpecification.findOne({});
        console.log('First Spec:', JSON.stringify(spec, null, 2));
    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit();
    }
}

checkSpec();
