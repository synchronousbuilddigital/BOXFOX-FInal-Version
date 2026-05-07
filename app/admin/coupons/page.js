"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Ticket, Plus, Trash2, Edit3, X, Save,
    Calendar, Percent, IndianRupee, Tag,
    Loader2, AlertCircle, CheckCircle2, Clock
} from "lucide-react";

export default function CouponAdmin() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        code: "",
        type: "percentage",
        value: 0,
        minOrderAmount: 0,
        maxDiscount: "",
        status: "active",
        validUntil: "",
        maxUsage: ""
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await fetch('/api/admin/coupons');
            const data = await res.json();
            setCoupons(data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load coupons");
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingId ? 'PATCH' : 'POST';
        const body = editingId ? { id: editingId, ...formData } : formData;

        try {
            const res = await fetch('/api/admin/coupons', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (res.ok) {
                if (editingId) {
                    setCoupons(prev => prev.map(c => c._id === editingId ? data : c));
                } else {
                    setCoupons(prev => [data, ...prev]);
                }
                resetForm();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error("Submit error:", err);
        }
    };

    const deleteCoupon = async (id) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        try {
            const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
            if (res.ok) setCoupons(prev => prev.filter(c => c._id !== id));
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({
            code: "",
            type: "percentage",
            value: 0,
            minOrderAmount: 0,
            maxDiscount: "",
            status: "active",
            validUntil: "",
            maxUsage: ""
        });
    };

    const editCoupon = (coupon) => {
        setEditingId(coupon._id);
        setFormData({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            minOrderAmount: coupon.minOrderAmount,
            maxDiscount: coupon.maxDiscount || "",
            status: coupon.status,
            validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : "",
            maxUsage: coupon.maxUsage || ""
        });
        setIsAdding(true);
    };

    return (
        <div className="p-6 md:p-10 space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                        Promo <span className="text-gray-400">Vault</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mt-1">Discount & Retention Engine</p>
                </div>

                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-gray-950/20 active:scale-95"
                >
                    <Plus size={16} /> Mint New Coupon
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Coupon List */}
                <div className="xl:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Active Coupons</h2>
                        <span className="bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-full">{coupons.length} TOTAL</span>
                    </div>

                    {loading ? (
                        <div className="p-20 flex justify-center bg-white rounded-[2rem] border border-gray-100"><Loader2 className="animate-spin text-emerald-500" /></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {coupons.map((coupon) => (
                                <motion.div
                                    key={coupon._id}
                                    layoutId={coupon._id}
                                    className="bg-white border border-gray-100 rounded-[2rem] p-6 group hover:shadow-xl hover:shadow-emerald-500/5 transition-all relative overflow-hidden"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-950 border border-gray-100 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                            <Ticket size={24} />
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${coupon.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                            {coupon.status}
                                        </span>
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-gray-950 tracking-tighter uppercase">{coupon.code}</h3>
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                            {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                                        </p>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-gray-50 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Min. Order</p>
                                            <p className="font-bold text-gray-950 text-xs">₹{coupon.minOrderAmount}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Usages</p>
                                            <p className="font-bold text-gray-950 text-xs">{coupon.usageCount} / {coupon.maxUsage || '∞'}</p>
                                        </div>
                                    </div>

                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => editCoupon(coupon)} className="p-2 bg-gray-50 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                                            <Edit3 size={16} />
                                        </button>
                                        <button onClick={() => deleteCoupon(coupon._id)} className="p-2 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Editor Sidebar */}
                <div className="xl:col-span-4">
                    <AnimatePresence mode="wait">
                        {isAdding ? (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden sticky top-10"
                            >
                                <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-black uppercase tracking-tighter text-gray-950">{editingId ? 'Edit' : 'Mint'} Coupon</h2>
                                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">Configure Parameters</p>
                                    </div>
                                    <button onClick={resetForm} className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all">
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Coupon Code</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. WELCOME10"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold uppercase tracking-widest outline-none focus:border-emerald-500 transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Type</label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-emerald-500"
                                            >
                                                <option value="percentage">Percentage (%)</option>
                                                <option value="fixed">Fixed Amount (₹)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Value</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.value}
                                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                    {formData.type === 'percentage' ? <Percent size={14} /> : <IndianRupee size={14} />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Min Order Amount (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.minOrderAmount}
                                            onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
                                        />
                                    </div>

                                    {formData.type === 'percentage' && (
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Max Discount (₹)</label>
                                            <input
                                                type="number"
                                                value={formData.maxDiscount}
                                                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Total Max Usages</label>
                                            <input
                                                type="number"
                                                placeholder="Leave empty for ∞"
                                                value={formData.maxUsage}
                                                onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-emerald-500"
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Valid Until</label>
                                        <input
                                            type="date"
                                            value={formData.validUntil}
                                            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-emerald-500"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
                                    >
                                        {editingId ? 'Update Parameters' : 'Deploy Coupon'}
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <div className="bg-gray-50 rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center p-12 min-h-[500px] sticky top-10">
                                <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center text-gray-200 mb-6 border border-gray-100 shadow-sm">
                                    <Tag size={32} />
                                </div>
                                <h2 className="text-xl font-black uppercase tracking-tighter text-gray-400">Vault Closed</h2>
                                <p className="text-gray-400 text-[10px] font-black max-w-[180px] mt-4 uppercase tracking-widest leading-loose italic">
                                    Initializing new promotional protocols will unlock the editor.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
