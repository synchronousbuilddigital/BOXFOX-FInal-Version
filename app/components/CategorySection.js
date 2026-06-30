"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Box, Layers, Zap, Heart, LayoutGrid, Package, Star, Circle, Square, ShoppingBag, Gift, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

// Lucide icon helper mapping
const iconMap = {
  Square: <Square className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  Box: <Box className="w-6 h-6" />,
  Package: <Package className="w-6 h-6" />,
  Gift: <Gift className="w-6 h-6" />,
  Layers: <Layers className="w-6 h-6" />,
  LayoutGrid: <LayoutGrid className="w-6 h-6" />,
  ShoppingBag: <ShoppingBag className="w-6 h-6" />,
  Star: <Star className="w-6 h-6" />,
  Heart: <Heart className="w-6 h-6" />,
  Circle: <Circle className="w-6 h-6" />
};

// Fallback lookup table for default categories design properties
const DEFAULT_CATEGORIES_MAP = {
  "Pizza Box": { index: "01", stats: "HEAT-SAFE", needsBranding: true, image: "/categories/cat_cake.png", icon: "Square" },
  "Cake Box": { index: "02", stats: "OIL-SAFE", needsBranding: false, image: "/categories/cat_cake.png", icon: "Zap" },
  "Burger Box": { index: "03", stats: "DURABLE", needsBranding: true, image: "/categories/cat_cake.png", icon: "Box" },
  "Food Box": { index: "04", stats: "FRESH", needsBranding: true, image: "/categories/cat_bento.png", icon: "Package" },
  "Wok Box": { index: "05", stats: "LEAK-PROOF", needsBranding: true, image: "/categories/cat_cupcake.png", icon: "Box" },
  "CupCake": { index: "06", stats: "DISPLAY", needsBranding: false, image: "/categories/cat_cupcake.png", icon: "Box" },
  "CupCake + Bento": { index: "07", stats: "VERSATILE", needsBranding: true, image: "/categories/cat_bento.png", icon: "Package" },
  "Gifting": { index: "08", stats: "PREMIUM", needsBranding: false, image: "/categories/cat_gifting.png", icon: "Gift" },
  "Hamper Box": { index: "09", stats: "DURABLE", needsBranding: false, image: "/categories/cat_hamper.png", icon: "Layers" },
  "Platter": { index: "10", stats: "PRESENTATION", needsBranding: false, image: "/categories/cat_platter_branded.png", icon: "LayoutGrid" },
  "Loaf": { index: "11", stats: "CLASSIC", needsBranding: false, image: "/categories/cat_loaf_branded.png", icon: "ShoppingBag" },
  "Pastry": { index: "12", stats: "DELICATE", needsBranding: true, image: "/categories/cat_pastry.png", icon: "Star" },
  "Chocolate Box": { index: "13", stats: "ARTISANAL", needsBranding: true, image: "/categories/cat_chocolate_box.png", icon: "Heart" },
  "Macaron": { index: "14", stats: "STYLISH", needsBranding: true, image: "/categories/cat_macaron.png", icon: "Circle" },
  "Brownie": { index: "15", stats: "COMPACT", needsBranding: true, image: "/categories/cat_brownie.png", icon: "Square" },
  "Wrap Box": { index: "16", stats: "CONVENIENT", needsBranding: true, image: "/categories/cat_loaf_branded.png", icon: "Package" },
  "Popcorn": { index: "17", stats: "CLASSIC", needsBranding: true, image: "/categories/cat_brownie.png", icon: "Circle" },
  "Carry Bag": { index: "18", stats: "PREMIUM", needsBranding: true, image: "/categories/cat_gifting.png", icon: "ShoppingBag" }
};

