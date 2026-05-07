"use client";
import React from "react";
import {
    Activity,
    ArrowUpRight,
    MousePointer2,
    Users,
    CreditCard,
    BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AnalyticsPage() {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetch('/api/admin/analytics')
            .then(res => res.json())
            .then(json => {
                setData(json);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="space-y-10 animate-pulse">
            <div className="h-10 bg-gray-100 rounded-xl w-64" />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 h-96 bg-gray-100 rounded-[2.5rem]" />
                <div className="h-96 bg-gray-950 rounded-[2.5rem]" />
            </div>
        </div>
    );

    const maxRevenue = data?.dailyRevenue?.length > 0 ? Math.max(...data.dailyRevenue.map(d => d.total)) : 100;

    const generateDetailedPDFReport = () => {
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("BoxFox Performance Report", 14, 20);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
        doc.text(`Reporting Period: Lifetime / Last 30 Days (Where applicable)`, 14, 34);

        // Core Metrics Table
        autoTable(doc, {
            startY: 45,
            head: [['Metric', 'Value']],
            body: [
                ['Total Users (Lifetime)', (data.totalCustomers || 0).toString()],
                ['New Users (This Month)', (data.newCustomersThisMonth || 0).toString()],
                ['B2B Accounts', (data.b2bAccounts || 0).toString()],
                ['B2C Accounts', (data.b2cAccounts || 0).toString()],
                ['Total Orders (Lifetime)', (data.totalOrders || 0).toString()],
                ['Total Internal Revenue', `Rs. ${(data.totalRevenue || 0).toLocaleString()}`],
                ['Total Discounts Granted', `Rs. ${(data.totalDiscounts || 0).toLocaleString()}`],
                ['Average Order Value', `Rs. ${(data.avgOrderValue || 0).toLocaleString()}`],
                ['Items Sold (Quantity)', (data.totalProductsSold || 0).toString()],
                ['Repeat Customer Rate', `${data.repeatCustomerRate || 0}%`],
                ['Checkout Conversion Rate', `${data.conversionRate || 0}%`],
                ['Total Products in Active Carts', (data.totalCartItems || 0).toString()],
                ['Total Products in Wishlists', (data.totalWishlistItems || 0).toString()],
                ['Unique Product Models Wishlisted', (data.productsInWishlistsCount || 0).toString()]
            ],
            theme: 'grid',
            headStyles: { fillColor: [5, 150, 105], fontStyle: 'bold' } // Emerald 500
        });

        // Current Status Distribution Table
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 15,
            head: [['Fulfillment Status', 'Volume']],
            body: (data.statusDistribution || []).map(s => [s._id, s.count.toString()]),
            theme: 'grid',
            headStyles: { fillColor: [5, 150, 105], fontStyle: 'bold' }
        });

        // Top Used Coupons Table
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 15,
            head: [['Promo/Coupon Code', 'Times Used', 'Discount Generated']],
            body: (data.couponUsage || []).map(c => [c._id, c.uses.toString(), `Rs. ${c.discountGenerated.toLocaleString()}`]),
            theme: 'grid',
            headStyles: { fillColor: [5, 150, 105], fontStyle: 'bold' }
        });

        // Monthly Revenue Trajectory
        doc.addPage();
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Monthly Revenue Distribution (Trailing Year)", 14, 20);
        autoTable(doc, {
            startY: 28,
            head: [['Month', 'Order Trajectory', 'Revenue']],
            body: (data.monthlyRevenue || []).map(m => [m._id, m.count.toString(), `Rs. ${m.total.toLocaleString()}`]),
            theme: 'striped',
            headStyles: { fillColor: [15, 23, 42], fontStyle: 'bold' } // Slate 900
        });

        doc.save(`BoxFox_Performance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-950 tracking-tighter uppercase">Performance Analytics</h1>
                    <p className="text-gray-400 font-medium">Deep insights into your packaging lab throughput.</p>
                </div>
                <div className="flex gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto max-w-full">
                    <div className="px-4 py-2 border-r border-gray-100 min-w-[100px]">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Users</p>
                        <p className="text-lg font-black text-gray-950">{data.totalCustomers}</p>
                    </div>
                    <div className="px-4 py-2 border-r border-gray-100 min-w-[100px]">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Orders</p>
                        <p className="text-lg font-black text-gray-950">{data.totalOrders}</p>
                    </div>
                    <div className="px-4 py-2 border-r border-gray-100 min-w-[120px]">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gross Rev</p>
                        <p className="text-lg font-black text-emerald-500">₹{parseFloat(data.totalRevenue || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="px-4 py-2 border-r border-gray-100 min-w-[100px]">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cart/Wish</p>
                        <p className="text-lg font-black text-gray-950">{data.totalWishlistItems + data.totalCartItems}</p>
                    </div>
                    <div className="px-4 py-2 border-r border-gray-100 min-w-[100px]">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Items Sold</p>
                        <p className="text-lg font-black text-gray-950">{data.totalProductsSold || 0}</p>
                    </div>
                    <div className="px-4 py-2 border-r border-gray-100 min-w-[100px]">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Discounts</p>
                        <p className="text-lg font-black text-gray-400 decoration-red-500 line-through">₹{parseFloat(data.totalDiscounts || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="px-4 py-2 min-w-[100px]">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Order</p>
                        <p className="text-lg font-black text-emerald-500">₹{parseFloat(data.avgOrderValue || 0).toLocaleString('en-IN')}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm min-h-[400px] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-gray-950 uppercase tracking-tighter">Revenue Stream</h2>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Last 30 Days (Daily)</p>
                        </div>
                        <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                            <button className="px-6 py-2 bg-white text-[10px] font-black uppercase rounded-lg shadow-sm">Sales</button>
                        </div>
                    </div>

                    <div className="flex-1 flex items-end justify-start gap-4 pb-8 h-[250px] overflow-x-auto">
                        {data.dailyRevenue?.length === 0 ? (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 font-black uppercase text-xs tracking-widest">No data available for this period</div>
                        ) : data.dailyRevenue?.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 group min-w-[32px] max-w-[48px] h-full">
                                <div className="relative w-full flex-1 flex items-end">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(d.total / maxRevenue) * 100}%` }}
                                        transition={{ delay: i * 0.02, type: 'spring', damping: 20 }}
                                        className="w-full bg-emerald-500 rounded-t-lg opacity-80 group-hover:opacity-100 group-hover:bg-gray-950 transition-all cursor-pointer relative"
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                            ₹{d.total.toLocaleString()}
                                        </div>
                                    </motion.div>
                                </div>
                                <span className="text-[8px] font-black text-gray-950 uppercase rotate-45 mt-2 origin-left">{new Date(d._id).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 border border-emerald-100 shadow-xl shadow-emerald-500/5 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>
                    <div className="space-y-10">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                            <Activity className="text-emerald-500" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-950 tracking-tighter uppercase leading-none">Conversion Engine</h2>

                        <div className="space-y-6">
                            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 group hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all">
                                <div className="flex justify-between items-end mb-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Checkout CTR</p>
                                </div>
                                <h4 className="text-3xl font-black text-gray-950">{data.conversionRate}%</h4>
                                <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${data.conversionRate}%` }}
                                        className="h-full bg-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 group hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all">
                                <div className="flex justify-between items-end mb-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Repeat Customer Rate</p>
                                </div>
                                <h4 className="text-3xl font-black text-gray-950">{data.repeatCustomerRate}%</h4>
                                <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${data.repeatCustomerRate}%` }}
                                        className="h-full bg-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={generateDetailedPDFReport}
                        className="mt-12 w-full py-5 bg-gray-950 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-500 transition-all shadow-xl shadow-gray-200"
                    >
                        Download Full Report
                    </button>
                </div>


            </div>

            {/* Status Distribution */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
                <h3 className="text-xl font-black text-gray-950 uppercase tracking-tighter mb-8 flex items-center gap-3">
                    <BarChart3 className="text-gray-400" />
                    Fulfillment Distribution
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => {
                        const count = data.statusDistribution?.find(s => s._id === status)?.count || 0;
                        return (
                            <div key={status} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{status}</p>
                                <p className="text-3xl font-black text-gray-950">{count}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

