"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Sparkles,
  Box,
  Scissors,
  Zap,
  Layers,
  CheckCircle2,
  Award,
  Thermometer,
  Droplets,
  Play,
  Cpu,
  Microscope,
  Scale
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

import { generateQualityWhitepaper } from "./whitepaper-generator";

export default function QualityPage() {
  const handleDownload = () => {
    generateQualityWhitepaper();
  };
  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  };

  const materials = [
    {
      title: "SBS (Solid Bleached Sulfate)",
      desc: "Premium white paperboard with a smooth, coated surface. Engineered for highest-resolution offset printing and complex finishing.",
      icon: <Sparkles className="text-emerald-500" />,
      gsm: "250 - 450 GSM",
      composition: "Pure chemical pulp, fully bleached",
      bestFor: "Bakery, Cosmetics, Luxury Retail"
    },
    {
      title: "Metalized Mirror SBS",
      desc: "A high-reflective vacuum-metallized board that creates a mirror-like finish. Ideal for limited edition and VIP gifting.",
      icon: <Zap className="text-teal-500" />,
      gsm: "300 - 400 GSM",
      composition: "Aluminium vaporized SBS substrate",
      bestFor: "Executive Gifts, Premium Tech"
    },
    {
      title: "Virgin Kraft (High-Strength)",
      desc: "Superior strength-to-weight ratio. Provides an organic, tactile feel while offering extreme resistance to moisture and tearing.",
      icon: <Layers className="text-amber-600" />,
      gsm: "280 - 350 GSM",
      composition: "Unbleached sulfate wood pulp",
      bestFor: "Organic Brands, Heavy Industrial Items"
    },
    {
      title: "F-Flute & E-Flute Corrugated",
      desc: "Micro-flute technology providing structural rigidity for shipping while maintaining a thin profile for retail aesthetics.",
      icon: <Cpu className="text-blue-500" />,
      gsm: "250 - 500 GSM Equivalent",
      composition: "Triple-layered structural sandwich",
      bestFor: "Subscription Boxes, Electronics"
    }
  ];

  const engineeringStandards = [
    { title: "Crease-Line Calibration", val: "±0.05mm", desc: "Ensures every fold is perfectly perpendicular, preventing box 'skewing' in high-speed packing." },
    { title: "Ink Density Delta", val: "ΔE < 1.8", desc: "Spectrophotometer-grade colour matching across batch runs for brand consistency." },
    { title: "Bursting Strength", val: "8-12 kg/cm²", desc: "Tested via Mullen Burst test protocols to survive the rigors of modern courier logistics." },
    { title: "Humidity Resistance", val: "RH 65% Safe", desc: "Treated surfaces that prevent 'bloating' or warping in tropical warehouse conditions." }
  ];

  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section - The Science of Structure */}
      <section className="relative pt-32 pb-16 lg:pt-56 lg:pb-40 overflow-hidden">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-emerald-50/40 -skew-x-12 translate-x-1/3 -z-10" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-emerald-500/5 blur-[120px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <motion.div {...fadeIn}>
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-emerald-600 text-white text-[8px] sm:text-[10px] font-black uppercase tracking-[0.25em] mb-6 sm:mb-8 shadow-xl shadow-emerald-500/20">
              <Shield size={10} className="sm:w-[12px] sm:h-[12px]" fill="currentColor" />
              Technical_Integrity_Report
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-gray-950 leading-[0.85] mb-6 sm:mb-10 italic tracking-tighter">
              BEYOND THE <br /> <span className="text-emerald-500 underline decoration-gray-100 decoration-8 underline-offset-8">BOARD.</span>
            </h1>
            <p className="text-base sm:text-xl text-gray-500 leading-relaxed max-w-lg font-medium mb-8 sm:mb-12">
              Packaging is the physical hand-shake between your brand and your customer. We treat it with the same engineering rigor as aerospace components.
            </p>
            <div className="flex items-center gap-6 sm:gap-8 border-t border-gray-100 pt-8 sm:pt-10">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-gray-950 italic">99.8%</p>
                <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">Pass Rate</p>
              </div>
              <div className="w-px h-8 sm:h-10 bg-gray-100" />
              <div>
                <p className="text-2xl sm:text-3xl font-black text-gray-950 italic">4k+</p>
                <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">Global Brands</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotate: 2 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "circOut" }}
            className="relative mt-8 lg:mt-0"
          >
            <div className="aspect-[4/5] bg-gray-900 rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-4 sm:border-8 border-white group">
              <img
                src="/boxfox_hero_branded.png"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s] ease-out"
                alt="BoxFox Premium Packaging"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent" />
            </div>

            <div className="absolute -top-6 -right-4 sm:top-12 sm:-right-8 bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/50 max-w-[140px] sm:max-w-[180px]">
              <Microscope size={20} className="text-emerald-500 mb-2 sm:w-[24px] sm:h-[24px]" />
              <p className="text-[8px] sm:text-[10px] font-black text-gray-950 uppercase tracking-widest leading-tight">Micro-Surface Inspection Active</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Content Space - Cinema Experience */}
      <section className="py-16 lg:py-40 bg-gray-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-12 lg:mb-24">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white italic tracking-tighter uppercase mb-4 sm:mb-6">Manufacturing <span className="text-emerald-500">Live Stream.</span></h2>
            <p className="text-white/40 font-medium max-w-xl mx-auto uppercase text-[8px] sm:text-[10px] tracking-[0.4em]">Witness the industrial ballet of precision machinery.</p>
          </div>

          <motion.div
            style={{ perspective: "1000px" }}
            whileInView={{ rotateX: [10, 0] }}
            transition={{ duration: 1 }}
            className="relative aspect-video rounded-[2rem] sm:rounded-[3rem] overflow-hidden group shadow-2xl border border-white/10"
          >
            <div className="absolute inset-0 bg-emerald-600/10 mix-blend-overlay z-10" />
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
            >
              <source src="/quality.mp4" type="video/mp4" />
              <img
                src="/packaging_manufacturing_precision.png"
                alt="High-tech manufacturing floor fallback"
              />
            </video>
            <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="w-16 h-16 sm:w-32 sm:h-32 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center scale-90 group-hover:scale-100 transition-all duration-500">
                <Play size={24} className="text-white fill-current ml-1 sm:w-[32px] sm:h-[32px] sm:ml-2" />
              </div>
            </div>
            {/* Engineering Scan Line Overlay */}
            <motion.div 
              initial={{ top: "-10%" }}
              animate={{ top: "110%" }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-[2px] bg-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)] z-30 pointer-events-none"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-25 pointer-events-none" />
            
            <div className="absolute bottom-4 left-4 sm:bottom-12 sm:left-12 z-20 flex items-center gap-3 sm:gap-6">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-white">Live Monitoring: Line_04_NCR</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Material Science - The Foundation */}
      <section className="py-16 lg:py-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-8 mb-16 lg:mb-32">
            <div className="max-w-xl">
              <p className="text-emerald-500 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em] mb-3 sm:mb-4">Core_Foundations</p>
              <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-gray-950 italic tracking-tighter uppercase leading-[0.9]">MATERIAL <span className="text-emerald-500 decoration-8 underline decoration-emerald-100 underline-offset-4 font-black">DNA.</span></h2>
            </div>
            <p className="text-gray-500 font-medium leading-relaxed max-w-sm text-sm sm:text-base">Every brand requires a specific molecular weight and surface tension. We calibrate our supply chain to provide 12+ distinct base-stocks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
            {materials.map((m, idx) => (
              <motion.div
                key={idx}
                {...fadeIn}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-gray-50 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 lg:p-14 border border-gray-100 overflow-hidden hover:bg-white hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-500"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-sm mb-6 sm:mb-8 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 transition-all duration-500">
                    {React.cloneElement(m.icon, { size: 24, className: "group-hover:text-white transition-colors" })}
                  </div>
                  <h3 className="text-xl sm:text-3xl font-black text-gray-950 mb-3 sm:mb-4">{m.title}</h3>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-500 font-medium leading-relaxed mb-8 sm:mb-10 max-w-md">
                    {m.desc}
                  </p>

                  <div className="grid grid-cols-2 gap-4 sm:gap-8 pt-6 sm:pt-10 border-t border-gray-200/60">
                    <div>
                      <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Technical Composition</p>
                      <p className="text-[9px] sm:text-xs font-bold text-gray-950 uppercase">{m.composition}</p>
                    </div>
                    <div>
                      <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Optimal Range</p>
                      <p className="text-[9px] sm:text-xs font-bold text-emerald-600 uppercase">{m.gsm}</p>
                    </div>
                  </div>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-emerald-500/5 -translate-y-1/2 translate-x-1/2 rounded-full group-hover:bg-emerald-500/10 transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Engineering Table - Industrial Performance */}
      <section className="py-16 lg:py-40 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16 lg:mb-24">
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-gray-950 italic tracking-tighter uppercase mb-4 sm:mb-6">Structural <span className="text-emerald-500 underline decoration-gray-200 underline-offset-8 decoration-8 font-black">Rigidity.</span></h2>
            <p className="text-gray-400 font-black uppercase text-[8px] sm:text-[10px] tracking-[0.4em]">The metrics of a masterpiece.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {engineeringStandards.map((s, i) => (
              <motion.div
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-gray-200/50 shadow-sm hover:translate-y-[-8px] transition-all hover:shadow-2xl"
              >
                <p className="text-emerald-500 text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-4 inline-block px-3 py-1 bg-emerald-50 rounded-lg">{s.title}</p>
                <div className="mb-4 sm:mb-6">
                  <span className="text-4xl sm:text-5xl font-black italic text-gray-950 tracking-tighter text-shadow-sm">{s.val}</span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Luxury Collection & Finishings */}
      <section className="py-16 lg:py-40 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-gray-950 italic tracking-tighter uppercase leading-[0.9] mb-6 sm:mb-10">Lustre & <br /> <span className="text-emerald-500">Reflection.</span></h2>
              <p className="text-base sm:text-lg text-gray-500 font-medium leading-relaxed mb-8 sm:mb-12">We go beyond CMYK. Our finishing lab provides sensory layers—from the microscopic texture of premium suede to the high-contrast gloss of precision Spot UV.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-6 sm:gap-y-8">
                {[
                  { l: "Velvet Soft-Touch", d: "Suede-like tactile finish" },
                  { l: "3D Metallic Foil", d: "Deep prismatic elevation" },
                  { l: "Blind Embossing", d: "Subtle structural deboss" },
                  { l: "Eco-Aqueous", d: "Bio-degradable finish" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={16} />
                    <div>
                      <p className="text-xs sm:text-sm font-black text-gray-950 uppercase leading-none mb-1 tracking-tight">{item.l}</p>
                      <p className="text-[8px] sm:text-[10px] font-medium text-gray-400 uppercase tracking-widest leading-tight">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative mt-12 lg:mt-0">
              <div className="aspect-square bg-gray-100 rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden shadow-2xl skew-x-1">
                <img
                  src="/boxfox_collection_branded.png"
                  className="w-full h-full object-cover"
                  alt="BoxFox Luxury Packaging Collection"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 sm:-bottom-10 sm:-left-10 bg-emerald-500 text-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-2xl flex items-center justify-center">
                <div className="text-center">
                  <Scale size={24} className="sm:w-[32px] sm:h-[32px] mx-auto mb-2 sm:mb-4" />
                  <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest leading-none">Balanced Integrity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Philosophy - Final Statement */}
      <section className="py-16 lg:py-40 bg-gray-50 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h3 className="text-2xl sm:text-3xl lg:text-5xl font-black text-gray-950 italic tracking-tighter uppercase mb-6 sm:mb-10">Manufacturing <span className="text-emerald-500 underline decoration-emerald-200 decoration-8 underline-offset-8 font-black">Intelligence.</span></h3>
          <p className="text-base sm:text-lg text-gray-500 font-medium leading-relaxed italic mb-8 sm:mb-12">"Real quality is not found in the inspection of the finished product, but in the engineering of the process that created it. At BoxFox, zero-defect production is our baseline, not our target."</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={handleDownload}
              className="w-full sm:w-auto bg-emerald-500 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-black uppercase text-[9px] sm:text-[10px] tracking-[0.2em] shadow-2xl shadow-emerald-500/30 hover:scale-105 transition-all"
            >
              Download Quality whitepaper
            </button>
            <button className="w-full sm:w-auto bg-white text-gray-950 border border-gray-200 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-black uppercase text-[9px] sm:text-[10px] tracking-[0.2em] hover:bg-gray-100 transition-all">View Certifications</button>
          </div>
        </div>
      </section>

    </main>
  );
}

function ArrowRight({ size, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