export default function CategorySection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Fetch products and categories concurrently
    Promise.all([
      fetch('/api/products?all=true').then(res => res.json()),
      fetch('/api/admin/box-categories').then(res => res.json())
    ])
      .then(([productsData, categoriesData]) => {
        // 1. Get unique category names from active products on the shop page
        const products = Array.isArray(productsData) ? productsData : [];
        const activeCategoryNames = new Set(
          products
            .filter(p => p.isActive !== false && p.pageVisibility !== 'gift') // active shop products
            .map(p => p.category)
            .filter(Boolean)
        );

        // 2. Load configured categories from database
        const dbCategories = (categoriesData && categoriesData.success && Array.isArray(categoriesData.data)) 
          ? categoriesData.data 
          : [];

        // 3. Match database categories with active products categories
        const visibleCategories = [];
        
        // Match existing DB categories
        dbCategories.forEach((dbCat, index) => {
          if (activeCategoryNames.has(dbCat.name)) {
            const defaults = DEFAULT_CATEGORIES_MAP[dbCat.name] || {};
            visibleCategories.push({
              id: dbCat._id,
              name: dbCat.name,
              img: dbCat.image || defaults.image || "/categories/cat_cake.png",
              index: dbCat.index || defaults.index || String(index + 1).padStart(2, '0'),
              stats: dbCat.stats || defaults.stats || "DURABLE",
              needsBranding: dbCat.needsBranding !== undefined ? dbCat.needsBranding : (defaults.needsBranding || false),
              icon: iconMap[defaults.icon] || <Box className="w-6 h-6" />
            });
            activeCategoryNames.delete(dbCat.name); // Avoid duplication
          }
        });

        // 4. For any active categories not configured in the database, create dynamic fallbacks
        Array.from(activeCategoryNames).forEach((catName, index) => {
          const defaults = DEFAULT_CATEGORIES_MAP[catName] || {};
          visibleCategories.push({
            id: `dynamic-${catName}-${index}`,
            name: catName,
            img: defaults.image || "/categories/cat_cake.png",
            index: defaults.index || String(visibleCategories.length + 1).padStart(2, '0'),
            stats: defaults.stats || "DURABLE",
            needsBranding: defaults.needsBranding || false,
            icon: iconMap[defaults.icon] || <Box className="w-6 h-6" />
          });
        });

        // Sort by index string (numeric)
        visibleCategories.sort((a, b) => a.index.localeCompare(b.index));

        setCategories(visibleCategories);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching homepage dynamic categories:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section id="categories" className="pt-8 pb-4 md:pt-12 md:pb-6 lg:pt-16 lg:pb-8 px-4 sm:px-6 md:px-12 bg-white text-gray-950">
        <div className="max-w-[1700px] mx-auto animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
            <div className="h-4 w-32 bg-gray-100 rounded" />
          </div>
          <div className="h-16 w-80 bg-gray-100 rounded mb-8" />
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
              <div key={i} className="aspect-[4/5] bg-gray-50 rounded-[2rem] border border-gray-100" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const displayedCategories = isExpanded ? categories : categories.slice(0, 10);

  return (
    <section id="categories" className="pt-8 pb-4 md:pt-12 md:pb-6 lg:pt-16 lg:pb-8 px-4 sm:px-6 md:px-12 bg-white text-gray-950 overflow-hidden selection:bg-emerald-500 selection:text-white" suppressHydrationWarning>
      <div className="max-w-[1700px] mx-auto">
        {/* Technical Header */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between mb-4 sm:mb-6 gap-6 lg:gap-12 text-center lg:text-left">
          <div className="space-y-1 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 justify-center lg:justify-start"
            >
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-emerald-600 text-[9px] md:text-xs font-black uppercase tracking-[0.4em]">
                Explore Our Range
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.9] sm:leading-none"
            >
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500">Box Collection.</span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-6 sm:p-7 md:p-10 border border-gray-100 bg-gray-50/50 backdrop-blur-3xl rounded-[2rem] sm:rounded-[2.5rem] max-w-md shadow-sm"
          >
            <p className="text-sm sm:text-base md:text-xl text-gray-500 font-medium leading-relaxed tracking-tight italic">
              "Easy access to our high-quality box collection. Every box is crafted for a perfect unboxing experience."
            </p>
          </motion.div>
        </div>

        {/* The Index Grid/List */}
        <motion.div 
          layout
          className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6 lg:gap-8"
        >
          <AnimatePresence>
            {displayedCategories.map((cat, idx) => (
              <motion.div
                key={cat.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="w-full"
              >
                <Link href={`/shop?category=${encodeURIComponent(cat.name)}`} rel="nofollow" className="block h-full">
                  <div
                    className="group relative w-full h-full rounded-[1.5rem] sm:rounded-[2rem] bg-gray-50/50 border border-gray-100 hover:bg-white hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500 flex flex-col overflow-hidden cursor-pointer"
                  >
                    {/* Image Container - Fixed uniform height and edge-to-edge */}
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100 flex items-center justify-center">
                      <img
                        src={cat.img}
                        alt={cat.name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />

                      {cat.needsBranding && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-overlay opacity-80 group-hover:opacity-100 transition-opacity duration-700">
                          <span className="font-serif text-xl sm:text-2xl md:text-3xl font-black tracking-[0.2em] uppercase origin-center rotate-[-15deg] text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] px-4">
                            BOXFOX
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-white drop-shadow-md bg-emerald-500/80 backdrop-blur-md px-2 sm:px-3 py-1 rounded-full">
                          {cat.stats}
                        </span>
                      </div>
                    </div>

                    {/* Content Panel */}
                    <div className="p-4 sm:p-6 flex flex-col flex-grow gap-2 sm:gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] sm:text-[10px] font-black text-emerald-500/50 uppercase tracking-widest">{cat.index}</span>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                          {cat.icon}
                        </div>
                      </div>

                      <h3 className="text-lg sm:text-xl font-black uppercase tracking-tighter leading-none group-hover:text-emerald-600 transition-colors">
                        {cat.name}
                      </h3>

                      <div className="mt-auto pt-3 sm:pt-4 flex items-center justify-between border-t border-gray-100/50">
                        <span className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest">Premium Choice</span>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-950 group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm group-hover:rotate-45">
                          <ArrowUpRight size={14} className="sm:w-4 sm:h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Expand/Collapse Button */}
        {categories.length > 10 && (
          <div className="flex justify-center mt-12">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 px-8 py-4 bg-emerald-800 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-emerald-950 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-800/10"
            >
              {isExpanded ? (
                <>
                  Show Less <ChevronUp size={16} />
                </>
              ) : (
                <>
                  Show All Categories ({categories.length}) <ChevronDown size={16} />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Background Decorative Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[-1]">
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "100px 100px" }} />
      </div>
    </section>
  );
}
