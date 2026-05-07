import dotenv from "dotenv";
dotenv.config();
import dbConnect from "./lib/mongodb.js";
import Product from "./models/Product.js";

async function checkProducts() {
    await dbConnect();
    const products = await Product.find({}).limit(5);
    console.log("Found products:", JSON.stringify(products.map(p => ({ wpId: p.wpId, name: p.name, _id: p._id })), null, 2));
    process.exit(0);
}

checkProducts();
