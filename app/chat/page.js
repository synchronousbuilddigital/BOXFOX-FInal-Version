"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Shield, RefreshCw } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function ChatPage() {
    const { user, loading: authLoading } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [adminId, setAdminId] = useState(null);
    const scrollRef = useRef();

    useEffect(() => {
        const fetchAdminAndMessages = async () => {
            try {
                // In a real app, you would fetch an admin user ID from a generic auth/staff route
                // For now, setting a fallback admin ID.
                const admin = { _id: '6432467714913650547' }; // Fallback
                setAdminId(admin._id);

                const mRes = await fetch(`/api/chat?partnerId=${admin._id}`);
                const mData = await mRes.json();
                setMessages(mData.messages || []);
            } catch (err) {
                console.error(err);
            }
        };
        if (user) fetchAdminAndMessages();
    }, [user]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !adminId) return;

        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ receiverId: adminId, message: newMessage })
        });
        if (res.ok) {
            const data = await res.json();
            setMessages([...messages, data.message]);
            setNewMessage("");
        }
    };

    if (authLoading) return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center font-black uppercase tracking-widest text-xs italic">Connecting to Support...</div>;

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-gray-950 selection:bg-emerald-500 selection:text-white font-sans">
            <Navbar />
            <main className="max-w-[1000px] mx-auto px-6 pt-32 pb-16 flex flex-col h-[calc(100vh-100px)]">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">Official Support</p>
                        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Concierge Chat</h1>
                    </div>
                    <div className="flex items-center gap-3 bg-white border border-gray-100 px-6 py-3 rounded-2xl shadow-sm">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Admin Online</span>
                    </div>
                </div>

                <div className="flex-1 bg-white border border-gray-100 rounded-[3rem] shadow-2xl shadow-gray-200/50 overflow-hidden flex flex-col relative">
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.3]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #E5E7EB 1px, transparent 0)", backgroundSize: "30px 30px" }} />
                    
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 relative z-10 custom-scrollbar">
                        {messages.map((msg, i) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                key={i} 
                                className={`flex ${msg.sender === user._id ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[70%] p-6 rounded-[2rem] shadow-sm flex flex-col gap-2 ${msg.sender === user._id ? 'bg-gray-950 text-white rounded-tr-none' : 'bg-gray-50 text-gray-950 rounded-tl-none border border-gray-100'}`}>
                                    <p className="text-sm font-medium leading-relaxed italic">{msg.message}</p>
                                    <p className="text-[8px] font-black uppercase tracking-widest opacity-40">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </motion.div>
                        ))}
                        {messages.length === 0 && <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-4">
                            <MessageSquare size={48} />
                            <p className="text-sm font-black uppercase tracking-widest italic">Start a conversation with our team</p>
                        </div>}
                    </div>

                    <form onSubmit={handleSend} className="p-8 bg-gray-50 border-t border-gray-100 relative z-10 flex gap-4">
                        <input 
                            type="text" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message here..."
                            className="flex-1 bg-white border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-emerald-500 transition-all shadow-sm"
                        />
                        <button type="submit" className="w-14 h-14 bg-gray-950 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-500 transition-all shadow-lg active:scale-90">
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
