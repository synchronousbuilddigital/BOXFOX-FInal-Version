"use client";
import React, { useState } from 'react';
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { RotateCcw, AlertCircle, CheckCircle, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ExchangePolicyPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        orderNumber: '',
        subject: '',
        contactNumber: '',
        reason: '',
        message: ''
    });

    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/exchange-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setSubmitted(true);
                setTimeout(() => {
                    setFormData({
                        name: '',
                        email: '',
                        orderNumber: '',
                        subject: '',
                        contactNumber: '',
                        reason: '',
                        message: ''
                    });
                    setSubmitted(false);
                }, 3000);
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Failed to submit request. Please try again.');
        }
    };

    const returnSteps = [
        {
            number: "01",
            title: "Fill the Form",
            desc: "Fill up the form below with your order number. It's on the shipping label or on your order confirmation email/SMS."
        },
        {
            number: "02",
            title: "Describe the Reason",
            desc: "Describe the reason for return, and select your preferred refund method. Discount voucher reimbursement is immediate, refunds take up to 14 days."
        },
        {
            number: "03",
            title: "Ship the Product",
            desc: "Send returned products properly packed with order number and contact email to our address."
        },
        {
            number: "04",
            title: "Receive Refund",
            desc: "Once received and checked, we'll refund by the original payment method or provide a discount voucher."
        }
    ];

    return (
        <div className="min-h-screen bg-white text-gray-950 font-sans selection:bg-emerald-500 selection:text-white">
            <Navbar />

            <main className="pt-24 lg:pt-32">
                {/* Hero Header */}
                <section className="px-6 lg:px-12 py-20 bg-gray-50/50">
                    <div className="max-w-[1000px] mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                                <RotateCcw className="text-emerald-500" size={32} />
                            </div>
                            <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6 block">Customer_Care</span>
                            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-8">
                                Return & <br /> <span className="text-emerald-500 italic">Exchange Policy.</span>
                            </h1>
                            <p className="text-gray-500 text-lg font-medium italic max-w-2xl leading-relaxed">
                                We want you to be 100% satisfied with your BoxFox (IOPL) purchase. If we made a mistake or the item arrived defective, we will make things right.
                            </p>
                        </motion.div>
                    </div>
                </section>

                <section className="px-6 lg:px-12 py-24">
                    <div className="max-w-[900px] mx-auto">
                        <div className="space-y-16">

                            {/* Wrong or Damaged Items Section */}
                            <div className="bg-red-50 p-10 sm:p-14 rounded-[4rem] border border-red-100">
                                <div className="flex flex-col md:flex-row gap-10 items-center">
                                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-red-500 shadow-xl border border-red-100 shrink-0">
                                        <AlertCircle size={32} />
                                    </div>
                                    <div className="space-y-4 text-center md:text-left">
                                        <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-950 italic leading-none">Wrong or Damaged Items Received</h2>
                                        <p className="text-sm text-gray-600 font-bold uppercase tracking-tight leading-relaxed">
                                            If you received wrong or damaged items, we're here to help. Click the button below and we will make things right.
                                        </p>
                                        <div className="pt-4">
                                            <button
                                                onClick={() => document.getElementById('return-form').scrollIntoView({ behavior: 'smooth' })}
                                                className="inline-flex items-center gap-3 px-8 py-3 bg-red-500 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-xl"
                                            >
                                                Make It Right <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Unopened Package Section */}
                            <div className="space-y-8">
                                <div className="flex items-start gap-6">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                                        <CheckCircle size={24} />
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-950 italic">In Case of New Unopened Package</h2>
                                        <p className="text-sm font-medium text-gray-500 leading-relaxed uppercase tracking-tight">
                                            At BoxFox, we accept returns or exchanges within 14 days of receiving the product. No refunds will be made for amounts less than ₹2,000. A discount voucher will be created that you can apply to your next purchase.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Return Steps */}
                            <div className="space-y-8">
                                <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-950">To Process the Exchange or Return</h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {returnSteps.map((step, i) => (
                                        <motion.div
                                            key={step.number}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.1 }}
                                            className="p-8 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-lg hover:shadow-gray-100 transition-all"
                                        >
                                            <div className="text-5xl font-black text-emerald-500/20 mb-4">{step.number}</div>
                                            <h3 className="text-lg font-black uppercase tracking-tight text-gray-950 mb-3">{step.title}</h3>
                                            <p className="text-xs font-bold text-gray-500 leading-relaxed uppercase tracking-widest">
                                                {step.desc}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-gray-950 text-white p-10 sm:p-14 rounded-[3.5rem]">
                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0">
                                        <MapPin size={24} />
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-2xl font-black uppercase tracking-tighter text-emerald-400 italic mb-4">Ship Returns To</h3>
                                            <div className="space-y-2 text-sm font-bold leading-relaxed">
                                                <p>Indo Omakase Private Limited</p>
                                                <p>C172, BackSide, Ist Floor,</p>
                                                <p>Naraina Industrial Area,</p>
                                                <p>Phase I, New Delhi 110028</p>
                                            </div>
                                        </div>
                                        <p className="text-xs font-bold text-gray-300 leading-relaxed italic">
                                            Please ensure the package is properly packed with your order number and contact email clearly mentioned.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Policy Terms */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-950">Important Policy Terms</h2>
                                <div className="space-y-4">
                                    {[
                                        "If you return part of the products from the same order, the refund amount will be calculated based on the price of products returned, not the total products of the original order.",
                                        "The transport costs of the return will always be borne by the customer. We will not accept returns sent using cash on delivery.",
                                        "In no case will the amount paid for the delivery of your original order be returned once you have been charged.",
                                        "Under no circumstances can a personalized or customized product be returned."
                                    ].map((term, i) => (
                                        <div key={i} className="flex gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 shrink-0" />
                                            <p className="text-sm font-bold text-gray-600 leading-relaxed uppercase tracking-tight">
                                                {term}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Return Form Section */}
                            <div id="return-form" className="bg-emerald-50 p-10 sm:p-14 rounded-[4rem] border border-emerald-100">
                                <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-950 italic mb-10">Return / Exchange Request Form</h2>

                                {submitted ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center py-12"
                                    >
                                        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-xl">
                                            <CheckCircle size={32} />
                                        </div>
                                        <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-950 mb-3">Thank You!</h3>
                                        <p className="text-gray-600 font-bold uppercase tracking-tight">
                                            Your return/exchange request has been submitted successfully. Our team will contact you soon.
                                        </p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-widest text-gray-950 mb-3">Name *</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-950 placeholder:text-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                                    placeholder="Your name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-widest text-gray-950 mb-3">Email *</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-950 placeholder:text-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                                    placeholder="your@email.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-widest text-gray-950 mb-3">Order Number *</label>
                                                <input
                                                    type="text"
                                                    name="orderNumber"
                                                    value={formData.orderNumber}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-950 placeholder:text-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                                    placeholder="Find on shipping label"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-widest text-gray-950 mb-3">Contact Number *</label>
                                                <input
                                                    type="tel"
                                                    name="contactNumber"
                                                    value={formData.contactNumber}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-950 placeholder:text-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                                    placeholder="+91 XXXXX XXXXX"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-gray-950 mb-3">Reason for Return/Exchange *</label>
                                            <select
                                                name="reason"
                                                value={formData.reason}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-950 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                            >
                                                <option value="">Select a reason</option>
                                                <option value="damaged">Damaged/Defective Item</option>
                                                <option value="wrong">Wrong Item Received</option>
                                                <option value="mistake">Ordered by Mistake</option>
                                                <option value="quality">Quality Issues</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-gray-950 mb-3">Subject (Optional)</label>
                                            <input
                                                type="text"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-950 placeholder:text-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                                placeholder="Brief subject"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-gray-950 mb-3">Message *</label>
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                required
                                                rows="5"
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-950 placeholder:text-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                                                placeholder="Describe your issue in detail..."
                                            />
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <button
                                                type="submit"
                                                className="flex-1 px-8 py-4 bg-gray-950 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all shadow-lg active:scale-95"
                                            >
                                                Submit Request
                                            </button>
                                            <Link
                                                href="/admin/exchange-requests"
                                                className="flex-1 px-8 py-4 bg-emerald-500 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-950 transition-all shadow-lg active:scale-95 text-center inline-flex items-center justify-center"
                                            >
                                                View Submissions
                                            </Link>
                                        </div>
                                    </form>
                                )}
                            </div>

                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
