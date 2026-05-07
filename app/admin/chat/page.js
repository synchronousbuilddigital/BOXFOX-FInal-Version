"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, MessageSquare, Search, RefreshCw, ChevronRight } from "lucide-react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";

export default function AdminChatPage() {
    const { user, loading: authLoading } = useAuth();
    const [partners, setPartners] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef();

    const loadPartners = async () => {
        try {
            const res = await fetch("/api/chat");
            const data = await res.json();
            setPartners(data.partners || []);
        } catch (err) { console.error(err); }
    };

    const loadMessages = async (partnerId) => {
        try {
            const res = await fetch(`/api/chat?partnerId=${partnerId}`);
            const data = await res.json();
            setMessages(mData.messages || []);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (user && user.role === 'admin') loadPartners();
    }, [user]);

    useEffect(() => {
        if (selectedPartner) {
            const fetchMessages = async () => {
                const res = await fetch(`/api/chat?partnerId=${selectedPartner._id}`);
                const data = await res.json();
                setMessages(data.messages || []);
            };
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [selectedPartner]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedPartner) return;

        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ receiverId: selectedPartner._id, message: newMessage })
        });
        if (res.ok) {
            const data = await res.json();
            setMessages([...messages, data.message]);
            setNewMessage("");
        }
    };

    if (authLoading) return <div className="min-h-screen bg-[#080d14] flex items-center justify-center text-white/30 font-black uppercase tracking-widest italic">Syncing Admin Desk...</div>;

    return (
        <div className="min-h-screen bg-[#080d14] text-white selection:bg-emerald-500/30">
            <Navbar />
            <main className="max-w-[1600px] mx-auto px-6 py-32 flex gap-8 h-[calc(100vh-50px)]">
                
                {/* Sidebar - Partners List */}
                <aside className="w-96 bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-white/5 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black uppercase tracking-tight italic">Messages</h2>
                            <button onClick={loadPartners} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><RefreshCw size={16} /></button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                            <input type="text" placeholder="Search chats..." className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-xs font-bold outline-none focus:border-emerald-500" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {partners.map((partner) => (
                            <button 
                                key={partner._id} 
                                onClick={() => setSelectedPartner(partner)}
                                className={`w-full p-6 flex items-center gap-4 transition-all border-b border-white/[0.03] ${selectedPartner?._id === partner._id ? 'bg-emerald-500 text-white' : 'hover:bg-white/5'}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic shadow-lg ${selectedPartner?._id === partner._id ? 'bg-white text-emerald-500' : 'bg-white/5 text-white/40'}`}>
                                    {partner.name?.charAt(0)}
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-black uppercase italic tracking-tight">{partner.name}</p>
                                    <p className={`text-[10px] font-bold truncate uppercase tracking-widest ${selectedPartner?._id === partner._id ? 'text-white/70' : 'text-white/30'}`}>{partner.lastMessage}</p>
                                </div>
                                {selectedPartner?._id === partner._id && <ChevronRight size={14} />}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Chat Area */}
                <section className="flex-1 bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden flex flex-col relative">
                    {selectedPartner ? (
                        <>
                            <header className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black italic">
                                        {selectedPartner.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black uppercase italic tracking-tight">{selectedPartner.name}</p>
                                        <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-[0.2em]">{selectedPartner.email}</p>
                                    </div>
                                </div>
                            </header>

                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar relative">
                                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "30px 30px" }} />
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.sender === user._id ? 'justify-end' : 'justify-start'} relative z-10`}>
                                        <div className={`max-w-[70%] p-6 rounded-[2rem] shadow-2xl flex flex-col gap-2 ${msg.sender === user._id ? 'bg-emerald-500 text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none border border-white/10'}`}>
                                            <p className="text-sm font-medium leading-relaxed italic">{msg.message}</p>
                                            <p className="text-[8px] font-black uppercase tracking-widest opacity-40">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleSend} className="p-8 bg-black/20 border-t border-white/5 flex gap-4">
                                <input 
                                    type="text" 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Reply to user..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-emerald-500 transition-all"
                                />
                                <button type="submit" className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-90">
                                    <Send size={20} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center space-y-6">
                            <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center">
                                <MessageSquare size={48} />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter italic">Select a Conversation</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] max-w-xs">Resolve user inquiries and manage brand communications in real-time.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
