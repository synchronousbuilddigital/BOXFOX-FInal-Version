"use client";
import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Settings, Search, Package, MapPin, Phone, Mail, Lock, Heart, Trash2, ChevronRight, RotateCw, Layers, Ruler, Type, Palette, Eye, RefreshCw, Box, Share2, Link2, Copy, Check, Pencil, Sparkles, Plus, Upload, Shield, FileText, ExternalLink, Download, X } from "lucide-react";
import Navbar from "../components/Navbar";
import { useToast } from "@/app/context/ToastContext";
import { useSearchParams } from "next/navigation";
import { BoxFacePreview, MiniBox3D } from "@/app/components/BoxPreview3D";

const QUOTE_PHASES = ['requested', 'assigned', 'fulfilled'];

function getClientQuoteStatus(status, assignedVendor) {
    if (status === 'cancelled') return 'cancelled';
    if (status === 'fulfilled' || status === 'completed') return 'fulfilled';
    if (status === 'assigned' || status === 'allotted' || status === 'in-progress' || assignedVendor) return 'assigned';
    return 'requested';
}

function getQuoteBadgeClasses(status) {
    switch (status) {
        case 'assigned': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'fulfilled': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
}

function AccountManagementContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || "dashboard"); // dashboard, orders, addresses, details, security, wishlist
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [wishlist, setWishlist] = useState([]);
    const [savedDesigns, setSavedDesigns] = useState([]);
    const [copiedDesignId, setCopiedDesignId] = useState(null);
    const [pwdData, setPwdData] = useState({ current: "", new: "", confirm: "" });
    const [isRenaming, setIsRenaming] = useState(null); // ID of image being renamed
    const [newName, setNewName] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [orderSearch, setOrderSearch] = useState("");
    const [quotes, setQuotes] = useState([]);
    const [quoteSearch, setQuoteSearch] = useState("");
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [message, setMessage] = useState("");

    // Missing state from previous version
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [address, setAddress] = useState("");
    const [shippingAddress, setShippingAddress] = useState({
        street: "",
        apartment: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India"
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch("/api/auth/me");
                const data = await res.json();
                if (res.ok && data.user) {
                    setUser(data.user);
                    setName(data.user.name || "");
                    setPhone(data.user.phone || "");
                    setBusinessName(data.user.businessName || "");
                    setAddress(data.user.address || "");
                    if (data.user.shippingAddress) {
                        setShippingAddress({
                            street: data.user.shippingAddress.street || "",
                            apartment: data.user.shippingAddress.apartment || "",
                            city: data.user.shippingAddress.city || "",
                            state: data.user.shippingAddress.state || "",
                            zipCode: data.user.shippingAddress.zipCode || "",
                            country: data.user.shippingAddress.country || "India"
                        });
                    }

                    // Fetch orders
                    const ordersRes = await fetch("/api/orders/user");
                    if (ordersRes.ok) {
                        const ordersData = await ordersRes.json();
                        setOrders(ordersData.orders || []);
                    }

                    // Fetch wishlist
                    const wishlistRes = await fetch("/api/wishlist");
                    if (wishlistRes.ok) {
                        const wishlistData = await wishlistRes.json();
                        setWishlist(wishlistData.wishlist || []);
                    }

                    // Fetch saved designs
                    const designsRes = await fetch("/api/designs");
                    if (designsRes.ok) {
                        const designsData = await designsRes.json();
                        setSavedDesigns(designsData.designs || []);
                    }

                    // Fetch quotes
                    const quotesRes = await fetch("/api/quotes", { cache: "no-store" });
                    if (quotesRes.ok) {
                        const quotesData = await quotesRes.json();
                        setQuotes(quotesData.quotes || []);
                    }

                } else {
                    router.push("/login");
                }
            } catch (err) {
                console.error("Auth error:", err);
                router.push("/login");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
        } catch (err) {
            console.error("Logout error:", err);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        if (phone && phone.length !== 10) {
            setErrorMsg("Please provide a valid 10-digit phone number");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, businessName, address, shippingAddress }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setUser(data.user);
            setSuccessMsg("Profile updated successfully!");
            setIsEditing(false);
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!message.trim() || !selectedQuote) return;
        try {
            const res = await fetch("/api/quotes/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quoteId: selectedQuote._id, text: message })
            });
            if (res.ok) {
                setMessage("");
                // Refresh quotes to show new message
                const quotesRes = await fetch("/api/quotes", { cache: "no-store" });
                if (quotesRes.ok) {
                    const quotesData = await quotesRes.json();
                    const refreshedQuotes = quotesData.quotes || [];
                    setQuotes(refreshedQuotes);
                    // Update selected quote view
                    const updated = refreshedQuotes.find(q => q._id === selectedQuote._id);
                    if (updated) setSelectedQuote(updated);
                }
            }
        } catch (err) { console.error(err); }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        if (pwdData.new !== pwdData.confirm) {
            setErrorMsg("Passwords do not match");
            return;
        }

        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword: pwdData.current, newPassword: pwdData.new }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSuccessMsg("Password updated successfully!");
            setPwdData({ current: "", new: "", confirm: "" });
        } catch (err) {
            setErrorMsg(err.message);
        }
    };


    const handleReorder = (item) => {
        if (!item.customDesign) {
            router.push('/customize');
            return;
        }
        // Encode design data into URL params for the customize page to pick up
        const cd = item.customDesign;
        const dims = cd.dimensions || { l: 12, w: 8, h: 4 };
        const params = new URLSearchParams({
            length: dims.l,
            width: dims.w,
            height: dims.h,
            unit: cd.unit || 'in',
            reorder: 'true',
            name: item.name || 'Reordered Design'
        });
        // Store full design in sessionStorage for the customize page to restore
        try {
            sessionStorage.setItem('boxfox_reorder', JSON.stringify(cd));
        } catch (e) { console.error('Failed to store reorder data:', e); }
        router.push(`/customize?${params.toString()}`);
    };

    const handleCancelOrder = async (orderId) => {
        if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;
        
        try {
            const res = await fetch('/api/orders/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId })
            });
            const data = await res.json();
            if (res.ok) {
                showToast("Order cancelled successfully", "success");
                // Refresh orders
                const ordersRes = await fetch("/api/orders/user");
                if (ordersRes.ok) {
                    const ordersData = await ordersRes.json();
                    setOrders(ordersData.orders || []);
                    if (selectedOrder && selectedOrder._id === orderId) {
                        setSelectedOrder({ ...selectedOrder, status: 'Cancelled' });
                    }
                }
            } else {
                showToast(data.error || "Failed to cancel order", "error");
            }
        } catch (err) {
            showToast("System error occurred while cancelling order", "error");
        }
    };

    const isCancellable = (order) => {
        if (order.status !== 'Pending') return false;
        const now = new Date();
        const createdAt = new Date(order.createdAt);
        const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
        return hoursDiff <= 6;
    };

    const visibleQuotes = quotes.filter((quote) => {
        const term = quoteSearch.toLowerCase();
        return [
            quote._id,
            quote.user?.name,
            quote.user?.email,
            quote.status,
            quote.items?.map((item) => item.productName).join(' ')
        ].filter(Boolean).some((value) => String(value).toLowerCase().includes(term));
    });

    const FACES = ['front', 'back', 'top', 'bottom', 'left', 'right'];

    const renderOrderDetail = (order) => {
        const hasCustomDesign = order.items?.some(item => item.customDesign);

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
            >
                <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
                <div className="bg-white rounded-[2rem] sm:rounded-[3rem] w-full max-w-3xl relative z-10 overflow-hidden shadow-2xl border border-gray-100">
                    <div className="p-6 sm:p-10 space-y-6 sm:space-y-8 max-h-[85vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Order Review</p>
                                <h2 className="text-2xl sm:text-3xl font-black text-gray-950 uppercase tracking-tighter">#{order.orderId}</h2>
                                <p className="text-[10px] font-bold text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-600' : order.status === 'Shipped' ? 'bg-blue-100 text-blue-600' : order.status === 'Cancelled' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-950'}`}>
                                {order.status}
                            </span>
                        </div>

                        {/* Items */}
                        <div className="space-y-4">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Inventory Detail</p>
                            <div className="space-y-4">
                                {order.items.map((item, i) => (
                                    <div key={i} className="space-y-0">
                                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                                                    <img src={item.customDesign?.textures?.front || item.customDesign?.textures?.top || Object.values(item.customDesign?.textures || {}).find(v => v) || item.image || item.img} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-gray-950 uppercase">{item.name}</h4>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-black text-gray-950">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                        </div>

                                        {/* Custom Design Details */}
                                        {item.customDesign && (
                                            <div className="mt-3 bg-gradient-to-br from-emerald-50/40 to-white rounded-2xl border border-emerald-100 p-5 space-y-5">
                                                {/* Header Badge */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                            <Layers size={12} className="text-emerald-600" />
                                                        </div>
                                                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em]">Custom Design</span>
                                                    </div>
                                                    {item.customDesign.dimensions && (
                                                        <span className="text-[9px] font-bold text-gray-400 flex items-center gap-1">
                                                            <Ruler size={10} />
                                                            {item.customDesign.dimensions.l}×{item.customDesign.dimensions.w}×{item.customDesign.dimensions.h} {item.customDesign.unit || 'in'}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* 3D Preview + Face Grid */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {/* Mini 3D Box */}
                                                    <div className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col items-center justify-center min-h-[160px]">
                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-1">
                                                            <RotateCw size={8} className="text-emerald-500" /> Drag to Rotate
                                                        </p>
                                                        <MiniBox3D customDesign={item.customDesign} size={120} />
                                                    </div>

                                                    {/* Per-Face Thumbnails */}
                                                    <div className="space-y-2">
                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-1">
                                                            <Eye size={8} className="text-emerald-500" /> Face Previews
                                                        </p>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {FACES.map(face => {
                                                                const dims = item.customDesign.dimensions || { l: 12, w: 8, h: 4 };
                                                                const fw = ['left', 'right'].includes(face) ? dims.w : dims.l;
                                                                const fh = ['top', 'bottom'].includes(face) ? dims.w : dims.h;
                                                                return (
                                                                    <div key={face} className="space-y-1">
                                                                        <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest text-center">{face}</p>
                                                                        <div style={{ paddingBottom: `${(fh / fw) * 100}%`, position: 'relative' }}>
                                                                            <div style={{ position: 'absolute', inset: 0, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)' }}>
                                                                                <BoxFacePreview
                                                                                    face={face}
                                                                                    textures={item.customDesign.textures}
                                                                                    textureSettings={item.customDesign.textureSettings}
                                                                                    colors={item.customDesign.colors}
                                                                                    text={item.customDesign.text}
                                                                                    textStyle={item.customDesign.textStyle}
                                                                                    textColor={item.customDesign.textColor}
                                                                                    textSettings={item.customDesign.textSettings}
                                                                                    width="100%"
                                                                                    height="100%"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Text & Color Info */}
                                                {item.customDesign.text && (
                                                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                                                        <Type size={14} className="text-violet-500 shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Custom Text</p>
                                                            <p className="text-sm font-bold text-gray-950 truncate">"{item.customDesign.text}"</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <span className="text-[9px] font-bold text-gray-400">{item.customDesign.textStyle}</span>
                                                            <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: item.customDesign.textColor || '#fff' }}></div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Reorder Button */}
                                                <button
                                                    onClick={() => handleReorder(item)}
                                                    className="w-full py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
                                                >
                                                    <RefreshCw size={14} /> Reorder This Design
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Total */}
                        <div className="pt-6 border-t border-gray-100">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Value</p>
                                    <h3 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tighter">₹{order.total.toLocaleString('en-IN')}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    {hasCustomDesign && (
                                        <button
                                            onClick={() => {
                                                const customItem = order.items.find(it => it.customDesign);
                                                if (customItem) handleReorder(customItem);
                                            }}
                                            className="px-6 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2"
                                        >
                                            <RefreshCw size={14} /> Reorder
                                        </button>
                                    )}
                                    {isCancellable(order) && (
                                        <button
                                            onClick={() => handleCancelOrder(order._id)}
                                            className="px-6 py-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
                                        >
                                            <Trash2 size={14} /> Cancel Order
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setSelectedOrder(null)}
                                        className="px-6 py-4 bg-gray-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    if (isLoading && !user) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-950"></div>
            </div>
        );
    }

      return (
        <div className="min-h-screen bg-[#fafafa] text-gray-950 font-sans selection:bg-emerald-500 selection:text-white">
            {/* Ambient Technical Background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]">
                <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:32px_32px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:128px_128px]" />
            </div>
            <AnimatePresence>
                {selectedOrder && renderOrderDetail(selectedOrder)}
                
                {/* Chat Modal */}
                {chatOpen && selectedQuote && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-white border border-gray-100 w-full max-w-2xl h-[80vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl"
                        >
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                <div>
                                    <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest italic">Direct Support Channel</p>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter italic text-gray-950">Quote Discussion</h3>
                                </div>
                                <button onClick={() => setChatOpen(false)} className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all text-gray-400">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-gray-50/30">
                                {selectedQuote.messages?.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-6 rounded-[2rem] ${msg.sender === 'user' ? 'bg-gray-950 text-white rounded-tr-none' : 'bg-white text-gray-600 rounded-tl-none border border-gray-100 shadow-sm'}`}>
                                            <p className="text-sm font-bold leading-relaxed">{msg.text}</p>
                                            <p className={`text-[8px] font-black uppercase tracking-widest mt-2 opacity-50`}>{msg.sender === 'user' ? 'You' : 'Admin'} • {new Date(msg.createdAt).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {(!selectedQuote.messages || selectedQuote.messages.length === 0) && (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                                        <Mail size={40} className="mb-4 text-gray-400" />
                                        <p className="text-sm font-black uppercase tracking-widest italic text-gray-400">Waiting for first message...</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 border-t border-gray-50 flex gap-4 bg-white">
                                <input 
                                    type="text" 
                                    placeholder="Type your message..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-emerald-500 text-sm font-bold text-gray-950"
                                />
                                <button onClick={sendMessage} className="px-8 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all">
                                    Send
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="max-w-7xl mx-auto px-6 lg:px-16 pt-20 lg:pt-24 pb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 sm:mb-24 relative z-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="w-12 h-[2px] bg-emerald-500"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">Secure Protocol v2.8</span>
                        </div>
                        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-gray-950 leading-[0.9] sm:leading-[0.85]">
                            Account <br className="hidden sm:block" /> <span className="text-emerald-500">Settings</span>
                        </h1>
                        <p className="text-gray-400 font-bold tracking-[0.2em] uppercase text-[10px] sm:text-xs flex items-center gap-3 pt-2">
                            <Box size={16} className="text-emerald-500" /> Manage your profile and orders
                        </p>
                    </div>
                    
                    <div className="relative group w-full md:w-auto">
                        <div className="absolute -inset-2 md:-inset-4 bg-emerald-500/5 rounded-[2rem] md:rounded-[2.5rem] blur-xl md:blur-2xl group-hover:bg-emerald-500/10 transition-all duration-500"></div>
                        <div className="relative flex items-center gap-4 md:gap-5 bg-white border border-gray-100 p-3 md:p-4 pr-6 md:pr-8 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-gray-200/50 w-full md:w-auto">
                            <div className="relative shrink-0">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gray-950 flex items-center justify-center text-white text-xl md:text-2xl font-black shadow-lg shadow-emerald-500/20 border-2 border-emerald-500/30">
                                    {user?.name?.charAt(0)}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></div>
                            </div>
                            <div>
                                <p className="text-[14px] font-black uppercase tracking-widest text-gray-950 leading-none mb-1.5">{user?.name}</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute"></div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 relative"></div>
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Status: Authorized</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* Sidebar - Desktop Sticky Navigation / Mobile Launcher (Hidden when tab active) */}
                    <div className={`lg:col-span-3 space-y-4 lg:sticky lg:top-32 z-40 ${activeTab !== 'dashboard' ? 'hidden lg:block' : 'block'}`}>
                        <div className="bg-white rounded-[3rem] p-3 shadow-2xl shadow-gray-200/60 border border-gray-100 flex flex-col gap-1.5">
                            {[
                                { id: "dashboard", label: "Overview", icon: Settings },
                                { id: "orders", label: "Manifests", icon: Package },
                                { id: "quotes", label: "Gifting Quotes", icon: FileText, badge: quotes.length },
                                { id: "addresses", label: "Logistics", icon: MapPin },
                                { id: "details", label: "Identity", icon: UserIcon },
                                { id: "wishlist", label: "Wishlist", icon: Heart },
                                { id: "designs", label: "Blueprints", icon: Layers, badge: savedDesigns.length },
                                { id: "security", label: "Encryption", icon: Lock },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`group relative flex items-center gap-4 px-6 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.25em] transition-all duration-500 ${activeTab === tab.id ? 'bg-gray-950 text-white shadow-2xl shadow-gray-950/20' : 'text-gray-400 hover:text-gray-950 hover:bg-gray-50'}`}
                                >
                                    {activeTab === tab.id && (
                                        <motion.div layoutId="tab-indicator" className="absolute left-2 w-1.5 h-6 bg-emerald-500 rounded-full" />
                                    )}
                                    <tab.icon size={18} className={`transition-all duration-500 ${activeTab === tab.id ? 'text-emerald-500 scale-110' : 'group-hover:text-emerald-500 group-hover:scale-110'}`} />
                                    <span className="flex-1 text-left">{tab.label}</span>
                                    {tab.badge > 0 && (
                                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black border transition-all duration-500 ${activeTab === tab.id ? 'bg-emerald-500 border-emerald-400 text-white scale-110' : 'bg-gray-100 border-gray-200 text-gray-500 group-hover:bg-emerald-50 group-hover:border-emerald-200 group-hover:text-emerald-600'}`}>{tab.badge}</span>
                                    )}
                                </button>
                            ))}
                            
                            <div className="h-px bg-gray-50 my-4 mx-8" />
                            
                            {user?.role === 'admin' && (
                                <button
                                    onClick={() => router.push('/admin')}
                                    className="group flex items-center gap-4 px-6 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.25em] text-emerald-600 hover:bg-emerald-50 transition-all duration-300"
                                >
                                    <div className="w-5 flex justify-center"><Shield size={18} className="group-hover:scale-110 transition-transform" /></div>
                                    <span>Admin Panel</span>
                                </button>
                            )}
                            <button
                                onClick={handleLogout}
                                className="group flex items-center gap-4 px-6 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.25em] text-red-400 hover:bg-red-50 hover:text-red-600 transition-all duration-300"
                            >
                                <div className="w-5 flex justify-center"><LogOut size={18} className="group-hover:rotate-12 transition-transform" /></div>
                                <span>Termination</span>
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className={`lg:col-span-9 ${activeTab === 'dashboard' ? 'hidden lg:block' : 'block'}`}>
                        {activeTab !== 'dashboard' && (
                            <button 
                                onClick={() => setActiveTab('dashboard')}
                                className="lg:hidden flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 bg-white px-4 py-2 rounded-full border border-gray-100 w-fit"
                            >
                                <ChevronRight size={14} className="rotate-180" /> Back to Overview
                            </button>
                        )}
                        <AnimatePresence mode="wait">
                             {activeTab === 'dashboard' && (
                                <motion.div
                                    key="dashboard"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-[2rem] md:rounded-[4rem] p-6 sm:p-12 md:p-20 shadow-2xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden group/card"
                                >
                                    {/* Tech Ornament */}
                                    <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover/card:opacity-[0.1] transition-opacity duration-700">
                                        <div className="w-32 h-32 border-4 border-emerald-500 rounded-full border-dashed animate-spin-slow"></div>
                                    </div>

                                    <div className="relative z-10 max-w-3xl">
                                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-emerald-950 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-10 shadow-2xl shadow-emerald-900/20">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                            Control Center Active
                                        </div>
                                        
                                        <h2 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter text-gray-950 mb-10 leading-[0.9]">
                                            Hello, <br />
                                            <span className="text-emerald-500 italic decoration-8 decoration-emerald-500/10 underline underline-offset-[10px]">
                                                {user?.name?.split(' ')[0]}
                                            </span>
                                        </h2>
                                        
                                        <div className="p-6 md:p-8 bg-gray-50 rounded-[2rem] md:rounded-[3rem] border border-gray-100 mb-8 md:mb-12 relative overflow-hidden">
                                            <p className="text-gray-500 text-base md:text-xl font-medium leading-relaxed italic relative z-10">
                                                From your account dashboard you can view your <button onClick={() => setActiveTab('orders')} className="text-gray-950 font-black hover:text-emerald-600 transition-colors">recent orders</button>, manage your <button onClick={() => setActiveTab('addresses')} className="text-gray-950 font-black hover:text-emerald-600 transition-colors">shipping addresses</button>, and <button onClick={() => setActiveTab('details')} className="text-gray-950 font-black hover:text-emerald-600 transition-colors">edit your password and account details</button>.
                                            </p>
                                            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {[
                                                { id: 'orders', label: 'Recent Orders', icon: Package, desc: 'Track your manifests', color: 'emerald' },
                                                { id: 'addresses', label: 'Addresses', icon: MapPin, desc: 'Manage logistics', color: 'blue' },
                                                { id: 'details', label: 'Account Details', icon: UserIcon, desc: 'Update identity', color: 'violet' },
                                                { id: 'wishlist', label: 'Wishlist', icon: Heart, desc: 'Saved favorites', color: 'pink' }
                                            ].map((item) => (
                                                <button 
                                                    key={item.id}
                                                    className="p-6 sm:p-8 bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 flex items-center gap-4 sm:gap-6 group/item hover:bg-gray-950 hover:border-gray-950 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-gray-950/20 text-left"
                                                >
                                                    <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-gray-400 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-all duration-500 shadow-inner group-hover/item:shadow-lg group-hover/item:shadow-emerald-500/30 shrink-0`}>
                                                        <item.icon size={28} className="group-hover/item:scale-110 transition-transform duration-500" />
                                                    </div>
                                                    <div>
                                                        <span className="block text-[14px] font-black uppercase tracking-widest text-gray-950 group-hover/item:text-white transition-colors duration-500">{item.label}</span>
                                                        <span className="block text-[10px] font-bold text-gray-400 group-hover/item:text-gray-500 uppercase tracking-widest mt-1 duration-500">{item.desc}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'details' && (
                                <motion.div
                                    key="details"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-sm border border-gray-100"
                                >
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-gray-950 mb-8">
                                        Account Details
                                    </h2>

                                    {(errorMsg || successMsg) && (
                                        <div className={`mb-6 p-4 text-sm font-bold uppercase tracking-wide rounded-xl border ${errorMsg ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                            {errorMsg || successMsg}
                                        </div>
                                    )}

                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                                                <input type="text" value={name} onChange={e => setName(e.target.value)} required
                                                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-950 outline-none transition-all font-medium text-gray-950" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email (Read-Only)</label>
                                                <input type="email" value={user?.email} disabled
                                                    className="w-full px-6 py-4 rounded-xl bg-gray-100 border border-transparent text-gray-500 font-medium cursor-not-allowed" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                                                <input type="tel" value={phone} 
                                                    onChange={e => {
                                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                        setPhone(val);
                                                    }} 
                                                    placeholder="10 digit mobile number"
                                                    required
                                                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-950 outline-none transition-all font-medium text-gray-950" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Business Name (Optional)</label>
                                                <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Company / Business Name"
                                                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-950 outline-none transition-all font-medium text-gray-950" />
                                            </div>
                                        </div>
                                        <button type="submit" disabled={isLoading} className="px-8 py-4 rounded-full font-black bg-gray-950 text-white hover:bg-emerald-500 transition-all uppercase tracking-[0.2em] text-[10px] disabled:opacity-70">
                                            Save Changes
                                        </button>
                                    </form>
                                </motion.div>
                            )}

                            {activeTab === 'addresses' && (
                                <motion.div
                                    key="addresses"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-sm border border-gray-100"
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-black uppercase tracking-tight text-gray-950">
                                            Shipping Address
                                        </h2>
                                        {!isEditing && (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="px-5 py-2 rounded-full border border-gray-200 text-[10px] font-black tracking-widest hover:bg-gray-50 transition-colors uppercase"
                                            >
                                                Change Address
                                            </button>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="md:col-span-2 space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Street Address</label>
                                                    <input type="text" value={shippingAddress.street} onChange={e => setShippingAddress({ ...shippingAddress, street: e.target.value })} placeholder="House number and street name"
                                                        className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-950 outline-none transition-all font-medium text-gray-950" />
                                                </div>
                                                <div className="md:col-span-2 space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Apartment, suite, unit, etc. (optional)</label>
                                                    <input type="text" value={shippingAddress.apartment} onChange={e => setShippingAddress({ ...shippingAddress, apartment: e.target.value })} placeholder="Apartment, suite, unit, etc."
                                                        className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-950 outline-none transition-all font-medium text-gray-950" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Town / City</label>
                                                    <input type="text" value={shippingAddress.city} onChange={e => setShippingAddress({ ...shippingAddress, city: e.target.value })} placeholder="City"
                                                        className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-950 outline-none transition-all font-medium text-gray-950" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">State / Province</label>
                                                    <input type="text" value={shippingAddress.state} onChange={e => setShippingAddress({ ...shippingAddress, state: e.target.value })} placeholder="State"
                                                        className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-950 outline-none transition-all font-medium text-gray-950" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Postcode / ZIP</label>
                                                    <input type="text" value={shippingAddress.zipCode} onChange={e => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })} placeholder="PIN / ZIP Code"
                                                        className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-950 outline-none transition-all font-medium text-gray-950" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Country / Region</label>
                                                    <div className="relative">
                                                        <select value="India" readOnly
                                                            className="w-full px-6 py-4 rounded-xl bg-gray-100 border border-transparent text-gray-500 font-medium appearance-none cursor-not-allowed">
                                                            <option value="India">India</option>
                                                        </select>
                                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                            <ChevronRight size={14} className="rotate-90" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 pt-4">
                                                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-xl font-bold bg-white border border-gray-200 hover:bg-gray-50 transition-colors uppercase tracking-widest text-xs">
                                                    Cancel
                                                </button>
                                                <button type="submit" disabled={isLoading} className="px-8 py-3 rounded-xl font-bold bg-gray-950 text-white hover:bg-emerald-500 transition-all uppercase tracking-widest text-xs disabled:opacity-70">
                                                    Update Address
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex flex-col gap-1 italic text-gray-600 font-medium leading-relaxed">
                                            {user?.shippingAddress && user.shippingAddress.street ? (
                                                <>
                                                    <p>{user.shippingAddress.street}</p>
                                                    {user.shippingAddress.apartment && <p>{user.shippingAddress.apartment}</p>}
                                                    <p>{user.shippingAddress.city}, {user.shippingAddress.state} {user.shippingAddress.zipCode}</p>
                                                    <p className="not-italic font-black text-gray-950 mt-2 uppercase tracking-widest text-[10px]">{user.shippingAddress.country}</p>
                                                </>
                                            ) : (
                                                "No shipping address provided yet."
                                            )}
                                        </div>
                                    )}
                                    <p className="mt-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        The following address will be used on the checkout page by default.
                                    </p>
                                </motion.div>
                            )}

                            {activeTab === 'security' && (
                                <motion.div
                                    key="security"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-sm border border-gray-100"
                                >
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-gray-950 mb-8">
                                        Security Settings
                                    </h2>

                                    {(errorMsg || successMsg) && (
                                        <div className={`mb-6 p-4 text-sm font-bold uppercase tracking-wide rounded-xl border ${errorMsg ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                            {errorMsg || successMsg}
                                        </div>
                                    )}

                                    <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Current Password</label>
                                            <input
                                                type="password" required value={pwdData.current}
                                                onChange={e => setPwdData({ ...pwdData, current: e.target.value })}
                                                className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-950 outline-none transition-all font-medium text-gray-950"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">New Password</label>
                                            <input
                                                type="password" required value={pwdData.new}
                                                onChange={e => setPwdData({ ...pwdData, new: e.target.value })}
                                                className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-950 outline-none transition-all font-medium text-gray-950"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                                            <input
                                                type="password" required value={pwdData.confirm}
                                                onChange={e => setPwdData({ ...pwdData, confirm: e.target.value })}
                                                className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-950 outline-none transition-all font-medium text-gray-950"
                                            />
                                        </div>
                                        <button type="submit" className="w-full py-4 rounded-xl font-bold bg-gray-950 text-white hover:bg-emerald-500 transition-all uppercase tracking-widest text-sm shadow-xl shadow-gray-200">
                                            Update Password
                                        </button>
                                    </form>
                                </motion.div>
                            )}

                            {activeTab === 'wishlist' && (
                                <motion.div
                                    key="wishlist"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-sm border border-gray-100 min-h-[400px]"
                                >
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-gray-950 mb-8">
                                        My Wishlist
                                    </h2>

                                    {wishlist.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                                                <Heart size={32} />
                                            </div>
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Your wishlist is empty.</p>
                                            <button
                                                onClick={() => router.push('/shop')}
                                                className="mt-6 px-8 py-3 bg-gray-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all"
                                            >
                                                Start Shopping
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {wishlist.map(product => (
                                                <div
                                                    key={product._id}
                                                    className="p-4 rounded-[2rem] border border-gray-100 bg-gray-50/50 flex items-center gap-6 group relative"
                                                >
                                                    <div className="w-24 h-24 bg-white rounded-2xl p-2 shrink-0 border border-gray-100">
                                                        <img src={product.images?.[0] || '/BOXFOX-1.png'} alt={product.name} className="w-full h-full object-contain" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-black text-gray-950 uppercase truncate">{product.name}</h4>
                                                        <p className="text-lg font-black text-emerald-600 mt-1">₹{product.price || product.regular_price}</p>
                                                        <div className="flex items-center gap-3 mt-4">
                                                            <button
                                                                onClick={() => router.push(`/products/${product._id || product.wpId}`)}
                                                                className="px-4 py-2 bg-gray-950 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all"
                                                            >
                                                                View Product
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    const res = await fetch('/api/wishlist', {
                                                                        method: 'POST',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({ productId: product._id })
                                                                    });
                                                                    if (res.ok) {
                                                                        setWishlist(wishlist.filter(item => item._id !== product._id));
                                                                    }
                                                                }}
                                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'orders' && (
                                <motion.div
                                    key="orders"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-sm border border-gray-100 min-h-[400px]"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                        <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-950">
                                            Order History
                                        </h2>
                                        <div className="relative flex-1 max-w-sm">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input 
                                                type="text" 
                                                placeholder="Search by Order ID or Product..." 
                                                value={orderSearch}
                                                onChange={(e) => setOrderSearch(e.target.value)}
                                                className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {orders.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                                                <Package size={32} />
                                            </div>
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No orders found.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                            {orders
                                                .filter(o => 
                                                    o.orderId.toLowerCase().includes(orderSearch.toLowerCase()) || 
                                                    o.items?.some(it => it.name.toLowerCase().includes(orderSearch.toLowerCase()))
                                                )
                                                .map(order => (
                                                <div
                                                    key={order._id}
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
                                                >
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
                                                    
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 relative z-10">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-16 h-16 rounded-[1.25rem] bg-white border border-gray-100 p-2 shrink-0 flex items-center justify-center shadow-sm">
                                                                <img 
                                                                    src={order.items?.[0]?.customDesign?.textures?.front || order.items?.[0]?.image || order.items?.[0]?.img || '/BOXFOX-1.png'} 
                                                                    className="w-full h-full object-contain" 
                                                                    alt="" 
                                                                />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Shipping ID</p>
                                                                <h4 className="text-lg font-black text-gray-950 uppercase group-hover:text-emerald-500 transition-colors">#{order.orderId}</h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Status: {order.status}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-8 sm:gap-12">
                                                            <div>
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Dispatched</p>
                                                                <p className="text-xs font-black text-gray-950 uppercase tracking-tight">
                                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Order Value</p>
                                                                <p className="text-lg font-black text-gray-950 tracking-tighter">₹{order.total.toLocaleString('en-IN')}</p>
                                                            </div>

                                                            <div className="col-span-2 sm:col-span-1 flex flex-col items-end gap-2">
                                                                <div className={`inline-flex items-center px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] shadow-sm transition-all ${
                                                                    order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-600' : 
                                                                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-600' : 
                                                                    order.status === 'Cancelled' ? 'bg-red-100 text-red-600' : 
                                                                    'bg-gray-950 text-white shadow-gray-200'
                                                                }`}>
                                                                    {order.status}
                                                                </div>
                                                                {isCancellable(order) && (
                                                                    <button 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleCancelOrder(order._id);
                                                                        }}
                                                                        className="text-[8px] font-black text-red-500 hover:text-red-700 uppercase tracking-widest underline underline-offset-2"
                                                                    >
                                                                        Cancel Order
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="hidden sm:block">
                                                            <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-300 group-hover:text-emerald-500 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-all">
                                                                <ChevronRight size={20} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {orders.filter(o => 
                                                o.orderId.toLowerCase().includes(orderSearch.toLowerCase()) || 
                                                o.items?.some(it => it.name.toLowerCase().includes(orderSearch.toLowerCase()))
                                            ).length === 0 && (
                                                <div className="py-20 text-center italic text-gray-400 text-sm">No matches found for "{orderSearch}"</div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'quotes' && (
                                <motion.div
                                    key="quotes"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-sm border border-gray-100 min-h-[400px]"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                        <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-950">
                                            Gifting Quotations
                                        </h2>
                                        <div className="relative flex-1 max-w-sm">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input 
                                                type="text" 
                                                placeholder="Search quotations..." 
                                                value={quoteSearch}
                                                onChange={(e) => setQuoteSearch(e.target.value)}
                                                className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                                            {QUOTE_PHASES.map((phase) => {
                                                const count = quotes.filter((quote) => getClientQuoteStatus(quote.status, quote.assignedVendor) === phase).length;
                                                return (
                                                    <div key={phase} className={`rounded-2xl border px-4 py-3 ${getQuoteBadgeClasses(phase)} bg-opacity-60`}>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">{phase}</p>
                                                        <p className="text-lg font-black tracking-tight mt-1">{count}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                    {quotes.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                                                <FileText size={32} />
                                            </div>
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No quotations requested yet.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {visibleQuotes.length === 0 ? (
                                                <div className="py-20 text-center italic text-gray-400 text-sm">No matches found for "{quoteSearch}"</div>
                                            ) : visibleQuotes.map(quote => {
                                                const clientStatus = getClientQuoteStatus(quote.status, quote.assignedVendor);
                                                const statusLabel = clientStatus.charAt(0).toUpperCase() + clientStatus.slice(1);
                                                return (
                                                <div
                                                    key={quote._id}
                                                    className="p-6 sm:p-8 rounded-[2rem] border border-gray-100 bg-gradient-to-br from-white via-gray-50/60 to-emerald-50/30 hover:bg-white transition-all relative overflow-hidden"
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 relative z-10">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-16 h-16 rounded-[1.25rem] bg-white border border-gray-100 p-2 shrink-0 flex items-center justify-center shadow-sm text-emerald-500">
                                                                <FileText size={24} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Quote Reference</p>
                                                                <h4 className="text-lg font-black text-gray-950 uppercase">#{quote._id.slice(-6).toUpperCase()}</h4>
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] ${getQuoteBadgeClasses(clientStatus)}`}>
                                                                        {statusLabel}
                                                                    </span>
                                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{quote.assignedVendor ? 'Partner assigned' : 'Awaiting assignment'}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4 min-w-[260px]">
                                                            <div className="text-right bg-white rounded-2xl border border-gray-100 p-4">
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Client Amount</p>
                                                                <p className="text-xl font-black text-gray-950">₹{quote.totalAmount || 'TBD'}</p>
                                                            </div>
                                                            <div className="text-right bg-emerald-50 rounded-2xl border border-emerald-100 p-4">
                                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Vendor Payout</p>
                                                                <p className="text-xl font-black text-emerald-700">₹{quote.vendorAmount || 'TBD'}</p>
                                                            </div>
                                                            <button 
                                                                className="col-span-2 px-6 py-3 bg-gray-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
                                                                onClick={() => { setSelectedQuote(quote); setChatOpen(true); }}
                                                            >
                                                                <Mail size={14} /> Discuss with Admin
                                                                {quote.messages?.filter(m => m.sender === 'admin').length > 0 && (
                                                                    <span className="w-4 h-4 bg-emerald-500 rounded-full text-[8px] flex items-center justify-center">{quote.messages.filter(m => m.sender === 'admin').length}</span>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );})}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'designs' && (
                                <motion.div
                                    key="designs"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-sm border border-gray-100 min-h-[400px]"
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-black uppercase tracking-tight text-gray-950">
                                            Saved Designs
                                        </h2>
                                        <button
                                            onClick={() => router.push('/customize')}
                                            className="px-5 py-2 rounded-full bg-emerald-500 text-white text-[10px] font-black tracking-widest uppercase hover:bg-emerald-600 transition-all shadow-sm"
                                        >
                                            + New Design
                                        </button>
                                    </div>

                                    {savedDesigns.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                                                <Layers size={32} />
                                            </div>
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">No saved designs yet.</p>
                                            <p className="text-[10px] text-gray-400 font-medium mb-6">Create a design in the Customization interface and click "Save" to see it here.</p>
                                            <button
                                                onClick={() => router.push('/customize')}
                                                className="px-8 py-3 bg-gray-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all"
                                            >
                                                Start New Design
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {savedDesigns.map(design => {
                                                const cd = design.customDesign || {};
                                                const dims = cd.dimensions || { l: 12, w: 8, h: 4 };
                                                const isCopied = copiedDesignId === design._id;
                                                return (
                                                    <div key={design._id} className="rounded-[2rem] border border-gray-100 bg-gray-50/50 overflow-hidden group hover:shadow-xl hover:border-gray-200 transition-all">
                                                        {/* 3D Preview */}
                                                        <div className="bg-gradient-to-br from-gray-100 to-white p-6 flex items-center justify-center min-h-[160px] border-b border-gray-100">
                                                            <MiniBox3D customDesign={cd} size={110} />
                                                        </div>
                                                        {/* Info */}
                                                        <div className="p-5 space-y-3">
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <h4 className="text-sm font-black text-gray-950 uppercase truncate max-w-[180px]">{design.name}</h4>
                                                                    <p className="text-[9px] font-bold text-gray-400 mt-0.5">
                                                                        {dims.l}×{dims.w}×{dims.h} {cd.unit || 'in'} · {new Date(design.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                                    </p>
                                                                </div>
                                                                {design.isPublic && (
                                                                    <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-widest border border-blue-100">Shared</span>
                                                                )}
                                                            </div>
                                                            {/* Tags */}
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {cd.text && (
                                                                    <span className="text-[8px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">Text: "{cd.text}"</span>
                                                                )}
                                                                {Object.values(cd.textures || {}).filter(Boolean).length > 0 && (
                                                                    <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{Object.values(cd.textures).filter(Boolean).length} textures</span>
                                                                )}
                                                            </div>
                                                            {/* Actions */}
                                                            <div className="flex items-center gap-2 pt-2">
                                                                <button
                                                                    onClick={() => {
                                                                        const params = new URLSearchParams({
                                                                            length: dims.l,
                                                                            width: dims.w,
                                                                            height: dims.h,
                                                                            unit: cd.unit || 'in',
                                                                            reorder: 'true',
                                                                            designId: design._id,
                                                                            name: design.name
                                                                        });
                                                                        try { sessionStorage.setItem('boxfox_reorder', JSON.stringify(cd)); } catch (e) { }
                                                                        router.push(`/customize?${params.toString()}`);
                                                                    }}
                                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all"
                                                                >
                                                                    <Pencil size={12} /> Refine Design
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        const newPublicState = !design.isPublic;
                                                                        await fetch('/api/designs', {
                                                                            method: 'PATCH',
                                                                            headers: { 'Content-Type': 'application/json' },
                                                                            body: JSON.stringify({ designId: design._id, isPublic: newPublicState })
                                                                        });
                                                                        setSavedDesigns(prev => prev.map(d => d._id === design._id ? { ...d, isPublic: newPublicState } : d));

                                                                        if (newPublicState) {
                                                                            const link = `${window.location.origin}/design/${design.shareId}`;
                                                                            try {
                                                                                await navigator.clipboard.writeText(link);
                                                                                setCopiedDesignId(design._id);
                                                                                setTimeout(() => setCopiedDesignId(null), 2000);
                                                                            } catch (err) { }
                                                                        }
                                                                    }}
                                                                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 border rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${design.isPublic ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-white' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600'}`}
                                                                >
                                                                    {isCopied ? <><Check size={12} className="text-emerald-500" /> Copied</> : design.isPublic ? <><Lock size={12} /> Private</> : <><Share2 size={12} /> Share</>}
                                                                </button>

                                                                <button
                                                                    onClick={async () => {
                                                                        if (!confirm('Delete this design?')) return;
                                                                        await fetch(`/api/designs?id=${design._id}`, { method: 'DELETE' });
                                                                        setSavedDesigns(prev => prev.filter(d => d._id !== design._id));
                                                                    }}
                                                                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function AccountManagement() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-950"></div>
            </div>
        }>
            <AccountManagementContent />
        </Suspense>
    );
}
