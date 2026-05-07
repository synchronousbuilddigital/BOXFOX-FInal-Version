"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowRight,
    MapPin,
    Calendar,
    Hash,
    Phone
} from "lucide-react";
import Navbar from "../components/Navbar";

export default function TrackOrderPage() {
    const [query, setQuery] = useState("");
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleTrack = async (e) => {
        e?.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError("");
        setOrder(null);

        try {
            const res = await fetch(`/api/orders/track?q=${encodeURIComponent(query)}`);
            const data = await res.json();

            if (res.ok) {
                setOrder(data);
            } else {
                setError(data.error || "Order not found. Please verify your details.");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return <Clock className="text-amber-500" />;
            case 'Processing': return <Clock className="text-blue-500" />;
            case 'Shipped': return <Truck className="text-indigo-500" />;
            case 'Delivered': return <CheckCircle2 className="text-emerald-500" />;
            case 'Cancelled': return <XCircle className="text-red-500" />;
            default: return <Package className="text-gray-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Processing': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Shipped': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Cancelled': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="min-h-screen bg-white">

            <main className="max-w-4xl mx-auto px-6 pt-32 pb-24">
                <div className="text-center space-y-4 mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-gray-950">
                            Logistics <span className="text-emerald-500">.Track</span>
                        </h1>
                        <p className="text-gray-400 font-bold tracking-[0.2em] uppercase text-[10px] sm:text-xs mt-4">
                            Global Order Tracing System v2.0
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="max-w-lg mx-auto pt-8"
                    >
                        <form onSubmit={handleTrack} className="relative group">
                            <input
                                type="text"
                                placeholder="Order ID or Phone Number"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-5 px-6 pr-16 text-sm font-black text-gray-950 uppercase tracking-widest focus:bg-white focus:border-emerald-500 outline-none transition-all"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-950 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Search size={20} />
                                )}
                            </button>
                        </form>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-4">
                            Enter the unique ORD ID or registered mobile digits
                        </p>
                    </motion.div>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-red-50 border border-red-100 p-6 rounded-3xl text-center mb-8"
                        >
                            <XCircle className="mx-auto text-red-500 mb-2" size={24} />
                            <p className="text-sm font-black text-red-600 uppercase tracking-widest">{error}</p>
                        </motion.div>
                    )}

                    {order && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-gray-200/50">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-gray-50 pb-8 mb-8">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Deployment ID</span>
                                            <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black uppercase tracking-widest">Active</div>
                                        </div>
                                        <h2 className="text-3xl font-black text-gray-950 tracking-tighter uppercase">{order.orderId}</h2>
                                    </div>
                                    <div className={`px-6 py-3 rounded-2xl border flex items-center gap-3 ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        <span className="text-xs font-black uppercase tracking-[0.2em]">{order.status}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Initialization Date</p>
                                                <p className="text-sm font-black text-gray-950 uppercase mt-1">
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric', month: 'long', year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Destination Node</p>
                                                <p className="text-sm font-black text-gray-950 uppercase mt-1 leading-relaxed">
                                                    {order.shipping?.address}, {order.shipping?.city}, {order.shipping?.state} - {order.shipping?.pincode || order.shipping?.zipCode}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-[2rem] p-6 space-y-4">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-2">Manifest_Details</h4>
                                        <div className="space-y-3">
                                            {order.items?.map((item, i) => (
                                                <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100">
                                                    <span className="text-[10px] font-black text-gray-950 uppercase tracking-tight line-clamp-1">{item.name}</span>
                                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">x{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="pt-4 border-t border-gray-200 flex justify-between items-center px-2">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Valuation</span>
                                            <span className="text-lg font-black text-gray-950 tracking-tighter">₹{order.total?.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Need deeper logistics intel?</p>
                                <a
                                    href="https://wa.me/919953302917"
                                    target="_blank"
                                    className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                >
                                    Contact Ground Control <ArrowRight size={14} />
                                </a>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

        </div>
    );
}
