const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
if (dns.setDefaultResultOrder) dns.setDefaultResultOrder('ipv4first');
const mongoose = require('mongoose');

const URI = 'mongodb+srv://boxfox:boxfox@cluster0.7oansfw.mongodb.net/boxfox';

mongoose.connect(URI).then(async () => {
    const db = mongoose.connection.db;

    // Check raw document
    const sample = await db.collection('products').findOne();
    console.log('RAW SAMPLE:');
    console.log('  name:', sample?.name);
    console.log('  type:', sample?.type, '(typeof:', typeof sample?.type, ')');
    console.log('  parent_id:', sample?.parent_id, '(typeof:', typeof sample?.parent_id, ')');
    console.log('  categories:', sample?.categories);
    console.log('  stock_status:', sample?.stock_status);

    // Try the exact query the API uses
    const query = { type: { $in: ['simple', 'variable'] }, parent_id: { $eq: 0 } };
    const matchCount = await db.collection('products').countDocuments(query);
    console.log('\nAPI query match count:', matchCount);

    // Try without parent_id filter
    const noParent = await db.collection('products').countDocuments({ type: { $in: ['simple', 'variable'] } });
    console.log('Without parent_id filter:', noParent);

    // Try without type filter
    const noType = await db.collection('products').countDocuments({ parent_id: { $eq: 0 } });
    console.log('Without type filter:', noType);

    process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
