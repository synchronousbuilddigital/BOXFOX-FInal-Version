"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, Filter, ChevronDown, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import ProductSection from "../components/ProductSection";

// Canonical category order — matches home page CategorySection exactly
const CATEGORY_ORDER = [
    "All",
    "Pizza Box",
    "Cake Box",
    "Burger Box",
    "Food Box",
    "Wok Box",
    "CupCake",
    "CupCake + Bento",
    "Gifting",
    "Hamper Box",
    "Platter",
    "Loaf",
    "Pastry",
    "Chocolate Box",
    "Macaron",
    "Brownie",
    "Wrap Box",
    "Popcorn",
    "Carry Bag",
];

const PRICE_RANGES = [
    { value: "all",      label: "All Prices" },
    { value: "0-100",    label: "Under ₹100" },
    { value: "100-300",  label: "₹100 – ₹300" },
    { value: "300-500",  label: "₹300 – ₹500" },
    { value: "500-1000", label: "₹500 – ₹1,000" },
    { value: "1000+",    label: "Above ₹1,000" },
];

const SORT_OPTIONS = [
    { value: "default",    label: "Default" },
    { value: "price-asc",  label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "name-asc",   label: "Name: A – Z" },
    { value: "name-desc",  label: "Name: Z – A" },
];

function ShopPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    
    // Initialize state from URL params
    const [category, setCategoryState] = useState(() => searchParams.get('category') || "All");
    const [priceRange, setPriceRangeState] = useState(() => searchParams.get('price') || "all");
    const [sortBy, setSortByState] = useState(() => searchParams.get('sort') || "default");

    const [categories, setCategories] = useState(CATEGORY_ORDER);
    const [totalProducts, setTotalProducts] = useState(0);
    const [showFilter, setShowFilter] = useState(false); // false | 'cat' | 'filters'

    // Unified URL update helper
    const updateURL = (newParams) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newParams).forEach(([key, value]) => {
            if (value === null || value === "All" || value === "all" || value === "default") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        router.push(`/shop?${params.toString()}`, { scroll: false });
    };

    const setCategory = (val) => { setCategoryState(val); updateURL({ category: val }); };
    const setPriceRange = (val) => { setPriceRangeState(val); updateURL({ price: val }); };
    const setSortBy = (val) => { setSortByState(val); updateURL({ sort: val }); };

    const activeFiltersCount = (priceRange !== "all" ? 1 : 0) + (sortBy !== "default" ? 1 : 0);

    // Sync state from URL when it changes (e.g. Back button)
    useEffect(() => {
        const urlCat = searchParams.get('category') || "All";
        const urlPrice = searchParams.get('price') || "all";
        const urlSort = searchParams.get('sort') || "default";

        if (urlCat !== category) setCategoryState(urlCat);
        if (urlPrice !== priceRange) setPriceRangeState(urlPrice);
        if (urlSort !== sortBy) setSortByState(urlSort);
    }, [searchParams]);

    // Optimized Search: Debounce search to reduce DB hits for 10k+ scalability
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 400); // 400ms delay
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        fetch('/api/products?all=true')
            .then(res => res.json())
            .then(data => {
                console.log("[ShopPage] API Response:", data);
                
                if (Array.isArray(data)) {
                    console.log("[ShopPage] Data is array with length:", data.length);
                    // Handle both flat array and sections structure
                    let total = 0;
                    if (data.length > 0 && data[0].items) {
                        // Sections structure - sum items from all sections
                        total = data.reduce((acc, section) => acc + (section.items?.length || 0), 0);
                        console.log("[ShopPage] Detected sections structure, total:", total);
                    } else {
                        // Flat array of products
                        total = data.length;
                        console.log("[ShopPage] Detected flat array, total:", total);
                    }
                    setTotalProducts(total);
                } else if (data.error) {
                    console.warn("[ShopPage] API returned connection error:", data.error);
                } else {
                    console.error("[ShopPage] API returned unexpected format:", data);
                }
            })
            .catch(err => {
                console.error("[ShopPage] Fetch failed:", err);
            });
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <main className="pt-[110px] sm:pt-[120px] pb-12 sm:pb-16">
                <header className="px-4 sm:px-6 lg:px-12 mb-0.5 sm:mb-2 max-w-[1600px] mx-auto border-b border-gray-100 pb-2 sm:pb-3">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 sm:gap-12">
                        <div className="max-w-2xl text-center lg:text-left">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-gray-950 tracking-tighter uppercase leading-[0.85] sm:leading-[0.8]"
                            >
                                The<br /><span className="text-emerald-500">Shop.</span>
                            </motion.h1>
                            <p className="text-[10px] sm:text-xl text-gray-400 font-medium mt-1 sm:mt-2 leading-relaxed px-4 sm:px-0 max-w-xl">
                                Discover <span className="text-emerald-600 font-black">{totalProducts}+ precision-crafted</span> packaging solutions. From sustainable food boxes to premium gift packaging, engineered for freshness, durability, and brand excellence.
                            </p>
                        </div>

                        <div className="w-full lg:w-auto space-y-6">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="relative group w-full lg:w-[500px]"
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-emerald-900 rounded-[1.6rem] sm:rounded-[2.1rem] opacity-20 group-hover:opacity-100 group-focus-within:opacity-100 blur transition duration-500 group-hover:duration-200"></div>
                                <div className="relative flex items-center gap-3 sm:gap-4 bg-white border border-emerald-800/20 rounded-[1.5rem] sm:rounded-[2rem] px-5 sm:px-8 py-3 sm:py-6 w-full shadow-sm group-hover:bg-white transition-all">
                                    <Search size={20} className="text-emerald-800 transition-colors sm:w-6 sm:h-6" />
                                    <input
                                        type="text"
                                        placeholder="Search specific models..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-transparent outline-none w-full font-black text-[10px] sm:text-xs uppercase tracking-widest text-gray-950 placeholder:text-gray-400"
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Desktop Filter Bar */}
                    <div className="hidden lg:block mt-6">
                        {/* Category Row */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`whitespace-nowrap px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.18em] transition-all duration-200 flex-shrink-0 ${
                                        category === cat
                                            ? 'bg-gray-950 text-white shadow-lg'
                                            : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50 border border-gray-150'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Price + Sort + Clear row */}
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                            {/* Price Range dropdown */}
                            <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-150 rounded-2xl px-4 py-2.5 hover:border-gray-300 transition-colors">
                                <SlidersHorizontal size={13} className="text-gray-400 shrink-0" />
                                <select
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(e.target.value)}
                                    className="bg-transparent text-[10px] font-black uppercase tracking-widest text-gray-700 outline-none cursor-pointer pr-1"
                                >
                                    {PRICE_RANGES.map((pr) => (
                                        <option key={pr.value} value={pr.value}>{pr.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort By dropdown */}
                            <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-150 rounded-2xl px-4 py-2.5 hover:border-gray-300 transition-colors">
                                <ArrowUpDown size={13} className="text-gray-400 shrink-0" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-transparent text-[10px] font-black uppercase tracking-widest text-gray-700 outline-none cursor-pointer pr-1"
                                >
                                    {SORT_OPTIONS.map((so) => (
                                        <option key={so.value} value={so.value}>{so.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Active filter tags */}
                            {priceRange !== "all" && (
                                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full px-3 py-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest">{PRICE_RANGES.find(p => p.value === priceRange)?.label}</span>
                                    <button onClick={() => setPriceRange("all")} className="hover:text-emerald-900 transition-colors">
                                        <X size={10} />
                                    </button>
                                </div>
                            )}
                            {sortBy !== "default" && (
                                <div className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-full px-3 py-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest">{SORT_OPTIONS.find(s => s.value === sortBy)?.label}</span>
                                    <button onClick={() => setSortBy("default")} className="hover:text-gray-900 transition-colors">
                                        <X size={10} />
                                    </button>
                                </div>
                            )}

                            {activeFiltersCount > 0 && (
                                <button
                                    onClick={() => { setPriceRange("all"); setSortBy("default"); }}
                                    className="ml-auto text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
                                >
                                    <X size={10} /> Clear all
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mobile Filter UI */}
                    <div className="lg:hidden mt-5 relative z-50">
                        <div className="flex gap-2">
                            {/* Category pill trigger */}
                            <button
                                onClick={() => setShowFilter(showFilter === 'cat' ? false : 'cat')}
                                className={`flex-1 flex items-center justify-between px-5 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                                    showFilter === 'cat' ? 'bg-gray-950 text-white border-gray-950' : 'bg-white text-gray-700 border-gray-200'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <Filter size={13} className={showFilter === 'cat' ? 'text-emerald-400' : 'text-gray-400'} />
                                    {category === "All" ? "Category" : category}
                                </span>
                                <ChevronDown size={13} className={`transition-transform ${showFilter === 'cat' ? 'rotate-180 opacity-60' : 'opacity-40'}`} />
                            </button>

                            {/* Price + Sort trigger */}
                            <button
                                onClick={() => setShowFilter(showFilter === 'filters' ? false : 'filters')}
                                className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border relative ${
                                    showFilter === 'filters' ? 'bg-gray-950 text-white border-gray-950' : 'bg-white text-gray-700 border-gray-200'
                                }`}
                            >
                                <SlidersHorizontal size={13} className={showFilter === 'filters' ? 'text-emerald-400' : 'text-gray-400'} />
                                Filters
                                {activeFiltersCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">{activeFiltersCount}</span>
                                )}
                            </button>
                        </div>

                        <AnimatePresence>
                            {showFilter === 'cat' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-3xl shadow-2xl shadow-gray-200/80 overflow-y-auto max-h-[70vh] p-3 z-50"
                                >
                                    <div className="grid grid-cols-3 gap-1.5 mb-3">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setCategory(cat)}
                                                className={`px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all text-center ${
                                                    category === cat
                                                        ? 'bg-gray-950 text-white'
                                                        : 'bg-gray-50 text-gray-500 active:bg-gray-100'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => setShowFilter(false)}
                                        className="w-full py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                                    >
                                        Done
                                    </button>
                                </motion.div>
                            )}

                            {showFilter === 'filters' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-3xl shadow-2xl shadow-gray-200/80 p-4 space-y-6 z-50"
                                >
                                    {/* Price Range */}
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400 mb-3 flex items-center gap-1.5">
                                            <SlidersHorizontal size={9} className="text-emerald-500" /> Price Range
                                        </p>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {PRICE_RANGES.map((pr) => (
                                                <button
                                                    key={pr.value}
                                                    onClick={() => setPriceRange(pr.value)}
                                                    className={`px-2 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all text-center ${
                                                        priceRange === pr.value
                                                            ? 'bg-emerald-500 text-white'
                                                            : 'bg-gray-50 text-gray-500'
                                                    }`}
                                                >
                                                    {pr.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sort By */}
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400 mb-3 flex items-center gap-1.5">
                                            <ArrowUpDown size={9} className="text-emerald-500" /> Sort By
                                        </p>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {SORT_OPTIONS.map((so) => (
                                                <button
                                                    key={so.value}
                                                    onClick={() => setSortBy(so.value)}
                                                    className={`px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all text-center ${
                                                        sortBy === so.value
                                                            ? 'bg-gray-950 text-white'
                                                            : 'bg-gray-50 text-gray-500'
                                                    }`}
                                                >
                                                    {so.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-2 flex flex-col gap-2">
                                        <button 
                                            onClick={() => setShowFilter(false)}
                                            className="w-full py-4 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                                        >
                                            Apply Filters
                                        </button>
                                        {activeFiltersCount > 0 && (
                                            <button
                                                onClick={() => { setPriceRange("all"); setSortBy("default"); setShowFilter(false); }}
                                                className="w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-red-400 bg-red-50 flex items-center justify-center gap-1.5"
                                            >
                                                <X size={9} /> Clear Filters
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </header>

                <div className="px-4 sm:px-6 lg:px-12 max-w-[1600px] mx-auto">
                    <ProductSection searchQuery={debouncedSearch} category={category} priceRange={priceRange} sortBy={sortBy} />
                </div>
            </main>
        </div>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <ShopPageInner />
        </Suspense>
    );
}
