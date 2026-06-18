"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft, Package, Truck, CheckCircle2, Clock, User, Mail, Phone,
    MapPin, CreditCard, ExternalLink, Box, Printer, Layers, Download,
    Eye, Maximize2, Ruler, Type, Palette, ZoomIn, RotateCw, Scissors, QrCode, FileText, ShieldAlert, X, Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BoxFacePreview, MiniBox3D, useFaceSnapshot } from "@/app/components/BoxPreview3D";
import { DieCutLayout, OrderQRCode, PrintReadyPDFExport } from "@/app/components/ProductionTools";

export default function OrderDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState("");
    const [savingNotes, setSavingNotes] = useState(false);
    const [expandedFace, setExpandedFace] = useState(null);
    const [downloadingFace, setDownloadingFace] = useState(null);
    const { generate } = useFaceSnapshot();

    const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
    const [dispatchPartner, setDispatchPartner] = useState("");
    const [dispatchTrackingId, setDispatchTrackingId] = useState("");

    useEffect(() => {
        fetch(`/api/orders?id=${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) { setOrder(null); }
                else { 
                    setOrder(data); 
                    setNotes(data.labNotes || ""); 
                    setDispatchPartner(data.deliveryPartner || "");
                    setDispatchTrackingId(data.trackingId || "");
                }
                setLoading(false);
            })
            .catch(err => { console.error(err); setOrder(null); setLoading(false); });
    }, [id]);

    const updateStatus = async (status) => {
        try {
            await fetch("/api/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: order._id, status }) });
            setOrder({ ...order, status });
        } catch (e) { console.error(e); }
    };

    const handleStatusChange = (status) => {
        if (status === "Shipped") {
            setIsDispatchModalOpen(true);
        } else {
            updateStatus(status);
        }
    };

    const confirmDispatch = async () => {
        if (!dispatchPartner.trim() || !dispatchTrackingId.trim()) {
            alert("Please enter both Delivery Partner and Tracking ID to dispatch the order.");
            return;
        }
        try {
            const res = await fetch("/api/orders", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: order._id,
                    status: "Shipped",
                    deliveryPartner: dispatchPartner,
                    trackingId: dispatchTrackingId
                })
            });
            if (res.ok) {
                const updated = await res.json();
                setOrder({ ...order, status: "Shipped", deliveryPartner: dispatchPartner, trackingId: dispatchTrackingId });
                setIsDispatchModalOpen(false);
            } else {
                alert("Failed to update dispatch details.");
            }
        } catch (e) {
            console.error(e);
            alert("Error updating dispatch details.");
        }
    };

    const updateNotes = async () => {
        setSavingNotes(true);
        try {
            await fetch("/api/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: order._id, labNotes: notes }) });
            setOrder({ ...order, labNotes: notes });
        } catch (e) { console.error(e); }
        finally { setSavingNotes(false); }
    };

    // Download accurate face snapshot using canvas
    const handleAccurateDownload = useCallback(async (item, face) => {
        if (!item.customDesign) return;
        setDownloadingFace(face);
        try {
            const cd = item.customDesign;
            const dims = cd.dimensions || { l: 12, w: 8, h: 4 };
            const faceW = ["left", "right"].includes(face) ? dims.w : dims.l;
            const faceH = ["top", "bottom"].includes(face) ? dims.w : dims.h;
            const dataUrl = await generate(
                cd.textures?.[face], cd.textureSettings?.[face],
                faceW, faceH, cd.colors?.[face],
                cd.text, cd.textStyle, cd.textColor, cd.textSettings, face
            );
            const a = document.createElement("a");
            a.href = dataUrl;
            const safeName = (order.customer?.name || order.orderId).toString().replace(/[^a-zA-Z0-9_\-]/g, "_");
            a.download = `${safeName}_${face}_accurate.png`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
        } catch (e) { console.error("Snapshot download error:", e); }
        finally { setDownloadingFace(null); }
    }, [generate, order]);

    // Fallback raw download
    const handleDownload = async (url, face, customName) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = `${(customName || order.orderId).toString().replace(/[^a-zA-Z0-9_\-]/g, "_")}_${face}_raw.png`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) { console.error("Error downloading:", error); window.open(url, "_blank"); }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[600px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-950"></div>
        </div>
    );

    if (!order) return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-black text-gray-950">Order Not Found</h2>
            <button onClick={() => router.back()} className="mt-4 flex items-center gap-2 px-6 py-2 bg-gray-100 rounded-xl mx-auto">
                <ArrowLeft size={16} /> Go Back
            </button>
        </div>
    );

    const statusSteps = [
        { label: "Pending", icon: <Clock size={16} />, color: "text-gray-400" },
        { label: "Processing", icon: <Package size={16} />, color: "text-blue-500" },
        { label: "Shipped", icon: <Truck size={16} />, color: "text-orange-500" },
        { label: "Delivered", icon: <CheckCircle2 size={16} />, color: "text-emerald-500" },
    ];
    const currentStepIdx = statusSteps.findIndex(s => s.label === order.status);

    const FACES = ["front", "back", "top", "bottom", "left", "right"];

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.back()} className="p-4 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-4xl font-black text-gray-950 tracking-tighter uppercase">{order.orderId}</h1>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === "Delivered" ? "bg-emerald-100 text-emerald-600" : order.status === "Cancelled" ? "bg-red-100 text-red-600" : order.status === "Shipped" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-950"}`}>
                                {order.status}
                            </span>
                        </div>
                        <p className="text-gray-400 font-medium tracking-tight">
                            Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {['Pending', 'Processing'].includes(order.status) && (
                        <button 
                            onClick={() => setIsDispatchModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/10"
                        >
                            <Truck size={18} /> Dispatch Order
                        </button>
                    )}
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all">
                        <Printer size={18} /> Print Order
                    </button>
                    <select value={order.status} onChange={e => handleStatusChange(e.target.value)} className="bg-gray-950 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest outline-none cursor-pointer hover:bg-gray-800 transition-all shadow-xl shadow-gray-200">
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Status Tracker */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="relative flex items-center justify-between max-w-4xl mx-auto">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 -z-0"></div>
                    <div className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 -translate-y-1/2 transition-all duration-1000 -z-0" style={{ width: `${(currentStepIdx / (statusSteps.length - 1)) * 100}%` }}></div>
                    {statusSteps.map((step, idx) => (
                        <div key={idx} className="relative z-10 flex flex-col items-center">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${idx <= currentStepIdx ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" : "bg-white border-2 border-gray-100 text-gray-300"}`}>
                                {step.icon}
                            </div>
                            <p className={`mt-4 text-[10px] font-black uppercase tracking-widest ${idx <= currentStepIdx ? "text-gray-950" : "text-gray-300"}`}>{step.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Items & Summary */}
                <div className="xl:col-span-2 space-y-10">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-gray-100">
                            <h2 className="text-xl font-black text-gray-950 uppercase tracking-tighter flex items-center gap-3">
                                <Box className="text-gray-400" /> Order Items
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Product</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Qty</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Unit Price</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(order.items || []).map((item, i) => (
                                        <React.Fragment key={i}>
                                            <tr className="group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden shrink-0">
                                                            <img src={item.image || "https://boxfox.in/wp-content/uploads/2022/11/01-4.jpg"} className="w-full h-full object-cover" alt="" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-gray-950">{item.name}</p>
                                                            {item.variant && <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{item.variant}</p>}
                                                            {item.vendor && (
                                                                <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">
                                                                        Partner: {item.vendor.businessName || item.vendor.name}
                                                                    </span>
                                                                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                                                                        Commission: {item.vendor.commissionRate}%
                                                                    </span>
                                                                    <span className="text-gray-400">
                                                                        (Cut: ₹{((parseFloat(item.price || 0) * (item.quantity || 1)) * (item.vendor.commissionRate / 100)).toFixed(2)} • Net: ₹{((parseFloat(item.price || 0) * (item.quantity || 1)) * (1 - item.vendor.commissionRate / 100)).toFixed(2)})
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-sm font-black text-gray-950 text-center">{item.quantity}</td>
                                                <td className="px-8 py-6 text-sm font-black text-gray-950 text-right">₹{item.price?.toLocaleString("en-IN")}</td>
                                                <td className="px-8 py-6 text-sm font-black text-gray-950 text-right">₹{(item.price * item.quantity).toLocaleString("en-IN")}</td>
                                            </tr>
                                            {/* ===== ADVANCED DESIGN BLUEPRINT ===== */}
                                            {item.customDesign && (
                                                <tr className="bg-gradient-to-br from-emerald-50/30 to-white">
                                                    <td colSpan={4} className="px-8 pb-8 pt-4">
                                                        <CustomDesignBlueprint
                                                            item={item}
                                                            order={order}
                                                            expandedFace={expandedFace}
                                                            setExpandedFace={setExpandedFace}
                                                            downloadingFace={downloadingFace}
                                                            handleAccurateDownload={handleAccurateDownload}
                                                            handleDownload={handleDownload}
                                                        />
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Order Total */}
                        <div className="p-10 bg-gray-50/50 space-y-4">
                            <div className="flex justify-between items-center text-sm font-bold text-gray-500"><span>Subtotal</span><span>₹{order.total?.toLocaleString("en-IN")}</span></div>
                            <div className="flex justify-between items-center text-sm font-bold text-gray-500"><span>Shipping (Flat Rate)</span><span>₹0.00</span></div>
                            <div className="flex justify-between items-center text-sm font-bold text-gray-500"><span>GST (18%)</span><span>Included</span></div>
                            <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                                <span className="text-lg font-black text-gray-950 uppercase tracking-tighter">Grand Total</span>
                                <span className="text-2xl font-black text-emerald-500">₹{order.total?.toLocaleString("en-IN")}</span>
                            </div>
                        </div>
                    </div>

                    {/* Lab Notes */}
                    <div className="bg-gray-950 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-32 translate-x-32"></div>
                        <h3 className="text-xl font-black tracking-tight mb-8">Internal Lab Notes</h3>
                        <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none min-h-[150px]" placeholder="Add notes for production lab..." value={notes} onChange={e => setNotes(e.target.value)}></textarea>
                        <button onClick={updateNotes} disabled={savingNotes} className="mt-6 px-10 py-4 bg-white text-gray-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50">
                            {savingNotes ? "Saving..." : "Save Note"}
                        </button>
                    </div>
                </div>

                {/* Customer Info Sidebar */}
                <div className="space-y-10">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                        <h3 className="text-sm font-black text-gray-950 uppercase tracking-widest border-b border-gray-100 pb-4 flex items-center gap-2"><User size={16} className="text-gray-400" /> Customer Profile</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-xl font-black text-gray-400">{order.customer?.name?.charAt(0)}</div>
                            <div><p className="text-lg font-black text-gray-950 leading-none">{order.customer?.name}</p><p className="text-[10px] font-bold text-gray-400 uppercase mt-1">B2B Account</p></div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 group cursor-pointer">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-all"><Mail size={16} /></div>
                                <div className="flex-1 overflow-hidden"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</p><p className="text-sm font-bold text-gray-950 truncate">{order.customer?.email}</p></div>
                            </div>
                            <div className="flex items-center gap-4 group cursor-pointer">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-all"><Phone size={16} /></div>
                                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone</p><p className="text-sm font-bold text-gray-950">{order.customer?.phone || "+91 91234 56789"}</p></div>
                            </div>
                        </div>
                        <button onClick={() => { if (order.userId || order.customer?.email) router.push(`/admin/customers?search=${order.customer?.email || ""}`); else alert("Guest checkout - no profile available."); }} className="w-full py-4 bg-gray-50 text-gray-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                            View Customer History <ExternalLink size={12} />
                        </button>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                        <h3 className="text-sm font-black text-gray-950 uppercase tracking-widest border-b border-gray-100 pb-4 flex items-center gap-2"><MapPin size={16} className="text-gray-400" /> Shipping Detail</h3>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-gray-950">{order.shipping?.address || "No address provided"}</p>
                            {order.shipping?.city && <p className="text-sm font-bold text-gray-600">{order.shipping.city}, {order.shipping.state} {order.shipping.zipCode || order.shipping.pincode}</p>}
                            {order.shipping?.country && <p className="text-xs font-bold text-gray-400 uppercase">{order.shipping.country}</p>}
                        </div>
                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-2"><Truck size={12} /> Shipping Method</p>
                            <p className="text-sm font-black text-blue-900">Standard Freight (3-5 Days)</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                        <h3 className="text-sm font-black text-gray-950 uppercase tracking-widest border-b border-gray-100 pb-4 flex items-center gap-2"><Truck size={16} className="text-gray-400" /> Logistics & Dispatch</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[9px] text-gray-400 uppercase font-black tracking-wider mb-1">Delivery Partner</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Delhivery, BlueDart"
                                    defaultValue={order.deliveryPartner || ""}
                                    onBlur={async (e) => {
                                        const val = e.target.value;
                                        await fetch("/api/orders", {
                                            method: "PATCH",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ id: order._id, deliveryPartner: val })
                                        });
                                        setOrder({ ...order, deliveryPartner: val });
                                    }}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-205 rounded-xl outline-none text-xs text-gray-950 font-bold focus:border-emerald-500 focus:bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] text-gray-400 uppercase font-black tracking-wider mb-1">Tracking ID</label>
                                <input
                                    type="text"
                                    placeholder="Enter Tracking ID"
                                    defaultValue={order.trackingId || ""}
                                    onBlur={async (e) => {
                                        const val = e.target.value;
                                        await fetch("/api/orders", {
                                            method: "PATCH",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ id: order._id, trackingId: val })
                                        });
                                        setOrder({ ...order, trackingId: val });
                                    }}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-205 rounded-xl outline-none text-xs text-gray-950 font-bold focus:border-emerald-500 focus:bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {order.billingDetails?.isB2b && (
                        <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm space-y-8">
                            <h3 className="text-sm font-black text-emerald-950 uppercase tracking-widest border-b border-emerald-100 pb-4 flex items-center gap-2"><FileText size={16} className="text-emerald-500" /> B2B Billing</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Company Name</p>
                                    <p className="text-sm font-black text-emerald-950">{order.billingDetails.companyName}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">GSTIN</p>
                                    <p className="text-sm font-black text-emerald-950 bg-white px-4 py-2 rounded-xl inline-block border border-emerald-100 select-all">{order.billingDetails.gstNumber}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <h3 className="text-sm font-black text-gray-950 uppercase tracking-widest flex items-center gap-2">
                                <CreditCard size={16} className="text-gray-400" /> Payment Protocol
                            </h3>
                            <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${order.paid ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600 animate-pulse'}`}>
                                {order.paid ? 'Authorized' : 'Pending Verification'}
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${order.paid ? 'bg-emerald-500 text-white' : 'bg-gray-950 text-white'}`}>
                                        {order.paid ? <CheckCircle2 size={24} /> : <QrCode size={24} />}
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-gray-950 leading-none">{order.paymentDetails?.method || 'Manual/UPI'}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-widest">Digital Terminal</p>
                                    </div>
                                </div>
                                {!order.paid && (
                                    <button
                                        onClick={async () => {
                                            if (confirm("Confirm payment receipt? This will mark the order as PAID and notify the customer.")) {
                                                await fetch("/api/orders", {
                                                    method: "PATCH",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({
                                                        id: order._id,
                                                        paid: true,
                                                        status: 'Processing',
                                                        paymentDetails: order.paymentDetails // Ensure we persist existing details
                                                    })
                                                });
                                                setOrder({ ...order, paid: true, status: 'Processing' });
                                            }
                                        }}
                                        className="px-6 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-950 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                                    >
                                        AUTHORIZE
                                    </button>
                                )}
                            </div>

                            {order.paymentDetails?.transactionId ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-emerald-500 transition-colors">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Transaction ID</p>
                                            <p className="text-sm font-black text-gray-950 break-all select-all cursor-copy" title="Click to copy">{order.paymentDetails.transactionId}</p>
                                        </div>
                                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-emerald-500 transition-colors">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Bank Name</p>
                                            <p className="text-sm font-black text-gray-950 select-all cursor-copy" title="Click to copy">{order.paymentDetails.senderName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between px-4">
                                        {order.paymentDetails.submittedAt && (
                                            <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase">
                                                <Clock size={10} />
                                                <span>Received: {new Date(order.paymentDetails.submittedAt).toLocaleString('en-IN')}</span>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => {
                                                const txnId = prompt("Update Transaction ID:", order.paymentDetails.transactionId);
                                                const sName = prompt("Update Bank Name:", order.paymentDetails.senderName);
                                                if (txnId && sName) {
                                                    const updatedDetails = { ...order.paymentDetails, transactionId: txnId, senderName: sName };
                                                    fetch("/api/orders", {
                                                        method: "PATCH",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({ id: order._id, paymentDetails: updatedDetails })
                                                    });
                                                    setOrder({ ...order, paymentDetails: updatedDetails });
                                                }
                                            }}
                                            className="text-[8px] font-black text-emerald-600 hover:text-gray-950 uppercase tracking-widest"
                                        >
                                            [ REPAIR_MANIFEST ]
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex flex-col items-center text-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-amber-200/50 flex items-center justify-center text-amber-600">
                                            <ShieldAlert size={20} />
                                        </div>
                                        <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest leading-relaxed">
                                            Manifest Data Missing.<br />
                                            <span className="text-amber-600/60 font-bold">This is a legacy order or bypass detected.</span>
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const txnId = prompt("Enter Transaction ID:");
                                            const sName = prompt("Enter Bank Name:");
                                            if (txnId && sName) {
                                                const details = { transactionId: txnId, senderName: sName, method: 'Manual/Correction', submittedAt: new Date() };
                                                fetch("/api/orders", {
                                                    method: "PATCH",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ id: order._id, paymentDetails: details })
                                                });
                                                setOrder({ ...order, paymentDetails: details });
                                            }
                                        }}
                                        className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] hover:border-emerald-500 hover:text-emerald-600 transition-all"
                                    >
                                        Initialize Manual Manifest Recovery
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Unified Dispatch Order Modal */}
            <AnimatePresence>
                {isDispatchModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-md overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-white border border-gray-200 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl relative text-gray-950"
                        >
                            <button 
                                onClick={() => setIsDispatchModalOpen(false)}
                                className="absolute top-6 right-6 p-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl transition-all"
                            >
                                <X size={16} className="text-gray-600" />
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
                                    <Truck size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-tight text-gray-950">Dispatch Shipment</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Order Reference: {order.orderId}</p>
                                </div>
                            </div>

                            <div className="space-y-5 text-xs font-bold uppercase tracking-wider text-gray-700">
                                <div>
                                    <label className="block text-[9px] text-gray-400 uppercase font-black tracking-wider mb-2">Delivery Partner *</label>
                                    <select
                                        value={dispatchPartner}
                                        onChange={(e) => setDispatchPartner(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-250 rounded-xl outline-none focus:border-emerald-500 text-gray-955 text-xs font-bold"
                                    >
                                        <option value="">Select Courier Partner</option>
                                        <option value="Delhivery">Delhivery</option>
                                        <option value="Blue Dart">Blue Dart</option>
                                        <option value="DTDC">DTDC</option>
                                        <option value="FedEx">FedEx</option>
                                        <option value="DHL">DHL</option>
                                        <option value="Standard Freight">Standard Freight</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Or type custom partner..."
                                        value={dispatchPartner}
                                        onChange={(e) => setDispatchPartner(e.target.value)}
                                        className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-gray-955 text-xs font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[9px] text-gray-400 uppercase font-black tracking-wider mb-2">Tracking ID *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. TRK123456789"
                                        value={dispatchTrackingId}
                                        onChange={(e) => setDispatchTrackingId(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-gray-955 text-xs font-bold"
                                    />
                                </div>

                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-2.5">
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <p className="text-[9px] text-gray-500 normal-case leading-relaxed font-semibold">
                                        Confirming dispatch will automatically update the order status to <strong>Shipped</strong> and email the customer their tracking code.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsDispatchModalOpen(false)}
                                        className="flex-1 py-3 bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={confirmDispatch}
                                        className="flex-1 py-3 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-500/20"
                                    >
                                        Confirm Dispatch
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ============================================================================
// CUSTOM DESIGN BLUEPRINT - Pixel-perfect face rendering
// ============================================================================
function CustomDesignBlueprint({ item, order, expandedFace, setExpandedFace, downloadingFace, handleAccurateDownload, handleDownload }) {
    const cd = item.customDesign;
    const dims = cd.dimensions || { l: 12, w: 8, h: 4 };
    const FACES = ["front", "back", "top", "bottom", "left", "right"];
    const [activeToolTab, setActiveToolTab] = useState(null); // 'diecut' | 'qr' | 'pdf'
    const [productDetails, setProductDetails] = useState(null);

    useEffect(() => {
        if (item.productId) {
            fetch(`/api/products/${item.productId}`)
                .then(res => res.json())
                .then(data => {
                    if (!data.error) setProductDetails(data);
                })
                .catch(console.error);
        }
    }, [item.productId]);

    const getFaceDims = (face) => {
        const w = ["left", "right"].includes(face) ? dims.w : dims.l;
        const h = ["top", "bottom"].includes(face) ? dims.w : dims.h;
        return { w, h };
    };

    return (
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
            {/* Blueprint Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-gray-950 to-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Layers size={14} className="text-emerald-400" />
                    </div>
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Design Blueprint</h4>
                        <p className="text-[9px] font-bold text-gray-500 mt-0.5">Pixel-Accurate Face Rendering • {dims.l}×{dims.w}×{dims.h} {cd.unit || "in"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                            Accurate Preview
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* 3D Preview + Face Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Interactive 3D Box */}
                    <div className="bg-gradient-to-br from-gray-50 via-white to-emerald-50/20 rounded-2xl border border-gray-100 p-4 flex flex-col items-center justify-center min-h-[220px]">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                            <RotateCw size={10} className="text-emerald-500" /> Interactive 3D Preview • Drag to Rotate
                        </p>
                        <MiniBox3D customDesign={cd} size={160} />
                    </div>

                    {/* Specs & Formulation */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                                    <Ruler size={10} /> Specifications
                                </p>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: "Length", value: dims.l },
                                        { label: "Width", value: dims.w },
                                        { label: "Height", value: dims.h },
                                    ].map(d => (
                                        <div key={d.label} className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{d.label}</p>
                                            <p className="text-lg font-black text-gray-950">{d.value}<span className="text-[9px] text-gray-400 ml-0.5">{cd.unit || "in"}</span></p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100">
                                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                                    <Layers size={10} /> Product Formulation
                                </p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    <div className="space-y-0.5">
                                        <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">GSM</p>
                                        <p className="text-[10px] font-black text-gray-950 uppercase">{cd.selectedGSM || "300 GSM"}</p>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Material</p>
                                        <p className="text-[10px] font-black text-gray-950 uppercase">{cd.selectedMaterial || "SBS"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {cd.text && (
                            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-100">
                                <p className="text-[9px] font-black text-violet-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><Type size={10} /> Custom Text</p>
                                <p className="text-sm font-black text-gray-950">"{cd.text}"</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-[9px] font-bold text-gray-500">Style: <strong className="text-gray-800">{cd.textStyle}</strong></span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-bold text-gray-500">Color:</span>
                                        <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: cd.textColor }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Per-Face Accurate Previews */}
                <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                        <Eye size={10} className="text-emerald-500" /> Per-Face Accurate Preview — Exactly As Printed
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                        {FACES.map(face => {
                            const fd = getFaceDims(face);
                            const hasTexture = !!cd.textures?.[face];
                            const isExpanded = expandedFace === face;
                            return (
                                <div key={face} className="space-y-2">
                                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] text-center flex items-center justify-center gap-1">
                                        {face}
                                        <span className="text-gray-300">({fd.w}×{fd.h})</span>
                                    </p>
                                    <div className="relative group">
                                        {/* Aspect-ratio container */}
                                        <div style={{ paddingBottom: `${(fd.h / fd.w) * 100}%`, position: "relative" }}>
                                            <div style={{ position: "absolute", inset: 0, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(0,0,0,0.06)" }}>
                                                <BoxFacePreview
                                                    face={face}
                                                    textures={cd.textures}
                                                    textureSettings={cd.textureSettings}
                                                    colors={cd.colors}
                                                    text={cd.text}
                                                    textStyle={cd.textStyle}
                                                    textColor={cd.textColor}
                                                    textSettings={cd.textSettings}
                                                    width="100%"
                                                    height="100%"
                                                />
                                            </div>
                                        </div>
                                        {/* Hover Actions */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                            {hasTexture && (
                                                <>
                                                    <button
                                                        onClick={() => setExpandedFace(isExpanded ? null : face)}
                                                        className="p-2 bg-white/90 rounded-lg hover:bg-white transition-all shadow-lg"
                                                        title="Expand"
                                                    >
                                                        <Maximize2 size={12} className="text-gray-800" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAccurateDownload(item, face)}
                                                        disabled={downloadingFace === face}
                                                        className="p-2 bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-all shadow-lg disabled:opacity-50"
                                                        title="Download Accurate Snapshot"
                                                    >
                                                        {downloadingFace === face
                                                            ? <RotateCw size={12} className="text-white animate-spin" />
                                                            : <Download size={12} className="text-white" />
                                                        }
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        {/* Color indicator */}
                                        <div title={`Base: ${cd.colors?.[face] || "#059669"}`} className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10" style={{ backgroundColor: cd.colors?.[face] || "#059669" }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Expanded Face Modal */}
                <AnimatePresence>
                    {expandedFace && cd.textures?.[expandedFace] && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6 overflow-hidden"
                        >
                            <div className="bg-gray-950 rounded-2xl p-6 relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <ZoomIn size={14} className="text-emerald-400" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{expandedFace} Face — Full Preview</span>
                                        <span className="text-[9px] font-bold text-gray-500">({getFaceDims(expandedFace).w}×{getFaceDims(expandedFace).h} {cd.unit || "in"})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleAccurateDownload(item, expandedFace)}
                                            disabled={downloadingFace === expandedFace}
                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-50"
                                        >
                                            <Download size={12} /> {downloadingFace === expandedFace ? "Generating..." : "Accurate Download"}
                                        </button>
                                        {cd.textures[expandedFace] && (
                                            <button
                                                onClick={() => handleDownload(cd.textures[expandedFace], expandedFace, order.customer?.name || order.orderId)}
                                                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                                            >
                                                <Download size={12} /> Raw Source
                                            </button>
                                        )}
                                        <button onClick={() => setExpandedFace(null)} className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all">✕</button>
                                    </div>
                                </div>
                                <div style={{ paddingBottom: `${(getFaceDims(expandedFace).h / getFaceDims(expandedFace).w) * 100}%`, position: "relative" }} className="rounded-xl overflow-hidden">
                                    <div style={{ position: "absolute", inset: 0 }}>
                                        <BoxFacePreview
                                            face={expandedFace}
                                            textures={cd.textures}
                                            textureSettings={cd.textureSettings}
                                            colors={cd.colors}
                                            text={cd.text}
                                            textStyle={cd.textStyle}
                                            textColor={cd.textColor}
                                            textSettings={cd.textSettings}
                                            width="100%"
                                            height="100%"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ===== PRODUCTION TOOLS ===== */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                        <Printer size={10} className="text-violet-500" /> Production Tools
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {[
                            { key: 'diecut', label: 'Die-Cut Layout', icon: <Scissors size={12} />, color: 'text-orange-600 bg-orange-50 border-orange-200' },
                            { key: 'qr', label: 'QR Code', icon: <QrCode size={12} />, color: 'text-blue-600 bg-blue-50 border-blue-200' },
                            { key: 'pdf', label: 'Print-Ready PDF', icon: <FileText size={12} />, color: 'text-violet-600 bg-violet-50 border-violet-200' },
                        ].map(tool => (
                            <button
                                key={tool.key}
                                onClick={() => setActiveToolTab(activeToolTab === tool.key ? null : tool.key)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${activeToolTab === tool.key
                                    ? tool.color + ' shadow-sm'
                                    : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
                                    }`}
                            >
                                {tool.icon} {tool.label}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {activeToolTab === 'diecut' && (
                            <motion.div key="diecut" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Scissors size={14} className="text-orange-500" />
                                        <span className="text-[10px] font-black text-gray-800 uppercase tracking-[0.2em]">Flat Die-Cut Template</span>
                                        <span className="text-[9px] font-bold text-gray-400 ml-auto">Cross-shaped dieline with fold lines, cut lines & glue tabs</span>
                                    </div>
                                    <DieCutLayout customDesign={cd} orderId={order.orderId} size={500} />
                                </div>
                            </motion.div>
                        )}

                        {activeToolTab === 'qr' && (
                            <motion.div key="qr" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 flex flex-col items-center">
                                    <div className="flex items-center gap-2 mb-4">
                                        <QrCode size={14} className="text-blue-500" />
                                        <span className="text-[10px] font-black text-gray-800 uppercase tracking-[0.2em]">Order Tracking QR Code</span>
                                    </div>
                                    <p className="text-[9px] font-bold text-gray-400 mb-4 text-center">Scan to open this order directly · Print and attach to production box</p>
                                    <OrderQRCode orderId={order.orderId || order._id} size={160} />
                                </div>
                            </motion.div>
                        )}

                        {activeToolTab === 'pdf' && (
                            <motion.div key="pdf" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-100 p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <FileText size={14} className="text-violet-500" />
                                        <span className="text-[10px] font-black text-gray-800 uppercase tracking-[0.2em]">Print-Ready PDF Export</span>
                                    </div>
                                    <p className="text-[9px] font-bold text-gray-500 mb-4">Generates a multi-page A4 PDF with: title page, production specs, color swatches, and each face rendered with crop marks, bleed area ({3}mm), and color info.</p>
                                    <PrintReadyPDFExport customDesign={cd} orderId={order.orderId} orderData={order} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ===== INTERNAL PRODUCTION ASSETS (ADMIN ONLY) ===== */}
                <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pattern Asset */}
                    <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Internal Pattern Overlay (Admin Only)</label>
                            <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full uppercase tracking-widest">Order Processing Only</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic mb-4">
                            The following pattern image is for internal use by the admin team and will be attached to customer orders for reproduction purposes. It is not publicly visible on the main catalog.
                        </p>

                        {productDetails?.patternImg ? (
                            <div className="mt-auto space-y-4">
                                <div className="relative aspect-video rounded-2xl border border-gray-200 overflow-hidden group flex items-center justify-center bg-white shadow-sm">
                                    {productDetails.patternFormat === 'pdf' || (typeof productDetails.patternImg === 'string' && productDetails.patternImg.toLowerCase().endsWith('.pdf')) ? (
                                        <div className="flex flex-col items-center justify-center text-red-500 scale-125">
                                            <FileText size={48} strokeWidth={2.5} />
                                            <span className="text-[10px] font-black uppercase mt-2">PDF DOC</span>
                                        </div>
                                    ) : (
                                        <img src={productDetails.patternImg} className="w-full h-full object-cover" alt="Pattern" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => window.open(productDetails.patternImg, "_blank")}
                                            className="p-3 bg-white rounded-full text-gray-950 hover:scale-110 transition-all shadow-xl"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDownload(productDetails.patternImg, "pattern", order.orderId)}
                                            className="p-3 bg-emerald-500 rounded-full text-white hover:scale-110 transition-all shadow-xl"
                                        >
                                            <Download size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <ImageIcon size={18} className="text-emerald-500" />
                                        <span className="text-[10px] font-black text-gray-950 uppercase tracking-widest">Master Pattern</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase">Default Lab Asset</span>
                                </div>
                            </div>
                        ) : (
                            <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl mt-auto">
                                <ImageIcon size={24} className="text-gray-300 mb-2" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase">No Master Pattern Linked</span>
                            </div>
                        )}
                    </div>

                    {/* Dieline Asset */}
                    <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Dieline (Admin Only)</label>
                            <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-full uppercase tracking-widest">Admin Reference</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic mb-4">
                            Upload the dieline file for this product. This is strictly for admin reference and internal use.
                        </p>

                        {productDetails?.dielineImg ? (
                            <div className="mt-auto space-y-4">
                                <div className="relative aspect-video rounded-2xl border border-gray-200 overflow-hidden group flex items-center justify-center bg-white shadow-sm">
                                    {productDetails.dielineFormat === 'pdf' || (typeof productDetails.dielineImg === 'string' && productDetails.dielineImg.toLowerCase().endsWith('.pdf')) ? (
                                        <div className="flex flex-col items-center justify-center text-red-500 scale-125">
                                            <FileText size={48} strokeWidth={2.5} />
                                            <span className="text-[10px] font-black uppercase mt-2">PDF DOC</span>
                                        </div>
                                    ) : (
                                        <img src={productDetails.dielineImg} className="w-full h-full object-cover" alt="Dieline" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => window.open(productDetails.dielineImg, "_blank")}
                                            className="p-3 bg-white rounded-full text-gray-950 hover:scale-110 transition-all shadow-xl"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDownload(productDetails.dielineImg, "dieline", order.orderId)}
                                            className="p-3 bg-blue-500 rounded-full text-white hover:scale-110 transition-all shadow-xl"
                                        >
                                            <Download size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Scissors size={18} className="text-blue-500" />
                                        <span className="text-[10px] font-black text-gray-950 uppercase tracking-widest">Production Dieline</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase">Master Copy</span>
                                </div>
                            </div>
                        ) : (
                            <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl mt-auto">
                                <Scissors size={24} className="text-gray-300 mb-2" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase">No Dieline Linked</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

    );
}
