"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

export default function AdminLogin() {
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
                if (result.user?.role === 'admin' || result.user?.role === 'staff_fulfillment') {
                    router.push("/admin");
                } else {
                    setErrorMsg("Unauthorized: You do not have admin access.");
                    setIsLoading(false);
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
        <div className="min-h-screen bg-gray-950 text-white selection:bg-emerald-500 selection:text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">

            {/* Dark Mode Animated Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.1]" style={{
                    backgroundImage: "radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)",
                    backgroundSize: "32px 32px"
                }} />

                <motion.div
                    animate={{ x: [0, 40, 0], y: [0, 20, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{ x: [0, -30, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-1/4 -left-20 w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/50 to-gray-950" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center p-4 bg-gray-900 border border-gray-800 rounded-3xl mb-6 shadow-2xl relative group">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <Shield className="text-emerald-500 relative z-10" size={32} />
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">BoxFox Admin</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                            Secure Portal Access <Sparkles size={12} className="text-emerald-500" />
                        </p>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50" />

                        <AnimatePresence>
                            {errorMsg && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                        <span>{errorMsg}</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2 group/input">
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 group-focus-within/input:text-emerald-500 transition-colors">Admin Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-500 group-focus-within/input:text-emerald-500 transition-colors">
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="admin@boxfox.com"
                                        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-950/50 border border-white/5 focus:bg-gray-900 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all duration-300 font-bold text-sm text-white placeholder:text-gray-600"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 group/input">
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 group-focus-within/input:text-emerald-500 transition-colors">Access Key</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-500 group-focus-within/input:text-emerald-500 transition-colors">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="••••••••••••"
                                        className="w-full pl-12 pr-12 py-4 rounded-2xl bg-gray-950/50 border border-white/5 focus:bg-gray-900 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all duration-300 font-bold text-sm text-white placeholder:text-gray-600 tracking-widest"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-500 hover:text-emerald-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="relative w-full py-4 mt-2 bg-white text-gray-950 rounded-2xl flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-[0.2em] overflow-hidden group/btn hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                            >
                                <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                                <span className="relative z-10 flex items-center gap-3 group-hover/btn:text-white transition-colors duration-300">
                                    {isLoading ? "Authenticating..." : "Enter Portal"}
                                    {!isLoading && <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />}
                                </span>
                            </button>
                        </form>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                            Authorized Personnel Only &bull; BoxFox Systems
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Loading Overlay */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-gray-950/80 backdrop-blur-md flex items-center justify-center"
                    >
                        <div className="relative w-20 h-20">
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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
