import 'dotenv/config';
import dbConnect from '../lib/mongodb.js';
import LabHierarchy from '../models/LabHierarchy.js';
import LabSpecification from '../models/LabSpecification.js';

const BAKERY_SUBS = [
    "Cake Box", "Cupcake Cake Box", "Pastery", "Macaron", "Chocolate", 
    "Macaron and Brownie", "Cupcake", "Cupcake and Bento", "Brownie", 
    "Tall Box", "Cakesicles", "Carry Bag", "Chocolate 12", "Macaron 10", "Pastry"
];

const FOOD_SUBS = [
    "Pizza Box", "Burger Box", "Hamper Box", "Wrap", "Dry Fruit", 
    "South Indian", "Pizza", "Meal Box", "Dates", "Coffee", 
    "Sugar Drop", "Roll", "Colour"
];

async function cleanup() {
    try {
        await dbConnect();
        console.log('Connected to MongoDB');

        // 1. Clean Hierarchies
        await LabHierarchy.deleteMany({});
        await LabHierarchy.create([
            { category: 'Bakery', subCategories: BAKERY_SUBS, isActive: true },
            { category: 'Food', subCategories: FOOD_SUBS, isActive: true }
        ]);
        console.log('Hierarchies cleaned and reset');

        // 2. Clean Specifications (remove any that don't match our new subs)
        // Actually, I'll just update the category/subCategory of existing ones if they match case-insensitively, 
        // and delete those that are truly orphaned.
        
        const allSpecs = await LabSpecification.find({});
        for (const spec of allSpecs) {
            const bakeryMatch = BAKERY_SUBS.find(s => s.toLowerCase() === spec.subCategory.toLowerCase());
            if (bakeryMatch) {
                spec.category = 'Bakery';
                spec.subCategory = bakeryMatch;
                await spec.save();
                continue;
            }
            const foodMatch = FOOD_SUBS.find(s => s.toLowerCase() === spec.subCategory.toLowerCase());
            if (foodMatch) {
                spec.category = 'Food';
                spec.subCategory = foodMatch;
                await spec.save();
                continue;
            }
            // If no match, maybe it's an old category we want to keep? 
            // The user only asked for Food and Bakery.
            // I'll keep them for now but mark them as inactive if they are not Food or Bakery.
            if (spec.category !== 'Food' && spec.category !== 'Bakery') {
                spec.isActive = false;
                await spec.save();
            }
        }
        console.log('Specifications synchronized');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

cleanup();
