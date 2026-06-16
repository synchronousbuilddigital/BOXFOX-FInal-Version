"use client";
import React, { useEffect, useState } from "react";
import { 
    RefreshCw, CheckCircle2, XCircle, User as UserIcon, Mail, Phone, 
    Briefcase, X, ExternalLink, FileText, Landmark, MapPin, Receipt, 
    ShieldCheck, Building, Database, Filter, Search, ChevronRight, Check,
    Package, Layers, DollarSign, Clock, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminVendorsPage() {
    const [vendors, setVendors] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Filters and Search
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");

    // Selected Drawer States
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [selectedSpecialties, setSelectedSpecialties] = useState([]);
    const [drawerTab, setDrawerTab] = useState("profile"); // profile, documents, specialties, products

    useEffect(() => {
        if (selectedVendor) {
            setSelectedSpecialties(selectedVendor.vendorSpecialties || []);
        } else {
            setSelectedSpecialties([]);
        }
    }, [selectedVendor]);

    const getCategoryLabel = (cat) => {
        if (cat === "Packaging") return "Box Manufacturing";
        if (cat === "Printing") return "Printing & Branding";
        if (cat === "Logistics") return "Logistics & Supply";
        if (cat === "Gifts") return "Gift Sourcing";
        return cat;
    };

    const loadData = async (preserveState = false) => {
        if (!preserveState) setLoading(true);
        setRefreshing(true);
        try {
            const [vendorsRes, productsRes] = await Promise.all([
                fetch("/api/admin/vendors"),
                fetch("/api/admin/vendor-products")
            ]);
            
            const vendorsData = await vendorsRes.json();
            const productsData = await productsRes.json();
            
            setVendors(vendorsData.vendors || []);
            if (productsData.success) {
                setProducts(productsData.products || []);
            }
        } catch (err) {
            console.error("Error loading vendor admin data:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const updateVendor = async (vendorId, updates) => {
        try {
            const res = await fetch("/api/admin/vendors", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vendorId, ...updates })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                // Update local list state in real-time
                setVendors(prev => prev.map(v => v._id === vendorId ? { ...v, ...updates } : v));
                // Update currently open details state if matches
                if (selectedVendor && selectedVendor._id === vendorId) {
                    setSelectedVendor(prev => ({ ...prev, ...updates }));
                }
            } else {
                alert(data.error || "Failed to update vendor status");
            }
        } catch (err) {
            console.error(err);
            alert("Error updating vendor status");
        }
    };

    const updateProductStatus = async (productId, status) => {
        try {
            const res = await fetch("/api/admin/vendor-products", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, approvalStatus: status })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                // Update local product catalog state in real-time
                setProducts(prev => prev.map(p => p._id === productId ? { ...p, approvalStatus: status, isApproved: status === 'approved' } : p));
            } else {
                alert(data.error || "Failed to update product status");
            }
        } catch (err) {
            console.error(err);
            alert("Error updating product status");
        }
    };

    // Metrics calculations
    const totalVendorsCount = vendors.length;
    const pendingVendorsCount = vendors.filter(v => v.vendorStatus === 'pending').length;
    const approvedVendorsCount = vendors.filter(v => v.vendorStatus === 'approved').length;
    const totalVendorProductsCount = products.length;

    // Filter logic
    const filteredVendors = vendors.filter(vendor => {
        const matchesStatus = statusFilter === "all" || vendor.vendorStatus === statusFilter;
        const matchesCategory = categoryFilter === "all" || vendor.vendorCategory === categoryFilter;
        
        const bName = vendor.businessName || "";
        const rName = vendor.name || "";
        const rEmail = vendor.email || "";
        const rPhone = vendor.phone || "";
        const rCity = vendor.vendorCity || "";
        const rState = vendor.vendorState || "";

        const matchesQuery = 
            bName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rState.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesStatus && matchesCategory && matchesQuery;
    });

    if (loading) {
        return (
            <div className="space-y-10 animate-pulse pb-20">
                <div className="h-10 bg-gray-200 rounded-xl w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-28 bg-gray-200 rounded-2xl border border-gray-100" />
                    ))}
                </div>
                <div className="h-16 bg-gray-200 rounded-2xl" />
                <div className="h-96 bg-gray-200 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="selection:bg-emerald-500/30 pb-20 text-gray-900">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-950 tracking-tighter">Manufacturing Partners</h1>
                    <p className="text-gray-400 font-medium text-sm">Review registered vendors, verify compliance files, and approve catalog listings in real-time.</p>
                </div>
                <button 
                    onClick={() => loadData(true)} 
                    className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-all flex items-center gap-2 shadow-xs text-gray-700 hover:text-gray-950"
                >
                    <RefreshCw className={refreshing ? 'animate-spin' : ''} size={14} /> Refresh Feed
                </button>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-2">Total Partners</p>
                        <h3 className="text-2xl font-black text-gray-950 tracking-tight">{totalVendorsCount}</h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                        <UserIcon size={20} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-2">Pending Verify</p>
                        <h3 className="text-2xl font-black text-amber-600 tracking-tight">{pendingVendorsCount}</h3>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
                        <Clock size={20} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-2">Active Partners</p>
                        <h3 className="text-2xl font-black text-emerald-600 tracking-tight">{approvedVendorsCount}</h3>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                        <CheckCircle2 size={20} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-2">Total Products</p>
                        <h3 className="text-2xl font-black text-gray-950 tracking-tight">{totalVendorProductsCount}</h3>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
                        <Package size={20} />
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white border border-gray-150 p-5 rounded-2xl shadow-xs mb-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                {/* Tabs */}
                <div className="flex flex-wrap gap-1 bg-gray-50 p-1 rounded-xl">
                    {[
                        { key: "all", label: "All Partners" },
                        { key: "pending", label: "Pending" },
                        { key: "approved", label: "Approved" },
                        { key: "rejected", label: "Rejected" }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setStatusFilter(tab.key)}
                            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                                statusFilter === tab.key
                                    ? "bg-white text-gray-950 shadow-xs border border-gray-200"
                                    : "text-gray-400 hover:text-gray-700"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Category select and search */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                    {/* Category Filter */}
                    <div className="relative w-full sm:w-56">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none text-xs font-bold uppercase tracking-wider text-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 appearance-none"
                        >
                            <option value="all">All Categories</option>
                            <option value="Packaging">Box Manufacturing</option>
                            <option value="Printing">Printing & Branding</option>
                            <option value="Logistics">Logistics & Supply</option>
                            <option value="Gifts">Gift Sourcing</option>
                        </select>
                    </div>

                    {/* Text Search */}
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search company, name, location..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none text-xs font-bold uppercase tracking-wider text-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                    </div>
                </div>
            </div>

            {/* Vendors Table */}
            <div className="bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/75 border-b border-gray-200">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Business & Category</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Representative</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Location</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Capacity / Entity</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredVendors.map((vendor) => (
                                <tr key={vendor._id} className="hover:bg-gray-50/50 transition-colors group">
                                    {/* Business & Category */}
                                    <td className="px-6 py-5">
                                        <div className="flex items-start gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-black text-xs shrink-0 italic">
                                                {vendor.businessName ? vendor.businessName.charAt(0).toUpperCase() : "V"}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-950 uppercase tracking-tight leading-none mb-1.5">{vendor.businessName || "No Business Name"}</p>
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-[9px] font-black text-gray-500 uppercase tracking-wider">
                                                        {getCategoryLabel(vendor.vendorCategory) || "General Supplier"}
                                                    </span>
                                                    {vendor.vendorSpecialties && vendor.vendorSpecialties.map(spec => (
                                                        <span key={spec} className="px-2 py-0.5 bg-emerald-50 border border-emerald-200/50 text-emerald-600 rounded text-[9px] font-black uppercase tracking-wider">
                                                            {spec}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Representative */}
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-bold text-gray-900 leading-none mb-1">{vendor.name}</p>
                                        <div className="flex flex-col gap-0.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                            <span className="flex items-center gap-1 normal-case"><Mail size={10} className="text-emerald-500 shrink-0" /> {vendor.email}</span>
                                            <span className="flex items-center gap-1"><Phone size={10} className="text-emerald-500 shrink-0" /> {vendor.phone}</span>
                                        </div>
                                    </td>

                                    {/* Location */}
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-bold text-gray-900 leading-none mb-1">{vendor.vendorCity || "City N/A"}</p>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{vendor.vendorState || "State N/A"}</p>
                                    </td>

                                    {/* Capacity / Entity */}
                                    <td className="px-6 py-5 text-xs text-gray-500 font-bold">
                                        <p className="text-gray-900 mb-0.5">{vendor.vendorLegalEntity || "Individual / Other"}</p>
                                        <p className="text-[9px] uppercase tracking-widest text-gray-400">
                                            {vendor.vendorYearsInBusiness || "0"} Years in Biz • {vendor.vendorNoOfEmployees || "0"} Employees
                                        </p>
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                            vendor.vendorStatus === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            vendor.vendorStatus === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                            'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}>
                                            {vendor.vendorStatus}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => {
                                                    setSelectedVendor(vendor);
                                                    setDrawerTab("profile");
                                                }}
                                                className="px-4 py-2 bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-gray-900 transition-all flex items-center gap-1"
                                            >
                                                Manage <ChevronRight size={10} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredVendors.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center text-gray-400 font-black uppercase tracking-widest italic">
                                        No manufacturing partners found matching filters
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DETAILS SLIDE-OVER DRAWER */}
            <AnimatePresence>
                {selectedVendor && (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedVendor(null)}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs"
                        />

                        {/* Drawer content container */}
                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-3xl bg-white border-l border-gray-200 h-full flex flex-col shadow-2xl z-10"
                        >
                            {/* Drawer Header */}
                            <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black italic text-lg shrink-0">
                                        {selectedVendor.businessName ? selectedVendor.businessName.charAt(0).toUpperCase() : "V"}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-950 uppercase tracking-tight leading-tight">{selectedVendor.businessName}</h3>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">
                                            Rep: {selectedVendor.name} • Status: <span className={`font-black ${
                                                selectedVendor.vendorStatus === 'approved' ? 'text-emerald-600' :
                                                selectedVendor.vendorStatus === 'rejected' ? 'text-rose-600' :
                                                'text-amber-600'
                                            }`}>{selectedVendor.vendorStatus}</span>
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    {/* Action Buttons */}
                                    <div className="flex gap-1">
                                        {selectedVendor.vendorStatus !== 'approved' && (
                                            <button
                                                onClick={() => updateVendor(selectedVendor._id, { vendorStatus: 'approved' })}
                                                className="px-3 py-1.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
                                            >
                                                <CheckCircle2 size={12} /> Approve Partner
                                            </button>
                                        )}
                                        {selectedVendor.vendorStatus !== 'rejected' && (
                                            <button
                                                onClick={() => updateVendor(selectedVendor._id, { vendorStatus: 'rejected' })}
                                                className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
                                            >
                                                <XCircle size={12} /> Reject
                                            </button>
                                        )}
                                    </div>

                                    <button 
                                        onClick={() => setSelectedVendor(null)}
                                        className="p-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg transition-all text-gray-500 hover:text-gray-900"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Tab Bar */}
                            <div className="flex border-b border-gray-200 px-6 bg-white shrink-0">
                                {[
                                    { key: "profile", label: "Business Details", icon: <Building size={14} /> },
                                    { key: "documents", label: "Compliance Files", icon: <FileText size={14} /> },
                                    { key: "specialties", label: "Specialties", icon: <Briefcase size={14} /> },
                                    { key: "products", label: "Vendor Products", icon: <Package size={14} /> }
                                ].map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setDrawerTab(tab.key)}
                                        className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-black uppercase tracking-wider transition-all -mb-[2px] ${
                                            drawerTab === tab.key
                                                ? "border-emerald-500 text-emerald-600"
                                                : "border-transparent text-gray-400 hover:text-gray-700"
                                        }`}
                                    >
                                        {tab.icon}
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content Panel */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50">
                                
                                {/* TAB 1: PROFILE DETAILS */}
                                {drawerTab === "profile" && (
                                    <div className="space-y-8">
                                        {/* Address section */}
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-200 pb-1.5">
                                                <MapPin size={12} /> Registered Address & Contacts
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-xl border border-gray-200 text-xs font-bold">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Registered Office</p>
                                                    <p className="text-gray-900 text-sm font-black">{selectedVendor.vendorAddressLine1}</p>
                                                    {selectedVendor.vendorAddressLine2 && <p className="text-gray-700">{selectedVendor.vendorAddressLine2}</p>}
                                                    {selectedVendor.vendorAddressLine3 && <p className="text-gray-500 font-medium">Ref: {selectedVendor.vendorAddressLine3}</p>}
                                                    {selectedVendor.vendorAddressLine4 && <p className="text-gray-500 font-medium">{selectedVendor.vendorAddressLine4}</p>}
                                                    <p className="text-emerald-600 font-black mt-2 text-sm">
                                                        {selectedVendor.vendorCity}, {selectedVendor.vendorState} - {selectedVendor.vendorPostalCode}
                                                    </p>
                                                    <p className="text-gray-400 font-black tracking-widest uppercase text-[9px]">{selectedVendor.vendorCountry}</p>
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Primary Email</p>
                                                        <p className="font-black text-emerald-600 text-sm leading-none mt-1">{selectedVendor.email}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Mobile Number</p>
                                                        <p className="font-black text-gray-900 mt-1">{selectedVendor.phone}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Telecommunication</p>
                                                        <p className="font-medium text-gray-600 mt-1">Tel: {selectedVendor.vendorTelephone || "N/A"}</p>
                                                        <p className="font-medium text-gray-600">Fax: {selectedVendor.vendorFax || "N/A"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Owner info section */}
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-200 pb-1.5">
                                                <UserIcon size={12} /> Corporate Identity & Owners
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-xl border border-gray-200 text-xs font-bold">
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Primary Representative</p>
                                                        <p className="font-black text-gray-900 text-sm leading-none mt-1">{selectedVendor.vendorContactOwnerName}</p>
                                                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-wider mt-1">{selectedVendor.vendorDesignation}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Legal Entity Type</p>
                                                        <p className="font-black text-gray-800 mt-1">{selectedVendor.vendorLegalEntity || "N/A"}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Years in Operation</p>
                                                        <p className="font-black text-gray-900 mt-1">{selectedVendor.vendorYearsInBusiness || "0"} Years</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Total Active Workforce</p>
                                                        <p className="font-black text-gray-900 mt-1">{selectedVendor.vendorNoOfEmployees || "0"} Employees</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Pernod Ricard Association?</p>
                                                        <p className="font-black text-gray-800 mt-1">{selectedVendor.vendorAssociatedWithEmployee || "No"}</p>
                                                        {selectedVendor.vendorAssociatedWithEmployee === "Yes" && (
                                                            <p className="text-[10px] text-rose-500 font-bold mt-1.5 italic normal-case">{selectedVendor.vendorEmployeeDetails}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bank section */}
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-200 pb-1.5">
                                                <Landmark size={12} /> Bank & Settlement Details
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-xl border border-gray-200 text-xs font-bold">
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Bank Name</p>
                                                        <p className="font-black text-emerald-600 text-sm leading-none mt-1">{selectedVendor.vendorBankName || "N/A"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Account Number</p>
                                                        <p className="font-black text-gray-900 tracking-wider mt-1">{selectedVendor.vendorBankAccountNo || "N/A"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">IFSC Routing Code</p>
                                                        <p className="font-black text-gray-900 tracking-wider mt-1">{selectedVendor.vendorIfscCode || "N/A"}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Branch Location</p>
                                                        <p className="font-black text-gray-800 mt-1">{selectedVendor.vendorBankBranch || "N/A"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Payment Term Protocol</p>
                                                        <p className="font-black text-gray-850 mt-1">{selectedVendor.vendorPaymentTerms || "N/A"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Covered Under MSMED Act?</p>
                                                        <p className="font-black text-gray-800 mt-1">{selectedVendor.vendorCoveredUnderMSMED || "No"}</p>
                                                        {selectedVendor.vendorCoveredUnderMSMED === "Yes" && (
                                                            <p className="text-[10px] text-emerald-600 font-black mt-1">Reg No: {selectedVendor.vendorMsmedRegNo}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tax info section */}
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-200 pb-1.5">
                                                <Receipt size={12} /> Tax Regulatory Details
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-xl border border-gray-200 text-xs font-bold">
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Permanent Account Number (PAN)</p>
                                                        <p className="font-black text-emerald-600 tracking-wider text-sm mt-1">{selectedVendor.vendorPan || "N/A"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">TDS Assessment Category</p>
                                                        <p className="font-black text-gray-800 mt-1">{selectedVendor.vendorTdsCategory || "N/A"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Authorized Dealer Status</p>
                                                        <p className="font-black text-gray-850 mt-1">{selectedVendor.vendorAuthorisedDealer || "N/A"}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">GSTIN (Central / IGST)</p>
                                                        <p className="font-black text-gray-900 tracking-wider mt-1">{selectedVendor.vendorGstCentral || "N/A"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">GSTIN (Local / SGST)</p>
                                                        <p className="font-black text-gray-900 tracking-wider mt-1">{selectedVendor.vendorGstLocal || "N/A"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Excise & Service Tax</p>
                                                        <p className="text-gray-600 mt-1 leading-normal font-medium">Excise: {selectedVendor.vendorCentralExciseNo || "N/A"}</p>
                                                        <p className="text-gray-600 leading-normal font-medium">Service Tax: {selectedVendor.vendorServiceTaxRegNo || "N/A"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 2: COMPLIANCE DOCUMENTS */}
                                {drawerTab === "documents" && (
                                    <div className="space-y-6">
                                        <div className="bg-white p-5 rounded-xl border border-gray-200">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                                                Verify the legality of the business using these documents uploaded during vendor onboarding:
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {[
                                                    { key: "vendorDocAddressProof", label: "Address Proof" },
                                                    { key: "vendorDocExciseReg", label: "Excise Registration" },
                                                    { key: "vendorDocPan", label: "PAN Card" },
                                                    { key: "vendorDocVatReg", label: "VAT / GST Certificate" },
                                                    { key: "vendorDocServiceTax", label: "Service Tax Certificate" },
                                                    { key: "vendorDocProofLegalEntity", label: "Proof of Legal Entity" },
                                                    { key: "vendorDocCancelledCheque", label: "Cancelled Cheque" },
                                                    { key: "vendorDocOthers", label: "Other Documents" }
                                                ].map((doc) => {
                                                    const fileUrl = selectedVendor[doc.key];
                                                    return (
                                                        <div key={doc.key} className="bg-gray-50 border border-gray-200/80 p-4 rounded-xl flex items-center justify-between text-xs font-bold">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <FileText size={16} className={fileUrl ? "text-emerald-500 shrink-0" : "text-gray-300 shrink-0"} />
                                                                <span className={`uppercase tracking-wider truncate ${fileUrl ? "text-gray-900 font-black" : "text-gray-300"}`}>
                                                                    {doc.label}
                                                                </span>
                                                            </div>
                                                            {fileUrl ? (
                                                                <a 
                                                                    href={fileUrl} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-white font-black uppercase text-[9px] tracking-widest rounded-lg transition-all flex items-center gap-1 shadow-xs"
                                                                >
                                                                    View <ExternalLink size={10} />
                                                                </a>
                                                            ) : (
                                                                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest bg-gray-100 border border-gray-150 px-2 py-1 rounded">
                                                                    Missing
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 3: ASSIGNED SPECIALTIES */}
                                {drawerTab === "specialties" && (
                                    <div className="space-y-6">
                                        <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
                                            <div>
                                                <h4 className="text-sm font-black text-gray-950 uppercase tracking-tight">Assigned Specialties (Max 2)</h4>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                    Grant permissions for this vendor to supply under specific product lines:
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                {[
                                                    "Pizza Box", "Cake Box", "Burger Box", "Food Box", "Wok Box", "CupCake", 
                                                    "CupCake + Bento", "Gifting", "Hamper Box", "Platter", "Loaf", "Pastry", 
                                                    "Chocolate Box", "Macaron", "Brownie", "Wrap Box", "Popcorn", "Carry Bag"
                                                ].map((cat) => {
                                                    const isSelected = selectedSpecialties.includes(cat);
                                                    return (
                                                        <button
                                                            key={cat}
                                                            type="button"
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    setSelectedSpecialties(prev => prev.filter(c => c !== cat));
                                                                } else {
                                                                    if (selectedSpecialties.length >= 2) {
                                                                        alert("A partner can only be assigned a maximum of 2 specialties.");
                                                                        return;
                                                                    }
                                                                    setSelectedSpecialties(prev => [...prev, cat]);
                                                                }
                                                            }}
                                                            className={`px-3.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                                                                isSelected 
                                                                    ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-black shadow-xs" 
                                                                    : "bg-white border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300"
                                                            }`}
                                                        >
                                                            {cat}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <div className="pt-4 border-t border-gray-100 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => updateVendor(selectedVendor._id, { vendorSpecialties: selectedSpecialties })}
                                                    className="px-5 py-2.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1.5"
                                                >
                                                    <Check size={12} /> Save Specialties
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 4: VENDOR PRODUCTS CATALOG */}
                                {drawerTab === "products" && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                                            <div>
                                                <h4 className="text-sm font-black text-gray-950 uppercase tracking-tight">Product Catalog</h4>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">
                                                    Manage this specific partner's uploaded items in real-time
                                                </p>
                                            </div>
                                            <span className="px-2.5 py-1 bg-gray-100 border border-gray-200 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                {products.filter(p => (p.vendorId?._id || p.vendorId) === selectedVendor._id).length} Products
                                            </span>
                                        </div>

                                        <div className="grid gap-4">
                                            {products
                                                .filter(p => (p.vendorId?._id || p.vendorId) === selectedVendor._id)
                                                .map(product => (
                                                    <div 
                                                        key={product._id} 
                                                        className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:border-gray-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                                                    >
                                                        {/* Product Image & Info */}
                                                        <div className="flex items-center gap-4 min-w-0">
                                                            <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden shrink-0">
                                                                <img 
                                                                    src={product.images?.[0] || product.img || "/BOXFOX-1.png"} 
                                                                    alt="" 
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h5 className="text-xs font-black uppercase italic tracking-tight text-gray-950 line-clamp-1">
                                                                    {product.name}
                                                                </h5>
                                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                                    SKU: {product.sku || "PENDING"} • CATEGORY: <span className="text-emerald-600 font-bold">{product.category}</span>
                                                                </p>
                                                                <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                                    <span className="flex items-center gap-1"><Package size={12} className="text-emerald-500 shrink-0" /> {product.dimensions?.length}x{product.dimensions?.width}x{product.dimensions?.height} {product.dimensions?.unit || "inch"}</span>
                                                                    <span className="flex items-center gap-1"><DollarSign size={12} className="text-emerald-500 shrink-0" /> ₹{product.minPrice || product.price || "0"}{product.maxPrice ? ` - ₹${product.maxPrice}` : ""}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Status & Actions */}
                                                        <div className="flex md:flex-col items-end gap-3 w-full md:w-auto border-t md:border-t-0 border-gray-100 pt-3 md:pt-0 shrink-0">
                                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border leading-none ${
                                                                product.approvalStatus === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' :
                                                                product.approvalStatus === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200/50' :
                                                                'bg-amber-50 text-amber-700 border-amber-200/50'
                                                            }`}>
                                                                {product.approvalStatus || "pending"}
                                                            </span>

                                                            <div className="flex gap-1.5 w-full md:w-auto">
                                                                {product.approvalStatus !== 'approved' && (
                                                                    <button
                                                                        onClick={() => updateProductStatus(product._id, 'approved')}
                                                                        className="flex-1 md:flex-none px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1 shadow-xs"
                                                                    >
                                                                        <CheckCircle2 size={10} /> Approve
                                                                    </button>
                                                                )}
                                                                {product.approvalStatus !== 'rejected' && (
                                                                    <button
                                                                        onClick={() => updateProductStatus(product._id, 'rejected')}
                                                                        className="flex-1 md:flex-none px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1"
                                                                    >
                                                                        <XCircle size={10} /> Reject
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                            {products.filter(p => (p.vendorId?._id || p.vendorId) === selectedVendor._id).length === 0 && (
                                                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400 font-black uppercase tracking-widest italic flex flex-col items-center gap-3">
                                                    <AlertCircle size={32} className="text-gray-300" />
                                                    No products found in this partner's catalog
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
