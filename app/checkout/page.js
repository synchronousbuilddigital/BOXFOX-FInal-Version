"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ArrowRight,
    ShieldCheck,
    Package,
    CreditCard,
    Truck,
    CheckCircle2,
    Lock
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import Link from 'next/link';
import Navbar from '../components/Navbar';

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function CheckoutPage() {
    const { cart, cartTotal, clearCart } = useCart();
    const { showToast } = useToast();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [paymentError, setPaymentError] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        shippingAddress: {
            street: '',
            apartment: '',
            landmark: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'India',
            addressNickname: '',
            gstin: ''
        }
    });

    const [user, setUser] = useState(null);

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(-1);
    const [isPincodeLoading, setIsPincodeLoading] = useState(false);
    const [fetchedCities, setFetchedCities] = useState([]);
    const [paymentFormData, setPaymentFormData] = useState({
        transactionId: '',
        senderName: ''
    });
    const [isPaymentSubmitted, setIsPaymentSubmitted] = useState(false);

    React.useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        if (query.get('status') === 'success') {
            setOrderId(query.get('orderId'));
            setStep(3);
            clearCart();
        } else if (query.get('status') === 'failure') {
            setPaymentError("Your payment transaction failed. Please try again or contact support.");
        }

        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setUser(data.user);
                    setFormData(prev => ({
                        ...prev,
                        name: data.user.name || prev.name,
                        email: data.user.email || prev.email,
                        phone: data.user.phone || prev.phone,
                        shippingAddress: {
                            ...prev.shippingAddress,
                            ...(data.user.shippingAddress || {})
                        }
                    }));
                    if (data.user.shippingAddress && data.user.shippingAddress.street) {
                        setSavedAddresses([data.user.shippingAddress]);
                        setSelectedAddressIndex(0);
                    }
                } else {
                    // Redirect to login if not authenticated
                    window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
                }
            })
            .catch(() => {
                window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
            });
    }, []);

    const lookupPincode = async (pincode) => {
        if (pincode.length !== 6) return;
        setIsPincodeLoading(true);
        try {
            const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await res.json();
            if (data[0].Status === "Success") {
                const postOffices = data[0].PostOffice;
                const state = postOffices[0].State;
                const cities = Array.from(new Set(postOffices.map(po => po.District)));

                setFetchedCities(cities);
                setFormData(prev => ({
                    ...prev,
                    shippingAddress: {
                        ...prev.shippingAddress,
                        state: state,
                        city: cities[0] || prev.shippingAddress.city,
                        zipCode: pincode
                    }
                }));
            }
        } catch (error) {
            console.error("Pincode lookup failed", error);
        } finally {
            setIsPincodeLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
            if (child === 'zipCode' && value.length === 6) {
                lookupPincode(value);
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSelectSavedAddress = (addr, idx) => {
        setFormData(prev => ({ ...prev, shippingAddress: addr }));
        setSelectedAddressIndex(idx);
    };

    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    const applyCoupon = async () => {
        if (!couponInput) return;
        setIsValidating(true);
        setCouponError('');
        try {
            const res = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponInput, amount: cartTotal })
            });
            const data = await res.json();
            if (res.ok) {
                setAppliedCoupon(data);
                setCouponInput('');
            } else {
                setCouponError(data.error);
            }
        } catch (err) {
            setCouponError("Failed to validate coupon");
        } finally {
            setIsValidating(false);
        }
    };

    const finalTotal = cartTotal - (appliedCoupon?.discount || 0);



    const placeOrder = async () => {
        if (!user) {
            showToast("Please login to place an order", "error");
            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
            return;
        }
        if (!formData.phone || formData.phone.length !== 10) {
            showToast("Please provide a valid 10-digit phone number", "error");
            setStep(1);
            return;
        }
        if (!formData.name || !formData.email) {
            showToast("Identity profile incomplete. Name and Email are required.", "error");
            setStep(1);
            return;
        }
        if (!formData.shippingAddress.street || !formData.shippingAddress.city || !formData.shippingAddress.state || !formData.shippingAddress.zipCode) {
            showToast("Logistics protocol incomplete. Please provide full shipping address.", "error");
            setStep(2);
            return;
        }
        if (!paymentFormData.transactionId || !paymentFormData.senderName) {
            showToast("Please provide authorized payment details", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?._id || undefined,
                    customer: {
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone
                    },
                    items: cart.map(item => ({
                        productId: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price || 0).replace(/[^0-9.]/g, '')) || 0,
                        variant: item.variant,
                        image: item.img || item.image,
                        customDesign: item.customDesign
                    })),
                    total: finalTotal,
                    discount: appliedCoupon?.discount || 0,
                    couponCode: appliedCoupon?.code || null,
                    status: 'Pending',
                    paymentDetails: {
                        ...paymentFormData,
                        method: 'Manual/UPI',
                        submittedAt: new Date()
                    },
                    shipping: {
                        address: formData.shippingAddress.street,
                        apartment: formData.shippingAddress.apartment,
                        landmark: formData.shippingAddress.landmark,
                        city: formData.shippingAddress.city,
                        state: formData.shippingAddress.state,
                        zipCode: formData.shippingAddress.zipCode,
                        country: formData.shippingAddress.country,
                        addressNickname: formData.shippingAddress.addressNickname,
                        gstin: formData.shippingAddress.gstin
                    }
                })
            });
            const data = await res.json();
            if (data.success) {
                setOrderId(data.orderId);
                setStep(4); // Success Step
                clearCart();
                showToast("Order placed successfully", "success");
                return;
            } else {
                showToast(data.error || "Failed to place order", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("System error occurred while placing order", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (step === 4) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <main className="pt-40 pb-24 px-6 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl w-full text-center space-y-12"
                    >
                        <div className="relative inline-block">
                            <div className="w-32 h-32 bg-emerald-500 text-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20 rotate-12">
                                <CheckCircle2 size={64} strokeWidth={2.5} />
                            </div>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="absolute -top-4 -right-4 w-12 h-12 bg-gray-950 text-white rounded-full flex items-center justify-center font-black text-xs"
                            >
                                OK
                            </motion.div>
                        </div>

                        <div className="space-y-6">
                            <h1 className="text-6xl md:text-7xl font-black text-gray-950 tracking-tighter uppercase leading-none">Manifest<br />Submitted.</h1>
                            <p className="text-xl text-gray-400 font-medium">Logistics ID #{orderId} is under verification.</p>
                        </div>

                        <div className="p-8 bg-amber-50 border border-amber-100 rounded-[2.5rem] space-y-4">
                            <div className="flex items-center justify-center gap-3 text-amber-600">
                                <ShieldCheck size={20} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Protocol Verification Pending</span>
                            </div>
                            <p className="text-xs font-bold text-amber-900 leading-relaxed max-w-md mx-auto uppercase">
                                Your transaction proof has been logged. The manifest will be activated once our department verifies the payment.
                            </p>
                        </div>

                        <Link href="/" className="inline-flex items-center gap-4 px-12 py-6 bg-gray-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-emerald-500 transition-all shadow-2xl shadow-gray-200">
                            Return To Terminal <ArrowRight size={18} />
                        </Link>
                    </motion.div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <main className="pt-28 md:pt-36 pb-24 px-4 sm:px-8 lg:px-16 max-w-[1700px] mx-auto">
                {/* Dynamic Hero Header */}
                <header className="relative mb-12 md:mb-20">
                    <div className="absolute -left-12 top-0 w-24 h-24 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-gray-100 pb-10">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-[2px] bg-emerald-500" />
                                <span className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.4em]">Checkout_Protocol_v2.1</span>
                            </div>
                            <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black text-gray-950 tracking-tighter uppercase leading-[0.8] mb-2">
                                Confirm<br /><span className="text-emerald-500 italic">Shipping.</span>
                            </h1>
                        </motion.div>

                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 px-5 py-3 rounded-2xl shadow-sm">
                                <Lock size={14} className="text-emerald-500" />
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Security_Status</span>
                                    <span className="text-[10px] font-black text-gray-950 uppercase tracking-tighter">SSL_256_Encrypted</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 px-5 py-3 rounded-2xl shadow-sm">
                                <Truck size={14} className="text-emerald-600" />
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black uppercase text-emerald-600/50 tracking-widest leading-none mb-1">Transit_Priority</span>
                                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tighter">Express_Delivery</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {paymentError && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-12 p-6 bg-red-50 border border-red-200 rounded-[2.5rem] flex items-center gap-6 shadow-xl shadow-red-500/5"
                    >
                        <div className="w-14 h-14 bg-red-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
                            <Lock size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-red-400 tracking-widest mb-1 italic">Security_Alert</p>
                            <p className="text-sm font-bold text-red-950">{paymentError}</p>
                        </div>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-24">
                    {/* Main Form Area */}
                    <div className="lg:col-span-7 space-y-16">
                        {/* Process Pipeline (Stepper) */}
                        <div className="flex items-center gap-4 sm:gap-6 bg-gray-50/50 p-4 rounded-[2.5rem] border border-gray-100 overflow-x-auto no-scrollbar">
                            {[
                                { id: 1, label: 'Identity', icon: <Package size={14} /> },
                                { id: 2, label: 'Logistics', icon: <Truck size={14} /> },
                                { id: 3, label: 'Payment', icon: <CreditCard size={14} /> }
                            ].map((s, i) => (
                                <React.Fragment key={s.id}>
                                    <button
                                        onClick={() => setStep(s.id)}
                                        className="flex items-center gap-4 group shrink-0"
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 ${step >= s.id
                                                ? 'bg-gray-950 text-white shadow-xl shadow-gray-900/20 rotate-0'
                                                : 'bg-white text-gray-400 border border-gray-100 group-hover:border-emerald-500 group-hover:text-emerald-500'
                                            }`}>
                                            {s.id}
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] mb-0.5 ${step >= s.id ? 'text-emerald-500' : 'text-gray-300'}`}>Phase_0{s.id}</span>
                                            <span className={`text-[11px] font-black uppercase tracking-widest ${step >= s.id ? 'text-gray-950' : 'text-gray-400'}`}>{s.label}</span>
                                        </div>
                                    </button>
                                    {i < 2 && <div className="h-px w-8 bg-gray-200 shrink-0" />}
                                </React.Fragment>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-12"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3 group">
                                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4 group-focus-within:text-emerald-500 transition-colors">
                                                <div className="w-1.5 h-1.5 bg-current rounded-full" /> Full Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                name="name" value={formData.name || ''} onChange={handleFormChange}
                                                placeholder="AUTHORIZED PERSONNEL ONLY"
                                                required
                                                className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-8 py-6 font-black text-sm outline-none focus:bg-white focus:border-emerald-500 hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all uppercase tracking-widest placeholder:text-gray-300"
                                            />
                                        </div>
                                        <div className="space-y-3 group">
                                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4 group-focus-within:text-emerald-500 transition-colors">
                                                <div className="w-1.5 h-1.5 bg-current rounded-full" /> Digital ID (Email) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email" name="email" value={formData.email || ''} onChange={handleFormChange}
                                                placeholder="SYSTEM_ACCESS@NODE.COM"
                                                required
                                                className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-8 py-6 font-black text-sm outline-none focus:bg-white focus:border-emerald-500 hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all uppercase tracking-widest placeholder:text-gray-300"
                                            />
                                        </div>
                                        <div className="space-y-3 group md:col-span-2">
                                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4 group-focus-within:text-emerald-500 transition-colors">
                                                <div className="w-1.5 h-1.5 bg-current rounded-full" /> Mobile Terminal (Phone) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                name="phone" value={formData.phone || ''} onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                    handleFormChange({ target: { name: 'phone', value: val } });
                                                }}
                                                placeholder="10 DIGIT MOBILE NUMBER"
                                                required
                                                className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-8 py-6 font-black text-sm outline-none focus:bg-white focus:border-emerald-500 hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all uppercase tracking-widest placeholder:text-gray-300"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setStep(2)}
                                        disabled={!formData.name || !formData.email || !formData.phone}
                                        className="group relative w-full py-8 bg-gray-950 text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.4em] overflow-hidden transition-all hover:bg-emerald-600 disabled:opacity-30 disabled:pointer-events-none active:scale-[0.98]"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="relative z-10 flex items-center justify-center gap-4">
                                            Initialize Logistics Protocol <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                                        </span>
                                    </button>
                                </motion.div>
                            ) : step === 2 ? (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-12"
                                >
                                    {savedAddresses.filter(addr => addr.street || addr.city).length > 0 && (
                                        <div className="space-y-6">
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ml-4">Stored_Coordinates</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {savedAddresses.filter(addr => addr.street || addr.city).map((addr, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleSelectSavedAddress(addr, idx)}
                                                        className={`group p-8 rounded-[2.5rem] border text-left transition-all relative overflow-hidden ${selectedAddressIndex === idx
                                                                ? 'bg-gray-950 border-gray-950 text-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)]'
                                                                : 'bg-gray-50 border-gray-100 hover:border-emerald-200 hover:bg-white'
                                                            }`}
                                                    >
                                                        <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl rounded-full transition-opacity ${selectedAddressIndex === idx ? 'bg-emerald-500/20 opacity-100' : 'bg-emerald-500/10 opacity-0 group-hover:opacity-100'}`} />
                                                        <div className="relative z-10">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <span className={`text-[8px] font-black uppercase tracking-widest ${selectedAddressIndex === idx ? 'text-emerald-400' : 'text-gray-400'}`}>
                                                                    {addr.addressNickname || `Node_LOC_${idx + 1}`}
                                                                </span>
                                                                {selectedAddressIndex === idx && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]" />}
                                                            </div>
                                                            <p className="text-xs font-black uppercase tracking-tighter line-clamp-2 leading-relaxed">
                                                                {addr.street}{addr.apartment ? `, ${addr.apartment}` : ''}<br />
                                                                {addr.city}, {addr.state} {addr.zipCode}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-gray-50/50 p-8 md:p-12 rounded-[3.5rem] border border-gray-100 space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4 group">
                                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 group-focus-within:text-emerald-500 transition-colors">Street Mapping <span className="text-red-500">*</span></label>
                                                <input
                                                    name="shippingAddress.street" value={formData.shippingAddress.street || ''} onChange={handleFormChange}
                                                    placeholder="Primary Street Access"
                                                    required
                                                    className="w-full bg-white border border-gray-200 rounded-[2rem] px-8 py-6 font-black text-sm outline-none focus:border-emerald-500 hover:shadow-xl hover:shadow-gray-100 transition-all uppercase tracking-widest"
                                                />
                                            </div>
                                            <div className="space-y-4 group">
                                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 group-focus-within:text-emerald-500 transition-colors">Apt / Suite / Landmark</label>
                                                <input
                                                    name="shippingAddress.apartment" value={formData.shippingAddress.apartment || ''} onChange={handleFormChange}
                                                    placeholder="Unit / Floor / Landmark"
                                                    className="w-full bg-white border border-gray-200 rounded-[2rem] px-8 py-6 font-black text-sm outline-none focus:border-emerald-500 hover:shadow-xl hover:shadow-gray-100 transition-all uppercase tracking-widest"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4 group">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 italic">Region Code (ZIP) <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    <input
                                                        name="shippingAddress.zipCode" value={formData.shippingAddress.zipCode || ''} onChange={handleFormChange}
                                                        placeholder="000 000"
                                                        required
                                                        className={`w-full bg-white border ${isPincodeLoading ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-gray-200'} rounded-[2rem] px-8 py-6 font-black text-sm outline-none focus:border-emerald-500 hover:shadow-xl hover:shadow-gray-100 transition-all tracking-widest`}
                                                    />
                                                    {isPincodeLoading && (
                                                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                                            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-4 group">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 italic">Sector / City <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    {fetchedCities.length > 0 ? (
                                                        <select
                                                            name="shippingAddress.city" value={formData.shippingAddress.city || ''} onChange={handleFormChange}
                                                            className="w-full bg-white border border-gray-200 rounded-[2rem] px-8 py-6 font-black text-sm outline-none focus:border-emerald-500 hover:shadow-xl hover:shadow-gray-100 transition-all uppercase appearance-none cursor-pointer"
                                                        >
                                                            <option value="">Select City</option>
                                                            {fetchedCities.map(city => (
                                                                <option key={city} value={city}>{city}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <input
                                                            name="shippingAddress.city" value={formData.shippingAddress.city || ''} onChange={handleFormChange}
                                                            placeholder="City"
                                                            className="w-full bg-white border border-gray-200 rounded-[2rem] px-8 py-6 font-black text-sm outline-none focus:border-emerald-500 hover:shadow-xl hover:shadow-gray-100 transition-all uppercase tracking-widest"
                                                        />
                                                    )}
                                                    {fetchedCities.length > 0 && <ChevronLeft className="absolute right-8 top-1/2 -translate-y-1/2 rotate-[270deg] text-gray-400 pointer-events-none" size={16} />}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4 group">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 italic">Administrative Region (State) <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    <select
                                                        name="shippingAddress.state" value={formData.shippingAddress.state || ''} onChange={handleFormChange}
                                                        className="w-full bg-white border border-gray-200 rounded-[2rem] px-8 py-6 font-black text-sm outline-none focus:border-emerald-500 hover:shadow-xl hover:shadow-gray-100 transition-all uppercase appearance-none cursor-pointer"
                                                    >
                                                        <option value="">Select State</option>
                                                        {INDIAN_STATES.map(state => (
                                                            <option key={state} value={state}>{state}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronLeft className="absolute right-8 top-1/2 -translate-y-1/2 rotate-[270deg] text-gray-400 pointer-events-none" size={16} />
                                                </div>
                                            </div>
                                            <div className="space-y-4 group">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 italic">Zone Select (Country)</label>
                                                <div className="relative">
                                                    <select
                                                        name="shippingAddress.country" value="India" readOnly
                                                        className="w-full bg-gray-100 border border-gray-200 rounded-[2rem] px-8 py-6 font-black text-sm outline-none cursor-not-allowed uppercase appearance-none"
                                                    >
                                                        <option value="India">IND - India</option>
                                                    </select>
                                                    <ChevronLeft className="absolute right-8 top-1/2 -translate-y-1/2 rotate-[270deg] text-gray-400 pointer-events-none" size={16} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4 group">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 italic">Address Nickname</label>
                                                <input
                                                    name="shippingAddress.addressNickname" value={formData.shippingAddress.addressNickname || ''} onChange={handleFormChange}
                                                    placeholder="HOME / OFFICE / WAREHOUSE"
                                                    className="w-full bg-white border border-gray-200 rounded-[2rem] px-8 py-6 font-black text-sm outline-none focus:border-emerald-500 hover:shadow-xl hover:shadow-gray-100 transition-all uppercase tracking-widest"
                                                />
                                            </div>
                                            <div className="space-y-4 group">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 italic">Business ID (GSTIN - Optional)</label>
                                                <input
                                                    name="shippingAddress.gstin" value={formData.shippingAddress.gstin || ''} onChange={handleFormChange}
                                                    placeholder="00AAAAA0000A1Z0"
                                                    className="w-full bg-white border border-gray-200 rounded-[2rem] px-8 py-6 font-black text-sm outline-none focus:border-emerald-500 hover:shadow-xl hover:shadow-gray-100 transition-all uppercase tracking-widest"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-6">
                                        <button
                                            onClick={() => setStep(1)}
                                            className="sm:flex-1 py-6 bg-gray-100 text-gray-950 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-gray-200 transition-all active:scale-[0.98]"
                                        >
                                            Previous_Phase
                                        </button>
                                        <button
                                            disabled={!formData.shippingAddress.street || !formData.shippingAddress.city || !formData.shippingAddress.state || !formData.shippingAddress.zipCode}
                                            onClick={() => setStep(3)}
                                            className="group relative sm:flex-[2] py-8 bg-emerald-500 text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.4em] overflow-hidden transition-all hover:bg-gray-950 active:scale-[0.98] shadow-2xl shadow-emerald-500/20"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <span className="relative z-10 flex items-center justify-center gap-4">
                                                Proceed to Payment <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                                            </span>
                                        </button>
                                    </div>
                                </motion.div>
                            ) : step === 3 ? (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-12"
                                >
                                    <div className="bg-gray-50 rounded-[3rem] p-10 border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-8">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Authorized QR Gateway</span>
                                            </div>

                                            <div className="aspect-square bg-white rounded-[2rem] p-6 border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col items-center justify-center gap-6 group">
                                                <div className="w-full h-full bg-gray-50 rounded-2xl flex items-center justify-center relative overflow-hidden">
                                                    <div className="w-56 h-56 p-2 bg-white rounded-xl shadow-inner flex items-center justify-center">
                                                        <img
                                                            src="/WhatsApp Image 2026-05-05 at 10.22.08 AM (2).jpeg"
                                                            alt="Payment QR Code"
                                                            className="w-full h-full object-contain rounded-lg"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black text-gray-950 mb-1 tracking-widest">BOXFOX.STORE@UPI</p>
                                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Authorized UPI Node</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-8 flex flex-col justify-center">
                                            <div className="space-y-6">
                                                <div className="space-y-3">
                                                    <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest ml-4">Authorized_TXN_ID</label>
                                                    <input
                                                        placeholder="ENTER TRANSACTION ID"
                                                        value={paymentFormData.transactionId}
                                                        onChange={(e) => setPaymentFormData({ ...paymentFormData, transactionId: e.target.value })}
                                                        className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-emerald-500 transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest ml-4">Sender_Name_Manifest</label>
                                                    <input
                                                        placeholder="NAME ON BANK ACCOUNT"
                                                        value={paymentFormData.senderName}
                                                        onChange={(e) => setPaymentFormData({ ...paymentFormData, senderName: e.target.value })}
                                                        className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-emerald-500 transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                                                <p className="text-[8px] font-bold text-amber-900 leading-relaxed uppercase tracking-tighter">
                                                    🔒 Note: Order Manifest will only be registered once Transaction ID and Sender Name are verified.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-6">
                                        <button
                                            onClick={() => setStep(2)}
                                            className="sm:flex-1 py-6 bg-gray-100 text-gray-950 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-gray-200 transition-all active:scale-[0.98]"
                                        >
                                            Modify Logistics
                                        </button>
                                        <button
                                            disabled={isSubmitting || !paymentFormData.transactionId || !paymentFormData.senderName}
                                            onClick={placeOrder}
                                            className="group relative sm:flex-[2] py-8 bg-gray-950 text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.4em] overflow-hidden transition-all hover:bg-emerald-500 disabled:opacity-30 active:scale-[0.98] shadow-2xl shadow-gray-200"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <span className="relative z-10 flex items-center justify-center gap-4">
                                                {isSubmitting ? 'Authenticating...' : 'Authorize & Submit Manifest'} <CheckCircle2 size={16} className="group-hover:scale-110 transition-transform" />
                                            </span>
                                        </button>
                                    </div>
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </div>

                    {/* Industrial Order Manifest (Summary) */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-32">
                            <div className="bg-gray-950 rounded-[3.5rem] p-8 md:p-12 text-white shadow-2xl shadow-gray-950/20 overflow-hidden relative">
                                {/* Decorative Industrial Elements */}
                                <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none select-none overflow-hidden">
                                    {[...Array(20)].map((_, i) => (
                                        <div key={i} className="whitespace-nowrap text-[8px] font-mono leading-none tracking-tighter uppercase">
                                            BOXFOX_LOGISTICS_MANIFEST_ID_00{i}_CONFIDENTIAL_REPORT_SCANNED_OK_STATUS_READY
                                        </div>
                                    ))}
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-10 pb-8 border-b border-white/10">
                                        <h3 className="text-3xl font-black tracking-tighter uppercase italic text-white">Manifest.</h3>
                                        <div className="px-3 py-1 bg-emerald-500 text-[8px] font-black uppercase tracking-widest rounded-lg animate-pulse">Live_Sync</div>
                                    </div>

                                    {/* Cart Items List */}
                                    <div className="space-y-8 mb-12 max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar-white">
                                        {cart.map(item => (
                                            <div key={item.id} className="flex gap-6 items-center group">
                                                <div className="w-20 h-20 bg-white/5 rounded-3xl overflow-hidden shrink-0 border border-white/10 p-2 group-hover:border-emerald-500/50 transition-all duration-500">
                                                    <img
                                                        src={item.customDesign?.textures?.front || item.customDesign?.textures?.top || Object.values(item.customDesign?.textures || {}).find(t => t) || item.img || item.image}
                                                        className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700"
                                                        alt=""
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-[10px] font-black text-white uppercase truncate tracking-tight mb-1">{item.name}</h4>
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                        <span className="text-[8px] font-black uppercase text-emerald-500/70">QTY: {item.quantity}</span>
                                                        <div className="w-1 h-1 bg-white/20 rounded-full" />
                                                        <span className="text-[8px] font-black uppercase text-white/90 truncate">REF_{String(item.id || '').slice(-6)}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="text-xs font-black text-white">₹{(parseFloat(String(typeof item.price === 'number' ? item.price : item.price || 0).replace(/[^0-9.]/g, '')) * item.quantity).toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Promo Code Input */}
                                    <div className="space-y-4 mb-10 p-6 bg-white/5 rounded-[2rem] border border-white/5">
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Coupon code</p>
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                placeholder="ENTER_CODE"
                                                value={couponInput}
                                                onChange={(e) => setCouponInput(e.target.value)}
                                                className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black tracking-[0.2em] outline-none focus:border-emerald-500 transition-all uppercase placeholder:text-white/10"
                                            />
                                            <button
                                                onClick={applyCoupon}
                                                disabled={isValidating || !couponInput}
                                                className="px-8 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-30 active:scale-95 shadow-lg shadow-emerald-500/20"
                                            >
                                                {isValidating ? '...' : 'Unlock'}
                                            </button>
                                        </div>
                                        {couponError && <p className="text-[8px] font-bold text-red-400 uppercase tracking-widest ml-4">{couponError}</p>}
                                        {appliedCoupon && (
                                            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl">
                                                <div className="flex items-center gap-3">
                                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                                    <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest">{appliedCoupon.code}_VERIFIED</span>
                                                </div>
                                                <button onClick={() => setAppliedCoupon(null)} className="text-[8px] font-black text-white/30 hover:text-red-400 uppercase tracking-widest">WIPE</button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Financial Data Grid */}
                                    <div className="space-y-4 pt-8 border-t border-white/10">
                                        <div className="flex items-center justify-between text-[9px] font-black text-white/90 uppercase tracking-[0.3em]">
                                            <span className="text-white/70">Base_Valuation</span>
                                            <span className="text-white">₹{cartTotal.toLocaleString('en-IN')}</span>
                                        </div>
                                        {appliedCoupon && (
                                            <div className="flex items-center justify-between text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em]">
                                                <span>Vault_Reduction</span>
                                                <span className="font-black">- ₹{appliedCoupon.discount.toLocaleString('en-IN')}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between text-[9px] font-black text-white/90 uppercase tracking-[0.3em]">
                                            <span className="text-white/70">Global_Transit</span>
                                            <span className="text-emerald-500 font-black italic">WAVIED_FOC</span>
                                        </div>
                                    </div>

                                    <div className="pt-8 flex items-end justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.4em]">Final_Authorized_Total</p>
                                            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none italic">
                                                ₹{finalTotal.toLocaleString('en-IN')}
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Trust Badge Footer */}
                        <div className="mt-8 flex items-center justify-center gap-6 opacity-30 grayscale">
                            <ShieldCheck size={24} />
                            <Package size={24} />
                            <CreditCard size={24} />
                            <CheckCircle2 size={24} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}


