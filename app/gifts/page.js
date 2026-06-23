/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useRef, Suspense, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Gift, ArrowRight, CheckCircle2, Star, Zap, Shield, Heart, ChevronDown, Search, Filter, SlidersHorizontal, ArrowUpDown, X, Check } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
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

function GiftsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategoryState] = useState(() => searchParams.get('category') || "All");
  const [priceRange, setPriceRangeState] = useState(() => searchParams.get('price') || "all");
  const [sortBy, setSortByState] = useState(() => searchParams.get('sort') || "default");

  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Sync state from URL when it changes (e.g. Back button)
  useEffect(() => {
    const urlCat = searchParams.get('category') || "All";
    const urlPrice = searchParams.get('price') || "all";
    const urlSort = searchParams.get('sort') || "default";

    if (urlCat !== category) setCategoryState(urlCat);
    if (urlPrice !== priceRange) setPriceRangeState(urlPrice);
    if (urlSort !== sortBy) setSortByState(urlSort);
  }, [searchParams]);

  // Optimized Search: Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch all active products once to extract unique categories and calculate dynamic counts
  useEffect(() => {
    fetch('/api/products?all=true&targetPage=gift')
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
        console.error("[GiftsPage] Fetch failed:", err);
      });
  }, []);

  const updateURL = (newParams) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "All" || value === "all" || value === "default") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`/gifts?${params.toString()}`, { scroll: false });
  };

  const setCategory = (val) => { setCategoryState(val); updateURL({ category: val }); };
  const setPriceRange = (val) => { setPriceRangeState(val); updateURL({ price: val }); };
  const setSortBy = (val) => { setSortByState(val); updateURL({ sort: val }); };

  const activeFiltersCount = (priceRange !== "all" ? 1 : 0) + (sortBy !== "default" ? 1 : 0) + (category !== "All" ? 1 : 0);

  // Dynamically calculate category counts based on current search & priceRange filters
  const categoryCounts = useMemo(() => {
    const counts = { "All": allProducts.length };
    allProducts.forEach(p => {
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

      {/* Catalog Section */}
      <section className="pt-32 sm:pt-40 pb-24 bg-white border-b border-gray-150" id="catalog">
        <div className="max-w-7xl mx-auto px-6 lg:px-14 text-center mb-8">
          <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block italic font-bold">Catalog</span>
          <h2 className="text-5xl lg:text-7xl font-black text-gray-950 uppercase tracking-tighter mb-4">Custom Gift Options</h2>
          <p className="max-w-2xl mx-auto text-gray-500 text-sm sm:text-base font-medium leading-relaxed">
            Select a custom design from our library and tailor it to your exact specifications.
          </p>

          {/* Search bar inside the catalog header */}
          <div className="max-w-md mx-auto mt-8 px-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-2xl opacity-15 group-hover:opacity-30 group-focus-within:opacity-30 blur transition duration-300"></div>
              <div className="relative flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-5 py-3.5 w-full shadow-sm hover:border-gray-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15 transition-all">
                <Search size={18} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search custom designs..."
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
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 mt-12">
          <div className="flex flex-col lg:flex-row gap-10">
            
            {/* Desktop Sidebar Filters */}
            <aside className="w-[260px] xl:w-[290px] shrink-0 hidden lg:block self-start sticky top-[100px] max-h-[calc(100vh-140px)] overflow-y-auto pr-3 custom-scrollbar space-y-8 pb-4">
                {/* Categories Filter */}
                <div className="space-y-4 text-left">
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
                                            : 'text-gray-600 hover:text-gray-950 hover:bg-slate-50 border border-transparent hover:border-gray-200/50'
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
                <div className="space-y-4 pt-6 border-t border-gray-200/60 text-left">
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
                <div className="space-y-4 pt-6 border-t border-gray-200/60 text-left">
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
                    <div className="flex items-center justify-between text-left">
                        <div className="hidden lg:block">
                            <p className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
                                Showing <span className="text-gray-800 font-black">{filteredProductsCount}</span> products
                            </p>
                        </div>
                        
                        {/* Mobile Triggers */}
                        <div className="lg:hidden flex gap-2 w-full">
                            <button
                                onClick={() => setShowFilterDrawer(true)}
                                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-white border border-gray-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-800 shadow-sm"
                            >
                                <Filter size={14} className="text-emerald-500" />
                                Filters & Sort
                                {activeFiltersCount > 0 && (
                                    <span className="w-4.5 h-4.5 bg-emerald-500 text-white text-[8px] font-black rounded-full flex items-center justify-center ml-1">{activeFiltersCount}</span>
                                )}
                            </button>
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

                {/* Product Section displaying custom gift options */}
                <ProductSection 
                  targetPage="gift" 
                  searchQuery={debouncedSearch} 
                  category={category} 
                  priceRange={priceRange} 
                  sortBy={sortBy} 
                />
            </div>

          </div>
        </div>
      </section>

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
                          <div className="space-y-4 text-left">
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
                          <div className="space-y-4 text-left">
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
                          <div className="space-y-4 text-left">
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

      <section className="py-32 px-6 lg:px-14 bg-gray-50 border-t border-gray-100" id="quote">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20">
            <div className="space-y-8 text-left">
              <div>
                <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block italic">Custom Gifting</span>
                <h2 className="text-6xl lg:text-8xl font-black text-gray-950 uppercase tracking-tighter leading-[0.85]">Request a<br /><span className="text-emerald-500 italic">Quotation.</span></h2>
              </div>
              <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-md">Our gifting concierge will prepare a tailored proposal for your brand requirements. Expect a response within 4 working hours.</p>
              <div className="pt-12 border-t border-gray-200">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-4xl bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 italic font-black text-2xl">B</div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Direct Assistance</p>
                    <p className="text-lg font-black uppercase tracking-tight text-gray-950">concierge@boxfox.in</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[3rem] p-10 lg:p-16 shadow-2xl shadow-gray-200/50 border border-gray-100">
              <QuoteForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function GiftsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <GiftsPageInner />
    </Suspense>
  );
}

function QuoteForm() {
  const giftTypes = [
    "Azure Luxe",
    "Artisan Bakery",
    "Midnight Exec",
    "Vivid Trio",
    "Botanical Earth",
    "Emerald Perfume"
  ];

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", whatsapp: "", company: "", message: "",
    giftType: "",
    items: [{ productName: "", quantity: "", gift: "" }]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [products, setProducts] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openGiftDropdown, setOpenGiftDropdown] = useState(false);
  const [openGiftDropdownIndex, setOpenGiftDropdownIndex] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setOpenDropdown(null);
        setOpenGiftDropdown(false);
        setOpenGiftDropdownIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Fetch products for dropdown
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?all=true');
        const data = await res.json();
        if (Array.isArray(data)) {
          // Handle both flat array and sections structure
          let productList = [];
          if (data.length > 0 && data[0].items) {
            // Sections structure
            productList = data.flatMap(section => section.items || []);
          } else {
            // Flat array
            productList = data;
          }
          setProducts(productList);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
    };

    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: formData,
          items: formData.items,
          message: formData.message,
          giftType: formData.giftType,
        })
      });
      if (res.ok) setSuccess(true);
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  if (success) return (
    <div className="text-center py-20 space-y-6">
      <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20"><CheckCircle2 size={40} /></div>
      <h3 className="text-3xl font-black uppercase tracking-tighter">Request Received.</h3>
      <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Our team will reach out shortly.</p>
    </div>
  );

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input type="text" placeholder="Full Name" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-300" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
        <input type="email" placeholder="Business Email" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-300" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
        <input type="tel" placeholder="Phone Number" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-300" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
        <input type="text" placeholder="Company Name" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-300" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} />
      </div>
      <div className="space-y-4">
        <p className="text-[10px] font-black text-gray-405 uppercase tracking-widest italic underline decoration-emerald-500/30 underline-offset-4">Gift Type</p>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenGiftDropdown(!openGiftDropdown)}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-left flex items-center justify-between hover:border-emerald-300 transition-all duration-300"
          >
            <span className={`${formData.giftType ? 'text-gray-900' : 'text-gray-400'} truncate min-w-0 flex-1`}>
              {formData.giftType || 'Select Gift Box Type'}
            </span>
            <ChevronDown size={16} className={`transition-transform shrink-0 ml-2 ${openGiftDropdown ? 'rotate-180' : ''}`} />
          </button>

          {openGiftDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-20 max-h-60 overflow-y-auto custom-scrollbar">
              {giftTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, giftType: type });
                    setOpenGiftDropdown(false);
                  }}
                  className="w-full text-left px-6 py-3 text-xs font-bold text-gray-800 hover:text-emerald-700 hover:bg-emerald-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      <div className="space-y-4">
        <p className="text-[10px] font-black text-gray-405 uppercase tracking-widest italic underline decoration-emerald-500/30 underline-offset-4">Gift Specifications</p>
        {formData.items.map((item, i) => (
          <div key={i} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Product Name Dropdown */}
              <div className="sm:col-span-2 relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === i ? null : i)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-left flex items-center justify-between hover:border-emerald-300 transition-all duration-300"
                >
                  <span className={`${item.productName ? 'text-gray-900' : 'text-gray-400'} truncate min-w-0 flex-1`}>
                    {item.productName || 'Select Product'}
                  </span>
                  <ChevronDown size={16} className={`transition-transform shrink-0 ml-2 ${openDropdown === i ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {openDropdown === i && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-20 max-h-60 overflow-y-auto custom-scrollbar">
                    {products.length > 0 ? (
                      products.map((product) => (
                        <button
                          key={product._id || product.id}
                          type="button"
                          onClick={() => {
                            const newItems = [...formData.items];
                            newItems[i].productName = product.name;
                            setFormData({ ...formData, items: newItems });
                            setOpenDropdown(null);
                          }}
                          className="w-full text-left px-6 py-3 text-xs font-bold text-gray-800 hover:text-emerald-700 hover:bg-emerald-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          {product.name}
                        </button>
                      ))
                    ) : (
                      <div className="px-6 py-3 text-xs text-gray-400 font-bold">Loading products...</div>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity Input */}
              <input type="number" placeholder="Qty" className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-300" value={item.quantity} onChange={e => {
                const newItems = [...formData.items];
                newItems[i].quantity = e.target.value;
                setFormData({ ...formData, items: newItems });
              }} required />
            </div>

            {/* Per-item Gift Selection (optional) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenGiftDropdownIndex(openGiftDropdownIndex === i ? null : i)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-3 text-xs font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-left flex items-center justify-between hover:border-emerald-300 transition-all duration-300"
              >
                <span className={`${item.gift ? 'text-gray-900' : 'text-gray-400'} truncate min-w-0 flex-1`}>
                  {item.gift || 'Select Gift Option (optional)'}
                </span>
                <ChevronDown size={16} className={`transition-transform shrink-0 ml-2 ${openGiftDropdownIndex === i ? 'rotate-180' : ''}`} />
              </button>

              {openGiftDropdownIndex === i && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-20 max-h-60 overflow-y-auto custom-scrollbar">
                  {giftTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        const newItems = [...formData.items];
                        newItems[i].gift = type;
                        setFormData({ ...formData, items: newItems });
                        setOpenGiftDropdownIndex(null);
                      }}
                      className="w-full text-left px-6 py-3 text-xs font-bold text-gray-800 hover:text-emerald-700 hover:bg-emerald-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <input type="tel" placeholder="WhatsApp Number (with country code, e.g. 9198xxxx...)" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-300" value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} required />
        <textarea placeholder="Optional message / brief requirement" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-300" value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} rows={3} />
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-gray-950 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-emerald-500 transition-all shadow-xl active:scale-95 disabled:opacity-70">
        {isSubmitting ? "Sending..." : "Submit Inquiry"}
      </button>
    </form>
  );
}
