"use client";
import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Search, ChevronRight, CheckCircle2, User, Mail, Phone, Package, DollarSign, X } from "lucide-react";
import Navbar from "../../components/Navbar";

function getAdminQuoteStatus(status, assignedVendor) {
    if (status === 'cancelled') return 'cancelled';
    if (status === 'fulfilled' || status === 'completed') return 'fulfilled';
    if (status === 'assigned' || status === 'allotted' || status === 'in-progress' || assignedVendor) return 'assigned';
    return 'requested';
}

function statusClass(status) {
    switch (status) {
        case 'assigned': return 'bg-blue-50 text-blue-600 border-blue-100';
        case 'fulfilled': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
        default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
}

export default function AdminQuotesPage() {
    const [quotes, setQuotes] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [message, setMessage] = useState("");

    const loadData = useCallback(async () => {
        setRefreshing(true);
        try {
            const [qRes, vRes] = await Promise.all([
                fetch("/api/admin/quotes"),
                fetch("/api/admin/vendors")
            ]);
            const qData = await qRes.json();
            const vData = await vRes.json();
            setQuotes(qData.quotes || []);
            setVendors(vData.vendors?.filter(v => v.vendorStatus === 'approved') || []);
            setSelectedQuote((current) => {
                if (!current) return current;
                return qData.quotes.find(q => q._id === current._id) || current;
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const updateQuote = async (quoteId, updates) => {
        await fetch("/api/admin/quotes", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quoteId, ...updates })
        });
        loadData();
    };

    const finalizeQuote = async (quoteId) => {
        try {
            await fetch('/api/admin/quotes/finalize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quoteId })
            });
            loadData();
            alert('Quotation finalized and emailed to client');
        } catch (err) {
            console.error(err);
            alert('Failed to finalize quotation');
        }
    };

    const openWhatsApp = (rawNumber, text) => {
        if (!rawNumber) return;
        const digits = String(rawNumber).replace(/[^0-9]/g, '');
        const url = `https://wa.me/${digits}?text=${encodeURIComponent(text || '')}`;
        window.open(url, '_blank');
    };

    const sendMessage = async () => {
        if (!message.trim() || !selectedQuote) return;
        await fetch("/api/quotes/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quoteId: selectedQuote._id, text: message })
        });
        setMessage("");
        loadData();
    };

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-emerald-500 font-black uppercase tracking-[0.3em]"><RefreshCw className="animate-spin mr-3" /> Syncing Quotations...</div>;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-950 selection:bg-emerald-500/30 relative">
            <Navbar />
            
            {/* Chat Modal */}
            <AnimatePresence>
                {chatOpen && selectedQuote && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-200 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-white border border-gray-100 w-full max-w-2xl h-[90vh] md:h-[80vh] rounded-3xl md:rounded-[3rem] overflow-hidden flex flex-col shadow-2xl shadow-gray-900/20"
                        >
                            <div className="p-6 md:p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                <div>
                                    <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em]">Direct Communication Session</p>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-950">Chat with {selectedQuote.user.name}</h3>
                                </div>
                                <button onClick={() => setChatOpen(false)} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-gray-950 hover:bg-gray-50 border border-gray-100 shadow-sm transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar bg-white">
                                {selectedQuote.messages?.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] md:max-w-[80%] p-5 md:p-6 rounded-2xl md:rounded-[2rem] ${msg.sender === 'admin' ? 'bg-emerald-500 text-white rounded-tr-none shadow-md shadow-emerald-500/20' : 'bg-gray-50 text-gray-700 rounded-tl-none border border-gray-100 shadow-sm'}`}>
                                            <p className="text-sm font-bold leading-relaxed">{msg.text}</p>
                                            <p className={`text-[8px] font-black uppercase tracking-[0.2em] mt-2 ${msg.sender === 'admin' ? 'text-emerald-100' : 'text-gray-400'}`}>{msg.sender} • {new Date(msg.createdAt).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {(!selectedQuote.messages || selectedQuote.messages.length === 0) && (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-20 text-gray-300">
                                        <Mail size={40} className="mb-4 text-gray-200" />
                                        <p className="text-sm font-black uppercase tracking-[0.2em]">No messages yet. Start the conversation.</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 md:p-8 border-t border-gray-50 flex gap-3 md:gap-4 bg-white">
                                <input 
                                    type="text" 
                                    placeholder="Type your message..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl md:rounded-[1.5rem] px-4 md:px-6 py-3 md:py-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white text-sm font-bold text-gray-950 transition-all shadow-inner"
                                />
                                <button onClick={sendMessage} className="px-6 md:px-8 bg-emerald-500 text-white rounded-2xl md:rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-400 hover:-translate-y-0.5 shadow-lg shadow-emerald-500/30 transition-all shrink-0">
                                    Send
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 lg:py-20">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6 lg:mb-12 bg-white p-6 md:p-8 lg:p-10 rounded-3xl lg:rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/20">
                    <div>
                        <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" /> Quotation Desk
                        </p>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl text-gray-950 font-black uppercase tracking-tighter leading-none">Gifting Quotes</h1>
                    </div>
                    <button onClick={loadData} className="px-8 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-gray-950 hover:bg-gray-100 hover:shadow-sm transition-all flex items-center gap-3">
                        <RefreshCw className={refreshing ? 'animate-spin' : ''} size={16} /> Refresh Feed
                    </button>
                </div>

                <div className="grid gap-6 md:gap-8">
                    {quotes.map((quote) => (
                        <div key={quote._id} className="bg-white border border-gray-100 rounded-3xl lg:rounded-[3rem] p-6 lg:p-12 hover:border-emerald-200 hover:shadow-2xl hover:shadow-gray-200/40 transition-all duration-300 relative overflow-hidden group">
                            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 relative z-10">
                                <div className="space-y-6 min-w-0">
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="w-14 h-14 rounded-[1.2rem] bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-950 text-xl font-black shadow-inner shrink-0">
                                            {quote.user?.name ? quote.user.name.charAt(0) : 'U'}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-lg font-black uppercase tracking-tight text-gray-950 break-all">{quote.user?.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] truncate">{quote.user?.company || 'Personal'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 w-full flex flex-col">
                                        <div className="inline-flex items-center gap-2 bg-gray-50 max-w-full px-3 py-1.5 rounded-lg border border-gray-100">
                                            <Mail size={12} className="text-emerald-500 shrink-0" />
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] truncate">{quote.user?.email}</span>
                                        </div>
                                        <div className="inline-flex items-center gap-2 bg-gray-50 max-w-full px-3 py-1.5 rounded-lg border border-gray-100">
                                            <Phone size={12} className="text-emerald-500 shrink-0" />
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] truncate">{quote.user?.phone}</span>
                                        </div>
                                    </div>
                                    <div className={`inline-flex items-center px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${statusClass(getAdminQuoteStatus(quote.status, quote.assignedVendor))}`}>
                                        {getAdminQuoteStatus(quote.status, quote.assignedVendor)}
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <button 
                                            onClick={() => { setSelectedQuote(quote); setChatOpen(true); }}
                                            className="w-full py-3.5 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-400 hover:scale-[1.02] shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Mail size={14} /> Open User Chat {quote.messages?.length > 0 && `(${quote.messages.length})`}
                                        </button>
                                        <button
                                            onClick={() => openWhatsApp(quote.user?.whatsapp || quote.user?.phone, `Hello ${quote.user?.name || ''}, regarding your BoxFox gift request (Ref: ${quote._id.slice(-6)}).`)}
                                            className="w-full py-3.5 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Phone size={14} /> Contact via WhatsApp
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-6 border-t lg:border-t-0 pt-8 lg:pt-0 lg:border-l lg:border-gray-100 lg:pl-12 min-w-0">
                                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-2"><Package size={14} /> Requested Items</h4>
                                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                        {quote.items.map((item, i) => (
                                            <div key={i} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-sm group-hover:bg-white group-hover:border-emerald-100 transition-colors">
                                                <p className="text-sm font-black uppercase text-gray-950 tracking-tight leading-tight break-words">{item.productName}</p>
                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-2 bg-emerald-50 px-2 py-1 rounded-md w-fit">QTY: {item.quantity}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-8 border-t lg:border-t-0 pt-8 lg:pt-0 lg:border-l lg:border-gray-100 lg:pl-12 flex flex-col justify-between min-w-0">
                                    <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Assign Manufacturing Partner</label>
                                            {quote.assignedVendor && typeof quote.assignedVendor === 'object' && (
                                                <div className="mb-4 p-5 bg-gray-50 rounded-2xl md:rounded-[1.5rem] border border-gray-100 shadow-inner max-w-full overflow-hidden">
                                                    <p className="text-sm font-black text-gray-950 flex flex-wrap gap-2 items-center">{quote.assignedVendor.name} <span className="text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-100">({quote.assignedVendor.vendorCategory || 'Vendor'})</span></p>
                                                            <div className="flex items-center gap-2 mt-3 max-w-full"><Mail size={12} className="text-emerald-500 shrink-0"/> <span className="text-[10px] font-black text-gray-500 uppercase tracking-tight truncate">{quote.assignedVendor.email}</span></div>
                                                            <div className="flex items-center gap-2 mt-1 max-w-full"><Phone size={12} className="text-emerald-500 shrink-0"/> <span className="text-[10px] font-black text-gray-500 uppercase tracking-tight truncate">{quote.assignedVendor.phone}</span></div>
                                                            <div className="mt-4">
                                                                <button onClick={() => openWhatsApp(quote.assignedVendor?.phone, `Hello ${quote.assignedVendor?.name || ''}, a new gift request (Ref: ${quote._id.slice(-6)}) has been assigned to you. Please respond to confirm.`)} className="w-full py-3 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-sm transition-all flex items-center justify-center gap-2">
                                                                    <Phone size={12} /> Contact Vendor
                                                                </button>
                                                            </div>
                                                </div>
                                            )}
                                            <select 
                                            className="w-full px-4 md:px-6 py-3 md:py-4 bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl text-xs font-black outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 appearance-none shadow-inner cursor-pointer"
                                            value={quote.assignedVendor || ""}
                                            onChange={(e) => updateQuote(quote._id, { assignedVendor: e.target.value, status: 'allotted' })}
                                        >
                                            <option value="">Select Partner</option>
                                            {vendors.map(v => (
                                                <option key={v._id} value={v._id}>{v.name} ({v.vendorCategory})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Workflow Status</label>
                                        <select
                                            className="w-full px-4 md:px-6 py-3 md:py-4 bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl text-xs font-black outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 appearance-none shadow-inner cursor-pointer"
                                            value={quote.status}
                                            onChange={(e) => updateQuote(quote._id, { status: e.target.value })}
                                        >
                                            <option value="requested">Requested</option>
                                            <option value="assigned">Assigned</option>
                                            <option value="fulfilled">Fulfilled</option>
                                            <option value="allotted">Allotted</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">User Amount</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-4 md:left-6 flex items-center text-emerald-500 font-black">₹</div>
                                                <input
                                                    type="number"
                                                    className="w-full pl-8 md:pl-10 pr-4 md:pr-6 py-3 md:py-4 bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl text-base md:text-lg font-black outline-none focus:bg-white focus:border-emerald-500 shadow-inner"
                                                    defaultValue={quote.totalAmount}
                                                    onBlur={(e) => updateQuote(quote._id, { amount: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Vendor Payout</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-4 md:left-6 flex items-center text-emerald-500 font-black">₹</div>
                                                <input
                                                    type="number"
                                                    className="w-full pl-8 md:pl-10 pr-4 md:pr-6 py-3 md:py-4 bg-emerald-50 border border-emerald-100 rounded-xl md:rounded-2xl text-base md:text-lg font-black outline-none focus:bg-white focus:border-emerald-500 shadow-inner text-emerald-700"
                                                    defaultValue={quote.vendorAmount}
                                                    onBlur={(e) => updateQuote(quote._id, { vendorAmount: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {Number(quote.vendorAmount || 0) > Number(quote.totalAmount || 0) && (
                                        <div className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-sm">
                                            <X size={14} /> Vendor payout exceeds client amount
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                        <button onClick={() => finalizeQuote(quote._id)} className="flex-1 py-4 bg-gray-950 text-white rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 hover:scale-[1.02] shadow-lg shadow-gray-900/20 transition-all duration-300">Finalize & Email</button>
                                        <button onClick={() => { setSelectedQuote(quote); setChatOpen(true); }} className="py-4 px-6 bg-white border border-gray-200 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-700 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 shadow-sm transition-all duration-300 shrink-0 text-center flex items-center justify-center">Open Chat</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {quotes.length === 0 && <div className="py-32 text-center text-gray-400 text-sm font-black uppercase tracking-[0.3em]">No Quotations Found</div>}
                </div>
            </div>
        </div>
    );
}
