"use client";
import React from "react";
import { motion } from "framer-motion";
import { Shield, Sparkles, Truck } from "lucide-react";

export default function AboutSection() {
  return (
    <section className="py-16 sm:py-24 bg-gray-50/50 border-t border-gray-100 relative overflow-hidden text-center sm:text-left" suppressHydrationWarning>
      <div className="max-w-[1700px] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Big Brand Statement & Quick Stats */}
          <div className="lg:col-span-5 space-y-6 md:space-y-8 flex flex-col items-center sm:items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 justify-center lg:justify-start"
            >
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-emerald-600 text-[9px] md:text-xs font-black uppercase tracking-[0.4em]">
                Who We Are
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-3xl sm:text-5xl lg:text-[2.75rem] xl:text-[3.25rem] font-black tracking-tighter uppercase text-gray-900 leading-[1.05]"
            >
              India&apos;s Premier <br />
              <span className="text-emerald-500">Custom Packaging</span> <br />
              Manufacturer.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-gray-500 text-sm sm:text-base font-semibold max-w-md leading-relaxed"
            >
              At BoxFox, we bridge the gap between creative design and high-volume industrial production. We construct premium custom packaging tailored to fit your unique products and brand guidelines.
            </motion.p>

            {/* Quick Metrics */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="grid grid-cols-2 gap-4 w-full max-w-sm pt-4"
            >
              <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm text-center sm:text-left">
                <p className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">500+</p>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Brands Trusted</p>
              </div>
              <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm text-center sm:text-left">
                <p className="text-2xl sm:text-3xl font-black text-emerald-500 tracking-tight">100%</p>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Quality Inspected</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Three Key Pillars with semantic H3 headings */}
          <div className="lg:col-span-7 space-y-8 md:space-y-10">
            
            {/* Pillar 1 */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left"
            >
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Sparkles size={20} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-gray-950 uppercase tracking-tight">
                  Custom Box Design & Custom Prints
                </h3>
                <p className="text-xs sm:text-sm font-medium text-gray-500 leading-relaxed max-w-2xl">
                  We design and manufacture a wide range of custom boxes, including luxury rigid boxes, corrugated cardboard boxes, and durable duplex packaging. Our AI-driven design studio helps brands customize dimensions, upload logos, and review dynamic 3D layouts, ensuring the final output matches your color profiles and packaging shapes.
                </p>
              </div>
            </motion.div>

            {/* Pillar 2 */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left"
            >
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Shield size={20} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-gray-950 uppercase tracking-tight">
                  Premium Materials & Industrial Finishes
                </h3>
                <p className="text-xs sm:text-sm font-medium text-gray-500 leading-relaxed max-w-2xl">
                  Protect your items with eco-friendly grease-resistant food packaging, bento boxes, pastry containers, and heavy-duty shipping cartons. Our modern facility in New Delhi delivers precision production, applying premium spot UV, glossy laminate, matte laminations, and gold hot stamping foil options.
                </p>
              </div>
            </motion.div>

            {/* Pillar 3 */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left"
            >
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Truck size={20} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-gray-950 uppercase tracking-tight">
                  Pan-India Shipping & Order Flexibilities
                </h3>
                <p className="text-xs sm:text-sm font-medium text-gray-500 leading-relaxed max-w-2xl">
                  We support growing retail startups and large enterprises with low minimum order quantities, secure brand asset storage, and fast order dispatches. Enjoy free delivery on order values over ₹2000 across India. Boost customer unboxing satisfaction and partner with BoxFox today.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
