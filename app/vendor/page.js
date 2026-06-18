"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    RefreshCw, Package, DollarSign, Mail, Phone, Briefcase, Calendar, 
    Info, ShieldCheck, X, ArrowUpRight, Truck, Copy, Check, ExternalLink, Globe 
} from "lucide-react";
import Navbar from "../components/Navbar";
import PortalAIAssistant from "../components/PortalAIAssistant";
import { useAuth } from "../context/AuthContext";

function getVendorQuoteStatus(status) {
    if (status === 'completed' || status === 'fulfilled') return 'completed';
    if (status === 'in-progress') return 'in-progress';
    return 'allotted';
}

function statusClass(status) {
    switch (status) {
        case 'in-progress': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
}

export default function VendorDashboard() {
    const { user } = useAuth();
    const [quotes, setQuotes] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
    
    // Tab State
    const [activeTab, setActiveTab] = useState("orders"); // Defaults to Store Orders

    // Dispatch Order Modal State
    const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
    const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState(null);
    const [courierPartner, setCourierPartner] = useState("Delhivery");
    const [customCourierPartner, setCustomCourierPartner] = useState("");
    const [trackingId, setTrackingId] = useState("");
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const loadQuotesData = async () => {
        try {
            const res = await fetch("/api/vendor/quotes");
            const data = await res.json();
            setQuotes(data.quotes || []);
        } catch (err) {
            console.error("Error loading quotes:", err);
        }
    };

    const loadOrdersData = async () => {
        try {
            setOrdersLoading(true);
            const res = await fetch("/api/vendor/orders");
            const data = await res.json();
            setOrders(data.orders || []);
        } catch (err) {
            console.error("Error loading store orders:", err);
        } finally {
            setOrdersLoading(false);
        }
    };

    const loadData = async () => {
        setRefreshing(true);
        try {
            await Promise.all([loadQuotesData(), loadOrdersData()]);
        } catch (err) {
            console.error("Error loading dashboard data:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const updateProjectStatus = async (quoteId, status) => {
        await fetch('/api/vendor/quotes', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quoteId, status })
        });
        loadQuotesData();
    };

    // Store Orders Fulfill / Dispatch Handler
    const handleDispatchOrder = async (e) => {
        e.preventDefault();
        const finalCourier = courierPartner === "Other" ? customCourierPartner : courierPartner;
        if (!finalCourier || !trackingId) {
            alert("Please provide both courier partner and tracking ID.");
            return;
        }

        setUpdatingStatus(true);
        try {
            const res = await fetch("/api/vendor/orders", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: selectedOrderForDispatch.orderId,
                    deliveryPartner: finalCourier,
                    trackingId: trackingId,
                    status: "Shipped"
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                alert("Order successfully marked as Shipped!");
                setIsDispatchModalOpen(false);
                setSelectedOrderForDispatch(null);
                setTrackingId("");
                setCustomCourierPartner("");
                loadOrdersData();
            } else {
                alert(data.error || "Failed to dispatch order.");
            }
        } catch (err) {
            console.error("Error dispatching order:", err);
            alert("An error occurred. Please try again.");
        } finally {
            setUpdatingStatus(false);
        }
    };

    // Complete logistics stage manually
    const handleMarkAsDelivered = async (order) => {
        if (!confirm("Are you sure you want to mark this shipment as Delivered? This will notify the customer and complete the workflow.")) return;
        
        try {
            const res = await fetch("/api/vendor/orders", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: order.orderId,
                    deliveryPartner: order.deliveryPartner,
                    trackingId: order.trackingId,
                    status: "Delivered"
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                alert("Order marked as Delivered successfully!");
                loadOrdersData();
            } else {
                alert(data.error || "Failed to update order status.");
            }
        } catch (err) {
            console.error("Error updating order status:", err);
            alert("An error occurred. Please try again.");
        }
    };

    // Tracking link generation helper
    const getTrackingLink = (carrier, trackId) => {
        if (!trackId) return "";
        const cleanCarrier = carrier.toLowerCase().trim();
        if (cleanCarrier.includes("delhivery")) {
            return `https://www.delhivery.com/track/package/${trackId}`;
        }
        if (cleanCarrier.includes("bluedart") || cleanCarrier.includes("blue dart")) {
            return `https://www.bluedart.com/tracking?awb/${trackId}`;
        }
        if (cleanCarrier.includes("dtdc")) {
            return `https://www.dtdc.in/tracking/tracking_results.asp?pinno=${trackId}`;
        }
        if (cleanCarrier.includes("dhl")) {
            return `https://www.dhl.com/in-en/home/tracking.html?trackingId=${trackId}`;
        }
        if (cleanCarrier.includes("speed post") || cleanCarrier.includes("india post") || cleanCarrier.includes("post")) {
            return `https://www.indiapost.gov.in/`;
        }
        return `https://www.google.com/search?q=${encodeURIComponent(carrier + ' tracking ' + trackId)}`;
    };

    // Copy Tracking summary text to clipboard
    const copyTrackingInfo = (order) => {
        const trackingUrl = getTrackingLink(order.deliveryPartner, order.trackingId);
        const text = `Order Reference: ${order.orderId}\nStatus: ${order.status}\nCourier Partner: ${order.deliveryPartner}\nTracking ID: ${order.trackingId}\nTrack here: ${trackingUrl}`;
        navigator.clipboard.writeText(text);
        alert("Tracking summary copied to clipboard!");
    };

    // Calculate vendor payout cut for an order
    const getOrderPayout = (order) => {
        const rate = user?.commissionRate || 0;
        return order.items.reduce((sum, item) => {
            const itemTotal = parseFloat(item.price || 0) * (item.quantity || 1);
            return sum + (itemTotal * (1 - (rate / 100)));
        }, 0);
    };

    // Generate label for custom quotation project
    const generateShippingLabel = async (quote) => {
        try {
            const { jsPDF } = await import("jspdf");
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: [100, 150]
            });

            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(1);
            doc.rect(4, 4, 92, 142);

            doc.setFont("Helvetica", "bold");
            doc.setFontSize(14);
            doc.text("BOXFOX FULFILLMENT", 50, 14, { align: "center" });
            
            doc.setLineWidth(0.5);
            doc.line(4, 18, 96, 18);

            doc.setFontSize(8);
            doc.setFont("Helvetica", "bold");
            doc.text("SHIP FROM (SENDER):", 6, 23);
            doc.setFont("Helvetica", "normal");
            doc.text("BoxFox Store Central Warehouse", 6, 27);
            doc.text("Gurgaon Industrial Hub, Sector 18", 6, 31);
            doc.text("Gurugram, Haryana, 122015", 6, 35);
            doc.text("Phone: +91 98765 43210 (Support)", 6, 39);

            doc.line(4, 43, 96, 43);

            doc.setFont("Helvetica", "bold");
            doc.text("SHIP TO (RECIPIENT):", 6, 48);
            doc.setFont("Helvetica", "normal");
            
            const clientName = quote.user?.name || "Client Order Delivery";
            const clientCompany = quote.user?.company && quote.user.company !== 'Personal' 
                ? quote.user.company 
                : "";
            
            doc.text(clientName, 6, 52);
            let addressY = 56;
            if (clientCompany) {
                doc.text(clientCompany, 6, 56);
                addressY = 60;
            }

            const addr = quote.shippingAddress || {};
            const street = addr.street || "Direct Client Site Delivery";
            const apartment = addr.apartment ? `, ${addr.apartment}` : "";
            const city = addr.city || "Gurugram";
            const state = addr.state || "Haryana";
            const zip = addr.zipCode || "122015";

            const splitAddress = doc.splitTextToSize(street + apartment, 84);
            doc.text(splitAddress, 6, addressY);
            addressY += (splitAddress.length * 4);

            doc.text(`${city}, ${state} - ${zip}`, 6, addressY);
            addressY += 4;
            doc.text("Phone: +91 98765 43210 (Delivery Hotline)", 6, addressY);

            doc.line(4, addressY + 4, 96, addressY + 4);
            const line2Y = addressY + 4;

            doc.setFont("Helvetica", "bold");
            doc.text(`ORDER REF: #${quote._id.slice(-6).toUpperCase()}`, 6, line2Y + 8);
            doc.setFont("Helvetica", "normal");
            doc.text(`DATE: ${new Date(quote.createdAt).toLocaleDateString()}`, 6, line2Y + 12);
            
            const barcodeY = line2Y + 16;
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(6);
            doc.text("* " + quote._id.slice(-8).toUpperCase() + " *", 50, barcodeY + 14, { align: "center" });
            
            for (let i = 10; i < 90; i += 2) {
                const weight = (i % 3 === 0) ? 1.2 : ((i % 5 === 0) ? 0.4 : 0.8);
                doc.setLineWidth(weight);
                doc.line(i, barcodeY, i, barcodeY + 10);
            }

            doc.line(4, barcodeY + 18, 96, barcodeY + 18);
            const line3Y = barcodeY + 18;

            doc.setFont("Helvetica", "bold");
            doc.setFontSize(8);
            doc.text("WHITE-LABELED DIRECT FULFILLMENT", 50, line3Y + 6, { align: "center" });
            doc.setFont("Helvetica", "normal");
            doc.setFontSize(7);
            doc.text("If undelivered, return to Sender address above.", 50, line3Y + 10, { align: "center" });

            doc.save(`Shipping_Label_Order_${quote._id.slice(-6).toUpperCase()}.pdf`);
        } catch (err) {
            console.error("Failed to generate PDF Label:", err);
            alert("Failed to generate Shipping Label PDF.");
        }
    };

    // Generate label for retail store order
    const generateStoreOrderShippingLabel = async (order) => {
        try {
            const { jsPDF } = await import("jspdf");
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: [100, 150]
            });

            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(1);
            doc.rect(4, 4, 92, 142);

            doc.setFont("Helvetica", "bold");
            doc.setFontSize(14);
            doc.text("BOXFOX STORE SHIPMENT", 50, 14, { align: "center" });
            
            doc.setLineWidth(0.5);
            doc.line(4, 18, 96, 18);

            doc.setFontSize(8);
            doc.setFont("Helvetica", "bold");
            doc.text("SHIP FROM (VENDOR):", 6, 23);
            doc.setFont("Helvetica", "normal");
            doc.text(user?.businessName || "Authorized Partner", 6, 27);
            doc.text(`${user?.vendorCity || "Central Hub"}, ${user?.vendorState || "India"}`, 6, 31);
            doc.text(`GST: ${user?.vendorGstLocal || "N.A."}`, 6, 35);
            doc.text(`Phone: ${user?.phone || "Support"}`, 6, 39);

            doc.line(4, 43, 96, 43);

            doc.setFont("Helvetica", "bold");
            doc.text("SHIP TO (CUSTOMER):", 6, 48);
            doc.setFont("Helvetica", "normal");
            
            const customerName = order.customer?.name || "Client Order Delivery";
            doc.text(customerName, 6, 52);
            
            const shipping = order.shipping || {};
            const street = shipping.address || "Standard Delivery Address";
            const city = shipping.city || "";
            const state = shipping.state || "";
            const pincode = shipping.pincode || "";

            const splitAddress = doc.splitTextToSize(street, 84);
            let addressY = 56;
            doc.text(splitAddress, 6, addressY);
            addressY += (splitAddress.length * 4);

            doc.text(`${city}, ${state} - ${pincode}`, 6, addressY);
            addressY += 4;
            doc.text(`Phone: ${order.customer?.phone || "N.A."}`, 6, addressY);

            doc.line(4, addressY + 4, 96, addressY + 4);
            const line2Y = addressY + 4;

            doc.setFont("Helvetica", "bold");
            doc.text(`ORDER ID: ${order.orderId}`, 6, line2Y + 8);
            doc.setFont("Helvetica", "normal");
            doc.text(`DATE: ${new Date(order.createdAt).toLocaleDateString()}`, 6, line2Y + 12);
            
            const barcodeY = line2Y + 16;
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(6);
            doc.text("* " + order.orderId + " *", 50, barcodeY + 14, { align: "center" });
            
            for (let i = 10; i < 90; i += 2) {
                const weight = (i % 3 === 0) ? 1.2 : ((i % 5 === 0) ? 0.4 : 0.8);
                doc.setLineWidth(weight);
                doc.line(i, barcodeY, i, barcodeY + 10);
            }

            doc.line(4, barcodeY + 18, 96, barcodeY + 18);
            const line3Y = barcodeY + 18;

            doc.setFont("Helvetica", "bold");
            doc.setFontSize(8);
            doc.text("WHITE-LABELED FULFILLMENT", 50, line3Y + 6, { align: "center" });
            doc.setFont("Helvetica", "normal");
            doc.setFontSize(7);
            doc.text("If undelivered, return to Sender address above.", 50, line3Y + 10, { align: "center" });

            doc.save(`Shipping_Label_${order.orderId}.pdf`);
        } catch (err) {
            console.error("Failed to generate PDF Label:", err);
            alert("Failed to generate Shipping Label PDF.");
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 font-black uppercase tracking-widest italic">Loading Dashboard...</div>;

    // Metrics Calculations
    const completedQuotes = quotes.filter(q => getVendorQuoteStatus(q.status) === 'completed');
    const quotePayout = completedQuotes.reduce((sum, q) => sum + (q.vendorAmount || 0), 0);
    const orderPayout = orders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + getOrderPayout(o), 0);
    const totalPayoutRevenue = quotePayout + orderPayout;

    const activeQuotesCount = quotes.filter(q => getVendorQuoteStatus(q.status) !== 'completed').length;
    const activeOrdersCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
    const totalActiveCount = activeQuotesCount + activeOrdersCount;

    const paymentTerms = user?.vendorPaymentTerms || "Net 30 Days";

    return (
        <div className="min-h-screen bg-gray-50 text-gray-955 selection:bg-emerald-500/30 pb-32">
            <Navbar />
            <div className="max-w-[1400px] mx-auto px-6 py-32">
                
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
                    <div>
                        <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4 italic">Manufacturing Portal</p>
                        <h1 className="text-6xl text-gray-950 font-black uppercase tracking-tighter italic">Vendor <br /> Dashboard</h1>
                    </div>
                    <button onClick={loadData} className="px-8 py-4 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-3 shadow-xs">
                        <RefreshCw className={refreshing ? 'animate-spin' : ''} size={16} /> Refresh Feed
                    </button>
                </div>

                {/* Dashboard Summary Cards Grid */}
                <div className="grid md:grid-cols-4 gap-8 mb-16">
                    <div className="bg-white border border-gray-200/80 rounded-[2.5rem] p-8 hover:shadow-lg hover:shadow-gray-200/40 transition-all relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Payout Revenue</p>
                                <p className="text-3xl font-black italic text-emerald-600">₹ {totalPayoutRevenue.toLocaleString("en-IN")}</p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                                <DollarSign size={18} />
                            </div>
                        </div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-4">Quotes & Store Orders delivered</p>
                    </div>

                    <div className="bg-white border border-gray-200/80 rounded-[2.5rem] p-8 hover:shadow-lg hover:shadow-gray-200/40 transition-all relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Shipments</p>
                                <p className="text-3xl font-black italic text-gray-955">{totalActiveCount}</p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                                <Briefcase size={18} />
                            </div>
                        </div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-4">Active Orders & Allocated Quotes</p>
                    </div>

                    <div className="bg-white border border-gray-200/80 rounded-[2.5rem] p-8 hover:shadow-lg hover:shadow-gray-200/40 transition-all relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment Terms</p>
                                <p className="text-2xl font-black italic text-gray-955 uppercase tracking-tight">{paymentTerms}</p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                                <Calendar size={18} />
                            </div>
                        </div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-4">Per manufacturing agreement</p>
                    </div>

                    <div 
                        onClick={() => setIsCommissionModalOpen(true)}
                        className="bg-emerald-50/40 border border-emerald-100 hover:border-emerald-250 cursor-pointer rounded-[2.5rem] p-8 hover:shadow-lg hover:shadow-emerald-200/30 transition-all relative overflow-hidden flex flex-col justify-between min-h-[160px] group"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Commission Rate</p>
                                <p className="text-2xl font-black italic text-emerald-700 uppercase tracking-tight flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    {user?.commissionRate || 0}% Rate <ArrowUpRight size={18} />
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                                <Info size={18} />
                            </div>
                        </div>
                        <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mt-4">Click to view platform tiers</p>
                    </div>
                </div>

                {/* Premium Tab Selector */}
                <div className="flex border-b border-gray-200 gap-8 mb-12">
                    <button 
                        onClick={() => setActiveTab("orders")}
                        className={`pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === 'orders' ? 'border-emerald-500 text-gray-950' : 'border-transparent text-gray-400 hover:text-gray-650'}`}
                    >
                        <Package size={14} /> Store Orders & Logistics ({orders.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab("quotes")}
                        className={`pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === 'quotes' ? 'border-emerald-500 text-gray-950' : 'border-transparent text-gray-400 hover:text-gray-650'}`}
                    >
                        <Briefcase size={14} /> Custom Projects ({quotes.length})
                    </button>
                </div>

                {/* TAB CONTENT: STORE ORDERS */}
                {activeTab === "orders" && (
                    <div className="grid gap-8">
                        {ordersLoading ? (
                            <div className="py-20 text-center text-gray-400 text-xs font-black uppercase tracking-widest italic animate-pulse">Loading orders feed...</div>
                        ) : orders.map((order) => {
                            const payout = getOrderPayout(order);
                            const trackingUrl = order.trackingId ? getTrackingLink(order.deliveryPartner, order.trackingId) : "";
                            
                            return (
                                <div key={order._id} className="bg-white border border-gray-200/80 rounded-[3rem] p-8 lg:p-12 hover:shadow-xl hover:shadow-gray-200/40 transition-all relative overflow-hidden">
                                    <div className="grid lg:grid-cols-3 gap-12">
                                        
                                        {/* Order Info & Customer Details */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black italic">
                                                    S
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black uppercase italic tracking-tight text-gray-955">
                                                        {order.orderId}
                                                    </p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                        Placed on: {new Date(order.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <span className={`inline-flex items-center px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                                                    order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    order.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    'bg-amber-50 text-amber-700 border-amber-200'
                                                }`}>
                                                    {order.status}
                                                </span>
                                                <span className="ml-2 inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 text-[9px] font-black uppercase tracking-widest">
                                                    Paid / Confirmed
                                                </span>
                                            </div>

                                            <div className="pt-4 border-t border-gray-100 space-y-3">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery Address</p>
                                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150 text-xs font-semibold space-y-1 text-gray-750">
                                                    <p className="font-black text-gray-950 uppercase italic">{order.customer?.name}</p>
                                                    <p className="text-[10px] font-bold uppercase">{order.shipping?.address}</p>
                                                    <p className="text-[10px] font-bold uppercase">{order.shipping?.city}, {order.shipping?.state} - {order.shipping?.pincode}</p>
                                                    <p className="text-[9px] font-black text-emerald-600 mt-2 flex items-center gap-1.5"><Phone size={10} /> {order.customer?.phone}</p>
                                                    <p className="text-[9px] font-black text-gray-400 flex items-center gap-1.5"><Mail size={10} /> {order.customer?.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Products list */}
                                        <div className="space-y-6 border-l border-gray-100 pl-12">
                                            <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic flex items-center gap-2">
                                                <Package size={14} /> Catalog Items ({order.items.length})
                                            </h4>
                                            <div className="space-y-4">
                                                {order.items.map((item, idx) => {
                                                    const itemTotal = parseFloat(item.price || 0) * (item.quantity || 1);
                                                    const itemPayout = itemTotal * (1 - ((user?.commissionRate || 0) / 100));
                                                    
                                                    return (
                                                        <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-150 flex gap-4">
                                                            {item.image && (
                                                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-gray-200" />
                                                            )}
                                                            <div className="flex-1">
                                                                <p className="text-xs font-black uppercase italic text-gray-950 line-clamp-1">{item.name}</p>
                                                                <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">Qty: {item.quantity} @ ₹{parseFloat(item.price || 0).toLocaleString()}</p>
                                                                <p className="text-[9px] font-black text-emerald-600 mt-1 uppercase">Payout: ₹{itemPayout.toLocaleString("en-IN")} <span className="text-gray-400 font-bold">({user?.commissionRate || 0}% Fee)</span></p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Logistics & Tracking updates */}
                                        <div className="space-y-8 border-l border-gray-100 pl-12 flex flex-col justify-between">
                                            
                                            {/* Payout total summary */}
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Settlement Valuation</label>
                                                <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-3xl">
                                                    <p className="text-3xl font-black italic text-emerald-600">
                                                        ₹ {payout.toLocaleString("en-IN")}
                                                    </p>
                                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Net partner payout credit</p>
                                                </div>
                                            </div>

                                            {/* Logistics action block */}
                                            <div className="space-y-4">
                                                {order.status === 'Processing' ? (
                                                    <div className="space-y-3">
                                                        <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-start gap-2.5">
                                                            <Truck className="text-amber-600 shrink-0 mt-0.5" size={16} />
                                                            <p className="text-[9px] text-gray-500 uppercase leading-relaxed font-bold">
                                                                Order is ready to ship. Please handle manual logistics dispatch below.
                                                            </p>
                                                        </div>
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedOrderForDispatch(order);
                                                                setIsDispatchModalOpen(true);
                                                            }}
                                                            className="w-full py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                                                        >
                                                            <Truck size={14} /> Dispatch Shipment
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <div className="bg-gray-50 border border-gray-150 p-4 rounded-2xl space-y-2">
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Shipment Tracking Details</p>
                                                            <p className="text-xs font-black uppercase italic text-gray-955 flex items-center gap-1.5"><Truck size={12} className="text-emerald-500" /> {order.deliveryPartner}</p>
                                                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">ID: <span className="font-mono text-gray-950 font-bold select-all bg-gray-150 px-1.5 py-0.5 rounded">{order.trackingId}</span></p>
                                                        </div>

                                                        {order.status === 'Shipped' && (
                                                            <button 
                                                                onClick={() => handleMarkAsDelivered(order)}
                                                                className="w-full py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                                                            >
                                                                <Check size={14} /> Mark as Delivered
                                                            </button>
                                                        )}

                                                        <div className="grid grid-cols-2 gap-2.5">
                                                            <a 
                                                                href={trackingUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="py-3 bg-gray-50 border border-gray-200 text-gray-700 text-center rounded-2xl text-[9px] font-black uppercase tracking-wider hover:bg-gray-100 hover:text-gray-950 transition-all flex items-center justify-center gap-1"
                                                            >
                                                                <Globe size={11} /> Track <ExternalLink size={10} />
                                                            </a>
                                                            <button 
                                                                onClick={() => copyTrackingInfo(order)}
                                                                className="py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-2xl text-[9px] font-black uppercase tracking-wider hover:bg-gray-100 hover:text-gray-950 transition-all flex items-center justify-center gap-1"
                                                            >
                                                                <Copy size={11} /> Share Tracking
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <button 
                                                    onClick={() => generateStoreOrderShippingLabel(order)}
                                                    className="w-full py-3.5 bg-gray-950 hover:bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                                                >
                                                    Print Shipping Label
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {orders.length === 0 && (
                            <div className="py-32 text-center opacity-40 text-sm font-black uppercase tracking-widest italic flex flex-col items-center gap-4 text-gray-400">
                                <Package size={40} className="text-gray-300" />
                                No store orders received yet
                            </div>
                        )}
                    </div>
                )}

                {/* TAB CONTENT: Allocated Quotes */}
                {activeTab === "quotes" && (
                    <div className="grid gap-8">
                        {quotes.map((quote) => (
                            <div key={quote._id} className="bg-white border border-gray-200/80 rounded-[3rem] p-8 lg:p-12 hover:shadow-xl hover:shadow-gray-200/40 transition-all relative overflow-hidden">
                                <div className="grid lg:grid-cols-3 gap-12">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black italic">O</div>
                                            <div>
                                                <p className="text-sm font-black uppercase italic tracking-tight text-gray-950">Order #{quote._id.slice(-6).toUpperCase()}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Workflow: {getVendorQuoteStatus(quote.status)}</p>
                                            </div>
                                        </div>
                                        <div className={`inline-flex items-center px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] ${statusClass(getVendorQuoteStatus(quote.status))}`}>
                                            {getVendorQuoteStatus(quote.status)}
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Mail size={12} className="text-emerald-500" /> Support: support@boxfox.in</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Phone size={12} className="text-emerald-500" /> Helpline: +91 98765 43210</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6 border-l border-gray-100 pl-12">
                                        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic flex items-center gap-2"><Package size={14} /> Production Items</h4>
                                        <div className="space-y-4">
                                            {quote.items.map((item, i) => (
                                                <div key={i} className="bg-gray-50 p-4 rounded-2xl border border-gray-200/60">
                                                    <p className="text-xs font-black uppercase italic text-gray-800">{item.productName}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 italic">Quantity: {item.quantity}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-8 border-l border-gray-100 pl-12 flex flex-col justify-between">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Settlement Amount</label>
                                            <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl">
                                                <p className="text-4xl font-black italic text-emerald-600 flex items-center gap-2">
                                                    ₹ {quote.vendorAmount || 0}
                                                </p>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-2">Payout for this fulfillment</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                disabled={getVendorQuoteStatus(quote.status) !== 'allotted'}
                                                onClick={() => updateProjectStatus(quote._id, 'in-progress')}
                                                className="py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all disabled:opacity-30 disabled:hover:bg-gray-50 disabled:hover:border-gray-200"
                                            >
                                                Start Work
                                            </button>
                                            <button
                                                disabled={getVendorQuoteStatus(quote.status) !== 'in-progress'}
                                                onClick={() => updateProjectStatus(quote._id, 'completed')}
                                                className="py-3 rounded-2xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-30"
                                            >
                                                Mark Complete
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <button className="w-full py-4 bg-gray-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all">
                                                Download Specs
                                            </button>
                                            <button 
                                                onClick={() => generateShippingLabel(quote)}
                                                className="w-full py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                                            >
                                                Print Shipping Label
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {quotes.length === 0 && (
                            <div className="py-32 text-center opacity-40 text-sm font-black uppercase tracking-widest italic flex flex-col items-center gap-4 text-gray-400">
                                <Briefcase size={40} className="text-gray-300" />
                                No projects allocated yet
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* VENDOR DISPATCH MODAL */}
            <AnimatePresence>
                {isDispatchModalOpen && selectedOrderForDispatch && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-md overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-xl bg-white border border-gray-200 rounded-[3rem] p-8 lg:p-12 shadow-2xl relative"
                        >
                            <button 
                                onClick={() => {
                                    setIsDispatchModalOpen(false);
                                    setSelectedOrderForDispatch(null);
                                    setTrackingId("");
                                    setCustomCourierPartner("");
                                }}
                                className="absolute top-8 right-8 p-3 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl transition-all"
                            >
                                <X size={18} className="text-gray-600" />
                            </button>

                            <form onSubmit={handleDispatchOrder} className="space-y-6">
                                <div>
                                    <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-1 italic">
                                        Logistics Dispatch
                                    </p>
                                    <h2 className="text-3xl font-black uppercase italic text-gray-955 border-b border-gray-200 pb-4 mb-4">
                                        Shipment Details
                                    </h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">
                                        Submit carrier credentials for order <span className="text-gray-950 font-black">{selectedOrderForDispatch.orderId}</span> to update tracking and notify customer.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Courier Partner *</label>
                                        <select 
                                            value={courierPartner} 
                                            onChange={(e) => setCourierPartner(e.target.value)} 
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic appearance-none text-gray-955"
                                        >
                                            <option value="Delhivery">Delhivery</option>
                                            <option value="BlueDart">BlueDart</option>
                                            <option value="DTDC">DTDC</option>
                                            <option value="DHL">DHL</option>
                                            <option value="Speed Post">Speed Post</option>
                                            <option value="Other">Other Courier Partner</option>
                                        </select>
                                    </div>

                                    {courierPartner === "Other" && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Custom Courier Name *</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={customCourierPartner} 
                                                onChange={(e) => setCustomCourierPartner(e.target.value)} 
                                                className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400" 
                                                placeholder="Enter Courier Carrier Name" 
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tracking ID / AWB Number *</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={trackingId} 
                                            onChange={(e) => setTrackingId(e.target.value)} 
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400" 
                                            placeholder="Enter Tracking Consignment ID" 
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-6 mt-8 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsDispatchModalOpen(false);
                                            setSelectedOrderForDispatch(null);
                                            setTrackingId("");
                                            setCustomCourierPartner("");
                                        }}
                                        className="px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updatingStatus}
                                        className="px-8 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-30 shadow-lg shadow-emerald-500/10"
                                    >
                                        {updatingStatus ? "Processing..." : "Confirm Dispatch"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* COMMISSION BREAKDOWN MODAL */}
            <AnimatePresence>
                {isCommissionModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-md overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-2xl bg-white border border-gray-200 rounded-[3rem] p-8 lg:p-12 shadow-2xl relative"
                        >
                            <button 
                                onClick={() => setIsCommissionModalOpen(false)}
                                className="absolute top-8 right-8 p-3 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl transition-all"
                            >
                                <X size={18} className="text-gray-600" />
                            </button>

                            <div>
                                <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-1 italic">
                                    Procurement Rates
                                </p>
                                <h2 className="text-3xl font-black uppercase italic text-gray-955 border-b border-gray-200 pb-4 mb-6">
                                    Commission Rates
                                </h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-6 leading-relaxed">
                                    Your standard commission rate is <strong className="text-gray-950">{user?.commissionRate || 0}%</strong>. This is set by the admin based on your specialty categories and volume agreement.
                                </p>

                                <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl flex items-start gap-4">
                                    <ShieldCheck className="text-amber-600 shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-wider text-amber-700 mb-1">Contract Agreement</h4>
                                        <p className="text-[9px] text-gray-500 uppercase leading-relaxed font-semibold">
                                            The commission rate is deducted directly from retail sales payouts. Custom custom quotes and high-volume RFQs may be subjected to negotiated terms. Reach out to procurement@boxfox.in for inquiries.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-6 mt-8 flex justify-end">
                                <button
                                    onClick={() => setIsCommissionModalOpen(false)}
                                    className="px-8 py-4 bg-gray-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* AI Assistant */}
            <PortalAIAssistant />
        </div>
    );
}
