"use client";
import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    RefreshCw,
    X,
    Image as ImageIcon,
    CheckCircle2,
    UploadCloud,
    Loader2,
    Copy,
    Download,
    Link2,
    Star,
    FileText,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { runBoxEngine, calculateTiersFromBase } from '@/lib/boxEngine';

// Memoized ProductRow component to prevent unnecessary re-renders
const ProductRow = React.memo(({ product, onEdit, onDelete, onDuplicate, onRegenerateSku, onToggleFeatured, onToggleStatus, formatDimensions }) => (
    <tr className="hover:bg-gray-50/50 transition-colors group">
        <td className="px-8 py-5">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                    <img
                        src={product.img || "/BOXFOX-1.png"}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                            e.target.src = "/BOXFOX-1.png";
                            e.target.onerror = null; // Prevent infinite loops
                        }}
                    />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-gray-950 line-clamp-1">{product.name}</p>
                        {product.badge && (
                            <span className="px-1.5 py-0.5 bg-accent/10 text-accent rounded text-[8px] font-black uppercase tracking-tighter">
                                {product.badge}
                            </span>
                        )}
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">ID: {product.id}</p>
                    <div className="flex gap-2 mt-1">
                        {product.patternImg && (
                            <span title="Internal Pattern Attached" className="flex items-center gap-1 text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                                <FileText size={10} /> Pattern
                            </span>
                        )}
                        {product.dielineImg && (
                            <span title="Dieline Attached" className="flex items-center gap-1 text-[8px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                                <Download size={10} /> Dieline
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </td>
        <td className="px-8 py-5">
            <span className="text-[11px] font-black text-gray-950 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm whitespace-nowrap block w-fit">
                {product.sku || 'PENDING'}
            </span>
        </td>
        <td className="px-8 py-5">
            <div className="flex flex-col gap-1">
                <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                    {product.category}
                </span>
                {product.pacdoraId && (
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-widest text-center">
                        3D READY
                    </span>
                )}
            </div>
        </td>
        <td className="px-8 py-5">
            {product.priceAt1 || product.priceAt100 ? (
                <div className="flex flex-col">
                    <span className="text-xs font-black text-gray-950">₹{product.priceAt1 || '0.00'} - ₹{product.priceAt100 || '0.00'}</span>
                    <span className="text-[9px] text-gray-400 font-medium uppercase tracking-widest">Per Unit (1-100)</span>
                </div>
            ) : (
                <span className="text-sm font-black text-gray-950">₹{product.price || '0'}</span>
            )}
        </td>
        <td className="px-8 py-5">
            {(() => {
                const d = formatDimensions(product.dimensions, product.name);
                if (!d) return <span className="text-[10px] text-gray-300 font-bold">—</span>;
                return (
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-gray-700 whitespace-nowrap">{d.inch}</span>
                        <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">{d.cm}</span>
                        <span className="text-[10px] font-bold text-gray-300 whitespace-nowrap">{d.mm}</span>
                    </div>
                );
            })()}
        </td>
        <td className="px-8 py-5">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => onToggleStatus(product)}
                    className={`w-10 h-5 rounded-full transition-all duration-300 relative shrink-0 ${product.isActive !== false ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-gray-200'}`}
                >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${product.isActive !== false ? 'right-0.5' : 'left-0.5'}`} />
                </button>
                <span className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${product.isActive === false ? 'text-gray-400' : (product.outOfStock ? 'text-red-600' : 'text-emerald-600')}`}>
                    {product.isActive === false ? 'Inactive' : (product.outOfStock ? 'Out of Stock' : 'Active')}
                </span>
            </div>
        </td>
        <td className="px-8 py-5">
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(product)} title="Edit" className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"><Edit size={16} /></button>
                {product.patternImg && (
                    <button onClick={() => window.open(product.patternImg, '_blank')} title="View Internal Pattern" className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                        <FileText size={16} />
                    </button>
                )}
                {product.dielineImg && (
                    <button onClick={() => window.open(product.dielineImg, '_blank')} title="View Dieline" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <Download size={16} />
                    </button>
                )}
                <button onClick={() => onDuplicate(product)} title="Duplicate" className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"><Copy size={16} /></button>
                <button onClick={() => onRegenerateSku(product)} title="Regenerate SKU" className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"><RefreshCw size={16} /></button>
                <button onClick={() => onDelete(product._id || product.id)} title="Delete" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
            </div>
        </td>
    </tr>
));

ProductRow.displayName = 'ProductRow';

const DEFAULT_CATEGORIES = [
    { name: "Pizza Box", index: "01", stats: "HEAT-SAFE", needsBranding: true, image: "/categories/cat_cake.png" },
    { name: "Cake Box", index: "02", stats: "OIL-SAFE", needsBranding: false, image: "/categories/cat_cake.png" },
    { name: "Burger Box", index: "03", stats: "DURABLE", needsBranding: true, image: "/categories/cat_cake.png" },
    { name: "Food Box", index: "04", stats: "FRESH", needsBranding: true, image: "/categories/cat_bento.png" },
    { name: "Wok Box", index: "05", stats: "LEAK-PROOF", needsBranding: true, image: "/categories/cat_cupcake.png" },
    { name: "CupCake", index: "06", stats: "DISPLAY", needsBranding: false, image: "/categories/cat_cupcake.png" },
    { name: "CupCake + Bento", index: "07", stats: "VERSATILE", needsBranding: true, image: "/categories/cat_bento.png" },
    { name: "Gifting", index: "08", stats: "PREMIUM", needsBranding: false, image: "/categories/cat_gifting.png" },
    { name: "Hamper Box", index: "09", stats: "DURABLE", needsBranding: false, image: "/categories/cat_hamper.png" },
    { name: "Platter", index: "10", stats: "PRESENTATION", needsBranding: false, image: "/categories/cat_platter_branded.png" },
    { name: "Loaf", index: "11", stats: "CLASSIC", needsBranding: false, image: "/categories/cat_loaf_branded.png" },
    { name: "Pastry", index: "12", stats: "DELICATE", needsBranding: true, image: "/categories/cat_pastry.png" },
    { name: "Chocolate Box", index: "13", stats: "ARTISANAL", needsBranding: true, image: "/categories/cat_chocolate_box.png" },
    { name: "Macaron", index: "14", stats: "STYLISH", needsBranding: true, image: "/categories/cat_macaron.png" },
    { name: "Brownie", index: "15", stats: "COMPACT", needsBranding: true, image: "/categories/cat_brownie.png" },
    { name: "Wrap Box", index: "16", stats: "CONVENIENT", needsBranding: true, image: "/categories/cat_loaf_branded.png" },
    { name: "Popcorn", index: "17", stats: "CLASSIC", needsBranding: true, image: "/categories/cat_brownie.png" },
    { name: "Carry Bag", index: "18", stats: "PREMIUM", needsBranding: true, image: "/categories/cat_gifting.png" }
];

