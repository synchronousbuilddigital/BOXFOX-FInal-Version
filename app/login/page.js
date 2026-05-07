"use client";
import React, { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Mail, Lock, Eye, EyeOff, ShieldCheck, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

function LoginContent() {
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");

        try {
            const result = await login(email, password);
            if (result.success) {
                if (result.user?.role === 'admin') {
                    router.push("/admin");
                } else if (result.user?.role === 'vendor') {
                    router.push("/vendor");
                } else {
                    router.push(redirect);
                }
            } else {
                setErrorMsg(result.error || "Authentication failed. Please verify your credentials.");
                setIsLoading(false);
            }
        } catch (err) {
            setErrorMsg("A system error occurred. Please try again later.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-gray-950 selection:bg-emerald-500 selection:text-white overflow-hidden font-sans">
            <Navbar />

            <main className="relative min-h-screen flex items-center justify-center pt-32 pb-16 px-4">
                {/* Minimalist Premium Background */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-[0.4]"
                        style={{
                            backgroundImage: "radial-gradient(circle at 2px 2px, #E5E7EB 1px, transparent 0)",
                            backgroundSize: "40px 40px"
                        }}
                    />
                    <motion.div
                        animate={{
                            x: [0, 50, 0],
                            y: [0, 30, 0],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-emerald-100/30 blur-[120px] rounded-full"
                    />
                    <motion.div
                        animate={{
                            x: [0, -40, 0],
                            y: [0, -50, 0],
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -bottom-1/4 -left-20 w-[500px] h-[500px] bg-gray-200/20 blur-[100px] rounded-full"
                    />
                </div>

                <div className="relative z-10 w-full max-w-[1200px]">
                    <div className="grid lg:grid-cols-12 gap-12 items-center">

                        {/* Left Branding Content */}
                        <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-12">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-8 h-[2px] bg-emerald-500" />
                                    <span className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.4em]">Customer Login</span>
                                </div>
                                <h2 className="text-7xl font-black tracking-tighter uppercase leading-[0.9] text-gray-950 mb-8">
                                    The Future<br />
                                    Of<br />
                                    <span className="text-emerald-500 italic">Packaging.</span>
                                </h2>
                                <p className="text-gray-500 text-lg font-medium max-w-sm leading-relaxed tracking-tight">
                                    Design and manage your brand's unboxing experience with our professional packaging toolkit.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4, duration: 1 }}
                                className="grid grid-cols-2 gap-12"
                            >
                                <div className="space-y-2">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Orders Delivered</p>
                                    <p className="text-4xl font-black italic tracking-tighter text-gray-950">150K+</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Happy Customers</p>
                                    <p className="text-4xl font-black italic tracking-tighter text-emerald-500">99.9%</p>
                                </div>
                            </motion.div>

                            <div className="pt-12 border-t border-gray-100 flex items-center gap-8">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                                            <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    Trusted by <span className="text-gray-950">5000+ Brands</span> Worldwide
                                </p>
                            </div>
                        </div>

                        {/* Login Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="lg:col-span-7 lg:col-start-7"
                        >
                            <div className="bg-white rounded-[3rem] p-8 sm:p-14 lg:p-20 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-gray-100 relative overflow-hidden group">
                                {/* Subtle internal glow */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors duration-700" />

                                <div className="max-w-md mx-auto relative z-10">
                                    <div className="mb-12">
                                        <img src="/BOXFOX-1.png" alt="Logo" className="h-8 mb-10 lg:hidden" />
                                        <h1 className="text-5xl font-black uppercase tracking-tighter text-gray-950 mb-3">
                                            Welcome Back.
                                        </h1>
                                        <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-3">
                                            Sign in to manage your brand
                                            <Sparkles size={14} className="text-emerald-500" />
                                        </p>
                                    </div>

                                    <AnimatePresence>
                                        {errorMsg && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="mb-8 p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-600 text-[10px] font-black uppercase tracking-widest"
                                            >
                                                <AlertCircle size={18} />
                                                {errorMsg}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <div className="space-y-4">
                                            <div className="relative group/input">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-5 mb-2 block group-focus-within/input:text-emerald-500 transition-colors">Email Address</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none text-gray-300 group-focus-within/input:text-emerald-500 transition-colors">
                                                        <Mail size={18} />
                                                    </div>
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required
                                                        placeholder="name@company.com"
                                                        className="w-full pl-16 pr-6 py-5 rounded-[1.5rem] bg-gray-50/50 border border-gray-100 focus:bg-white focus:border-emerald-500/20 focus:ring-[15px] focus:ring-emerald-500/[0.03] outline-none transition-all duration-500 font-bold text-sm text-gray-950 placeholder:text-gray-300 placeholder:font-medium"
                                                    />
                                                </div>
                                            </div>

                                            <div className="relative group/input">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-5 mb-2 block group-focus-within/input:text-emerald-500 transition-colors">Password</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none text-gray-300 group-focus-within/input:text-emerald-500 transition-colors">
                                                        <Lock size={18} />
                                                    </div>
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        required
                                                        placeholder="••••••••••••"
                                                        className="w-full pl-16 pr-16 py-5 rounded-[1.5rem] bg-gray-50/50 border border-gray-100 focus:bg-white focus:border-emerald-500/20 focus:ring-[15px] focus:ring-emerald-500/[0.03] outline-none transition-all duration-500 font-bold text-sm text-gray-950 placeholder:text-gray-300"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute inset-y-0 right-0 pr-7 flex items-center text-gray-300 hover:text-emerald-500 transition-colors"
                                                    >
                                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between px-2">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative flex items-center justify-center">
                                                    <input type="checkbox" className="peer w-5 h-5 opacity-0 absolute cursor-pointer" />
                                                    <div className="w-5 h-5 rounded-lg border-2 border-gray-100 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all flex items-center justify-center">
                                                        <div className="w-1.5 h-1.5 bg-white rounded-full scale-0 peer-checked:scale-100 transition-transform" />
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-950 transition-colors">Remember Me</span>
                                            </label>
                                            <Link href="/forgot-password" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-emerald-500 transition-colors">
                                                Forgot Password?
                                            </Link>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="relative w-full py-6 bg-gray-950 text-white rounded-[1.5rem] flex items-center justify-center gap-4 font-black text-xs uppercase tracking-[0.3em] overflow-hidden group/btn shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_25px_60px_rgba(16,185,129,0.2)] active:scale-[0.98] transition-all disabled:opacity-70"
                                        >
                                            <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                                            <span className="relative z-10 flex items-center gap-4">
                                                {isLoading ? (
                                                    "Signing In..."
                                                ) : (
                                                    <>
                                                        Sign In Now
                                                        <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform duration-500" />
                                                    </>
                                                )}
                                            </span>
                                        </button>
                                    </form>

                                    <div className="mt-12 text-center space-y-4">
                                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                            New to Boxfox?{" "}
                                            <Link href={`/signup?redirect=${encodeURIComponent(redirect)}`} className="text-emerald-500 hover:text-emerald-600 ml-2 border-b-2 border-emerald-500/10 hover:border-emerald-500 transition-all">
                                                Create Account
                                            </Link>
                                        </p>
                                        <div className="h-px bg-gray-50 w-20 mx-auto" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                                            Manufacturing Partner?{" "}
                                            <Link href="/vendor/register" className="text-gray-950 hover:text-emerald-500 transition-all border-b border-gray-200 hover:border-emerald-500">
                                                Join Network
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* Custom Spinner for loading state */}
            {isLoading && (
                <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="relative w-24 h-24">
                        <motion.div
                            className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.div
                            className="absolute inset-0 border-t-4 border-emerald-500 rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Login() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-950"></div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}



