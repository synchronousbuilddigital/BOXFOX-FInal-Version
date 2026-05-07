"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Trash2, ChevronRight, LayoutGrid, Box,
    Ruler, Layers, ArrowLeft, Loader2, RotateCw,
    Database, Search, Filter, Zap, Save, X, Edit2
} from "lucide-react";
import Link from "next/link";

export default function LabConfigAdmin() {
    const [hierarchies, setHierarchies] = useState([]);
    const [specifications, setSpecifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('hierarchy'); // 'hierarchy', 'specifications', or 'pricing'
    const [pricingConfigs, setPricingConfigs] = useState(null);
    const [isSeeding, setIsSeeding] = useState(false);

    // Hierarchy State
    const [newCategory, setNewCategory] = useState("");
    const [newSubCategory, setNewSubCategory] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [newSpec, setNewSpec] = useState({
        category: "",
        subCategory: "",
        spec: "",
        l: 0,
        w: 0,
        h: 0,
        unit: "mm",
        ups: 1,
        machine: "",
        sheetW: 0,
        sheetH: 0,
        dieRate: 300
    });
    const [specSearch, setSpecSearch] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const hRes = await fetch('/api/admin/lab/hierarchy');
            const hData = await hRes.json();
            setHierarchies(hData);

            const sRes = await fetch('/api/admin/lab/specifications');
            const sData = await sRes.json();
            setSpecifications(sData);

            if (hData.length > 0) {
                if (!selectedCategory) setSelectedCategory(hData[0]);
                if (!newSpec.category) {
                    setNewSpec(prev => ({
                        ...prev,
                        category: hData[0].category,
                        subCategory: hData[0].subCategories?.[0] || ""
                    }));
                }
            }

            const cRes = await fetch('/api/admin/lab/config');
            const cData = await cRes.json();
            setPricingConfigs(cData);
        } catch (err) {
            console.error("Failed to load lab config");
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategory) return;
        try {
            const res = await fetch('/api/admin/lab/hierarchy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category: newCategory, subCategories: [] })
            });
            if (res.ok) {
                setNewCategory("");
                fetchData();
            }
        } catch (err) { console.error(err); }
    };

    const handleAddSubCategory = async () => {
        if (!selectedCategory || !newSubCategory) return;
        try {
            const updatedSubCats = [...selectedCategory.subCategories, newSubCategory];
            const res = await fetch('/api/admin/lab/hierarchy', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...selectedCategory, subCategories: updatedSubCats })
            });
            if (res.ok) {
                setNewSubCategory("");
                const updated = await res.json();
                setSelectedCategory(updated);
                fetchData();
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteSubCategory = async (subCat) => {
        if (!confirm(`Delete ${subCat}?`)) return;
        try {
            const updatedSubCats = selectedCategory.subCategories.filter(s => s !== subCat);
            const res = await fetch('/api/admin/lab/hierarchy', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...selectedCategory, subCategories: updatedSubCats })
            });
            if (res.ok) {
                const updated = await res.json();
                setSelectedCategory(updated);
                fetchData();
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteCategory = async (id) => {
        if (!confirm("Delete entire category?")) return;
        try {
            const res = await fetch(`/api/admin/lab/hierarchy?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSelectedCategory(null);
                fetchData();
            }
        } catch (err) { console.error(err); }
    };

    const handleAddSpec = async () => {
        try {
            const res = await fetch('/api/admin/lab/specifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSpec)
            });
            if (res.ok) {
                setNewSpec({
                    category: "", subCategory: "", spec: "",
                    l: 0, w: 0, h: 0, unit: "mm", ups: 1,
                    machine: "", sheetW: 0, sheetH: 0, dieRate: 300
                });
                fetchData();
                alert("Specification Published!");
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteSpec = async (id) => {
        if (!confirm("Delete this specification?")) return;
        try {
            const res = await fetch(`/api/admin/lab/specifications?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (err) { console.error(err); }
    };

    const handleUpdateConfig = async (key, value) => {
        try {
            const res = await fetch('/api/admin/lab/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value })
            });
            if (res.ok) {
                alert(`${key} updated!`);
                fetchData();
            }
        } catch (err) { console.error(err); }
    };

    const handleSeedData = async () => {
        if (!confirm("This will replace ALL current lab data with the factory defaults. Continue?")) return;
        setIsSeeding(true);
        try {
            const res = await fetch('/api/admin/lab/seed', { method: 'POST' });
            if (res.ok) {
                alert("Lab data restored to defaults!");
                fetchData();
            }
        } catch (err) { console.error(err); }
        finally { setIsSeeding(false); }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] text-gray-950 font-sans">
            {/* Optimized Header */}
            <header className="fixed top-0 w-full bg-white/90 backdrop-blur-2xl border-b border-gray-100 z-[100]">
                <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between relative">
                    <div className="flex items-center gap-8">
                        <Link href="/admin" className="flex items-center gap-2 group">
                            <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-gray-950 group-hover:text-white transition-all">
                                <ArrowLeft size={16} />
                            </div>
                        </Link>

                        <div className="flex flex-col">
                            <h1 className="text-base font-black uppercase tracking-tight leading-none">
                                Lab <span className="text-emerald-500 italic">Config</span>
                            </h1>
                        </div>
                    </div>

                    {/* Centered Tab Switcher */}
                    <div className="absolute left-1/2 -translate-x-1/2 flex bg-gray-100/50 p-1 rounded-xl border border-gray-100">
                        <button
                            onClick={() => setActiveTab('hierarchy')}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'hierarchy' ? 'bg-white text-gray-950 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-500'}`}
                        >
                            Hierarchy
                        </button>
                        <button
                            onClick={() => setActiveTab('specifications')}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'specifications' ? 'bg-white text-gray-950 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-500'}`}
                        >
                            Standard Sizes
                        </button>
                        <button
                            onClick={() => setActiveTab('pricing')}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'pricing' ? 'bg-white text-gray-950 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-500'}`}
                        >
                            Pricing
                        </button>
                    </div>


                </div>
            </header>

            <main className="pt-32 pb-24 px-8 max-w-[1600px] mx-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-60 gap-6">
                        <div className="relative">
                            <Loader2 className="animate-spin text-emerald-500" size={48} />
                            <div className="absolute inset-0 blur-2xl bg-emerald-500/20 animate-pulse" />
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-300 italic">Syncing_Lab_Ecosystem</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {activeTab === 'hierarchy' ? (
                            <motion.div
                                key="hierarchy"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 lg:grid-cols-12 gap-10"
                            >
                                {/* Categories Column */}
                                <div className="lg:col-span-4 space-y-6">
                                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
                                            <Layers size={14} className="text-emerald-500" /> Industries
                                        </h3>

                                        <div className="space-y-2 mb-6">
                                            {hierarchies.map(h => (
                                                <button
                                                    key={h._id}
                                                    onClick={() => setSelectedCategory(h)}
                                                    className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all group ${selectedCategory?._id === h._id ? 'bg-gray-950 text-white' : 'hover:bg-gray-50 text-gray-600'}`}
                                                >
                                                    <span className="font-black uppercase tracking-tight text-sm">{h.category}</span>
                                                    <ChevronRight size={16} className={selectedCategory?._id === h._id ? 'text-emerald-400' : 'text-gray-300'} />
                                                </button>
                                            ))}
                                        </div>

                                        <div className="pt-6 border-t border-gray-50 flex gap-2">
                                            <input
                                                value={newCategory}
                                                onChange={(e) => setNewCategory(e.target.value)}
                                                placeholder="New Industry"
                                                className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-[10px] font-bold uppercase outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                            />
                                            <button
                                                onClick={handleAddCategory}
                                                className="w-10 h-10 bg-gray-950 text-white rounded-xl flex items-center justify-center hover:bg-emerald-500 transition-colors"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Sub-Categories Workspace */}
                                <div className="lg:col-span-8">
                                    {selectedCategory ? (
                                        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-10">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h2 className="text-4xl font-black uppercase tracking-tighter italic text-gray-900">{selectedCategory.category}</h2>
                                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1">Operational Nodes</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteCategory(selectedCategory._id)}
                                                    className="p-3 text-gray-200 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {selectedCategory.subCategories.map(sub => (
                                                    <div key={sub} className="group flex items-center justify-between p-7 bg-gray-50/50 rounded-3xl border border-transparent hover:border-emerald-100 transition-all">
                                                        <span className="font-black uppercase tracking-tight text-sm text-gray-700">{sub}</span>
                                                        <button
                                                            onClick={() => handleDeleteSubCategory(sub)}
                                                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ))}

                                                <div className="p-1 bg-gray-100/50 rounded-3xl flex gap-2 border border-dashed border-gray-200">
                                                    <input
                                                        value={newSubCategory}
                                                        onChange={(e) => setNewSubCategory(e.target.value)}
                                                        placeholder="Add Sub-Node..."
                                                        className="flex-1 bg-transparent border-none rounded-2xl px-6 py-4 text-[10px] font-black uppercase outline-none"
                                                    />
                                                    <button
                                                        onClick={handleAddSubCategory}
                                                        className="px-6 bg-gray-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-colors"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full min-h-[400px] bg-white rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center justify-center p-20 text-center">
                                            <Zap size={32} className="text-gray-100 mb-4" />
                                            <h3 className="text-xl font-black uppercase tracking-tighter text-gray-300">Select Domain</h3>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : activeTab === 'specifications' ? (
                            <motion.div
                                key="specifications"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-10"
                            >
                                {/* Forge Form */}
                                <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-sm relative overflow-hidden">
                                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-10 flex items-center gap-4 italic">
                                        Structural <span className="text-emerald-500">Forge</span>
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-2">Industry</label>
                                            <select
                                                value={newSpec.category}
                                                onChange={(e) => setNewSpec({ ...newSpec, category: e.target.value })}
                                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-[11px] font-black uppercase outline-none"
                                            >
                                                <option value="">Select Category</option>
                                                {hierarchies.map(h => <option key={h.category} value={h.category}>{h.category}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-2">Sub-Node</label>
                                            <select
                                                value={newSpec.subCategory}
                                                onChange={(e) => setNewSpec({ ...newSpec, subCategory: e.target.value })}
                                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-[11px] font-black uppercase outline-none"
                                            >
                                                <option value="">Select Sub-Category</option>
                                                {hierarchies.find(h => h.category === newSpec.category)?.subCategories.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-2">Display Spec</label>
                                            <input
                                                value={newSpec.spec}
                                                onChange={(e) => setNewSpec({ ...newSpec, spec: e.target.value })}
                                                placeholder="e.g. 1Kg 9*9*6 inch"
                                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-[11px] font-black uppercase outline-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-4 md:col-span-4 gap-4 bg-gray-50/50 p-6 rounded-[2rem]">
                                            <div className="space-y-2">
                                                <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-4">L</label>
                                                <input
                                                    type="number"
                                                    value={newSpec.l}
                                                    onChange={(e) => setNewSpec({ ...newSpec, l: parseFloat(e.target.value) })}
                                                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-center outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-4">W</label>
                                                <input
                                                    type="number"
                                                    value={newSpec.w}
                                                    onChange={(e) => setNewSpec({ ...newSpec, w: parseFloat(e.target.value) })}
                                                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-center outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-4">H</label>
                                                <input
                                                    type="number"
                                                    value={newSpec.h}
                                                    onChange={(e) => setNewSpec({ ...newSpec, h: parseFloat(e.target.value) })}
                                                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-black text-center outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-4">Unit</label>
                                                <div className="flex bg-white border border-gray-100 rounded-xl p-1">
                                                    <button onClick={() => setNewSpec({ ...newSpec, unit: 'mm' })} className={`flex-1 py-2 rounded-lg text-[10px] font-black ${newSpec.unit === 'mm' ? 'bg-gray-950 text-white' : 'text-gray-400'}`}>MM</button>
                                                    <button onClick={() => setNewSpec({ ...newSpec, unit: 'in' })} className={`flex-1 py-2 rounded-lg text-[10px] font-black ${newSpec.unit === 'in' ? 'bg-gray-950 text-white' : 'text-gray-400'}`}>IN</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-end">
                                        <button
                                            onClick={handleAddSpec}
                                            className="px-10 py-4 bg-gray-950 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all shadow-xl"
                                        >
                                            Register Spec
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row items-center justify-between bg-gray-50/20 gap-4">
                                        <div className="flex items-center gap-4">
                                            <Ruler size={20} className="text-emerald-500" />
                                            <h3 className="text-xl font-black uppercase tracking-tighter italic">Vault</h3>
                                            <span className="text-[9px] font-black bg-gray-950 text-white px-4 py-1.5 rounded-full uppercase tracking-widest">
                                                {specifications.length} Registered
                                            </span>
                                        </div>
                                        
                                        <div className="relative w-full sm:w-64">
                                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input 
                                                type="text"
                                                placeholder="Search Vault..."
                                                value={specSearch}
                                                onChange={(e) => setSpecSearch(e.target.value)}
                                                className="w-full bg-white border border-gray-100 rounded-xl pl-10 pr-4 py-2 text-[10px] font-bold uppercase outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50/50">
                                                <tr>
                                                    <th className="px-10 py-6 text-[9px] font-black uppercase tracking-widest text-gray-400">Domain</th>
                                                    <th className="px-10 py-6 text-[9px] font-black uppercase tracking-widest text-gray-400">Node</th>
                                                    <th className="px-10 py-6 text-[9px] font-black uppercase tracking-widest text-gray-400">Spec</th>
                                                    <th className="px-10 py-6 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {specifications
                                                    .filter(s => 
                                                        specSearch === "" || 
                                                        s.spec.toLowerCase().includes(specSearch.toLowerCase()) || 
                                                        s.category.toLowerCase().includes(specSearch.toLowerCase()) || 
                                                        s.subCategory.toLowerCase().includes(specSearch.toLowerCase())
                                                    )
                                                    .slice(0, 100) // Performance optimization
                                                    .map(spec => (
                                                    <tr key={spec._id} className="group hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-10 py-7">
                                                            <span className="text-[10px] font-black uppercase px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">{spec.category}</span>
                                                        </td>
                                                        <td className="px-10 py-7">
                                                            <span className="text-xs font-black uppercase text-gray-400">{spec.subCategory}</span>
                                                        </td>
                                                        <td className="px-10 py-7">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-black uppercase tracking-tight">{spec.spec}</span>
                                                                <span className="text-[9px] font-bold text-gray-300 uppercase mt-0.5">{spec.l}x{spec.w}x{spec.h} {spec.unit}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-7 text-right">
                                                            <button
                                                                onClick={() => handleDeleteSpec(spec._id)}
                                                                className="p-3 text-gray-200 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        ) : activeTab === 'pricing' ? (
                            <motion.div
                                key="pricing"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-10"
                            >
                                {/* Paper Rates Section */}
                                <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-10">
                                        <h2 className="text-3xl font-black uppercase tracking-tighter italic flex items-center gap-4">
                                            Paper <span className="text-emerald-500">Rates</span>
                                        </h2>
                                        <Database className="text-gray-100" size={32} />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {pricingConfigs?.PAPER_RATES && Object.entries(pricingConfigs.PAPER_RATES).map(([material, brands]) => (
                                            <div key={material} className="space-y-6 p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100">
                                                <h3 className="text-lg font-black uppercase tracking-tight text-gray-950">{material}</h3>
                                                <div className="space-y-4">
                                                    {Object.entries(brands).map(([brand, rate]) => (
                                                        <div key={brand} className="flex items-center justify-between gap-4">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{brand}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-black text-gray-400 italic">₹/kg</span>
                                                                <input 
                                                                    type="number"
                                                                    defaultValue={rate}
                                                                    onBlur={(e) => {
                                                                        const newVal = parseFloat(e.target.value);
                                                                        if (newVal !== rate) {
                                                                            const updated = { ...pricingConfigs.PAPER_RATES };
                                                                            updated[material][brand] = newVal;
                                                                            handleUpdateConfig('PAPER_RATES', updated);
                                                                        }
                                                                    }}
                                                                    className="w-20 bg-white border border-gray-100 rounded-lg px-3 py-2 text-xs font-black text-right outline-none focus:ring-2 focus:ring-emerald-500/20"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Machine Configs Section */}
                                <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-sm">
                                    <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-10">
                                        Machine <span className="text-emerald-500">Fleet</span>
                                    </h2>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr>
                                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-left">Machine</th>
                                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-left">Plate Cost</th>
                                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-left">Wastage (Sheets)</th>
                                                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-left">Min Charge</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {pricingConfigs?.MACHINE_CONFIGS && Object.entries(pricingConfigs.MACHINE_CONFIGS).map(([mId, cfg]) => (
                                                    <tr key={mId}>
                                                        <td className="px-6 py-6 font-black text-gray-950 uppercase">{mId}</td>
                                                        <td className="px-6 py-6">
                                                            <input 
                                                                type="number"
                                                                defaultValue={cfg.plateCost}
                                                                onBlur={(e) => {
                                                                    const newVal = parseFloat(e.target.value);
                                                                    const updated = { ...pricingConfigs.MACHINE_CONFIGS };
                                                                    updated[mId].plateCost = newVal;
                                                                    handleUpdateConfig('MACHINE_CONFIGS', updated);
                                                                }}
                                                                className="w-24 bg-gray-50 border-none rounded-lg px-4 py-2 text-xs font-black outline-none"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-6">
                                                            <input 
                                                                type="number"
                                                                defaultValue={cfg.wastage}
                                                                onBlur={(e) => {
                                                                    const newVal = parseFloat(e.target.value);
                                                                    const updated = { ...pricingConfigs.MACHINE_CONFIGS };
                                                                    updated[mId].wastage = newVal;
                                                                    handleUpdateConfig('MACHINE_CONFIGS', updated);
                                                                }}
                                                                className="w-24 bg-gray-50 border-none rounded-lg px-4 py-2 text-xs font-black outline-none"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-6">
                                                            <input 
                                                                type="number"
                                                                defaultValue={cfg.minCharge}
                                                                onBlur={(e) => {
                                                                    const newVal = parseFloat(e.target.value);
                                                                    const updated = { ...pricingConfigs.MACHINE_CONFIGS };
                                                                    updated[mId].minCharge = newVal;
                                                                    handleUpdateConfig('MACHINE_CONFIGS', updated);
                                                                }}
                                                                className="w-24 bg-gray-50 border-none rounded-lg px-4 py-2 text-xs font-black outline-none"
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Markups Section */}
                                <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-sm">
                                    <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-10">
                                        Profit <span className="text-emerald-500">Margins</span>
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {pricingConfigs?.MARKUP_TYPES && Object.entries(pricingConfigs.MARKUP_TYPES).map(([type, rate]) => (
                                            <div key={type} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">{type}</span>
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="number"
                                                        step="0.01"
                                                        defaultValue={rate}
                                                        onBlur={(e) => {
                                                            const newVal = parseFloat(e.target.value);
                                                            const updated = { ...pricingConfigs.MARKUP_TYPES };
                                                            updated[type] = newVal;
                                                            handleUpdateConfig('MARKUP_TYPES', updated);
                                                        }}
                                                        className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-xs font-black outline-none"
                                                    />
                                                    <span className="text-[10px] font-black text-gray-400">%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                )}
            </main>
        </div>
    );
}
