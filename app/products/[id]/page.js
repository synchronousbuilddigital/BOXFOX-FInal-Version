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
import { calculateBoxPrice, MARKUP_TYPES, unitPriceFromSixPoints } from '@/lib/boxfoxPricing';
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
    const [showSlabTable, setShowSlabTable] = useState(false);

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

    const discountAt10 = product.discountAt10 !== undefined && product.discountAt10 !== null ? Number(product.discountAt10) : null;
    const discountAt50 = product.discountAt50 !== undefined && product.discountAt50 !== null ? Number(product.discountAt50) : null;
    const discountAt100 = product.discountAt100 !== undefined && product.discountAt100 !== null ? Number(product.discountAt100) : null;
    const discountAt500 = product.discountAt500 !== undefined && product.discountAt500 !== null ? Number(product.discountAt500) : null;
    const discountAt1000 = product.discountAt1000 !== undefined && product.discountAt1000 !== null ? Number(product.discountAt1000) : null;

    // Auto-correct if admin mistakenly entered total price instead of unit price (legacy fallback only)
    if (p1 > 0 && discountAt10 === null && discountAt50 === null && discountAt100 === null && discountAt500 === null && discountAt1000 === null) {
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

    const isSlabs = product.pricingMode === 'slabs' && Array.isArray(product.priceSlabs) && product.priceSlabs.length > 0;

    const hasExplicitTiers = !!(p1 || p10 || p50 || p100 || p500 || p1000 || discountAt10 !== null || discountAt50 !== null || discountAt100 !== null || discountAt500 !== null || discountAt1000 !== null);

    const tierUnitPrice = isSlabs
        ? unitPriceFromSixPoints(product, quantity)
        : hasExplicitTiers
            ? calculateDynamicPrice(
                parseInt(quantity) || 10,
                p1,
                p10,
                p50,
                p100,
                p500,
                p1000,
                discountAt10,
                discountAt50,
                discountAt100,
                discountAt500,
                discountAt1000
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
            focus: 'Plain',
            lamination: 'Plain',
            markupType: 'Retail',
            dieCutting: true
        }, labConfigs);

    const triggerValue = product.triggerValue !== undefined ? product.triggerValue : 500;
    const isLargeOrder = quantity >= triggerValue;
    const unitPrice = isLargeOrder ? "Contact Us" : pricingResult.finalPerUnit.toFixed(2);

    // ─── TIER CALCULATION FOR REDESIGNED UI ────────────────────────────────────
    const getDiscount = (val, discountVal) => {
        if (discountVal !== undefined && discountVal !== null && discountVal !== '') {
            return Number(discountVal);
        }
        if (val === undefined || val === null || val === '') return 0;
        const num = Number(val) || 0;
        if (num <= 0) return 0;
        if (num > 100) {
            return Math.max(0, Math.round(((p1 - num) / p1) * 100));
        }
        return num;
    };

    let activeTiers = [];
    if (isSlabs) {
        activeTiers.push({ qty: 1, discount: 0 });
        product.priceSlabs.forEach(slab => {
            let disc = 0;
            if (slab.discount !== undefined && slab.discount !== null && slab.discount !== 0) {
                disc = Number(slab.discount);
            } else if (slab.price !== undefined && slab.price !== null && p1 > 0) {
                disc = Math.max(0, Math.round(((p1 - slab.price) / p1) * 100 * 10) / 10);
            }
            activeTiers.push({
                qty: slab.minQty,
                discount: disc
            });
        });
    } else {
        const d10 = getDiscount(p10, discountAt10);
        const d50 = getDiscount(p50, discountAt50);
        const d100 = getDiscount(p100, discountAt100);
        const d500 = getDiscount(p500, discountAt500);
        const d1000 = getDiscount(p1000, discountAt1000);

        const rawTiers = [
            { qty: 1, discount: 0 },
            { qty: 10, discount: d10 },
            { qty: 50, discount: d50 },
            { qty: 100, discount: d100 },
            { qty: 500, discount: d500 },
            { qty: 1000, discount: d1000 }
        ];

        activeTiers = rawTiers.filter(t => t.qty === 1 || t.discount > 0);
    }
    activeTiers.sort((a, b) => a.qty - b.qty);

    const tiersWithSavings = activeTiers.map((t, idx) => {
        const next = activeTiers[idx + 1];
        const minQty = t.qty;
        const maxQty = next ? next.qty - 1 : null;
        
        let rangeText = "";
        if (maxQty === null) {
            rangeText = `${minQty}+ Units`;
        } else if (minQty === maxQty) {
            rangeText = `${minQty} Unit`;
        } else {
            rangeText = `${minQty}-${maxQty} Units`;
        }

        const unitVal = p1 * (1 - t.discount / 100);

        return {
            qty: minQty,
            minQty,
            maxQty,
            rangeText,
            discountPercent: t.discount,
            unitVal
        };
    });

    const currentQtyVal = parseInt(quantity) || 10;
    let activeTierIndex = -1;
    for (let i = tiersWithSavings.length - 1; i >= 0; i--) {
        if (currentQtyVal >= tiersWithSavings[i].qty) {
            activeTierIndex = i;
            break;
        }
    }

    let progressPercent = 0;
    let unitsNeededForNext = 0;
    let nextTier = null;
    let currentActiveTier = null;

    if (tiersWithSavings.length > 0) {
        if (activeTierIndex === -1) {
            nextTier = tiersWithSavings[0];
            progressPercent = 0;
            unitsNeededForNext = nextTier.qty - currentQtyVal;
        } else {
            currentActiveTier = tiersWithSavings[activeTierIndex];
            if (activeTierIndex < tiersWithSavings.length - 1) {
                nextTier = tiersWithSavings[activeTierIndex + 1];
                const range = nextTier.qty - currentActiveTier.qty;
                const currentOffset = currentQtyVal - currentActiveTier.qty;
                progressPercent = Math.min(100, Math.max(0, (currentOffset / range) * 100));
                unitsNeededForNext = nextTier.qty - currentQtyVal;
            } else {
                progressPercent = 100;
            }
        }
    }

    const isLongName = product.name?.length > 30;
    const titleSizeClass = isLongName 
        ? "text-base sm:text-lg md:text-xl lg:text-3xl" 
        : "text-lg sm:text-xl md:text-2xl lg:text-3xl";

    const renderProductNameAndCategory = () => (
        <div className="space-y-3">
            {/* Category path */}
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50/20 px-3.5 py-1 rounded-full w-fit">
                <span>Premium Series</span>
                <span>•</span>
                <span>{product.category || "Packaging"}</span>
                {product.inStock && (
                    <>
                        <span>•</span>
                        <span className="text-emerald-500 uppercase flex items-center gap-0.5"><CheckCircle2 size={10} /> In Stock</span>
                    </>
                )}
            </div>
            <h1 className={`${titleSizeClass} font-black text-gray-900 tracking-tight uppercase leading-snug break-words`}>
                {product.name}
            </h1>
        </div>
    );

    const renderQuantityAndCart = () => (
        <div className="bg-white border border-gray-200 rounded-[2rem] p-4 sm:p-6 space-y-4 shadow-sm">
            <div className="flex gap-3 items-end">
                <div className="w-20 sm:w-28 shrink-0">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 px-1">Units</p>
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
                            className="w-full py-3.5 px-2.5 sm:px-4 rounded-xl bg-gray-50 border border-gray-200 font-black text-sm text-gray-900 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                            min={10}
                        />
                    </div>
                </div>

                <div className="flex-1">
                    {isLargeOrder ? (
                        <button
                            onClick={() => setIsInquiryModalOpen(true)}
                            className="w-full py-3.5 bg-[#fb641b] text-white rounded-xl font-black uppercase text-xs tracking-wider hover:bg-[#e15610] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-orange-500/10 group"
                        >
                            <Sparkles size={16} className="group-hover:scale-110 transition-transform shrink-0" />
                            <span className="truncate">Request Custom Quote</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => addToCart({ ...product, selectedColor }, quantity)}
                            className="w-full py-3.5 bg-[#ff9f00] text-white rounded-xl font-black uppercase text-xs tracking-wider hover:bg-[#e58f00] transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/10 group"
                        >
                            <ShoppingCart size={16} className="group-hover:scale-110 transition-transform shrink-0" />
                            <span className="truncate">Add to Basket</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Color Selectors */}
            {product.colors && product.colors.length > 0 && (
                <div className="space-y-1.5 pt-2.5 border-t border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Select Color Variant</p>
                    <div className="flex flex-wrap gap-1.5 px-1">
                        {product.colors.map((colorHex) => {
                            const isSelected = selectedColor === colorHex;
                            return (
                                <button
                                    key={colorHex}
                                    type="button"
                                    onClick={() => setSelectedColor(colorHex)}
                                    title={colorHex.toUpperCase()}
                                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-gray-950 scale-110 shadow' : 'border-gray-200 hover:scale-105'}`}
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
        </div>
    );

    const renderTrustBadges = () => (
        <div className="grid grid-cols-2 gap-4 p-4 border border-gray-200 rounded-2xl bg-gray-50/50">
            <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0"><Truck size={16} className="text-emerald-600" /></div>
                <div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-gray-900 leading-tight">Express Shipping</p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tight leading-none">Pan India Delivery</p>
                </div>
            </div>
            <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0"><ShieldCheck size={16} className="text-emerald-600" /></div>
                <div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-gray-900 leading-tight">Secure Payment</p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tight leading-none">100% Secured</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white">
            <main className="pt-20 lg:pt-24 pb-16 w-full px-4 md:px-8 lg:px-12">
                <div className="max-w-[1600px] mx-auto w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start w-full">

                        <div className="lg:col-span-5">
                            <div className="lg:sticky lg:top-28 space-y-6">
                                {/* Mobile Product Name (Top of mobile view, above image) */}
                                <div className="block lg:hidden mb-2">
                                    {renderProductNameAndCategory()}
                                </div>

                                <div className="relative">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="relative aspect-[4/3] max-h-[400px] rounded-[2rem] overflow-hidden bg-gray-50/50 border border-gray-200 shadow-sm"
                                    >
                                        <div className="w-full h-full flex items-center justify-center p-4 md:p-6 text-center">
                                            <img src={displayImage} className="max-w-full max-h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700" />
                                        </div>
                                    </motion.div>

                                    {/* Wishlist button absolute on top right of image */}
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
                                            className={`absolute top-6 right-6 p-3 rounded-full transition-all border shadow-sm ${isWishlisted ? 'bg-red-50 text-red-500 border-red-100' : 'bg-white/85 backdrop-blur text-gray-400 hover:text-red-500 hover:bg-red-50'} ${wishlistBusy ? 'opacity-60' : ''}`}
                                        >
                                            <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                                        </button>
                                    )}
                                </div>

                                {/* Thumbnail Gallery */}
                                <div className="flex gap-2.5 p-2 bg-gray-50/50 border border-gray-100 rounded-2xl w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                    {images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { setActiveImg(i); setViewMode('2D'); }}
                                            className={`relative w-16 h-16 rounded-xl transition-all duration-300 shrink-0 ${activeImg === i && viewMode === '2D'
                                                ? 'ring-2 ring-gray-950 ring-offset-2 ring-offset-white scale-95 shadow-md'
                                                : 'opacity-45 hover:opacity-100 hover:scale-105'
                                                }`}
                                        >
                                            <div className="w-full h-full rounded-xl overflow-hidden bg-white border border-gray-200 p-1">
                                                <img src={img} className="w-full h-full object-contain" />
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Desktop Quantity & Action buttons */}
                                <div className="hidden lg:block">
                                    {renderQuantityAndCart()}
                                </div>

                                {/* Desktop Trust badges */}
                                <div className="hidden lg:block">
                                    {renderTrustBadges()}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Scrollable Product details */}
                        <div className="lg:col-span-7 space-y-8 pl-0 lg:pl-4">
                            {/* Desktop Product Name */}
                            <div className="hidden lg:block">
                                {renderProductNameAndCategory()}
                            </div>

                            {/* Price Card */}
                            <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50/50 border border-gray-200 rounded-[2rem] p-6 sm:p-8 space-y-6 shadow-sm">
                                {/* Price Header Row */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Unit Price</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                                                {isLargeOrder ? "" : "₹"}{unitPrice}
                                            </span>
                                            {!isLargeOrder && <span className="text-xs font-semibold text-gray-400">/ Unit</span>}
                                        </div>
                                    </div>

                                    {/* Inquiry Quote Request Button */}
                                    <div className="flex flex-col gap-2 min-w-[200px]">
                                        <div className="flex items-baseline justify-between gap-2 border-b border-gray-100 pb-2">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Est. Subtotal</span>
                                            <span className="text-xl font-black text-gray-950">
                                                {isLargeOrder ? "Contact For Quote" : `₹${pricingResult.finalTotal.toLocaleString('en-IN')}`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
                                            <span>Min. Order Qty:</span>
                                            <span>{product.minOrderQuantity || 10} Units</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Order & Savings Info Bar */}
                                <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    {currentActiveTier && currentActiveTier.discountPercent > 0 && (
                                        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-full border border-emerald-100 animate-pulse">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                            <span>{currentActiveTier.discountPercent}% Discount Unlocked</span>
                                        </div>
                                    )}
                                </div>

                                {/* Savings Progress Bar (Gamified) */}
                                {hasExplicitTiers && nextTier && (
                                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
                                        <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                                            <span className="text-gray-400">Savings Progress</span>
                                            <span className="text-emerald-600">{Math.round(progressPercent)}% to next tier</span>
                                        </div>
                                        {/* Progress Bar Container */}
                                        <div className="w-full h-2.5 bg-gray-200/75 rounded-full overflow-hidden p-0.5 border border-gray-300/40">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressPercent}%` }}
                                                transition={{ duration: 0.5, ease: "easeOut" }}
                                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                                            />
                                        </div>
                                        {/* Nudge text */}
                                        <p className="text-[10px] font-bold text-gray-500 normal-case tracking-normal">
                                            💡 Add <span className="font-extrabold text-emerald-600">{unitsNeededForNext} more units</span> to save <span className="font-extrabold text-emerald-600">{nextTier.discountPercent}%</span> on your entire order! (Unlocks at {nextTier.qty} units)
                                        </p>
                                    </div>
                                )}

                                {hasExplicitTiers && !nextTier && currentActiveTier && currentActiveTier.discountPercent > 0 && (
                                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-center">
                                        <p className="text-[11px] font-bold text-emerald-800 tracking-wide">
                                            🎉 Awesome! You have unlocked the maximum bulk discount of <span className="font-black">{currentActiveTier.discountPercent}%</span>!
                                        </p>
                                    </div>
                                )}

                                {/* Volume Savings Tiers Grid */}
                                {hasExplicitTiers && (
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                Volume Pricing Tiers
                                            </p>
                                            <span className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest w-fit">
                                                Bulk discount auto-applied
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                            {tiersWithSavings.map((tier, idx) => {
                                                const isActive = idx === activeTierIndex;
                                                return (
                                                    <button
                                                        key={tier.qty}
                                                        type="button"
                                                        onClick={() => {
                                                            setQuantity(tier.qty);
                                                        }}
                                                        className={`text-left p-3.5 rounded-2xl border transition-all duration-300 group relative flex flex-col justify-between h-[82px] ${isActive
                                                            ? "bg-gradient-to-br from-emerald-600 to-teal-700 border-emerald-700 text-white shadow-lg shadow-emerald-600/15 scale-[1.02]"
                                                            : "bg-white border-gray-200 hover:border-emerald-300 hover:shadow-sm hover:scale-[1.01]"
                                                            }`}
                                                    >
                                                        {/* Tier Quantity & Discount Badge */}
                                                        <div className="flex items-center justify-between w-full">
                                                            <span className={`text-[10px] font-black uppercase tracking-wider ${isActive ? "text-emerald-100" : "text-gray-400"}`}>
                                                                {tier.rangeText}
                                                            </span>

                                                            {tier.discountPercent > 0 && (
                                                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ${isActive
                                                                    ? "bg-white text-emerald-700"
                                                                    : "bg-emerald-50 text-emerald-700 border border-emerald-100 group-hover:bg-emerald-100"
                                                                    }`}>
                                                                    {tier.discountPercent}% Off
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Tier Price */}
                                                        <div className="mt-2.5">
                                                            <div className="flex items-baseline gap-0.5">
                                                                <span className={`text-base font-black tracking-tight ${isActive ? "text-white" : "text-gray-900 group-hover:text-emerald-600"}`}>
                                                                    ₹{Number(tier.unitVal).toFixed(2)}
                                                                </span>
                                                                <span className={`text-[9px] font-semibold ${isActive ? "text-emerald-100" : "text-gray-400"}`}>/u</span>
                                                            </div>
                                                        </div>

                                                        {/* Small active indicator dot */}
                                                        {isActive && (
                                                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-white rounded-full shadow-sm animate-ping"></span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Mobile Quantity selector (above highlights / details) */}
                            <div className="block lg:hidden mt-6">
                                {renderQuantityAndCart()}
                            </div>

                            {/* Highlights */}
                            {(() => {
                                const rawDesc = product.short_description || product.description || "";
                                const highlights = rawDesc
                                    .split('\n')
                                    .map(line => line.trim())
                                    .filter(line => line.length > 0 && !line.toLowerCase().startsWith('features:') && !line.toLowerCase().startsWith('minimum order') && !line.toLowerCase().startsWith('custom printing'));

                                if (highlights.length > 0) {
                                    return (
                                        <div className="pt-8 border-t border-gray-100 space-y-4">
                                            <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 flex items-center gap-2">
                                                <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                                                Product Highlights
                                            </h3>
                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm text-gray-600 font-medium">
                                                {highlights.slice(0, 6).map((hl, idx) => {
                                                    let cleanText = hl.trim();
                                                    const prefixes = ['•', '-', '*', 'ΓÇó', '•'];
                                                    for (const p of prefixes) {
                                                        if (cleanText.startsWith(p)) {
                                                            cleanText = cleanText.substring(p.length).trim();
                                                            break;
                                                        }
                                                    }
                                                    return (
                                                        <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                                                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                                            <span>{cleanText}</span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            {/* Specifications (Open Layout) */}
                            <div className="pt-8 border-t border-gray-100 space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 flex items-center gap-2">
                                    <span className="w-1.5 h-4 bg-gray-900 rounded-full"></span>
                                    Specifications
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 pt-2">
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100 text-xs">
                                        <span className="font-bold text-gray-400 uppercase tracking-wider">Brand</span>
                                        <span className="font-black text-gray-900 uppercase">{product.brand || "BoxFox"}</span>
                                    </div>
                                    {product.dimensions && (
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100 text-xs">
                                            <span className="font-bold text-gray-400 uppercase tracking-wider">Dimensions</span>
                                            <span className="font-black text-gray-900 uppercase">
                                                {product.dimensions.length} x {product.dimensions.width} x {product.dimensions.height} {product.dimensions.unit || 'in'}
                                            </span>
                                        </div>
                                    )}
                                    {product.minOrderQuantity && (
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100 text-xs">
                                            <span className="font-bold text-gray-400 uppercase tracking-wider">Min. Order</span>
                                            <span className="font-black text-gray-900 uppercase">{product.minOrderQuantity} Units</span>
                                        </div>
                                    )}
                                    {product.specifications && product.specifications.length > 0 ? (
                                        product.specifications.map((spec, index) => (
                                            <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 text-xs gap-4">
                                                <span className="font-bold text-gray-400 uppercase tracking-wider shrink-0">{spec.key}</span>
                                                <span className="font-black text-gray-900 uppercase text-right max-w-[65%] break-words" title={spec.value}>{spec.value}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100 text-xs">
                                            <span className="font-bold text-gray-400 uppercase tracking-wider">Category</span>
                                            <span className="font-black text-gray-900 uppercase">{product.category || "Packaging"}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Full Description */}
                            <div className="pt-8 border-t border-gray-100 space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 flex items-center gap-2">
                                    <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                                    Product Description
                                </h3>
                                <div className="text-xs md:text-sm text-gray-600 leading-relaxed font-medium whitespace-pre-line prose max-w-none">
                                    {product.description || "No detailed description available for this product."}
                                </div>
                            </div>

                            {/* Mobile Trust Badges (Placed at the very bottom of the page) */}
                            <div className="block lg:hidden pt-8 border-t border-gray-100 mt-6">
                                {renderTrustBadges()}
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
                            className="w-full max-w-xl bg-white border border-gray-200 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 lg:p-12 shadow-2xl relative max-h-[90vh] overflow-y-auto"
                        >
                            <button
                                onClick={() => setIsInquiryModalOpen(false)}
                                className="absolute top-6 right-6 sm:top-8 sm:right-8 p-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl transition-all"
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
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-emerald-500 text-xs font-bold text-gray-900 uppercase"
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
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-emerald-500 text-xs font-bold text-gray-900 normal-case"
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
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-emerald-500 text-xs font-bold text-gray-900"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block mb-2 ml-1">Specs & Requirements</label>
                                        <textarea
                                            value={inquiryForm.requirements}
                                            onChange={e => setInquiryForm({ ...inquiryForm, requirements: e.target.value })}
                                            rows={3}
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-emerald-500 text-xs font-bold text-gray-900 uppercase font-sans tracking-normal resize-none"
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
