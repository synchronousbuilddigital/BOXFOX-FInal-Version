"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Star, TrendingUp } from "lucide-react";
import ProductCard from "./ProductCard";

export default function TopSellingStrip() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/products/best-sellers")
            .then((res) => res.json())
            .then((data) => {
                if (!Array.isArray(data)) {
                    console.warn("API returned non-array data:", data);
                    setLoading(false);
                    return;
                }
                setProducts(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch top products:", err);
                setLoading(false);
            });
    }, []);

    if (loading || products.length === 0) return null;

    return (
        <section className="py-8 sm:py-12 bg-gray-50/50 relative overflow-hidden text-center sm:text-left">
            <div className="max-w-[1700px] mx-auto px-2 sm:px-6 lg:px-12 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4">
                    <div className="space-y-1">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="flex items-center justify-center sm:justify-start gap-2"
                        >
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200">
                                <TrendingUp size={10} className="text-emerald-600" />
                                <span className="text-emerald-600 text-[8px] font-black uppercase tracking-widest">
                                    Best Sellers
                                </span>
                            </div>
                        </motion.div>
                        <h2 className="text-3xl sm:text-6xl font-black text-gray-950 uppercase tracking-tighter leading-[0.9]">
                            Top 10 <span className="text-emerald-500">Selling.</span>
                        </h2>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="hidden sm:flex items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm self-start md:self-auto"
                    >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-500 flex items-center justify-center text-white">
                            <Star fill="currentColor" size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </div>
                        <div>
                            <div className="text-[9px] sm:text-[10px] font-black text-gray-950 uppercase tracking-widest">Premium Quality</div>
                            <div className="text-[10px] sm:text-xs font-bold text-gray-400">Voted by 500+ Brands</div>
                        </div>
                    </motion.div>
                </div>

                {/* Grid for Products */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 pb-8 sm:pb-12">
                    {products.map((product, idx) => (
                        <div key={product.id} className="w-full h-full">
                            <ProductCard product={product} priority={idx < 5} />
                        </div>
                    ))}
                </div>

                {/* Explore All Button Below Grid */}
                <div className="flex justify-center mt-4 sm:mt-8">
                    <a
                        href="/shop"
                        className="group w-full sm:w-auto min-w-[280px] bg-gray-950 text-white px-8 py-5 sm:px-12 sm:py-6 rounded-[1.5rem] sm:rounded-full font-black text-sm sm:text-lg uppercase tracking-[0.2em] hover:bg-emerald-600 hover:shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all duration-500 flex items-center justify-center gap-4 shadow-2xl active:scale-95"
                    >
                        Explore All Products
                        <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </a>
                </div>
            </div>
        </section>
    );
}
