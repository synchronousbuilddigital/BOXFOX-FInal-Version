"use client";
import React, { useState, useEffect } from "react";
import { 
    Plus, Search, Edit, Trash2, RefreshCw, X, UploadCloud, 
    CheckCircle2, AlertTriangle, ArrowUpRight, FileText, 
    Layers, Package, DollarSign, HelpCircle, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import { useAuth } from "@/app/context/AuthContext";
import * as XLSX from 'xlsx';

export default function VendorProductsDashboard() {
    const { user, loading: authLoading } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState("pending"); // pending, approved, rejected
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImages, setIsUploadingImages] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
    const [excelProducts, setExcelProducts] = useState([]);
    const [importLogs, setImportLogs] = useState([]);
    const [isImporting, setIsImporting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        category: "",
        minPrice: "",
        maxPrice: "",
        regular_price: "",
        sale_price: "",
        priceAt1: "",
        priceAt10: "",
        priceAt50: "",
        priceAt100: "",
        priceAt500: "",
        priceAt1000: "",
        triggerValue: 500,
        stock_quantity: 0,
        images: "",
        badge: "",
        hasVariants: false,
        description: "",
        short_description: "",
        brand: "",
        minOrderQuantity: 10,
        length: "",
        width: "",
        height: "",
        unit: "inch",
        pacdoraId: "",
        isActive: true
    });

    const loadProducts = async (preserveState = false) => {
        if (!preserveState) setLoading(true);
        setRefreshing(true);
        try {
            const res = await fetch("/api/vendor/products");
            const data = await res.json();
            if (data.success) {
                setProducts(data.products || []);
            }
        } catch (err) {
            console.error("Failed to load vendor products:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const downloadExcelTemplate = () => {
        const headers = [
            {
                'Product Name': 'Premium Gift Box',
                'SKU': 'GB-PREM-001',
                'Category': user?.vendorSpecialties?.[0] || 'Packaging',
                'Base Price': 25.50,
                'Max Price': 50.00,
                'Min Order Qty': 100,
                'Brand Name': user?.businessName || 'BoxFox Partner',
                'Length': 10,
                'Width': 8,
                'Height': 4,
                'Unit': 'inch',
                'Description': 'Premium textured cardboard gift box for corporate deliveries.',
                'Images': '/BOXFOX-1.png',
                'Price At 1': 60.00,
                'Price At 10': 50.00,
                'Price At 50': 40.00,
                'Price At 100': 30.00,
                'Price At 500': 25.00,
                'Price At 1000': 20.00,
                'Trigger Value': 500,
                'Stock Quantity': 1200
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(headers);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Bulk Products Template");
        XLSX.writeFile(workbook, "boxfox_bulk_upload_template.xlsx");
    };

    const handleExcelFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (!data || data.length === 0) {
                    alert("No rows found in the sheet!");
                    return;
                }

                // Map rows to product payloads and validate
                const specialties = user?.vendorSpecialties || [];
                const parsed = data.map((row, idx) => {
                    const name = row['Product Name'] || row['name'] || '';
                    const sku = row['SKU'] || row['sku'] || '';
                    const category = row['Category'] || row['category'] || specialties[0] || '';
                    const minPrice = parseFloat(row['Base Price'] || row['Base/Min Price'] || row['minPrice'] || row['price'] || 0);
                    const maxPrice = parseFloat(row['Max Price'] || row['maxPrice'] || 0);
                    
                    const length = parseFloat(row['Length'] || row['length'] || 0);
                    const width = parseFloat(row['Width'] || row['width'] || 0);
                    const height = parseFloat(row['Height'] || row['height'] || 0);
                    const unit = row['Unit'] || row['unit'] || 'inch';
                    const minOrderQuantity = parseInt(row['Min Order Qty'] || row['minOrderQuantity'] || 10);
                    const brand = row['Brand Name'] || row['brand'] || user?.businessName || 'BoxFox';
                    const description = row['Description'] || row['description'] || '';
                    const images = row['Images'] || row['images'] || '';

                    // pricing tiers
                    const priceAt1 = parseFloat(row['Price At 1'] || row['priceAt1'] || 0);
                    const priceAt10 = parseFloat(row['Price At 10'] || row['priceAt10'] || 0);
                    const priceAt50 = parseFloat(row['Price At 50'] || row['priceAt50'] || 0);
                    const priceAt100 = parseFloat(row['Price At 100'] || row['priceAt100'] || 0);
                    const priceAt500 = parseFloat(row['Price At 500'] || row['priceAt500'] || 0);
                    const priceAt1000 = parseFloat(row['Price At 1000'] || row['priceAt1000'] || 0);
                    const triggerValue = parseInt(row['Trigger Value'] || row['triggerValue'] || 500);
                    const stock_quantity = parseInt(row['Stock Quantity'] || row['stock_quantity'] || 0);

                    // validations
                    const errors = [];
                    if (!name) errors.push("Missing Product Name");
                    if (!length || !width || !height) errors.push("Invalid/Missing dimensions");
                    if (!minPrice) errors.push("Missing Base Price");
                    if (!specialties.includes(category)) {
                        errors.push(`Category "${category}" is not in assigned specialties: ${specialties.join(', ')}`);
                    }

                    return {
                        id: Date.now() + idx,
                        name,
                        sku,
                        category,
                        minPrice,
                        maxPrice,
                        length,
                        width,
                        height,
                        unit,
                        minOrderQuantity,
                        brand,
                        description,
                        images,
                        priceAt1,
                        priceAt10,
                        priceAt50,
                        priceAt100,
                        priceAt500,
                        priceAt1000,
                        triggerValue,
                        stock_quantity,
                        isValid: errors.length === 0,
                        errorMsg: errors.join(", ")
                    };
                });

                setExcelProducts(parsed);
            } catch (err) {
                console.error(err);
                alert("Error reading Excel file. Make sure it has valid format.");
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = ''; // Reset file input
    };

    const handleExcelImport = async () => {
        const validProducts = excelProducts.filter(p => p.isValid);
        if (validProducts.length === 0) {
            alert("No valid products to import!");
            return;
        }

        setIsImporting(true);
        setImportLogs([]);

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < validProducts.length; i++) {
            const p = validProducts[i];
            try {
                const res = await fetch("/api/vendor/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: p.name,
                        sku: p.sku || undefined,
                        category: p.category,
                        minPrice: p.minPrice,
                        maxPrice: p.maxPrice || undefined,
                        priceAt1: p.priceAt1 || undefined,
                        priceAt10: p.priceAt10 || undefined,
                        priceAt50: p.priceAt50 || undefined,
                        priceAt100: p.priceAt100 || undefined,
                        priceAt500: p.priceAt500 || undefined,
                        priceAt1000: p.priceAt1000 || undefined,
                        triggerValue: p.triggerValue || 500,
                        stock_quantity: p.stock_quantity || 0,
                        minOrderQuantity: p.minOrderQuantity,
                        brand: p.brand,
                        description: p.description,
                        images: p.images,
                        length: p.length,
                        width: p.width,
                        height: p.height,
                        unit: p.unit
                    })
                });

                const data = await res.json();
                if (res.ok && data.success) {
                    successCount++;
                    setImportLogs(prev => [...prev, `✅ Imported: "${p.name}" successfully.`]);
                } else {
                    failCount++;
                    setImportLogs(prev => [...prev, `❌ Failed: "${p.name}" (${data.error || 'Server error'}).`]);
                }
            } catch (err) {
                failCount++;
                setImportLogs(prev => [...prev, `❌ Error: "${p.name}" (Connection error).`]);
            }
        }

        setIsImporting(false);
        loadProducts(true);
        alert(`Import complete! ${successCount} products imported, ${failCount} failed.`);
        if (failCount === 0) {
            setIsExcelModalOpen(false);
            setExcelProducts([]);
            setImportLogs([]);
        }
    };

    useEffect(() => {
        if (user) {
            loadProducts();
            const specialties = user.vendorSpecialties || [];
            if (specialties.length > 0) {
                setFormData(prev => ({ ...prev, category: specialties[0] }));
            }
            if (user.businessName) {
                setFormData(prev => ({ ...prev, brand: user.businessName }));
            }
        }
    }, [user]);

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setIsUploadingImages(true);
        try {
            const uploadPromises = files.map(async (file) => {
                const formDataObj = new FormData();
                formDataObj.append("image", file);
                formDataObj.append("type", "product");

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formDataObj
                });

                if (!response.ok) return null;
                const data = await response.json();
                return data.url || null;
            });

            const results = await Promise.all(uploadPromises);
            const uploadedUrls = results.filter(Boolean);

            if (uploadedUrls.length > 0) {
                const currentImages = formData.images
                    ? formData.images.split(",").map(u => u.trim()).filter(Boolean)
                    : [];
                setFormData({
                    ...formData,
                    images: [...currentImages, ...uploadedUrls].join(", ")
                });
            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload images");
        } finally {
            setIsUploadingImages(false);
            e.target.value = "";
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch("/api/vendor/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    minPrice: parseFloat(formData.minPrice) || undefined,
                    maxPrice: parseFloat(formData.maxPrice) || undefined,
                    regular_price: formData.regular_price || undefined,
                    sale_price: formData.sale_price || undefined,
                    priceAt1: formData.priceAt1 !== "" ? parseFloat(formData.priceAt1) : undefined,
                    priceAt10: formData.priceAt10 !== "" ? parseFloat(formData.priceAt10) : undefined,
                    priceAt50: formData.priceAt50 !== "" ? parseFloat(formData.priceAt50) : undefined,
                    priceAt100: formData.priceAt100 !== "" ? parseFloat(formData.priceAt100) : undefined,
                    priceAt500: formData.priceAt500 !== "" ? parseFloat(formData.priceAt500) : undefined,
                    priceAt1000: formData.priceAt1000 !== "" ? parseFloat(formData.priceAt1000) : undefined,
                    triggerValue: formData.triggerValue !== "" ? parseInt(formData.triggerValue) : 500,
                    stock_quantity: formData.stock_quantity !== "" ? parseInt(formData.stock_quantity) : 0
                })
            });
            const data = await res.json();
            if (data.success) {
                setSuccessMsg("Product submitted for admin approval!");
                loadProducts(true);
                setTimeout(() => {
                    setIsModalOpen(false);
                    setSuccessMsg("");
                    setFormData({
                        name: "",
                        sku: "",
                        category: user?.vendorSpecialties?.[0] || "",
                        minPrice: "",
                        maxPrice: "",
                        regular_price: "",
                        sale_price: "",
                        priceAt1: "",
                        priceAt10: "",
                        priceAt50: "",
                        priceAt100: "",
                        priceAt500: "",
                        priceAt1000: "",
                        triggerValue: 500,
                        stock_quantity: 0,
                        images: "",
                        badge: "",
                        hasVariants: false,
                        description: "",
                        short_description: "",
                        brand: user?.businessName || "",
                        minOrderQuantity: 10,
                        length: "",
                        width: "",
                        height: "",
                        unit: "inch",
                        pacdoraId: "",
                        isActive: true
                    });
                }, 1500);
            } else {
                alert(data.error || "Failed to save product");
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred while saving the product");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (product) => {
        setFormData({
            _id: product._id,
            name: product.name,
            sku: product.sku || "",
            category: product.category,
            minPrice: product.minPrice || "",
            maxPrice: product.maxPrice || "",
            regular_price: product.regular_price || "",
            sale_price: product.sale_price || "",
            priceAt1: product.priceAt1 !== undefined ? product.priceAt1 : "",
            priceAt10: product.priceAt10 !== undefined ? product.priceAt10 : "",
            priceAt50: product.priceAt50 !== undefined ? product.priceAt50 : "",
            priceAt100: product.priceAt100 !== undefined ? product.priceAt100 : "",
            priceAt500: product.priceAt500 !== undefined ? product.priceAt500 : "",
            priceAt1000: product.priceAt1000 !== undefined ? product.priceAt1000 : "",
            triggerValue: product.triggerValue !== undefined ? product.triggerValue : 500,
            stock_quantity: product.stock_quantity !== undefined ? product.stock_quantity : 0,
            images: Array.isArray(product.images) ? product.images.join(", ") : (product.img || ""),
            badge: product.badge || "",
            hasVariants: product.type === "variable",
            description: product.description || "",
            short_description: product.short_description || "",
            brand: product.brand || "",
            minOrderQuantity: product.minOrderQuantity || 10,
            length: product.dimensions?.length || "",
            width: product.dimensions?.width || "",
            height: product.dimensions?.height || "",
            unit: product.dimensions?.unit || "inch",
            pacdoraId: product.pacdoraId || "",
            isActive: product.isActive !== false
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            const res = await fetch(`/api/vendor/products?id=${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                loadProducts(true);
            } else {
                const errData = await res.json();
                alert(errData.error || "Failed to delete product");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesTab = (p.approvalStatus || "pending") === activeTab;
        const matchesQuery = 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.sku || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesQuery;
    });

    const specialties = user?.vendorSpecialties || [];

    if (authLoading || (loading && !products.length)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 font-black uppercase tracking-widest italic">
                Loading Vendor Portal...
            </div>
        );
    }

    if (user && (user.role !== "vendor" || user.vendorStatus !== "approved")) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-950 gap-4 p-6 text-center">
                <AlertTriangle className="text-amber-600 w-16 h-16 animate-bounce" />
                <h1 className="text-3xl font-black uppercase tracking-wider">Access Restrained</h1>
                <p className="max-w-md text-gray-500 text-xs font-semibold uppercase tracking-wider leading-relaxed">
                    This workspace is reserved for approved manufacturing partners. Your current status is: <span className="text-amber-600 font-bold">{user.vendorStatus}</span>
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-955 selection:bg-emerald-500/30 pb-32">
            <Navbar />
            
            <div className="max-w-[1400px] mx-auto px-6 py-32">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
                    <div>
                        <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4 italic">Manufacturing Portal</p>
                        <h1 className="text-6xl text-gray-950 font-black uppercase tracking-tighter italic">Manage <br /> Products</h1>
                        <div className="flex items-center gap-2 mt-4">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Specialties:</span>
                            {specialties.length > 0 ? (
                                specialties.map(s => (
                                    <span key={s} className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-wider">
                                        {s}
                                    </span>
                                ))
                            ) : (
                                <span className="text-[8px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                    <AlertTriangle size={10} /> Pending Assignment
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                        <button 
                            onClick={() => loadProducts()} 
                            className="px-6 py-4 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2 shadow-xs"
                        >
                            <RefreshCw className={refreshing ? "animate-spin" : ""} size={14} /> Refresh Feed
                        </button>

                        <button
                            disabled={specialties.length === 0}
                            onClick={() => setIsExcelModalOpen(true)}
                            className="px-6 py-4 bg-white border border-gray-200 text-gray-950 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <UploadCloud size={14} className="text-emerald-500" /> Excel Upload
                        </button>
                        
                        <button
                            disabled={specialties.length === 0}
                            onClick={() => setIsModalOpen(true)}
                            className="px-8 py-4 bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10 disabled:opacity-40 disabled:hover:bg-emerald-500 disabled:cursor-not-allowed"
                        >
                            <Plus size={16} /> Add Product
                        </button>
                    </div>
                </div>

                {/* Filter and Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white border border-gray-200 p-6 rounded-[2.5rem] shadow-xs mb-12">
                    {/* Status Tabs */}
                    <div className="flex gap-2">
                        {["pending", "approved", "rejected"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                    activeTab === tab 
                                        ? "bg-gray-950 text-white border-gray-950 shadow-lg" 
                                        : "bg-gray-55 border-gray-200 text-gray-500 hover:bg-gray-100"
                                }`}
                            >
                                {tab === "pending" ? "Pending Approval" : tab}
                            </button>
                        ))}
                    </div>

                    {/* Search Field */}
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search your products..."
                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-emerald-500 text-xs font-bold uppercase tracking-wider text-gray-950"
                        />
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProducts.map((product) => (
                        <div key={product._id} className="bg-white border border-gray-200/80 rounded-[3rem] p-8 hover:shadow-xl hover:shadow-gray-200/40 transition-all flex flex-col justify-between relative overflow-hidden group min-h-[380px]">
                            
                            <div>
                                {/* Img & Basic Details */}
                                <div className="flex items-start justify-between gap-4 mb-6">
                                    <div className="w-20 h-20 bg-gray-50 rounded-2xl border border-gray-200/60 overflow-hidden shrink-0">
                                        <img 
                                            src={product.images?.[0] || product.img || "/BOXFOX-1.png"} 
                                            alt=""
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-black uppercase italic tracking-tight line-clamp-2 text-gray-950 group-hover:text-emerald-600 transition-colors">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase">
                                                SKU: {product.sku || "PENDING"}
                                            </p>
                                            <span className={`px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-wider ${
                                                product.stock_quantity > 0 
                                                    ? "bg-emerald-50 border border-emerald-100 text-emerald-600" 
                                                    : "bg-red-50 border border-red-100 text-red-600"
                                            }`}>
                                                {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Specifications Info */}
                                <div className="space-y-3 my-6">
                                    <div className="flex items-center gap-3 text-gray-500 text-[10px] font-black uppercase tracking-wider">
                                        <Layers size={14} className="text-emerald-500" />
                                        <span>Category: <span className="text-emerald-600 font-bold">{product.category}</span></span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-500 text-[10px] font-black uppercase tracking-wider">
                                        <Package size={14} className="text-emerald-500" />
                                        <span>
                                            Dimensions: {product.dimensions?.length} x {product.dimensions?.width} x {product.dimensions?.height} {product.dimensions?.unit || "inch"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-500 text-[10px] font-black uppercase tracking-wider">
                                        <DollarSign size={14} className="text-emerald-500" />
                                        <span>
                                            Price: ₹{product.minPrice || product.price || "0"}{product.maxPrice ? ` - ₹${product.maxPrice}` : ""}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-500 text-[10px] font-black uppercase tracking-wider">
                                        <DollarSign size={14} className="text-emerald-500" />
                                        <span>
                                            Net Payout (est): <span className="text-emerald-600 font-bold">₹{((product.minPrice || product.price || 0) * (1 - (user?.commissionRate || 0) / 100)).toFixed(2)}</span> <span className="text-[9px] text-gray-400 font-medium">({user?.commissionRate || 0}% platform cut)</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-500 text-[10px] font-black uppercase tracking-wider">
                                        <Package size={14} className="text-emerald-500" />
                                        <span>
                                            Stock Level: <span className={`font-bold ${product.stock_quantity > 0 ? "text-emerald-600" : "text-red-500"}`}>{product.stock_quantity !== undefined ? product.stock_quantity : 0} Units</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="border-t border-gray-100 pt-6 flex items-center justify-between mt-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                    product.approvalStatus === "approved" ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                                    product.approvalStatus === "rejected" ? "bg-red-50 border-red-100 text-red-700" :
                                    "bg-amber-50 border-amber-100 text-amber-700"
                                }`}>
                                    {product.approvalStatus}
                                </span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleEdit(product)}
                                        className="p-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl text-gray-600 hover:text-emerald-600 transition-all"
                                        title="Edit Product"
                                    >
                                        <Edit size={14} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(product._id)}
                                        className="p-2.5 bg-gray-50 border border-gray-200 hover:bg-red-50 hover:text-red-600 rounded-xl text-gray-600 transition-all"
                                        title="Delete Product"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredProducts.length === 0 && (
                        <div className="col-span-full py-32 text-center text-gray-400 font-black uppercase tracking-widest italic flex flex-col items-center gap-4">
                            <Package size={40} className="text-gray-300" />
                            No products found in this tab
                        </div>
                    )}
                </div>

                {/* Empty State when no specialties assigned */}
                {specialties.length === 0 && (
                    <div className="mt-8 bg-amber-50 border border-amber-100 p-8 rounded-3xl flex items-center gap-6">
                        <AlertTriangle className="text-amber-600 shrink-0" size={32} />
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-amber-700 mb-1">Onboarding Pending assignment</h4>
                            <p className="text-[10px] text-gray-600 uppercase leading-relaxed font-semibold">
                                Before you can upload any products/boxes, the Administrator must assign your specialties (up to 2 categories) in the partner network. Once assigned, you will be restricted to upload products corresponding only to those categories.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* ADD/EDIT MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-md overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-4xl bg-white border border-gray-200 rounded-[3rem] p-8 lg:p-12 shadow-2xl relative max-h-[90vh] overflow-y-auto"
                        >
                            {/* Close */}
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-8 right-8 p-3 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl transition-all"
                            >
                                <X size={18} className="text-gray-600" />
                            </button>

                            <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-1 italic">
                                Vendor Portal
                            </p>
                            <h2 className="text-3xl font-black uppercase italic mb-8 border-b border-gray-200 pb-4 text-gray-950">
                                {formData._id ? "Edit Product File" : "Upload New Product"}
                            </h2>

                            {successMsg ? (
                                <div className="py-16 text-center space-y-4">
                                    <CheckCircle2 size={48} className="text-emerald-500 mx-auto animate-pulse" />
                                    <p className="text-xs font-black uppercase tracking-widest text-emerald-600">{successMsg}</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSave} className="space-y-8 text-xs font-bold uppercase tracking-wider text-gray-700">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        
                                        {/* Block 1: Details */}
                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 block mb-2">Product Name *</label>
                                                <input 
                                                    required
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="e.g. Premium Corrugated Pizza Box"
                                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-gray-950"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-black text-gray-400 block mb-2">SKU (Optional)</label>
                                                    <input 
                                                        type="text"
                                                        value={formData.sku}
                                                        onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                                        placeholder="Leave blank for auto-gen"
                                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-gray-950"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-[10px] font-black text-gray-400 block mb-2">Category (Specialties Only) *</label>
                                                    <select
                                                        required
                                                        value={formData.category}
                                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-gray-955"
                                                    >
                                                        {specialties.map(s => (
                                                            <option key={s} value={s} className="bg-white text-gray-950">{s}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-black text-gray-400 block mb-2">Base/Min Price (₹) *</label>
                                                    <input 
                                                        required
                                                        type="number"
                                                        step="0.01"
                                                        value={formData.minPrice}
                                                        onChange={e => setFormData({ ...formData, minPrice: e.target.value })}
                                                        placeholder="e.g. 15.00"
                                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-gray-955"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-[10px] font-black text-gray-400 block mb-2">Max Price (₹) (Optional)</label>
                                                    <input 
                                                        type="number"
                                                        step="0.01"
                                                        value={formData.maxPrice}
                                                        onChange={e => setFormData({ ...formData, maxPrice: e.target.value })}
                                                        placeholder="e.g. 45.00"
                                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-gray-955"
                                                    />
                                                </div>
                                            </div>

                                            {/* Commission Calculator Breakdown */}
                                            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Payout Breakdown</p>
                                                        <p className="text-[8px] text-gray-500 normal-case mt-0.5 leading-normal">
                                                            Platform fee deduction rate of <strong className="text-emerald-700 font-black">{user?.commissionRate || 0}%</strong> will be applied.
                                                        </p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-[8px] text-gray-400 font-bold uppercase">Estimated Net Payout</p>
                                                        <p className="text-base font-black text-emerald-700 mt-0.5">
                                                            ₹{(parseFloat(formData.minPrice || 0) * (1 - (user?.commissionRate || 0) / 100)).toFixed(2)} <span className="text-[8px] text-gray-400 font-medium">/ unit</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                {user?.commissionRate > 20 && (
                                                    <div className="mt-3 text-[9px] text-amber-700 font-bold bg-amber-50 border border-amber-200/50 p-2.5 rounded-xl flex items-center gap-1.5 normal-case">
                                                        <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                                                        <span>Warning: A high platform commission rate of {user.commissionRate}% is applied to your account. Your estimated payout will be significantly reduced.</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                 <div>
                                                     <label className="text-[10px] font-black text-gray-400 block mb-2">Min Order Qty *</label>
                                                     <input 
                                                         required
                                                         type="number"
                                                         value={formData.minOrderQuantity}
                                                         onChange={e => setFormData({ ...formData, minOrderQuantity: e.target.value })}
                                                         className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-gray-955"
                                                     />
                                                 </div>
                                                 <div>
                                                     <label className="text-[10px] font-black text-gray-400 block mb-2">Brand Name</label>
                                                     <input 
                                                         type="text"
                                                         value={formData.brand}
                                                         onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                                         placeholder="e.g. BoxFox"
                                                         className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-gray-955"
                                                     />
                                                 </div>
                                             </div>

                                             {/* Tiered Pricing Tiers */}
                                             <div className="border-t border-gray-150 pt-6 mt-6 space-y-4">
                                                 <h4 className="text-[10px] font-black text-emerald-600 block">Tiered Pricing (₹ per Unit)</h4>
                                                 <div className="grid grid-cols-3 gap-3">
                                                     <div>
                                                         <label className="text-[8px] font-black text-gray-400 block mb-1">Qty 1</label>
                                                         <input 
                                                             type="number"
                                                             step="0.01"
                                                             value={formData.priceAt1}
                                                             onChange={e => setFormData({ ...formData, priceAt1: e.target.value })}
                                                             placeholder="Base"
                                                             className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-gray-955 text-center text-xs"
                                                         />
                                                     </div>
                                                     <div>
                                                         <label className="text-[8px] font-black text-gray-400 block mb-1">Qty 10</label>
                                                         <input 
                                                             type="number"
                                                             step="0.01"
                                                             value={formData.priceAt10}
                                                             onChange={e => setFormData({ ...formData, priceAt10: e.target.value })}
                                                             placeholder="Tier 10"
                                                             className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-gray-955 text-center text-xs"
                                                         />
                                                     </div>
                                                     <div>
                                                         <label className="text-[8px] font-black text-gray-400 block mb-1">Qty 50</label>
                                                         <input 
                                                             type="number"
                                                             step="0.01"
                                                             value={formData.priceAt50}
                                                             onChange={e => setFormData({ ...formData, priceAt50: e.target.value })}
                                                             placeholder="Tier 50"
                                                             className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-gray-955 text-center text-xs"
                                                         />
                                                     </div>
                                                     <div>
                                                         <label className="text-[8px] font-black text-gray-400 block mb-1">Qty 100</label>
                                                         <input 
                                                             type="number"
                                                             step="0.01"
                                                             value={formData.priceAt100}
                                                             onChange={e => setFormData({ ...formData, priceAt100: e.target.value })}
                                                             placeholder="Tier 100"
                                                             className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-gray-955 text-center text-xs"
                                                         />
                                                     </div>
                                                     <div>
                                                         <label className="text-[8px] font-black text-gray-400 block mb-1">Qty 500</label>
                                                         <input 
                                                             type="number"
                                                             step="0.01"
                                                             value={formData.priceAt500}
                                                             onChange={e => setFormData({ ...formData, priceAt500: e.target.value })}
                                                             placeholder="Tier 500"
                                                             className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-gray-955 text-center text-xs"
                                                         />
                                                     </div>
                                                     <div>
                                                         <label className="text-[8px] font-black text-gray-400 block mb-1">Qty 1000</label>
                                                         <input 
                                                             type="number"
                                                             step="0.01"
                                                             value={formData.priceAt1000}
                                                             onChange={e => setFormData({ ...formData, priceAt1000: e.target.value })}
                                                             placeholder="Tier 1000"
                                                             className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-gray-955 text-center text-xs"
                                                         />
                                                     </div>
                                                 </div>
                                             </div>

                                             {/* Stock Levels & Large Order Trigger */}
                                             <div className="grid grid-cols-2 gap-4 border-t border-gray-150 pt-6 mt-6">
                                                 <div>
                                                     <label className="text-[10px] font-black text-gray-400 block mb-2">Stock Inventory *</label>
                                                     <input 
                                                         required
                                                         type="number"
                                                         value={formData.stock_quantity}
                                                         onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })}
                                                         placeholder="e.g. 1500"
                                                         className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-gray-955"
                                                     />
                                                 </div>
                                                 <div>
                                                     <label className="text-[10px] font-black text-gray-400 block mb-2">B2B Quote Trigger Qty *</label>
                                                     <input 
                                                         required
                                                         type="number"
                                                         value={formData.triggerValue}
                                                         onChange={e => setFormData({ ...formData, triggerValue: e.target.value })}
                                                         placeholder="e.g. 500"
                                                         className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-gray-955"
                                                     />
                                                 </div>
                                             </div>
                                        </div>

                                        {/* Block 2: Dimensions & Media */}
                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 block mb-2">Dimensions (L x W x H) & Unit *</label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    <input 
                                                        required
                                                        type="number"
                                                        step="0.1"
                                                        placeholder="L"
                                                        value={formData.length}
                                                        onChange={e => setFormData({ ...formData, length: e.target.value })}
                                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-gray-955 text-center"
                                                    />
                                                    <input 
                                                        required
                                                        type="number"
                                                        step="0.1"
                                                        placeholder="W"
                                                        value={formData.width}
                                                        onChange={e => setFormData({ ...formData, width: e.target.value })}
                                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-gray-955 text-center"
                                                    />
                                                    <input 
                                                        required
                                                        type="number"
                                                        step="0.1"
                                                        placeholder="H"
                                                        value={formData.height}
                                                        onChange={e => setFormData({ ...formData, height: e.target.value })}
                                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-gray-955 text-center"
                                                    />
                                                    <select
                                                        value={formData.unit}
                                                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-gray-955"
                                                    >
                                                        <option value="inch" className="bg-white">INCH</option>
                                                        <option value="cm" className="bg-white">CM</option>
                                                        <option value="mm" className="bg-white">MM</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 block mb-2">Description</label>
                                                <textarea 
                                                    value={formData.description}
                                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                    placeholder="Details about raw material quality, flaps, usage, printing options..."
                                                    rows={3}
                                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-gray-955 font-sans text-xs tracking-normal"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 block mb-2">Product Images (CSV URLs or Upload) *</label>
                                                <textarea 
                                                    required
                                                    value={formData.images}
                                                    onChange={e => setFormData({ ...formData, images: e.target.value })}
                                                    placeholder="Comma separated image URLs"
                                                    rows={2}
                                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-gray-955 font-sans text-xs tracking-normal mb-2"
                                                />
                                                <label className="w-full p-4 border-2 border-dashed border-gray-200 rounded-2xl hover:border-emerald-500/50 cursor-pointer flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-all text-gray-400 hover:text-emerald-600">
                                                    <UploadCloud size={20} className={isUploadingImages ? "animate-bounce text-emerald-500" : ""} />
                                                    <span className="text-[9px] font-black uppercase tracking-wider">{isUploadingImages ? "Uploading File..." : "Select Images to Upload"}</span>
                                                    <input 
                                                        disabled={isUploadingImages}
                                                        type="file" 
                                                        multiple 
                                                        accept="image/*" 
                                                        onChange={handleImageUpload} 
                                                        className="hidden" 
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                    </div>

                                    {/* Actions */}
                                    <div className="border-t border-gray-200 pt-8 mt-8 flex justify-end gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-8 py-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                                        >
                                            Discard
                                        </button>
                                        <button
                                            disabled={isSaving || isUploadingImages}
                                            type="submit"
                                            className="px-10 py-5 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/10 flex items-center gap-2"
                                        >
                                            {isSaving && <RefreshCw size={14} className="animate-spin" />}
                                            {formData._id ? "Update Product" : "Submit for Approval"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* EXCEL BULK UPLOAD WIZARD MODAL */}
            <AnimatePresence>
                {isExcelModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-md overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-5xl bg-white border border-gray-200 rounded-[3rem] p-8 lg:p-12 shadow-2xl relative max-h-[90vh] flex flex-col justify-between overflow-hidden"
                        >
                            {/* Close */}
                            <button 
                                onClick={() => { setIsExcelModalOpen(false); setExcelProducts([]); setImportLogs([]); }}
                                className="absolute top-8 right-8 p-3 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl transition-all"
                                disabled={isImporting}
                            >
                                <X size={18} className="text-gray-600" />
                            </button>

                            <div className="overflow-y-auto pr-2 flex-1 space-y-6">
                                <div>
                                    <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-1 italic">
                                        Partner Procurement
                                    </p>
                                    <h2 className="text-3xl font-black uppercase italic text-gray-955 border-b border-gray-200 pb-4">
                                        Excel Import Registry
                                    </h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-2">
                                        Generate and download our custom product template, fill in your catalog parameters, and upload it back for verification.
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-6 rounded-3xl border border-gray-200/60">
                                    <button
                                        onClick={downloadExcelTemplate}
                                        className="px-6 py-3.5 bg-white border border-gray-250 text-gray-950 font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2 shadow-xs"
                                    >
                                        <FileText size={14} className="text-emerald-500" /> Download Sheet Template
                                    </button>

                                    <label className="px-6 py-3.5 bg-emerald-500 text-white font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-emerald-600 cursor-pointer transition-all flex items-center gap-2 shadow-md shadow-emerald-500/10">
                                        <UploadCloud size={14} /> Select filled Spreadsheet
                                        <input
                                            type="file"
                                            accept=".xlsx, .xls, .csv"
                                            onChange={handleExcelFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                {excelProducts.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-955">
                                                Verification Output ({excelProducts.length} entries parsed)
                                            </h4>
                                            <div className="flex gap-4 text-[9px] font-black uppercase tracking-wider">
                                                <span className="text-emerald-600">Valid: {excelProducts.filter(p=>p.isValid).length}</span>
                                                <span className="text-red-500">Errors: {excelProducts.filter(p=>!p.isValid).length}</span>
                                            </div>
                                        </div>

                                        <div className="border border-gray-200 rounded-2xl overflow-hidden max-h-[250px] overflow-y-auto">
                                            <table className="w-full text-[9px] font-bold uppercase tracking-wider text-left border-collapse">
                                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-400 sticky top-0 z-10">
                                                    <tr>
                                                        <th className="p-3">Product Name</th>
                                                        <th className="p-3">Category</th>
                                                        <th className="p-3 text-center">Dimensions</th>
                                                        <th className="p-3 text-right">Base Price</th>
                                                        <th className="p-3 text-right">Stock</th>
                                                        <th className="p-3">Verification Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 text-gray-700 bg-white">
                                                    {excelProducts.map((p) => (
                                                        <tr key={p.id} className={p.isValid ? "hover:bg-gray-50/50" : "bg-red-50/20 hover:bg-red-50/30"}>
                                                            <td className="p-3 truncate max-w-[150px] font-black text-gray-955">{p.name || "Untitled"}</td>
                                                            <td className="p-3 text-emerald-600 font-black">{p.category}</td>
                                                            <td className="p-3 text-center">{p.length}x{p.width}x{p.height} {p.unit}</td>
                                                            <td className="p-3 text-right">₹{p.minPrice}</td>
                                                            <td className="p-3 text-right">{p.stock_quantity}</td>
                                                            <td className="p-3">
                                                                {p.isValid ? (
                                                                    <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={12} /> Ready for Import</span>
                                                                ) : (
                                                                    <span className="text-red-500 flex items-center gap-1"><AlertTriangle size={12} /> {p.errorMsg}</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {importLogs.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-955">Fulfillment Logs</h4>
                                        <div className="bg-gray-50 p-4 border border-gray-200 rounded-2xl max-h-[120px] overflow-y-auto text-[9px] font-mono normal-case space-y-1">
                                            {importLogs.map((log, idx) => (
                                                <div key={idx}>{log}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions footer */}
                            <div className="border-t border-gray-200 pt-6 mt-6 flex justify-end gap-4">
                                <button
                                    type="button"
                                    disabled={isImporting}
                                    onClick={() => { setIsExcelModalOpen(false); setExcelProducts([]); setImportLogs([]); }}
                                    className="px-8 py-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-40"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={isImporting || excelProducts.filter(p=>p.isValid).length === 0}
                                    onClick={handleExcelImport}
                                    className="px-10 py-5 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/10 flex items-center gap-2 disabled:opacity-40"
                                >
                                    {isImporting && <RefreshCw size={14} className="animate-spin" />}
                                    Import Valid Products ({excelProducts.filter(p=>p.isValid).length})
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
