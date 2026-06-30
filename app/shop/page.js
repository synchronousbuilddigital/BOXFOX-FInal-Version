"use client";
import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ChevronDown, SlidersHorizontal, ArrowUpDown, X, Check } from "lucide-react";
import ProductSection from "../components/ProductSection";

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

    const [allProducts, setAllProducts] = useState([]);
    const [categories, setCategories] = useState(["All"]);
    const [categorySearchQuery, setCategorySearchQuery] = useState("");
    const [showFilterDrawer, setShowFilterDrawer] = useState(false);

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

    const activeFiltersCount = (priceRange !== "all" ? 1 : 0) + (sortBy !== "default" ? 1 : 0) + (category !== "All" ? 1 : 0);

    // Sync state from URL when it changes (e.g. Back button)
    useEffect(() => {
        const urlCat = searchParams.get('category') || "All";
        const urlPrice = searchParams.get('price') || "all";
        const urlSort = searchParams.get('sort') || "default";

        if (urlCat !== category) setCategoryState(urlCat);
        if (urlPrice !== priceRange) setPriceRangeState(urlPrice);
        if (urlSort !== sortBy) setSortByState(urlSort);
    }, [searchParams]);

    // Optimized Search: Debounce search to reduce DB hits for scalability
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch all active products once to extract unique categories and calculate dynamic counts
    useEffect(() => {
        fetch('/api/products?all=true')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const activeProds = data.filter(p => p.isActive !== false);
                    setAllProducts(activeProds);
                    
                    // Extract unique categories
                    const uniqueCategories = [
                        "All",
                        ...Array.from(new Set(activeProds.map(p => p.category).filter(Boolean)))
                    ];
                    setCategories(uniqueCategories);
                }
            })
            .catch(err => {
                console.error("[ShopPage] Fetch failed:", err);
            });
    }, []);

    // Dynamically calculate category counts based on current search & priceRange filters
    const categoryCounts = useMemo(() => {
        const counts = { "All": allProducts.length };
        allProducts.forEach(p => {
            // Apply price filter to category counts to keep them synchronized
            let matchesPrice = true;
            if (priceRange !== "all") {
                const price = parseFloat(p.price) || 0;
                if (priceRange === "0-100") matchesPrice = price < 100;
                else if (priceRange === "100-300") matchesPrice = price >= 100 && price < 300;
                else if (priceRange === "300-500") matchesPrice = price >= 300 && price < 500;
                else if (priceRange === "500-1000") matchesPrice = price >= 500 && price < 1000;
                else if (priceRange === "1000+") matchesPrice = price >= 1000;
            }

            let matchesSearch = true;
            if (debouncedSearch) {
                const term = debouncedSearch.toLowerCase();
                matchesSearch = (p.name || '').toLowerCase().includes(term) || (p.sku || '').toLowerCase().includes(term);
            }

            if (matchesPrice && matchesSearch) {
                const cat = p.category || "Packaging";
                counts[cat] = (counts[cat] || 0) + 1;
                counts["All"] = (counts["All"] || 0) + 1;
            }
        });
        return counts;
    }, [allProducts, priceRange, debouncedSearch]);

    // Dynamically calculate price range counts based on current category & search filters
    const priceRangeCounts = useMemo(() => {
        const counts = { "all": 0, "0-100": 0, "100-300": 0, "300-500": 0, "500-1000": 0, "1000+": 0 };
        allProducts.forEach(p => {
            let matchesCategory = true;
            if (category !== "All") {
                matchesCategory = p.category === category;
            }

            let matchesSearch = true;
            if (debouncedSearch) {
                const term = debouncedSearch.toLowerCase();
                matchesSearch = (p.name || '').toLowerCase().includes(term) || (p.sku || '').toLowerCase().includes(term);
            }

            if (matchesCategory && matchesSearch) {
                const price = parseFloat(p.price) || 0;
                counts["all"]++;
                if (price < 100) counts["0-100"]++;
                else if (price >= 100 && price < 300) counts["100-300"]++;
                else if (price >= 300 && price < 500) counts["300-500"]++;
                else if (price >= 500 && price < 1000) counts["500-1000"]++;
                else if (price >= 1000) counts["1000+"]++;
            }
        });
        return counts;
    }, [allProducts, category, debouncedSearch]);

    // Filter categories dynamically based on category search box
    const filteredCategories = useMemo(() => {
        return categories.filter(cat => 
            cat.toLowerCase().includes(categorySearchQuery.toLowerCase())
        );
    }, [categories, categorySearchQuery]);

    // Count showing products
    const filteredProductsCount = useMemo(() => {
        return allProducts.filter(p => {
            let matchesCategory = category === "All" || p.category === category;
            let matchesPrice = true;
            if (priceRange !== "all") {
                const price = parseFloat(p.price) || 0;
                if (priceRange === "0-100") matchesPrice = price < 100;
                else if (priceRange === "100-300") matchesPrice = price >= 100 && price < 300;
                else if (priceRange === "300-500") matchesPrice = price >= 300 && price < 500;
                else if (priceRange === "500-1000") matchesPrice = price >= 500 && price < 1000;
                else if (priceRange === "1000+") matchesPrice = price >= 1000;
            }
            let matchesSearch = true;
            if (debouncedSearch) {
                const term = debouncedSearch.toLowerCase();
                matchesSearch = (p.name || '').toLowerCase().includes(term) || (p.sku || '').toLowerCase().includes(term);
            }
            return matchesCategory && matchesPrice && matchesSearch;
        }).length;
    }, [allProducts, category, priceRange, debouncedSearch]);

    return (
        <div className="min-h-screen bg-slate-50/50 selection:bg-emerald-500 selection:text-white">
            <Navbar />
            <main className="pt-[88px] sm:pt-[96px] pb-16 sm:pb-24">
                <header className="px-4 sm:px-6 lg:px-12 max-w-[1600px] mx-auto mb-8 sm:mb-12">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-200/80">
                        <div className="max-w-2xl">
                            <motion.h1
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl sm:text-6xl md:text-7xl font-black text-gray-950 tracking-tighter uppercase leading-[0.9]"
                            >
                                The <span className="text-emerald-500">Shop.</span>
                            </motion.h1>
                            <p className="text-xs sm:text-sm md:text-base text-gray-500 font-medium mt-2 leading-relaxed max-w-xl">
                                Discover our collection of precision-crafted packaging solutions. Sustainable materials, premium rigid displays, and food-safe box designs.
                            </p>
                        </div>

                        <div className="w-full lg:w-auto flex items-center gap-2.5">
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                className="relative group flex-grow lg:w-[420px]"
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-2xl opacity-15 group-hover:opacity-30 group-focus-within:opacity-30 blur transition duration-300"></div>
                                <div className="relative flex items-center gap-2.5 sm:gap-3 bg-white border border-gray-200 rounded-2xl px-4 sm:px-5 py-3 w-full shadow-sm hover:border-gray-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15 transition-all">
                                    <Search size={18} className="text-gray-400 shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-transparent outline-none w-full font-semibold text-xs tracking-wide text-gray-950 placeholder:text-gray-400"
                                    />
                                    {searchQuery && (
                                        <button onClick={() => setSearchQuery("")} className="p-1 hover:bg-gray-150 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </motion.div>

                            <button
                                onClick={() => setShowFilterDrawer(true)}
                                className="lg:hidden shrink-0 flex items-center justify-center gap-1.5 px-3.5 py-3 bg-white border border-gray-200 rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest text-gray-800 shadow-sm hover:border-gray-300 transition-all hover:bg-gray-50 active:scale-95"
                            >
                                <Filter size={14} className="text-emerald-500" />
                                <span>Filter & Sort</span>
                                {activeFiltersCount > 0 && (
                                    <span className="w-4.5 h-4.5 bg-emerald-500 text-white text-[8px] font-black rounded-full flex items-center justify-center ml-0.5">{activeFiltersCount}</span>
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                <div className="px-4 sm:px-6 lg:px-12 max-w-[1600px] mx-auto">
                    <div className="flex flex-col lg:flex-row gap-10">
                        
                        {/* Desktop Sidebar Filters */}
                        <aside className="w-[260px] xl:w-[290px] shrink-0 hidden lg:block self-start sticky top-[100px] max-h-[calc(100vh-140px)] overflow-y-auto pr-3 custom-scrollbar space-y-8 pb-4">
                            {/* Categories Filter */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Categories</h3>
                                
                                {categories.length > 8 && (
                                    <div className="relative mb-3">
                                        <input
                                            type="text"
                                            placeholder="Filter categories..."
                                            value={categorySearchQuery}
                                            onChange={(e) => setCategorySearchQuery(e.target.value)}
                                            className="w-full bg-white border border-gray-200/80 rounded-xl px-3 py-2 text-[10px] font-bold text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-500/50 transition-colors"
                                        />
                                        {categorySearchQuery && (
                                            <button onClick={() => setCategorySearchQuery("")} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">
                                                <X size={12} />
                                            </button>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
                                    {filteredCategories.map((cat) => {
                                        const isActive = category === cat;
                                        const count = categoryCounts[cat] || 0;
                                        return (
                                            <button
                                                key={cat}
                                                onClick={() => setCategory(cat)}
                                                className={`w-full flex items-center justify-between text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                                    isActive
                                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/10'
                                                        : 'text-gray-600 hover:text-gray-950 hover:bg-white border border-transparent hover:border-gray-200/50'
                                                }`}
                                            >
                                                <span className="truncate pr-2">{cat}</span>
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                                                    isActive ? 'bg-emerald-700 text-emerald-100' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Price Ranges Filter */}
                            <div className="space-y-4 pt-6 border-t border-gray-200/60">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Price</h3>
                                <div className="space-y-1.5">
                                    {PRICE_RANGES.map((range) => {
                                        const isActive = priceRange === range.value;
                                        const count = priceRangeCounts[range.value] || 0;
                                        return (
                                            <button
                                                key={range.value}
                                                onClick={() => setPriceRange(range.value)}
                                                className={`w-full flex items-center text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                                                    isActive
                                                        ? 'bg-white border-emerald-500 text-emerald-700 shadow-sm'
                                                        : 'bg-transparent border-transparent text-gray-600 hover:text-gray-950 hover:bg-white hover:border-gray-200/50'
                                                }`}
                                            >
                                                <div className={`w-4 h-4 rounded-md border flex items-center justify-center mr-3 transition-colors ${
                                                    isActive ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 bg-white'
                                                }`}>
                                                    {isActive && <Check size={10} strokeWidth={4} />}
                                                </div>
                                                <span className="grow truncate">{range.label}</span>
                                                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                                                    isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                                                }`}>
                                                    {count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Sort Filter */}
                            <div className="space-y-4 pt-6 border-t border-gray-200/60">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Sort By</h3>
                                <div className="space-y-1.5">
                                    {SORT_OPTIONS.map((option) => {
                                        const isActive = sortBy === option.value;
                                        return (
                                            <button
                                                key={option.value}
                                                onClick={() => setSortBy(option.value)}
                                                className={`w-full flex items-center text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                                                    isActive
                                                        ? 'bg-white border-emerald-500 text-emerald-700 shadow-sm'
                                                        : 'bg-transparent border-transparent text-gray-600 hover:text-gray-950 hover:bg-white hover:border-gray-200/50'
                                                }`}
                                            >
                                                <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${
                                                    isActive ? 'border-emerald-500' : 'border-gray-300 bg-white'
                                                }`}>
                                                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                                                </div>
                                                <span className="truncate">{option.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {activeFiltersCount > 0 && (
                                <button
                                    onClick={() => {
                                        setCategory("All");
                                        setPriceRange("all");
                                        setSortBy("default");
                                        setSearchQuery("");
                                    }}
                                    className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 hover:border-red-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                    <X size={12} /> Clear all filters ({activeFiltersCount})
                                </button>
                            )}
                        </aside>

                        {/* Main Feed Container */}
                        <div className="grow">
                            
                            {/* Toolbar: Mobile Filters trigger and active filters tags */}
                            <div className="flex flex-col gap-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
                                            Showing <span className="text-gray-800 font-black">{filteredProductsCount}</span> products
                                        </p>
                                    </div>
                                </div>

                                {/* Active filters badges row */}
                                {activeFiltersCount > 0 && (
                                    <div className="flex flex-wrap items-center gap-2 px-1 sm:px-0">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mr-1">Active:</span>
                                        
                                        {category !== "All" && (
                                            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/50 text-emerald-700 rounded-full px-3 py-1.5 shadow-2xs">
                                                <span className="text-[9px] font-black uppercase tracking-widest">{category}</span>
                                                <button onClick={() => setCategory("All")} className="hover:text-emerald-900 transition-colors">
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        )}

                                        {priceRange !== "all" && (
                                            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/50 text-emerald-700 rounded-full px-3 py-1.5 shadow-2xs">
                                                <span className="text-[9px] font-black uppercase tracking-widest">{PRICE_RANGES.find(p => p.value === priceRange)?.label}</span>
                                                <button onClick={() => setPriceRange("all")} className="hover:text-emerald-900 transition-colors">
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        )}

                                        {sortBy !== "default" && (
                                            <div className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-full px-3 py-1.5 shadow-2xs">
                                                <span className="text-[9px] font-black uppercase tracking-widest">{SORT_OPTIONS.find(s => s.value === sortBy)?.label}</span>
                                                <button onClick={() => setSortBy("default")} className="hover:text-gray-900 transition-colors">
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        )}

                                        {searchQuery && (
                                            <div className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-full px-3 py-1.5 shadow-2xs">
                                                <span className="text-[9px] font-black uppercase tracking-widest">Search: &quot;{searchQuery}&quot;</span>
                                                <button onClick={() => setSearchQuery("")} className="hover:text-gray-900 transition-colors">
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => {
                                                setCategory("All");
                                                setPriceRange("all");
                                                setSortBy("default");
                                                setSearchQuery("");
                                            }}
                                            className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors py-1.5 px-2.5 rounded-full hover:bg-red-50"
                                        >
                                            Clear all
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Product List Section */}
                            <ProductSection 
                                searchQuery={debouncedSearch} 
                                category={category} 
                                priceRange={priceRange} 
                                sortBy={sortBy} 
                            />
                        </div>

                    </div>
                </div>

                {/* Mobile Filters Drawer Slideout Sheet */}
                <AnimatePresence>
                    {showFilterDrawer && (
                        <>
                            {/* Backdrop overlay */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.4 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowFilterDrawer(false)}
                                className="fixed inset-0 bg-gray-950 z-[9999]"
                            />
                            
                            {/* Bottom drawer sheet */}
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="fixed bottom-0 inset-x-0 bg-white rounded-t-[2.5rem] z-[10000] p-6 max-h-[85vh] overflow-y-auto flex flex-col shadow-2xl"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6 shrink-0">
                                    <div className="flex items-center gap-2">
                                        <SlidersHorizontal size={16} className="text-emerald-500" />
                                        <h3 className="text-sm font-black uppercase tracking-wider text-gray-950">Filters & Sort</h3>
                                    </div>
                                    <button 
                                        onClick={() => setShowFilterDrawer(false)} 
                                        className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                {/* Content Scroll Area */}
                                <div className="space-y-8 overflow-y-auto pr-1 pb-6 grow">
                                    {/* Categories filter */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Categories</h4>
                                        <div className="relative mb-2">
                                            <input
                                                type="text"
                                                placeholder="Search categories..."
                                                value={categorySearchQuery}
                                                onChange={(e) => setCategorySearchQuery(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-gray-800 placeholder-gray-400 outline-none"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1">
                                            {filteredCategories.map((cat) => {
                                                const isActive = category === cat;
                                                const count = categoryCounts[cat] || 0;
                                                return (
                                                    <button
                                                        key={cat}
                                                        onClick={() => setCategory(cat)}
                                                        className={`px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all text-center truncate flex items-center justify-between ${
                                                            isActive
                                                                ? 'bg-emerald-600 text-white'
                                                                : 'bg-gray-50 text-gray-600 border border-transparent'
                                                        }`}
                                                    >
                                                        <span className="truncate pr-1">{cat}</span>
                                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${
                                                            isActive ? 'bg-emerald-700 text-emerald-100' : 'bg-gray-200/60 text-gray-500'
                                                        }`}>
                                                            {count}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Price ranges filter */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Price Ranges</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {PRICE_RANGES.map((range) => {
                                                const isActive = priceRange === range.value;
                                                const count = priceRangeCounts[range.value] || 0;
                                                return (
                                                    <button
                                                        key={range.value}
                                                        onClick={() => setPriceRange(range.value)}
                                                        className={`px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all text-left flex items-center justify-between border ${
                                                            isActive
                                                                ? 'bg-white border-emerald-500 text-emerald-700'
                                                                : 'bg-gray-50 border-transparent text-gray-600'
                                                        }`}
                                                    >
                                                        <span className="truncate">{range.label}</span>
                                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${
                                                            isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-200/60 text-gray-400'
                                                        }`}>
                                                            {count}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Sort Options */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sort By</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {SORT_OPTIONS.map((option) => {
                                                const isActive = sortBy === option.value;
                                                return (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => setSortBy(option.value)}
                                                        className={`px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all text-center ${
                                                            isActive
                                                                ? 'bg-gray-950 text-white'
                                                                : 'bg-gray-50 text-gray-600'
                                                        }`}
                                                    >
                                                        {option.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Drawer Footer sticky triggers */}
                                <div className="pt-4 border-t border-gray-100 flex gap-3 shrink-0">
                                    {activeFiltersCount > 0 && (
                                        <button
                                            onClick={() => {
                                                setCategory("All");
                                                setPriceRange("all");
                                                setSortBy("default");
                                                setSearchQuery("");
                                                setShowFilterDrawer(false);
                                            }}
                                            className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
                                        >
                                            Reset All
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setShowFilterDrawer(false)}
                                        className="flex-2 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/10 text-center"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
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
