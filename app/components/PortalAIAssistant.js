"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot, X, Send, Minimize2, Maximize2, Loader2,
    AlertTriangle, RefreshCw, Sparkles
} from 'lucide-react';

// Simple markdown-lite renderer (bold, bullet points, headers)
function RenderMessage({ text }) {
    const lines = text.split('\n');
    return (
        <div className="space-y-1 text-sm leading-relaxed">
            {lines.map((line, i) => {
                if (!line.trim()) return <div key={i} className="h-2" />;
                if (line.startsWith('### ')) return (
                    <p key={i} className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mt-3 mb-1">
                        {line.replace('### ', '')}
                    </p>
                );
                if (line.startsWith('## ')) return (
                    <p key={i} className="text-xs font-black uppercase tracking-wider text-emerald-300 mt-4 mb-1">
                        {line.replace('## ', '')}
                    </p>
                );
                if (line.startsWith('- ') || line.startsWith('• ')) return (
                    <div key={i} className="flex gap-2 items-start">
                        <span className="text-emerald-500 mt-1 shrink-0">•</span>
                        <span>{renderInline(line.replace(/^[-•] /, ''))}</span>
                    </div>
                );
                return <p key={i}>{renderInline(line)}</p>;
            })}
        </div>
    );
}

function renderInline(text) {
    // Bold: **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-black text-white">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
    });
}

const SUGGESTED_PROMPTS = [
    "Show me pending quotes",
    "Which partners are approved?",
    "Any anomalies in payouts?",
    "What's the SLA for quote responses?",
    "How do I assign a partner to a quote?",
];

export default function PortalAIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hello! I'm your **BoxFox Portal AI**. I can help you manage quotes, assign partners, track orders, and flag anomalies. What do you need?"
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const sendMessage = async (text) => {
        const userText = text || input.trim();
        if (!userText || loading) return;

        const newMessages = [...messages, { role: 'user', content: userText }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const history = newMessages.slice(0, -1).map(m => ({
                role: m.role,
                content: m.content
            }));

            const res = await fetch('/api/portal-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText, history })
            });

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'No response.' }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '⚠️ Connection error. Please check your network and try again.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const panelWidth = isExpanded ? 'w-[680px]' : 'w-[380px]';
    const panelHeight = isExpanded ? 'h-[85vh]' : 'h-[520px]';

    return (
        <>
            {/* Floating trigger */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-[999] w-14 h-14 bg-emerald-500 text-white rounded-2xl shadow-2xl shadow-emerald-500/30 flex items-center justify-center hover:bg-emerald-600 transition-colors group"
                        title="Open Portal AI"
                    >
                        <Bot size={24} className="group-hover:scale-110 transition-transform" />
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white rounded-full border-2 border-emerald-500 animate-pulse" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className={`fixed bottom-6 right-6 z-[999] ${panelWidth} ${panelHeight} bg-[#0c121d] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-black/50`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-black/20">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                                    <Bot size={16} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-white uppercase tracking-wider">Portal AI</p>
                                    <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" />
                                        Online
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="p-1.5 text-white/30 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                                    title={isExpanded ? 'Minimize' : 'Expand'}
                                >
                                    {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                                </button>
                                <button
                                    onClick={() => setMessages([{
                                        role: 'assistant',
                                        content: "Hello! I'm your **BoxFox Portal AI**. I can help you manage quotes, assign partners, track orders, and flag anomalies. What do you need?"
                                    }])}
                                    className="p-1.5 text-white/30 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                                    title="Clear chat"
                                >
                                    <RefreshCw size={14} />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 text-white/30 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1f2d1f transparent' }}>
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                            <Sparkles size={12} className="text-emerald-400" />
                                        </div>
                                    )}
                                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${msg.role === 'user'
                                        ? 'bg-emerald-500 text-white rounded-tr-sm'
                                        : 'bg-white/5 border border-white/5 text-white/80 rounded-tl-sm'
                                        }`}
                                    >
                                        {msg.role === 'assistant'
                                            ? <RenderMessage text={msg.content} />
                                            : <p className="text-sm font-medium">{msg.content}</p>
                                        }
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex gap-3 justify-start">
                                    <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                                        <Loader2 size={12} className="text-emerald-400 animate-spin" />
                                    </div>
                                    <div className="px-4 py-3 bg-white/5 border border-white/5 rounded-2xl rounded-tl-sm">
                                        <div className="flex gap-1 items-center h-5">
                                            {[0, 1, 2].map(i => (
                                                <div key={i}
                                                    className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"
                                                    style={{ animationDelay: `${i * 0.15}s` }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggested prompts — only show when few messages */}
                        {messages.length <= 2 && (
                            <div className="px-4 pb-2 flex flex-wrap gap-2">
                                {SUGGESTED_PROMPTS.map((p, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(p)}
                                        className="text-[9px] font-black uppercase tracking-wider px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white/50 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-4 border-t border-white/5 flex gap-3 items-end">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                                placeholder="Ask about quotes, partners, orders..."
                                rows={1}
                                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 resize-none font-medium placeholder-white/20 transition-colors"
                                style={{ minHeight: '44px', maxHeight: '120px' }}
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={!input.trim() || loading}
                                className="w-11 h-11 bg-emerald-500 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
