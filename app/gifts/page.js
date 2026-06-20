/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, Gift, ArrowRight, CheckCircle2, Star, Zap, Shield, Heart, ChevronDown } from "lucide-react";
import Link from "next/link";
import ProductSection from "../components/ProductSection";

const gifts = [
  {
    id: 1,
    name: "Azure Luxe",
    tagline: "High-End Luxury",
    description: "A minimalist teal aesthetic with subtle gold accents, perfect for jewelry or premium accessories.",
    features: ["Reinforced Board", "Gold Stamping", "Magnetic Closure"],
    image: "/images/gifts/azure-luxe.png",
    color: "from-teal-500/10 to-emerald-500/5",
    accent: "teal",
    icon: <Star className="text-teal-500" size={24} />
  },
  {
    id: 2,
    name: "Artisan Bakery",
    tagline: "Rustic Warmth",
    description: "Textured kraft paper with a modern structural design, ensuring pastries look as good as they taste.",
    features: ["Food-Grade", "Custom Ribbon Slot", "Grease-Resistant"],
    image: "/images/gifts/artisan-bakery.png",
    color: "from-orange-500/10 to-yellow-500/5",
    accent: "orange",
    icon: <Heart className="text-orange-500" size={24} />
  },
  {
    id: 3,
    name: "Midnight Exec",
    tagline: "Corporate Power",
    description: "Sleek matte black finish with silver precision foil stamping for a professional statement.",
    features: ["Matte Finish", "Silver Accents", "Rigid Construction"],
    image: "/images/gifts/midnight-exec.png",
    color: "from-gray-950/10 to-gray-500/5",
    accent: "gray",
    icon: <Zap className="text-gray-950" size={24} />
  },
  {
    id: 4,
    name: "Vivid Trio",
    tagline: "Joyful Celebration",
    description: "Vibrant patterns and a celebratory atmosphere, ideal for seasonal gifting and special events.",
    features: ["Vibrant Palette", "Glossy Finish", "Foldable Design"],
    image: "/images/gifts/vivid-trio.png",
    color: "from-pink-500/10 to-purple-500/5",
    accent: "pink",
    icon: <Sparkles className="text-pink-500" size={24} />
  },
  {
    id: 5,
    name: "Botanical Earth",
    tagline: "Eco-Friendly",
    description: "Sustainable materials and elegant illustrations for a packaging solution that respects the planet.",
    features: ["Recyclable", "Soy-Based Inks", "Natural Twine"],
    image: "/images/gifts/botanical-earth.png",
    color: "from-green-500/10 to-lime-500/5",
    accent: "green",
    icon: <Shield className="text-green-600" size={24} />
  },
  {
    id: 6,
    name: "Emerald Perfume",
    tagline: "Sensory Premium",
    description: "Deep velvet interior and a hyper-realistic premium finish for perfumes and cosmetics.",
    features: ["Velvet Lining", "Magnetic Lock", "Logo Embossing"],
    image: "/images/gifts/emerald-perfume.png",
    color: "from-emerald-600/10 to-teal-500/5",
    accent: "emerald",
    icon: <Gift className="text-emerald-500" size={24} />
  },
];

export default function GiftsPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-emerald-500 selection:text-white">

      {/* Hero Section */}
      <section className="pt-24 lg:pt-32 pb-24 px-6 lg:px-14 bg-gray-50/50">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-8"
          >
            Curated Gift Collection 2026
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl lg:text-9xl font-black text-gray-950 uppercase tracking-tighter mb-8 leading-[0.85]"
          >
            Corporate Gifts:<br />
            <span className="text-emerald-500">Perfect Gifting.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto text-gray-500 text-base lg:text-xl font-medium leading-relaxed"
          >
            Premium packaging solutions engineered for the world&apos;s most discerning brands.
            Discover boxes that protect, impress, and endure.
          </motion.p>
        </div>
      </section>

      {/* Alternating Content Sections */}
      <div className="bg-white max-w-[1600px] mx-auto pb-24">
         <ProductSection targetPage="gift" gridCols={3} />
      </div>

      <section className="py-32 px-6 lg:px-14 bg-gray-50 border-t border-gray-100" id="quote">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20">
            <div className="space-y-8">
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

