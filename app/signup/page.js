"use client";
import React, { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Mail, Lock, User as UserIcon, Phone, Building2, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

function SignUpContent() {
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/";
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        businessName: "",
        emailOptIn: false,
        otp: ""
    });
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const { signup, checkUser } = useAuth();
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOTP = async () => {
        if (!formData.email) {
            setErrorMsg("Please enter your email first to receive a verification code.");
            return;
        }
        setSendingOtp(true);
        setErrorMsg("");
        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email })
            });
            const data = await res.json();
            if (res.ok) {
                setOtpSent(true);
            } else {
                setErrorMsg(data.error || "Failed to send OTP. Account already exists or system error.");
            }
        } catch (err) {
            setErrorMsg("Network error. Could not send OTP.");
        } finally {
            setSendingOtp(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");

        try {
            const result = await signup(formData);
            if (result.success) {
                setIsSuccess(true);
                // Auth token is now set in cookie by the backend
                await checkUser();
                setTimeout(() => {
                    router.push(redirect);
                }, 2000);
            } else {
                setErrorMsg(result.error || "Registry sequence interrupted. Please verify parameters.");
                setIsLoading(false);
            }
        } catch (err) {
            setErrorMsg("System registry error. Please try again.");
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
                <Navbar />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center space-y-8 max-w-md"
                >
                    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto shadow-2xl shadow-emerald-500/40">
                        <CheckCircle2 size={48} />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black uppercase tracking-tighter text-gray-950 mb-4">Success.</h1>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] leading-relaxed italic">
                            Account generated. Initializing secure redirection...
                        </p>
                    </div>
                    <div className="flex justify-center gap-3">
                        {[0, 1, 2].map(i => (
                            <motion.div
                                key={i}
                                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                className="w-2 h-2 bg-emerald-500 rounded-full"
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-gray-950 selection:bg-emerald-500 selection:text-white overflow-hidden font-sans">
            <Navbar />

            <main className="relative min-h-screen flex items-center justify-center pt-32 pb-16 px-4">
                {/* Minimalist Background Decor */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.05]"
                    style={{
                        backgroundImage: "linear-gradient(#E5E7EB 1px, transparent 1px), linear-gradient(90deg, #E5E7EB 1px, transparent 1px)",
                        backgroundSize: "60px 60px"
                    }}
                />

                <div className="relative z-10 w-full max-w-[1200px]">
                    <div className="grid lg:grid-cols-12 gap-12 items-center">

                        {/* Perspective Content - Left */}
                        <div className="hidden lg:flex lg:col-span-4 flex-col justify-center space-y-10">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-600 block mb-6">Partner Program</span>
                                <h1 className="text-6xl font-black tracking-tighter uppercase leading-[0.9] text-gray-950 mb-8">
                                    Elevate<br />
                                    Your<br />
                                    <span className="text-emerald-500 italic">Brand.</span>
                                </h1>
                                <p className="text-gray-500 text-lg font-medium leading-relaxed tracking-tight">
                                    Connect with top designers and manufacturers. Access our professional toolkit for custom packaging and branding.
                                </p>
                            </motion.div>

                            <div className="space-y-6 pt-10 border-t border-gray-100">
                                <div className="flex items-center gap-5 group">
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-emerald-500 border border-gray-50 group-hover:scale-110 transition-transform">
                                        <ShieldCheck size={22} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-950 transition-colors">Secure Access</p>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Protected Account Data</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5 group">
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-emerald-500 border border-gray-50 group-hover:scale-110 transition-transform">
                                        <Sparkles size={22} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-950 transition-colors">Premium Tools</p>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Exclusive Design Templates</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Signup Form Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="lg:col-span-8 lg:col-start-5"
                        >
                            <div className="bg-white rounded-[3rem] p-8 sm:p-14 md:p-16 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.06)] border border-gray-100">
                                <div className="mb-12">
                                    <h2 className="text-4xl font-black uppercase tracking-tighter text-gray-950 mb-2">Sign Up.</h2>
                                    <div className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 pb-2">
                                        Create your professional account
                                        <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {errorMsg && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="mb-8 p-5 bg-red-50 text-red-600 rounded-2xl flex items-center gap-4 text-[10px] font-black uppercase tracking-widest border border-red-100"
                                        >
                                            <AlertCircle size={18} />
                                            {errorMsg}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-5">Full Name</label>
                                        <div className="relative group/input">
                                            <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none text-gray-300 group-focus-within/input:text-emerald-500 transition-colors">
                                                <UserIcon size={18} />
                                            </div>
                                            <input required name="name" value={formData.name} onChange={handleChange} type="text" className="w-full pl-16 pr-6 py-4 rounded-[1.5rem] bg-gray-50/50 border border-gray-100 focus:bg-white focus:ring-[15px] focus:ring-emerald-500/[0.03] outline-none transition-all font-bold text-sm text-gray-950 placeholder:text-gray-300" placeholder="Name" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-5">Business Name</label>
                                        <div className="relative group/input">
                                            <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none text-gray-300 group-focus-within/input:text-emerald-500 transition-colors">
                                                <Building2 size={18} />
                                            </div>
                                            <input name="businessName" value={formData.businessName} onChange={handleChange} type="text" className="w-full pl-16 pr-6 py-4 rounded-[1.5rem] bg-gray-50/50 border border-gray-100 focus:bg-white focus:ring-[15px] focus:ring-emerald-500/[0.03] outline-none transition-all font-bold text-sm text-gray-950 placeholder:text-gray-300" placeholder="Brand or Company" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-5">Email Address</label>
                                        <div className="relative group/input flex gap-3">
                                            <div className="relative flex-1">
                                                <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none text-gray-300 group-focus-within/input:text-emerald-500 transition-colors">
                                                    <Mail size={18} />
                                                </div>
                                                <input
                                                    required
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    type="email"
                                                    className="w-full pl-16 pr-6 py-4 rounded-[1.5rem] bg-gray-50/50 border border-gray-100 focus:bg-white focus:ring-[15px] focus:ring-emerald-500/[0.03] outline-none transition-all font-bold text-sm text-gray-950 placeholder:text-gray-300"
                                                    placeholder="name@company.com"
                                                />
                                            </div>
                                            {!otpSent && (
                                                <button
                                                    type="button"
                                                    onClick={handleSendOTP}
                                                    disabled={sendingOtp}
                                                    className="px-6 py-4 bg-gray-950 text-white rounded-[1.2rem] text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all disabled:opacity-50"
                                                >
                                                    {sendingOtp ? "..." : "Verify"}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {otpSent && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-3"
                                        >
                                            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] ml-5 flex items-center gap-2">
                                                Verification Code
                                                <span className="text-[8px] lowercase font-medium text-gray-400 italic font-sans">(Sent to email)</span>
                                            </label>
                                            <div className="relative group/input">
                                                <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none text-emerald-500">
                                                    <ShieldCheck size={18} />
                                                </div>
                                                <input
                                                    required
                                                    name="otp"
                                                    value={formData.otp}
                                                    onChange={handleChange}
                                                    type="text"
                                                    maxLength="6"
                                                    className="w-full pl-16 pr-6 py-4 rounded-[1.5rem] bg-emerald-50/30 border border-emerald-100 focus:bg-white focus:ring-[15px] focus:ring-emerald-500/[0.03] outline-none transition-all font-black text-lg tracking-[0.5em] text-emerald-950 placeholder:text-emerald-200"
                                                    placeholder="000000"
                                                />
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-5">Phone Number</label>
                                        <div className="relative group/input">
                                            <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none text-gray-300 group-focus-within/input:text-emerald-500 transition-colors">
                                                <Phone size={18} />
                                            </div>
                                            <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" className="w-full pl-16 pr-6 py-4 rounded-[1.5rem] bg-gray-50/50 border border-gray-100 focus:bg-white focus:ring-[15px] focus:ring-emerald-500/[0.03] outline-none transition-all font-bold text-sm text-gray-950 placeholder:text-gray-300" placeholder="+91 10-digit number" />
                                        </div>
                                    </div>

                                    <div className="space-y-3 md:col-span-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-5">Password</label>
                                        <div className="relative group/input">
                                            <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none text-gray-300 group-focus-within/input:text-emerald-500 transition-colors">
                                                <Lock size={18} />
                                            </div>
                                            <input required name="password" value={formData.password} onChange={handleChange} type={showPassword ? "text" : "password"} className="w-full pl-16 pr-16 py-4 rounded-[1.5rem] bg-gray-50/50 border border-gray-100 focus:bg-white focus:ring-[15px] focus:ring-emerald-500/[0.03] outline-none transition-all font-bold text-sm text-gray-950 placeholder:text-gray-300" placeholder="Minimum 8 characters" />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-7 flex items-center text-gray-300 hover:text-emerald-500 transition-colors">
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 pt-2 pb-6">
                                        <label className={`flex items-start gap-4 cursor-pointer group/optin transition-opacity ${!otpSent ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                                            <div className="relative mt-1">
                                                <input
                                                    required
                                                    disabled={!otpSent}
                                                    type="checkbox"
                                                    name="emailOptIn"
                                                    checked={formData.emailOptIn}
                                                    onChange={(e) => setFormData({ ...formData, emailOptIn: e.target.checked })}
                                                    className="peer absolute opacity-0 cursor-pointer w-0 h-0"
                                                />
                                                <div className="w-5 h-5 rounded-md border-2 border-gray-100 group-hover/optin:border-emerald-500 transition-all peer-checked:bg-emerald-500 peer-checked:border-emerald-500 flex items-center justify-center text-white">
                                                    <CheckCircle2 size={12} className="opacity-0 peer-checked:opacity-100 transition-opacity" />
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.05em] leading-relaxed select-none">
                                                I agree to receive <span className="text-gray-950 font-black underline decoration-emerald-500/30">order updates and exclusive promotions</span> from BoxFox. <span className="text-emerald-500 font-black">*Required</span>
                                            </span>
                                        </label>
                                        {!otpSent && <p className="text-[8px] font-bold text-emerald-600 uppercase mt-2 ml-9 animate-pulse">Verify email above to unlock this option.</p>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <button
                                            type="submit"
                                            disabled={isLoading || !otpSent}
                                            className="w-full relative py-6 bg-gray-950 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.4em] overflow-hidden group/btn hover:shadow-[0_25px_60px_rgba(16,185,129,0.15)] active:scale-[0.98] transition-all disabled:opacity-50"
                                        >
                                            <div className="absolute inset-0 bg-emerald-500 translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500" />
                                            <span className="relative z-10 flex items-center justify-center gap-4">
                                                {isLoading ? "Verifying & Creating..." : (otpSent ? "Create Account" : "Verify Email First")}
                                                {!isLoading && otpSent && <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform duration-500" />}
                                                {!isLoading && !otpSent && <ShieldCheck size={18} className="animate-bounce" />}
                                            </span>
                                        </button>
                                    </div>
                                </form>

                                <div className="mt-12 text-center flex flex-col gap-8">
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                        Already have an account?{" "}
                                        <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-emerald-500 hover:text-emerald-600 ml-2 border-b-2 border-emerald-500/10 hover:border-emerald-500 transition-all">
                                            Sign In Here
                                        </Link>
                                    </p>
                                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest leading-relaxed max-w-sm mx-auto">
                                        By proceeding, you agree to our <br />
                                        <Link href="/terms" className="underline">Terms of Service</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function SignUp() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-950"></div>
            </div>
        }>
            <SignUpContent />
        </Suspense>
    );
}


