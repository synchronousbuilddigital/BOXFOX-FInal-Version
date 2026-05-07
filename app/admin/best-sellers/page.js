"use client";
import React, { useState, useEffect } from "react";
import { Search, Plus, Trash2, Save, GripVertical, Info, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BestSellersAdmin() {
    const [allProducts, setAllProducts] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all products for selection
                const prodRes = await fetch("/api/products?admin=true&limit=200");
                const prodData = await prodRes.json();

                // Fetch current best sellers
                const bsRes = await fetch("/api/admin/best-sellers");
                const bsData = await bsRes.json();

                if (Array.isArray(prodData)) {
                    setAllProducts(prodData);
                }
                if (Array.isArray(bsData)) {
                    setBestSellers(bsData);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(""), 3000);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/best-sellers", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bestSellers })
            });
            if (res.ok) {
                showNotification("Best sellers updated successfully!");
            } else {
                showNotification("Failed to update best sellers.");
            }
        } catch (error) {
            console.error("Save error:", error);
            showNotification("Error saving best sellers.");
        } finally {
            setSaving(false);
        }
    };

    const addProduct = (product) => {
        if (bestSellers.find(p => p._id === product._id)) {
            showNotification("Product already in best sellers.");
            return;
        }
        if (bestSellers.length >= 10) {
            showNotification("Maximum 10 best sellers allowed.");
            return;
        }
        setBestSellers([...bestSellers, {
            _id: product._id,
            id: product.id,
            name: product.name,
            img: product.img,
            price: product.price
        }]);
    };

    const removeProduct = (productId) => {
        setBestSellers(bestSellers.filter(p => p._id !== productId));
    };

    const moveUp = (index) => {
        if (index === 0) return;
        const newArr = [...bestSellers];
        const temp = newArr[index];
        newArr[index] = newArr[index - 1];
        newArr[index - 1] = temp;
        setBestSellers(newArr);
    };

    const moveDown = (index) => {
        if (index === bestSellers.length - 1) return;
        const newArr = [...bestSellers];
        const temp = newArr[index];
        newArr[index] = newArr[index + 1];
        newArr[index + 1] = temp;
        setBestSellers(newArr);
    };

    const filteredProducts = allProducts.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id?.toString().includes(searchQuery)
    );

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Best Sellers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-950 tracking-tighter uppercase leading-none">Best Sellers</h1>
                    <p className="text-gray-400 font-medium tracking-tight mt-1">Manage the Top 10 products shown on the homepage.</p>
                </div>
                <div className="flex items-center gap-4">
                    {notification && (
                        <div className="px-4 py-2 bg-emerald-50 text-emerald-600 font-bold text-xs uppercase tracking-widest rounded-xl border border-emerald-100">
                            {notification}
                        </div>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-4 bg-gray-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-gray-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save size={16} />
                        )}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Available Products Column */}
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col h-[700px]">
                    <div className="mb-6">
                        <h2 className="text-xl font-black text-gray-950 flex items-center gap-2">
                            <Search size={20} className="text-emerald-500" /> Available Products
                        </h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Search to add</p>
                    </div>

                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 border border-transparent rounded-2xl pl-12 pr-6 py-4 font-bold text-gray-950 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {filteredProducts.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 font-bold">No products found.</div>
                        ) : (
                            filteredProducts.map((product) => {
                                const isAdded = bestSellers.some(p => p._id === product._id);
                                return (
                                    <div key={product._id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${isAdded ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-md'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                                                <img src={product.img || product.images?.[0] || "https://boxfox.in/wp-content/uploads/2022/11/Mailer_Box_Mockup_1-copy-scaled.jpg"} alt={product.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-black text-gray-950 truncate tracking-tight">{product.name}</h3>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{product.price}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => addProduct(product)}
                                            disabled={isAdded}
                                            className={`p-2 rounded-xl transition-all ${isAdded ? 'text-gray-400 cursor-not-allowed' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Selected Best Sellers Column */}
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col h-[700px]">
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-black text-gray-950 flex items-center gap-2">
                                <Star size={20} className="text-emerald-500" fill="currentColor" /> Current Best Sellers
                            </h2>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                                {bestSellers.length} / 10 Selected
                            </p>
                        </div>
                        <div className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                            <Info size={12} />
                            Max 10 items
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2">
                        {bestSellers.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                                    <Star size={24} className="text-gray-300" />
                                </div>
                                <p className="font-bold">No best sellers selected</p>
                                <p className="text-xs">Search and add products from the left panel.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {bestSellers.map((item, idx) => (
                                        <motion.div
                                            key={item._id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm group hover:border-emerald-200 transition-colors"
                                        >
                                            <div className="flex flex-col gap-1 items-center justify-center shrink-0">
                                                <button onClick={() => moveUp(idx)} disabled={idx === 0} className="text-gray-300 hover:text-gray-600 disabled:opacity-30 p-0.5">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
                                                </button>
                                                <div className="w-5 h-5 flex items-center justify-center bg-gray-100 rounded text-[10px] font-black text-gray-400">{idx + 1}</div>
                                                <button onClick={() => moveDown(idx)} disabled={idx === bestSellers.length - 1} className="text-gray-300 hover:text-gray-600 disabled:opacity-30 p-0.5">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                </button>
                                            </div>

                                            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                                                <img src={item.img || "https://boxfox.in/wp-content/uploads/2022/11/Mailer_Box_Mockup_1-copy-scaled.jpg"} alt={item.name} className="w-full h-full object-cover" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-sm font-black text-gray-950 truncate tracking-tight">{item.name}</h3>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{item.price}</p>
                                            </div>

                                            <button
                                                onClick={() => removeProduct(item._id)}
                                                className="p-2 text-red-300 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all shrink-0 opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
