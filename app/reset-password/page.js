"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("Invalid protocol. No reset token detected.");
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords mismatch. Protocol aborted.");
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setIsSuccess(true);
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                setError(data.error || "Password reset failed. Token may be expired.");
            }
        } catch (err) {
            setError("Neural link failed. Server unreachable.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <main className="pt-40 pb-24 px-6 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-xl w-full text-center space-y-12"
                >
                    <div className="relative inline-block">
                        <div className="w-32 h-32 bg-emerald-500 text-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20 rotate-12">
                            <CheckCircle2 size={64} strokeWidth={2.5} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-6xl md:text-7xl font-black text-gray-950 tracking-tighter uppercase leading-none">Access<br /><span className="text-emerald-500">Restored.</span></h1>
                        <p className="text-xl text-gray-400 font-medium">Your credentials have been updated successfully. Redirecting to login terminal...</p>
                    </div>

                    <div className="flex justify-center flex-col items-center gap-6">
                        <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 3 }}
                                className="h-full bg-emerald-500"
                            />
                        </div>
                        <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-gray-950 transition-colors">
                            Manual Entry Protocol
                        </Link>
                    </div>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="pt-40 pb-24 px-6 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-md w-full"
            >
                <div className="mb-12 text-center">
                    <h1 className="text-6xl md:text-7xl font-black text-gray-950 tracking-tighter uppercase leading-[0.8] mb-6">New<br /><span className="text-emerald-500">Protocol.</span></h1>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] italic">Define your new security credentials</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-8 p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-center gap-4"
                    >
                        <AlertCircle className="text-red-500 shrink-0" size={20} />
                        <p className="text-[10px] font-black uppercase text-red-600 tracking-widest leading-relaxed">{error}</p>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 italic flex items-center gap-2">
                            <Lock size={12} className="text-emerald-500" /> New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-gray-50 border border-transparent rounded-[1.5rem] px-8 py-6 font-black text-sm outline-none focus:bg-white focus:border-gray-950 hover:bg-gray-100 transition-all uppercase tracking-widest"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-950 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 italic flex items-center gap-2">
                            <Lock size={12} className="text-emerald-500" /> Confirm Protocol
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-gray-50 border border-transparent rounded-[1.5rem] px-8 py-6 font-black text-sm outline-none focus:bg-white focus:border-gray-950 hover:bg-gray-100 transition-all uppercase tracking-widest"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !token}
                        className="w-full py-6 bg-gray-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-emerald-500 transition-all disabled:opacity-30 shadow-2xl shadow-gray-200 flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                <span>Updating...</span>
                            </>
                        ) : (
                            <>
                                <span>Sync Credentials</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </main>
    );
}

export default function ResetPassword() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center pt-40">
                    <Loader2 className="animate-spin text-emerald-500" size={40} />
                </div>
            }>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
