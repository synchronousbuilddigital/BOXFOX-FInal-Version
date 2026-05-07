"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Sparkles, ShoppingBag, Truck } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AIChatBot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Good day! I'm Foxie 🦊, your structural packaging concierge. I'm here to ensure your brand's boxes are absolutely perfect. How can I assist you today?` }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (user?.name && messages.length === 1 && messages[0].role === 'assistant') {
       setMessages([{ 
         role: "assistant", 
         content: `Exciting to see you again, ${user.name}! 🦊 I've got your latest designs and order status ready. How can I help your brand today?` 
       }]);
    }
  }, [user]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: input,
          history: messages,
          userId: user?.id 
        }),
      });

      const data = await response.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please check your internet." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-[80px] right-4 sm:bottom-[124px] sm:right-6 z-[9998] flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gray-950 text-white shadow-2xl hover:bg-emerald-600 transition-all duration-300"
        style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.2)" }}
      >
        {isOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <MessageSquare size={20} className="sm:w-6 sm:h-6" />}
        {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
            </span>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-[144px] right-4 left-4 sm:left-auto sm:right-6 sm:bottom-[200px] z-[9998] w-auto sm:w-[400px] h-[500px] sm:h-[600px] max-h-[75vh] flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100"
          >
            {/* Header */}
            <div className="bg-gray-950 p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  <Bot size={18} className="sm:w-[22px] sm:h-[22px]" />
                </div>
                <div>
                    <h3 className="text-white text-xs font-black uppercase tracking-tight leading-none">Foxie · Concierge</h3>
                    <p className="text-emerald-400 text-[8px] uppercase tracking-widest mt-1 font-black">Structural Packaging Expert</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 scrollbar-hide space-y-4 bg-gray-50/50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[90%] rounded-2xl p-4 text-xs font-medium leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-emerald-600 text-white rounded-tr-none shadow-lg shadow-emerald-500/10" 
                      : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none pr-6"
                  }`}>
                    <div className={`markdown-content prose prose-sm max-w-none text-[10px] sm:text-[11px] ${msg.role === "user" ? "prose-invert" : ""}`}>
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({node, ...props}) => <div className="overflow-x-auto my-3"><table className="w-full border-collapse border border-gray-200 text-[9px] sm:text-[10px]" {...props} /></div>,
                          th: ({node, ...props}) => <th className="border border-gray-200 px-2 py-1.5 bg-gray-50 text-left font-black uppercase tracking-widest text-[8px]" {...props} />,
                          td: ({node, ...props}) => <td className="border border-gray-200 px-2 py-1.5" {...props} />,
                          strong: ({node, ...props}) => <strong className={`font-black ${msg.role === "user" ? "text-white" : "text-gray-950"}`} {...props} />,
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2 space-y-1" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2 space-y-1" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-xs font-black mb-2 uppercase tracking-tighter mt-4" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-[10px] font-black mb-1 uppercase tracking-widest text-emerald-600 mt-2" {...props} />,
                          hr: ({node, ...props}) => <hr className="my-4 border-gray-100" {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-emerald-500/50 pl-3 py-1 italic bg-emerald-50 my-2 text-emerald-800" {...props} />
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length === 1 && (
                <div className="px-5 pb-2 flex flex-wrap gap-2">
                    {[
                        { text: "Track Order", icon: Truck },
                        { text: "Best Sellers", icon: Sparkles },
                        { text: "Design Help", icon: ShoppingBag }
                    ].map((item, i) => (
                        <button 
                            key={i}
                            onClick={() => { setInput(item.text); handleSend(); }}
                            className="bg-white border border-gray-100 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-all flex items-center gap-1.5"
                        >
                            <item.icon size={11} />
                            {item.text}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-1 border border-transparent focus-within:border-emerald-500/20 focus-within:bg-white transition-all">
                <input
                  type="text"
                  placeholder="Type your question..."
                  className="bg-transparent flex-1 py-3 text-[11px] font-bold text-gray-950 outline-none placeholder:text-gray-300 uppercase tracking-widest"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button 
                    disabled={!input.trim() || isTyping}
                    className="p-2 text-emerald-500 disabled:text-gray-300 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-center text-[8px] font-black text-gray-300 uppercase tracking-widest mt-2">BoxFox Private AI • End-to-end encrypted</p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