export default function ProductsManager() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImages, setIsUploadingImages] = useState(false);
    const [isUploadingPattern, setIsUploadingPattern] = useState(false);
    const [isUploadingDieline, setIsUploadingDieline] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('newest'); // newest, name, status
    const ITEMS_PER_PAGE = 20;

    const [categoriesList, setCategoriesList] = useState([]);
    const [showNewCatInput, setShowNewCatInput] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [isCreatingCat, setIsCreatingCat] = useState(false);

    // New Category Manager States
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [isUploadingCatImage, setIsUploadingCatImage] = useState(false);
    const [newCatData, setNewCatData] = useState({
        name: '',
        image: '',
        stats: 'DURABLE',
        needsBranding: false,
        index: ''
    });
    const [editingCatId, setEditingCatId] = useState(null);
    const [editingCatData, setEditingCatData] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        patternImg: '',
        patternFormat: '',
        dielineImg: '',
        dielineFormat: '',
        category: 'CupCake',
        minPrice: '',
        maxPrice: '',
        originalPrice: '',
        discount: '',
        images: 'https://res.cloudinary.com/dklavcjrl/image/upload/v1774544987/boxfox/products/large_burrito_box_1_1774544835718.jpg, https://res.cloudinary.com/dklavcjrl/image/upload/v1774544989/boxfox/products/large_burrito_box_2_1774544858239.jpg',
        badge: '',
        hasVariants: true,
        description: '',
        short_description: '',
        brand: 'BoxFox',
        minOrderQuantity: 10,
        priceAt1: '',
        priceAt10: '',
        priceAt50: '',
        priceAt100: '',
        priceAt500: '',
        priceAt1000: '',
        discountAt10: '',
        discountAt50: '',
        discountAt100: '',
        discountAt500: '',
        discountAt1000: '',
        triggerValue: 500,
        pricingMode: 'tiered',
        tags: '',
        specifications: [],
        length: '',
        width: '',
        height: '',
        unit: 'inch',
        pacdoraId: '',
        isActive: true,
        isFeatured: false,
        pageVisibility: 'shop',
        colors: [],
        priceSlabs: [],
        extraDiscountAbove500: false
    });

    const fetchProducts = (preservePage = false) => {
        setLoading(true);
        // Load all products at once (backend can paginate if needed for future)
        fetch('/api/products?admin=true&all=true')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setProducts(data);
                    if (!preservePage) {
                        setCurrentPage(1); // Reset to first page only if not preserving
                    }
                } else {
                    console.error("Admin: Failed to fetch products", data);
                    setProducts([]);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/box-categories');
            const json = await res.json();
            if (res.ok && json.success && Array.isArray(json.data)) {
                const list = json.data.map(item => ({
                    _id: item._id,
                    name: item.name,
                    image: item.image || '/categories/cat_cake.png',
                    stats: item.stats || 'DURABLE',
                    needsBranding: !!item.needsBranding,
                    index: item.index || '00'
                }));
                setCategoriesList(list);
            } else {
                setCategoriesList(DEFAULT_CATEGORIES.map((c, idx) => ({ ...c, _id: `fallback-${idx}` })));
            }
        } catch (err) {
            console.error("Failed to fetch categories:", err);
            setCategoriesList(DEFAULT_CATEGORIES.map((c, idx) => ({ ...c, _id: `fallback-${idx}` })));
        }
    };

    const handleCreateCategory = async () => {
        if (!newCatName.trim()) return;
        setIsCreatingCat(true);
        try {
            const res = await fetch('/api/admin/box-categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newCatName.trim(),
                    image: '/categories/cat_cake.png',
                    stats: 'DURABLE',
                    needsBranding: false,
                    index: String(categoriesList.length + 1).padStart(2, '0')
                })
            });
            const json = await res.json();
            if (res.ok && json.success) {
                const newCat = {
                    _id: json.data._id,
                    name: json.data.name,
                    image: json.data.image || '/categories/cat_cake.png',
                    stats: json.data.stats || 'DURABLE',
                    needsBranding: !!json.data.needsBranding,
                    index: json.data.index || '00'
                };
                setCategoriesList(prev => [...prev, newCat]);
                setFormData(prev => ({ ...prev, category: newCat.name }));
                setNewCatName('');
                setShowNewCatInput(false);
            } else {
                alert(json.error || "Failed to create category");
            }
        } catch (err) {
            console.error(err);
            alert("Connection error while creating category");
        } finally {
            setIsCreatingCat(false);
        }
    };

    const handleDeleteCategory = async () => {
        const catObj = categoriesList.find(c => c.name === formData.category);
        if (!catObj) return;

        if (!catObj._id || catObj._id.startsWith('fallback-')) {
            alert("Cannot delete standard fallback categories.");
            return;
        }

        if (!confirm(`Are you sure you want to delete the category "${catObj.name}"? This will not delete the products under it.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/box-categories?id=${catObj._id}`, {
                method: 'DELETE'
            });
            const json = await res.json();
            if (res.ok && json.success) {
                setCategoriesList(prev => prev.filter(c => c._id !== catObj._id));
                const remaining = categoriesList.filter(c => c._id !== catObj._id);
                setFormData(prev => ({ ...prev, category: remaining[0]?.name || '' }));
            } else {
                alert(json.error || "Failed to delete category");
            }
        } catch (err) {
            console.error(err);
            alert("Connection error while deleting category");
        }
    };

    const handleCatImageUpload = async (e, isEditing) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploadingCatImage(true);
        try {
            const formDataObj = new FormData();
            formDataObj.append('image', file);
            formDataObj.append('type', 'product');
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formDataObj
            });
            if (res.ok) {
                const data = await res.json();
                if (isEditing) {
                    setEditingCatData(prev => ({ ...prev, image: data.url }));
                } else {
                    setNewCatData(prev => ({ ...prev, image: data.url }));
                }
            } else {
                alert('Upload failed');
            }
        } catch (err) {
            console.error(err);
            alert('Upload failed: ' + err.message);
        } finally {
            setIsUploadingCatImage(false);
        }
    };

    const handleSaveCategory = async (catObj) => {
        try {
            const isFallback = catObj._id.startsWith('fallback-');
            const url = '/api/admin/box-categories';
            const method = isFallback ? 'POST' : 'PUT';
            const payload = { ...catObj };
            if (isFallback) {
                delete payload._id;
            }
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (res.ok && json.success) {
                alert('Category saved successfully!');
                setEditingCatId(null);
                setEditingCatData(null);
                fetchCategories();
            } else {
                alert(json.error || 'Failed to save category');
            }
        } catch (err) {
            console.error(err);
            alert('Error saving category');
        }
    };

    const handleDeleteCategoryById = async (id, name) => {
        if (id.startsWith('fallback-')) {
            alert('Cannot delete standard fallback categories. They are default templates.');
            return;
        }
        if (!confirm(`Are you sure you want to delete the category "${name}"? This will not delete the products under it.`)) {
            return;
        }
        try {
            const res = await fetch(`/api/admin/box-categories?id=${id}`, {
                method: 'DELETE'
            });
            const json = await res.json();
            if (res.ok && json.success) {
                fetchCategories();
            } else {
                alert(json.error || 'Failed to delete category');
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting category');
        }
    };

    const handleAddNewCategory = async () => {
        if (!newCatData.name.trim()) {
            alert('Please enter a category name');
            return;
        }
        try {
            const indexValue = newCatData.index.trim() || String(categoriesList.length + 1).padStart(2, '0');
            const payload = {
                name: newCatData.name.trim(),
                image: newCatData.image || '/categories/cat_cake.png',
                stats: newCatData.stats.trim() || 'DURABLE',
                needsBranding: !!newCatData.needsBranding,
                index: indexValue
            };
            const res = await fetch('/api/admin/box-categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (res.ok && json.success) {
                alert('Category created!');
                setNewCatData({
                    name: '',
                    image: '',
                    stats: 'DURABLE',
                    needsBranding: false,
                    index: ''
                });
                fetchCategories();
            } else {
                alert(json.error || 'Failed to create category');
            }
        } catch (err) {
            console.error(err);
            alert('Error creating category');
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setIsUploadingImages(true);
        try {
            const { compressFile } = await import('@/lib/compression');

            // Parallelize compression and upload
            const uploadPromises = files.map(async (file) => {
                try {
                    // Compress if needed (even for product images, targeting a reasonable size like 2MB)
                    const fileToUpload = await compressFile(file, 2);

                    const formDataObj = new FormData();
                    formDataObj.append('image', fileToUpload);
                    formDataObj.append('type', 'product');

                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formDataObj
                    });

                    if (!response.ok) {
                        if (response.status === 413) {
                            throw new Error('Image too large for server.');
                        }
                        return null;
                    }

                    const data = await response.json();
                    return data.url || null;
                } catch (err) {
                    console.error('Individual file upload failed:', err);
                    return null;
                }
            });

            const results = await Promise.all(uploadPromises);
            const uploadedUrls = results.filter(Boolean);

            if (uploadedUrls.length > 0) {
                let currentImages = [];
                if (typeof formData.images === 'string') {
                    currentImages = formData.images.split(',').map(u => u.trim()).filter(Boolean);
                } else if (Array.isArray(formData.images)) {
                    currentImages = formData.images.filter(Boolean);
                }

                setFormData({ ...formData, images: [...currentImages, ...uploadedUrls].join(', ') });
            }
        } catch (error) {
            console.error('Bulk upload failed:', error);
            alert('Failed to upload some images');
        } finally {
            setIsUploadingImages(false);
            e.target.value = '';
        }
    };

    const handleCloudinaryDelete = async (url) => {
        if (!url) return;
        try {
            // Extract publicId if possible, or send URL to server to find it
            await fetch('/api/upload', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
        } catch (error) {
            console.error('Failed to delete from Cloudinary:', error);
        }
    };

    const handlePatternUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploadingPattern(true);
        try {
            // Automatic compression if needed
            let fileToUpload = file;
            if (file.size > 9 * 1024 * 1024) {
                console.log('File > 9MB, attempting compression...');
                const { compressFile } = await import('@/lib/compression');
                fileToUpload = await compressFile(file, 8.5);

                if (fileToUpload.size > 9.5 * 1024 * 1024) {
                    console.warn('File is still over 9MB after optimization. Proceeding with upload as requested...');
                }
            }

            const formDataObj = new FormData();
            formDataObj.append('image', fileToUpload);
            formDataObj.append('type', 'pattern');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formDataObj
            });

            if (!response.ok) {
                if (response.status === 413) {
                    throw new Error('File is too large for the server. Please try a smaller file or compress it further.');
                }
                const errorText = await response.text();
                throw new Error(errorText || `Upload failed with status ${response.status}`);
            }

            const data = await response.json();
            if (data.url) {
                setFormData(prev => ({
                    ...prev,
                    patternImg: data.url,
                    patternFormat: data.format || (fileToUpload.type.includes('pdf') ? 'pdf' : 'image')
                }));
            }
        } catch (error) {
            console.error('Pattern upload failed:', error);
            alert('Failed to upload pattern: ' + error.message);
        } finally {
            setIsUploadingPattern(false);
            e.target.value = '';
        }
    };

    const handleDielineUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploadingDieline(true);
        try {
            // Automatic compression if needed
            let fileToUpload = file;
            if (file.size > 9 * 1024 * 1024) {
                console.log('File > 9MB, attempting compression...');
                const { compressFile } = await import('@/lib/compression');
                fileToUpload = await compressFile(file, 8.5);

                if (fileToUpload.size > 9.5 * 1024 * 1024) {
                    console.warn('File is still over 9MB after optimization. Proceeding with upload as requested...');
                }
            }

            const formDataObj = new FormData();
            formDataObj.append('image', fileToUpload);
            formDataObj.append('type', 'document');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formDataObj
            });

            if (!response.ok) {
                if (response.status === 413) {
                    throw new Error('File is too large for the server. Please try a smaller file or compress it further.');
                }
                const errorText = await response.text();
                throw new Error(errorText || `Upload failed with status ${response.status}`);
            }

            const data = await response.json();
            if (data.url) {
                setFormData(prev => ({
                    ...prev,
                    dielineImg: data.url,
                    dielineFormat: data.format || (fileToUpload.type.includes('pdf') ? 'pdf' : 'image')
                }));
            }
        } catch (error) {
            console.error('Dieline upload failed:', error);
            alert('Failed to upload dieline: ' + error.message);
        } finally {
            setIsUploadingDieline(false);
            e.target.value = '';
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    id: formData.id || `prod-${Date.now()}`,
                    originalPrice: parseFloat(formData.originalPrice) || undefined
                })
            });
            const data = await res.json();
            if (data.success) {
                setSuccessMsg('Product saved successfully!');
                fetchProducts(true);
                setTimeout(() => {
                    setIsModalOpen(false);
                    setSuccessMsg('');
                    setFormData({
                        name: '',
                        sku: '',
                        patternImg: '',
                        patternFormat: '',
                        dielineImg: '',
                        dielineFormat: '',
                        category: 'Packaging',
                        minPrice: '',
                        maxPrice: '',
                        originalPrice: '',
                        discount: '',
                        images: 'https://res.cloudinary.com/dklavcjrl/image/upload/v1774544987/boxfox/products/large_burrito_box_1_1774544835718.jpg, https://res.cloudinary.com/dklavcjrl/image/upload/v1774544989/boxfox/products/large_burrito_box_2_1774544858239.jpg',
                        badge: '',
                        hasVariants: true,
                        description: '',
                        short_description: '',
                        brand: 'BoxFox',
                        minOrderQuantity: 10,
                        tags: '',
                        specifications: [],
                        length: '',
                        width: '',
                        height: '',
                        unit: 'inch',
                        pacdoraId: '',
                        priceAt1: '',
                        priceAt10: '',
                        priceAt50: '',
                        priceAt100: '',
                        priceAt500: '',
                        priceAt1000: '',
                        discountAt10: '',
                        discountAt50: '',
                        discountAt100: '',
                        discountAt500: '',
                        discountAt1000: '',
                        triggerValue: 500,
                        pricingMode: 'tiered',
                        isActive: true,
                        pageVisibility: 'shop',
                        colors: [],
                        priceSlabs: [],
                        extraDiscountAbove500: false
                    });
                }, 1500);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchProducts();
            }
        } catch (e) {
            console.error('Failed to delete product', e);
        }
    };

    const handleDownload = async (url, filename) => {
        if (!url) return;
        try {
            const res = await fetch(url);
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename || url.split('/').pop().split('?')[0];
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch (e) {
            window.open(url, '_blank');
        }
    };

    const handleDownloadExcel = async (product) => {
        const XLSX = await import('xlsx');

        // Extract tags
        const tags = Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || '');

        // Extract specifications
        const specs = product.specifications || [];

        // Extract images
        const imgs = Array.isArray(product.images) ? product.images : (typeof product.images === 'string' ? product.images.split(',').map(s => s.trim()) : []);
        const img1 = imgs[0] || '';
        const img2 = imgs[1] || '';

        const toInch = (val, unit) => {
            if (!val || isNaN(val)) return '';
            const v = parseFloat(val);
            if (unit === 'cm') return parseFloat((v / 2.54).toFixed(2));
            if (unit === 'mm') return parseFloat((v / 25.4).toFixed(2));
            return v;
        };

        const dim = product.dimensions || {};
        const unit = dim.unit || 'inch';

        const data = [{
            'Product Name': product.name || '',
            'Product SKU': product.sku || '',
            'Status': product.isActive !== false ? 'Active' : 'Inactive',
            'Category': product.category || (Array.isArray(product.categories) ? product.categories[0] : ''),
            'Min Order Qty': product.minOrderQuantity || '',
            'Tags (Comma separated)': tags,
            'Short Description': product.short_description || '',
            'Full Description': product.description || '',
            'Length': toInch(dim.length, unit),
            'Width': toInch(dim.width, unit),
            'Height': toInch(dim.height, unit),
            'Unit': 'inch',
            'Price @ 1': product.priceAt1,
            'Price @ 50': product.priceAt50,
            'Price @ 100': product.priceAt100,
            'Product Images1': img1,
            'Product Images2': img2,
            'Dieline': product.dielineImg || ''
        }];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Product Details');

        const fileName = `${(product.name || 'product').replace(/\s+/g, '_')}_BoxFox.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const handleDownloadAll = async () => {
        try {
            const XLSX = await import('xlsx');
            const rows = products.map(p => {
                // Extract tags
                const tags = Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || '');

                // Extract specifications
                const specs = p.specifications || [];

                // Extract images
                const imgs = Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? p.images.split(',').map(s => s.trim()) : []);
                const img1 = imgs[0] || '';
                const img2 = imgs[1] || '';

                const toInch = (val, unit) => {
                    if (!val || isNaN(val)) return '';
                    const v = parseFloat(val);
                    if (unit === 'cm') return parseFloat((v / 2.54).toFixed(2));
                    if (unit === 'mm') return parseFloat((v / 25.4).toFixed(2));
                    return v;
                };

                const dim = p.dimensions || {};
                const unit = dim.unit || 'inch';

                return {
                    'Product Name': p.name || '',
                    'Product SKU': p.sku || '',
                    'Status': p.isActive !== false ? 'Active' : 'Inactive',
                    'Category': p.category || (Array.isArray(p.categories) ? p.categories[0] : ''),
                    'Min Order Qty': p.minOrderQuantity || '',
                    'Tags (Comma separated)': tags,
                    'Short Description': p.short_description || '',
                    'Full Description': p.description || '',
                    'Length': toInch(dim.length, unit),
                    'Width': toInch(dim.width, unit),
                    'Height': toInch(dim.height, unit),
                    'Unit': 'inch',
                    'Price @ 1': p.priceAt1,
                    'Price @ 50': p.priceAt50,
                    'Price @ 100': p.priceAt100,
                    'Product Images1': img1,
                    'Product Images2': img2,
                    'Dieline': p.dielineImg || ''
                };
            });

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(rows);
            XLSX.utils.book_append_sheet(wb, ws, 'Products');
            XLSX.writeFile(wb, 'BoxFox_All_Products.xlsx');
        } catch (err) {
            console.error('Download all products failed:', err);
            alert('Failed to generate Excel for all products');
        }
    };
    const handleImportExcel = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsSaving(true);
        try {
            const XLSX = await import('xlsx');
            const reader = new FileReader();

            reader.onload = async (evt) => {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    alert("No data found in Excel");
                    setIsSaving(false);
                    return;
                }

                // Call API to bulk update
                const res = await fetch('/api/admin/import-prices', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ updates: data })
                });

                const result = await res.json();
                if (result.success) {
                    alert(`Successfully updated ${result.updatedCount} products!`);
                    fetchProducts();
                } else {
                    alert(`Import failed: ${result.error}`);
                }
                setIsSaving(false);
            };
            reader.readAsBinaryString(file);
        } catch (err) {
            console.error('Import failed:', err);
            alert('Failed to import Excel');
            setIsSaving(false);
        } finally {
            e.target.value = '';
        }
    };


    const handleEdit = (product) => {
        setFormData({
            _id: product._id,
            name: product.name,
            sku: product.sku || '',
            patternImg: product.patternImg || '',
            patternFormat: product.patternFormat || '',
            dielineImg: product.dielineImg || '',
            dielineFormat: product.dielineFormat || '',
            category: product.category,
            minPrice: product.minPrice || '',
            maxPrice: product.maxPrice || '',
            originalPrice: product.originalPrice || '',
            discount: product.discount || '',
            images: Array.isArray(product.images) ? product.images.join(', ') : (product.img || ''),
            badge: product.badge || '',
            hasVariants: product.hasVariants,
            description: product.description || '',
            short_description: product.short_description || '',
            brand: product.brand || 'BoxFox',
            minOrderQuantity: product.minOrderQuantity || 10,
            tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
            specifications: product.specifications || [],
            length: product.dimensions?.length || '',
            width: product.dimensions?.width || '',
            height: product.dimensions?.height || '',
            unit: product.dimensions?.unit || 'inch',
            pacdoraId: product.pacdoraId || '',
            isActive: product.isActive !== false,
            isFeatured: product.isFeatured || false,
            pageVisibility: product.pageVisibility || 'shop',
            colors: product.colors || [],
            extraDiscountAbove500: product.extraDiscountAbove500 || false,
            priceAt1: product.priceAt1 || '',
            priceAt10: product.priceAt10 || '',
            priceAt50: product.priceAt50 || '',
            priceAt100: product.priceAt100 || '',
            priceAt500: product.priceAt500 || '',
            priceAt1000: product.priceAt1000 || '',
            discountAt10: product.discountAt10 || '',
            discountAt50: product.discountAt50 || '',
            discountAt100: product.discountAt100 || '',
            discountAt500: product.discountAt500 || '',
            discountAt1000: product.discountAt1000 || '',
            triggerValue: product.triggerValue !== undefined ? product.triggerValue : 500,
            pricingMode: product.pricingMode || 'tiered',
            priceSlabs: Array.isArray(product.priceSlabs) ? product.priceSlabs : []
        });
        setIsModalOpen(true);
    };

    const handleDuplicate = (product) => {
        // Normalize SKU when creating a duplicate: remove repeated -copy sequences and ensure uniqueness
        const existingSkus = products.map(p => p.sku).filter(Boolean);
        const normalizeBaseSku = (sku) => {
            if (!sku) return '';
            // strip any trailing -copy or -copy-<num> sequences
            return sku.replace(/(-copy(?:-\d+)?)+$/i, '');
        };
        const baseSku = normalizeBaseSku(product.sku || '');
        let candidate = baseSku ? `${baseSku}-copy` : '';
        let counter = 1;
        while (candidate && existingSkus.includes(candidate)) {
            counter += 1;
            candidate = `${baseSku}-copy-${counter}`;
        }

        setFormData({
            name: product.name + " (Copy)",
            sku: candidate,
            patternImg: product.patternImg || '',
            patternFormat: product.patternFormat || '',
            dielineImg: product.dielineImg || '',
            dielineFormat: product.dielineFormat || '',
            category: product.category,
            minPrice: product.minPrice || '',
            maxPrice: product.maxPrice || '',
            originalPrice: product.originalPrice || '',
            discount: product.discount || '',
            images: Array.isArray(product.images) ? product.images.join(', ') : (product.img || ''),
            badge: product.badge || '',
            hasVariants: product.hasVariants,
            description: product.description || '',
            short_description: product.short_description || '',
            brand: product.brand || 'BoxFox',
            minOrderQuantity: product.minOrderQuantity || 10,
            tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
            specifications: product.specifications || [],
            length: product.dimensions?.length || '',
            width: product.dimensions?.width || '',
            height: product.dimensions?.height || '',
            unit: product.dimensions?.unit || 'inch',
            pacdoraId: product.pacdoraId || '',
            isActive: product.isActive !== false,
            isFeatured: false,
            pageVisibility: product.pageVisibility || 'shop',
            colors: product.colors || [],
            extraDiscountAbove500: product.extraDiscountAbove500 || false,
            priceAt1: product.priceAt1 || '',
            priceAt10: product.priceAt10 || '',
            priceAt50: product.priceAt50 || '',
            priceAt100: product.priceAt100 || '',
            priceAt500: product.priceAt500 || '',
            priceAt1000: product.priceAt1000 || '',
            discountAt10: product.discountAt10 || '',
            discountAt50: product.discountAt50 || '',
            discountAt100: product.discountAt100 || '',
            discountAt500: product.discountAt500 || '',
            discountAt1000: product.discountAt1000 || '',
            triggerValue: product.triggerValue !== undefined ? product.triggerValue : 500,
            pricingMode: product.pricingMode || 'tiered',
            priceSlabs: Array.isArray(product.priceSlabs) ? product.priceSlabs : []
        });
        setIsModalOpen(true);
    };

    const handleRegenerateAllSkus = async () => {
        const confirm1 = confirm('⚠️ DANGER: This will wipe and re-assign EVERY SKU in your database sequentially. This cannot be undone. Are you sure?');
        if (!confirm1) return;
        const confirm2 = confirm('Final confirmation: Are you ABSOLUTELY sure you want to re-sequence your entire inventory?');
        if (!confirm2) return;

        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/regenerate-all-skus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await res.json();
            if (result.success) {
                alert(result.message);
                fetchProducts();
            } else {
                alert(`Failed: ${result.error}`);
            }
        } catch (err) {
            console.error('Bulk SKU regeneration failed', err);
            alert('Failed to regenerate SKUs');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRegenerateSku = async (product) => {
        if (!product || !product._id) return;
        if (!confirm('This will assign a fresh, unique SKU based on the product category. Proceed?')) return;

        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...product, sku: '', generateSku: true })
            });
            const result = await res.json();
            if (!res.ok || !result.success) {
                throw new Error(result.error || 'Failed to generate SKU');
            }
            fetchProducts();
            alert(`New SKU assigned: ${result.product.sku}`);
        } catch (err) {
            console.error('Regenerate SKU failed', err);
            alert(`Error: ${err.message}`);
        }
    };

    const handleRunBoxEngine = () => {
        if (!formData.length || !formData.width || !formData.height) {
            alert('Please enter dimensions (L, W, H) first.');
            return;
        }
        const prices = runBoxEngine(formData.category, {
            length: formData.length,
            width: formData.width,
            height: formData.height,
            unit: formData.unit
        });
        setFormData({
            ...formData,
            priceAt1: prices.priceAt1,
            priceAt50: prices.priceAt50,
            priceAt100: prices.priceAt100
        });
        alert(`Box Engine: Prices calculated based on ${formData.category} specs.`);
    };

    const handleSyncBulkPrices = () => {
        if (!formData.priceAt1) {
            alert('Please enter Price @1 first.');
            return;
        }
        const prices = calculateTiersFromBase(parseFloat(formData.priceAt1), formData.category, {
            length: formData.length,
            width: formData.width,
            height: formData.height,
            unit: formData.unit
        });
        setFormData({
            ...formData,
            priceAt1: prices.priceAt1,
            priceAt50: prices.priceAt50,
            priceAt100: prices.priceAt100
        });
        alert('Bulk prices updated based on Price @1 and manufacturing ratios.');
    };

    const handleToggleStatus = async (product) => {
        try {
            const newStatus = product.isActive === false ? true : false;
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...product,
                    isActive: newStatus
                })
            });
            if (res.ok) {
                setProducts(prev => prev.map(p => (p._id === product._id || p.id === product.id) ? { ...p, isActive: newStatus } : p));
            }
        } catch (err) {
            console.error("Failed to toggle status", err);
        }
    };

    const handleToggleFeatured = async (product) => {
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...product,
                    isFeatured: !product.isFeatured
                })
            });
            if (res.ok) {
                fetchProducts();
            }
        } catch (err) {
            console.error("Failed to toggle featured status", err);
        }
    };

    const formatDimensions = (dim, name) => {
        let d = dim;
        if (!d || (!d.length && !d.width && !d.height)) {
            // Smart Fallback: Extract dimensions from name if missing in data (e.g. "Cake Box 8x8x5 in")
            const match = name?.match(/(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)/i);
            if (match) {
                d = {
                    length: parseFloat(match[1]),
                    width: parseFloat(match[2]),
                    height: parseFloat(match[3]),
                    unit: 'inch'
                };
            } else {
                return null;
            }
        }

        const { length: l, width: w, height: h, unit = 'inch' } = d;
        const toInch = (v) => unit === 'inch' ? v : unit === 'cm' ? v / 2.54 : v / 25.4;
        const toCm = (v) => unit === 'cm' ? v : unit === 'inch' ? v * 2.54 : v / 10;
        const toMm = (v) => unit === 'mm' ? v : unit === 'inch' ? v * 25.4 : v * 10;
        const fmt = (v) => parseFloat(v.toFixed(1));
        return {
            inch: `${fmt(toInch(l))} × ${fmt(toInch(w))} × ${fmt(toInch(h))} in`,
            cm: `${fmt(toCm(l))} × ${fmt(toCm(w))} × ${fmt(toCm(h))} cm`,
            mm: `${fmt(toMm(l))} × ${fmt(toMm(w))} × ${fmt(toMm(h))} mm`,
        };
    };

    // Memoized filtered products with pagination to prevent unnecessary recalculations
    const { filteredProducts, totalPages, totalFiltered } = useMemo(() => {
        let filtered = products.filter(p => {
            const matchesSearch = searchQuery.trim() === '' ||
                (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (p.categories && p.categories.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())));
            const matchesCategory = selectedCategory === 'All'
                ? true
                : selectedCategory === 'Pending SKU'
                    ? (!p.sku || !p.sku.startsWith('BFX-'))
                    : p.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        // Apply Sorting
        filtered.sort((a, b) => {
            if (sortBy === 'newest') {
                return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
            }
            if (sortBy === 'name') {
                return (a.name || '').localeCompare(b.name || '');
            }
            if (sortBy === 'status') {
                // Active first (true > false)
                if (a.isActive === b.isActive) return 0;
                return a.isActive === false ? 1 : -1;
            }
            return 0;
        });

        const pages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
        const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
        const paginated = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

        return { filteredProducts: paginated, totalPages: pages, totalFiltered: filtered.length };
    }, [products, searchQuery, selectedCategory, currentPage, sortBy]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black text-gray-950 tracking-tighter leading-none mb-2 flex items-center gap-4">
                        Inventory
                        <span className="text-xl bg-gray-950 px-4 py-1.5 rounded-xl text-white font-black shadow-lg shadow-gray-900/20">
                            {totalFiltered}
                        </span>
                    </h1>
                    <p className="text-gray-400 font-medium text-lg">Manage your real-time packaging catalog synced with the backend.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <button
                        onClick={() => fetchProducts()}
                        className="p-3 md:p-4 bg-white border border-gray-100 text-gray-400 rounded-xl md:rounded-2xl hover:text-emerald-500 hover:border-emerald-200 hover:bg-emerald-50 transition-all shadow-sm active:scale-95"
                        title="Refresh Data"
                    >
                        <RefreshCw size={18} className="md:w-5 md:h-5" />
                    </button>
                    <button
                        onClick={() => handleDownloadAll()}
                        className="px-4 md:px-6 py-3 md:py-4 bg-white border border-gray-100 text-gray-700 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-sm"
                        title="Download All Products (Excel)"
                    >
                        <Download size={16} /> <span className="hidden sm:inline">Excel</span>
                    </button>
                    <label className="px-4 md:px-6 py-3 md:py-4 bg-white border border-gray-100 text-gray-700 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center gap-2 cursor-pointer shadow-sm">
                        <Plus size={16} /> <span className="hidden sm:inline">Import</span>
                        <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportExcel} />
                    </label>
                    <button
                        onClick={handleRegenerateAllSkus}
                        className="px-4 md:px-6 py-3 md:py-4 bg-white border border-gray-100 text-red-400 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-all flex items-center gap-2 shadow-sm"
                        title="DANGER: Regenerate All SKUs"
                    >
                        <RefreshCw size={16} /> <span className="hidden sm:inline">Clean SKUs</span>
                    </button>
                    <button
                        onClick={() => setIsCatModalOpen(true)}
                        className="px-4 md:px-6 py-3 md:py-4 bg-white border border-gray-100 text-emerald-600 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-sm"
                        title="Manage Categories"
                    >
                        <SlidersHorizontal size={16} /> <span className="hidden sm:inline">Categories</span>
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full sm:w-auto mt-2 sm:mt-0 flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-emerald-500 text-white rounded-xl md:rounded-2xl font-black text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-emerald-500/20 hover:bg-emerald-600"
                    >
                        <Plus size={20} />
                        ADD PRODUCT
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex items-center gap-3 bg-white border border-gray-100 rounded-[1.5rem] px-6 py-4 shadow-sm hover:shadow-md focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500/50 transition-all">
                    <Search size={20} className="text-gray-400" />
                    <input type="text" placeholder="Search by name, SKU, or tags..." className="bg-transparent outline-none w-full text-sm font-bold text-gray-950 placeholder-gray-400" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <div className="relative w-full md:w-auto">
                    <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        className="w-full flex items-center gap-2 px-6 py-4 h-full bg-white border border-gray-100 rounded-[1.5rem] text-sm font-black text-gray-600 uppercase tracking-widest hover:text-gray-950 hover:shadow-md hover:border-gray-200 transition-all appearance-none outline-none pr-12 cursor-pointer shadow-sm"
                    >
                        <option value="All">All Categories</option>
                        <option value="Pending SKU">Pending SKU</option>
                        {categoriesList.map(cat => (
                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                    <Filter size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative w-full md:w-auto">
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="w-full flex items-center gap-2 px-6 py-4 h-full bg-white border border-gray-100 rounded-[1.5rem] text-sm font-black text-gray-600 uppercase tracking-widest hover:text-gray-950 hover:shadow-md hover:border-gray-200 transition-all appearance-none outline-none pr-12 cursor-pointer shadow-sm"
                    >
                        <option value="newest">Sort by Newest</option>
                        <option value="name">Sort by Name</option>
                        <option value="status">Sort by Status (Active first)</option>
                    </select>
                    <Filter size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
                <div className="overflow-x-auto p-4">
                    {loading ? (
                        <div className="p-20 text-center animate-pulse space-y-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto" />
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Live Inventory...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="p-20 text-center space-y-6">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                <Plus size={40} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-950">No products found</h3>
                                <p className="text-gray-400 font-medium">Your database is empty. Add your first product to see it here.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden lg:block">
                                <table className="w-full text-left border-collapse border-spacing-y-2">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap border-b border-gray-100">Product</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap border-b border-gray-100">SKU</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap border-b border-gray-100">Category</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap border-b border-gray-100">Price Range</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap border-b border-gray-100">Size</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap border-b border-gray-100">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap text-right border-b border-gray-100">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredProducts.map((product) => (
                                            <ProductRow
                                                key={product._id || product.id}
                                                product={product}
                                                onEdit={handleEdit}
                                                onDelete={handleDelete}
                                                onDuplicate={handleDuplicate}
                                                onRegenerateSku={handleRegenerateSku}
                                                onToggleFeatured={handleToggleFeatured}
                                                onToggleStatus={handleToggleStatus}
                                                formatDimensions={formatDimensions}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card Layout */}
                            <div className="lg:hidden space-y-3">
                                {filteredProducts.map((product) => (
                                    <div key={product._id || product.id} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex gap-3">
                                            {/* Image */}
                                            <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                                                <img
                                                    src={product.img || "/BOXFOX-1.png"}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.target.src = "/BOXFOX-1.png";
                                                        e.target.onerror = null;
                                                    }}
                                                />
                                            </div>
                                            {/* Core Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="text-sm font-black text-gray-950 line-clamp-2 leading-tight break-words pr-2">{product.name}</h3>
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 truncate pr-2" title={`ID: ${product.id}`}>ID: {product.id}</p>
                                                    </div>
                                                    {product.badge && (
                                                        <span className="px-1.5 py-0.5 bg-accent/10 text-accent rounded text-[8px] font-black uppercase tracking-tighter shrink-0 mt-0.5">
                                                            {product.badge}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="mt-2 flex flex-wrap gap-1.5">
                                                    <span className="text-[9px] font-black text-gray-950 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 truncate max-w-[120px]">
                                                        {product.sku || 'PENDING'}
                                                    </span>
                                                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[8px] font-bold uppercase tracking-widest truncate max-w-[100px]">
                                                        {product.category}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-50">
                                            {/* Pricing */}
                                            <div>
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Price</p>
                                                {product.priceAt1 || product.priceAt100 ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-gray-950">₹{product.priceAt1 || '0'} - ₹{product.priceAt100 || '0'}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm font-black text-gray-950">₹{product.price || '0'}</span>
                                                )}
                                            </div>

                                            {/* Dimensions */}
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Size</p>
                                                {(() => {
                                                    const d = formatDimensions(product.dimensions, product.name);
                                                    if (!d) return <span className="text-xs text-gray-300 font-bold">—</span>;
                                                    return (
                                                        <span className="text-[9px] font-bold text-gray-700 whitespace-nowrap block">{d.inch}</span>
                                                    );
                                                })()}
                                            </div>
                                        </div>

                                        {/* Status & Actions */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 pt-3 border-t border-gray-50">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleStatus(product)}
                                                    className={`w-7 h-4 rounded-full transition-all duration-300 relative shrink-0 ${product.isActive !== false ? 'bg-emerald-500' : 'bg-gray-200'}`}
                                                >
                                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 ${product.isActive !== false ? 'right-0.5' : 'left-0.5'}`} />
                                                </button>
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${product.isActive === false ? 'text-gray-400' : (product.outOfStock ? 'text-red-600' : 'text-emerald-600')}`}>
                                                    {product.isActive === false ? 'Inactive' : (product.outOfStock ? 'Out of Stock' : 'Active')}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-1">
                                                {product.patternImg && (
                                                    <button onClick={() => window.open(product.patternImg, '_blank')} className="p-1.5 text-emerald-600 bg-emerald-50 rounded">
                                                        <FileText size={12} />
                                                    </button>
                                                )}
                                                {product.dielineImg && (
                                                    <button onClick={() => window.open(product.dielineImg, '_blank')} className="p-1.5 text-blue-600 bg-blue-50 rounded">
                                                        <Download size={12} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleEdit(product)} className="p-1.5 text-gray-500 hover:text-emerald-600 bg-gray-100 hover:bg-emerald-50 rounded">
                                                    <Edit size={12} />
                                                </button>
                                                <button onClick={() => handleDuplicate(product)} className="p-1.5 text-gray-500 hover:text-orange-600 bg-gray-100 hover:bg-orange-50 rounded">
                                                    <Copy size={12} />
                                                </button>
                                                <button onClick={() => handleRegenerateSku(product)} className="p-1.5 text-gray-500 hover:text-emerald-600 bg-gray-100 hover:bg-emerald-50 rounded">
                                                    <RefreshCw size={12} />
                                                </button>
                                                <button onClick={() => handleDelete(product._id || product.id)} className="p-1.5 text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 rounded">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Pagination Controls */}
                {!loading && filteredProducts.length > 0 && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 p-6 border-t border-gray-100 bg-gray-50/50">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            title="Previous page"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-700">
                                Page {currentPage} of {totalPages}
                            </span>
                            <span className="text-xs text-gray-400">
                                ({(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalFiltered)} of {totalFiltered})
                            </span>
                        </div>

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            title="Next page"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-100 flex items-center justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-4xl h-full bg-white shadow-2xl p-6 md:p-10 overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-12">
                                <div>
                                    <h2 className="text-3xl font-black text-gray-950 tracking-tighter">Add New Product</h2>
                                    <p className="text-gray-400 font-medium">Create a new entry in your global inventory.</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-3 hover:bg-gray-100 rounded-2xl transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {successMsg ? (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-20 text-center"
                                >
                                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-950">Success!</h3>
                                    <p className="text-gray-400 font-medium">{successMsg}</p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSave} className="space-y-8">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">Product Name</label>
                                                    <input
                                                        required
                                                        value={formData.name}
                                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                        placeholder="e.g. 3 Ply Luxury Pizza Box"
                                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-bold text-gray-950 focus:ring-2 focus:ring-gray-950/5 outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">Product SKU</label>
                                                    <div className="relative">
                                                        <input
                                                            readOnly
                                                            value={formData.sku}
                                                            placeholder="Auto-generated on save"
                                                            className="w-full bg-gray-100 border border-gray-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-bold text-gray-400 cursor-not-allowed outline-none transition-all"
                                                        />
                                                        {!formData.sku && (
                                                            <span className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-[8px] md:text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md md:rounded-lg">
                                                                AUTO GENERATE
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">Category</label>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowNewCatInput(!showNewCatInput)}
                                                            className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
                                                        >
                                                            {showNewCatInput ? "Cancel" : "+ New Category"}
                                                        </button>
                                                    </div>

                                                    {showNewCatInput ? (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={newCatName}
                                                                onChange={e => setNewCatName(e.target.value)}
                                                                placeholder="New Category Name"
                                                                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm font-bold text-gray-950 focus:ring-2 focus:ring-gray-950/5 outline-none transition-all"
                                                            />
                                                            <button
                                                                type="button"
                                                                disabled={isCreatingCat}
                                                                onClick={handleCreateCategory}
                                                                className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase hover:bg-emerald-600 transition-all disabled:opacity-50"
                                                            >
                                                                {isCreatingCat ? "Saving..." : "Add"}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <div className="relative flex-1">
                                                                <select
                                                                    value={formData.category}
                                                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-bold text-gray-950 focus:ring-2 focus:ring-gray-950/5 outline-none transition-all appearance-none pr-12"
                                                                >
                                                                    {categoriesList.map(cat => (
                                                                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                                                                    ))}
                                                                </select>
                                                                <Filter size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                            </div>

                                                            {(() => {
                                                                const catObj = categoriesList.find(c => c.name === formData.category);
                                                                const isCustom = catObj && catObj._id && !catObj._id.startsWith('fallback-');
                                                                if (!isCustom) return null;

                                                                return (
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleDeleteCategory}
                                                                        className="p-3 bg-red-50 text-red-500 rounded-xl md:rounded-2xl border border-red-100 hover:bg-red-100 transition-all flex items-center justify-center shadow-sm shrink-0"
                                                                        title="Delete Category"
                                                                    >
                                                                        <Trash2 size={18} />
                                                                    </button>
                                                                );
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">Badge (Optional)</label>
                                                    <input
                                                        value={formData.badge}
                                                        onChange={e => setFormData({ ...formData, badge: e.target.value })}
                                                        placeholder="e.g. New"
                                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-bold text-gray-950 focus:ring-2 focus:ring-gray-950/5 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                                                <div className="flex items-center justify-between sm:flex-col sm:items-start sm:justify-start sm:gap-3">
                                                    <div>
                                                        <p className="text-sm font-black text-gray-950 uppercase tracking-tighter">Active Status</p>
                                                        <p className="text-[10px] font-medium text-gray-400">Visibility in store</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                                        className={`w-12 h-6 rounded-full transition-all duration-300 relative shrink-0 ${formData.isActive ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-gray-200'}`}
                                                    >
                                                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${formData.isActive ? 'right-0.5' : 'left-0.5'}`} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between sm:flex-col sm:items-start sm:justify-start sm:gap-3">
                                                    <div>
                                                        <p className="text-sm font-black text-gray-950 uppercase tracking-tighter">Featured</p>
                                                        <p className="text-[10px] font-medium text-gray-400">Show in Best Sellers</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                                                        className={`w-12 h-6 rounded-full transition-all duration-300 relative shrink-0 ${formData.isFeatured ? 'bg-amber-400 shadow-lg shadow-amber-500/20' : 'bg-gray-200'}`}
                                                    >
                                                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${formData.isFeatured ? 'right-0.5' : 'left-0.5'}`} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between sm:flex-col sm:items-start sm:justify-start sm:gap-3">
                                                    <div>
                                                        <p className="text-sm font-black text-gray-955 uppercase tracking-tighter">Compound Discount (500+)</p>
                                                        <p className="text-[10px] font-medium text-gray-400 font-bold">Apply 20%+20% style compounding</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, extraDiscountAbove500: !formData.extraDiscountAbove500 })}
                                                        className={`w-12 h-6 rounded-full transition-all duration-300 relative shrink-0 ${formData.extraDiscountAbove500 ? 'bg-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-gray-200'}`}
                                                    >
                                                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${formData.extraDiscountAbove500 ? 'right-0.5' : 'left-0.5'}`} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between sm:flex-col sm:items-start sm:justify-start sm:gap-3">
                                                    <div className="w-full">
                                                        <p className="text-sm font-black text-gray-955 uppercase tracking-tighter mb-1">Page Visibility</p>
                                                        <select
                                                            value={formData.pageVisibility}
                                                            onChange={e => setFormData({ ...formData, pageVisibility: e.target.value })}
                                                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-955 outline-none"
                                                        >
                                                            <option value="shop">Shop Page</option>
                                                            <option value="gift">Gift Page</option>
                                                            <option value="both">Both</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">Min Order Qty</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={formData.minOrderQuantity}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            if (val === '' || Number(val) >= 0) {
                                                                setFormData({ ...formData, minOrderQuantity: val });
                                                            }
                                                        }}
                                                        placeholder="100"
                                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-bold text-gray-950 focus:ring-2 focus:ring-gray-950/5 outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">Badge (Optional)</label>
                                                    <input
                                                        value={formData.badge}
                                                        onChange={e => setFormData({ ...formData, badge: e.target.value })}
                                                        placeholder="e.g. New"
                                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-bold text-gray-950 focus:ring-2 focus:ring-gray-950/5 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>


                                            <div className="space-y-2">
                                                <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">Tags (Comma separated)</label>
                                                <input
                                                    value={formData.tags}
                                                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                                    placeholder="Pizza, Eco-friendly, Premium"
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-bold text-gray-950 focus:ring-2 focus:ring-gray-950/5 outline-none transition-all"
                                                />
                                            </div>

                                            {/* Colors Selection Component */}
                                            <div className="space-y-4 bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                                                <div>
                                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-1">Available Colors</label>
                                                    <p className="text-[10px] text-gray-400 font-medium italic">Define color variants available for this product</p>
                                                </div>

                                                {/* Selected Colors Swatches */}
                                                <div className="flex flex-wrap gap-2">
                                                    {(formData.colors || []).map((colorHex, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl pl-2 pr-3 py-1.5 shadow-sm text-xs font-bold text-gray-800">
                                                            <span className="w-5 h-5 rounded-full border border-gray-200 shrink-0" style={{ backgroundColor: colorHex }} />
                                                            <span>{colorHex.toUpperCase()}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updatedColors = formData.colors.filter((_, i) => i !== idx);
                                                                    setFormData({ ...formData, colors: updatedColors });
                                                                }}
                                                                className="text-red-500 hover:text-red-700 transition-colors ml-1"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {(formData.colors || []).length === 0 && (
                                                        <p className="text-xs font-bold text-gray-400 italic">No colors selected (default options will apply).</p>
                                                    )}
                                                </div>

                                                {/* Preset Colors Grid */}
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Quick Select Presets</p>
                                                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                                                        {[
                                                            { name: "Mint Green", hex: "#a3e635" },
                                                            { name: "Kraft Brown", hex: "#c2a688" },
                                                            { name: "Luxury White", hex: "#ffffff" },
                                                            { name: "Elegant Black", hex: "#111827" },
                                                            { name: "Royal Blue", hex: "#1d4ed8" },
                                                            { name: "Luxury Gold", hex: "#eab308" },
                                                            { name: "Rose Pink", hex: "#f472b6" },
                                                            { name: "Lavender", hex: "#c084fc" },
                                                            { name: "Soft Ivory", hex: "#fef08a" },
                                                            { name: "Chocolate Brown", hex: "#78350f" }
                                                        ].map((preset) => {
                                                            const isSelected = (formData.colors || []).includes(preset.hex.toLowerCase());
                                                            return (
                                                                <button
                                                                    key={preset.name}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const lowercaseHex = preset.hex.toLowerCase();
                                                                        let updatedColors = [...(formData.colors || [])];
                                                                        if (isSelected) {
                                                                            updatedColors = updatedColors.filter(c => c !== lowercaseHex);
                                                                        } else {
                                                                            updatedColors.push(lowercaseHex);
                                                                        }
                                                                        setFormData({ ...formData, colors: updatedColors });
                                                                    }}
                                                                    title={preset.name}
                                                                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-emerald-500 scale-110 shadow-md shadow-emerald-500/20' : 'border-gray-200 hover:scale-105'}`}
                                                                    style={{ backgroundColor: preset.hex }}
                                                                >
                                                                    {isSelected && (
                                                                        <Check size={16} className={preset.hex === "#ffffff" || preset.hex === "#fef08a" ? "text-gray-900" : "text-white"} />
                                                                    )}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Custom Color Input */}
                                                <div className="flex gap-3 items-end">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Custom Color</p>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="color"
                                                                id="custom-color-picker"
                                                                defaultValue="#10b981"
                                                                className="w-10 h-10 p-0 border-0 rounded-lg cursor-pointer bg-transparent"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const picker = document.getElementById("custom-color-picker");
                                                                    if (picker) {
                                                                        const customHex = picker.value.toLowerCase();
                                                                        if (!(formData.colors || []).includes(customHex)) {
                                                                            setFormData({ ...formData, colors: [...(formData.colors || []), customHex] });
                                                                        }
                                                                    }
                                                                }}
                                                                className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/10 active:scale-95"
                                                            >
                                                                Add Color
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">Pacdora ID / URL (For 3D View)</label>
                                                <input
                                                    value={formData.pacdoraId}
                                                    onChange={e => setFormData({ ...formData, pacdoraId: e.target.value })}
                                                    placeholder="e.g. 5x2x8-mailer-box or full share URL"
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-bold text-gray-950 focus:ring-2 focus:ring-gray-950/5 outline-none transition-all"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">Short Description</label>
                                                <textarea
                                                    rows="2"
                                                    value={formData.short_description}
                                                    onChange={e => setFormData({ ...formData, short_description: e.target.value })}
                                                    placeholder="Brief overview for product cards..."
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-bold text-gray-950 focus:ring-2 focus:ring-gray-950/5 outline-none transition-all resize-none"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">Full Description</label>
                                                <textarea
                                                    required
                                                    rows="4"
                                                    value={formData.description}
                                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                    placeholder="Detailed description of the product..."
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-bold text-gray-950 focus:ring-2 focus:ring-gray-950/5 outline-none transition-all resize-none"
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Specifications</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({
                                                            ...formData,
                                                            specifications: [...(formData.specifications || []), { key: '', value: '' }]
                                                        })}
                                                        className="text-[10px] font-black text-emerald-600 uppercase tracking-widest"
                                                    >
                                                        + Add Spec
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    {(formData.specifications || []).map((spec, i) => (
                                                        <div key={i} className="flex gap-3">
                                                            <input
                                                                placeholder="Key (e.g. Material)"
                                                                value={spec.key}
                                                                onChange={e => {
                                                                    const newSpecs = [...formData.specifications];
                                                                    newSpecs[i].key = e.target.value;
                                                                    setFormData({ ...formData, specifications: newSpecs });
                                                                }}
                                                                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold"
                                                            />
                                                            <input
                                                                placeholder="Value (e.g. Corrugated)"
                                                                value={spec.value}
                                                                onChange={e => {
                                                                    const newSpecs = [...formData.specifications];
                                                                    newSpecs[i].value = e.target.value;
                                                                    setFormData({ ...formData, specifications: newSpecs });
                                                                }}
                                                                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newSpecs = formData.specifications.filter((_, idx) => idx !== i);
                                                                    setFormData({ ...formData, specifications: newSpecs });
                                                                }}
                                                                className="p-3 text-red-500 hover:bg-red-50 rounded-xl"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">Length</label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={formData.length}
                                                        onChange={e => setFormData({ ...formData, length: e.target.value })}
                                                        placeholder="8.5"
                                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-bold text-gray-950 focus:ring-2 focus:ring-gray-950/5 outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">Width</label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={formData.width}
                                                        onChange={e => setFormData({ ...formData, width: e.target.value })}
                                                        placeholder="6.5"
                                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-bold text-gray-950 focus:ring-2 focus:ring-gray-950/5 outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">Height</label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={formData.height}
                                                        onChange={e => setFormData({ ...formData, height: e.target.value })}
                                                        placeholder="2"
                                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-bold text-gray-950 focus:ring-2 focus:ring-gray-950/5 outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">Unit</label>
                                                    <select
                                                        value={formData.unit}
                                                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-bold text-gray-950 focus:ring-2 focus:ring-gray-950/5 outline-none transition-all appearance-none"
                                                    >
                                                        <option value="inch">Inch</option>
                                                        <option value="cm">CM</option>
                                                        <option value="mm">MM</option>
                                                    </select>
                                                </div>
                                            </div>
                                            {/* Tiered Pricing (₹ per Unit / % Discount) */}
                                            <div className="space-y-4 border-t border-gray-100 pt-6 mt-6">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                    <h4 className="text-[10px] font-black text-emerald-600 block uppercase tracking-widest">Tiered Discounts & Slabs</h4>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, pricingMode: 'tiered' })}
                                                            className={`py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${
                                                                formData.pricingMode !== 'slabs'
                                                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            Standard Tiers
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, pricingMode: 'slabs' })}
                                                            className={`py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${
                                                                formData.pricingMode === 'slabs'
                                                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            Custom Slabs
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                {/* Base Price Row */}
                                                <div className="grid grid-cols-12 gap-4 items-center mb-4">
                                                    <div className="col-span-4 text-xs font-black text-gray-700">Base Price (Qty 1)</div>
                                                    <div className="col-span-8 relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                                                        <input 
                                                            type="number"
                                                            step="0.01"
                                                            value={formData.priceAt1}
                                                            onChange={e => {
                                                                const basePrice = parseFloat(e.target.value) || 0;
                                                                const updated = { ...formData, priceAt1: e.target.value };
                                                                if (formData.pricingMode === 'slabs' && Array.isArray(formData.priceSlabs)) {
                                                                    updated.priceSlabs = formData.priceSlabs.map(slab => {
                                                                        const disc = parseFloat(slab.discount) || 0;
                                                                        if (disc > 0 && basePrice > 0) {
                                                                            return {
                                                                                ...slab,
                                                                                price: parseFloat((basePrice * (1 - disc / 100)).toFixed(2))
                                                                            };
                                                                        }
                                                                        return slab;
                                                                    });
                                                                } else {
                                                                    const tiers = [10, 50, 100, 500, 1000];
                                                                    tiers.forEach(qty => {
                                                                        const discountVal = parseFloat(formData[`discountAt${qty}`]);
                                                                        if (discountVal > 0 && basePrice > 0) {
                                                                            updated[`priceAt${qty}`] = (basePrice * (1 - discountVal / 100)).toFixed(2);
                                                                        }
                                                                    });
                                                                }
                                                                setFormData(updated);
                                                            }}
                                                            placeholder="Base Price"
                                                            className="w-full bg-white border border-gray-200 rounded-xl md:rounded-2xl pl-8 pr-4 py-3 text-sm font-bold text-gray-955 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 outline-none transition-all shadow-sm"
                                                        />
                                                    </div>
                                                </div>

                                                {formData.pricingMode !== 'slabs' ? (
                                                    <>
                                                        {/* Header */}
                                                        <div className="grid grid-cols-12 gap-4 text-[9px] font-black text-gray-400 pb-2 border-b border-gray-100 uppercase tracking-widest">
                                                            <div className="col-span-4">QUANTITY SLAB</div>
                                                            <div className="col-span-4">PRICE (₹)</div>
                                                            <div className="col-span-4">DISCOUNT (%)</div>
                                                        </div>

                                                        {/* Slab rows */}
                                                        {[10, 50, 100, 500, 1000].map(qty => (
                                                            <div key={qty} className="grid grid-cols-12 gap-4 items-center py-2 border-b border-gray-50">
                                                                <div className="col-span-4 text-xs font-black text-gray-600">Qty {qty}+</div>
                                                                <div className="col-span-4 relative">
                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                                                                    <input 
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={formData[`priceAt${qty}`]}
                                                                        onChange={e => {
                                                                            const priceVal = e.target.value;
                                                                            const numericPrice = parseFloat(priceVal);
                                                                            const basePrice = parseFloat(formData.priceAt1) || 0;
                                                                            
                                                                            let computedDiscount = "";
                                                                            if (priceVal !== "" && !isNaN(numericPrice) && basePrice > 0) {
                                                                                computedDiscount = (((basePrice - numericPrice) / basePrice) * 100).toFixed(1);
                                                                            }
                                                                            setFormData({
                                                                                ...formData,
                                                                                [`priceAt${qty}`]: priceVal,
                                                                                [`discountAt${qty}`]: computedDiscount
                                                                            });
                                                                        }}
                                                                        placeholder="0.00"
                                                                        className="w-full bg-white border border-gray-200 rounded-xl md:rounded-2xl pl-8 pr-4 py-3 text-sm font-bold text-gray-955 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 outline-none transition-all shadow-sm text-center"
                                                                    />
                                                                </div>
                                                                <div className="col-span-4 relative">
                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                                                                    <input 
                                                                        type="number"
                                                                        step="0.1"
                                                                        value={formData[`discountAt${qty}`]}
                                                                        onChange={e => {
                                                                            const discountVal = e.target.value;
                                                                            const numericDiscount = parseFloat(discountVal);
                                                                            const basePrice = parseFloat(formData.priceAt1) || 0;
                                                                            
                                                                            let computedPrice = "";
                                                                            if (discountVal !== "" && !isNaN(numericDiscount) && basePrice > 0) {
                                                                                computedPrice = (basePrice * (1 - numericDiscount / 100)).toFixed(2);
                                                                            }
                                                                            setFormData({
                                                                                ...formData,
                                                                                [`discountAt${qty}`]: discountVal,
                                                                                [`priceAt${qty}`]: computedPrice
                                                                            });
                                                                        }}
                                                                        placeholder="0.0%"
                                                                        className="w-full bg-white border border-gray-200 rounded-xl md:rounded-2xl pl-8 pr-4 py-3 text-sm font-bold text-gray-955 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 outline-none transition-all shadow-sm text-center"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </>
                                                ) : (
                                                    <div className="space-y-4 pt-2">
                                                        <div className="flex items-center justify-between">
                                                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Custom Slabs List</h5>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const currentSlabs = Array.isArray(formData.priceSlabs) ? formData.priceSlabs : [];
                                                                    const lastMinQty = currentSlabs.length > 0 
                                                                        ? Math.max(...currentSlabs.map(s => s.minQty)) 
                                                                        : 0;
                                                                    const newSlab = {
                                                                        minQty: lastMinQty + 10,
                                                                        maxQty: 999999,
                                                                        price: 0,
                                                                        discount: 0
                                                                    };
                                                                    const updatedSlabs = [...currentSlabs, newSlab].sort((a, b) => a.minQty - b.minQty);
                                                                    setFormData({
                                                                        ...formData,
                                                                        priceSlabs: updatedSlabs
                                                                    });
                                                                }}
                                                                className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-100 transition-all"
                                                            >
                                                                + Add Slab
                                                            </button>
                                                        </div>

                                                        {/* Table header */}
                                                        <div className="grid grid-cols-12 gap-2 text-[9px] font-black text-gray-400 pb-2 border-b border-gray-100 uppercase tracking-widest">
                                                            <div className="col-span-4">QTY SLAB</div>
                                                            <div className="col-span-3 text-center">PRICE (₹)</div>
                                                            <div className="col-span-3 text-center">DISCOUNT (%)</div>
                                                            <div className="col-span-2 text-right">ACTION</div>
                                                        </div>

                                                        {/* Slab Rows */}
                                                        {((Array.isArray(formData.priceSlabs) ? formData.priceSlabs : [])).map((slab, index) => {
                                                            const slabs = Array.isArray(formData.priceSlabs) ? formData.priceSlabs : [];
                                                            return (
                                                                <div key={index} className="grid grid-cols-12 gap-2 items-start py-2 border-b border-gray-50">
                                                                    <div className="col-span-4 flex flex-col gap-1">
                                                                        <div className="relative flex items-center gap-1.5">
                                                                            <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400 shrink-0">From</span>
                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                value={slab.minQty}
                                                                                onChange={e => {
                                                                                    const val = e.target.value;
                                                                                    const newMinQty = val === "" ? "" : (parseInt(val) || 0);
                                                                                    const updatedSlabs = [...slabs];
                                                                                    updatedSlabs[index] = { ...slab, minQty: newMinQty };
                                                                                    setFormData({ ...formData, priceSlabs: updatedSlabs });
                                                                                }}
                                                                                onBlur={() => {
                                                                                    const updatedSlabs = [...slabs];
                                                                                    const normalized = updatedSlabs.map(s => ({
                                                                                        ...s,
                                                                                        minQty: s.minQty === "" ? 0 : s.minQty
                                                                                    }));
                                                                                    const sorted = normalized.sort((a, b) => a.minQty - b.minQty);
                                                                                    setFormData({ ...formData, priceSlabs: sorted });
                                                                                }}
                                                                                className={`w-14 bg-white border rounded-lg px-1.5 py-1 text-xs font-bold text-gray-955 text-center outline-none transition-all ${
                                                                                    slab.maxQty !== 999999 && slab.minQty !== "" && slab.maxQty !== "" && Number(slab.minQty) > Number(slab.maxQty)
                                                                                        ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500/10'
                                                                                        : 'border-gray-200 focus:border-emerald-500'
                                                                                }`}
                                                                            />
                                                                            <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400 shrink-0">To</span>
                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                value={slab.maxQty === 999999 ? "" : slab.maxQty}
                                                                                onChange={e => {
                                                                                    const val = e.target.value;
                                                                                    const newMaxQty = val === "" ? 999999 : (parseInt(val) || 0);
                                                                                    const updatedSlabs = [...slabs];
                                                                                    updatedSlabs[index] = { ...slab, maxQty: newMaxQty };
                                                                                    setFormData({ ...formData, priceSlabs: updatedSlabs });
                                                                                }}
                                                                                onBlur={() => {
                                                                                    const updatedSlabs = [...slabs];
                                                                                    const normalized = updatedSlabs.map(s => ({
                                                                                        ...s,
                                                                                        minQty: s.minQty === "" ? 0 : s.minQty
                                                                                    }));
                                                                                    const sorted = normalized.sort((a, b) => a.minQty - b.minQty);
                                                                                    setFormData({ ...formData, priceSlabs: sorted });
                                                                                }}
                                                                                placeholder="+"
                                                                                className={`w-14 bg-white border rounded-lg px-1.5 py-1 text-xs font-bold text-gray-955 text-center outline-none transition-all ${
                                                                                    slab.maxQty !== 999999 && slab.minQty !== "" && slab.maxQty !== "" && Number(slab.minQty) > Number(slab.maxQty)
                                                                                        ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500/10'
                                                                                        : 'border-gray-200 focus:border-emerald-500'
                                                                                }`}
                                                                            />
                                                                        </div>
                                                                        {slab.maxQty !== 999999 && slab.minQty !== "" && slab.maxQty !== "" && Number(slab.minQty) > Number(slab.maxQty) && (
                                                                            <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter block leading-none mt-0.5">
                                                                                From &gt; To Error
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <div className="col-span-3 relative">
                                                                        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">₹</span>
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            value={slab.price}
                                                                            onChange={e => {
                                                                                const priceVal = e.target.value;
                                                                                const numericPrice = parseFloat(priceVal) || 0;
                                                                                const basePrice = parseFloat(formData.priceAt1) || 0;
                                                                                let computedDiscount = 0;
                                                                                if (numericPrice > 0 && basePrice > 0) {
                                                                                    computedDiscount = parseFloat((((basePrice - numericPrice) / basePrice) * 100).toFixed(1));
                                                                                }
                                                                                const updatedSlabs = [...slabs];
                                                                                updatedSlabs[index] = {
                                                                                    ...slab,
                                                                                    price: priceVal === "" ? "" : numericPrice,
                                                                                    discount: computedDiscount
                                                                                };
                                                                                setFormData({ ...formData, priceSlabs: updatedSlabs });
                                                                            }}
                                                                            placeholder="0.00"
                                                                            className="w-full bg-white border border-gray-200 rounded-lg pl-4 pr-1 py-1 text-xs font-bold text-gray-955 text-center outline-none focus:border-emerald-500 transition-all"
                                                                        />
                                                                    </div>

                                                                    <div className="col-span-3 relative">
                                                                        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">%</span>
                                                                        <input
                                                                            type="number"
                                                                            step="0.1"
                                                                            value={slab.discount}
                                                                            onChange={e => {
                                                                                const discountVal = e.target.value;
                                                                                const numericDiscount = parseFloat(discountVal) || 0;
                                                                                const basePrice = parseFloat(formData.priceAt1) || 0;
                                                                                let computedPrice = 0;
                                                                                if (numericDiscount > 0 && basePrice > 0) {
                                                                                    computedPrice = parseFloat((basePrice * (1 - numericDiscount / 100)).toFixed(2));
                                                                                }
                                                                                const updatedSlabs = [...slabs];
                                                                                updatedSlabs[index] = {
                                                                                    ...slab,
                                                                                    discount: discountVal === "" ? "" : numericDiscount,
                                                                                    price: computedPrice
                                                                                };
                                                                                setFormData({ ...formData, priceSlabs: updatedSlabs });
                                                                            }}
                                                                            placeholder="0.0"
                                                                            className="w-full bg-white border border-gray-200 rounded-lg pl-4 pr-1 py-1 text-xs font-bold text-gray-955 text-center outline-none focus:border-emerald-500 transition-all"
                                                                        />
                                                                    </div>

                                                                    <div className="col-span-2 text-right">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const updatedSlabs = slabs.filter((_, idx) => idx !== index);
                                                                                setFormData({ ...formData, priceSlabs: updatedSlabs });
                                                                            }}
                                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                            title="Delete Slab"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}

                                                        {(!formData.priceSlabs || formData.priceSlabs.length === 0) && (
                                                            <p className="text-[10px] text-gray-400 italic text-center py-4">No slabs defined. Click + Add Slab to begin.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-2 mt-6">
                                                <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">B2B Quote Trigger Qty *</label>
                                                <input
                                                    required
                                                    type="number"
                                                    value={formData.triggerValue}
                                                    onChange={e => setFormData({ ...formData, triggerValue: parseInt(e.target.value) || 500 })}
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-bold text-gray-955 focus:ring-2 focus:ring-gray-950/5 outline-none transition-all"
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Product Media</label>
                                                        <p className="text-[10px] text-gray-400 font-medium">Manage your product gallery and primary image</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const url = prompt('Enter Image URL:');
                                                            if (url) {
                                                                const current = formData.images ? formData.images.split(',').map(u => u.trim()).filter(Boolean) : [];
                                                                setFormData({ ...formData, images: [...current, url].join(', ') });
                                                            }
                                                        }}
                                                        className="text-[10px] font-black text-gray-400 hover:text-gray-950 uppercase tracking-widest transition-colors"
                                                    >
                                                        + Add by URL
                                                    </button>
                                                </div>

                                                <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto snap-x md:overflow-visible pb-4 md:pb-0 scrollbar-hide">
                                                    {/* Upload Box */}
                                                    <label className={`w-[160px] md:w-auto shrink-0 snap-start aspect-square border-2 border-dashed border-gray-200 rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center gap-2 md:gap-3 cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 transition-all group ${isUploadingImages ? 'opacity-50 pointer-events-none' : ''}`}>
                                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gray-50 group-hover:bg-white flex items-center justify-center transition-colors">
                                                            {isUploadingImages ? <Loader2 size={20} className="text-emerald-500 animate-spin md:w-6 md:h-6" /> : <UploadCloud size={20} className="text-gray-400 group-hover:text-emerald-500 md:w-6 md:h-6" />}
                                                        </div>
                                                        <div className="text-center px-4">
                                                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest block">{isUploadingImages ? 'Uploading...' : 'Upload Media'}</span>
                                                            <span className="text-[8px] text-gray-400 font-medium block mt-1">PNG, JPG up to 10MB</span>
                                                        </div>
                                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                                                    </label>
                                                    {/* Image Thumbnails */}
                                                    {(formData.images || '').split(',').map((url, i) => {
                                                        const trimmedUrl = url.trim();
                                                        if (!trimmedUrl) return null;
                                                        return (
                                                            <div key={i} className="w-[160px] md:w-auto shrink-0 snap-start flex flex-col justify-between p-3 bg-white border border-gray-100 rounded-2xl md:rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300 group relative">
                                                                <div className="flex flex-col gap-3">
                                                                    {/* Image Container */}
                                                                    <div className="aspect-square rounded-xl md:rounded-[1.5rem] overflow-hidden relative bg-gray-50 flex items-center justify-center border border-gray-50">
                                                                        <img src={trimmedUrl} className="w-full h-full object-contain p-2" alt={`Product ${i + 1}`} />

                                                                        {/* Download Icon on Hover */}
                                                                        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleDownload(trimmedUrl, `${formData.name}_img_${i + 1}`)}
                                                                                className="p-1.5 bg-white/95 backdrop-blur-sm text-gray-700 hover:text-gray-900 rounded-lg transition-all shadow-sm flex items-center justify-center"
                                                                                title="Download Image"
                                                                            >
                                                                                <Download size={12} />
                                                                            </button>
                                                                        </div>

                                                                        {/* Primary Indicator on Image */}
                                                                        {i === 0 && (
                                                                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest rounded-md shadow-sm z-10">
                                                                                Primary
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Text and Primary Status */}
                                                                    <div className="flex items-center justify-between px-1">
                                                                        <span className="text-xs font-black text-gray-800 tracking-tight">Product {i + 1}</span>
                                                                        {i === 0 ? (
                                                                            <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Primary</span>
                                                                        ) : (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const newUrls = formData.images.split(',').map(u => u.trim()).filter(Boolean);
                                                                                    const [moved] = newUrls.splice(i, 1);
                                                                                    newUrls.unshift(moved);
                                                                                    setFormData({ ...formData, images: newUrls.join(', ') });
                                                                                }}
                                                                                className="text-[9px] font-black uppercase text-emerald-600 hover:text-emerald-700 transition-colors"
                                                                            >
                                                                                Make Primary
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Actions */}
                                                                <div className="flex gap-2 justify-between items-center text-[10px] mt-2 pt-2 border-t border-gray-50 px-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const newUrl = prompt('Edit Image URL:', trimmedUrl);
                                                                            if (newUrl !== null && newUrl !== trimmedUrl) {
                                                                                const newUrls = formData.images.split(',').map(u => u.trim()).filter(Boolean);
                                                                                newUrls[i] = newUrl;
                                                                                setFormData({ ...formData, images: newUrls.join(', ') });
                                                                            }
                                                                        }}
                                                                        className="text-gray-400 hover:text-gray-800 transition-colors flex items-center gap-1 font-bold uppercase tracking-wider text-[9px]"
                                                                    >
                                                                        <Edit size={10} /> Edit
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            if (confirm('Are you sure you want to remove this image?')) {
                                                                                handleCloudinaryDelete(trimmedUrl);
                                                                                const newUrls = formData.images.split(',').map(u => u.trim()).filter(Boolean);
                                                                                newUrls.splice(i, 1);
                                                                                setFormData({ ...formData, images: newUrls.join(', ') });
                                                                            }
                                                                        }}
                                                                        className="text-red-400 hover:text-red-600 transition-colors flex items-center gap-1 font-bold uppercase tracking-wider text-[9px]"
                                                                    >
                                                                        <Trash2 size={10} /> Remove
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="space-y-3 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Internal Pattern Overlay (Admin Only)</label>
                                                    <span className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-widest">Order Processing Only</span>
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">The following pattern image is for internal use by the admin team and will be attached to customer orders for reproduction purposes. It is not publicly visible on the main catalog. (Max 9MB per PDF)</p>
                                                <div className="space-y-2">
                                                    <div className="flex flex-col md:flex-row gap-4">
                                                        <div className="flex-1 bg-white border border-gray-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row items-center gap-3 md:gap-4">
                                                            {formData.patternImg ? (
                                                                <div className="w-20 h-20 rounded-2xl border border-gray-200 overflow-hidden shrink-0 relative group flex items-center justify-center bg-gray-50 shadow-sm">
                                                                    {formData.patternFormat === 'pdf' || (typeof formData.patternImg === 'string' && formData.patternImg.toLowerCase().endsWith('.pdf')) ? (
                                                                        <div className="flex flex-col items-center justify-center text-red-500 scale-90">
                                                                            <FileText size={32} strokeWidth={2.5} />
                                                                            <span className="text-[7px] font-black uppercase mt-1">PDF DOC</span>
                                                                        </div>
                                                                    ) : (
                                                                        <img src={formData.patternImg} className="w-full h-full object-cover" alt="Pattern" />
                                                                    )}
                                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-wrap items-center justify-center gap-1.5 p-1">
                                                                        <a
                                                                            href={formData.patternImg}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="p-1.5 bg-white text-gray-900 rounded-lg hover:scale-110 active:scale-95 transition-all shadow-sm flex items-center justify-center"
                                                                            title="View"
                                                                        >
                                                                            <ImageIcon size={14} />
                                                                        </a>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleDownload(formData.patternImg, `${formData.name}_pattern`)}
                                                                            className="p-1.5 bg-white text-gray-900 rounded-lg hover:scale-110 active:scale-95 transition-all shadow-sm"
                                                                            title="Download"
                                                                        >
                                                                            <Download size={14} />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                handleCloudinaryDelete(formData.patternImg);
                                                                                setFormData({ ...formData, patternImg: '', patternFormat: '' });
                                                                            }}
                                                                            className="p-1.5 bg-red-500 text-white rounded-lg hover:scale-110 active:scale-95 transition-all shadow-sm"
                                                                            title="Remove"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0 border border-gray-100 shadow-inner">
                                                                    <ImageIcon size={24} className="text-gray-300" />
                                                                </div>
                                                            )}
                                                            <input
                                                                value={formData.patternImg}
                                                                onChange={e => setFormData({ ...formData, patternImg: e.target.value })}
                                                                placeholder="Pattern URL or upload ->"
                                                                className="w-full sm:flex-1 bg-transparent font-bold text-gray-950 outline-none text-sm text-center sm:text-left"
                                                            />
                                                            {formData.patternImg && (
                                                                <div className="flex gap-1">
                                                                    <a
                                                                        href={formData.patternImg}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all flex items-center justify-center"
                                                                        title="View"
                                                                    >
                                                                        <ImageIcon size={16} />
                                                                    </a>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(formData.patternImg);
                                                                            alert('Link copied!');
                                                                        }}
                                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                                        title="Copy Link"
                                                                    >
                                                                        <Copy size={16} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <label className={`w-full md:w-32 py-6 md:py-0 shrink-0 border-2 border-dashed border-gray-200 rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-all ${isUploadingPattern ? 'opacity-50 pointer-events-none' : ''}`}>
                                                            {isUploadingPattern ? <Loader2 size={24} className="text-emerald-500 animate-spin" /> : <UploadCloud size={24} className="text-gray-400" />}
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 text-center px-2">{isUploadingPattern ? 'Uploading...' : 'Upload Pattern'}</span>
                                                            <input type="file" accept="image/*,.pdf" className="hidden" onChange={handlePatternUpload} />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Dieline (Admin Only)</label>
                                                    <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-widest">Admin Reference</span>
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">Upload the dieline file for this product. This is strictly for admin reference and internal use. (Max 9MB per PDF)</p>
                                                <div className="space-y-2">
                                                    <div className="flex flex-col md:flex-row gap-4">
                                                        <div className="flex-1 bg-white border border-gray-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row items-center gap-3 md:gap-4">
                                                            {formData.dielineImg ? (
                                                                <div className="w-20 h-20 rounded-2xl border border-gray-200 overflow-hidden shrink-0 relative group flex items-center justify-center bg-gray-50 shadow-sm">
                                                                    {formData.dielineFormat === 'pdf' || (typeof formData.dielineImg === 'string' && formData.dielineImg.toLowerCase().endsWith('.pdf')) ? (
                                                                        <div className="flex flex-col items-center justify-center text-red-500 scale-90">
                                                                            <FileText size={32} strokeWidth={2.5} />
                                                                            <span className="text-[7px] font-black uppercase mt-1">PDF DOC</span>
                                                                        </div>
                                                                    ) : (
                                                                        <img src={formData.dielineImg} className="w-full h-full object-cover" alt="Dieline" />
                                                                    )}
                                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-wrap items-center justify-center gap-1.5 p-1">
                                                                        <a
                                                                            href={formData.dielineImg}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="p-1.5 bg-white text-gray-900 rounded-lg hover:scale-110 active:scale-95 transition-all shadow-sm flex items-center justify-center"
                                                                            title="View"
                                                                        >
                                                                            <ImageIcon size={14} />
                                                                        </a>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleDownload(formData.dielineImg, `${formData.name}_dieline`)}
                                                                            className="p-1.5 bg-white text-gray-900 rounded-lg hover:scale-110 active:scale-95 transition-all shadow-sm"
                                                                            title="Download"
                                                                        >
                                                                            <Download size={14} />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                handleCloudinaryDelete(formData.dielineImg);
                                                                                setFormData({ ...formData, dielineImg: '', dielineFormat: '' });
                                                                            }}
                                                                            className="p-1.5 bg-red-500 text-white rounded-lg hover:scale-110 active:scale-95 transition-all shadow-sm"
                                                                            title="Remove"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0 border border-gray-100 shadow-inner">
                                                                    <ImageIcon size={24} className="text-gray-300" />
                                                                </div>
                                                            )}
                                                            <input
                                                                value={formData.dielineImg}
                                                                onChange={e => setFormData({ ...formData, dielineImg: e.target.value })}
                                                                placeholder="Dieline URL or upload ->"
                                                                className="w-full sm:flex-1 bg-transparent font-bold text-gray-950 outline-none text-sm text-center sm:text-left"
                                                            />
                                                            {formData.dielineImg && (
                                                                <div className="flex gap-1">
                                                                    <a
                                                                        href={formData.dielineImg}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex items-center justify-center"
                                                                        title="View"
                                                                    >
                                                                        <ImageIcon size={16} />
                                                                    </a>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(formData.dielineImg);
                                                                            alert('Link copied!');
                                                                        }}
                                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                                        title="Copy Link"
                                                                    >
                                                                        <Copy size={16} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <label className={`w-full md:w-32 py-6 md:py-0 shrink-0 border-2 border-dashed border-gray-200 rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-all ${isUploadingDieline ? 'opacity-50 pointer-events-none' : ''}`}>
                                                            {isUploadingDieline ? <Loader2 size={24} className="text-emerald-500 animate-spin" /> : <UploadCloud size={24} className="text-gray-400" />}
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 text-center px-2">{isUploadingDieline ? 'Uploading...' : 'Upload Dieline'}</span>
                                                            <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleDielineUpload} />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-10 border-t border-gray-100 flex items-center gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setIsModalOpen(false)}
                                                className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-100 hover:text-gray-950 transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                disabled={isSaving}
                                                className="flex-2 py-5 bg-gray-950 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
                                            >
                                                {isSaving ? 'Saving...' : 'Save Product'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Category Manager Modal */}
            <AnimatePresence>
                {isCatModalOpen && (
                    <div className="fixed inset-0 z-100 flex items-center justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setIsCatModalOpen(false);
                                setEditingCatId(null);
                                setEditingCatData(null);
                            }}
                            className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-4xl h-full bg-white shadow-2xl p-6 md:p-10 overflow-y-auto flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-3xl font-black text-gray-950 tracking-tighter">Manage Categories</h2>
                                    <p className="text-gray-400 font-medium">Modify home/shop page categories, badges, and upload images.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsCatModalOpen(false);
                                        setEditingCatId(null);
                                        setEditingCatData(null);
                                    }}
                                    className="p-3 hover:bg-gray-100 rounded-2xl transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Main Body Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-grow">
                                {/* Left Panel: Add New Category */}
                                <div className="space-y-6 bg-gray-50/50 p-6 rounded-3xl border border-gray-100 h-fit">
                                    <h3 className="text-lg font-black text-gray-950 uppercase tracking-tight">Add New Category</h3>

                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category Name</label>
                                            <input
                                                type="text"
                                                value={newCatData.name}
                                                onChange={e => setNewCatData({ ...newCatData, name: e.target.value })}
                                                placeholder="e.g. Bento Box"
                                                className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-950 outline-none shadow-sm focus:ring-2 focus:ring-emerald-500/20"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Index/Order (e.g. 01)</label>
                                                <input
                                                    type="text"
                                                    value={newCatData.index}
                                                    onChange={e => setNewCatData({ ...newCatData, index: e.target.value })}
                                                    placeholder="e.g. 19"
                                                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-950 outline-none shadow-sm focus:ring-2 focus:ring-emerald-500/20"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Badge/Stats (e.g. FRESH)</label>
                                                <input
                                                    type="text"
                                                    value={newCatData.stats}
                                                    onChange={e => setNewCatData({ ...newCatData, stats: e.target.value })}
                                                    placeholder="e.g. OIL-SAFE"
                                                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-950 outline-none shadow-sm focus:ring-2 focus:ring-emerald-500/20"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category Image</label>
                                            <div className="flex items-center gap-3">
                                                {newCatData.image ? (
                                                    <div className="w-16 h-16 rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm flex items-center justify-center shrink-0">
                                                        <img src={newCatData.image} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="w-16 h-16 rounded-xl bg-gray-100 border border-dashed border-gray-200 flex items-center justify-center shrink-0">
                                                        <ImageIcon className="text-gray-300" size={20} />
                                                    </div>
                                                )}
                                                <div className="flex-grow flex flex-col gap-2">
                                                    <input
                                                        type="text"
                                                        value={newCatData.image}
                                                        onChange={e => setNewCatData({ ...newCatData, image: e.target.value })}
                                                        placeholder="Image URL or upload"
                                                        className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold text-gray-950 outline-none shadow-sm focus:ring-2 focus:ring-emerald-500/20"
                                                    />
                                                    <label className="w-full py-2 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-center cursor-pointer hover:bg-emerald-100 active:scale-95 transition-all">
                                                        {isUploadingCatImage ? 'Uploading...' : 'Upload Image File'}
                                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCatImageUpload(e, false)} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between py-2 border-t border-b border-gray-100">
                                            <div>
                                                <p className="text-xs font-black text-gray-950 uppercase tracking-tighter">Needs BOXFOX Branding</p>
                                                <p className="text-[9px] font-medium text-gray-400">Shows gold logo overlay on card</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setNewCatData({ ...newCatData, needsBranding: !newCatData.needsBranding })}
                                                className={`w-10 h-5 rounded-full transition-all duration-300 relative shrink-0 ${newCatData.needsBranding ? 'bg-emerald-500 shadow-lg' : 'bg-gray-200'}`}
                                            >
                                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${newCatData.needsBranding ? 'right-0.5' : 'left-0.5'}`} />
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleAddNewCategory}
                                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-emerald-500/10 active:scale-95"
                                        >
                                            Create Category
                                        </button>
                                    </div>
                                </div>

                                {/* Right Panel: Category List */}
                                <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
                                    <h3 className="text-lg font-black text-gray-950 uppercase tracking-tight">Active Categories ({categoriesList.length})</h3>

                                    <div className="space-y-3">
                                        {categoriesList.map(cat => {
                                            const isEditing = editingCatId === cat._id;
                                            const isFallback = cat._id.startsWith('fallback-');

                                            return (
                                                <div key={cat._id} className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm hover:shadow-md transition-all space-y-4">
                                                    {isEditing && editingCatData ? (
                                                        // Editing Mode UI
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Editing Category</span>
                                                                {isFallback && <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Seeding to Database</span>}
                                                            </div>

                                                            <div className="space-y-3">
                                                                <div className="space-y-1">
                                                                    <label className="text-[9px] font-black uppercase text-gray-400">Category Name</label>
                                                                    <input
                                                                        type="text"
                                                                        value={editingCatData.name}
                                                                        onChange={e => setEditingCatData({ ...editingCatData, name: e.target.value })}
                                                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold text-gray-950 outline-none"
                                                                    />
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div className="space-y-1">
                                                                        <label className="text-[9px] font-black uppercase text-gray-400">Index</label>
                                                                        <input
                                                                            type="text"
                                                                            value={editingCatData.index}
                                                                            onChange={e => setEditingCatData({ ...editingCatData, index: e.target.value })}
                                                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold text-gray-950 outline-none"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[9px] font-black uppercase text-gray-400">Stats/Badge</label>
                                                                        <input
                                                                            type="text"
                                                                            value={editingCatData.stats}
                                                                            onChange={e => setEditingCatData({ ...editingCatData, stats: e.target.value })}
                                                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold text-gray-950 outline-none"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-1">
                                                                    <label className="text-[9px] font-black uppercase text-gray-400">Image</label>
                                                                    <div className="flex items-center gap-3">
                                                                        {editingCatData.image && (
                                                                            <img src={editingCatData.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                                                                        )}
                                                                        <div className="flex-1 flex flex-col gap-1.5">
                                                                            <input
                                                                                type="text"
                                                                                value={editingCatData.image}
                                                                                onChange={e => setEditingCatData({ ...editingCatData, image: e.target.value })}
                                                                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 text-[10px] font-bold text-gray-950 outline-none"
                                                                            />
                                                                            <label className="w-full py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest text-center cursor-pointer hover:bg-emerald-100">
                                                                                {isUploadingCatImage ? 'Uploading...' : 'Upload Image File'}
                                                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCatImageUpload(e, true)} />
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center justify-between py-1.5 border-t border-b border-gray-100">
                                                                    <span className="text-xs font-black text-gray-950 uppercase tracking-tighter">Needs BOXFOX Branding</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setEditingCatData({ ...editingCatData, needsBranding: !editingCatData.needsBranding })}
                                                                        className={`w-8 h-4 rounded-full transition-all duration-300 relative shrink-0 ${editingCatData.needsBranding ? 'bg-emerald-500 shadow-lg' : 'bg-gray-200'}`}
                                                                    >
                                                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-sm ${editingCatData.needsBranding ? 'right-0.5' : 'left-0.5'}`} />
                                                                    </button>
                                                                </div>

                                                                <div className="flex gap-2 pt-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleSaveCategory(editingCatData)}
                                                                        className="flex-1 py-2 bg-gray-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all"
                                                                    >
                                                                        Save Category
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setEditingCatId(null);
                                                                            setEditingCatData(null);
                                                                        }}
                                                                        className="px-4 py-2 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        // View Mode UI
                                                        <div className="flex items-center gap-4">
                                                            {/* Image */}
                                                            <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 relative flex items-center justify-center shadow-inner">
                                                                <img
                                                                    src={cat.image || "/categories/cat_cake.png"}
                                                                    alt={cat.name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.src = "/BOXFOX-1.png";
                                                                        e.target.onerror = null;
                                                                    }}
                                                                />
                                                                {cat.needsBranding && (
                                                                    <div className="absolute inset-0 bg-yellow-500/10 flex items-center justify-center pointer-events-none">
                                                                        <span className="text-[6px] font-black text-yellow-600 bg-white/90 border border-yellow-500/20 px-1 rounded-sm tracking-tighter uppercase scale-90">BFX</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] font-bold text-gray-400">{cat.index || '00'}</span>
                                                                    <h4 className="text-sm font-black text-gray-950 truncate">{cat.name}</h4>
                                                                </div>
                                                                <div className="flex gap-1.5 mt-1">
                                                                    <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md uppercase tracking-widest">
                                                                        {cat.stats || 'DURABLE'}
                                                                    </span>
                                                                    {isFallback && (
                                                                        <span className="text-[8px] font-black text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-md uppercase tracking-widest">
                                                                            Default Template
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="flex gap-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setEditingCatId(cat._id);
                                                                        setEditingCatData({ ...cat });
                                                                    }}
                                                                    className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                                                                    title="Edit"
                                                                >
                                                                    <Edit size={14} />
                                                                </button>
                                                                {!isFallback && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDeleteCategoryById(cat._id, cat.name)}
                                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}




