"use client";
import React from 'react';
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Globe, Send, ShieldCheck, AlertCircle, Clock, Truck, Calculator } from "lucide-react";
import Link from 'next/link';

export default function InternationalShippingPage() {
    return (
        <div className="min-h-screen bg-white text-gray-950 font-sans selection:bg-emerald-500 selection:text-white">
            <Navbar />

            <main className="pt-24 lg:pt-32">
                {/* Hero Header */}
                <section className="px-6 lg:px-12 py-16 md:py-24 bg-gray-950 text-white rounded-b-[3rem] md:rounded-b-[5rem] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-emerald-500/10 blur-[120px] rounded-full -mr-32 -mt-32 pointer-events-none" />
                    <div className="max-w-[1200px] mx-auto text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center mb-6 md:mb-8 backdrop-blur-md">
                                <Globe className="text-emerald-400" size={28} />
                            </div>
                            <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 md:mb-6 block">Global_Flow</span>
                            <h1 className="text-4xl md:text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-6 md:mb-8 text-white">
                                International <br /> <span className="text-emerald-500 italic">Shipping.</span>
                            </h1>
                            <p className="text-gray-400 text-base md:text-xl font-medium italic max-w-2xl leading-relaxed">
                                Bringing BoxFox excellence to your doorstep, anywhere in the world. Partnered with UPS and DHL for reliable global logistics.
                            </p>
                        </motion.div>
                    </div>
                </section>

                <section className="px-6 lg:px-12 py-16 md:py-24 lg:py-32">
                    <div className="max-w-[1400px] mx-auto">
                        <div className="grid lg:grid-cols-12 gap-12 md:gap-16 lg:gap-24">
                            {/* Left: Inquiry Form */}
                            <div className="lg:col-span-7 order-2 lg:order-1">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="bg-gray-50 p-8 sm:p-12 md:p-16 rounded-[2.5rem] md:rounded-[4rem] border border-gray-100 shadow-xl shadow-gray-200/50"
                                >
                                    <div className="mb-10 md:mb-12">
                                        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-gray-950 mb-3 italic">Get A Global Quote.</h2>
                                        <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-600">Calculated based on weight & destination</p>
                                    </div>

                                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                        <div className="space-y-2 md:space-y-3">
                                            <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 md:ml-5">Name*</label>
                                            <input required type="text" className="w-full px-6 md:px-8 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] bg-white border border-gray-100 focus:border-emerald-500 outline-none font-bold text-sm transition-all" placeholder="Enter Full Name" />
                                        </div>
                                        <div className="space-y-2 md:space-y-3">
                                            <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 md:ml-5">Email*</label>
                                            <input required type="email" className="w-full px-6 md:px-8 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] bg-white border border-gray-100 focus:border-emerald-500 outline-none font-bold text-sm transition-all" placeholder="name@company.com" />
                                        </div>
                                        <div className="space-y-2 md:space-y-3">
                                            <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 md:ml-5">Country</label>
                                            <input required type="text" className="w-full px-6 md:px-8 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] bg-white border border-gray-100 focus:border-emerald-500 outline-none font-bold text-sm transition-all" placeholder="Destination Country" />
                                        </div>
                                        <div className="space-y-2 md:space-y-3">
                                            <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 md:ml-5">Contact Number</label>
                                            <input required type="tel" className="w-full px-6 md:px-8 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] bg-white border border-gray-100 focus:border-emerald-500 outline-none font-bold text-sm transition-all" placeholder="Direct Number" />
                                        </div>
                                        <div className="space-y-2 md:space-y-3 md:col-span-2">
                                            <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 md:ml-5">Individual or Business</label>
                                            <div className="relative">
                                                <select className="w-full px-6 md:px-8 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] bg-white border border-gray-100 focus:border-emerald-500 outline-none font-bold text-sm transition-all appearance-none cursor-pointer">
                                                    <option>Yes, I am a Business</option>
                                                    <option>No, I am an Individual</option>
                                                </select>
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                    <Truck size={16} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 md:space-y-3 md:col-span-2">
                                            <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 md:ml-5">Message</label>
                                            <textarea rows={4} className="w-full px-6 md:px-8 py-5 md:py-6 rounded-[1.5rem] md:rounded-[2.5rem] bg-white border border-gray-100 focus:border-emerald-500 outline-none font-bold text-sm transition-all resize-none" placeholder="Describe your requirement (Product, Quantity)..."></textarea>
                                        </div>
                                        <div className="md:col-span-2 pt-4">
                                            <button className="w-full py-5 md:py-6 bg-gray-950 text-white rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center gap-4 font-black text-xs uppercase tracking-[0.4em] hover:bg-emerald-500 transition-all shadow-xl active:scale-[0.98] group">
                                                Request Global Quote
                                                <Send size={18} className="group-hover:translate-x-2 transition-transform" />
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>

                            {/* Right: Policy Details */}
                            <div className="lg:col-span-5 space-y-10 md:space-y-12 order-1 lg:order-2">
                                <div className="space-y-8">
                                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-gray-950 italic border-l-4 border-emerald-500 pl-6 mb-8">
                                        Logistics Network
                                    </h3>

                                    <div className="space-y-6 md:space-y-8">
                                        {/* Carriers */}
                                        <div className="flex gap-5 md:gap-6 items-start group">
                                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-emerald-50 transition-colors">
                                                <Truck className="text-emerald-500" size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-600 mb-1.5 md:mb-2 font-mono">Carrier_Partners</h4>
                                                <p className="text-xs md:text-sm font-bold text-gray-500 uppercase leading-relaxed tracking-tight group-hover:text-gray-700 transition-colors">BoxFox (IOPL) partners with UPS and DHL for our valued international customers.</p>
                                            </div>
                                        </div>

                                        {/* Delivery Time */}
                                        <div className="flex gap-5 md:gap-6 items-start group">
                                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                                                <Clock className="text-blue-500" size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-blue-600 mb-1.5 md:mb-2 font-mono">Transit_Window</h4>
                                                <p className="text-xs md:text-sm font-bold text-gray-500 uppercase leading-relaxed tracking-tight group-hover:text-gray-700 transition-colors">Packages delivered in 3 – 12 business days (Mon – Fri). Weekend delivery is not available.</p>
                                            </div>
                                        </div>

                                        {/* Rates */}
                                        <div className="flex gap-5 md:gap-6 items-start group">
                                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-orange-50 transition-colors">
                                                <Calculator className="text-orange-500" size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-orange-600 mb-1.5 md:mb-2 font-mono">Rate_Calculation</h4>
                                                <p className="text-xs md:text-sm font-bold text-gray-500 uppercase leading-relaxed tracking-tight group-hover:text-gray-700 transition-colors">Rates are calculated based on weight. Fill out the form for your specific quote.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Customs Alert Card */}
                                <div className="bg-gray-950 text-white p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full group-hover:scale-110 transition-transform duration-700" />
                                    <div className="relative z-10 space-y-4">
                                        <div className="flex items-center gap-3 text-emerald-400 mb-2">
                                            <ShieldCheck size={20} className="animate-pulse" />
                                            <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em]">CUSTOMS_&_DUTIES</h4>
                                        </div>
                                        <p className="text-xs md:text-sm font-bold text-gray-300 leading-relaxed uppercase tracking-widest">
                                            Shipping rates cover transit ONLY. Duties, taxes, and brokerage fees are NOT included. Recipient must pay these upon delivery as assessed by the local customs office.
                                        </p>
                                        <p className="text-[9px] md:text-[10px] font-black text-gray-500 italic uppercase">
                                            * Identification (Unique ID/Tax ID) may be required for customs clearance.
                                        </p>
                                    </div>
                                </div>

                                {/* Address restriction */}
                                <div className="flex items-start gap-4 p-5 md:p-6 bg-red-50 rounded-2xl border border-red-100">
                                    <AlertCircle className="text-red-500 shrink-0" size={20} />
                                    <p className="text-[9px] md:text-[10px] font-black text-red-600 uppercase tracking-widest leading-relaxed">
                                        We cannot ship to international PO Boxes. A verifiable physical address is required.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Return Policy Section */}
                <section className="px-6 lg:px-12 py-20 md:py-32 bg-gray-50 rounded-[3rem] md:rounded-[5rem] mx-4 md:mx-6 lg:mx-12">
                    <div className="max-w-[1200px] mx-auto">
                        <div className="flex flex-col items-center mb-12 md:mb-16 text-center">
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-gray-950">Returns & Refunds.</h2>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mt-4">International_Protocol</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-white p-8 sm:p-12 md:p-14 rounded-[2.5rem] md:rounded-[3.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all"
                            >
                                <h3 className="text-xl font-black uppercase text-gray-950 mb-6 italic border-b-2 border-emerald-500 pb-2 inline-block">Standard Policy</h3>
                                <p className="text-sm font-bold text-gray-400 leading-relaxed uppercase tracking-tight italic">
                                    At present, we will not accept any returns or exchanges on international orders due to high shipping costs. If you wish to proceed despite this, all associated costs (return customs, duties, taxes) must be borne by you.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="bg-emerald-500 text-white p-8 sm:p-12 md:p-14 rounded-[2.5rem] md:rounded-[3.5rem] shadow-xl shadow-emerald-500/20"
                            >
                                <h3 className="text-xl font-black uppercase text-white mb-6 italic border-b-2 border-white/30 pb-2 inline-block">IOPL Commitments</h3>
                                <ul className="space-y-6">
                                    <li className="flex gap-4 group">
                                        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0 mt-0.5 group-hover:bg-white group-hover:text-emerald-500 transition-colors">
                                            <span className="text-xs font-black">1</span>
                                        </div>
                                        <p className="text-[11px] md:text-xs font-black text-white uppercase leading-snug tracking-tighter italic">If we made an error, we will send the correct product at no extra cost.</p>
                                    </li>
                                    <li className="flex gap-4 group">
                                        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0 mt-0.5 group-hover:bg-white group-hover:text-emerald-500 transition-colors">
                                            <span className="text-xs font-black">2</span>
                                        </div>
                                        <p className="text-[11px] md:text-xs font-black text-white uppercase leading-snug tracking-tighter italic">Damage below 30% of order will be refunded or adjusted with your next order. Small parcels won't be resent.</p>
                                    </li>
                                </ul>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="px-6 py-24 md:py-32 text-center">
                    <h2 className="text-2xl md:text-4xl font-black text-gray-300 italic uppercase mb-8 md:mb-12">Need further assistance?</h2>
                    <Link href="/contact" className="inline-block px-10 md:px-16 py-5 md:py-6 bg-gray-950 text-white font-black rounded-full hover:bg-emerald-500 transition-all uppercase tracking-[0.4em] text-xs md:text-sm shadow-2xl active:scale-95">
                        Contact Official Support
                    </Link>
                </section>
            </main>

        </div>
    );
}
