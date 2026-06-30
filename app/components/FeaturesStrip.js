"use client";
import React from "react";
import { motion } from "framer-motion";
import { Truck, ShieldCheck, Cpu, Headphones } from "lucide-react";
import MatrixBackground from "./MatrixBackground";

const features = [
  {
    icon: Cpu,
    title: "Ignite Forge",
    desc: "Generate stunning box patterns and logos with NEURAL_V2.5 AI.",
    tag: "NEW"
  },
  {
    icon: ShieldCheck,
    title: "Premium Quality",
    desc: "Industrial-grade materials for maximum product protection.",
    tag: "TRUSTED"
  },
  {
    icon: Truck,
    title: "Eco-Friendly",
    desc: "Sustainable packaging solutions for your conscious brand.",
    tag: "PLANET"
  },
  {
    icon: Headphones,
    title: "Brand Vault",
    desc: "Securely store and reuse your logos and brand assets.",
    tag: "SECURE"
  },
];

export default function FeaturesStrip() {
  return (
    <section className="py-8 bg-white relative overflow-hidden text-center sm:text-left" suppressHydrationWarning>
      <MatrixBackground />

      {/* Continuing the 'Packaging' labels from Hero */}
      <div className="absolute right-0 top-0 flex flex-col gap-2 opacity-[0.02] sm:opacity-[0.04] select-none pointer-events-none hidden md:flex pr-2 sm:pr-4">
        {[...Array(18)].map((_, i) => (
          <span key={i} className="text-[10rem] sm:text-[14rem] font-black leading-[0.8] rotate-90 origin-right tracking-tighter">
            PACKAGING
          </span>
        ))}
      </div>

      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-2 md:flex md:items-center md:justify-between gap-6 sm:gap-12 w-full py-8 border-y border-gray-100">
          {features.map(({ icon: Icon, title, desc, tag }, idx) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6, ease: "easeOut" }}
              className="group flex flex-col items-center text-center gap-3 sm:gap-6 lg:flex-1"
            >
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="text-emerald-500 group-hover:scale-110 transition-transform duration-500">
                    <Icon className="w-8 h-8 sm:w-12 sm:h-12" strokeWidth={1.5} />
                  </div>
                  <span className="text-[9px] sm:text-[11px] font-black text-gray-300 group-hover:text-emerald-500 tracking-[0.2em] sm:tracking-[0.3em] transition-colors">
                    {tag}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-black text-gray-950 mb-2 uppercase tracking-tight group-hover:text-emerald-600 transition-colors">
                    {title}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-gray-500 max-w-[250px] mx-auto leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


