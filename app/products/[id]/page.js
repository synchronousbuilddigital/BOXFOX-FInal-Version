"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingCart,
    CheckCircle2,
    Box,
    Sparkles,
    ShieldCheck,
    Truck,
    Star,
    ArrowRight,
    Heart,
    RefreshCw,
    Eye,
    EyeOff,
    BadgeCheck,
    X,
    Building2,
    Phone,
    Mail,
    Loader2
} from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import { useCart } from '@/app/context/CartContext';
import { useToast } from '@/app/context/ToastContext';
import { useAuth } from '@/app/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { calculateBoxPrice, MARKUP_TYPES } from '@/lib/boxfoxPricing';
import { calculateDynamicPrice } from '@/lib/boxEngine';
import { BOX_SPECIFICATIONS } from '@/lib/box-specifications';

export default function ProductPage() {
    const params = useParams();
    const router = useRouter();
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const { user } = useAuth() || {};

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImg, setActiveImg] = useState(0);
    const [quantity, setQuantity] = useState(10);
    const [viewMode, setViewMode] = useState('2D');
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [wishlistBusy, setWishlistBusy] = useState(false);
    const [labConfigs, setLabConfigs] = useState(null);
    const [selectedColor, setSelectedColor] = useState('');
    const [isDescExpanded, setIsDescExpanded] = useState(false);

    // B2B Inquiry form modal state
    const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
    const [inquiryForm, setInquiryForm] = useState({
        companyName: '',
        contactEmail: '',
        phoneNumber: '',
        requirements: ''
    });
    const [submittingInquiry, setSubmittingInquiry] = useState(false);
    const [inquirySuccess, setInquirySuccess] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/products/${params.id}`)
            .then(res => res.json())
            .then(data => {
                setProduct(data);
                if (data.minOrderQuantity) setQuantity(data.minOrderQuantity);
                if (data.colors && data.colors.length > 0) {
                    setSelectedColor(data.colors[0]);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [params.id]);

    useEffect(() => {
        fetch('/api/admin/lab/config')
            .then(res => res.json())
            .then(data => setLabConfigs(data))
            .catch(() => setLabConfigs(null));
    }, []);

    useEffect(() => {
        if (user) {
            setInquiryForm({
                companyName: user.businessName || '',
                contactEmail: user.email || '',
                phoneNumber: user.phone || '',
                requirements: `Inquiry for bulk order of ${product?.name || 'Product'} (Quantity: ${quantity}).`
            });
        }
    }, [user, product, quantity]);

    useEffect(() => {
        if (!product?._id && !product?.id) return;
        let mounted = true;

        fetch('/api/wishlist')
            .then(async (res) => {
                if (!res.ok) return { wishlist: [] };
                return res.json();
            })
            .then((data) => {
                if (!mounted) return;
                const ids = new Set();
                (data?.wishlist || []).forEach((item) => {
                    if (item?._id) ids.add(String(item._id));
                    if (item?.wpId || item?.id) ids.add(String(item.wpId || item.id));
                });
                setIsWishlisted(ids.has(String(product?._id)) || ids.has(String(product?.id)));
            })
            .catch(() => {
            });

        return () => {
            mounted = false;
        };
    }, [product?._id, product?.id]);

    const handleInquirySubmit = async (e) => {
        e.preventDefault();
        setSubmittingInquiry(true);
        try {
            const res = await fetch('/api/b2b/inquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...inquiryForm,
                    category: product.category || 'Packaging',
                    quantity: String(quantity),
                    spec: `${product.dimensions?.length || 0}x${product.dimensions?.width || 0}x${product.dimensions?.height || 0} ${product.dimensions?.unit || 'inch'}`,
                    requirements: `${inquiryForm.requirements}\nProduct Name: ${product.name}\nSKU: ${product.sku || 'N/A'}`
                })
            });
            if (res.ok) {
                setInquirySuccess(true);
                showToast('Custom quote request submitted successfully!');
                setTimeout(() => {
                    setIsInquiryModalOpen(false);
                    setInquirySuccess(false);
                }, 2000);
            } else {
                showToast('Failed to submit quote request.', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Connection error.', 'error');
        } finally {
            setSubmittingInquiry(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="pt-32 px-6 flex justify-center italic text-gray-400">Loading Product...</div>
            </div>
        );
    }

    if (!product || product.error) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="pt-32 px-6 flex flex-col items-center justify-center italic text-gray-500">
                    <Box size={48} className="mb-4 text-gray-300" />
                    <h2 className="text-2xl font-black uppercase text-gray-900 mb-2">Product Not Available</h2>
                    <p>{product?.error || "This product could not be found or is no longer available."}</p>
                    <Link href="/shop" className="mt-6 px-6 py-3 bg-emerald-500 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-emerald-600 transition-all">
                        Return to Shop
                    </Link>
                </div>
            </div>
        );
    }

    const images = product.images && product.images.length > 0 ? product.images : [product.img];
    const displayImage = images[activeImg];
    const allowWishlist = product.allowWishlist !== false;

    // ─── ACCURATE PRICING ENGINE ─────────────────────────────────────────────
    const unit = product.dimensions?.unit || 'in';
    const dimensions = {
        l: product.dimensions?.length || 1,
        w: product.dimensions?.width || 1,
        h: product.dimensions?.height || 1
    };

    // Find a matching spec for manufacturing data
    const selectedSpec = BOX_SPECIFICATIONS.find(s =>
        s.l === dimensions.l &&
        s.w === dimensions.w &&
        s.h === dimensions.h &&
        s.unit === unit
    );

    // If admin has supplied explicit tier prices, use the dynamic power-decay curve
    const p1 = Number(product.priceAt1) || 0;
    let p10 = Number(product.priceAt10) || 0;
    let p50 = Number(product.priceAt50) || 0;
    let p100 = Number(product.priceAt100) || 0;
    let p500 = Number(product.priceAt500) || 0;
    let p1000 = Number(product.priceAt1000) || 0;

    // Auto-correct if admin mistakenly entered total price instead of unit price
    if (p1 > 0) {
        if (p10 > p1 * 1.5) p10 = p10 / 10;
        if (p50 > p1 * 1.5) p50 = p50 / 50;
        if (p100 > p1 * 1.5) p100 = p100 / 100;
        if (p500 > p1 * 1.5) p500 = p500 / 500;
        if (p1000 > p1 * 1.5) p1000 = p1000 / 1000;

        // Apply dynamic discount fallback if tier values are identical to p1 (indicating missing discount configuration)
        if (p50 === 0 || p50 === p1) {
            p50 = Math.round(p1 * 0.90 * 100) / 100; // 10% off
        }
        if (p100 === 0 || p100 === p1) {
            p100 = Math.round(p1 * 0.80 * 100) / 100; // 20% off
        }
    }

    const hasExplicitTiers = p1 || p10 || p50 || p100 || p500 || p1000;
    const tierUnitPrice = hasExplicitTiers
        ? calculateDynamicPrice(
              parseInt(quantity) || 10,
              p1,
              p10,
              p50,
              p100,
              p500,
              p1000
          )
        : null;

    const pricingResult = tierUnitPrice
        ? { finalPerUnit: tierUnitPrice, finalTotal: Math.ceil(tierUnitPrice * (parseInt(quantity) || 10)) }
        : calculateBoxPrice({
              spec: selectedSpec || { ups: 1, machine: 2029, sheetW: 20, sheetH: 29 },
              qty: parseInt(quantity) || 10,
              gsm: 280,
              material: 'SBS',
              brand: 'Normal',
              colours: 'Four Colour',
              lamination: 'Plain',
              markupType: 'Retail',
              dieCutting: true
          }, labConfigs);

    const triggerValue = product.triggerValue !== undefined ? product.triggerValue : 500;
    const isLargeOrder = quantity >= triggerValue;

    const unitPrice = isLargeOrder ? "Contact Us" : pricingResult.finalPerUnit.toFixed(2);

    return (
        <div className="min-h-screen bg-white">

            <main className="pt-20 lg:pt-24 pb-6 md:pb-8 px-4 md:px-8">
                <div className="max-w-[1400px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start">
                        {/* Left: Product Media */}
                        <div className="lg:col-span-5 lg:col-start-2 space-y-3 lg:space-y-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative aspect-square max-h-[300px] sm:max-h-none rounded-2xl lg:rounded-[2rem] overflow-hidden bg-gray-50 border border-gray-950/10 shadow-xl"
                            >
                                <div className="w-full h-full flex items-center justify-center p-4 md:p-16 text-center">
                                    <img src={displayImage} className="max-w-full max-h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700" />
                                </div>
                            </motion.div>

                            <div className="flex gap-2 p-1.5 bg-gray-50/50 rounded-2xl md:gap-4 md:p-2 md:rounded-3xl w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { setActiveImg(i); setViewMode('2D'); }}
                                        className={`relative w-14 h-14 md:w-24 md:h-24 rounded-xl md:rounded-2xl transition-all duration-300 shrink-0 ${activeImg === i && viewMode === '2D'
                                            ? 'ring-2 ring-gray-950 ring-offset-2 md:ring-offset-4 ring-offset-white scale-95 shadow-lg'
                                            : 'opacity-40 hover:opacity-100 hover:scale-105'
                                            }`}
                                    >
                                        <div className="w-full h-full rounded-xl md:rounded-2xl overflow-hidden bg-white border border-gray-100 p-1">
                                            <img src={img} className="w-full h-full object-contain" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right: Product Details */}
                        <div className="lg:col-span-5 space-y-4 lg:space-y-5">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black tracking-widest uppercase">
                                        Premium Series
                                    </span>
                                    {product.inStock && <span className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-1"><CheckCircle2 size={10} /> In Stock</span>}
                                </div>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h1 className="text-xl md:text-4xl lg:text-5xl font-black text-gray-950 tracking-tighter uppercase leading-tight">{product.name}</h1>
                                    </div>
                                    {allowWishlist && (
                                        <button
                                            onClick={async () => {
                                                if (wishlistBusy) return;
                                                setWishlistBusy(true);
                                                try {
                                                    const res = await fetch('/api/wishlist', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ productId: product._id || product.id })
                                                    });
                                                    if (res.status === 401) {
                                                        window.location.href = '/login';
                                                        return;
                                                    }
                                                    const data = await res.json();
                                                    if (res.ok) {
                                                        const nextWishlisted = data?.action === 'added';
                                                        setIsWishlisted(nextWishlisted);
                                                        showToast(data?.message || (nextWishlisted ? 'Added to wishlist' : 'Removed from wishlist'));
                                                    } else {
                                                        showToast(data?.error || 'Failed to update wishlist', 'error');
                                                    }
                                                } catch (err) {
                                                    console.error(err);
                                                    showToast('Connection error', 'error');
                                                } finally {
                                                    setWishlistBusy(false);
                                                }
                                            }}
                                            className={`p-2.5 md:p-4 rounded-full transition-all border border-gray-100 shadow-sm shrink-0 ${isWishlisted ? 'bg-red-50 text-red-500 border-red-100' : 'bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50'} ${wishlistBusy ? 'opacity-60' : ''}`}
                                        >
                                            <Heart size={18} className="md:w-6 md:h-6" fill={isWishlisted ? 'currentColor' : 'none'} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                    {(() => {
                                        const desc = product.description || "The ultimate professional packaging solution for your premium brand. Structural integrity meets aesthetic perfection.";
                                        if (desc.length > 200) {
                                            return (
                                                <>
                                                    {isDescExpanded ? desc : `${desc.substring(0, 200)}...`}
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsDescExpanded(!isDescExpanded)}
                                                        className="text-emerald-600 hover:text-emerald-700 font-bold ml-1 transition-colors text-xs uppercase tracking-wider focus:outline-none"
                                                    >
                                                        {isDescExpanded ? 'Read Less' : 'Read More'}
                                                    </button>
                                                </>
                                            );
                                        }
                                        return desc;
                                    })()}
                                </p>
                            </div>

                            <div className="p-4 md:p-6 rounded-2xl md:rounded-[2rem] bg-gray-50 border border-gray-950/10 space-y-4 md:space-y-6">
                                <div className="grid grid-cols-3 gap-2 py-1 items-center border-b border-gray-950/5 pb-4">
                                    <div className="space-y-0.5">
                                        <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{quantity >= 50 ? 'Est. Unit' : 'Starts At'}</p>
                                        <p className="text-xl md:text-3xl lg:text-4xl font-black text-gray-950 tracking-tighter">{isLargeOrder ? "" : "₹"}{unitPrice}</p>
                                    </div>
                                    <div className="space-y-0.5 text-center border-x border-gray-200 px-1">
                                        <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Dimensions</p>
                                        <p className="text-[10px] md:text-xs font-black text-gray-950 uppercase truncate">
                                            {(() => {
                                                const d = product.dimensions;
                                                if (d && (d.length > 0 || d.width > 0 || d.height > 0)) {
                                                    return `${d.length}x${d.width}x${d.height} ${d.unit || 'in'}`;
                                                }
                                                const match = product.name?.match(/(\d+(?:\.\d+)?)\s*[x*]\s*(\d+(?:\.\d+)?)\s*[x*]\s*(\d+(?:\.\d+)?)\s*(mm|inch|in|cm)?/i);
                                                if (match) {
                                                    return `${match[1]}x${match[2]}x${match[3]} ${match[4] || 'mm'}`;
                                                }
                                                return '—';
                                            })()}
                                        </p>
                                    </div>
                                    <div className="space-y-0.5 text-right">
                                        <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Min Order</p>
                                        <p className="text-xs md:text-base font-black text-gray-950 whitespace-nowrap">{Math.max(10, product.minOrderQuantity || 10)} Units</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {hasExplicitTiers && (
                                        <div className="bg-white/50 backdrop-blur-sm border border-gray-100 rounded-2xl p-3 md:p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Volume Savings</p>
                                                <span className="text-[7px] md:text-[8px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">Tiered discounts active</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-1.5">
                                                {[
                                                    { qty: 1, val: p1 },
                                                    { qty: 10, val: p10 },
                                                    { qty: 50, val: p50 },
                                                    { qty: 100, val: p100 },
                                                    { qty: 500, val: p500 },
                                                    { qty: 1000, val: p1000 }
                                                ].filter(t => t.val > 0).map((tier, index, arr) => {
                                                    const p1Val = p1 || 0;
                                                    const unitVal = (p1Val > 0 && tier.val > p1Val * 1.5) ? tier.val / tier.qty : tier.val;
                                                    return (
                                                    <div key={tier.qty} className={`text-center p-1.5 md:p-2 rounded-xl border ${
                                                        index === arr.length - 1 
                                                            ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/20" 
                                                            : index === arr.length - 2 
                                                                ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                                                                : "bg-gray-50 border-gray-100"
                                                    }`}>
                                                        <p className={`text-[7px] md:text-[8px] font-black uppercase tracking-tighter ${index === arr.length - 1 ? "text-emerald-100" : index === arr.length - 2 ? "text-emerald-600" : "text-gray-400"}`}>{tier.qty} {tier.qty === 1 ? "Unit" : "Units"}</p>
                                                        <p className={`text-xs md:text-sm font-black tracking-tighter ${index === arr.length - 1 ? "text-white" : index === arr.length - 2 ? "text-emerald-600" : "text-gray-955"}`}>₹{Number(unitVal).toFixed(2)}/u</p>
                                                    </div>
                                                )})}
                                            </div>
                                        </div>
                                    )}


                                    <div className="space-y-4">
                                        {product.colors && product.colors.length > 0 && (
                                            <div className="space-y-1.5">
                                                <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Select Color Variant</p>
                                                <div className="flex flex-wrap gap-1.5 px-1">
                                                    {product.colors.map((colorHex) => {
                                                        const isSelected = selectedColor === colorHex;
                                                        return (
                                                            <button
                                                                key={colorHex}
                                                                type="button"
                                                                onClick={() => setSelectedColor(colorHex)}
                                                                title={colorHex.toUpperCase()}
                                                                className={`w-7 h-7 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-gray-950 scale-110 shadow' : 'border-gray-200 hover:scale-105'}`}
                                                                style={{ backgroundColor: colorHex }}
                                                            >
                                                                {isSelected && (
                                                                    <CheckCircle2 size={12} className={colorHex === "#ffffff" || colorHex === "#fef08a" ? "text-gray-900" : "text-white"} />
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-2 items-end">
                                            <div className="w-24 md:w-28 shrink-0">
                                                <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 px-1">Units</p>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={quantity}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === "") {
                                                                setQuantity("");
                                                            } else {
                                                                setQuantity(parseInt(val) || "");
                                                            }
                                                        }}
                                                        onBlur={() => {
                                                            const minQ = Math.max(10, product.minOrderQuantity || 10);
                                                            if (!quantity || quantity < minQ) setQuantity(minQ);
                                                        }}
                                                        className="w-full py-3 px-3 rounded-xl bg-white border-2 border-gray-100 font-black text-xs md:text-sm text-gray-955 focus:border-emerald-500 focus:bg-emerald-50/10 outline-none transition-all"
                                                        min={10}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                {isLargeOrder ? (
                                                    <button
                                                        onClick={() => setIsInquiryModalOpen(true)}
                                                        className="w-full py-3 bg-emerald-500 text-white rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-[0.15em] hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 group"
                                                    >
                                                        <Sparkles size={14} className="group-hover:scale-110 transition-transform shrink-0" />
                                                        <span className="truncate">Request <span className="hidden sm:inline">Custom </span>Quote</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => addToCart({ ...product, selectedColor }, quantity)}
                                                        className="w-full py-3 bg-gray-950 text-white rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-[0.15em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-gray-200 group"
                                                    >
                                                        <ShoppingCart size={14} className="group-hover:scale-110 transition-transform shrink-0" />
                                                        <span className="truncate">Add <span className="hidden sm:inline">to Basket</span></span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0"><Truck size={14} className="text-emerald-500" /></div>
                                <div>
                                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-gray-955 leading-tight">Express Shipping</p>
                                    <p className="text-[7px] md:text-[8px] font-bold text-gray-400 uppercase tracking-tighter leading-none">Pan India Delivery</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0"><ShieldCheck size={14} className="text-emerald-500" /></div>
                                <div>
                                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-gray-955 leading-tight">Secure Payment</p>
                                    <p className="text-[7px] md:text-[8px] font-bold text-gray-400 uppercase tracking-tighter leading-none">100% Secured</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

            {/* B2B INQUIRY FORM MODAL */}
            <AnimatePresence>
                {isInquiryModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-md overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-xl bg-white border border-gray-200 rounded-[3rem] p-8 lg:p-12 shadow-2xl relative max-h-[90vh] overflow-y-auto"
                        >
                            <button
                                onClick={() => setIsInquiryModalOpen(false)}
                                className="absolute top-8 right-8 p-3 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl transition-all"
                            >
                                <X size={18} className="text-gray-600" />
                            </button>

                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="text-emerald-500" size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 italic">B2B Procurement Protocol</span>
                            </div>
                            <h3 className="text-2xl font-black uppercase italic text-gray-950 mb-8 border-b border-gray-100 pb-4">
                                Request Custom Quote
                            </h3>

                            {inquirySuccess ? (
                                <div className="py-12 text-center space-y-4">
                                    <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <h4 className="text-lg font-black uppercase">Transmission Active</h4>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold italic">"Our engineering team is analyzing your specifications."</p>
                                </div>
                            ) : (
                                <form onSubmit={handleInquirySubmit} className="space-y-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    <div>
                                        <label className="block mb-2 ml-1">Company Name</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                                            <input
                                                required
                                                type="text"
                                                value={inquiryForm.companyName}
                                                onChange={e => setInquiryForm({ ...inquiryForm, companyName: e.target.value })}
                                                placeholder="Acme Corp"
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-emerald-500 text-xs font-bold text-gray-955 uppercase"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block mb-2 ml-1">Contact Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                                            <input
                                                required
                                                type="email"
                                                value={inquiryForm.contactEmail}
                                                onChange={e => setInquiryForm({ ...inquiryForm, contactEmail: e.target.value })}
                                                placeholder="name@company.com"
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-emerald-500 text-xs font-bold text-gray-955 normal-case"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block mb-2 ml-1">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                                            <input
                                                required
                                                type="tel"
                                                value={inquiryForm.phoneNumber}
                                                onChange={e => setInquiryForm({ ...inquiryForm, phoneNumber: e.target.value })}
                                                placeholder="+91 XXXXX XXXXX"
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-emerald-500 text-xs font-bold text-gray-955"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block mb-2 ml-1">Specs & Requirements</label>
                                        <textarea
                                            value={inquiryForm.requirements}
                                            onChange={e => setInquiryForm({ ...inquiryForm, requirements: e.target.value })}
                                            rows={3}
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-emerald-500 text-xs font-bold text-gray-955 uppercase font-sans tracking-normal resize-none"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={submittingInquiry}
                                            className="w-full py-5 bg-gray-950 text-white rounded-2xl hover:bg-emerald-600 transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                                        >
                                            {submittingInquiry ? <Loader2 className="animate-spin" size={16} /> : <>Initialize Quote Protocol <ArrowRight size={14} /></>}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
