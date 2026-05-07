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
        case 'assigned': return 'bg-blue-500/15 text-blue-300 border-blue-500/20';
        case 'fulfilled': return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20';
        case 'cancelled': return 'bg-red-500/15 text-red-300 border-red-500/20';
        default: return 'bg-amber-500/15 text-amber-300 border-amber-500/20';
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

    if (loading) return <div className="min-h-screen bg-[#080d14] flex items-center justify-center text-white/30 font-black uppercase tracking-widest italic">Syncing Quotations...</div>;

    return (
        <div className="min-h-screen bg-[#080d14] text-white selection:bg-emerald-500/30 relative">
            <Navbar />
            
            {/* Chat Modal */}
            <AnimatePresence>
                {chatOpen && selectedQuote && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-200 bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#0c121d] border border-white/10 w-full max-w-2xl h-[80vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl"
                        >
                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                <div>
                                    <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest italic">Direct Communication Session</p>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter italic">Chat with {selectedQuote.user.name}</h3>
                                </div>
                                <button onClick={() => setChatOpen(false)} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                                {selectedQuote.messages?.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-6 rounded-4xl ${msg.sender === 'admin' ? 'bg-emerald-500 text-white rounded-tr-none' : 'bg-white/5 text-white/80 rounded-tl-none border border-white/5'}`}>
                                            <p className="text-sm font-bold leading-relaxed">{msg.text}</p>
                                            <p className={`text-[8px] font-black uppercase tracking-widest mt-2 opacity-50`}>{msg.sender} • {new Date(msg.createdAt).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {(!selectedQuote.messages || selectedQuote.messages.length === 0) && (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                                        <Mail size={40} className="mb-4" />
                                        <p className="text-sm font-black uppercase tracking-widest italic">No messages yet. Start the conversation.</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 border-t border-white/5 flex gap-4">
                                <input 
                                    type="text" 
                                    placeholder="Type your message..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-emerald-500 text-sm font-bold"
                                />
                                <button onClick={sendMessage} className="px-8 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all">
                                    Send
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-350 mx-auto px-6 py-32">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
                    <div>
                        <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 italic">Quotation Desk</p>
                        <h1 className="text-6xl text-white font-black uppercase tracking-tighter italic">Gifting Quotes</h1>
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
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black italic">U</div>
                                        <div>
                                            <p className="text-sm font-black uppercase italic tracking-tight">{quote.user?.name}</p>
                                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{quote.user?.company || 'Personal'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                            <p className="text-[10px] font-black text-white/70 uppercase tracking-widest flex items-center gap-2"><Mail size={12} /> {quote.user?.email}</p>
                                        <p className="text-[10px] font-black text-white/70 uppercase tracking-widest flex items-center gap-2"><Phone size={12} /> {quote.user?.phone}</p>
                                    </div>
                                    <div className={`inline-flex items-center px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] ${statusClass(getAdminQuoteStatus(quote.status, quote.assignedVendor))}`}>
                                        {getAdminQuoteStatus(quote.status, quote.assignedVendor)}
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <button 
                                            onClick={() => { setSelectedQuote(quote); setChatOpen(true); }}
                                            className="w-full py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Mail size={14} /> Open User Chat {quote.messages?.length > 0 && `(${quote.messages.length})`}
                                        </button>
                                        <button
                                            onClick={() => openWhatsApp(quote.user?.whatsapp || quote.user?.phone, `Hello ${quote.user?.name || ''}, regarding your BoxFox gift request (Ref: ${quote._id.slice(-6)}).`)}
                                            className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Phone size={14} /> Contact via WhatsApp
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-6 border-l border-white/5 pl-12">
                                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic flex items-center gap-2"><Package size={14} /> Requested Items</h4>
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
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block">Assign Manufacturing Partner</label>
                                            {quote.assignedVendor && typeof quote.assignedVendor === 'object' && (
                                                <div className="mb-4 p-4 bg-white/3 rounded-2xl border border-white/5">
                                                    <p className="text-sm font-black">{quote.assignedVendor.name} <span className="text-[10px] text-white/40">({quote.assignedVendor.vendorCategory || 'Vendor'})</span></p>
                                                            <p className="text-[10px] font-bold text-white/30 flex items-center gap-2 mt-2"><Mail size={12} /> {quote.assignedVendor.email}</p>
                                                            <p className="text-[10px] font-bold text-white/30 flex items-center gap-2"><Phone size={12} /> {quote.assignedVendor.phone}</p>
                                                            <div className="mt-3">
                                                                <button onClick={() => openWhatsApp(quote.assignedVendor?.phone, `Hello ${quote.assignedVendor?.name || ''}, a new gift request (Ref: ${quote._id.slice(-6)}) has been assigned to you. Please respond to confirm.`)} className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                                                    <Phone size={12} /> Contact Vendor via WhatsApp
                                                                </button>
                                                            </div>
                                                    <p className="text-[10px] font-bold text-white/30 mt-2">Status: <span className="font-black">{quote.assignedVendor.vendorStatus}</span></p>
                                                </div>
                                            )}
                                            <select 
                                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black italic outline-none focus:border-emerald-500 appearance-none"
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
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block">Workflow Status</label>
                                        <select
                                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black italic outline-none focus:border-emerald-500 appearance-none"
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

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-white/70 uppercase tracking-widest block">User Amount</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-6 flex items-center text-emerald-500">₹</div>
                                                <input
                                                    type="number"
                                                    className="w-full pl-12 pr-6 py-4 bg-white/6 border border-white/10 rounded-2xl text-lg font-black italic outline-none focus:border-emerald-500"
                                                    defaultValue={quote.totalAmount}
                                                    onBlur={(e) => updateQuote(quote._id, { amount: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-white/70 uppercase tracking-widest block">Vendor Payout</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-6 flex items-center text-emerald-500">₹</div>
                                                <input
                                                    type="number"
                                                    className="w-full pl-12 pr-6 py-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-lg font-black italic outline-none focus:border-emerald-500"
                                                    defaultValue={quote.vendorAmount}
                                                    onBlur={(e) => updateQuote(quote._id, { vendorAmount: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {Number(quote.vendorAmount || 0) > Number(quote.totalAmount || 0) && (
                                        <div className="text-[10px] font-black uppercase tracking-widest text-red-300 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
                                            Vendor payout exceeds client amount
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-4">
                                        <button onClick={() => finalizeQuote(quote._id)} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-[12px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all">Finalize & Email</button>
                                        <button onClick={() => { setSelectedQuote(quote); setChatOpen(true); }} className="py-3 px-6 bg-white/5 border border-white/10 rounded-xl text-[12px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Open Chat</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {quotes.length === 0 && <div className="py-32 text-center opacity-20 text-sm font-black uppercase tracking-widest italic">No Quotations Found</div>}
                </div>
            </div>
        </div>
    );
}
