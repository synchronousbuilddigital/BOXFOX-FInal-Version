"use client";
import React from 'react';
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Plane, Truck, Calendar, Clock, AlertCircle, Info, MapPin } from "lucide-react";
import Link from 'next/link';

export default function DomesticShippingPage() {
    const shippingRegions = [
        { region: "Delhi NCR", standard: "2 Days", express: "1 Day" },
        { region: "Metro Cities", standard: "3-5 Days", express: "1-2 Days" },
        { region: "Kerala", standard: "7-10 Days", express: "2-3 Days" },
        { region: "South India", standard: "5-7 Days", express: "2-3 Days" },
        { region: "East & NE", standard: "10-15 Days", express: "NA" },
        { region: "North India", standard: "7-10 Days", express: "2-3 Days" },
        { region: "West India", standard: "5-7 Days", express: "2-3 Days" },
        { region: "Central India", standard: "7-10 Days", express: "2-3 Days" },
        { region: "J&K", standard: "10-15 Days", express: "NA" },
    ];

    return (
        <div className="min-h-screen bg-white text-gray-950 font-sans selection:bg-emerald-500 selection:text-white">
            <Navbar />

            <main className="pt-24 lg:pt-32">
                {/* Hero Header */}
                <section className="px-6 lg:px-12 py-20 bg-gray-50/50">
                    <div className="max-w-[1000px] mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                                <Plane className="text-emerald-500" size={32} />
                            </div>
                            <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6 block">Domestic_Reach</span>
                            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-8">
                                India <span className="text-emerald-500 italic">Shipping.</span>
                            </h1>
                            <p className="text-gray-500 text-lg font-medium italic max-w-2xl leading-relaxed">
                                Detailed shipping protocols for Pan-India logistics, covering transit times, express options, and regional serviceability.
                            </p>
                        </motion.div>
                    </div>
                </section>

                <section className="px-6 lg:px-12 py-24 pb-48">
                    <div className="max-w-[1100px] mx-auto">
                        <div className="space-y-16">

                            {/* Key Highlights */}
                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-4">Retail Perk</h3>
                                    <p className="text-lg font-black text-gray-950 leading-tight mb-2 italic">FREE Standard Shipping</p>
                                    <p className="text-xs font-bold text-gray-500 uppercase">On retail orders over ₹2,000 within India.</p>
                                </div>
                                <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Standard Flow</h3>
                                    <p className="text-lg font-black text-gray-950 leading-tight mb-2 italic">2 Business Days</p>
                                    <p className="text-xs font-bold text-gray-500 uppercase">Dispatch timeline for all regular inventory orders.</p>
                                </div>
                                <div className="p-8 bg-gray-950 text-white rounded-[2.5rem] border border-gray-800">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-4">Custom Print</h3>
                                    <p className="text-lg font-black text-white leading-tight mb-2 italic">7-10 Working Days</p>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Required lead time for bespoke printed orders.</p>
                                </div>
                            </div>

                            {/* Logistics Calendar */}
                            <div className="space-y-8">
                                <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-950 flex items-center gap-4">
                                    <span className="w-8 h-px bg-emerald-500" />
                                    Fulfillment Windows
                                </h2>
                                <div className="grid md:grid-cols-2 gap-12">
                                    <div className="flex gap-6 items-start">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                                            <Calendar className="text-emerald-500" size={24} />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-black uppercase tracking-widest text-gray-950">Monday - Friday Operation</h4>
                                            <p className="text-xs font-bold text-gray-400 leading-relaxed uppercase tracking-tight">Orders after 11AM IST on Fridays are processed the following Monday. No Saturday/Sunday processing.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6 items-start">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                                            <Info className="text-blue-500" size={24} />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-black uppercase tracking-widest text-gray-950">Dispatch Basis</h4>
                                            <p className="text-xs font-bold text-gray-400 leading-relaxed uppercase tracking-tight italic">Delivery time is calculated from the day of order dispatch and not from when the order is received.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Transit Matrix Table */}
                            <div className="space-y-8">
                                <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-950 flex items-center gap-4">
                                    <span className="w-8 h-px bg-emerald-500" />
                                    Transit Matrix
                                </h2>
                                <div className="overflow-hidden border border-gray-100 rounded-[3rem] shadow-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                                <th className="px-8 py-6 border-b border-gray-100">Destinated Region</th>
                                                <th className="px-8 py-6 border-b border-gray-100">Standard (Surface)</th>
                                                <th className="px-8 py-6 border-b border-gray-100">Express (Air)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 bg-white">
                                            {shippingRegions.map((row) => (
                                                <tr key={row.region} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="px-8 py-6 flex items-center gap-3">
                                                        <MapPin size={14} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        <span className="text-[11px] font-black text-gray-950 tracking-widest italic">{row.region}</span>
                                                    </td>
                                                    <td className="px-8 py-6 text-xs text-gray-500 font-bold uppercase tracking-tight underline decoration-emerald-500/20 underline-offset-4">
                                                        {row.standard}
                                                    </td>
                                                    <td className={`px-8 py-6 text-xs font-black uppercase tracking-widest ${row.express === 'NA' ? 'text-gray-300' : 'text-emerald-600'}`}>
                                                        {row.express}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-center">
                                    * Express shipping is subject to availability and serviceable areas only.
                                </p>
                            </div>

                            {/* Express Shipping Logic */}
                            <div className="bg-emerald-50 p-10 sm:p-14 rounded-[4rem] border border-emerald-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white opacity-40 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                                <div className="relative z-10 space-y-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center text-emerald-500 shadow-xl border border-emerald-100">
                                            <Zap size={28} className="fill-emerald-500" />
                                        </div>
                                        <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-950 italic">Express Logic</h2>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-12">
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-emerald-600">Premium Charge</h4>
                                            <p className="text-xs font-bold text-gray-500 leading-relaxed uppercase tracking-tight">Express shipping is always charged extra. No free tier is available for express Air fulfillment.</p>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-emerald-600">Weight Adjustments</h4>
                                            <p className="text-xs font-bold text-gray-500 leading-relaxed uppercase tracking-tight">Large or heavy parcels may not qualify for Express even if paid. In such cases, the difference will be refunded to your account.</p>
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-emerald-100/50">
                                        <p className="text-sm font-black text-gray-950 uppercase tracking-tighter italic">If express quotes significantly differ due to weight after order placement, we will contact you for confirmation before dispatch.</p>
                                    </div>
                                </div>
                            </div>

                            {/* International Link */}
                            <div className="pt-16 border-t border-gray-100 text-center">
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-400 mb-8 italic">Looking to own BoxFox in your country?</h3>
                                <Link href="/international-shipping" className="inline-flex items-center gap-4 px-12 py-6 bg-gray-950 text-white rounded-full font-black text-xs uppercase tracking-[0.4em] hover:bg-emerald-500 transition-all shadow-xl group">
                                    Read International Shipping Policy
                                    <Plane size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                        </div>
                    </div>
                </section>
            </main>

        </div>
    );
}

function Zap({ size, className }) {
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
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
    );
}
