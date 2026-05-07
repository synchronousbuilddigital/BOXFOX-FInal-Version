import mongoose from "mongoose";
import dns from "dns";

// Fix for querySrv ECONNREFUSED on some networks
dns.setServers(['8.8.8.8', '8.8.4.4']);
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const MONGODB_URI = "mongodb+srv://boxfox:boxfox@cluster0.7oansfw.mongodb.net/boxfox";

async function verify() {
    await mongoose.connect(MONGODB_URI);
    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
        wpId: Number,
        type: String,
        parent_id: { type: Number, default: 0 }
    }));

    const countAll = await Product.countDocuments({});
    const countQuery = await Product.countDocuments({
        type: { $in: ["simple", "variable"] },
        parent_id: { $eq: 0 }
    });

    console.log(`Total Products: ${countAll}`);
    console.log(`Matching API Query: ${countQuery}`);

    if (countQuery > 0) {
        const first = await Product.findOne({ type: { $in: ["simple", "variable"] }, parent_id: 0 });
        console.log(`Sample valid product ID: ${first.wpId}`);
    }

    process.exit(0);
}

verify();