function QuoteForm() {
  const giftTypes = gifts.map(g => g.name);

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
        <input type="text" placeholder="Full Name" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-emerald-500" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
        <input type="email" placeholder="Business Email" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-emerald-500" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
        <input type="tel" placeholder="Phone Number" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-emerald-500" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
        <input type="text" placeholder="Company Name" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-emerald-500" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} />
      </div>
      <div className="space-y-4">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic underline decoration-emerald-500/30 underline-offset-4">Gift Type</p>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenGiftDropdown(!openGiftDropdown)}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-emerald-500 text-left flex items-center justify-between hover:border-emerald-300 transition-colors"
          >
            <span className={`${formData.giftType ? 'text-gray-900' : 'text-gray-400'} truncate min-w-0 flex-1`}>
              {formData.giftType || 'Select Gift Box Type'}
            </span>
            <ChevronDown size={16} className={`transition-transform shrink-0 ml-2 ${openGiftDropdown ? 'rotate-180' : ''}`} />
          </button>

          {openGiftDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg z-10 max-h-60 overflow-y-auto">
              {giftTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, giftType: type });
                    setOpenGiftDropdown(false);
                  }}
                  className="w-full text-left px-6 py-3 text-xs font-bold hover:bg-emerald-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      <div className="space-y-4">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic underline decoration-emerald-500/30 underline-offset-4">Gift Specifications</p>
        {formData.items.map((item, i) => (
          <div key={i} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Product Name Dropdown */}
              <div className="sm:col-span-2 relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === i ? null : i)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-emerald-500 text-left flex items-center justify-between hover:border-emerald-300 transition-colors"
                >
                  <span className={`${item.productName ? 'text-gray-900' : 'text-gray-400'} truncate min-w-0 flex-1`}>
                    {item.productName || 'Select Product'}
                  </span>
                  <ChevronDown size={16} className={`transition-transform shrink-0 ml-2 ${openDropdown === i ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {openDropdown === i && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg z-10 max-h-60 overflow-y-auto">
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
                          className="w-full text-left px-6 py-3 text-xs font-bold hover:bg-emerald-50 border-b border-gray-100 last:border-b-0 transition-colors"
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
              <input type="number" placeholder="Qty" className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-emerald-500" value={item.quantity} onChange={e => {
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
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-3 text-xs font-bold outline-none focus:border-emerald-500 text-left flex items-center justify-between hover:border-emerald-300 transition-colors"
              >
                <span className={`${item.gift ? 'text-gray-900' : 'text-gray-400'} truncate min-w-0 flex-1`}>
                  {item.gift || 'Select Gift Option (optional)'}
                </span>
                <ChevronDown size={16} className={`transition-transform shrink-0 ml-2 ${openGiftDropdownIndex === i ? 'rotate-180' : ''}`} />
              </button>

              {openGiftDropdownIndex === i && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg z-10 max-h-60 overflow-y-auto">
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
                      className="w-full text-left px-6 py-3 text-xs font-bold hover:bg-emerald-50 border-b border-gray-100 last:border-b-0 transition-colors"
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
        <input type="tel" placeholder="WhatsApp Number (with country code, e.g. 9198xxxx...)" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-emerald-500" value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} required />
        <textarea placeholder="Optional message / brief requirement" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-emerald-500" value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} rows={3} />
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-gray-950 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-emerald-500 transition-all shadow-xl active:scale-95 disabled:opacity-70">
        {isSubmitting ? "Sending..." : "Submit Inquiry"}
      </button>
    </form>
  );
}

function GiftSection({ gift, index }) {
  const isEven = index % 2 === 0;

  return (
    <section className={`py-20 lg:py-40 overflow-hidden ${isEven ? 'bg-white' : 'bg-gray-50/30'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-14">
        <div className={`flex flex-col lg:flex-row items-center gap-16 lg:gap-32 ${isEven ? '' : 'lg:flex-row-reverse'}`}>

          {/* Image Column */}
          <motion.div
            initial={{ opacity: 0, x: isEven ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="w-full lg:w-1/2"
          >
            <div className={`relative aspect-4/3 sm:aspect-square lg:aspect-4/5 rounded-3xl lg:rounded-5xl overflow-hidden bg-linear-to-br ${gift.color} flex items-center justify-center p-8 sm:p-16 group shadow-2xl shadow-gray-200/50`}>
              <img
                src={gift.image}
                alt={gift.name}
                className="w-full h-full object-contain drop-shadow-[0_35px_60px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform duration-1000 ease-out"
              />
              {/* Floating Icon Decoration */}
              <div className="absolute top-8 right-8 lg:top-12 lg:right-12 bg-white/90 backdrop-blur-xl p-5 lg:p-7 rounded-4xl shadow-xl border border-white/50 animate-float">
                {gift.icon}
              </div>
            </div>
          </motion.div>

          {/* Content Column */}
          <motion.div
            initial={{ opacity: 0, x: isEven ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="w-full lg:w-1/2 space-y-10"
          >
            <div className="space-y-4">
              <span className="text-[10px] lg:text-[12px] font-black uppercase tracking-[0.4em] text-emerald-500">{gift.tagline}</span>
              <h2 className="text-4xl lg:text-7xl font-black text-gray-950 uppercase tracking-tighter leading-none">
                {gift.name}
              </h2>
            </div>

            <p className="text-gray-500 text-lg lg:text-xl font-medium leading-relaxed">
              {gift.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {gift.features.map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl border border-gray-100 group hover:border-emerald-200 hover:bg-emerald-50/30 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="text-[11px] lg:text-[13px] font-black text-gray-900 uppercase tracking-widest">{feature}</span>
                </motion.div>
              ))}
            </div>


          </motion.div>

        </div>
      </div>
    </section>
  );
}
