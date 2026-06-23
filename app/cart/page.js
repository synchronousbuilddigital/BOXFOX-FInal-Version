"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trash2,
    Plus,
    Minus,
    ArrowRight,
    ShoppingBag,
    ChevronLeft,
    Trash,
    RotateCcw,
    ShieldCheck,
    Truck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const [recommendations, setRecommendations] = React.useState([]);

    React.useEffect(() => {
        fetch('/api/products?limit=4')
            .then(res => res.json())
            .then(data => setRecommendations(data.products || []))
            .catch(() => { });
    }, []);

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <main className="pt-40 pb-24 px-6 flex flex-col items-center justify-center text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                    >
                        <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                            <ShoppingBag size={48} className="text-gray-200" />
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-4xl sm:text-5xl font-black text-gray-950 tracking-tighter uppercase">Your Cart is Empty.</h1>
                            <p className="text-base sm:text-xl text-gray-400 font-medium max-w-md mx-auto">Start adding structural packaging solutions to your collection.</p>
                        </div>
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-3 px-10 py-5 bg-gray-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
                        >
                            Return to Shop <ArrowRight size={18} />
                        </Link>
                    </motion.div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">

            <main className="pt-20 lg:pt-24 pb-24 px-6 lg:px-12 max-w-[1600px] mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <Link href="/shop" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-950 transition-colors mb-4">
                            <ChevronLeft size={14} /> Back to Catalog
                        </Link>
                        <h1 className="text-5xl md:text-8xl font-black text-gray-950 tracking-tighter uppercase">Cart.</h1>
                    </div>
                    <div className="flex bg-gray-50 p-2 rounded-2xl border border-gray-100">
                        <button
                            onClick={clearCart}
                            className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-white rounded-xl transition-all"
                        >
                            Clear Cart
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Cart Items */}
                    <div className="lg:col-span-8 space-y-6">
                        <AnimatePresence>
                            {cart.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="p-6 sm:p-8 bg-white border border-gray-100 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-gray-100 transition-all group overflow-hidden relative"
                                >
                                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center text-center md:text-left">
                                        <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-100 p-4">
                                            {/* Show customized image if available */}
                                            <img 
                                                src={item.customDesign?.textures?.front || item.customDesign?.textures?.top || Object.values(item.customDesign?.textures || {}).find(t => t) || item.img || item.image} 
                                                className="w-full h-full object-contain" 
                                                alt={item.name} 
                                            />
                                        </div>

                                        <div className="flex-1 space-y-2 min-w-0 w-full flex flex-col items-center md:items-start">
                                            <div className="flex items-center gap-3">
                                                <span className="px-2 py-0.5 bg-gray-950 text-white text-[8px] font-black uppercase tracking-widest rounded">SKU Verified</span>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.category || 'General'}</p>
                                                {item.selectedColor && (
                                                    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-md px-2 py-0.5 shrink-0">
                                                        <span className="w-2.5 h-2.5 rounded-full border border-gray-300 shrink-0" style={{ backgroundColor: item.selectedColor }} />
                                                        <span className="text-[8px] font-black text-gray-650 uppercase tracking-wider">{item.selectedColor.toUpperCase()}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tighter uppercase group-hover:text-emerald-500 transition-colors break-words">{(item.name || '').replace(/\s+[A-Z][A-Z\s]*BOX\s*$/i, '').replace(/_[A-Z][A-Z\s]*BOX\s*$/i, '') || item.name}</h3>
                                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 italic">Customization pending team approval</p>
                                        </div>

                                        <div className="flex items-center gap-8 px-0 md:px-8 md:border-x border-gray-100 h-auto md:h-16 w-full md:w-auto justify-between md:justify-center border-y md:border-y-0 py-4 md:py-0 border-gray-50">
                                            <div className="flex items-center bg-gray-50 rounded-xl p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - (item.customDesign ? 100 : 10))}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-950"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                                                    className="w-16 bg-transparent text-center font-black text-xs outline-none"
                                                />
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + (item.customDesign ? 100 : 10))}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-950"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end w-full md:w-auto text-right min-w-0 md:min-w-[140px]">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 md:block hidden">Production Total</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 md:hidden block">Total:</p>
                                            <h4 className="text-xl font-black text-gray-950 tracking-tighter shrink-0">
                                                ₹{(parseFloat(typeof item.price === 'number' ? item.price : item.price.replace(/[^0-9.]/g, '')) * item.quantity).toLocaleString('en-IN')}
                                            </h4>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="p-4 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="bg-gray-950 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 text-white sticky top-32 shadow-2xl shadow-gray-200">
                            <h3 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase mb-8 sm:mb-10 pb-6 sm:pb-8 border-b border-white/10">Summary.</h3>

                            <div className="space-y-6 mb-10">
                                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-white/40">
                                    <span>Subtotal</span>
                                    <span className="text-white">₹{cartTotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-white/40">
                                    <span>Shipping</span>
                                    <span className="text-emerald-500 underline">Calculated at Step 2</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-white/40">
                                    <span>Tax (GST)</span>
                                    <span className="text-white">Inclusive</span>
                                </div>
                                <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Total Payable</p>
                                        <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-white">₹{cartTotal.toLocaleString('en-IN')}</h2>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={user ? "/checkout" : `/login?redirect=/checkout`}
                                className="w-full flex items-center justify-between px-10 py-6 bg-white text-gray-950 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all group"
                            >
                                {user ? 'Proceed to Checkout' : 'Login to Checkout'}
                                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                            </Link>

                            <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                                        <ShieldCheck size={14} />
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Secure<br />Ordering</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                                        <Truck size={14} />
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Free<br />Transit</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upsell Section */}
                <section className="mt-20 sm:mt-40">
                    <div className="flex items-end justify-between mb-8 sm:mb-16">
                        <div className="text-center sm:text-left w-full sm:w-auto">
                            <h2 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tighter uppercase">Recommended for You.</h2>
                            <p className="text-sm sm:text-base text-gray-400 font-medium">Add these to optimize your structural packaging.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {recommendations.map((product) => (
                            <Link
                                href={`/products/${product._id || product.wpId}`}
                                key={product._id}
                                className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 group cursor-pointer hover:bg-white hover:shadow-2xl transition-all"
                            >
                                <div className="aspect-square bg-white rounded-2xl mb-6 p-6 overflow-hidden border border-gray-50">
                                    <img src={product.images?.[0]} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" alt="" />
                                </div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{product.category || 'Packaging'}</p>
                                <h4 className="text-sm font-black text-gray-950 uppercase mb-4 line-clamp-1">{product.name}</h4>
                                <div className="h-px bg-gray-100 mb-4" />
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-black text-emerald-600">₹{product.price}</span>
                                    <div className="w-8 h-8 rounded-full bg-gray-950 text-white flex items-center justify-center group-hover:bg-emerald-500 transition-all">
                                        <Plus size={14} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>

        </div>
    );
}
