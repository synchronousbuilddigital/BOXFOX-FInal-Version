"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Package, Globe, Users, ArrowRight, CheckCircle2, ChevronDown, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import b2bHierarchy from "@/lib/b2b-hierarchy.json";

export default function B2BPage() {
    const [status, setStatus] = useState("idle"); // idle, loading, success, error
    const [configs, setConfigs] = useState([]);
    const [loadingConfigs, setLoadingConfigs] = useState(true);

    const [formData, setFormData] = useState({
        companyName: "",
        contactEmail: "",
        phoneNumber: "",
        category: "",
        subCategory: "",
        spec: "",
        quantity: "500",
        material: "SBS",
        brand: "ITC",
        gsm: "280",
        printColours: "Four Colour",
        printingSides: "One Side",
        lamination: "Plain",
        requirements: ""
    });

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        fetchConfigs();
        setIsMobile(window.innerWidth < 640);
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchConfigs = async () => {
        try {
            const res = await fetch('/api/admin/b2b/config');
            const data = await res.json();
            setConfigs(data);
            setLoadingConfigs(false);
            
            // Set initial defaults from dynamic data if available
            const defaultMat = data.find(c => c.category === 'material')?.label;
            const defaultBrand = data.find(c => c.category === 'brand')?.label;
            const defaultGsm = data.find(c => c.category === 'gsm')?.label;
            const defaultPrint = data.find(c => c.category === 'printColours')?.label;
            const defaultLam = data.find(c => c.category === 'lamination')?.label;

            setFormData(prev => ({
                ...prev,
                material: defaultMat || "SBS",
                brand: defaultBrand || "ITC",
                gsm: defaultGsm || "280",
                printColours: defaultPrint || "Four Colour",
                lamination: defaultLam || "Plain"
            }));
        } catch (err) {
            console.error("Failed to load configs");
            setLoadingConfigs(false);
        }
    };

    // Options from hierarchy
    const categories = Object.keys(b2bHierarchy).sort();
    const subCategories = formData.category ? Object.keys(b2bHierarchy[formData.category] || {}).sort() : [];
    const specs = (formData.category && formData.subCategory) ? (b2bHierarchy[formData.category][formData.subCategory] || []) : [];

    // Options from database
    const getOptions = (category) => {
        return configs.filter(c => c.category === category).map(c => c.label);
    };

    const materialOptions = getOptions('material').length > 0 ? getOptions('material') : ["SBS", "FBB", "Duplex"];
    const brandOptions = getOptions('brand').length > 0 ? getOptions('brand') : ["ITC", "Century", "Emami"];
    const gsmOptions = getOptions('gsm').length > 0 ? getOptions('gsm') : ["280", "300", "350"];
    const printOptions = getOptions('printColours').length > 0 ? getOptions('printColours') : ["Four Colour", "Special Colour"];
    const laminationOptions = getOptions('lamination').length > 0 ? getOptions('lamination') : ["Plain", "Gloss", "Matt"];
    const quantityOptions = ["500", "1000", "1,000", "2,000", "5,000", "10,000", "25,000", "50,000", "1,00,000"];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const next = { ...prev, [name]: value };
            if (name === "category") {
                next.subCategory = "";
                next.spec = "";
            } else if (name === "subCategory") {
                next.spec = "";
            }
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("loading");
        try {
            const res = await fetch('/api/b2b/inquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setStatus("success");
            } else {
                setStatus("error");
            }
        } catch (err) {
            setStatus("error");
        }
    };

    if (status === "success") {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="pt-60 flex flex-col items-center justify-center text-center px-6 text-gray-950">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-8 shadow-2xl shadow-emerald-500/20"
                    >
                        <CheckCircle2 size={48} />
                    </motion.div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">Protocol Active</h1>
                    <p className="text-gray-500 text-xl max-w-md italic font-medium">"Your technical requirements have been synchronized. An engineering brief will be issued shortly."</p>
                    <button
                        onClick={() => setStatus("idle")}
                        className="mt-12 px-12 py-5 bg-gray-950 text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all shadow-xl active:scale-95"
                    >
                        Return to Hub
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white selection:bg-emerald-500 selection:text-white">
            <main className="pt-24 sm:pt-32 pb-16 sm:pb-24">
                {/* Hero */}
                <section className="px-6 lg:px-12 mb-16 sm:mb-24 md:mb-32">
                    <div className="max-w-[1700px] mx-auto">
                        <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-10 sm:gap-12 mb-16 sm:mb-24">
                            <div className="space-y-6 sm:space-y-8 max-w-4xl text-center lg:text-left">
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-center lg:justify-start gap-3">
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 rounded-full" />
                                    <span className="text-emerald-600 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em]">Manufacturing Protocol 2.0</span>
                                </motion.div>
                                <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black tracking-tighter uppercase leading-[0.85] text-gray-950">
                                    Wholesale<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-gray-100">Excellence.</span>
                                </motion.h1>
                            </div>
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 sm:p-12 border border-gray-100 bg-gray-50/50 backdrop-blur-3xl rounded-[2rem] sm:rounded-[3rem] max-w-md shadow-sm border-l-8 border-l-emerald-500 text-center lg:text-left">
                                <p className="text-base sm:text-lg text-gray-950 font-black italic leading-relaxed uppercase tracking-tight">
                                    "Precision engineering for high-volume commerce. Access direct factory pricing and technical CAD support."
                                </p>
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            <FeatureCard icon={<Building2 className="w-6 h-6 sm:w-8 sm:h-8" />} title="Enterprise Scale" desc="Calibrated for mass production with high-precision manufacturing nodes." />
                            <FeatureCard icon={<Package className="w-6 h-6 sm:w-8 sm:h-8" />} title="Dynamic Spec Mapping" desc="Access thousands of dimension combinations via our data-driven logic." />
                            <FeatureCard icon={<Globe className="w-6 h-6 sm:w-8 sm:h-8" />} title="Supply Chain Logic" desc="Direct integration with logistics protocols for seamless global delivery." />
                        </div>
                    </div>
                </section>

                {/* Form */}
                <section className="px-6 lg:px-12 bg-gray-50 py-20 sm:py-32 md:py-40 border-y border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 sm:p-20 opacity-[0.02] sm:opacity-[0.03] pointer-events-none">
                        <Package size={isMobile ? 200 : 400} />
                    </div>
                    
                    <div className="max-w-5xl mx-auto text-center space-y-12 sm:space-y-16 relative z-10">
                        <div className="space-y-3 sm:space-y-4">
                            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-gray-950">Initialize Inquiry</h2>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] sm:text-xs italic">Submit technical specifications for architectural review.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left">
                            {/* Contact Details */}
                            <div className="space-y-2 sm:space-y-3">
                                <label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 sm:ml-6">Company Name</label>
                                <input required name="companyName" value={formData.companyName} onChange={handleChange} type="text" className="w-full px-6 sm:px-8 py-4 sm:py-6 rounded-2xl sm:rounded-3xl bg-white border border-gray-100 focus:border-emerald-500 outline-none transition-all font-black text-gray-950 shadow-sm text-sm sm:text-base" placeholder="e.g. Acme Corp" />
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                                <label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 sm:ml-6">Contact Email</label>
                                <input required name="contactEmail" value={formData.contactEmail} onChange={handleChange} type="email" className="w-full px-6 sm:px-8 py-4 sm:py-6 rounded-2xl sm:rounded-3xl bg-white border border-gray-100 focus:border-emerald-500 outline-none transition-all font-black text-gray-950 shadow-sm text-sm sm:text-base" placeholder="corp@email.com" />
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                                <label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 sm:ml-6">Phone Number</label>
                                <input required name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} type="tel" className="w-full px-6 sm:px-8 py-4 sm:py-6 rounded-2xl sm:rounded-3xl bg-white border border-gray-100 focus:border-emerald-500 outline-none transition-all font-black text-gray-950 shadow-sm text-sm sm:text-base" placeholder="+91 XXXXX XXXXX" />
                            </div>

                            {/* Product Selectors */}
                            <div className="space-y-2 sm:space-y-3">
                                <label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 sm:ml-6">Industry Domain</label>
                                <div className="relative group">
                                    <select required name="category" value={formData.category} onChange={handleChange} className="w-full px-6 sm:px-8 py-4 sm:py-6 rounded-2xl sm:rounded-3xl bg-white border border-gray-100 focus:border-emerald-500 outline-none transition-all font-black text-gray-950 shadow-sm appearance-none cursor-pointer text-sm sm:text-base">
                                        <option value="">Select Domain</option>
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-emerald-500 transition-colors pointer-events-none" size={18} />
                                </div>
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                                <label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 sm:ml-6">Sub Category</label>
                                <div className="relative group">
                                    <select required name="subCategory" value={formData.subCategory} onChange={handleChange} disabled={!formData.category} className="w-full px-6 sm:px-8 py-4 sm:py-6 rounded-2xl sm:rounded-3xl bg-white border border-gray-100 focus:border-emerald-500 outline-none transition-all font-black text-gray-950 shadow-sm appearance-none cursor-pointer disabled:opacity-30 text-sm sm:text-base">
                                        <option value="">Select Sub-System</option>
                                        {subCategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-emerald-500 transition-colors pointer-events-none" size={18} />
                                </div>
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                                <label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 sm:ml-6">Technical Spec</label>
                                <div className="relative group">
                                    <select required name="spec" value={formData.spec} onChange={handleChange} disabled={!formData.subCategory} className="w-full px-6 sm:px-8 py-4 sm:py-6 rounded-2xl sm:rounded-3xl bg-white border border-gray-100 focus:border-emerald-500 outline-none transition-all font-black text-gray-950 shadow-sm appearance-none cursor-pointer disabled:opacity-30 text-sm sm:text-base">
                                        <option value="">Select Dimension Node</option>
                                        {specs.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-emerald-500 transition-colors pointer-events-none" size={18} />
                                </div>
                            </div>

                            {/* Manufacturing Tokens */}
                            <div className="space-y-2 sm:space-y-3">
                                <label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 sm:ml-6">Quantity (Min 500)</label>
                                <div className="relative group">
                                    <select required name="quantity" value={formData.quantity} onChange={handleChange} className="w-full px-6 sm:px-8 py-4 sm:py-6 rounded-2xl sm:rounded-3xl bg-white border border-gray-100 focus:border-emerald-500 outline-none transition-all font-black text-gray-950 shadow-sm appearance-none cursor-pointer text-sm sm:text-base">
                                        {quantityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                </div>
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                                <label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 sm:ml-6">Material Choice</label>
                                <div className="relative group">
                                    <select required name="material" value={formData.material} onChange={handleChange} className="w-full px-6 sm:px-8 py-4 sm:py-6 rounded-2xl sm:rounded-3xl bg-white border border-gray-100 focus:border-emerald-500 outline-none transition-all font-black text-gray-950 shadow-sm appearance-none cursor-pointer text-sm sm:text-base">
                                        {materialOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                </div>
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                                <label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 sm:ml-6">Board Brand</label>
                                <div className="relative group">
                                    <select required name="brand" value={formData.brand} onChange={handleChange} className="w-full px-6 sm:px-8 py-4 sm:py-6 rounded-2xl sm:rounded-3xl bg-white border border-gray-100 focus:border-emerald-500 outline-none transition-all font-black text-gray-950 shadow-sm appearance-none cursor-pointer text-sm sm:text-base">
                                        {brandOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                </div>
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                                <label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 sm:ml-6">Paper GSM</label>
                                <div className="relative group">
                                    <select required name="gsm" value={formData.gsm} onChange={handleChange} className="w-full px-6 sm:px-8 py-4 sm:py-6 rounded-2xl sm:rounded-3xl bg-white border border-gray-100 focus:border-emerald-500 outline-none transition-all font-black text-gray-950 shadow-sm appearance-none cursor-pointer text-sm sm:text-base">
                                        {gsmOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                </div>
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                                <label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 sm:ml-6">Printing Protocol</label>
                                <div className="relative group">
                                    <select required name="printColours" value={formData.printColours} onChange={handleChange} className="w-full px-6 sm:px-8 py-4 sm:py-6 rounded-2xl sm:rounded-3xl bg-white border border-gray-100 focus:border-emerald-500 outline-none transition-all font-black text-gray-950 shadow-sm appearance-none cursor-pointer text-sm sm:text-base">
                                        {printOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                </div>
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                                <label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 sm:ml-6">Surface Finish</label>
                                <div className="relative group">
                                    <select required name="lamination" value={formData.lamination} onChange={handleChange} className="w-full px-6 sm:px-8 py-4 sm:py-6 rounded-2xl sm:rounded-3xl bg-white border border-gray-100 focus:border-emerald-500 outline-none transition-all font-black text-gray-950 shadow-sm appearance-none cursor-pointer text-sm sm:text-base">
                                        {laminationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                </div>
                            </div>

                            <div className="space-y-2 sm:space-y-3 md:col-span-2">
                                <label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 sm:ml-6">CAD Instructions / Requirements</label>
                                <textarea name="requirements" value={formData.requirements} onChange={handleChange} className="w-full px-6 sm:px-10 py-6 sm:py-8 rounded-[1.5rem] sm:rounded-[2.5rem] bg-white border border-gray-100 focus:border-emerald-500 outline-none transition-all font-bold text-gray-950 min-h-[150px] sm:min-h-[180px] shadow-sm resize-none text-sm sm:text-base" placeholder="Provide technical details, structural inserts, or additional finishing instructions..."></textarea>
                            </div>
                            <div className="md:col-span-2 mt-4 sm:mt-8">
                                <button disabled={status === "loading"} type="submit" className="w-full py-5 sm:py-7 bg-gray-950 text-white rounded-[1.5rem] sm:rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs hover:bg-emerald-600 hover:scale-[1.01] active:scale-[0.98] transition-all shadow-2xl flex items-center justify-center gap-3 sm:gap-4 disabled:opacity-50">
                                    {status === "loading" ? <Loader2 size={20} className="animate-spin" /> : <>Initialize Procurement Protocol <ArrowRight size={16} /></>}
                                </button>
                                {status === "error" && <p className="text-red-500 text-[8px] sm:text-[10px] font-black uppercase tracking-widest mt-4 sm:mt-6 text-center animate-bounce">System Error: Transmission Interrupted. Retry Protocol.</p>}
                            </div>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-8 sm:p-12 md:p-16 rounded-[2.5rem] sm:rounded-[4rem] bg-white border border-gray-100 hover:border-emerald-500/40 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] transition-all group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] sm:rounded-[2rem] bg-gray-50 flex items-center justify-center text-gray-950 border border-gray-100 group-hover:bg-emerald-500 group-hover:text-white transition-all mb-6 sm:mb-10 shadow-sm ring-4 sm:ring-8 ring-gray-50/50">
                {icon}
            </div>
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-3 sm:mb-4 text-gray-950 group-hover:text-emerald-600 transition-colors leading-none">{title}</h3>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[8px] sm:text-[10px] leading-relaxed">{desc}</p>
        </motion.div>
    );
}
