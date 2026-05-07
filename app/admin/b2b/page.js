"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Trash2, ChevronRight, LayoutGrid, Box,
    Printer, Palette, Layers, ArrowLeft, Loader2,
    Database, Search, Filter, ShieldCheck, Zap
} from "lucide-react";
import Link from "next/link";
import hierarchyData from "@/lib/b2b-hierarchy.json";
import { useToast } from '@/app/context/ToastContext';
import ConfirmModal from '@/app/components/ConfirmModal';

const categories = [
    { id: 'material', label: 'Material Library', icon: <Layers size={18} />, desc: 'Configure board types like SBS, FBB, etc.' },
    { id: 'brand', label: 'Paper Brands', icon: <ShieldCheck size={18} />, desc: 'Manage manufacturing partners (ITC, Century, etc.)' },
    { id: 'gsm', label: 'GSM Range', icon: <Database size={18} />, desc: 'Define paper thickness options' },
    { id: 'printColours', label: 'Print Specifications', icon: <Printer size={18} />, desc: 'Set available ink & colour protocols' },
    { id: 'lamination', label: 'Surface Finishes', icon: <Palette size={18} />, desc: 'Lamination and coating variations' }
];

export default function B2BOpsAdvanced() {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('material');
    const [newItem, setNewItem] = useState({ label: '', value: '' });
    const [viewMode, setViewMode] = useState('config'); // 'config' or 'hierarchy'
    const { showToast } = useToast();
    
    // Confirmation modal state
    const [confirm, setConfirm] = useState({ open: false, title: '', subText: '', onConfirm: null, confirmLabel: 'Confirm' });

    const openConfirm = ({ title, subText = '', confirmLabel = 'Confirm', onConfirm }) => {
        setConfirm({ open: true, title, subText, onConfirm, confirmLabel });
    };

    const closeConfirm = () => setConfirm({ open: false, title: '', subText: '', onConfirm: null });

    // Hierarchy Search
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const res = await fetch('/api/admin/b2b/config');
            const data = await res.json();
            setConfigs(data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load configs");
            setLoading(false);
        }
    };


    const handleAdd = async () => {
        if (!newItem.label || !newItem.value) return;
        try {
            const res = await fetch('/api/admin/b2b/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newItem, category: activeTab })
            });
            if (res.ok) {
                setNewItem({ label: '', value: '' });
                fetchConfigs();
            }
        } catch (err) {
            console.error("Add error", err);
        }
    };

    const handleDelete = async (id) => {
        openConfirm({
            title: 'Remove option from B2B form?',
            subText: 'This action cannot be undone. Proceed?',
            confirmLabel: 'Delete',
            onConfirm: async () => {
                try {
                    const res = await fetch(`/api/admin/b2b/config?id=${id}`, {
                        method: 'DELETE'
                    });
                    if (res.ok) fetchConfigs();
                } catch (err) {
                    console.error("Delete error", err);
                    showToast('Delete failed', 'error');
                } finally {
                    closeConfirm();
                }
            }
        });
    };

    const filteredConfigs = configs.filter(c => c.category === activeTab);

    // Hierarchy Processing
    const hierarchyCategories = Object.keys(hierarchyData).sort();
    const filteredHierarchy = hierarchyCategories.filter(cat => 
        cat.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-gray-950 selection:bg-emerald-500 selection:text-white">
            {/* Header */}
            <header className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50">
                <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/admin" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 bg-gray-950 rounded-lg flex items-center justify-center text-white group-hover:bg-emerald-500 transition-colors">
                                <ArrowLeft size={16} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Main Dashboard</span>
                        </Link>
                        <div className="h-6 w-px bg-gray-100" />
                        <h1 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                            B2B <span className="text-gray-400">Operations Control</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl border border-gray-200">
                        <button 
                            onClick={() => setViewMode('config')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'config' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-400'}`}
                        >
                            Form Options
                        </button>
                        <button 
                            onClick={() => setViewMode('hierarchy')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'hierarchy' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-400'}`}
                        >
                            Master Hierarchy
                        </button>
                    </div>
                </div>
            </header>

            <main className="pt-32 pb-24 px-6 max-w-[1600px] mx-auto">
                <AnimatePresence mode="wait">
                    {viewMode === 'config' ? (
                        <motion.div 
                            key="config"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-4 gap-12"
                        >
                            {/* Sidebar Controls */}
                            <aside className="lg:col-span-1 space-y-6">
                                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm overflow-hidden">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
                                        <Zap size={14} className="text-emerald-500" /> Manufacturing Tokens
                                    </h3>
                                    <div className="space-y-2">
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setActiveTab(cat.id)}
                                                className={`w-full text-left p-5 rounded-2xl transition-all group ${activeTab === cat.id
                                                        ? 'bg-gray-950 text-white shadow-xl'
                                                        : 'bg-transparent text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2.5 rounded-xl transition-colors ${activeTab === cat.id ? 'bg-white/10 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-gray-950'}`}>
                                                        {cat.icon}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black uppercase tracking-tight">{cat.label}</p>
                                                        <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${activeTab === cat.id ? 'text-gray-400' : 'text-gray-300'}`}>{cat.desc}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </aside>

                            {/* Options Management */}
                            <section className="lg:col-span-3 space-y-8">
                                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                                        {categories.find(c => c.id === activeTab)?.icon}
                                    </div>
                                    <div className="relative z-10 space-y-8">
                                        <div>
                                            <h2 className="text-3xl font-black uppercase tracking-tighter">Deploy New <span className="text-emerald-500">{categories.find(c => c.id === activeTab)?.label}</span></h2>
                                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Updates will reflect instantly in the wholesale portal.</p>
                                        </div>
                                        
                                        <div className="flex flex-col md:flex-row items-end gap-6">
                                            <div className="flex-1 space-y-3 w-full">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Display Name</label>
                                                <input
                                                    value={newItem.label}
                                                    onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                                                    type="text"
                                                    className="w-full px-8 py-5 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all font-black text-gray-950 placeholder:text-gray-300"
                                                    placeholder="e.g. Ultra Gloss Premium"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-3 w-full">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">System Value</label>
                                                <input
                                                    value={newItem.value}
                                                    onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                                                    type="text"
                                                    className="w-full px-8 py-5 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all font-black text-gray-950 placeholder:text-gray-300"
                                                    placeholder="e.g. ultra_gloss"
                                                />
                                            </div>
                                            <button
                                                onClick={handleAdd}
                                                className="px-10 py-5 bg-gray-950 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 h-[64px]"
                                            >
                                                Publish
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-950 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-gray-950/10">
                                                {categories.find(c => c.id === activeTab)?.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black uppercase tracking-tighter text-gray-950">{categories.find(c => c.id === activeTab)?.label} Index</h3>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5 italic">Synchronized Manufacturing Records</p>
                                            </div>
                                        </div>
                                        <span className="bg-gray-950 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">{filteredConfigs.length} Registered</span>
                                    </div>

                                    {loading ? (
                                        <div className="p-20 flex flex-col items-center gap-4">
                                            <Loader2 className="animate-spin text-emerald-500" size={32} />
                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Accessing Secure Vault...</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 divide-y divide-gray-50">
                                            <AnimatePresence mode="popLayout">
                                                {filteredConfigs.map((config, idx) => (
                                                    <motion.div
                                                        key={config._id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 10 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        className="p-8 flex items-center justify-between group hover:bg-gray-50/50 transition-all"
                                                    >
                                                        <div className="flex items-center gap-8">
                                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[10px] font-black text-gray-400 border border-gray-100 group-hover:bg-white transition-colors">
                                                                {idx + 1}
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-lg font-black uppercase tracking-tight text-gray-950">{config.label}</p>
                                                                <div className="flex items-center gap-4">
                                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Key: <span className="text-emerald-600">{config.value}</span></span>
                                                                    <div className="w-1 h-1 bg-gray-200 rounded-full" />
                                                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">ID: {config._id.slice(-6)}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() => handleDelete(config._id)}
                                                            className="p-4 rounded-2xl text-gray-200 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>

                                            {filteredConfigs.length === 0 && (
                                                <div className="p-32 text-center space-y-6">
                                                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200 border border-dashed border-gray-200">
                                                        <Database size={40} />
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No entries found</p>
                                                        <p className="text-gray-300 text-[10px] font-bold uppercase tracking-widest mt-2 italic">Database is ready for deployment</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                            </section>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="hierarchy"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="space-y-8"
                        >
                            <div className="bg-gray-950 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-20 opacity-10 rotate-12">
                                    <LayoutGrid size={200} />
                                </div>
                                <div className="relative z-10 max-w-2xl space-y-6">
                                    <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">Hierarchy <span className="text-emerald-400 italic">Explorer</span></h2>
                                    <p className="text-gray-400 font-medium leading-relaxed uppercase tracking-widest text-xs">Search through {hierarchyCategories.length} categories and thousands of manufacturing specifications currently active in your ecosystem.</p>
                                    
                                    <div className="relative">
                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                        <input 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search Categories (e.g. Bakery, Agarbatti...)"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-8 text-lg font-black tracking-tight focus:bg-white/10 focus:border-emerald-400 outline-none transition-all placeholder:text-gray-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                {/* Category List */}
                                <div className="lg:col-span-4 space-y-4">
                                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 px-2">Registered Industries</h3>
                                        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                            {filteredHierarchy.map(cat => (
                                                <button
                                                    key={cat}
                                                    onClick={() => setSelectedCategory(cat)}
                                                    className={`w-full text-left p-5 rounded-2xl transition-all flex items-center justify-between group ${selectedCategory === cat ? 'bg-emerald-500 text-white shadow-lg' : 'hover:bg-gray-50 text-gray-600'}`}
                                                >
                                                    <span className="font-black uppercase tracking-tight text-sm">{cat}</span>
                                                    <span className={`text-[9px] font-black px-2 py-1 rounded-md ${selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                        {Object.keys(hierarchyData[cat]).length} SUBS
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Deep Specs View */}
                                <div className="lg:col-span-8">
                                    <AnimatePresence mode="wait">
                                        {selectedCategory ? (
                                            <motion.div 
                                                key={selectedCategory}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 min-h-[700px]"
                                            >
                                                <div className="flex items-center justify-between mb-12 border-b border-gray-50 pb-8">
                                                    <div>
                                                        <h3 className="text-4xl font-black uppercase tracking-tighter text-gray-950">{selectedCategory}</h3>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 italic">Sub-Category & Dimension Mapping</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-10">
                                                    {Object.entries(hierarchyData[selectedCategory]).map(([sub, specs]) => (
                                                        <div key={sub} className="space-y-4">
                                                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 flex items-center gap-3 px-2">
                                                                <div className="w-6 h-px bg-emerald-200" /> {sub}
                                                            </h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {specs.map((spec, i) => (
                                                                    <div key={i} className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-emerald-200 transition-all group">
                                                                        <p className="text-xs font-bold text-gray-600 group-hover:text-gray-950 transition-colors uppercase tracking-tight leading-relaxed">{spec || "Standard Multi-Size"}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <div className="bg-white rounded-[2.5rem] border border-dashed border-gray-200 p-20 flex flex-col items-center justify-center text-center h-full min-h-[700px]">
                                                <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-200 mb-8">
                                                    <Filter size={40} />
                                                </div>
                                                <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-400">Select Industry Domain</h3>
                                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2 max-w-[300px] leading-loose">Choose a category from the sidebar to inspect its manufacturing blueprint and specifications.</p>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
            <ConfirmModal
                open={confirm.open}
                title={confirm.title}
                subText={confirm.subText}
                confirmLabel={confirm.confirmLabel}
                onConfirm={() => { if (confirm.onConfirm) confirm.onConfirm(); }}
                onCancel={closeConfirm}
            />
        </div>
    );
}
