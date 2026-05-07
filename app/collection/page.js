"use client";
import React from "react";
import Navbar from "../components/Navbar";
import ProductSection from "../components/ProductSection";
import { motion } from "framer-motion";

export default function CollectionPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main className="pt-32 pb-24">
                <header className="px-6 lg:px-12 mb-16 max-w-[1600px] mx-auto text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-black text-gray-950 tracking-tighter"
                    >
                        Our Collections.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-400 font-medium mt-6 max-w-2xl mx-auto"
                    >
                        Explore our curated selection of high-performance packaging, from custom pizza boxes to luxury bakery solutions.
                    </motion.p>
                </header>

                <ProductSection />
            </main>
        </div>
    );
}
