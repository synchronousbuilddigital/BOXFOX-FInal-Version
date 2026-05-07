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
        { label: 'Total Sales', value: data.totalSales, growth: data.totalSalesGrowth, icon: <DollarSign className="text-emerald-500" />, trend: 'up' },
        { label: 'Total Orders', value: data.totalOrders, growth: data.totalOrdersGrowth, icon: <ShoppingBag className="text-blue-500" />, trend: 'up' },
        { label: 'Products Sold', value: data.productsSold, growth: data.productsSoldGrowth, icon: <Box className="text-orange-500" />, trend: 'down' },
    ];


    return (
        <div className="space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-gray-950 tracking-tighter">Dashboard Overview</h1>
                <p className="text-gray-400 font-medium">Welcome back! Here's what's happening with BoxFox today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                                {stat.icon}
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-black ${stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {stat.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {stat.growth}
                            </div>
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                        <h3 className="text-3xl font-black text-gray-950 tracking-tight">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/admin/lab-config" className="group">
                    <div className="bg-emerald-500 p-8 rounded-[2.5rem] text-white flex items-center justify-between hover:scale-[1.02] transition-all shadow-lg shadow-emerald-500/20">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md">
                                <Layers size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter">Lab Config Center</h3>
                                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Manage Categories & Sizes</p>
                            </div>
                        </div>
                        <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </Link>
                
                <Link href="/admin/b2b" className="group">
                    <div className="bg-gray-950 p-8 rounded-[2.5rem] text-white flex items-center justify-between hover:scale-[1.02] transition-all shadow-lg shadow-gray-950/20">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md">
                                <Settings size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter">B2B Core Ops</h3>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Pricing & Config Tokens</p>
                            </div>
                        </div>
                        <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Recent Orders */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-xl font-black text-gray-950 uppercase tracking-tighter">Recent Orders</h2>
                        <button
                            onClick={() => window.location.href = '/admin/orders'}
                            className="text-xs font-black text-emerald-500 uppercase tracking-widest hover:underline"
                        >
                            View All
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Order ID</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Customer</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Product</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Status</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Amount</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.recentOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center text-gray-400 font-medium">No recent orders found</td>
                                    </tr>
                                ) : (
                                    data.recentOrders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-gray-50 transition-colors group cursor-pointer"
                                            onClick={() => window.location.href = `/admin/orders/${order.id}`}
                                        >
                                            <td className="px-8 py-5 text-sm font-black text-gray-950 whitespace-nowrap">{order.id}</td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <p className="text-sm font-bold text-gray-950">{order.customer}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{order.time}</p>
                                            </td>
                                            <td className="px-8 py-5 text-sm font-medium text-gray-500 whitespace-nowrap">{order.product}</td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-600' :
                                                    order.status === 'Processing' ? 'bg-blue-100 text-blue-600' :
                                                        order.status === 'Shipped' ? 'bg-orange-100 text-orange-600' :
                                                            'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-sm font-black text-gray-950 whitespace-nowrap">{order.amount}</td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <button className="p-2 hover:bg-white border border-transparent hover:border-gray-100 rounded-lg transition-all group-hover:bg-white">
                                                    <ArrowUpRight size={16} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    );
}
