"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Shield, Zap, Palette, Layers, Globe, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

const DESIGNS = [
    {
        name: "Azure Luxe",
        tag: "High-End Luxury",
        description: "A minimalist teal aesthetic with subtle gold accents, perfect for jewelry or premium accessories.",
        features: ["Reinforced Board", "Gold Stamping", "Magnetic Closure"],
        params: { category: "Hamper Box", subCategory: "Premium Hamper", l: 12, w: 10, h: 4, material: "SBS", finish: "Lamination Normal Matt", gsm: "350" },
        color: "bg-teal-500",
        accent: "text-teal-600",
        bg: "bg-teal-50",
        image: "/azure_luxe_box_1777627168409.png"
    },
    {
        name: "Artisan Bakery",
        tag: "Rustic Warmth",
        description: "Textured kraft paper with a modern structural design, ensuring pastries look as good as they taste.",
        features: ["Food-Grade", "Custom Ribbon Slot", "Grease-Resistant"],
        params: { category: "Cake Box", subCategory: "Artisan Cake Box", l: 8, w: 8, h: 5, material: "WhiteBack", finish: "Plain", gsm: "300" },
        color: "bg-orange-500",
        accent: "text-orange-600",
        bg: "bg-orange-50",
        image: "/artisan_bakery_box_1777627192878.png"
    },
    {
        name: "Midnight Exec",
        tag: "Corporate Power",
        description: "Sleek matte black finish with silver precision foil stamping for a professional statement.",
        features: ["Matte Finish", "Silver Accents", "Rigid Construction"],
        params: { category: "Hamper Box", subCategory: "Corporate Gift Box", l: 14, w: 10, h: 3, material: "SBS", finish: "Lamination Normal Matt", gsm: "400" },
        color: "bg-gray-950",
        accent: "text-gray-900",
        bg: "bg-gray-100",
        image: "/midnight_exec_box_1777627212619.png"
    },
    {
        name: "Vivid Trio",
        tag: "Joyful Celebration",
        description: "Vibrant patterns and a celebratory atmosphere, ideal for seasonal gifting and special events.",
        features: ["Vibrant Palette", "Glossy Finish", "Foldable Design"],
        params: { category: "Macaron", subCategory: "Luxury Macaron Box", l: 7, w: 2, h: 2, material: "SBS", finish: "Lamination Normal Gloss", gsm: "300" },
        color: "bg-pink-500",
        accent: "text-pink-600",
        bg: "bg-pink-50",
        image: "/vivid_trio_box_1777627232159.png"
    },
    {
        name: "Botanical Earth",
        tag: "Eco-Friendly",
        description: "Sustainable materials and elegant illustrations for a packaging solution that respects the planet.",
        features: ["Recyclable", "Soy-Based Inks", "Natural Twine"],
        params: { category: "Food Box", subCategory: "Eco Food Container", l: 6, w: 6, h: 3, material: "GreyBack", finish: "Varnish", gsm: "280" },
        color: "bg-emerald-600",
        accent: "text-emerald-700",
        bg: "bg-emerald-50",
        image: "/botanical_earth_box_1777627248807.png"
    },
    {
        name: "Emerald Perfume",
        tag: "Sensory Premium",
        description: "Deep velvet interior and a hyper-realistic premium finish for perfumes and cosmetics.",
        features: ["Velvet Lining", "Magnetic Lock", "Logo Embossing"],
        params: { category: "Gifting", subCategory: "Perfume Box", l: 5, w: 5, h: 3, material: "SBS", finish: "UV Crystal", gsm: "350" },
        color: "bg-emerald-900",
        accent: "text-emerald-950",
        bg: "bg-emerald-50",
        image: "/emerald_perfume_box_1777627271406.png"
    }
];

export default function PremiumDesigns() {
    const router = useRouter();

    const handleCustomize = (params) => {
        const query = new URLSearchParams({
            ...params,
            unit: 'in',
            autoQuote: 'true'
        }).toString();
        router.push(`/customize?${query}`);
    };

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-2 mb-4"
                        >
                            <span className="w-12 h-[2px] bg-emerald-500"></span>
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600">Premium Templates</span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-5xl md:text-7xl font-black text-gray-950 tracking-tighter leading-[0.9] mb-6"
                        >
                            ENGINEERED FOR <br />
                            <span className="text-emerald-500">EXCELLENCE.</span>
                        </motion.h2>
                        <p className="text-gray-500 font-medium text-lg leading-relaxed">
                            Select from our curated collection of industry-leading designs.
                            Each template is fully customizable to your brand's unique DNA.
                        </p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="flex gap-4"
                    >
                        <div className="px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">Avg. Turnaround</p>
                            <p className="text-xl font-black text-gray-950 text-center">7-10 Days</p>
                        </div>
                        <div className="px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 text-center">Material Quality</p>
                            <p className="text-xl font-black text-emerald-700 text-center">Premium+</p>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {DESIGNS.map((design, index) => (
                        <motion.div
                            key={design.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="group relative bg-white border border-gray-100 rounded-[2.5rem] p-6 transition-all hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-100 flex flex-col h-full"
                        >
                            {/* Image Preview */}
                            <div className="relative aspect-[4/3] rounded-[1.8rem] overflow-hidden mb-8 bg-gray-50 border border-gray-100">
                                <motion.img
                                    src={design.image}
                                    alt={design.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className={`absolute top-4 left-4 ${design.color} text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg`}>
                                    {design.tag}
                                </div>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-2xl font-black text-gray-950 tracking-tight">{design.name}</h3>
                                    <div className={`w-10 h-10 ${design.color} rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform`}>
                                        <Sparkles className="text-white" size={18} />
                                    </div>
                                </div>
                                <p className="text-gray-500 font-medium leading-relaxed text-sm mb-6">
                                    {design.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-8">
                                    {design.features.map(feature => (
                                        <span key={feature} className="px-3 py-1.5 bg-gray-50 text-gray-400 rounded-xl text-[8px] font-black uppercase tracking-widest border border-gray-100 group-hover:bg-white group-hover:border-emerald-100 group-hover:text-emerald-600 transition-colors">
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                            </div>



                            <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Star className="text-emerald-500 fill-emerald-500" size={20} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-20 pt-10 border-t border-gray-50 flex flex-wrap items-center justify-center gap-x-16 gap-y-8"
                >
                    {[
                        { icon: Shield, text: "Certified Quality" },
                        { icon: Zap, text: "Instant Quotation" },
                        { icon: Palette, text: "Unlimited Colors" },
                        { icon: Layers, text: "Rigid Construction" }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <item.icon className="text-gray-300" size={18} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{item.text}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
