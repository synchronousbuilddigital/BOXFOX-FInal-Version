"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Package, DollarSign, Mail, Phone, Briefcase, Calendar, Info, ShieldCheck, X, ArrowUpRight } from "lucide-react";
import Navbar from "../components/Navbar";
import PortalAIAssistant from "../components/PortalAIAssistant";
import { useAuth } from "../context/AuthContext";

function getVendorQuoteStatus(status) {
    if (status === 'completed' || status === 'fulfilled') return 'completed';
    if (status === 'in-progress') return 'in-progress';
    return 'allotted';
}

function statusClass(status) {
    switch (status) {
        case 'in-progress': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
}

export default function VendorDashboard() {
    const { user } = useAuth();
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);

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

    const generateShippingLabel = async (quote) => {
        try {
            const { jsPDF } = await import("jspdf");
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: [100, 150] // Standard 4x6 inch thermal shipping label size in mm
            });

            // Draw Outer Box Border
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(1);
            doc.rect(4, 4, 92, 142);

            // Draw Header
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(14);
            doc.text("BOXFOX FULFILLMENT", 50, 14, { align: "center" });
            
            doc.setLineWidth(0.5);
            doc.line(4, 18, 96, 18);

            // SHIP FROM Section
            doc.setFontSize(8);
            doc.setFont("Helvetica", "bold");
            doc.text("SHIP FROM (SENDER):", 6, 23);
            doc.setFont("Helvetica", "normal");
            doc.text("BoxFox Store Central Warehouse", 6, 27);
            doc.text("Gurgaon Industrial Hub, Sector 18", 6, 31);
            doc.text("Gurugram, Haryana, 122015", 6, 35);
            doc.text("Phone: +91 98765 43210 (Support)", 6, 39);

            doc.line(4, 43, 96, 43);

            // SHIP TO Section
            doc.setFont("Helvetica", "bold");
            doc.text("SHIP TO (RECIPIENT):", 6, 48);
            doc.setFont("Helvetica", "normal");
            
            const clientName = quote.user?.name || "Client Order Delivery";
            const clientCompany = quote.user?.company && quote.user.company !== 'Personal' 
                ? quote.user.company 
                : "";
            
            doc.text(clientName, 6, 52);
            let addressY = 56;
            if (clientCompany) {
                doc.text(clientCompany, 6, 56);
                addressY = 60;
            }

            const addr = quote.shippingAddress || {};
            const street = addr.street || "Direct Client Site Delivery";
            const apartment = addr.apartment ? `, ${addr.apartment}` : "";
            const city = addr.city || "Gurugram";
            const state = addr.state || "Haryana";
            const zip = addr.zipCode || "122015";

            const splitAddress = doc.splitTextToSize(street + apartment, 84);
            doc.text(splitAddress, 6, addressY);
            addressY += (splitAddress.length * 4);

            doc.text(`${city}, ${state} - ${zip}`, 6, addressY);
            addressY += 4;
            doc.text("Phone: +91 98765 43210 (Delivery Hotline)", 6, addressY);

            doc.line(4, addressY + 4, 96, addressY + 4);
            const line2Y = addressY + 4;

            // Order Metadata
            doc.setFont("Helvetica", "bold");
            doc.text(`ORDER REF: #${quote._id.slice(-6).toUpperCase()}`, 6, line2Y + 8);
            doc.setFont("Helvetica", "normal");
            doc.text(`DATE: ${new Date(quote.createdAt).toLocaleDateString()}`, 6, line2Y + 12);
            
            // Draw mock Barcode
            const barcodeY = line2Y + 16;
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(6);
            doc.text("* " + quote._id.slice(-8).toUpperCase() + " *", 50, barcodeY + 14, { align: "center" });
            
            for (let i = 10; i < 90; i += 2) {
                const weight = (i % 3 === 0) ? 1.2 : ((i % 5 === 0) ? 0.4 : 0.8);
                doc.setLineWidth(weight);
                doc.line(i, barcodeY, i, barcodeY + 10);
            }

            doc.line(4, barcodeY + 18, 96, barcodeY + 18);
            const line3Y = barcodeY + 18;

            // Footer Badge
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(8);
            doc.text("WHITE-LABELED DIRECT FULFILLMENT", 50, line3Y + 6, { align: "center" });
            doc.setFont("Helvetica", "normal");
            doc.setFontSize(7);
            doc.text("If undelivered, return to Sender address above.", 50, line3Y + 10, { align: "center" });

            doc.save(`Shipping_Label_Order_${quote._id.slice(-6).toUpperCase()}.pdf`);
        } catch (err) {
            console.error("Failed to generate PDF Label:", err);
            alert("Failed to generate Shipping Label PDF.");
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

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 font-black uppercase tracking-widest italic">Loading Orders...</div>;

    const completedQuotes = quotes.filter(q => {
        const s = getVendorQuoteStatus(q.status);
        return s === 'completed';
    });
    const totalPayoutRevenue = completedQuotes.reduce((sum, q) => sum + (q.vendorAmount || 0), 0);

    const activeQuotes = quotes.filter(q => {
        const s = getVendorQuoteStatus(q.status);
        return s === 'allotted' || s === 'in-progress';
    });
    const activeProjectsCount = activeQuotes.length;

    const paymentTerms = user?.vendorPaymentTerms || "Net 30 Days";

    return (
        <div className="min-h-screen bg-gray-50 text-gray-950 selection:bg-emerald-500/30 pb-32">
            <Navbar />
            <div className="max-w-[1400px] mx-auto px-6 py-32">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
                    <div>
                        <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4 italic">Manufacturing Portal</p>
                        <h1 className="text-6xl text-gray-950 font-black uppercase tracking-tighter italic">Allocated <br /> Projects</h1>
                    </div>
                    <button onClick={loadData} className="px-8 py-4 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-3 shadow-xs">
                        <RefreshCw className={refreshing ? 'animate-spin' : ''} size={16} /> Refresh Feed
                    </button>
                </div>

                {/* Dashboard Summary Cards Grid */}
                <div className="grid md:grid-cols-4 gap-8 mb-16">
                    <div className="bg-white border border-gray-200/80 rounded-[2.5rem] p-8 hover:shadow-lg hover:shadow-gray-200/40 transition-all relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Payout Revenue</p>
                                <p className="text-3xl font-black italic text-emerald-600">₹ {totalPayoutRevenue.toLocaleString("en-IN")}</p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                                <DollarSign size={18} />
                            </div>
                        </div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-4">For completed fulfillments</p>
                    </div>

                    <div className="bg-white border border-gray-200/80 rounded-[2.5rem] p-8 hover:shadow-lg hover:shadow-gray-200/40 transition-all relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Projects</p>
                                <p className="text-3xl font-black italic text-gray-955">{activeProjectsCount}</p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                                <Briefcase size={18} />
                            </div>
                        </div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-4">In Production / Allotted</p>
                    </div>

                    <div className="bg-white border border-gray-200/80 rounded-[2.5rem] p-8 hover:shadow-lg hover:shadow-gray-200/40 transition-all relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment Terms</p>
                                <p className="text-2xl font-black italic text-gray-955 uppercase tracking-tight">{paymentTerms}</p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                                <Calendar size={18} />
                            </div>
                        </div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-4">Per manufacturing agreement</p>
                    </div>

                    <div 
                        onClick={() => setIsCommissionModalOpen(true)}
                        className="bg-emerald-50/40 border border-emerald-100 hover:border-emerald-250 cursor-pointer rounded-[2.5rem] p-8 hover:shadow-lg hover:shadow-emerald-200/30 transition-all relative overflow-hidden flex flex-col justify-between min-h-[160px] group"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Partner Commission</p>
                                <p className="text-2xl font-black italic text-emerald-700 uppercase tracking-tight flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    View Schedule <ArrowUpRight size={18} />
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                                <Info size={18} />
                            </div>
                        </div>
                        <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mt-4">Tiers & platform rates</p>
                    </div>
                </div>

                <div className="grid gap-8">
                    {quotes.map((quote) => (
                        <div key={quote._id} className="bg-white border border-gray-200/80 rounded-[3rem] p-8 lg:p-12 hover:shadow-xl hover:shadow-gray-200/40 transition-all relative overflow-hidden">
                            <div className="grid lg:grid-cols-3 gap-12">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black italic">O</div>
                                        <div>
                                            <p className="text-sm font-black uppercase italic tracking-tight text-gray-950">Order #{quote._id.slice(-6).toUpperCase()}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Workflow: {getVendorQuoteStatus(quote.status)}</p>
                                        </div>
                                    </div>
                                    <div className={`inline-flex items-center px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] ${statusClass(getVendorQuoteStatus(quote.status))}`}>
                                        {getVendorQuoteStatus(quote.status)}
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Mail size={12} className="text-emerald-500" /> Support: support@boxfox.in</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Phone size={12} className="text-emerald-500" /> Helpline: +91 98765 43210</p>
                                    </div>
                                </div>

                                <div className="space-y-6 border-l border-gray-100 pl-12">
                                    <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic flex items-center gap-2"><Package size={14} /> Production Items</h4>
                                    <div className="space-y-4">
                                        {quote.items.map((item, i) => (
                                            <div key={i} className="bg-gray-50 p-4 rounded-2xl border border-gray-200/60">
                                                <p className="text-xs font-black uppercase italic text-gray-800">{item.productName}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 italic">Quantity: {item.quantity}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-8 border-l border-gray-100 pl-12 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Settlement Amount</label>
                                        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl">
                                            <p className="text-4xl font-black italic text-emerald-600 flex items-center gap-2">
                                                ₹ {quote.vendorAmount || 0}
                                            </p>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-2">Payout for this fulfillment</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            disabled={getVendorQuoteStatus(quote.status) !== 'allotted'}
                                            onClick={() => updateProjectStatus(quote._id, 'in-progress')}
                                            className="py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all disabled:opacity-30 disabled:hover:bg-gray-50 disabled:hover:border-gray-200"
                                        >
                                            Start Work
                                        </button>
                                        <button
                                            disabled={getVendorQuoteStatus(quote.status) !== 'in-progress'}
                                            onClick={() => updateProjectStatus(quote._id, 'completed')}
                                            className="py-3 rounded-2xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-30"
                                        >
                                            Mark Complete
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <button className="w-full py-4 bg-gray-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all">
                                            Download Specs
                                        </button>
                                        <button 
                                            onClick={() => generateShippingLabel(quote)}
                                            className="w-full py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                                        >
                                            Print Shipping Label
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {quotes.length === 0 && (
                        <div className="py-32 text-center opacity-40 text-sm font-black uppercase tracking-widest italic flex flex-col items-center gap-4 text-gray-400">
                            <Briefcase size={40} className="text-gray-300" />
                            No projects allocated yet
                        </div>
                    )}
                </div>
            </div>

            {/* COMMISSION BREAKDOWN MODAL */}
            <AnimatePresence>
                {isCommissionModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-md overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-2xl bg-white border border-gray-200 rounded-[3rem] p-8 lg:p-12 shadow-2xl relative"
                        >
                            {/* Close */}
                            <button 
                                onClick={() => setIsCommissionModalOpen(false)}
                                className="absolute top-8 right-8 p-3 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl transition-all"
                            >
                                <X size={18} className="text-gray-600" />
                            </button>

                            <div>
                                <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-1 italic">
                                    Procurement Rates
                                </p>
                                <h2 className="text-3xl font-black uppercase italic text-gray-955 border-b border-gray-200 pb-4 mb-6">
                                    Commission Breakdown
                                </h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-6 leading-relaxed">
                                    The platform fee is calculated dynamically based on the volume tier of the completed quotation. A lower commission rate is applied to larger volume production to support scaling margins.
                                </p>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-150">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Qty 1 - 9 Units (Tier 1)</span>
                                        <span className="text-sm font-black italic text-gray-950">20% Platform Fee</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-150">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Qty 10 - 49 Units (Tier 10)</span>
                                        <span className="text-sm font-black italic text-gray-950">15% Platform Fee</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-150">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Qty 50 - 499 Units (Tier 50)</span>
                                        <span className="text-sm font-black italic text-gray-950">10% Platform Fee</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-150">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Qty 500 - 999 Units (Tier 500)</span>
                                        <span className="text-sm font-black italic text-gray-950">7.5% Platform Fee</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-150">
                                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Qty 1000+ Units (Tier 1000)</span>
                                        <span className="text-sm font-black italic text-emerald-700">5.0% Platform Fee</span>
                                    </div>
                                </div>

                                <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl flex items-start gap-4">
                                    <ShieldCheck className="text-amber-600 shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-wider text-amber-700 mb-1">Contract Notice</h4>
                                        <p className="text-[9px] text-gray-500 uppercase leading-relaxed font-semibold">
                                            Custom wholesale orders and high-volume RFQs triggered via the "Request Custom Quote" mechanism may be subjected to negotiated terms. Reach out to procurement@boxfox.in for custom agreements.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-6 mt-8 flex justify-end">
                                <button
                                    onClick={() => setIsCommissionModalOpen(false)}
                                    className="px-8 py-4 bg-gray-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
