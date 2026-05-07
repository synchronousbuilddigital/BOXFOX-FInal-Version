const mongoose = require('mongoose');

async function checkOrder() {
    await mongoose.connect('mongodb://127.0.0.1:27017/boxfox');
    const Order = require('./models/Order').default || require('./models/Order');
    const order = await Order.findOne({ orderId: 'ORD-1002' }).lean();
    console.log(JSON.stringify(order, null, 2));
    process.exit(0);
}
checkOrder().catch(console.error);
