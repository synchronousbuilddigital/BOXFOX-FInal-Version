"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ShieldCheck, Sparkles, Lock, UserPlus, X } from "lucide-react";

export default function AuthModal({ isOpen, onClose }) {
    const [currentPath, setCurrentPath] = React.useState("");

    React.useEffect(() => {
        setCurrentPath(window.location.pathname + window.location.search);
    }, []);

    if (!isOpen) return null;

    const redirectQuery = currentPath ? `?redirect=${encodeURIComponent(currentPath)}` : "";

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-gray-950/60 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg bg-white rounded-[3rem] p-8 sm:p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] border border-gray-100 overflow-hidden"
                >
                    {/* Background Accents */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 blur-[30px] rounded-full -ml-12 -mb-12" />

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                    <ShieldCheck className="text-emerald-500" size={20} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Access_Required</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-950"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-gray-950 leading-none">
                                Unlock the <br />
                                <span className="text-emerald-500 italic text-5xl">Design Studio.</span>
                            </h2>
                            <p className="text-gray-500 font-medium text-base leading-relaxed">
                                To access professional packaging customization, 3D previews, and AI design tools, please sign in to your BOXFOX account.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                <Link
                                    href={`/login${redirectQuery}`}
                                    className="flex items-center justify-center gap-3 py-5 bg-gray-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all duration-300 shadow-lg shadow-gray-950/20"
                                >
                                    <Lock size={14} />
                                    Sign In Now
                                </Link>
                                <Link
                                    href={`/signup${redirectQuery}`}
                                    className="flex items-center justify-center gap-3 py-5 bg-white text-gray-950 border border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:border-emerald-500 hover:text-emerald-500 transition-all duration-300 shadow-sm"
                                >
                                    <UserPlus size={14} />
                                    Create Account
                                </Link>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-gray-50 flex items-center gap-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="User" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                                Join <span className="text-gray-950 font-black">5000+ Brands</span> on BoxFox
                            </p>
                            <Sparkles size={14} className="text-emerald-500 ml-auto animate-pulse" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
