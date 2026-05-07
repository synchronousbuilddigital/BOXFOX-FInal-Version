"use client";
import React, { useEffect, useState } from "react";
import { RefreshCw, CheckCircle2, XCircle, User as UserIcon, Mail, Phone, Briefcase } from "lucide-react";
import Navbar from "../../components/Navbar";

export default function AdminVendorsPage() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        setRefreshing(true);
        try {
            const res = await fetch("/api/admin/vendors");
            const data = await res.json();
            setVendors(data.vendors || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const updateVendor = async (vendorId, updates) => {
        await fetch("/api/admin/vendors", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vendorId, ...updates })
        });
        loadData();
    };

    if (loading) return <div className="min-h-screen bg-[#080d14] flex items-center justify-center text-white/30 font-black uppercase tracking-widest italic">Syncing Partners...</div>;

    return (
        <div className="min-h-screen bg-[#080d14] text-white selection:bg-emerald-500/30">
            <Navbar />
            <div className="max-w-350 mx-auto px-6 py-32">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
                    <div>
                        <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 italic">Manufacturing Partners</p>
                        <h1 className="text-6xl text-white font-black uppercase tracking-tighter italic">Vendor <br /> Directory</h1>
                    </div>
                    <button onClick={loadData} className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                        <RefreshCw className={refreshing ? 'animate-spin' : ''} size={16} /> Refresh Feed
                    </button>
                </div>

                <div className="grid gap-8">
                    {vendors.map((vendor) => (
                        <div key={vendor._id} className="bg-white/5 border border-white/10 rounded-[3rem] p-8 lg:p-12 hover:bg-white/[0.07] transition-all">
                            <div className="grid lg:grid-cols-3 gap-12">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black italic">V</div>
                                        <div>
                                            <p className="text-sm font-black uppercase italic tracking-tight">{vendor.name}</p>
                                            <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{vendor.businessName}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-white/70 uppercase tracking-widest flex items-center gap-2"><Mail size={12} /> {vendor.email}</p>
                                        <p className="text-[10px] font-black text-white/70 uppercase tracking-widest flex items-center gap-2"><Phone size={12} /> {vendor.phone}</p>
                                    </div>
                                </div>

                                <div className="space-y-6 border-l border-white/5 pl-12 flex flex-col justify-center">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block">Category / Classification</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-6 flex items-center text-emerald-500"><Briefcase size={16} /></div>
                                            <input
                                                type="text"
                                                placeholder="e.g. Printing, Logistics, Box Maker"
                                                className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black italic outline-none focus:border-emerald-500"
                                                defaultValue={vendor.vendorCategory || ""}
                                                onBlur={(e) => updateVendor(vendor._id, { vendorCategory: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 border-l border-white/5 pl-12 flex flex-col justify-center">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block">Status: {vendor.vendorStatus}</label>
                                        <div className="flex gap-4">
                                            {vendor.vendorStatus !== 'approved' && (
                                                <button
                                                    onClick={() => updateVendor(vendor._id, { vendorStatus: 'approved' })}
                                                    className="flex-1 py-4 bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle2 size={16} /> Approve
                                                </button>
                                            )}
                                            {vendor.vendorStatus !== 'rejected' && (
                                                <button
                                                    onClick={() => updateVendor(vendor._id, { vendorStatus: 'rejected' })}
                                                    className="flex-1 py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                                >
                                                    <XCircle size={16} /> Reject
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {vendors.length === 0 && <div className="py-32 text-center opacity-20 text-sm font-black uppercase tracking-widest italic">No Vendors Found</div>}
                </div>
            </div>
        </div>
    );
}
