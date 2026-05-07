"use client";
import React, { useState } from 'react';
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Briefcase, HelpCircle, Users, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
    const contactSections = [
        {
            title: "Contact Directly",
            icon: <Mail className="text-emerald-500" />,
            email: "office.ggn@iopl.co",
            phone: "+91 99533 02917"
        },
        {
            title: "Customer Service",
            icon: <HelpCircle className="text-blue-500" />,
            email: "helpdesk@indoomakase.com",
            phone: "+91 11 4164 6259"
        },
        {
            title: "Work With Us",
            icon: <Briefcase className="text-orange-500" />,
            email: "career@iopl.co",
            phone: "Send your CV to our email"
        }
    ];

    const offices = [
        {
            city: "Head Office",
            address: "C172, BLOCK C, NARAINA INDUSTRIAL AREA, PHASE 1, NEW DELHI 110028",
            phone: "011 41646259"
        },
        {
            city: "Delhi Office",
            address: "C172, BLOCK C, NARAINA INDUSTRIAL AREA, PHASE 1, NEW DELHI 110028",
            phone: "011 41646259"
        }
    ];

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setSubmitted(true);
                setFormData({ name: '', email: '', subject: '', message: '' });
            }
        } catch (error) {
            console.error("Submission failed");
        }
        setSubmitting(false);
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="min-h-screen bg-white text-gray-950 font-sans selection:bg-emerald-500 selection:text-white">
            <Navbar />

            <main className="pt-24 lg:pt-32">
                {/* Hero Header */}
                <section className="px-6 lg:px-12 py-20 bg-gray-50/50">
                    <div className="max-w-[1400px] mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center"
                        >
                            <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6 block">Communication_Hub</span>
                            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-none mb-8">
                                Contact <span className="text-emerald-500 italic">Us.</span>
                            </h1>
                            <p className="text-gray-400 text-lg font-medium max-w-2xl italic">
                                Reach out for any questions, partnerships, or career opportunities. Our global support team is ready to assist you.
                            </p>
                        </motion.div>
                    </div>
                </section>

                <section className="px-6 lg:px-12 py-24">
                    <div className="max-w-[1400px] mx-auto grid lg:grid-cols-12 gap-20">
                        {/* Left: Contact Info */}
                        <div className="lg:col-span-5 space-y-16">
                            <div className="grid sm:grid-cols-2 gap-8">
                                {contactSections.map((s, i) => (
                                    <motion.div
                                        key={s.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-gray-100 transition-all group"
                                    >
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            {s.icon}
                                        </div>
                                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">{s.title}</h3>
                                        <a href={`mailto:${s.email}`} className="block text-sm font-black text-gray-950 hover:text-emerald-500 transition-colors mb-2 break-all">
                                            {s.email}
                                        </a>
                                        <p className="text-sm font-bold text-gray-500">{s.phone}</p>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="space-y-10">
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-950">Global Offices</h3>
                                <div className="space-y-8">
                                    {offices.map((office, i) => (
                                        <div key={i} className="flex gap-6 items-start">
                                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                                                <MapPin className="text-emerald-500" size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black uppercase tracking-widest text-emerald-600 mb-2">{office.city}</h4>
                                                <p className="text-sm font-bold text-gray-500 leading-relaxed mb-2 uppercase">{office.address}</p>
                                                <p className="text-sm font-black text-gray-950">PH: {office.phone}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Forms */}
                        <div className="lg:col-span-7 space-y-12">
                            {/* Get In Touch Form */}
                            <div className="bg-gray-50 p-10 sm:p-14 rounded-[4rem] border border-gray-100">
                                {submitted ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-20"
                                    >
                                        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-emerald-500/20">
                                            <CheckCircle2 size={40} />
                                        </div>
                                        <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-950 mb-4">Message Sent!</h2>
                                        <p className="text-gray-500 font-medium italic">Our team will get back to you within 24 standard business hours.</p>
                                        <button
                                            onClick={() => setSubmitted(false)}
                                            className="mt-10 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 underline"
                                        >
                                            Send another message
                                        </button>
                                    </motion.div>
                                ) : (
                                    <>
                                        <div className="mb-10">
                                            <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-950 mb-2">Get In Touch.</h2>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Direct Message Flow</p>
                                        </div>
                                        <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={handleSubmit}>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-5">Name*</label>
                                                <input
                                                    required
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full px-8 py-5 rounded-[2rem] bg-white border border-gray-100 focus:border-emerald-500 outline-none font-bold text-sm transition-all"
                                                    placeholder="Enter Full Name"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-5">Email*</label>
                                                <input
                                                    required
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="w-full px-8 py-5 rounded-[2rem] bg-white border border-gray-100 focus:border-emerald-500 outline-none font-bold text-sm transition-all"
                                                    placeholder="name@company.com"
                                                />
                                            </div>
                                            <div className="space-y-3 md:col-span-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-5">Subject (Optional)</label>
                                                <input
                                                    type="text"
                                                    name="subject"
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    className="w-full px-8 py-5 rounded-[2rem] bg-white border border-gray-100 focus:border-emerald-500 outline-none font-bold text-sm transition-all"
                                                    placeholder="How can we help?"
                                                />
                                            </div>
                                            <div className="space-y-3 md:col-span-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-5">Message</label>
                                                <textarea
                                                    required
                                                    rows={4}
                                                    name="message"
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    className="w-full px-8 py-6 rounded-[2.5rem] bg-white border border-gray-100 focus:border-emerald-500 outline-none font-bold text-sm transition-all resize-none"
                                                    placeholder="Describe your requirement..."
                                                ></textarea>
                                            </div>
                                            <div className="md:col-span-2 pt-4">
                                                <button
                                                    disabled={submitting}
                                                    type="submit"
                                                    className="w-full py-6 bg-gray-950 text-white rounded-[2rem] flex items-center justify-center gap-4 font-black text-xs uppercase tracking-[0.4em] hover:bg-emerald-500 transition-all shadow-xl active:scale-95 group disabled:opacity-50"
                                                >
                                                    {submitting ? "Sending..." : "Send Message"}
                                                    <Send size={18} className="group-hover:translate-x-2 transition-transform" />
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

        </div>
    );
}
