"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, User, Mail, Lock, Phone, CheckCircle2, ChevronRight, Sparkles, RefreshCw } from "lucide-react";
import Navbar from "../../components/Navbar";

export default function VendorRegistration() {
    const [formData, setFormData] = useState({
        name: "", email: "", password: "", phone: "", businessName: "", vendorCategory: ""
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/vendor-signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) setSuccess(true);
            else setError(data.error);
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) return (
        <div className="min-h-screen bg-[#080d14] flex flex-col items-center justify-center p-6 text-center">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/5 border border-white/10 p-12 rounded-[3rem] max-w-xl">
                <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20 text-white">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-4xl font-black uppercase tracking-tighter italic text-white mb-4">Application Received</h2>
                <p className="text-white/50 font-bold leading-relaxed mb-8">Your partnership application for BoxFox Manufacturing is being reviewed. We will notify you via email once your account is activated.</p>
                <a href="/" className="px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all block">Return to Home</a>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#080d14] text-white selection:bg-emerald-500/30">
            <Navbar />
            <div className="max-w-[1400px] mx-auto px-6 py-32 grid lg:grid-cols-2 gap-20 items-center">
                <div>
                    <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 italic">B2B Partnerships</p>
                    <h1 className="text-7xl font-black uppercase tracking-tighter italic mb-8">Join the <br /> <span className="text-emerald-500">BoxFox</span> Network.</h1>
                    <div className="space-y-6">
                        {[
                            "Direct access to premium corporate gifting projects",
                            "Simplified order allotment & management system",
                            "Direct communication channel with project leads",
                            "Guaranteed settlement amounts & scheduled payouts"
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 text-white/40 font-black italic uppercase text-xs">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> {item}
                            </div>
                        ))}
                    </div>
                </div>

                <motion.div 
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    className="bg-white/5 border border-white/10 p-8 lg:p-12 rounded-[3rem] backdrop-blur-xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
                    
                    <h3 className="text-2xl font-black uppercase italic tracking-tight mb-8">Partner Application</h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Contact Name</label>
                                <div className="relative">
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic" placeholder="Full Name" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Business Name</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                                    <input type="text" required value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic" placeholder="Company Ltd." />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Work Email</label>
                            <div className="relative">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic" placeholder="partner@company.com" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                                    <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic" placeholder="+91 ..." />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Category</label>
                                <select required value={formData.vendorCategory} onChange={e => setFormData({...formData, vendorCategory: e.target.value})} className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic appearance-none">
                                    <option value="" className="bg-[#080d14]">Select Specialization</option>
                                    <option value="Printing" className="bg-[#080d14]">Printing & Branding</option>
                                    <option value="Packaging" className="bg-[#080d14]">Box Manufacturing</option>
                                    <option value="Logistics" className="bg-[#080d14]">Logistics & Supply</option>
                                    <option value="Gifts" className="bg-[#080d14]">Gift Sourcing</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Access Password</label>
                            <div className="relative">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                                <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic" placeholder="••••••••" />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-[10px] font-black uppercase italic tracking-widest">{error}</p>}

                        <button disabled={loading} className="w-full py-5 bg-white text-black rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                            {loading ? <RefreshCw className="animate-spin" size={14} /> : <>Submit Application <ChevronRight size={14} /></>}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
