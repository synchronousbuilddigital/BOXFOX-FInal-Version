"use client";
import React, { useState, useEffect } from "react";
import { 
    CheckCircle2, XCircle, Clock, RefreshCw, Search, 
    Layers, Package, DollarSign, User, Mail, Phone, 
    Briefcase, AlertCircle, ExternalLink, ShieldCheck, X
} from "lucide-react";

export default function AdminVendorProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState("pending"); // pending, approved, rejected
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);

    const loadProducts = async (preserveState = false) => {
        if (!preserveState) setLoading(true);
        setRefreshing(true);
        try {
            const res = await fetch("/api/admin/vendor-products");
            const data = await res.json();
            if (data.success) {
                setProducts(data.products || []);
            }
        } catch (err) {
            console.error("Failed to fetch vendor products:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleApproval = async (productId, status) => {
        try {
            const res = await fetch("/api/admin/vendor-products", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, approvalStatus: status })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setProducts(prev => prev.map(p => p._id === productId ? { ...p, approvalStatus: status, isApproved: status === 'approved' } : p));
                if (selectedProduct && selectedProduct._id === productId) {
                    setSelectedProduct(prev => ({ ...prev, approvalStatus: status, isApproved: status === 'approved' }));
                }
            } else {
                alert(data.error || "Failed to update product approval status");
            }
        } catch (err) {
            console.error("Error updating product approval:", err);
            alert("Error updating product approval status");
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesTab = (p.approvalStatus || "pending") === activeTab;
        
        const vendorName = p.vendorId?.name || "";
        const vendorBusiness = p.vendorId?.businessName || "";
        
        const matchesQuery = 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.sku || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vendorBusiness.toLowerCase().includes(searchQuery.toLowerCase());
            
        return matchesTab && matchesQuery;
    });

    if (loading && !products.length) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 font-black uppercase tracking-widest italic">
                Connecting Partner Inventory...
            </div>
        );
    }

    return (
        <div className="selection:bg-emerald-500/30 pb-12">
            <div className="max-w-[1400px] mx-auto px-2">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
                    <div>
                        <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4 italic">Supply Chain Integrity</p>
                        <h1 className="text-6xl text-gray-950 font-black uppercase tracking-tighter italic">Vendor <br /> Products</h1>
                    </div>
                    <button 
                        onClick={() => loadProducts()} 
                        className="px-8 py-4 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-3 shadow-xs"
                    >
                        <RefreshCw className={refreshing ? "animate-spin" : ""} size={16} /> Refresh Feed
                    </button>
                </div>

                {/* Tabs & Search */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white border border-gray-200 p-6 rounded-[2.5rem] shadow-xs mb-16">
                    {/* Status Tabs */}
                    <div className="flex gap-2">
                        {["pending", "approved", "rejected"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                    activeTab === tab 
                                        ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/10" 
                                        : "bg-gray-55 border-gray-200 text-gray-500 hover:bg-gray-100"
                                }`}
                            >
                                {tab === "pending" ? "Pending Approval" : tab}
                            </button>
                        ))}
                    </div>

                    {/* Search Field */}
                    <div className="relative w-full lg:max-w-md">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by product, category, vendor..."
                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-emerald-500 text-xs font-bold uppercase tracking-wider text-gray-955"
                        />
                    </div>
                </div>

                {/* Directory Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProducts.map((product) => (
                        <div 
                            key={product._id} 
                            className="bg-white border border-gray-200/80 rounded-[3rem] p-8 lg:p-10 hover:shadow-xl hover:shadow-gray-200/40 transition-all flex flex-col justify-between relative overflow-hidden group min-h-[460px]"
                        >
                            <div>
                                {/* Vendor Attribution Card */}
                                <div className="flex items-center gap-3 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 text-xs font-black italic">
                                        {product.vendorId?.businessName ? product.vendorId.businessName.charAt(0).toUpperCase() : "V"}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-tight text-gray-950 truncate">
                                            {product.vendorId?.businessName || "Unknown Partner"}
                                        </p>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest truncate">
                                            Rep: {product.vendorId?.name || "N/A"}
                                        </p>
                                    </div>
                                </div>

                                {/* Img & Product Info */}
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden shrink-0">
                                        <img 
                                            src={product.images?.[0] || product.img || "/BOXFOX-1.png"} 
                                            alt="" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-xs font-black uppercase italic tracking-tight text-gray-955 group-hover:text-emerald-600 transition-colors line-clamp-2">
                                            {product.name}
                                        </h3>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                            SKU: {product.sku || "PENDING"}
                                        </p>
                                    </div>
                                </div>

                                {/* Specifications Grid */}
                                <div className="space-y-3 my-6">
                                    <div className="flex items-center gap-3 text-gray-500 text-[10px] font-black uppercase tracking-wider">
                                        <Layers size={14} className="text-emerald-500" />
                                        <span>Category: <span className="text-emerald-600 font-bold">{product.category}</span></span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-500 text-[10px] font-black uppercase tracking-wider">
                                        <Package size={14} className="text-emerald-500" />
                                        <span>Dimensions: {product.dimensions?.length}x{product.dimensions?.width}x{product.dimensions?.height} {product.dimensions?.unit || "inch"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-500 text-[10px] font-black uppercase tracking-wider">
                                        <DollarSign size={14} className="text-emerald-500" />
                                        <span>Price range: ₹{product.minPrice || product.price || "0"}{product.maxPrice ? ` - ₹${product.maxPrice}` : ""}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Approval Controls */}
                            <div className="border-t border-gray-100 pt-6 mt-4 flex flex-col gap-3">
                                <button 
                                    onClick={() => setSelectedProduct(product)}
                                    className="w-full py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center flex items-center justify-center gap-1.5 text-gray-700"
                                >
                                    View Full Details <ExternalLink size={12} />
                                </button>
                                
                                <div className="flex gap-2">
                                    {product.approvalStatus !== "approved" && (
                                        <button
                                            onClick={() => handleApproval(product._id, "approved")}
                                            className="flex-1 py-3 bg-emerald-50 hover:bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <CheckCircle2 size={12} /> Approve
                                        </button>
                                    )}
                                    {product.approvalStatus !== "rejected" && (
                                        <button
                                            onClick={() => handleApproval(product._id, "rejected")}
                                            className="flex-1 py-3 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <XCircle size={12} /> Reject
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredProducts.length === 0 && (
                        <div className="col-span-full py-32 text-center text-gray-400 font-black uppercase tracking-widest italic flex flex-col items-center gap-4">
                            <AlertCircle size={40} className="text-gray-300" />
                            No products found matching filters
                        </div>
                    )}
                </div>
            </div>

            {/* DETAILS MODAL */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
                    <div className="flex-1" onClick={() => setSelectedProduct(null)}></div>
                    
                    <div className="w-full max-w-3xl bg-white border-l border-gray-250 h-full overflow-y-auto p-8 lg:p-12 shadow-2xl relative text-gray-800">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-6">
                            <div>
                                <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-1 italic">Review Product File</p>
                                <h3 className="text-2xl font-black uppercase italic text-gray-950">{selectedProduct.name}</h3>
                            </div>
                            <button 
                                onClick={() => setSelectedProduct(null)}
                                className="p-3 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl transition-all"
                            >
                                <X size={18} className="text-gray-600" />
                            </button>
                        </div>

                        {/* Content Grid */}
                        <div className="space-y-10 text-xs font-bold uppercase tracking-wider text-gray-700">
                            
                            {/* Vendor Information Card */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <User size={14} /> Manufacturing Partner Info
                                </h4>
                                <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-200/60">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-black">Company Name</p>
                                        <p className="font-bold text-gray-950 text-sm">{selectedProduct.vendorId?.businessName || "N/A"}</p>
                                        <p className="text-[9px] text-emerald-600 font-bold mt-1">Rep: {selectedProduct.vendorId?.name || "N/A"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-400 uppercase font-black">Contact Info</p>
                                        <p className="flex items-center gap-1.5 text-gray-600 normal-case"><Mail size={12} className="text-emerald-500" /> {selectedProduct.vendorId?.email || "N/A"}</p>
                                        <p className="flex items-center gap-1.5 text-gray-600"><Phone size={12} className="text-emerald-500" /> {selectedProduct.vendorId?.phone || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Product Specs */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <Package size={14} /> Product Specifications
                                </h4>
                                <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-200/60">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-black">Target Category</p>
                                            <p className="text-emerald-600 font-bold">{selectedProduct.category}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-black">Brand</p>
                                            <p className="text-gray-900 font-bold">{selectedProduct.brand || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-black">Min Order Quantity</p>
                                            <p className="text-gray-900 font-bold">{selectedProduct.minOrderQuantity || 10} Units</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-black">Dimensions (L x W x H)</p>
                                            <p className="text-gray-900 font-bold">
                                                {selectedProduct.dimensions?.length} x {selectedProduct.dimensions?.width} x {selectedProduct.dimensions?.height} {selectedProduct.dimensions?.unit || "inch"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-black">Pricing range</p>
                                            <p className="text-emerald-600 font-bold text-sm">₹{selectedProduct.minPrice || selectedProduct.price || "0"}{selectedProduct.maxPrice ? ` - ₹${selectedProduct.maxPrice}` : ""}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {selectedProduct.description && (
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 pb-2">
                                        <Briefcase size={14} /> Detailed Description
                                    </h4>
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200/60">
                                        <p className="text-gray-600 font-sans tracking-normal leading-relaxed text-xs normal-case">
                                            {selectedProduct.description}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Images Grid */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <ShieldCheck size={14} /> Product Gallery
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {(Array.isArray(selectedProduct.images) ? selectedProduct.images : (selectedProduct.images ? selectedProduct.images.split(",") : [])).map((img, idx) => (
                                        <div key={idx} className="bg-gray-55 border border-gray-200 p-2 rounded-2xl overflow-hidden aspect-video">
                                            <img src={img.trim()} className="w-full h-full object-cover rounded-xl" alt="" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* BOTTOM ACTION BAR */}
                        <div className="border-t border-gray-200 pt-8 mt-12 flex gap-4 bg-white sticky bottom-0">
                            {selectedProduct.approvalStatus !== "approved" && (
                                <button
                                    onClick={() => handleApproval(selectedProduct._id, "approved")}
                                    className="flex-1 py-4 bg-emerald-500 text-white hover:bg-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                                >
                                    <CheckCircle2 size={16} /> Approve Product
                                </button>
                            )}
                            {selectedProduct.approvalStatus !== "rejected" && (
                                <button
                                    onClick={() => handleApproval(selectedProduct._id, "rejected")}
                                    className="flex-1 py-4 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-200 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                    <XCircle size={16} /> Reject Product
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
