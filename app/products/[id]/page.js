"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    BadgeCheck
} from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import { useCart } from '@/app/context/CartContext';
import { useToast } from '@/app/context/ToastContext';
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

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImg, setActiveImg] = useState(0);
    const [quantity, setQuantity] = useState(10);
    const [viewMode, setViewMode] = useState('2D');
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [wishlistBusy, setWishlistBusy] = useState(false);
    const [labConfigs, setLabConfigs] = useState(null);

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

    if (loading || !product) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="pt-32 px-6 flex justify-center italic text-gray-400">Loading Product...</div>
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

    // If admin has supplied explicit tier prices (1,50,100), use the dynamic power-decay curve
    const tierUnitPrice = (product.priceAt1 && product.priceAt100) 
        ? calculateDynamicPrice(parseInt(quantity) || 10, product.priceAt1, product.priceAt50, product.priceAt100)
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

    const unitPrice = pricingResult.finalPerUnit.toFixed(2);
    const totalPrice = pricingResult.finalTotal.toLocaleString('en-IN');

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
                                        <p className="text-4xl font-black text-gray-950 tracking-tighter">₹{unitPrice}</p>
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
                                        {(product.priceAt1 && product.priceAt100) && (
                                            <div className="bg-white/50 backdrop-blur-sm border border-gray-100 rounded-2xl p-4 mb-2">
                                                <div className="flex items-center justify-between mb-3">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Volume Savings</p>
                                                    <span className="text-[8px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">Better as you buy more</span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="text-center p-2 rounded-xl bg-gray-50 border border-gray-100">
                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">1 Unit</p>
                                                        <p className="text-sm font-black text-gray-950 tracking-tighter">₹{product.priceAt1}</p>
                                                    </div>
                                                    <div className="text-center p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                                                        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">50 Units</p>
                                                        <p className="text-sm font-black text-emerald-600 tracking-tighter">
                                                            ₹{product.priceAt50 || Math.round(calculateDynamicPrice(50, product.priceAt1, product.priceAt50, product.priceAt100))}
                                                        </p>
                                                    </div>
                                                    <div className="text-center p-2 rounded-xl bg-emerald-600 border border-emerald-600 shadow-lg shadow-emerald-500/20">
                                                        <p className="text-[8px] font-black text-emerald-50 uppercase tracking-tighter">100 Units</p>
                                                        <p className="text-sm font-black text-white tracking-tighter">₹{product.priceAt100}</p>
                                                    </div>
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

                                            <button
                                                onClick={() => addToCart(product, quantity)}
                                                className="w-full py-5 bg-gray-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-gray-200 group"
                                            >
                                                <ShoppingCart size={18} className="group-hover:scale-110 transition-transform" /> Add to Basket
                                            </button>

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

        </div>
    );
}
