"use client";
import React from 'react';
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Truck, Clock, CreditCard, ShieldCheck, Mail, AlertCircle, RotateCcw, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ShippingPolicyPage() {
    const deliveryFeatures = [
        {
            title: "Professional Courier",
            desc: "Perform by professional courier companies engaged by BOXFOX (IOPL).",
            icon: <Truck className="text-emerald-500" />
        },
        {
            title: "Business Hours",
            desc: "Deliveries available between 10 AM - 8 PM on weekdays only.",
            icon: <Clock className="text-blue-500" />
        },
        {
            title: "Global Reach",
            desc: "Serviceable to your physical address of choice selected during checkout.",
            icon: <ShieldCheck className="text-purple-500" />
        }
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
                                <Truck className="text-emerald-500" size={32} />
                            </div>
                            <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6 block">Logistics_Protocol</span>
                            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-8">
                                Delivery & <br /> <span className="text-emerald-500 italic">Shipping.</span>
                            </h1>
                            <p className="text-gray-500 text-lg font-medium italic max-w-2xl leading-relaxed">
                                Understanding our shipping timelines, delivery costs, and logistics commitments across the BOXFOX (IOPL) network.
                            </p>
                        </motion.div>
                    </div>
                </section>

                <section className="px-6 lg:px-12 py-24 pb-48">
                    <div className="max-w-[900px] mx-auto">
                        <div className="space-y-16">

                            {/* Order Confirmation */}
                            <div className="space-y-8">
                                <div className="flex items-start gap-6">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                                        <Mail size={24} />
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-950 italic">Ordering & Confirmation</h2>
                                        <p className="text-sm font-medium text-gray-500 leading-relaxed uppercase tracking-tight">
                                            Products purchased through the website will be delivered to a physical address of your choice. A confirmation email will be sent immediately upon dispatch. You can ascertain your order status under 'My Account'.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Grid */}
                            <div className="grid md:grid-cols-3 gap-8">
                                {deliveryFeatures.map((item, i) => (
                                    <motion.div
                                        key={item.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-gray-100 transition-all group text-center"
                                    >
                                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                            {item.icon}
                                        </div>
                                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-950 mb-3">{item.title}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-widest">
                                            {item.desc}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Delivery Times & Security */}
                            <div className="grid md:grid-cols-2 gap-12 pt-8">
                                <div className="space-y-6">
                                    <h3 className="text-xl font-black uppercase tracking-tighter text-gray-950 flex items-center gap-3">
                                        <Clock className="text-emerald-500" size={20} />
                                        Timelines (2-10 Days)
                                    </h3>
                                    <p className="text-xs font-bold text-gray-500 leading-relaxed uppercase tracking-tight italic">
                                        Delivery times vary between 2-10 working days depending on location and serviceability. While firmly committed to these estimates, we are unable to guarantee exact timeframes due to unforeseen conditions.
                                    </p>
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-xl font-black uppercase tracking-tighter text-gray-950 flex items-center gap-3">
                                        <AlertCircle className="text-red-500" size={20} />
                                        Customized Exclusion
                                    </h3>
                                    <p className="text-xs font-bold text-gray-500 leading-relaxed uppercase tracking-tight italic">
                                        BOXFOX (IOPL) will not refund amounts if the product doesn't reach you due to repeated failed delivery attempts or incorrect addresses, as our products are customized and hold value only for the original intended user.
                                    </p>
                                </div>
                            </div>

                            {/* Costs Section */}
                            <div className="bg-gray-950 text-white p-10 sm:p-14 rounded-[3.5rem] relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
                                <div className="relative z-10 grid md:grid-cols-12 gap-12 items-center">
                                    <div className="md:col-span-12 space-y-6 text-center">
                                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-white leading-none">
                                            Calculation & <span className="text-emerald-500">Costs.</span>
                                        </h2>
                                        <p className="text-gray-300 text-lg font-medium leading-relaxed max-w-2xl mx-auto italic">
                                            Delivery fees are dynamic based on product weight. Find your specific rate by entering your address on the checkout page. Remote area surcharges may apply at our discretion.
                                        </p>
                                        <div className="flex justify-center flex-wrap gap-4 pt-4">
                                            <div className="px-6 py-3 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5 text-emerald-500/80">Weight_Based_Billing</div>
                                            <div className="px-6 py-3 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5 text-emerald-500/80">Remote_Area_Logic</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Returns Section */}
                            <div className="bg-emerald-50 p-10 sm:p-14 rounded-[4rem] border border-emerald-100">
                                <div className="flex flex-col md:flex-row gap-10 items-center">
                                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-emerald-500 shadow-xl border border-emerald-100 shrink-0">
                                        <RotateCcw size={32} />
                                    </div>
                                    <div className="space-y-4 text-center md:text-left">
                                        <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-950 italic leading-none">Return Policy.</h2>
                                        <p className="text-sm text-gray-600 font-bold uppercase tracking-tight leading-relaxed">
                                            We accept returns or exchanges within 14 days. <br />
                                            <span className="text-emerald-600">Note: No refunds for amounts less than ₹2,000. For such cases, a discount voucher will be created for your next acquisition.</span>
                                        </p>
                                        <div className="pt-4">
                                            <Link href="/contact" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-950 hover:text-emerald-500 transition-colors">
                                                Initialize Exchange Flow <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Liability Final */}
                            <div className="space-y-6">
                                <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-950 flex items-center gap-4">
                                    <span className="w-8 h-px bg-emerald-500" />
                                    Logistic Liability
                                </h2>
                                <p className="text-sm font-bold text-gray-500 leading-relaxed uppercase tracking-tight italic">
                                    All risks pass to the customer upon delivery. BOXFOX (IOPL) will not be liable for losses or late deliveries caused by adverse weather, industrial action, power failure, or internet connectivity issues beyond our control. Users accept full responsibility for accuracy in the information provided.
                                </p>
                            </div>

                        </div>

                        {/* Detailed Link */}
                        <div className="pt-16 border-t border-gray-100 text-center">
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-400 mb-8 italic">Need Regional Transit Times?</h3>
                            <Link href="/domestic-shipping" className="inline-flex items-center gap-4 px-12 py-6 bg-emerald-500 text-white rounded-full font-black text-xs uppercase tracking-[0.4em] hover:bg-gray-950 transition-all shadow-xl group">
                                View Detailed Domestic Shipping Policy
                                <Truck size={18} className="group-hover:translate-x-2 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

        </div>
    );
}
