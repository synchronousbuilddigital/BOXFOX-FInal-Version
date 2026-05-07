"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setIsSent(true);
                setMessage(data.message);
            } else {
                setError(data.error || "Something went wrong. Please try again.");
            }
        } catch (err) {
            setError("Failed to connect to the server.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSent) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
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
                            <h1 className="text-6xl md:text-7xl font-black text-gray-950 tracking-tighter uppercase leading-none">Check your<br /><span className="text-emerald-500">Inbox.</span></h1>
                            <p className="text-xl text-gray-400 font-medium">{message || "A secure reset link has been dispatched to your email address."}</p>
                        </div>

                        <div className="p-10 bg-gray-50 rounded-[3rem] border border-gray-100 text-left space-y-6">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol</p>
                                <p className="text-xs font-bold text-gray-950 leading-relaxed">
                                    The link will remain active for <span className="text-emerald-500">60 minutes</span>. If you don't see it, check your spam folder or try again.
                                </p>
                            </div>
                        </div>

                        <Link href="/login" className="inline-flex items-center gap-4 px-12 py-6 bg-gray-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-emerald-500 transition-all shadow-2xl shadow-gray-200">
                            Back to Login <ArrowRight size={18} />
                        </Link>
                    </motion.div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main className="pt-40 pb-24 px-6 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                    className="max-w-md w-full"
                >
                    <div className="mb-12 text-center">
                        <h1 className="text-6xl md:text-7xl font-black text-gray-950 tracking-tighter uppercase leading-[0.8] mb-6">Forgot<br /><span className="text-emerald-500">Access?</span></h1>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] italic">Enter your identification email to reset protocol</p>
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

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 italic flex items-center gap-2">
                                <Mail size={12} className="text-emerald-500" /> Authorized Email
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                className="w-full bg-gray-50 border border-transparent rounded-[1.5rem] px-8 py-6 font-black text-sm outline-none focus:bg-white focus:border-gray-950 hover:bg-gray-100 transition-all uppercase tracking-widest"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-6 bg-gray-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-emerald-500 transition-all disabled:opacity-30 shadow-2xl shadow-gray-200 flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <span>Reset Protocol</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-950 transition-colors">
                            Remember your credentials? <span className="text-emerald-500 italic ml-2">Secure Login</span>
                        </Link>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
