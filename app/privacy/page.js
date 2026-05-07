"use client";
import React from 'react';
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Cookie, ExternalLink, Info } from "lucide-react";

export default function PrivacyPolicyPage() {
    const cookies = [
        { name: "CART", desc: "The association with your shopping cart." },
        { name: "CATEGORY_INFO", desc: "Stores the category info on the page, that allows to display pages more quickly." },
        { name: "COMPARE", desc: "The items that you have in the Compare Products list." },
        { name: "CURRENCY", desc: "Your preferred currency" },
        { name: "CUSTOMER", desc: "An encrypted version of your customer id with the store." },
        { name: "CUSTOMER_AUTH", desc: "An indicator if you are currently logged into the store." },
        { name: "CUSTOMER_INFO", desc: "An encrypted version of the customer group you belong to." },
        { name: "CUSTOMER_SEGMENT_IDS", desc: "Stores the Customer Segment ID" },
        { name: "EXTERNAL_NO_CACHE", desc: "A flag, which indicates whether caching is disabled or not." },
        { name: "FRONTEND", desc: "Your session ID on the server." },
        { name: "GUEST-VIEW", desc: "Allows guests to edit their orders." },
        { name: "LAST_CATEGORY", desc: "The last category you visited." },
        { name: "LAST_PRODUCT", desc: "The most recent product you have viewed." },
        { name: "NEWMESSAGE", desc: "Indicates whether a new message has been received." },
        { name: "NO_CACHE", desc: "Indicates whether it is allowed to use cache." },
        { name: "PERSISTENT_SHOPPING_CART", desc: "A link to information about your cart and viewing history if you have asked the site." },
        { name: "POLL", desc: "The ID of any polls you have recently voted in." },
        { name: "POLLN", desc: "Information on what polls you have voted on." },
        { name: "RECENTLYCOMPARED", desc: "The items that you have recently compared." },
        { name: "STF", desc: "Information on products you have emailed to friends." },
        { name: "STORE", desc: "The store view or language you have selected." },
        { name: "USER_ALLOWED_SAVE_COOKIE", desc: "Indicates whether a customer allowed to use cookies." },
        { name: "VIEWED_PRODUCT_IDS", desc: "The products that you have recently viewed." },
        { name: "WISHLIST", desc: "An encrypted list of products added to your Wishlist." },
        { name: "WISHLIST_CNT", desc: "The number of items in your Wishlist." },
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
                                <Shield className="text-emerald-500" size={32} />
                            </div>
                            <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6 block">Legal_Protocol</span>
                            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-8">
                                Privacy <span className="text-emerald-500 italic">Policy.</span>
                            </h1>
                            <p className="text-gray-500 text-lg font-medium italic max-w-2xl leading-relaxed">
                                Our commitment to protecting your data and ensuring complete transparency in how your personal information is managed.
                            </p>
                        </motion.div>
                    </div>
                </section>

                <section className="px-6 lg:px-12 py-24 pb-48">
                    <div className="max-w-[900px] mx-auto">

                        <div className="prose prose-emerald max-w-none space-y-16">

                            {/* Introduction */}
                            <div className="space-y-6">
                                <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-950 flex items-center gap-4">
                                    <span className="w-8 h-px bg-emerald-500" />
                                    Statement of Intent
                                </h2>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    This privacy policy sets out how BoxFox uses and protects any information that you give when you use this website.
                                    IOPL <span className="text-gray-950 font-bold italic">“Indo Omakase Pvt Ltd”</span> is committed to ensuring that your privacy is protected.
                                    Should we ask you to provide certain information by which you can be identified when using this website, then you can be assured that it will only be used in accordance with this privacy statement.
                                </p>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    IOPL “Indo Omakase Pvt Ltd” may change this policy from time to time by updating this page. You should check this page from time to time to ensure that you are happy with any changes.
                                </p>
                            </div>

                            {/* Data Collection */}
                            <div className="space-y-8 bg-gray-50 p-10 sm:p-14 rounded-[3rem] border border-gray-100">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-black uppercase tracking-widest text-gray-950 flex items-center gap-3">
                                        <Info className="text-emerald-500" size={20} />
                                        What we collect
                                    </h3>
                                    <p className="text-gray-500 font-medium text-sm">We may collect the following information:</p>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[
                                            "Full Name & Identification",
                                            "Contact info including Email Address",
                                            "Demographic info (Postcode, Preferences)",
                                            "Consumer surveys & Promotional data"
                                        ].map(item => (
                                            <li key={item} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-950 bg-white p-4 rounded-xl border border-gray-100 italic">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Data Usage */}
                            <div className="space-y-6">
                                <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-950 flex items-center gap-4">
                                    <span className="w-8 h-px bg-emerald-500" />
                                    Usage & Purpose
                                </h2>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    We require this information to understand your needs and provide you with a better service, and in particular for the following reasons:
                                </p>
                                <ul className="space-y-4 pt-4">
                                    {[
                                        "Internal record keeping and analytics.",
                                        "Improvement of our products, services, and UX.",
                                        "Periodical promotional emails about new products or special offers.",
                                        "Market research contact via email, phone, or mail to customize the website experience."
                                    ].map((text, i) => (
                                        <li key={i} className="flex gap-4 items-start group">
                                            <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                                                <span className="text-[10px] font-black">{i + 1}</span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-500 leading-relaxed uppercase tracking-tight">{text}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Security */}
                            <div className="bg-gray-950 text-white p-10 sm:p-14 rounded-[3.5rem] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
                                <div className="relative z-10 space-y-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400">
                                            <Lock size={24} />
                                        </div>
                                        <h2 className="text-2xl font-black uppercase tracking-tighter italic">Data Security</h2>
                                    </div>
                                    <p className="text-gray-400 font-medium leading-relaxed">
                                        We are committed to ensuring that your information is secure. In order to prevent unauthorised access or disclosure, we have put in place suitable physical, electronic and managerial procedures to safeguard and secure the information we collect online.
                                    </p>
                                </div>
                            </div>

                            {/* Cookies Section */}
                            <div className="space-y-8">
                                <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-950 flex items-center gap-4">
                                    <span className="w-8 h-px bg-emerald-500" />
                                    Cookie Protocol
                                </h2>
                                <div className="space-y-6 text-gray-600 font-medium leading-relaxed">
                                    <p>
                                        A cookie is a small file which asks permission to be placed on your computer’s hard drive. Once you agree, the file is added and the cookie helps analyse web traffic. Cookies allow web applications to respond to you as an individual.
                                    </p>
                                    <p>
                                        Overall, cookies help us provide you with a better website, by enabling us to monitor which pages you find useful and which you do not. You can choose to accept or decline cookies. This may prevent you from taking full advantage of the website.
                                    </p>
                                </div>

                                {/* Cookie Table */}
                                <div className="mt-12 overflow-hidden border border-gray-100 rounded-[2rem] shadow-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                                <th className="px-8 py-6 border-b border-gray-100">Cookie Name</th>
                                                <th className="px-8 py-6 border-b border-gray-100">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 bg-white">
                                            {cookies.map((cookie) => (
                                                <tr key={cookie.name} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="px-8 py-5 text-[11px] font-black text-gray-950 tracking-widest italic group-hover:text-emerald-600">
                                                        {cookie.name}
                                                    </td>
                                                    <td className="px-8 py-5 text-xs text-gray-500 font-bold uppercase tracking-tight">
                                                        {cookie.desc}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* External Links */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-950 flex items-center gap-4">
                                    <ExternalLink className="text-emerald-500" size={24} />
                                    External Connections
                                </h2>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    Our website may contain links to other websites of interest. Once you leave our site, please note that we do not have any control over that other website. Therefore, we cannot be responsible for the protection and privacy of any information which you provide whilst visiting such sites.
                                </p>
                            </div>

                            {/* Control Section */}
                            <div className="bg-emerald-50 p-10 sm:p-14 rounded-[3rem] border border-emerald-100">
                                <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-950 mb-6">Subject Control</h2>
                                <div className="space-y-6 text-sm text-gray-700 font-bold uppercase tracking-tight leading-relaxed">
                                    <p>
                                        You may choose to restrict the collection or use of your personal information in multiple ways, including form opt-outs.
                                    </p>
                                    <p>
                                        If you have previously agreed to us using your personal information for direct marketing purposes, you may change your mind at any time by writing to or emailing us at <a href="mailto:office.ggn@iopl.co" className="text-emerald-600 underline">office.ggn@iopl.co</a>.
                                    </p>
                                    <p>
                                        We will not sell, distribute or lease your personal information to third parties unless we have your permission or are required by law to do so.
                                    </p>
                                    <p className="pt-4 text-[10px] text-gray-400">
                                        Request details of personal information via mail: <br />
                                        <span className="text-gray-950 font-black">C172, BLOCK C, NARAINA INDUSTRIAL AREA, PHASE 1, NEW DELHI 110028</span>
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>
            </main>

        </div>
    );
}
