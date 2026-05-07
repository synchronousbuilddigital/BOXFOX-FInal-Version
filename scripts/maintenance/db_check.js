import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://boxfox:boxfox@cluster0.7oansfw.mongodb.net/boxfox";

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected");
        const count = await mongoose.connection.db.collection('products').countDocuments();
        console.log(`Count: ${count}`);
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}
check();
