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
    const hasExplicitTiers = product.priceAt1 || product.priceAt10 || product.priceAt50 || product.priceAt100 || product.priceAt500 || product.priceAt1000;
    const tierUnitPrice = hasExplicitTiers
        ? calculateDynamicPrice(
              parseInt(quantity) || 10,
              product.priceAt1,
              product.priceAt10,
              product.priceAt50,
              product.priceAt100,
              product.priceAt500,
              product.priceAt1000
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
    const totalPrice = isLargeOrder ? "Contact Us" : pricingResult.finalTotal.toLocaleString('en-IN');

    return (
        <div className="min-h-screen bg-white">

            <main className="pt-20 lg:pt-24 pb-8 px-4 md:px-8">
                <div className="max-w-[1400px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left: Product Media */}
                        <div className="lg:col-span-5 lg:col-start-2 space-y-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative aspect-square rounded-[2rem] overflow-hidden bg-gray-50 border border-gray-950/10 shadow-xl"
                            >
                                <div className="w-full h-full flex items-center justify-center p-8 md:p-16 text-center">
                                    <img src={displayImage} className="max-w-full max-h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700" />
                                </div>
                            </motion.div>

                            <div className="flex gap-4 p-2 bg-gray-50/50 rounded-3xl w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { setActiveImg(i); setViewMode('2D'); }}
                                        className={`relative w-24 h-24 rounded-2xl transition-all duration-300 shrink-0 ${activeImg === i && viewMode === '2D'
                                            ? 'ring-2 ring-gray-950 ring-offset-4 ring-offset-white scale-95 shadow-lg'
                                            : 'opacity-40 hover:opacity-100 hover:scale-105'
                                            }`}
                                    >
                                        <div className="w-full h-full rounded-2xl overflow-hidden bg-white border border-gray-100 p-1">
                                            <img src={img} className="w-full h-full object-contain" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right: Product Details */}
                        <div className="lg:col-span-5 space-y-5">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black tracking-widest uppercase">
                                        Premium Series
                                    </span>
                                    {product.inStock && <span className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-1"><CheckCircle2 size={10} /> In Stock</span>}
                                </div>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h1 className="text-4xl md:text-5xl font-black text-gray-950 tracking-tighter uppercase">{product.name}</h1>
                                        {product.brand && (
                                            <p className="mt-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                Sold by <span className="text-emerald-600">{product.brand}</span>
                                            </p>
                                        )}
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
                                            className={`p-4 rounded-full transition-all border border-gray-100 shadow-sm shrink-0 ${isWishlisted ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50'} ${wishlistBusy ? 'opacity-60' : ''}`}
                                        >
                                            <Heart size={24} fill={isWishlisted ? 'currentColor' : 'none'} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed font-medium">{product.description || "The ultimate professional packaging solution for your premium brand. Structural integrity meets aesthetic perfection."}</p>
                            </div>

                            <div className="p-6 rounded-[2rem] bg-gray-50 border border-gray-950/10 space-y-6">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{quantity >= 50 ? 'Est. Unit Price' : 'Pricing Starts At'}</p>
                                        <p className="text-4xl font-black text-gray-950 tracking-tighter">{isLargeOrder ? "" : "₹"}{unitPrice}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dimensions</p>
                                        <p className="text-xs font-black text-gray-950 uppercase">
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
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">MOQ</p>
                                        <p className="text-xl font-black text-gray-950">{Math.max(10, product.minOrderQuantity || 10)} Units</p>
                                    </div>
                                </div>

                                    <div className="space-y-4">
                                        {hasExplicitTiers && (
                                            <div className="bg-white/50 backdrop-blur-sm border border-gray-100 rounded-2xl p-4 mb-2">
                                                <div className="flex items-center justify-between mb-3">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Volume Savings</p>
                                                    <span className="text-[8px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">Tiered discounts active</span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {[
                                                        { qty: 1, val: product.priceAt1 },
                                                        { qty: 10, val: product.priceAt10 },
                                                        { qty: 50, val: product.priceAt50 },
                                                        { qty: 100, val: product.priceAt100 },
                                                        { qty: 500, val: product.priceAt500 },
                                                        { qty: 1000, val: product.priceAt1000 }
                                                    ].filter(t => t.val > 0).map((tier, index, arr) => {
                                                        const p1 = product.priceAt1 || 0;
                                                        const unitVal = (p1 > 0 && tier.val > p1 * 1.5) ? tier.val / tier.qty : tier.val;
                                                        return (
                                                        <div key={tier.qty} className={`text-center p-2 rounded-xl border ${
                                                            index === arr.length - 1 
                                                                ? "bg-emerald-650 border-emerald-650 text-white shadow-lg shadow-emerald-500/20" 
                                                                : index === arr.length - 2 
                                                                    ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                                                                    : "bg-gray-50 border-gray-100"
                                                        }`}>
                                                            <p className={`text-[8px] font-black uppercase tracking-tighter ${index === arr.length - 1 ? "text-emerald-100" : index === arr.length - 2 ? "text-emerald-600" : "text-gray-400"}`}>{tier.qty} {tier.qty === 1 ? "Unit" : "Units"}</p>
                                                            <p className={`text-sm font-black tracking-tighter ${index === arr.length - 1 ? "text-white" : index === arr.length - 2 ? "text-emerald-600" : "text-gray-950"}`}>₹{Number(unitVal).toFixed(2)}/u</p>
                                                        </div>
                                                    )})}
                                                </div>
                                            </div>
                                        )}


                                        <div className="space-y-4">
                                            <div className="relative">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Specify Units</p>
                                                <div className="relative group">
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
                                                        className="w-full py-4 px-6 rounded-2xl bg-white border-2 border-gray-100 font-black text-sm text-gray-950 focus:border-emerald-500 focus:bg-emerald-50/10 outline-none transition-all pr-20"
                                                        min={10}
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-50 rounded-lg text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                        Min {Math.max(10, product.minOrderQuantity || 10)}
                                                    </div>
                                                </div>
                                            </div>

                                            {isLargeOrder ? (
                                                <button
                                                    onClick={() => setIsInquiryModalOpen(true)}
                                                    className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-emerald-650 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 group"
                                                >
                                                    <Sparkles size={18} className="group-hover:scale-110 transition-transform" /> Request Custom Quote
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => addToCart(product, quantity)}
                                                    className="w-full py-5 bg-gray-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-gray-200 group"
                                                >
                                                    <ShoppingCart size={18} className="group-hover:scale-110 transition-transform" /> Add to Basket
                                                </button>
                                            )}

                                        </div>
                                    </div>
                            </div>


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center"><Truck size={18} className="text-emerald-500" /></div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-950">Express Shipping</p>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Pan India Delivery</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center"><ShieldCheck size={18} className="text-emerald-500" /></div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-950">Secure Payment</p>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">100% Secured</p>
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
