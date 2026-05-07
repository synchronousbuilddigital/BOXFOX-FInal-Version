import 'dotenv/config';
import dbConnect from '../lib/mongodb.js';
import LabHierarchy from '../models/LabHierarchy.js';
import LabSpecification from '../models/LabSpecification.js';

async function check() {
    try {
        await dbConnect();
        const h = await LabHierarchy.find();
        const s = await LabSpecification.find();
        console.log('Hierarchies:', JSON.stringify(h, null, 2));
        console.log('Specifications count:', s.length);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
