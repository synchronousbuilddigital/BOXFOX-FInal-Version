const seeds = [
    // Materials
    { category: 'material', label: 'SBS (Solid Bleached Sulfate)', value: 'SBS' },
    { category: 'material', label: 'FBB (Folding Box Board)', value: 'FBB' },
    { category: 'material', label: 'Duplex Board', value: 'Duplex' },
    { category: 'material', label: 'Kraft Board', value: 'Kraft' },

    // Brands
    { category: 'brand', label: 'ITC', value: 'ITC' },
    { category: 'brand', label: 'Century', value: 'Century' },
    { category: 'brand', label: 'Emami', value: 'Emami' },
    { category: 'brand', label: 'Khanna', value: 'Khanna' },

    // GSM
    { category: 'gsm', label: '280 GSM', value: '280' },
    { category: 'gsm', label: '300 GSM', value: '300' },
    { category: 'gsm', label: '350 GSM', value: '350' },
    { category: 'gsm', label: '400 GSM', value: '400' },

    // Print
    { category: 'printColours', label: 'Four Colour (CMYK)', value: 'Four Colour' },
    { category: 'printColours', label: 'Special Colour (Pantone)', value: 'Special Colour' },
    { category: 'printColours', label: 'Six Colour', value: 'Six Colour' },

    // Lamination
    { category: 'lamination', label: 'Plain (No Lamination)', value: 'Plain' },
    { category: 'lamination', label: 'Gloss Lamination', value: 'Gloss' },
    { category: 'lamination', label: 'Matt Lamination', value: 'Matt' },
    { category: 'lamination', label: 'Soft Touch Lamination', value: 'Soft Touch' },
    { category: 'lamination', label: 'Velvet Lamination', value: 'Velvet' }
];

async function seed() {
    const API_URL = "http://localhost:3000/api/admin/b2b/config";
    console.log("Starting seeding via API...");

    for (const item of seeds) {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });
            if (res.ok) {
                console.log(`Seeded: ${item.label}`);
            } else {
                console.log(`Failed: ${item.label} (${res.status})`);
            }
        } catch (err) {
            console.log(`Error seeding ${item.label}: ${err.message}`);
        }
    }
    console.log("API Seeding complete!");
}

seed();
