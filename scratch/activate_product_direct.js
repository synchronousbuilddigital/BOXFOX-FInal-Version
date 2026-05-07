const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db('test');
    const products = database.collection('products');
    
    // Activate the default product
    const result = await products.updateOne(
      { wpId: 1771670990303 },
      { $set: { isActive: true } }
    );
    console.log('Activation Result:', result);
    
    // Check for 69f457071b34237dcb24f252 which was 404
    const p69 = await products.findOne({ _id: require('mongodb').ObjectId('69f457071b34237dcb24f252') });
    console.log('Product 69f... status:', p69 ? { name: p69.name, isActive: p69.isActive } : 'Not Found');
    
    if (p69 && !p69.isActive) {
        await products.updateOne({ _id: p69._id }, { $set: { isActive: true } });
        console.log('Activated product 69f...');
    }

  } finally {
    await client.close();
  }
}
run().catch(console.dir);
