"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Package, DollarSign, Mail, Phone, Briefcase } from "lucide-react";
import Navbar from "../components/Navbar";
import PortalAIAssistant from "../components/PortalAIAssistant";

function getVendorQuoteStatus(status) {
    if (status === 'completed' || status === 'fulfilled') return 'completed';
    if (status === 'in-progress') return 'in-progress';
    return 'allotted';
}

function statusClass(status) {
    switch (status) {
        case 'in-progress': return 'bg-blue-500/15 text-blue-300 border-blue-500/20';
        case 'completed': return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20';
        default: return 'bg-amber-500/15 text-amber-300 border-amber-500/20';
    }
}

export default function VendorDashboard() {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        setRefreshing(true);
        try {
            const res = await fetch("/api/vendor/quotes");
            const data = await res.json();
            setQuotes(data.quotes || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const updateProjectStatus = async (quoteId, status) => {
        await fetch('/api/vendor/quotes', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quoteId, status })
        });
        loadData();
    };

    useEffect(() => { loadData(); }, []);

    if (loading) return <div className="min-h-screen bg-[#080d14] flex items-center justify-center text-white/30 font-black uppercase tracking-widest italic">Loading Orders...</div>;

    return (
        <div className="min-h-screen bg-[#080d14] text-white selection:bg-emerald-500/30">
            <Navbar />
            <div className="max-w-350 mx-auto px-6 py-32">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
                    <div>
                        <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 italic">Manufacturing Portal</p>
                        <h1 className="text-6xl text-white font-black uppercase tracking-tighter italic">Allocated <br /> Projects</h1>
                    </div>
                    <button onClick={loadData} className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                        <RefreshCw className={refreshing ? 'animate-spin' : ''} size={16} /> Refresh Feed
                    </button>
                </div>

                <div className="grid gap-8">
                    {quotes.map((quote) => (
                        <div key={quote._id} className="bg-white/5 border border-white/10 rounded-[3rem] p-8 lg:p-12 hover:bg-white/[0.07] transition-all relative overflow-hidden">
                            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-400/40 to-transparent" />
                            <div className="grid lg:grid-cols-3 gap-12">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black italic">O</div>
                                        <div>
                                            <p className="text-sm font-black uppercase italic tracking-tight">Order #{quote._id.slice(-6).toUpperCase()}</p>
                                            <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Workflow: {getVendorQuoteStatus(quote.status)}</p>
                                        </div>
                                    </div>
                                    <div className={`inline-flex items-center px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] ${statusClass(getVendorQuoteStatus(quote.status))}`}>
                                        {getVendorQuoteStatus(quote.status)}
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2"><Mail size={12} /> {quote.user?.email}</p>
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2"><Phone size={12} /> {quote.user?.phone}</p>
                                    </div>
                                </div>

                                <div className="space-y-6 border-l border-white/5 pl-12">
                                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic flex items-center gap-2"><Package size={14} /> Production Items</h4>
                                    <div className="space-y-4">
                                        {quote.items.map((item, i) => (
                                            <div key={i} className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                                <p className="text-xs font-black uppercase italic">{item.productName}</p>
                                                <p className="text-[10px] font-bold text-white/30 uppercase mt-1 italic">Quantity: {item.quantity}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-8 border-l border-white/5 pl-12 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block">Settlement Amount</label>
                                        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl">
                                            <p className="text-4xl font-black italic text-emerald-500 flex items-center gap-2">
                                                ₹ {quote.vendorAmount || 0}
                                            </p>
                                            <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] mt-2">Payout for this fulfillment</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            disabled={getVendorQuoteStatus(quote.status) !== 'allotted'}
                                            onClick={() => updateProjectStatus(quote._id, 'in-progress')}
                                            className="py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/15 hover:border-blue-500/30 transition-all disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:border-white/10"
                                        >
                                            Start Work
                                        </button>
                                        <button
                                            disabled={getVendorQuoteStatus(quote.status) !== 'in-progress'}
                                            onClick={() => updateProjectStatus(quote._id, 'completed')}
                                            className="py-3 rounded-2xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all disabled:opacity-30"
                                        >
                                            Mark Complete
                                        </button>
                                    </div>
                                    
                                    <button className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">
                                        Download Specs
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {quotes.length === 0 && (
                        <div className="py-32 text-center opacity-20 text-sm font-black uppercase tracking-widest italic flex flex-col items-center gap-4">
                            <Briefcase size={40} />
                            No projects allocated yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
