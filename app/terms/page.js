"use client";
import React from 'react';
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Gavel, Scale, ShieldAlert, FileCheck, Clock, Palette, CheckCircle2 } from "lucide-react";

export default function TermsPage() {
    const provisions = [
        {
            title: "Website Authorization",
            icon: <FileCheck className="text-emerald-500" />,
            content: "User can only use the website as permitted by IOPL. They may not interfere with website performance by using any technology or program, or attempt to change content, tools, or widgets."
        },
        {
            title: "Intellectual Property",
            icon: <Scale className="text-blue-500" />,
            content: "IOPL solely owns the copyright to all content, including design, graphics, and organization. Distribution or copying of such materials is prohibited and subject to legal action."
        },
        {
            title: "Color Match Disclaimer",
            icon: <Palette className="text-orange-500" />,
            content: "We use standard industry software but do not guarantee exact color matching. Slight variations are acceptable and not considered production mistakes. For exact matches, order a sample."
        },
        {
            title: "Delivery Estimates",
            icon: <Clock className="text-purple-500" />,
            content: "Estimated delivery dates are indicative only and based on production-ready orders. They do not include public holidays or shipping delays, which must be addressed with the carrier."
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
                                <Gavel className="text-emerald-500" size={32} />
                            </div>
                            <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6 block">Legal_Framework</span>
                            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-8">
                                Terms & <span className="text-emerald-500 italic">Conditions.</span>
                            </h1>
                            <p className="text-gray-500 text-lg font-medium italic max-w-2xl leading-relaxed">
                                The governing protocols and legal framework for the use of the IOPL website and our manufacturing services.
                            </p>
                        </motion.div>
                    </div>
                </section>

                <section className="px-6 lg:px-12 py-24 pb-48">
                    <div className="max-w-[900px] mx-auto">
                        <div className="space-y-16">

                            {/* Intro Section */}
                            <div className="space-y-6">
                                <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-950 flex items-center gap-4">
                                    <span className="w-8 h-px bg-emerald-500" />
                                    General Governance
                                </h2>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    The following terms and conditions are governing the use of the IOPL <span className="text-gray-950 font-bold italic">“Indo Omakase Pvt Ltd”</span> website. The right to add, delete and/or modify any points in this page is reserved with us.
                                </p>
                            </div>

                            {/* Eligibility */}
                            <div className="p-10 sm:p-14 bg-gray-950 text-white rounded-[4rem] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400">
                                            <ShieldAlert size={24} />
                                        </div>
                                        <h3 className="text-2xl font-black uppercase tracking-tighter italic">Eligibility Protocol</h3>
                                    </div>
                                    <p className="text-gray-400 font-medium leading-relaxed mb-6">
                                        IOPL will only provide service to a customer who is above 18 to lawfully use the website. We do not allow customers to collect or use information collected on the website to create imitative work.
                                    </p>
                                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Legal_Enforcement</p>
                                        <p className="text-xs font-bold text-gray-500 mt-2 uppercase">Breach of these conditions entities IOPL to pursue legal course of action under applicable state law.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Core Provisions Grid */}
                            <div className="grid md:grid-cols-2 gap-8">
                                {provisions.map((item, i) => (
                                    <motion.div
                                        key={item.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="p-10 bg-white border border-gray-100 rounded-[3rem] shadow-sm hover:shadow-xl hover:shadow-gray-100 transition-all group"
                                    >
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            {item.icon}
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-950 mb-4">{item.title}</h3>
                                        <p className="text-xs font-bold text-gray-400 leading-relaxed uppercase tracking-tight italic">
                                            {item.content}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Liability & Registration */}
                            <div className="space-y-12">
                                <div className="space-y-6">
                                    <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-950 flex items-center gap-4">
                                        <span className="w-8 h-px bg-emerald-500" />
                                        Liability Limitations
                                    </h2>
                                    <p className="text-sm font-bold text-gray-500 leading-relaxed uppercase tracking-tight">
                                        IOPL will not be liable for any consequential, incidental, indirect, punitive or special damages (including lost profits, lost data or loss of goodwill) arising out of or connected with the use of the site or services, even if advised of the possibility of such damages.
                                    </p>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-12">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="text-emerald-500" size={18} />
                                            <h4 className="font-black uppercase tracking-widest text-xs text-gray-950">Registration</h4>
                                        </div>
                                        <p className="text-xs font-medium text-gray-500 leading-relaxed">
                                            User must provide accurate, complete registration information. Each registration is for personal use only and should not be shared across multiple users.
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="text-emerald-500" size={18} />
                                            <h4 className="font-black uppercase tracking-widest text-xs text-gray-950">Design Responsibility</h4>
                                        </div>
                                        <p className="text-xs font-medium text-gray-500 leading-relaxed">
                                            Please double check all designs before submission. IOPL is not responsible for mistakes in design made by the customer.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Final Note */}
                            <div className="pt-16 border-t border-gray-100 flex flex-col items-center text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic">
                                    Last Updated: February 2026
                                </p>
                                <div className="mt-8 flex gap-4">
                                    <div className="px-6 py-2 bg-emerald-50 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-100">
                                        Active_Status
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>
                </section>
            </main>

        </div>
    );
}
