import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function listPizzaBoxes() {
    try {
        const { default: dbConnect } = await import('../lib/mongodb.js');
        const { default: Product } = await import('../models/Product.js');
        
        await dbConnect();
        console.log("Connected to DB");
        
        // Find all products that might be pizza boxes
        const pizzaBoxes = await Product.find({
            $or: [
                { name: /PIZZA BOX/i },
                { name: /\d+X\d+X\d+/i },
                { name: /\[\d+X\d+X\d+\]/i }
            ]
        }).lean();

        console.log("Found", pizzaBoxes.length, "potential pizza boxes:");
        pizzaBoxes.forEach(p => {
            console.log(`ID: ${p._id}, Name: ${p.name}, Active: ${p.isActive}`);
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

listPizzaBoxes();
