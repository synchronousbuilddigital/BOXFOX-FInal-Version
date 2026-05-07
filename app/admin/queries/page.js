"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail, Phone, MapPin,
    Trash2, CheckCircle2, Clock, Inbox, Loader2,
    MessageSquare, Briefcase
} from "lucide-react";

export default function GeneralQueriesAdmin() {
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchQueries();
    }, []);

    const fetchQueries = async () => {
        try {
            const res = await fetch('/api/admin/queries');
            const data = await res.json();
            setQueries(data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load queries");
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            const res = await fetch('/api/admin/queries', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            if (res.ok) {
                const updated = await res.json();
                setQueries(prev => prev.map(q => q._id === id ? updated : q));
                setSelectedQuery(updated);
            }
        } catch (err) {
            console.error("Status update error", err);
        }
    };

    const deleteQuery = async (id) => {
        if (!confirm("Are you sure you want to delete this query?")) return;
        try {
            const res = await fetch(`/api/admin/queries?id=${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setQueries(prev => prev.filter(q => q._id !== id));
                setSelectedQuery(null);
            }
        } catch (err) {
            console.error("Delete error", err);
        }
    };

    const filteredQueries = queries.filter(q => {
        if (filter === 'all') return true;
        return q.type === filter;
    });

    return (
        <div className="p-6 md:p-10 space-y-10">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                        General <span className="text-gray-400">Query Results</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mt-1">Live Feed Synchronization</p>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-2xl border border-gray-100 self-start md:self-center">
                    {['all', 'contact'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* List View */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="flex items-center justify-between mb-2 px-4">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Incoming Feed</h2>
                        <span className="bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-full">{filteredQueries.length} ITEMS</span>
                    </div>

                    {loading ? (
                        <div className="p-20 flex justify-center bg-white rounded-[2rem] border border-gray-100"><Loader2 className="animate-spin text-emerald-500" /></div>
                    ) : (
                        <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredQueries.map((query) => (
                                <motion.div
                                    key={query._id}
                                    onClick={() => setSelectedQuery(query)}
                                    layoutId={query._id}
                                    className={`p-6 rounded-[2rem] border transition-all cursor-pointer group ${selectedQuery?._id === query._id
                                        ? 'bg-white border-emerald-500 shadow-xl ring-4 ring-emerald-500/5'
                                        : 'bg-white/70 border-gray-100 hover:border-emerald-500/30'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${query.type === 'partnership' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'}`}>
                                            {query.type === 'partnership' ? <Briefcase size={20} /> : <MessageSquare size={20} />}
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${query.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                            query.status === 'reviewed' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                                            }`}>
                                            {query.status}
                                        </span>
                                    </div>
                                    <h3 className="font-black text-gray-950 uppercase tracking-tight truncate mb-1">{query.name}</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 truncate">{query.email}</p>
                                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                                        <span>{new Date(query.createdAt).toLocaleDateString()}</span>
                                        <span className={`uppercase font-black ${query.type === 'partnership' ? 'text-emerald-600' : 'text-blue-600'}`}>{query.type}</span>
                                    </div>
                                </motion.div>
                            ))}
                            {filteredQueries.length === 0 && (
                                <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200 text-gray-400 uppercase text-[10px] font-black italic tracking-widest">
                                    No transmissions found.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Detail View */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        {selectedQuery ? (
                            <motion.div
                                key={selectedQuery._id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col"
                            >
                                {/* Detail Header */}
                                <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-gray-950 rounded-[1.2rem] flex items-center justify-center text-white text-xl font-black shadow-lg shadow-gray-950/20">
                                            {selectedQuery.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-950">{selectedQuery.name}</h2>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                    <Clock size={10} /> {new Date(selectedQuery.createdAt).toLocaleString()}
                                                </span>
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${selectedQuery.type === 'partnership' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {selectedQuery.type}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateStatus(selectedQuery._id, 'reviewed')}
                                            className="px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm"
                                        >
                                            Mark Reviewed
                                        </button>
                                        <button
                                            onClick={() => updateStatus(selectedQuery._id, 'completed')}
                                            className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                                        >
                                            Resolved
                                        </button>
                                        <div className="w-px h-8 bg-gray-200 mx-2" />
                                        <button
                                            onClick={() => deleteQuery(selectedQuery._id)}
                                            className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Body Content */}
                                <div className="p-8 md:p-10 overflow-y-auto flex-1 bg-white">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-8">
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-6 flex items-center gap-3">
                                                    <div className="w-6 h-px bg-emerald-200" /> Channel Details
                                                </h4>
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-950 border border-gray-100"><Mail size={18} /></div>
                                                        <div>
                                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Email</p>
                                                            <p className="font-bold text-gray-950 text-sm break-all">{selectedQuery.email}</p>
                                                        </div>
                                                    </div>
                                                    {selectedQuery.contactNumber && (
                                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-950 border border-gray-100"><Phone size={18} /></div>
                                                            <div>
                                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Phone</p>
                                                                <p className="font-bold text-gray-950 text-sm">{selectedQuery.contactNumber}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedQuery.location && (
                                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-950 border border-gray-100"><MapPin size={18} /></div>
                                                            <div>
                                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Location</p>
                                                                <p className="font-bold text-gray-950 text-sm uppercase">{selectedQuery.location}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {selectedQuery.subject && (
                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-6 flex items-center gap-3">
                                                        <div className="w-6 h-px bg-emerald-200" /> Subject
                                                    </h4>
                                                    <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                                        <p className="font-black text-gray-950 uppercase tracking-tight text-sm leading-relaxed">{selectedQuery.subject}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-8">
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-6 flex items-center gap-3">
                                                    <div className="w-6 h-px bg-emerald-200" /> Message Body
                                                </h4>
                                                <div className="bg-white border border-gray-100 p-8 rounded-[2rem] min-h-[300px] shadow-sm italic leading-relaxed text-gray-600 text-sm whitespace-pre-wrap">
                                                    {selectedQuery.message}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-white rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center p-20 min-h-[600px] shadow-sm">
                                <div className="w-20 h-20 bg-gray-50 rounded-[1.5rem] flex items-center justify-center text-gray-200 mb-6 border border-gray-100">
                                    <Inbox size={32} />
                                </div>
                                <h2 className="text-xl font-black uppercase tracking-tighter text-gray-400">Select Item</h2>
                                <p className="text-gray-400 text-xs font-medium max-w-[200px] mt-2 uppercase tracking-widest leading-loose">Choose a query from the feed to view full details.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
