"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingCart,
    ArrowLeft,
    Box,
    Sparkles,
    Ruler,
    RefreshCw,
    Download,
    Minus,
    Plus,
    Move,
    Search,
    ChevronDown,
    CheckCircle2,
    RotateCw,
    Maximize2,
    Zap,
    Upload,
    Type,
    Image as ImageIcon,
    Layout,
    Trash2,
    Palette,
    Layers,
    Scissors,
    Shield,
    Check
} from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import { useCart } from '@/app/context/CartContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { calculateBoxPrice } from '@/lib/boxfoxPricing';
import { BOX_SPECIFICATIONS, findClosestSpec } from '@/lib/box-specifications';

export default function CustomizePage() {
    const params = useParams();
    const router = useRouter();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(10);
    const [viewMode, setViewMode] = useState('2D');
    const [labConfigs, setLabConfigs] = useState(null);

    // Customization States
    const [dimensions, setDimensions] = useState({ l: 12, w: 8, h: 4 });
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const [customText, setCustomText] = useState("");

    // Neural Multi-Asset Pool (Max 3)
    const [assetPool, setAssetPool] = useState([]);
    const [activeAssetIndex, setActiveAssetIndex] = useState(0);
    const [boxTextures, setBoxTextures] = useState({
        front: null, back: null, top: null, bottom: null, left: null, right: null
    });
    const [boxColors, setBoxColors] = useState({
        front: '#059669', back: '#059669', top: '#059669', bottom: '#059669', left: '#059669', right: '#059669'
    });
    const [activeColor, setActiveColor] = useState('#059669');
    const [customMode, setCustomMode] = useState('texture'); // 'texture' or 'color'

    // Rotation State
    const [rotate, setRotate] = useState({ x: -20, y: 45 });
    const isDragging = useRef(false);

    const [isRestored, setIsRestored] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/products/${params.id}`)
            .then(res => res.json())
            .then(data => {
                setProduct(data);

                const savedState = localStorage.getItem(`boxfox_custom_${params.id}`);
                if (savedState) {
                    try {
                        const parsed = JSON.parse(savedState);
                        setQuantity(parsed.quantity || data.minOrderQuantity || 10);
                        if (parsed.dimensions) setDimensions(parsed.dimensions);
                        if (parsed.aiPrompt) setAiPrompt(parsed.aiPrompt);
                        if (parsed.customText) setCustomText(parsed.customText);
                        if (parsed.assetPool) setAssetPool(parsed.assetPool);
                        if (parsed.activeAssetIndex !== undefined) setActiveAssetIndex(parsed.activeAssetIndex);
                        if (parsed.boxTextures) setBoxTextures(parsed.boxTextures);
                        if (parsed.boxColors) setBoxColors(parsed.boxColors);
                        if (parsed.activeColor) setActiveColor(parsed.activeColor);
                        if (parsed.customMode) setCustomMode(parsed.customMode);
                        if (parsed.rotate) setRotate(parsed.rotate);
                    } catch (e) {
                        console.error("Failed to restore state", e);
                        setQuantity(data.minOrderQuantity || 10);
                    }
                } else {
                    setQuantity(data.minOrderQuantity || 10);
                }

                setIsRestored(true);
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
        if (isRestored && product) {
            const stateToSave = {
                quantity, dimensions, aiPrompt, customText, assetPool,
                activeAssetIndex, boxTextures, boxColors, activeColor,
                customMode, rotate
            };
            localStorage.setItem(`boxfox_custom_${params.id}`, JSON.stringify(stateToSave));
        }
    }, [quantity, dimensions, aiPrompt, customText, assetPool, activeAssetIndex, boxTextures, boxColors, activeColor, customMode, rotate, isRestored, product, params.id]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newAsset = reader.result;
                setAssetPool(prev => {
                    const updated = [...prev, newAsset].slice(-3); // Keep last 3
                    setActiveAssetIndex(updated.length - 1);
                    return updated;
                });
                // Default apply to Front if it's the first asset
                if (assetPool.length === 0) {
                    setBoxTextures(prev => ({ ...prev, front: newAsset }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleFaceMapping = (face) => {
        if (customMode === 'texture') {
            const currentAsset = assetPool[activeAssetIndex];
            if (!currentAsset) return;
            setBoxTextures(prev => ({
                ...prev,
                [face]: prev[face] === currentAsset ? null : currentAsset
            }));
        } else {
            setBoxColors(prev => ({
                ...prev,
                [face]: activeColor
            }));
        }
    };

    const smartApplyAI = (imageSrc) => {
        setAssetPool(prev => {
            const updated = [...prev, imageSrc].slice(-3);
            setActiveAssetIndex(updated.length - 1);
            return updated;
        });
        // Auto-wrap all sides for AI results (Neural Smart Wrap)
        setBoxTextures({
            front: imageSrc, back: imageSrc, top: imageSrc,
            bottom: imageSrc, left: imageSrc, right: imageSrc
        });
    };

    // Advanced Scaling for 3D View - EXPANDED SCALE
    const maxVal = Math.max(dimensions.l, dimensions.w, dimensions.h);
    const factor = 320 / maxVal; // Increased from 240 to 320 for "LITTLE BIG" effect
    const L = dimensions.l * factor;
    const W = dimensions.w * factor;
    const H = dimensions.h * factor;

    const currentSA = 2 * (dimensions.l * dimensions.w + dimensions.w * dimensions.h + dimensions.h * dimensions.l);
    const unit = 'in';

    const exactSpec = BOX_SPECIFICATIONS.find(s =>
        s.l === dimensions.l &&
        s.w === dimensions.w &&
        s.h === dimensions.h &&
        s.unit === unit
    );
    const selectedSpec = exactSpec || findClosestSpec(dimensions.l, dimensions.w, dimensions.h, product?.category || 'All', unit) || {
        ups: 1,
        machine: 2029,
        sheetW: 20,
        sheetH: 29,
        unit: 'in'
    };

    const pricingResult = calculateBoxPrice({
        spec: selectedSpec,
        qty: Math.max(10, parseInt(quantity) || 10),
        gsm: 280,
        material: 'SBS',
        brand: 'ITC',
        colours: 'Four Colour',
        lamination: 'Plain',
        addon: 'Plain',
        dieCutting: true,
        markupType: 'Retail',
        sides: 'One'
    }, labConfigs);

    const calculatedUnitPrice = pricingResult.finalPerUnit.toFixed(2);
    const calculatedTotalPrice = pricingResult.grandTotal.toLocaleString('en-IN');

    if (loading || !product) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-emerald-500 font-black tracking-tighter text-4xl animate-pulse">SYNCHRONIZING_NEURAL_MAP...</div>;

    const faceStyle = (face) => ({
        backgroundImage: boxTextures[face] ? `url(${boxTextures[face]})` : 'none',
        backgroundColor: boxColors[face] || 'rgba(16, 185, 129, 0.05)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        transformStyle: 'preserve-3d'
    });

    return (
        <div className="min-h-screen bg-[#F0F4F8] text-[#020617] selection:bg-emerald-500 selection:text-white font-['Inter']">
            <Navbar />
            <Script src="https://js.puter.com/v2/" strategy="afterInteractive" />

            <main className="pt-24 pb-8 px-6 lg:px-12 max-w-[1900px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* 3D SPATIAL CANVAS (LEFT) */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-7 space-y-6"
                >
                    {/* Floating Pill Header */}
                    <div className="flex items-center justify-between px-8 py-4 bg-white border border-slate-200 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                <Box className="text-emerald-500" size={20} />
                            </div>
                            <div>
                                <h1 className="text-sm font-black uppercase tracking-[0.2em] text-[#020617] font-['Space_Grotesk']">{product?.name || 'CLASSIC MAILER BG'}</h1>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Product_Type: Standard Lab Edition</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="px-6 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2">
                                <Check size={14} /> SAVE
                            </button>
                            <button className="px-6 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2">
                                <Layout size={14} /> SHARE
                            </button>
                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                        </div>
                    </div>

                    <div
                        className="relative h-[780px] bg-white rounded-[4rem] border border-slate-100 shadow-[0_40px_100px_rgba(0,0,0,0.05)] overflow-hidden group"
                        style={{ background: 'radial-gradient(circle at center, #ffffff 0%, #f8fafc 100%)' }}
                        onMouseDown={() => { isDragging.current = true; }}
                        onMouseMove={(e) => {
                            if (isDragging.current) setRotate(r => ({ x: r.x - e.movementY * 0.4, y: r.y + e.movementX * 0.4 }));
                        }}
                        onMouseUp={() => { isDragging.current = false; }}
                        onMouseLeave={() => { isDragging.current = false; }}
                    >
                        {/* Blueprint Grid Overlay */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                        {/* 3D Blueprint Engine */}
                        <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '2500px' }}>
                            <motion.div
                                animate={{ rotateX: rotate.x, rotateY: rotate.y }}
                                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                                style={{ transformStyle: 'preserve-3d', width: L, height: H, position: 'relative' }}
                            >
                                {/* FRONT FACE */}
                                <div className={`absolute border border-[#064e3b]/20 flex items-center justify-center overflow-hidden`}
                                    style={{ ...faceStyle('front'), width: L, height: H, transform: `translateZ(${W / 2}px)` }}>
                                    <div className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] font-['Space_Grotesk']">FRONT_PANEL</div>
                                    {customText && <div className="absolute font-black uppercase tracking-widest text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] text-center px-4" style={{ fontSize: `${H / 5}px`, transform: 'translateZ(1px)' }}>{customText}</div>}
                                </div>

                                {/* BACK FACE */}
                                <div className={`absolute border border-[#064e3b]/20 flex items-center justify-center overflow-hidden`}
                                    style={{ ...faceStyle('back'), width: L, height: H, transform: `rotateY(180deg) translateZ(${W / 2}px)` }}>
                                    <div className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] font-['Space_Grotesk']">BACK_PANEL</div>
                                </div>

                                {/* RIGHT FACE */}
                                <div className={`absolute border border-[#064e3b]/20 flex items-center justify-center overflow-hidden`}
                                    style={{ ...faceStyle('right'), width: W, height: H, transform: `rotateY(90deg) translateZ(${L / 2}px)`, left: (L - W) / 2 }}>
                                    <div className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] font-['Space_Grotesk'] rotate-[-90deg]">RIGHT</div>
                                </div>

                                {/* LEFT FACE */}
                                <div className={`absolute border border-[#064e3b]/20 flex items-center justify-center overflow-hidden`}
                                    style={{ ...faceStyle('left'), width: W, height: H, transform: `rotateY(-90deg) translateZ(${L / 2}px)`, left: (L - W) / 2 }}>
                                    <div className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] font-['Space_Grotesk'] rotate-[90deg]">LEFT</div>
                                </div>

                                {/* TOP FACE */}
                                <div className={`absolute border border-[#064e3b]/20 flex items-center justify-center overflow-hidden`}
                                    style={{ ...faceStyle('top'), width: L, height: W, transform: `rotateX(90deg) translateZ(${H / 2}px)`, top: (H - W) / 2 }}>
                                    <div className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] font-['Space_Grotesk']">TOP_PANEL</div>
                                    {customText && <div className="absolute font-black uppercase tracking-[0.3em] text-white italic drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] text-center px-4" style={{ fontSize: `${L / 10}px`, transform: 'translateZ(1px)' }}>{customText}</div>}
                                </div>

                                {/* BOTTOM FACE */}
                                <div className={`absolute border border-[#064e3b]/20 flex items-center justify-center overflow-hidden`}
                                    style={{ ...faceStyle('bottom'), width: L, height: W, transform: `rotateX(-90deg) translateZ(${H / 2}px)`, top: (H - W) / 2 }}>
                                    <div className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] font-['Space_Grotesk']">BOTTOM</div>
                                </div>
                            </motion.div>
                        </div>

                        {/* HUD Elements */}
                        <div className="absolute top-10 left-10 pointer-events-none space-y-4">
                            <div className="px-5 py-2.5 bg-white border border-slate-200 rounded-full flex items-center gap-3 shadow-xl backdrop-blur-md">
                                <Maximize2 size={12} className="text-emerald-500" />
                                <span className="text-[9px] font-black tracking-widest text-[#020617] uppercase font-['Space_Grotesk']">SCALE_CONTEXT_1:1</span>
                            </div>
                        </div>

                        <div className="absolute bottom-12 left-10 right-10 flex items-end justify-between pointer-events-none">
                            <div className="space-y-6">
                                <div className="flex gap-12">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest font-['Space_Grotesk']">L_DIM</p>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-4xl font-black italic tracking-tighter text-[#020617] font-['Space_Grotesk']">{dimensions.l.toFixed(1)}</p>
                                            <span className="text-xs font-bold text-slate-400">in</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest font-['Space_Grotesk']">W_DIM</p>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-4xl font-black italic tracking-tighter text-[#020617] font-['Space_Grotesk']">{dimensions.w.toFixed(1)}</p>
                                            <span className="text-xs font-bold text-slate-400">in</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest font-['Space_Grotesk']">H_DIM</p>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-4xl font-black italic tracking-tighter text-[#020617] font-['Space_Grotesk']">{dimensions.h.toFixed(1)}</p>
                                            <span className="text-xs font-bold text-slate-400">in</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] font-['Space_Grotesk']">REAL-TIME RENDERING ACTIVE</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <div className="w-24 h-24 rounded-full bg-white border border-slate-100 flex flex-col items-center justify-center gap-2 shadow-2xl backdrop-blur-md">
                                    <RefreshCw size={14} className="text-[#020617] opacity-60 animate-spin-slow" />
                                    <span className="text-[7px] font-black text-[#020617]/40 uppercase tracking-widest text-center leading-tight font-['Space_Grotesk']">DRAG_TO_INSPECT</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* CONTROL PANEL (RIGHT) */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-5 space-y-6 h-fit lg:sticky lg:top-24 font-['Space_Grotesk']"
                >
                    <div className="bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] space-y-10">
                        {/* Section 1: GEOMETRY_CORE */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                        <Scissors size={18} className="text-emerald-500" />
                                    </div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] font-['Space_Grotesk']">GEOMETRY_CORE</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="px-3 py-1 bg-[#020617] text-white rounded-md text-[7px] font-black uppercase tracking-widest">IMPERIAL_ACTIVE</div>
                                    <div className="px-3 py-1 bg-emerald-500 text-white rounded-md text-[7px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle2 size={10} /> IN
                                    </div>
                                    <div className="px-3 py-1 bg-slate-100 text-slate-400 rounded-md text-[7px] font-black uppercase tracking-widest">MM</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                {[['l', 'LENGTH'], ['w', 'WIDTH'], ['h', 'HEIGHT']].map(([key, label]) => (
                                    <div key={key} className="space-y-6 text-center">
                                        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 shadow-inner group hover:border-emerald-200 transition-all">
                                            <input
                                                type="number"
                                                value={dimensions[key]}
                                                onChange={(e) => setDimensions({ ...dimensions, [key]: parseFloat(e.target.value) || 1 })}
                                                className="w-full bg-transparent text-4xl font-black text-[#020617] outline-none text-center font-['Space_Grotesk']"
                                            />
                                        </div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 2: ORDER_QUANTITY */}
                        <div className="space-y-8 p-8 bg-emerald-50/30 border border-emerald-50 rounded-[2.5rem]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                                        <ShoppingCart size={14} className="text-white" />
                                    </div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800">ORDER_QUANTITY</h3>
                                </div>
                                <div className="flex items-center gap-3 bg-white border border-emerald-100 px-4 py-2 rounded-full shadow-sm">
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(10, parseInt(e.target.value) || 10))}
                                        className="w-12 bg-transparent text-sm font-black text-[#020617] outline-none text-center"
                                    />
                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">UNITS</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                <button onClick={() => setQuantity(Math.max(10, quantity - 10))} className="w-10 h-10 rounded-full border border-emerald-200 bg-white flex items-center justify-center text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                                    <Minus size={14} />
                                </button>
                                <div className="flex-1 relative flex items-center h-10">
                                    <input 
                                        type="range"
                                        min="10"
                                        max="5000"
                                        step="10"
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-emerald-100 rounded-full appearance-none cursor-pointer accent-emerald-500"
                                    />
                                </div>
                                <button onClick={() => setQuantity(quantity + 10)} className="w-10 h-10 rounded-full border border-emerald-200 bg-white flex items-center justify-center text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Stats Readout */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">VOL_CUBIC_IN</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-black text-[#020617]">{(dimensions.l * dimensions.w * dimensions.h).toFixed(1)}</span>
                                    <span className="text-[10px] font-bold text-slate-300 italic">IN³</span>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">SURF_AREA</p>
                                <div className="flex items-baseline gap-1 border-l border-slate-200 pl-4">
                                    <span className="text-xl font-black text-[#020617]">{currentSA.toFixed(1)}</span>
                                    <span className="text-[10px] font-bold text-slate-300 italic">IN²</span>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Tabs */}
                        <div className="space-y-10">
                            <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                                <button
                                    onClick={() => setCustomMode('texture')}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${customMode === 'texture' ? 'bg-[#020617] text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    NEURAL_MAPS
                                </button>
                                <button
                                    onClick={() => setCustomMode('color')}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${customMode === 'color' ? 'bg-white text-[#020617] border border-slate-200 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    SOLID_LAB
                                </button>
                            </div>

                            {customMode === 'texture' ? (
                                <div className="space-y-10">
                                    {/* AI_TEXTURE_FORGE */}
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Sparkles size={16} className="text-emerald-500" />
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] font-['Space_Grotesk'] text-[#020617]">AI_TEXTURE_FORGE</h3>
                                            </div>
                                            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[7px] font-black border border-emerald-100">NEURAL_V2.5</div>
                                        </div>

                                        <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-1 overflow-hidden">
                                            <div className="flex bg-white rounded-[1.8rem] border border-slate-100 shadow-sm p-0.5">
                                                {['STYLE', 'INDUSTRY', 'HISTORY'].map(tab => (
                                                    <button key={tab} className={`flex-1 py-3 rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all ${tab === 'STYLE' ? 'bg-[#020617] text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                                                        {tab}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="p-6 flex flex-wrap gap-2.5">
                                                {[
                                                    'Luxury Premium', 'Eco & Sustainable', 'Bold & Playful', 'Minimal & Clean',
                                                    'Festive & Celebratory', 'Professional Corporate', 'Rustic Artisan', 'Modern High-End',
                                                    'Vintage Classic', 'Ultra Sleek'
                                                ].map(style => (
                                                    <button 
                                                        key={style}
                                                        onClick={() => setAiPrompt(prev => prev ? `${prev}, ${style}` : style)}
                                                        className="px-5 py-2.5 bg-white border border-slate-200 rounded-full text-[9px] font-bold text-slate-500 hover:border-emerald-400 hover:text-emerald-600 transition-all shadow-sm"
                                                    >
                                                        {style}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between px-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                                        <Search size={10} className="text-white" />
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">YOUR IDEA</span>
                                                </div>
                                                <span className="text-[7px] font-black px-2 py-0.5 bg-slate-100 text-slate-400 rounded uppercase tracking-widest">OPTIONAL</span>
                                            </div>
                                            <textarea
                                                placeholder="Describe your box design... (e.g. 'minimalist white mailer with gold foil logo and clean typography')"
                                                value={aiPrompt}
                                                onChange={(e) => setAiPrompt(e.target.value)}
                                                className="w-full h-32 bg-slate-50 border border-slate-100 rounded-[2rem] p-8 text-xs font-medium text-slate-600 italic placeholder:text-slate-300 focus:border-emerald-500 outline-none resize-none transition-all"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between px-4 py-6 border-t border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <Type size={14} className="text-slate-400" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">BRAND TEXT ON BOX</span>
                                            </div>
                                            <button className="w-12 h-6 bg-slate-200 rounded-full relative transition-all hover:bg-slate-300">
                                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <button
                                                onClick={async () => {
                                                    if (!aiPrompt || !window.puter) return;
                                                    setIsGenerating(true);
                                                    try {
                                                        const fullPrompt = `High-resolution ultra-seamless flat material pattern graphic for packaging. Theme: ${aiPrompt}. Luxury texture, perfectly tileable, 8k digital art.`;
                                                        const img = await window.puter.ai.txt2img(fullPrompt);
                                                        smartApplyAI(img.src);
                                                    } catch (err) {
                                                        console.error("Neural Render Error:", err);
                                                    } finally { setIsGenerating(false); }
                                                }}
                                                disabled={isGenerating || !aiPrompt}
                                                className="w-full h-20 bg-slate-300 text-white rounded-[2rem] font-black uppercase text-[12px] tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-[#020617] hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50"
                                            >
                                                {isGenerating ? <RefreshCw className="animate-spin" /> : <><Sparkles size={18} /> IGNITE_FORGE</>}
                                            </button>
                                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest text-center">3 GENERATIONS LEFT TODAY</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="flex flex-wrap gap-3">
                                        {['#000000', '#FFFFFF', '#059669', '#1D4ED8', '#B91C1C', '#D97706', '#7C3AED', '#DB2777', '#4B5563', '#111827'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setActiveColor(color)}
                                                style={{ backgroundColor: color }}
                                                className={`w-12 h-12 rounded-2xl border-2 transition-all ${activeColor === color ? 'border-emerald-500 scale-90 ring-4 ring-emerald-50/50' : 'border-white hover:border-slate-200 shadow-sm'}`}
                                            />
                                        ))}
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center relative group overflow-hidden">
                                            <input
                                                type="color"
                                                value={activeColor}
                                                onChange={(e) => setActiveColor(e.target.value)}
                                                className="absolute inset-0 opacity-0 cursor-pointer scale-150"
                                            />
                                            <Plus size={16} className="text-slate-400" />
                                        </div>
                                    </div>
                                    
                                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">APPLY TO SIDES</p>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['front', 'back', 'left', 'right', 'top', 'bottom'].map(face => (
                                                <button
                                                    key={face}
                                                    onClick={() => toggleFaceMapping(face)}
                                                    className={`px-4 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                                                        boxColors[face] === activeColor
                                                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg'
                                                        : 'bg-white text-slate-400 border-slate-200 hover:border-emerald-400'
                                                    }`}
                                                >
                                                    {face}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Final Summary Card */}
                    <div className="bg-emerald-50 rounded-[3.5rem] p-4 border border-emerald-100 shadow-[0_30px_80px_rgba(0,0,0,0.05)] overflow-hidden">
                        <div className="bg-white rounded-[3rem] p-10 space-y-8">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                    <Box className="text-emerald-500" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-[#020617] tracking-tight">Custom Designed Box</h2>
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">{dimensions.l}IN × {dimensions.w}IN × {dimensions.h}IN</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-1 border-y border-slate-100 py-6">
                                <div className="text-center space-y-2">
                                    <p className="text-[7px] font-black text-slate-300 uppercase tracking-[0.2em]">QTY</p>
                                    <p className="text-2xl font-black text-[#020617]">{quantity}</p>
                                </div>
                                <div className="text-center space-y-2 border-x border-slate-100 px-4">
                                    <p className="text-[7px] font-black text-slate-300 uppercase tracking-[0.2em]">PRICE</p>
                                    <p className="text-2xl font-black text-[#020617]">₹{calculatedUnitPrice}</p>
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-[7px] font-black text-slate-300 uppercase tracking-[0.2em]">TOTAL</p>
                                    <p className="text-2xl font-black text-[#020617]">₹{calculatedTotalPrice}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-10 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <p className="text-[8px] font-black text-emerald-800 uppercase tracking-[0.4em]">EST. TOTAL COST</p>
                                <h2 className="text-5xl font-black tracking-tighter text-emerald-900 font-['Space_Grotesk']">₹{calculatedTotalPrice}</h2>
                            </div>
                            <button onClick={() => addToCart({
                                ...product,
                                id: `${product.id}-${Date.now()}`,
                                name: `${product.name} ${dimensions.l}x${dimensions.w}x${dimensions.h}`,
                                img: displayImage,
                                price: pricingResult.finalPerUnit,
                                customDesign: {
                                    dimensions,
                                    unit,
                                    selectedGSM: '280',
                                    selectedMaterial: 'SBS',
                                    selectedBrand: 'ITC',
                                    selectedFinish: 'Plain',
                                    selectedPrinting: 'Four Colour',
                                    selectedMarkup: 'Retail',
                                    dieCutting: true,
                                    specData: selectedSpec
                                }
                            }, quantity)} className="h-24 px-10 bg-[#020617] text-white rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.2em] flex items-center gap-5 hover:scale-[1.02] transition-all shadow-2xl active:scale-95 group">
                                <ShoppingCart size={24} /> 
                                <span className="border-l border-white/20 pl-5">ADD_TO_BASKET</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </main>

            <style jsx global>{`
                .animate-spin-slow { animation: spin 10s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
            `}</style>
        </div >
    );
}
