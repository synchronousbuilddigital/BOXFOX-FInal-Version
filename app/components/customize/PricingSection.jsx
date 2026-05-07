"use client";
import React from "react";
import { ShoppingCart, RefreshCw, ChevronDown, ListChecks, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PricingSection({
  quantity,
  setQuantity,
  displayUnitPrice,
  displayPrice,
  pricingResult,
  showBreakdown,
  setShowBreakdown,
  isAddingToCart,
  handleAddToCart,
  selectedCategory,
  selectedSubCategory,
  dimensions,
  unit,
  selectedMaterial,
  selectedGSM,
  selectedFinish
}) {
  return (
    <div className="mt-8 bg-gray-950 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full -ml-20 -mb-20" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Input and Stats */}
        <div className="lg:col-span-4 space-y-6 sm:space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                <ShoppingCart size={14} className="text-emerald-400" />
              </div>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-white italic">
                Order_Volume
              </h3>
            </div>
            <div className="relative group">
              <input
                type="number"
                min="500"
                step="100"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-white/5 border-2 border-white/10 group-hover:border-emerald-500/50 rounded-2xl px-6 py-4 sm:py-5 text-2xl sm:text-3xl font-black text-white outline-none transition-all shadow-inner placeholder:text-white/20"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                Units
              </div>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              Minimum order quantity: 500 units
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 sm:p-5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">
                Unit_Forge_Cost
              </p>
              <p className="text-xl sm:text-2xl font-black text-white">
                ₹{displayUnitPrice}
              </p>
            </div>
            <div className="p-4 sm:p-5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">
                Tax_Estimate
              </p>
              <p className="text-xl sm:text-2xl font-black text-white italic">
                +18% GST
              </p>
            </div>
          </div>
        </div>

        {/* Middle Column: Final Quote */}
        <div className="lg:col-span-5 py-6 sm:py-10 px-6 sm:px-12 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-sm text-center lg:text-left">
          <div className="space-y-1 mb-6 sm:mb-8">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] italic leading-none">
              Live_Quote_Protocol_v2.0
            </p>
            <h4 className="text-xs sm:text-sm font-bold text-white/40 uppercase tracking-widest">
              Commercial Summary
            </h4>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-center lg:justify-start gap-2 sm:gap-3">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white italic tracking-tight">
                ₹{Math.round(displayPrice).toLocaleString()}
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-500 uppercase tracking-widest">
                Excl. GST
              </span>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-3 mt-4">
              <div className="flex items-center gap-1 text-[10px] font-black text-white uppercase tracking-widest">
                <CheckCircle2 size={12} className="text-emerald-500" /> All-In Rate
              </div>
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:text-white transition-colors"
              >
                {showBreakdown ? "Hide_Matrix" : "View_Cost_Matrix"}{" "}
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-300 ${showBreakdown ? "rotate-180" : ""
                    }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Action */}
        <div className="lg:col-span-3">
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="w-full h-24 sm:h-28 md:h-32 lg:h-40 bg-emerald-500 hover:bg-white text-gray-950 hover:text-emerald-600 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3.5rem] flex flex-col items-center justify-center gap-2 sm:gap-4 transition-all duration-500 shadow-[0_20px_50px_rgba(16,185,129,0.3)] active:scale-95 group disabled:opacity-50"
          >
            {isAddingToCart ? (
              <>
                <RefreshCw className="animate-spin" size={24} />
                <span className="text-xs sm:text-sm font-black uppercase tracking-[0.3em]">
                  Deploying...
                </span>
              </>
            ) : (
              <>
                <div className="relative">
                  <ShoppingCart
                    size={24}
                    className="group-hover:-translate-y-1 transition-transform"
                  />
                  <div className="absolute -top-2 -right-2 w-3 h-3 bg-white rounded-full animate-ping opacity-75" />
                </div>
                <span className="text-sm sm:text-base font-black uppercase tracking-[0.4em] italic">
                  Deploy_To_Cart
                </span>
                <ArrowRight
                  size={18}
                  className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all"
                />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Cost Breakdown Matrix */}
      <AnimatePresence>
        {showBreakdown && pricingResult && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 mt-8 sm:mt-10"
          >
            <div className="pt-8 sm:pt-10 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <ListChecks size={16} className="text-emerald-400" />
                  <h5 className="text-[10px] sm:text-xs font-black text-white uppercase tracking-[0.3em] italic">
                    Structural_DNA_Map
                  </h5>
                </div>
                <div className="grid grid-cols-2 gap-y-4 sm:gap-y-6 gap-x-8 sm:gap-x-12">
                  {[
                    { label: "Category", value: selectedCategory },
                    { label: "Sub-Category", value: selectedSubCategory },
                    {
                      label: "Dimensions",
                      value: `${dimensions.l}x${dimensions.w}x${dimensions.h} ${unit}`,
                    },
                    { label: "Material", value: selectedMaterial },
                    { label: "GSM / Weight", value: `${selectedGSM} GSM` },
                    { label: "Finish_Coat", value: selectedFinish },
                  ].map((spec, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">
                        {spec.label}
                      </p>
                      <p className="text-[10px] sm:text-xs font-bold text-white tracking-wide truncate">
                        {spec.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <h5 className="text-[10px] sm:text-xs font-black text-white uppercase tracking-[0.3em] italic">
                    Commercial_Cost_Matrix
                  </h5>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { label: "Material Base", value: pricingResult.materialCost },
                    { label: "Production Forge", value: pricingResult.mfgCost },
                    { label: "Custom Die-Line", value: pricingResult.dieCost },
                    { label: "Neural Print Map", value: pricingResult.printCost },
                    { label: "Surface Finish", value: pricingResult.lamCost },
                  ].map((cost, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center py-2 sm:py-3 border-b border-white/5"
                    >
                      <span className="text-[9px] sm:text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                        {cost.label}
                      </span>
                      <span className="text-[10px] sm:text-xs font-black text-white tabular-nums">
                        ₹{Math.round(cost.value).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-4 sm:pt-6">
                    <span className="text-xs sm:text-sm font-black text-emerald-400 uppercase tracking-widest italic">
                      Final_Factory_Gate
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-white tabular-nums italic">
                      ₹{Math.round(pricingResult.grandTotal).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckCircle2({ size, className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
