"use client";
import { motion } from "framer-motion";
import { ArrowUpRight, Box, Layers, Zap, PenTool, ShieldCheck, Heart, LayoutGrid, Package, Star, Circle, Square, ShoppingBag, Gift } from "lucide-react";
import Link from "next/link";

const categories = [
  {
    id: 14,
    index: "01",
    name: "Pizza Box",
    desc: "Thick, heat-retaining corrugated boxes designed specifically for hot, delicious pizzas.",
    img: "/categories/cat_cake.png",
    icon: <Square className="w-6 h-6" />,
    stats: "HEAT-SAFE",
    needsBranding: true
  },
  {
    id: 3,
    index: "02",
    name: "Cake Box",
    desc: "Sturdy, oil-safe packaging built to keep your bakery creations fresh and intact.",
    img: "/categories/cat_cake.png",
    icon: <Zap className="w-6 h-6" />,
    stats: "OIL-SAFE"
  },
  {
    id: 12,
    index: "03",
    name: "Burger Box",
    desc: "Sturdy, grease-resistant boxes crafted to keep your premium burgers hot and intact.",
    img: "/categories/cat_cake.png",
    icon: <Box className="w-6 h-6" />,
    stats: "DURABLE",
    needsBranding: true
  },
  {
    id: 13,
    index: "04",
    name: "Food Box",
    desc: "Versatile, secure containers for meals on the go, maintaining freshness perfectly.",
    img: "/categories/cat_bento.png",
    icon: <Package className="w-6 h-6" />,
    stats: "FRESH",
    needsBranding: true
  },
  {
    id: 15,
    index: "05",
    name: "Wok Box",
    desc: "Leak-proof boxes featuring easy-fold tops, ideal for noodles and hot wok dishes.",
    img: "/categories/cat_cupcake.png",
    icon: <Box className="w-6 h-6" />,
    stats: "LEAK-PROOF",
    needsBranding: true
  },
  {
    id: 2,
    index: "06",
    name: "CupCake",
    desc: "Secure display boxes engineered with inserts to protect delicate frostings.",
    img: "/categories/cat_cupcake.png",
    icon: <Box className="w-6 h-6" />,
    stats: "DISPLAY"
  },
  {
    id: 11,
    index: "07",
    name: "CupCake + Bento",
    desc: "The ultimate combo box, intelligently divided for cakes and matching cupcakes.",
    img: "/categories/cat_bento.png",
    icon: <Package className="w-6 h-6" />,
    stats: "VERSATILE",
    needsBranding: true
  },
  {
    id: 1,
    index: "08",
    name: "Gifting",
    desc: "Elegant and luxurious packaging designed to make every gift truly stand out.",
    img: "/categories/cat_gifting.png",
    icon: <Gift className="w-6 h-6" />,
    stats: "PREMIUM"
  },
  {
    id: 4,
    index: "09",
    name: "Hamper Box",
    desc: "Beautifully structured, spacious hampers perfect for curating large gift sets.",
    img: "/categories/cat_hamper.png",
    icon: <Layers className="w-6 h-6" />,
    stats: "DURABLE"
  },
  {
    id: 5,
    index: "10",
    name: "Platter",
    desc: "Durable clear platters for beautifully organizing and presenting your assortments.",
    img: "/categories/cat_platter_branded.png",
    icon: <LayoutGrid className="w-6 h-6" />,
    stats: "PRESENTATION"
  },
  {
    id: 6,
    index: "11",
    name: "Loaf",
    desc: "Long, perfectly sized boxes keeping your freshly baked loaf cakes entirely secure.",
    img: "/categories/cat_loaf_branded.png",
    icon: <ShoppingBag className="w-6 h-6" />,
    stats: "CLASSIC"
  },
  {
    id: 7,
    index: "12",
    name: "Pastry",
    desc: "Exquisite pastry boxes preserving both the texture and visual appeal of delicate treats.",
    img: "/categories/cat_pastry.png",
    icon: <Star className="w-6 h-6" />,
    stats: "DELICATE",
    needsBranding: true
  },
  {
    id: 8,
    index: "13",
    name: "Chocolate Box",
    desc: "Luxurious, rigid structural designs specifically crafted for premium chocolates.",
    img: "/categories/cat_chocolate_box.png",
    icon: <Heart className="w-6 h-6" />,
    stats: "ARTISANAL",
    needsBranding: true
  },
  {
    id: 9,
    index: "14",
    name: "Macaron",
    desc: "Protective sleeve boxes allowing colorful macarons to take center stage.",
    img: "/categories/cat_macaron.png",
    icon: <Circle className="w-6 h-6" />,
    stats: "STYLISH",
    needsBranding: true
  },
  {
    id: 10,
    index: "15",
    name: "Brownie",
    desc: "Compact and sturdy boxes tailored perfectly for dense, rich brownie portions.",
    img: "/categories/cat_brownie.png",
    icon: <Square className="w-6 h-6" />,
    stats: "COMPACT",
    needsBranding: true
  },
  {
    id: 16,
    index: "16",
    name: "Wrap Box",
    desc: "Conveniently shaped, easy-to-hold packaging specifically tailored for wraps and rolls.",
    img: "/categories/cat_loaf_branded.png",
    icon: <Package className="w-6 h-6" />,
    stats: "CONVENIENT",
    needsBranding: true
  },
  {
    id: 17,
    index: "17",
    name: "Popcorn",
    desc: "Fun, functional, and sturdy popcorn tubs, perfect for events or cinema nights.",
    img: "/categories/cat_brownie.png",
    icon: <Circle className="w-6 h-6" />,
    stats: "CLASSIC",
    needsBranding: true
  },
  {
    id: 18,
    index: "18",
    name: "Carry Bag",
    desc: "Premium quality carry bags designed for secure transportation and stylish presentation.",
    img: "/categories/cat_gifting.png",
    icon: <ShoppingBag className="w-6 h-6" />,
    stats: "PREMIUM",
    needsBranding: true
  }
];
export default function CategorySection() {
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
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6 lg:gap-8">
          {categories.map((cat, idx) => (
            <Link key={cat.id} href={`/shop?category=${encodeURIComponent(cat.name)}`} passHref>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
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
                <p className="text-[11px] sm:text-xs text-gray-500 font-medium leading-relaxed line-clamp-2">
                  {cat.desc}
                </p>

                <div className="mt-auto pt-3 sm:pt-4 flex items-center justify-between border-t border-gray-100/50">
                  <span className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest">Premium Choice</span>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-950 group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm group-hover:rotate-45">
                    <ArrowUpRight size={14} className="sm:w-4 sm:h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Background Decorative Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[-1]">
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "100px 100px" }} />
      </div>
    </section>
  );
}

