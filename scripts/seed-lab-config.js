import 'dotenv/config';

const PAPER_RATES = {
  'SBS': { 'ITC': 85, 'Normal': 78 },
  'FBB': { 'ITC': 92, 'Normal': 84 },
  'Duplex': { 'LWC': 55, 'Normal': 48 },
  'Kraft': { 'High Burst': 42, 'Normal': 36 }
};

const PRINTING_TABLE = [
  { min: 0, max: 250, machines: { "1926": 600, "2029": 750, "2840": 900 } },
  { min: 251, max: 500, machines: { "1926": 750, "2029": 900, "2840": 1100 } },
  { min: 501, max: 1000, machines: { "1926": 1000, "2029": 1200, "2840": 1500 } },
  { min: 1001, max: 5000, machines: { "1926": 0, "2029": 0, "2840": 0 } }
];

const MACHINE_CONFIGS = {
  "1926": { plateCost: 450, wastage: 60, minCharge: 600 },
  "2029": { plateCost: 550, wastage: 80, minCharge: 750 },
  "2840": { plateCost: 650, wastage: 100, minCharge: 900 }
};

const MARKUP_TYPES = {
  'Retail': 0.16,
  'Corporate': 0.28,
  'Special': 0.12,
  'Wholesale': 0.08
};

const COLOUR_FACTORS = {
  'Plain': 0,
  'One Colour': 1,
  'Two Colour': 2,
  'Four Colour': 4,
  'Special Colour': 5
};

const PLATE_PRICE = {
  "1926": 450,
  "2029": 550,
  "2840": 650
};

const LAM_RATES = {
  'Plain': 0,
  'Lamination Thermal': 0.008,
  'Lamination Non-Thermal': 0.006,
  'UV Coating': 0.004,
  'Varnish': 0.003
};

const ADDON_OPTIONS = {
  'Plain': { type: 'none', rate: 0 },
  'Drip-Off': { type: 'coating', rate: 0.012 },
  'Spot UV': { type: 'coating', rate: 0.015 },
  'Metallic Leafing': { type: 'fixed', rate: 500 },
  'Carry Bag Single Pasting': { type: 'carry', rate: 5 },
  'Carry Bag Double Pasting': { type: 'carry', rate: 6 },
  'Gumming Full': { type: 'gumming', rate: 0.0125 },
  'Gumming Strip': { type: 'gumming', rate: 0.017 }
};

async function seedLabConfig() {
    const { default: dbConnect } = await import('../lib/mongodb.js');
    const { default: LabConfig } = await import('../models/LabConfig.js');
    
    await dbConnect();
    
    const configs = [
        { key: 'PAPER_RATES', value: PAPER_RATES, description: 'Paper rates per kg by material and brand' },
        { key: 'PRINTING_TABLE', value: PRINTING_TABLE, description: 'Base printing charges by sheet quantity and machine' },
        { key: 'MACHINE_CONFIGS', value: MACHINE_CONFIGS, description: 'Machine specific parameters (plate cost, wastage)' },
        { key: 'MARKUP_TYPES', value: MARKUP_TYPES, description: 'Profit margins for different sale types' },
        { key: 'COLOUR_FACTORS', value: COLOUR_FACTORS, description: 'Printing cost multipliers for colour counts' },
        { key: 'PLATE_PRICE', value: PLATE_PRICE, description: 'Base plate costs per machine' },
        { key: 'LAM_RATES', value: LAM_RATES, description: 'Lamination and coating rates per square inch' },
        { key: 'ADDON_OPTIONS', value: ADDON_OPTIONS, description: 'Special finishing and assembly options' }
    ];
    
    for (const config of configs) {
        await LabConfig.findOneAndUpdate(
            { key: config.key },
            config,
            { upsert: true, returnDocument: 'after' }
        );
    }
    
    console.log('Lab configurations seeded successfully.');
    process.exit(0);
}

seedLabConfig();
