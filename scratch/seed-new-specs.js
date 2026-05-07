import 'dotenv/config';
import dbConnect from '../lib/mongodb.js';
import LabSpecification from '../models/LabSpecification.js';
import LabHierarchy from '../models/LabHierarchy.js';

const BAKERY_SPECS = [
    { subCategory: 'Cake Box', spec: '10x10x5 Inch | Standard Cake', l: 10, w: 10, h: 5, unit: 'in' },
    { subCategory: 'Cake Box', spec: '12x12x5 Inch | Large Cake', l: 12, w: 12, h: 5, unit: 'in' },
    { subCategory: 'Cupcake Cake Box', spec: '6x6x3 Inch | Single Cupcake', l: 6, w: 6, h: 3, unit: 'in' },
    { subCategory: 'Pastery', spec: '6x4x2 Inch | Pastry Box', l: 6, w: 4, h: 2, unit: 'in' },
    { subCategory: 'Pastry', spec: '6x4x2 Inch | Pastry Box', l: 6, w: 4, h: 2, unit: 'in' },
    { subCategory: 'Macaron', spec: '8x2x2 Inch | Macaron Sleeve', l: 8, w: 2, h: 2, unit: 'in' },
    { subCategory: 'Chocolate', spec: '6x6x1 Inch | Chocolate Box', l: 6, w: 6, h: 1, unit: 'in' },
    { subCategory: 'Macaron and Brownie', spec: '8x4x2 Inch | Combo Box', l: 8, w: 4, h: 2, unit: 'in' },
    { subCategory: 'Cupcake', spec: '4x4x3 Inch | Single Cupcake', l: 4, w: 4, h: 3, unit: 'in' },
    { subCategory: 'Cupcake and Bento', spec: '8x6x4 Inch | Bento Combo', l: 8, w: 6, h: 4, unit: 'in' },
    { subCategory: 'Brownie', spec: '6x6x2 Inch | Brownie Box', l: 6, w: 6, h: 2, unit: 'in' },
    { subCategory: 'Tall Box', spec: '8x8x10 Inch | Tiered Cake', l: 8, w: 8, h: 10, unit: 'in' },
    { subCategory: 'Cakesicles', spec: '6x4x1 Inch | Cakesicle Box', l: 6, w: 4, h: 1, unit: 'in' },
    { subCategory: 'Carry Bag', spec: '10x12x4 Inch | Bakery Carry Bag', l: 10, w: 12, h: 4, unit: 'in' },
    { subCategory: 'Chocolate 12', spec: '8x6x1 Inch | 12pc Chocolate', l: 8, w: 6, h: 1, unit: 'in' },
    { subCategory: 'Macaron 10', spec: '10x2x2 Inch | 10pc Macaron', l: 10, w: 2, h: 2, unit: 'in' }
];

const FOOD_SPECS = [
    { subCategory: 'Pizza Box', spec: '10x10x1.5 Inch | Regular Pizza', l: 10, w: 10, h: 1.5, unit: 'in' },
    { subCategory: 'Pizza Box', spec: '12x12x1.5 Inch | Large Pizza', l: 12, w: 12, h: 1.5, unit: 'in' },
    { subCategory: 'Burger Box', spec: '4x4x3 Inch | Standard Burger', l: 4, w: 4, h: 3, unit: 'in' },
    { subCategory: 'Hamper Box', spec: '12x10x4 Inch | Food Hamper', l: 12, w: 10, h: 4, unit: 'in' },
    { subCategory: 'Wrap', spec: '8x2x2 Inch | Wrap Sleeve', l: 8, w: 2, h: 2, unit: 'in' },
    { subCategory: 'Dry Fruit', spec: '8x8x2 Inch | Dry Fruit Box', l: 8, w: 8, h: 2, unit: 'in' },
    { subCategory: 'South Indian', spec: '10x8x3 Inch | Thali Box', l: 10, w: 8, h: 3, unit: 'in' },
    { subCategory: 'Pizza', spec: '8x8x1.5 Inch | Small Pizza', l: 8, w: 8, h: 1.5, unit: 'in' },
    { subCategory: 'Meal Box', spec: '8x6x2 Inch | Standard Meal', l: 8, w: 6, h: 2, unit: 'in' },
    { subCategory: 'Dates', spec: '6x4x1.5 Inch | Dates Box', l: 6, w: 4, h: 1.5, unit: 'in' },
    { subCategory: 'Coffee', spec: '4x4x4 Inch | Coffee Cup Holder', l: 4, w: 4, h: 4, unit: 'in' },
    { subCategory: 'Sugar Drop', spec: '4x4x1 Inch | Sugar Drop Box', l: 4, w: 4, h: 1, unit: 'in' },
    { subCategory: 'Roll', spec: '8x2x2 Inch | Roll Sleeve', l: 8, w: 2, h: 2, unit: 'in' },
    { subCategory: 'Colour', spec: '6x6x2 Inch | Multi-purpose', l: 6, w: 6, h: 2, unit: 'in' }
];

async function seed() {
    try {
        await dbConnect();
        console.log('Connected to MongoDB');

        // Update Hierarchies first to ensure subCategories are correct
        const bakerySubs = [...new Set(BAKERY_SPECS.map(s => s.subCategory))];
        const foodSubs = [...new Set(FOOD_SPECS.map(s => s.subCategory))];

        await LabHierarchy.findOneAndUpdate(
            { category: 'Bakery' },
            { subCategories: bakerySubs },
            { upsert: true }
        );
        await LabHierarchy.findOneAndUpdate(
            { category: 'Food' },
            { subCategories: foodSubs },
            { upsert: true }
        );
        console.log('Hierarchies updated');

        // Add Specifications
        const allSpecs = [
            ...BAKERY_SPECS.map(s => ({ ...s, category: 'Bakery' })),
            ...FOOD_SPECS.map(s => ({ ...s, category: 'Food' }))
        ];

        for (const spec of allSpecs) {
            await LabSpecification.findOneAndUpdate(
                { category: spec.category, subCategory: spec.subCategory, spec: spec.spec },
                {
                    ...spec,
                    ups: 1,
                    machine: '2029',
                    sheetW: 20,
                    sheetH: 29,
                    isActive: true
                },
                { upsert: true }
            );
        }

        console.log(`Seeded ${allSpecs.length} specifications`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
