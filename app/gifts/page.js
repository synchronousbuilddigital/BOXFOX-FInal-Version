/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, Gift, ArrowRight, CheckCircle2, Star, Zap, Shield, Heart, ChevronDown } from "lucide-react";
import Link from "next/link";
import ProductSection from "../components/ProductSection";

export default function GiftsPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-emerald-500 selection:text-white">

      {/* Catalog Section */}
      <section className="pt-32 sm:pt-40 pb-24 bg-white" id="catalog">
        <div className="max-w-7xl mx-auto px-6 lg:px-14 text-center mb-12">
          <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block italic font-bold">Catalog</span>
          <h2 className="text-5xl lg:text-7xl font-black text-gray-950 uppercase tracking-tighter mb-6">Custom Gift Options</h2>
          <p className="max-w-2xl mx-auto text-gray-500 text-sm sm:text-base font-medium leading-relaxed">
            Select a custom design from our library and tailor it to your exact specifications.
          </p>
        </div>
        <div className="max-w-[1600px] mx-auto">
          <ProductSection targetPage="gift" gridCols={3} />
        </div>
      </section>

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
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic underline decoration-emerald-500/30 underline-offset-4">Gift Type</p>
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
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic underline decoration-emerald-500/30 underline-offset-4">Gift Specifications</p>
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


