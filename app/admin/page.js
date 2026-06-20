"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    TrendingUp,
    Box,
    ShoppingBag,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    MoreHorizontal,
    Layers,
    Settings
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user?.role === 'staff_fulfillment') {
                    router.push('/admin/orders');
                } else if (!data.user || data.user.role !== 'admin') {
                    router.push('/admin/login');
                } else {
                    return fetch('/api/admin/stats');
                }
            })
            .then(res => res && res.json())
            .then(json => {
                if (!json) return;
                if (json.error) {
                    setError(json.error);
                } else {
                    setData(json);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Dashboard fetch error:", err);
                setError("Failed to load dashboard data.");
                setLoading(false);
            });
    }, [router]);

    if (loading) {
        return (
            <div className="space-y-10 animate-pulse">
                <div className="h-10 bg-gray-100 rounded-xl w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-gray-100 rounded-[2rem]" />)}
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 h-96 bg-gray-100 rounded-[2.5rem]" />
                    <div className="h-96 bg-gray-950 rounded-[2.5rem]" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <ArrowDownRight size={32} />
                </div>
                <h2 className="text-xl font-black text-gray-950 uppercase tracking-tighter mb-2">Error Loading Dashboard</h2>
                <p className="text-gray-500 font-medium">{error}</p>
            </div>
        );
    }

    const stats = [
        { label: 'Total Sales', value: data.totalSales, growth: data.totalSalesGrowth, icon: <DollarSign className="text-emerald-500" />, trend: 'up', color: 'emerald' },
        { label: 'Total Orders', value: data.totalOrders, growth: data.totalOrdersGrowth, icon: <ShoppingBag className="text-blue-500" />, trend: 'up', color: 'blue' },
        { label: 'Products Sold', value: data.productsSold, growth: data.productsSoldGrowth, icon: <Box className="text-orange-500" />, trend: 'down', color: 'orange' },
    ];

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-5xl font-black text-gray-950 tracking-tighter leading-none mb-2">Dashboard</h1>
                    <p className="text-gray-400 font-medium text-lg">Welcome back! Here's what's happening with BoxFox today.</p>
                </div>
                <div className="hidden md:block text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Status</p>
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-950">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        All Systems Operational
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
                        className="relative group bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/40 hover:-translate-y-1 transition-all duration-300"
                    >
                        {/* Decorative background glow */}
                        <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-10 bg-${stat.color}-500 group-hover:opacity-20 transition-opacity duration-500`}></div>
                        
                        <div className="relative z-10 flex items-center justify-between mb-8">
                            <div className="w-14 h-14 rounded-3xl bg-gray-50 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                                {stat.icon}
                            </div>
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black shadow-sm ${stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.growth}
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                            <h3 className="text-4xl font-black text-gray-950 tracking-tighter">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/admin/lab-config" className="group block h-full">
                    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-700 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-500 h-full">
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                        <div className="relative z-10 flex items-center gap-8">
                            <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-inner group-hover:-rotate-6 transition-transform duration-500">
                                <Layers size={36} className="text-white drop-shadow-md" />
                            </div>
                            <div>
                                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter mb-1">Lab Config Center</h3>
                                <p className="text-emerald-100 text-[11px] font-black uppercase tracking-[0.2em]">Manage Categories & Sizes</p>
                            </div>
                        </div>
                        <div className="relative z-10 w-14 h-14 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:bg-white group-hover:text-emerald-600 transition-all duration-500">
                            <ArrowUpRight size={24} className="opacity-70 group-hover:opacity-100 group-hover:rotate-45 transition-all duration-500" />
                        </div>
                    </div>
                </Link>
                
                <Link href="/admin/b2b" className="group block h-full">
                    <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-950 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:scale-[1.02] hover:shadow-2xl hover:shadow-gray-900/30 transition-all duration-500 h-full">
                        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>
                        <div className="relative z-10 flex items-center gap-8">
                            <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center backdrop-blur-xl border border-white/10 shadow-inner group-hover:rotate-6 transition-transform duration-500">
                                <Settings size={36} className="text-emerald-400 drop-shadow-md" />
                            </div>
                            <div>
                                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter mb-1">B2B Core Ops</h3>
                                <p className="text-gray-400 text-[11px] font-black uppercase tracking-[0.2em]">Pricing & Config Tokens</p>
                            </div>
                        </div>
                        <div className="relative z-10 w-14 h-14 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-400 transition-all duration-500">
                            <ArrowUpRight size={24} className="opacity-70 group-hover:opacity-100 group-hover:rotate-45 transition-all duration-500" />
                        </div>
                    </div>
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Recent Orders */}
                <div className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
                    <div className="p-6 sm:p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                                <ShoppingBag size={20} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-950 uppercase tracking-tighter leading-none">Recent Orders</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Real-time fulfillment tracking</p>
                            </div>
                        </div>
                        <button
                            onClick={() => window.location.href = '/admin/orders'}
                            className="px-6 py-3 bg-gray-950 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-500 transition-colors shadow-md"
                        >
                            View All
                        </button>
                    </div>
                    <div className="p-4">
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse border-spacing-y-2">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none border-b border-gray-100">Order ID</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none border-b border-gray-100">Customer</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none border-b border-gray-100">Product</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none border-b border-gray-100">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none border-b border-gray-100">Amount</th>
                                        <th className="px-6 py-4 border-b border-gray-100"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-transparent">
                                    {data.recentOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-8 py-20 text-center text-gray-400 font-medium">No recent orders found</td>
                                        </tr>
                                    ) : (
                                        data.recentOrders.map((order) => (
                                            <tr
                                                key={order.id}
                                                className="group cursor-pointer hover:bg-gray-50/80 transition-all duration-300 rounded-2xl relative"
                                                onClick={() => window.location.href = `/admin/orders/${order.id}`}
                                            >
                                                <td className="px-6 py-5 rounded-l-2xl">
                                                    <span className="text-sm font-black text-gray-950 bg-gray-100 px-3 py-1.5 rounded-lg whitespace-nowrap group-hover:bg-white group-hover:shadow-sm transition-all">{order.id}</span>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <p className="text-sm font-black text-gray-950">{order.customer}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{order.time}</p>
                                                </td>
                                                <td className="px-6 py-5 text-sm font-bold text-gray-500 whitespace-nowrap">{order.product}</td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        order.status === 'Processing' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                            order.status === 'Shipped' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                                'bg-gray-50 text-gray-600 border-gray-200'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'Delivered' ? 'bg-emerald-500' : order.status === 'Processing' ? 'bg-blue-500' : order.status === 'Shipped' ? 'bg-orange-500' : 'bg-gray-400'}`}></span>
                                                        {order.status}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-base font-black text-emerald-600 whitespace-nowrap">{order.amount}</td>
                                                <td className="px-6 py-5 whitespace-nowrap rounded-r-2xl text-right">
                                                    <div className="inline-flex w-10 h-10 bg-white border border-gray-100 rounded-xl items-center justify-center text-gray-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 group-hover:scale-110 transition-all duration-300 shadow-sm">
                                                        <ArrowUpRight size={18} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                            {data.recentOrders.length === 0 ? (
                                <div className="px-8 py-20 text-center text-gray-400 font-medium">No recent orders found</div>
                            ) : (
                                data.recentOrders.map((order) => (
                                    <div 
                                        key={order.id}
                                        onClick={() => window.location.href = `/admin/orders/${order.id}`}
                                        className="group cursor-pointer bg-white border border-gray-100 rounded-2xl p-5 hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className="text-xs font-black text-gray-950 bg-gray-100 px-2.5 py-1 rounded-md">{order.id}</span>
                                                <h3 className="text-base font-black text-gray-950 mt-2">{order.customer}</h3>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{order.time}</p>
                                            </div>
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm border ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                order.status === 'Processing' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                order.status === 'Shipped' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                'bg-gray-50 text-gray-600 border-gray-200'
                                            }`}>
                                                <span className={`w-1 h-1 rounded-full ${order.status === 'Delivered' ? 'bg-emerald-500' : order.status === 'Processing' ? 'bg-blue-500' : order.status === 'Shipped' ? 'bg-orange-500' : 'bg-gray-400'}`}></span>
                                                {order.status}
                                            </div>
                                        </div>
                                        
                                        <div className="pt-4 border-t border-gray-50 flex justify-between items-end">
                                            <div className="flex-1 pr-4">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Product</p>
                                                <p className="text-sm font-bold text-gray-600 line-clamp-1">{order.product}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Amount</p>
                                                <p className="text-base font-black text-emerald-600">{order.amount}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
