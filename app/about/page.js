"use client";
import React from 'react';
import { motion } from "framer-motion";
import { ShieldCheck, Truck, Recycle, Award, CheckCircle2, Sparkles, Target, Users, TrendingUp, History, User } from "lucide-react";

export default function AboutPage() {
    const stats = [
        { label: 'Products for sale', value: '45K', icon: <TrendingUp className="text-emerald-500" /> },
        { label: 'Production Nodes Active', value: '1.8K', icon: <Users className="text-blue-500" /> },
        { label: 'Buyers Active on BoxFox', value: '10.5K', icon: <Sparkles className="text-orange-500" /> },
        { label: 'Annual gross sales', value: '₹1.64Cr', icon: <Award className="text-purple-500" /> },
    ];

    const timeline = [
        { year: '2010', month: 'December', title: 'Started a business journey', desc: 'Started a business journey without any investment.' },
        { year: '2012', month: 'May', title: 'Attracts first investor', desc: 'Attracts first investor, Corporation Bank.' },
        { year: '2014', month: 'December', title: 'Expansion', desc: 'Started from 100 sqft, now we are in 4000sq.ft. area, with more bigger visions.' },
        { year: '2016', month: 'February', title: 'Indian Clientele', desc: 'After giving so much of services to Japanese, now we expended our reach to Indian Clientele with more products and better services...' },
        { year: '2018', month: 'September', title: 'Setback & Growth', desc: 'This was a setback period, this situation changed us and our policies towards market, situation throw us back to 2010. We changed...' },
        { year: '2020', month: 'July', title: 'Strength & Solution', desc: 'Now we are bigger, stronger and aggressive. The global situation gave us time to rethink and innovate for the digital age.' },
        { year: '2024', month: 'January', title: 'The AI Forge Launch', desc: 'Launched our 3D AI-powered customization lab, revolutionizing how businesses design and order premium packaging online.' },
    ];

    const leaders = [
        { name: 'Jay Agarwal (RichieJay)', role: 'CEO Founder', image: 'https://i.pravatar.cc/300?u=jay' },
        { name: 'Richa Agarwal', role: 'Director', image: 'https://i.pravatar.cc/300?u=richa' },
    ];

    return (
        <div className="min-h-screen bg-white text-gray-950 font-sans selection:bg-emerald-500 selection:text-white">
            <main className="pt-20 lg:pt-24">                {/* Hero Section */}
                <section className="relative px-6 lg:px-12 py-10 sm:py-16 md:py-16 lg:py-24 overflow-hidden">
                    <div className="absolute top-0 right-0 w-[200px] md:w-[500px] h-[200px] md:h-[500px] bg-emerald-50/50 blur-[80px] md:blur-[120px] rounded-full -mr-12 -mt-12 md:-mr-24 md:-mt-24 pointer-events-none" />
                    <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center lg:text-left order-2 lg:order-1"
                        >
                            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                                <div className="w-6 sm:w-8 h-px bg-emerald-500" />
                                <span className="text-emerald-600 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em]">Indo Omakase Pvt. Ltd. | IOPL</span>
                            </div>
                            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-black tracking-tighter uppercase leading-[0.85] mb-6 sm:mb-8 text-gray-950">
                                Serving <br /> <span className="text-emerald-500 italic">India,</span> <br className="hidden md:block" /> Serving You.
                            </h1>
                            <p className="text-sm sm:text-base md:text-xl text-gray-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0 italic">
                                "We connect millions of buyers and sellers around the world, empowering people & creating economic opportunity for all."
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="relative order-1 lg:order-2"
                        >
                            <div className="aspect-square bg-white rounded-[2.5rem] sm:rounded-[4rem] border border-gray-100 overflow-hidden flex items-center justify-center shadow-2xl group">
                                <img
                                    src="/about.png"
                                    alt="BoxFox Presentation"
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                                <div className="absolute -bottom-6 -left-6 sm:-bottom-10 sm:-left-10 bg-white p-6 lg:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-xl border border-gray-200 max-w-[180px] sm:max-w-xs z-20">
                                    <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-4">
                                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white">
                                            <Award size={18} className="sm:w-[24px] sm:h-[24px]" />
                                        </div>
                                        <p className="text-[8px] sm:text-[10px] lg:text-xs font-black uppercase tracking-widest text-gray-400">Since_2010</p>
                                    </div>
                                    <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-950 leading-snug">ISO 9001:2008 Certified Company. Committed to high-quality Packaging.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Company Overview */}
                <section className="px-6 lg:px-12 py-16 md:py-24 bg-gray-50/50">
                    <div className="max-w-[1400px] mx-auto space-y-16 md:space-y-32">
                        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
                            <div className="lg:col-span-12">
                                <div className="max-w-4xl space-y-6 md:space-y-10">
                                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-gray-950">Our Journey & Expertise</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                                        <p className="text-sm sm:text-base md:text-lg text-gray-500 leading-relaxed">
                                            Indo Omakase Pvt Ltd from 2010 is actively committed to manufacturing and wholesaling high-quality Duplex Custom Designed and Printed Packaging Boxes. Our range includes LED Bulb, Mobile, Watch, Headphone, and FMCG packaging, among many others.
                                        </p>
                                        <p className="text-sm sm:text-base md:text-lg text-gray-500 leading-relaxed">
                                            We serve big corporates with products related to brand visibility like Acrylic Signage and Digital Medias. Our strength lies in deep product knowledge and advanced machinery, allowing us to deliver perfection in every project.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                            {stats.map((s, i) => (
                                <motion.div
                                    key={s.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-5 sm:p-8 md:p-10 bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200 transition-all group text-center lg:text-left"
                                >
                                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-50 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-6 mx-auto lg:mx-0 group-hover:scale-110 transition-transform">
                                        {React.cloneElement(s.icon, { size: 20, className: "sm:w-[24px] sm:h-[24px] " + s.icon.props.className })}
                                    </div>
                                    <p className="text-xl sm:text-3xl md:text-4xl font-black tracking-tighter text-gray-950 mb-1 md:mb-2 italic">{s.value}</p>
                                    <p className="text-[7px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">{s.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Timeline Section - Premium Redesign */}
                <section className="px-6 lg:px-12 py-16 sm:py-24 md:py-32 lg:py-48 bg-white relative overflow-hidden">
                    {/* Background Decorative Text */}
                    <div className="absolute top-20 left-0 w-full overflow-hidden pointer-events-none opacity-[0.04] sm:opacity-[0.06] select-none">
                        <h2 className="text-[20vw] font-black uppercase tracking-tighter leading-none whitespace-nowrap">
                            LEGACY • PERSISTENCE • GROWTH • VISION
                        </h2>
                    </div>

                    <div className="max-w-[1400px] mx-auto relative z-10">
                        <div className="flex flex-col mb-12 sm:mb-20 md:mb-32">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-8"
                            >
                                <div className="w-8 sm:w-12 h-1 bg-emerald-500 rounded-full" />
                                <span className="text-emerald-500 text-[8px] sm:text-[10px] md:text-xs font-black uppercase tracking-[0.5em]">The_Chronicle</span>
                            </motion.div>
                            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-black uppercase tracking-tighter text-gray-950 leading-[0.85]">
                                Our <br /> <span className="text-emerald-500 italic">Journey.</span>
                            </h2>
                        </div>

                        <div className="relative space-y-12 sm:space-y-16 md:space-y-40 lg:space-y-0 lg:pb-60 px-0 sm:px-4 md:px-0">
                            {/* Central Path for Desktop */}
                            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-100 -translate-x-1/2" />
                            {/* Mobile Path */}
                            <div className="lg:hidden absolute left-0 top-0 bottom-0 w-[2px] bg-emerald-100" />

                            {timeline.map((item, i) => (
                                <motion.div
                                    key={item.year}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8, delay: 0.1 }}
                                    className={`relative flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-0 ${i % 2 === 0 ? "lg:flex-row-reverse" : ""
                                        } pl-6 sm:pl-8 lg:pl-0`}
                                >
                                    {/* Year Pin - Desktop */}
                                    <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-20 h-20 bg-white border-4 border-gray-50 rounded-full items-center justify-center z-20 shadow-xl group">
                                        <div className="w-4 h-4 bg-emerald-500 rounded-full group-hover:scale-[3] transition-transform duration-500" />
                                    </div>
                                    {/* Mobile Pin */}
                                    <div className="lg:hidden absolute left-[-4px] top-4 sm:top-6 w-2.5 h-2.5 bg-emerald-500 rounded-full z-20" />

                                    {/* Content Card */}
                                    <div className="w-full lg:w-[45%]">
                                        <div className={`p-6 sm:p-10 md:p-14 bg-gray-50 rounded-[2rem] sm:rounded-[3rem] md:rounded-[4rem] border border-gray-100 hover:bg-white hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-700 relative overflow-hidden group`}>
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                                            <div className="relative z-10">
                                                <div className="flex items-end justify-between mb-4 sm:mb-8">
                                                    <div>
                                                        <p className="text-emerald-500 text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter italic leading-none">{item.year}</p>
                                                        <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mt-1 sm:mt-2">{item.month}</p>
                                                    </div>
                                                </div>
                                                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-gray-950 mb-3 sm:mb-6 uppercase tracking-tighter leading-tight italic">
                                                    {item.title}
                                                </h3>
                                                <p className="text-[10px] sm:text-xs md:text-sm font-bold text-gray-500 italic leading-relaxed uppercase tracking-tight">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Spacer for Desktop */}
                                    <div className="hidden lg:block w-[10%]" />
                                    <div className="hidden lg:block w-[45%]" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Infrastructure & Capability - Redefined */}
                <section className="px-6 lg:px-12 py-16 md:py-32 bg-gray-950 text-white rounded-[2rem] sm:rounded-[3rem] md:rounded-[4rem] mx-4 md:mx-6 lg:mx-12 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-emerald-500/5 blur-[80px] md:blur-[120px] rounded-full -mr-32 -mt-32 pointer-events-none" />
                    <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-24 items-center">
                        <div>
                            <span className="text-emerald-500 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em] mb-4 sm:mb-8 block text-center lg:text-left">Technology_&_Capability</span>
                            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-6 md:mb-10 text-white text-center lg:text-left">
                                Turning Ideas <br /> Into <span className="text-emerald-500 italic underline decoration-emerald-500/20 underline-offset-[8px] md:underline-offset-[12px]">Reality.</span>
                            </h2>
                            <p className="text-gray-300 text-xs sm:text-base md:text-lg font-medium leading-relaxed mb-8 md:mb-12 italic text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
                                We offer best services in printing, pre-press, finishing and binding using state-of-the art technology. Our designers ensure your vision is perfectly translated into a physical product while keeping costs optimized.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                                <div className="space-y-3 p-6 sm:p-8 bg-white/5 rounded-[1.5rem] sm:rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all group flex flex-col items-center lg:items-start text-center lg:text-left">
                                    <CheckCircle2 className="text-emerald-500 group-hover:scale-110 transition-transform" size={20} />
                                    <div>
                                        <h5 className="font-black uppercase tracking-widest text-[10px] md:text-xs text-white mb-1 md:mb-2">New Rigid Boxes</h5>
                                        <p className="text-[8px] text-emerald-400 uppercase tracking-widest font-black font-mono">Status: Active_Production</p>
                                    </div>
                                </div>
                                <div className="space-y-3 p-6 sm:p-8 bg-white/5 rounded-[1.5rem] sm:rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all group flex flex-col items-center lg:items-start text-center lg:text-left">
                                    <CheckCircle2 className="text-emerald-500 group-hover:scale-110 transition-transform" size={20} />
                                    <div>
                                        <h5 className="font-black uppercase tracking-widest text-[10px] md:text-xs text-white mb-1 md:mb-2">Custom Printing</h5>
                                        <p className="text-[8px] text-emerald-400 uppercase tracking-widest font-black font-mono">State-of-the-Art Solutions</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-6">
                            <div className="bg-white/5 border border-white/10 p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[3rem] backdrop-blur-md relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full translate-x-12 -translate-y-12" />
                                <p className="text-sm sm:text-base md:text-xl text-gray-200 italic font-medium leading-relaxed mb-6 sm:mb-10 text-center lg:text-left relative z-10">
                                    "IOPL believes in creating value to our customers. Our experts will help you select colors, stock, finishes, and every other aspect for your design."
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/10 shrink-0">
                                        <Target className="text-emerald-500" size={18} />
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <p className="text-[8px] sm:text-[10px] md:text-xs font-black uppercase tracking-widest text-white/90">Our Mission</p>
                                        <p className="text-[8px] text-emerald-400 uppercase tracking-[0.2em] font-black">Innovation_Value_Quality</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Leaders Section - Premium Grid */}
                <section className="px-6 lg:px-12 py-16 sm:py-24 md:py-48">
                    <div className="max-w-[1400px] mx-auto">
                        <div className="flex flex-col items-center text-center mb-12 sm:mb-16 md:mb-32">
                            <span className="text-emerald-500 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em] mb-4 sm:mb-8 block">The_Mindset</span>
                            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-black uppercase tracking-tighter text-gray-950 leading-[0.85]">
                                Meet Our <br /> <span className="text-gray-300">Leaders.</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-20 max-w-6xl mx-auto">
                            {[
                                { name: 'Jay Agarwal (RichieJay)', role: 'CEO Founder', image: '/jay.jpg' },
                                { name: 'Richa Agarwal', role: 'Director', image: '/richa.jpg' },
                            ].map((l, i) => (
                                <motion.div
                                    key={l.name}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.2 }}
                                    className="group relative"
                                >
                                    <div className="relative aspect-[4/5] rounded-[2rem] sm:rounded-[4rem] overflow-hidden bg-gray-100 border border-gray-100">
                                        <img
                                            src={l.image}
                                            alt={l.name}
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                                        />

                                        {/* Overlay Content */}
                                        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 bg-gradient-to-t from-gray-950/90 via-gray-950/40 to-transparent">
                                            <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                                                <span className="text-emerald-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-1 sm:mb-2 block">{l.role}</span>
                                                <h3 className="text-xl sm:text-2xl md:text-4xl font-black text-white italic tracking-tighter leading-none mb-3 sm:mb-4">{l.name}</h3>
                                                <div className="w-10 sm:w-12 h-1 bg-emerald-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Background Accent */}
                                    <div className="absolute -bottom-6 -right-6 w-24 h-24 sm:w-32 sm:h-32 bg-emerald-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-16 sm:mt-20 md:mt-40 text-center max-w-3xl mx-auto px-4">
                            <p className="text-sm sm:text-base md:text-xl text-gray-500 font-bold italic leading-relaxed uppercase tracking-tight">
                                "Our mentor Mr. Agarwal is the guiding force behind our rapid growth, encouraging us to bring out a perfect innovation in our offered range."
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
