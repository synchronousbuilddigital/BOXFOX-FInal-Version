import { NextResponse } from 'next/server';
import dbConnect from "@/lib/mongodb";
import B2BConfig from "@/models/B2BConfig";

export async function GET() {
    try {
        await dbConnect();

        let configs = await B2BConfig.find({ isActive: true });

        // Seed default options if none exist
        if (configs.length === 0) {
            const defaults = [
                // Box Types
                { category: 'boxTypes', value: 'mailers', label: 'Structural Mailers (3-Ply)' },
                { category: 'boxTypes', value: 'confectionary', label: 'Confectionary Lab (Food Grade)' },
                { category: 'boxTypes', value: 'pizza', label: 'Kinetic Pizza Nodes' },
                { category: 'boxTypes', value: 'luxury', label: 'Luxury Substrates (UV/Foil)' },
                { category: 'boxTypes', value: 'sustainable', label: 'Sustainable Mono-cartons' },

                // Printing
                { category: 'printingOptions', value: 'single', label: 'Single Color Print' },
                { category: 'printingOptions', value: 'multi', label: 'Multi-Color / CMYK' },
                { category: 'printingOptions', value: 'luxury', label: 'Luxury Foil / UV Embossed' },
                { category: 'printingOptions', value: 'none', label: 'No Print' },

                // Finishes
                { category: 'finishOptions', value: 'matte', label: 'Premium Matte' },
                { category: 'finishOptions', value: 'gloss', label: 'High Gloss' },
                { category: 'finishOptions', value: 'texture', label: 'Textured / Raw Paper' },
                { category: 'finishOptions', value: 'velvet', label: 'Soft-Touch Velvet' },

                // Sustainability
                { category: 'sustainabilityOptions', value: 'fsc', label: 'FSC Certified Paper' },
                { category: 'sustainabilityOptions', value: 'recycled', label: '100% Recycled Content' },
                { category: 'sustainabilityOptions', value: 'biodegradable', label: 'Biodegradable' },

                // Timelines
                { category: 'timelines', value: 'immediate', label: 'Immediate (Within 7 Days)' },
                { category: 'timelines', value: 'two-weeks', label: 'Within 2 Weeks' },
                { category: 'timelines', value: 'one-month', label: 'Within 1 Month' },
                { category: 'timelines', value: 'planning', label: 'Pre-Planning / R&D Phase' },
            ];
            await B2BConfig.insertMany(defaults);
            configs = await B2BConfig.find({ isActive: true });
        }

        // Group by category
        const grouped = configs.reduce((acc, curr) => {
            if (!acc[curr.category]) acc[curr.category] = [];
            acc[curr.category].push(curr);
            return acc;
        }, {});

        return NextResponse.json(grouped);
    } catch (error) {
        console.error("B2B Config Error:", error);
        return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
    }
}
