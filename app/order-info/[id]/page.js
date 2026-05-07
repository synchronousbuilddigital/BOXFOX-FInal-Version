"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Package, User, MapPin, Box, Type, Ruler, Palette, Phone, Mail, Calendar, Hash, Layers } from "lucide-react";

export default function OrderInfoPage() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`/api/orders?id=${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) setError("Order not found");
                else setOrder(data);
                setLoading(false);
            })
            .catch(() => { setError("Failed to load order"); setLoading(false); });
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Order...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-6">
                <div className="text-center space-y-3 max-w-sm">
                    <Package size={32} className="text-gray-300 mx-auto" />
                    <h1 className="text-xl font-black text-gray-950 uppercase tracking-tight">Order Not Found</h1>
                    <p className="text-sm text-gray-400 font-medium">The order ID "{id}" could not be found.</p>
                </div>
            </div>
        );
    }

    const FACES = ["front", "back", "top", "bottom", "left", "right"];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gray-950 text-white px-6 py-5">
                <div className="max-w-lg mx-auto flex items-center justify-between">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">BoxFox Production</p>
                        <h1 className="text-lg font-black tracking-tight">#{order.orderId}</h1>
                    </div>
                    <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${order.status === "Delivered" ? "bg-emerald-500/20 text-emerald-400" :
                                order.status === "Shipped" ? "bg-blue-500/20 text-blue-400" :
                                    order.status === "Cancelled" ? "bg-red-500/20 text-red-400" :
                                        "bg-white/10 text-gray-300"
                            }`}>
                            {order.status}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-6 py-6 space-y-5">

                {/* Customer Info */}
                <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-gray-50 pb-3">
                        <User size={12} className="text-emerald-500" /> Customer
                    </h2>
                    <div className="space-y-3">
                        <InfoRow icon={<User size={13} />} label="Name" value={order.customer?.name || "—"} />
                        <InfoRow icon={<Phone size={13} />} label="Phone" value={order.customer?.phone || "—"} />
                        <InfoRow icon={<Mail size={13} />} label="Email" value={order.customer?.email || "—"} />
                    </div>
                </section>

                {/* Shipping Address */}
                <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-gray-50 pb-3">
                        <MapPin size={12} className="text-blue-500" /> Shipping Address
                    </h2>
                    <div className="text-sm font-medium text-gray-800 leading-relaxed">
                        {order.shipping?.address && <p>{order.shipping.address}</p>}
                        {order.shipping?.city && (
                            <p>{order.shipping.city}{order.shipping.state ? `, ${order.shipping.state}` : ""} {order.shipping.zipCode || order.shipping.pincode || ""}</p>
                        )}
                        {order.shipping?.country && <p className="text-gray-500">{order.shipping.country}</p>}
                        {!order.shipping?.address && !order.shipping?.city && <p className="text-gray-400 italic">No address provided</p>}
                    </div>
                </section>

                {/* Order Items & Design Info */}
                {order.items?.map((item, i) => (
                    <section key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3 border-b border-gray-50 pb-3">
                            <div className="w-10 h-10 rounded-lg border border-gray-100 p-1 flex items-center justify-center bg-gray-50 shrink-0">
                                <img 
                                    src={item.customDesign?.textures?.front || item.customDesign?.textures?.top || Object.values(item.customDesign?.textures || {}).find(v => v) || item.image || item.img || '/BOXFOX-1.png'} 
                                    className="w-full h-full object-contain" 
                                    alt="" 
                                />
                            </div>
                            <div>
                                <span className="block text-emerald-600 mb-0.5">{item.customDesign ? "Custom Box" : "Standard Product"}</span>
                                <span className="text-gray-950 tracking-tighter">Sequence Node {i + 1}</span>
                            </div>
                        </h2>

                        <InfoRow icon={<Package size={13} />} label="Product" value={item.name} />
                        <InfoRow icon={<Hash size={13} />} label="Quantity" value={item.quantity} />
                        <InfoRow icon={<Hash size={13} />} label="Price" value={`₹${(item.price * item.quantity).toLocaleString("en-IN")}`} />

                        {item.customDesign && (() => {
                            const cd = item.customDesign;
                            const dims = cd.dimensions || {};
                            return (
                                <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-1.5">
                                        <Layers size={10} /> Design Details
                                    </p>

                                    {/* Dimensions */}
                                    {dims.l && (
                                        <InfoRow icon={<Ruler size={13} />} label="Dimensions" value={`${dims.l} × ${dims.w} × ${dims.h} ${cd.unit || "in"} (L×W×H)`} />
                                    )}

                                    {/* Box Type from product name */}
                                    <InfoRow icon={<Box size={13} />} label="Box Type" value={item.name || "Custom Box"} />

                                    {/* Custom Text */}
                                    {cd.text && (
                                        <>
                                            <InfoRow icon={<Type size={13} />} label="Custom Text" value={`"${cd.text}"`} />
                                            <InfoRow icon={<Palette size={13} />} label="Text Style" value={`${cd.textStyle || "—"}, ${cd.textColor || "—"}`} />
                                        </>
                                    )}

                                    {/* Face Colors */}
                                    {cd.colors && (
                                        <div className="space-y-1.5">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-7">Face Colors</p>
                                            <div className="grid grid-cols-2 gap-1.5 ml-7">
                                                {FACES.map(face => {
                                                    const color = cd.colors?.[face];
                                                    if (!color) return null;
                                                    return (
                                                        <div key={face} className="flex items-center gap-2">
                                                            <div className="w-3.5 h-3.5 rounded-sm border border-gray-200 shrink-0" style={{ backgroundColor: color }}></div>
                                                            <span className="text-xs font-bold text-gray-700 capitalize">{face}</span>
                                                            <span className="text-[10px] font-mono text-gray-400">{color}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Textures */}
                                    {cd.textures && (
                                        <div className="space-y-1.5">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-7">Applied Textures</p>
                                            <div className="ml-7 space-y-1">
                                                {FACES.map(face => {
                                                    if (!cd.textures[face]) return null;
                                                    const s = cd.textureSettings?.[face] || {};
                                                    return (
                                                        <div key={face} className="flex items-center gap-2 text-xs">
                                                            <span className="font-bold text-gray-700 capitalize w-14">{face}</span>
                                                            <span className="text-gray-400 italic">Scale: {s.scale || 100}%</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Product Formulation */}
                                    <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-1.5">
                                            <Layers size={10} /> Product Formulation
                                        </p>
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-4 ml-7">
                                            <div className="space-y-0.5">
                                                <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Select GSM</p>
                                                <p className="text-[11px] font-black text-gray-950 uppercase">{cd.selectedGSM || "350 GSM"}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Select Material</p>
                                                <p className="text-[11px] font-black text-gray-950 uppercase">{cd.selectedMaterial || "SBS"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </section>
                ))}

                {/* Order Summary */}
                <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-gray-50 pb-3">
                        <Calendar size={12} className="text-violet-500" /> Order Summary
                    </h2>
                    <InfoRow icon={<Hash size={13} />} label="Order ID" value={order.orderId} />
                    <InfoRow icon={<Calendar size={13} />} label="Date" value={new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })} />
                    <InfoRow icon={<Package size={13} />} label="Status" value={order.status} />
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Total</span>
                        <span className="ml-auto text-lg font-black text-gray-950">₹{order.total?.toLocaleString("en-IN")}</span>
                    </div>
                </section>

                {/* Footer */}
                <div className="text-center py-4">
                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.3em]">BoxFox Production — Internal Use Only</p>
                </div>
            </div>
        </div>
    );
}

// Reusable info row
function InfoRow({ icon, label, value }) {
    return (
        <div className="flex items-start gap-2.5">
            <div className="text-gray-300 mt-0.5 shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-none mb-0.5">{label}</span>
                <span className="text-sm font-semibold text-gray-800 break-words">{value}</span>
            </div>
        </div>
    );
}
