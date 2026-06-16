"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Briefcase, MapPin, Search, Star, Layers, Calendar, 
    User, Mail, ArrowUpRight, Sparkles, AlertCircle 
} from "lucide-react";
import Navbar from "../components/Navbar";

export default function PublicVendorsDirectory() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    const categories = ["All", "Packaging", "Printing", "Logistics", "Gifts"];

    const loadVendors = async () => {
        try {
            const res = await fetch("/api/vendors");
            const data = await res.json();
            setVendors(data.vendors || []);
        } catch (err) {
            console.error("Failed to load public vendors:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVendors();
    }, []);

    // Categorization labeling mapping
    const getCategoryLabel = (cat) => {
        if (cat === "Packaging") return "Box Manufacturing";
        if (cat === "Printing") return "Printing & Branding";
        if (cat === "Logistics") return "Logistics & Supply";
        if (cat === "Gifts") return "Gift Sourcing";
        return cat;
    };

    const filteredVendors = vendors.filter(v => {
        const matchesSearch = 
            (v.businessName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (v.vendorCity || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (v.vendorState || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (v.vendorCategory || "").toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory = 
            activeCategory === "All" || 
            (v.vendorCategory || "").toLowerCase() === activeCategory.toLowerCase();

        return matchesSearch && matchesCategory;
    });

    if (loading) return (
        <div className="min-h-screen bg-[#080d14] flex items-center justify-center text-white/30 font-black uppercase tracking-widest italic">
            Connecting Partner Network...
        </div>
    );

    return (
        <div className="min-h-screen bg-[#080d14] text-white selection:bg-emerald-500/30 pb-32">
            <Navbar />
            
            {/* Banner/Header */}
            <div className="relative overflow-hidden pt-40 pb-20 border-b border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.08),transparent_50%)]"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -translate-y-24 translate-x-24"></div>
                
                <div className="max-w-[1400px] mx-auto px-6 relative z-10 text-center space-y-6">
                    <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.5em] italic">
                        Verified Supply Chain
                    </p>
                    <h1 className="text-6xl lg:text-8xl font-black uppercase tracking-tighter italic leading-none">
                        BoxFox <br className="md:hidden" /><span className="text-emerald-500">Partner</span> Network
                    </h1>
                    <p className="max-w-2xl mx-auto text-white/50 text-xs font-semibold uppercase tracking-wider leading-relaxed">
                        Our vetted ecosystem of certified manufacturers, packaging houses, logistics specialists, and custom branding partners supporting global corporate gifting projects.
                    </p>
                </div>
            </div>

            {/* Filter & Search Bar Controls */}
            <div className="max-w-[1400px] mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white/5 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-xl mb-16">
                    
                    {/* Categories Tab Selector */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                    activeCategory === cat 
                                        ? "bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/10" 
                                        : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                                }`}
                            >
                                {getCategoryLabel(cat)}
                            </button>
                        ))}
                    </div>

                    {/* Search Input Field */}
                    <div className="relative w-full lg:max-w-md">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by company name, city, state..."
                            className="w-full pl-14 pr-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 text-xs font-bold uppercase tracking-wider text-white"
                        />
                    </div>

                </div>

                {/* Directory Grid */}
                <AnimatePresence mode="popLayout">
                    <motion.div 
                        layout 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {filteredVendors.map((vendor, index) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                key={vendor._id}
                                className="bg-white/5 border border-white/10 rounded-[3rem] p-8 lg:p-10 hover:bg-white/[0.07] transition-all flex flex-col justify-between relative overflow-hidden group min-h-[360px]"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
                                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-400/20 to-transparent"></div>

                                <div>
                                    {/* Header Name & Tag */}
                                    <div className="flex items-start justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black italic">
                                                {vendor.businessName ? vendor.businessName.charAt(0).toUpperCase() : "V"}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black uppercase italic tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                                                    {vendor.businessName || "Registered Partner"}
                                                </h3>
                                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                                    Representative: {vendor.vendorContactOwnerName || vendor.name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-white/5 rounded-xl border border-white/10 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                                            <ArrowUpRight size={14} />
                                        </div>
                                    </div>

                                    {/* Location Info */}
                                    <div className="space-y-4 my-6">
                                        <div className="flex items-center gap-3 text-white/50 text-[10px] font-black uppercase tracking-wider">
                                            <MapPin size={14} className="text-emerald-500" />
                                            <span>{vendor.vendorCity || "Location N/A"}, {vendor.vendorState || ""}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-white/50 text-[10px] font-black uppercase tracking-wider">
                                            <Calendar size={14} className="text-emerald-500" />
                                            <span>Est. {vendor.vendorYearsInBusiness ? `${vendor.vendorYearsInBusiness}+ Years Active` : "Established"}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-white/50 text-[10px] font-black uppercase tracking-wider">
                                            <Layers size={14} className="text-emerald-500" />
                                            <span className="text-emerald-400 font-black">{getCategoryLabel(vendor.vendorCategory) || "General Supplier"}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Verified Badge Footer */}
                                <div className="border-t border-white/5 pt-6 flex items-center justify-between mt-4">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-400">
                                        <Sparkles size={10} /> Compliance Verified
                                    </span>
                                    <span className="text-[9px] text-white/30 font-bold uppercase">
                                        ID: #{vendor._id.slice(-6).toUpperCase()}
                                    </span>
                                </div>

                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>

                {/* Empty State */}
                {filteredVendors.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 0.5 }} 
                        className="py-32 text-center text-sm font-black uppercase tracking-widest italic flex flex-col items-center gap-4 text-white/40"
                    >
                        <AlertCircle size={40} className="text-emerald-500" />
                        No verified partners match your search filters
                    </motion.div>
                )}
            </div>
        </div>
    );
}
