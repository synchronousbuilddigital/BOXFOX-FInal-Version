"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import {
    ShieldCheck, FileText, CheckCircle2, AlertCircle, Loader2,
    ChevronDown, Building, Scale, DollarSign, Lock, Globe,
    Truck, RefreshCw, XCircle, Clock, BadgeCheck, Pen,
    ArrowRight, ScrollText, Info
} from "lucide-react";

const TAC_VERSION = "v1.0";
const EFFECTIVE_DATE = "June 29, 2025";
const COMPANY_NAME = "BoxFox Technologies Private Limited";

const clauses = [
    {
        id: 1,
        icon: Building,
        title: "Vendor Partnership & Onboarding",
        color: "emerald",
        content: [
            "This Vendor Partnership Agreement ('Agreement') is entered into between BoxFox Technologies Private Limited ('BoxFox', 'Company', 'Platform') and the registered vendor entity ('Vendor', 'Partner', 'You') upon successful registration and approval by the BoxFox administrative team.",
            "By electronically signing this Agreement, the Vendor confirms that they have full legal authority to enter into this binding contract on behalf of their organization, partnership, or sole proprietorship.",
            "Onboarding is subject to verification of all submitted documents. BoxFox reserves the right to request additional documentation at any time and to suspend the partnership if information is found to be inaccurate or misleading.",
            "The Vendor agrees to maintain the accuracy and completeness of their registered profile, including business address, bank details, GST/PAN information, and contact details. Material changes must be communicated to BoxFox within 7 (seven) business days."
        ]
    },
    {
        id: 2,
        icon: DollarSign,
        title: "Commission Structure & Revenue Sharing",
        color: "blue",
        content: [
            "BoxFox operates on a commission-based revenue sharing model. The Vendor's individual commission rate is determined solely by BoxFox at the time of account activation and is displayed in the Vendor's dashboard under 'Commission Rate'.",
            "The commission rate is deducted from each fulfilled order or project before the net payout is credited to the Vendor's BoxFox Wallet. For example, if the commission rate is 15%, the Vendor receives 85% of the total order value.",
            "BoxFox reserves the right to revise the commission rate for any Vendor with a minimum 14 (fourteen) days' written notice via email. The Vendor's continued use of the platform after the notice period constitutes acceptance of the new rate.",
            "All commission calculations are performed on the base order value, excluding platform-applied discounts, coupons, and applicable taxes (GST). BoxFox is responsible for collecting and remitting applicable indirect taxes.",
            "BoxFox does not guarantee a minimum order volume or revenue for any Vendor. Revenue is entirely contingent on customer demand and order allocation by the BoxFox fulfillment team."
        ]
    },
    {
        id: 3,
        icon: Clock,
        title: "Payment Terms & Wallet Withdrawals",
        color: "amber",
        content: [
            "Earnings from fulfilled orders and projects are credited to the Vendor's BoxFox Wallet within 3-5 (three to five) business days after the order is marked as 'Delivered' and the post-delivery hold period expires.",
            "Vendors may submit withdrawal requests for their available wallet balance. BoxFox processes withdrawal requests within 7-10 (seven to ten) business days via NEFT/RTGS to the registered bank account.",
            "A minimum withdrawal threshold of ₹500 (Indian Rupees Five Hundred) applies. Withdrawals below this amount are not processed.",
            "BoxFox is not responsible for delays caused by incorrect bank account information provided by the Vendor. It is the Vendor's sole responsibility to ensure bank details are accurate and up-to-date.",
            "TDS (Tax Deducted at Source) under applicable Income Tax provisions shall be deducted at the time of payment as per the TDS category declared by the Vendor during registration. BoxFox shall issue Form 16A / TDS certificates as required by law."
        ]
    },
    {
        id: 4,
        icon: ShieldCheck,
        title: "Quality Standards & Compliance",
        color: "purple",
        content: [
            "All products manufactured and supplied by the Vendor must meet the quality specifications agreed upon at the time of order allocation. BoxFox reserves the right to reject products that fail to meet these specifications.",
            "Vendors are required to maintain consistent quality standards across all orders. Repeated quality failures may result in order allocation reduction, commission rate revision, or termination of the partnership.",
            "The Vendor must comply with all applicable Indian laws and regulations, including the Bureau of Indian Standards (BIS), Food Safety and Standards Authority of India (FSSAI) for food packaging, and other relevant regulatory bodies.",
            "BoxFox may conduct periodic quality audits of Vendor operations, with reasonable prior notice. The Vendor agrees to cooperate with such audits and provide access to relevant production records.",
            "Vendors must have appropriate insurance coverage for their manufacturing operations. BoxFox shall not be held liable for damages arising from Vendor's manufacturing processes or product defects."
        ]
    },
    {
        id: 5,
        icon: Truck,
        title: "Fulfillment, Shipping & Logistics",
        color: "sky",
        content: [
            "The Vendor is responsible for fulfilling orders within the timelines specified in each order allocation. Default fulfillment timelines are communicated via the BoxFox Vendor Portal.",
            "For orders where the Vendor manages direct shipping, the Vendor must update tracking information (courier partner and tracking ID) on the BoxFox Portal within 24 hours of dispatch.",
            "BoxFox may provide shipping label templates and fulfillment guidelines. The Vendor is responsible for proper packaging to prevent damage during transit.",
            "In the event of shipment damage, loss, or delay attributable to the Vendor's packaging or dispatch, BoxFox may recover costs from the Vendor's wallet balance after providing due notice.",
            "Vendors must maintain a minimum fulfillment acceptance rate of 85%. Consistently declining order allocations without valid reason may lead to reduced allocation priority or account review."
        ]
    },
    {
        id: 6,
        icon: Lock,
        title: "Confidentiality & Non-Disclosure",
        color: "rose",
        content: [
            "The Vendor agrees to maintain strict confidentiality regarding all proprietary information, business processes, pricing structures, customer data, and technical specifications shared by BoxFox during the course of this partnership.",
            "Customer information (including names, addresses, contact details, and order history) is the exclusive property of BoxFox and may not be used, shared, or retained by the Vendor beyond what is strictly necessary for order fulfillment.",
            "The Vendor must not approach BoxFox customers directly for business outside the BoxFox platform. Circumventing the BoxFox platform to facilitate direct transactions is a material breach of this Agreement.",
            "Confidentiality obligations survive the termination of this Agreement for a period of 3 (three) years from the date of termination.",
            "The Vendor must implement reasonable data security measures to protect any BoxFox or customer information they have access to, and must promptly report any data breach or unauthorized access."
        ]
    },
    {
        id: 7,
        icon: Globe,
        title: "Intellectual Property Rights",
        color: "violet",
        content: [
            "BoxFox retains exclusive ownership of its platform, brand assets, logos, proprietary technology, and any custom design files shared with Vendors for manufacturing purposes.",
            "Custom designs, artworks, and specifications shared with Vendors are licensed solely for the purpose of fulfilling BoxFox orders and may not be reproduced, sold, or shared without explicit written authorization from BoxFox.",
            "Any improvements, modifications, or innovations developed by the Vendor specifically for BoxFox orders shall be disclosed to BoxFox, and BoxFox shall have a non-exclusive license to use such innovations in its platform.",
            "The Vendor must not reverse-engineer, copy, or replicate BoxFox's product designs for third-party customers or for sale under their own brand."
        ]
    },
    {
        id: 8,
        icon: Scale,
        title: "Dispute Resolution & Governing Law",
        color: "orange",
        content: [
            "Any dispute arising from or in connection with this Agreement shall first be addressed through good-faith negotiation between the parties. If unresolved within 30 (thirty) days, the dispute shall be submitted to mediation.",
            "If mediation fails, disputes shall be resolved through binding arbitration under the Arbitration and Conciliation Act, 1996 (India). The arbitration shall be conducted in New Delhi, India.",
            "This Agreement shall be governed by and construed in accordance with the laws of India. The courts of New Delhi shall have exclusive jurisdiction for any matter not subject to arbitration.",
            "The Vendor waives the right to participate in class-action lawsuits against BoxFox. All disputes must be brought on an individual basis.",
            "BoxFox's total liability to the Vendor under this Agreement shall not exceed the total commissions earned by the Vendor in the 3 (three) months preceding the event giving rise to the claim."
        ]
    },
    {
        id: 9,
        icon: RefreshCw,
        title: "Modification & Termination",
        color: "teal",
        content: [
            "BoxFox reserves the right to modify the terms of this Agreement at any time with 14 (fourteen) days' notice. Continued use of the platform after the effective date of changes constitutes acceptance.",
            "Either party may terminate this Agreement with 30 (thirty) days' written notice. BoxFox may terminate immediately for cause, including but not limited to: quality failures, fraud, breach of confidentiality, or regulatory non-compliance.",
            "Upon termination, all pending earnings shall be processed as per standard payment terms, minus any outstanding amounts owed to BoxFox. The Vendor's access to the portal will be disabled upon the effective termination date.",
            "BoxFox reserves the right to suspend a Vendor's account without notice in cases of suspected fraud, violation of customer trust, or risk to the BoxFox platform's integrity. A full review will be conducted promptly.",
            "Post-termination, the Vendor must return or destroy all BoxFox confidential information and certify such action in writing within 15 (fifteen) days of termination."
        ]
    },
    {
        id: 10,
        icon: BadgeCheck,
        title: "Representations & Warranties",
        color: "green",
        content: [
            "The Vendor represents and warrants that: (a) they are a legally registered entity or individual authorized to conduct business in India; (b) all information provided during registration is accurate and complete; (c) they possess all licenses, permits, and registrations required for their manufacturing operations.",
            "The Vendor warrants that their products are free from defects, comply with applicable standards, and do not infringe upon any third-party intellectual property rights.",
            "The Vendor warrants that they have not been convicted of any fraud, financial crime, or regulatory violation that would make their participation in the BoxFox network inappropriate.",
            "BoxFox provides the platform and services 'as-is' and does not warrant uninterrupted service. BoxFox shall not be liable for platform downtime, technical issues, or third-party service failures."
        ]
    },
    {
        id: 11,
        icon: Info,
        title: "Indemnification",
        color: "red",
        content: [
            "The Vendor agrees to indemnify, defend, and hold harmless BoxFox, its directors, officers, employees, and agents from any claims, damages, liabilities, costs, and expenses (including legal fees) arising from: (a) the Vendor's breach of this Agreement; (b) product defects or quality failures; (c) Vendor's negligence or misconduct; (d) infringement of third-party rights by the Vendor.",
            "BoxFox shall promptly notify the Vendor of any claim for which indemnification is sought. The Vendor shall have the right to control the defense of such claim, with BoxFox's cooperation.",
            "This indemnification obligation survives the termination of this Agreement."
        ]
    }
];

const colorMap = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "text-emerald-600", dot: "bg-emerald-500" },
    blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: "text-blue-600", dot: "bg-blue-500" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: "text-amber-600", dot: "bg-amber-500" },
    purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: "text-purple-600", dot: "bg-purple-500" },
    sky: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", icon: "text-sky-600", dot: "bg-sky-500" },
    rose: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", icon: "text-rose-600", dot: "bg-rose-500" },
    violet: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", icon: "text-violet-600", dot: "bg-violet-500" },
    orange: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: "text-orange-600", dot: "bg-orange-500" },
    teal: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", icon: "text-teal-600", dot: "bg-teal-500" },
    green: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: "text-green-600", dot: "bg-green-500" },
    red: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: "text-red-600", dot: "bg-red-500" },
};

export default function VendorTermsPage() {
    const { user, refreshUser } = useAuth();
    const router = useRouter();
    const esignRef = useRef(null);

    const [esignData, setEsignData] = useState(null);
    const [loadingStatus, setLoadingStatus] = useState(true);
    const [expandedClause, setExpandedClause] = useState(null);

    // E-sign form state
    const [esignName, setEsignName] = useState("");
    const [esignDesignation, setEsignDesignation] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [signing, setSigning] = useState(false);
    const [signError, setSignError] = useState("");
    const [signSuccess, setSignSuccess] = useState(false);
    const [signTimestamp, setSignTimestamp] = useState(null);
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch("/api/vendor/esign");
                const data = await res.json();
                if (data.success) {
                    setEsignData(data.esign);
                    // Pre-fill name if available
                    if (data.esign?.vendorName) setEsignName(data.esign.vendorName);
                    // Already signed — redirect to dashboard
                    if (data.esign?.agreed) {
                        router.replace("/vendor");
                        return;
                    }
                    // Not approved — redirect
                    if (data.esign?.vendorStatus !== 'approved') {
                        router.replace("/vendor");
                        return;
                    }
                }
            } catch (err) {
                console.error("Failed to fetch e-sign status:", err);
            } finally {
                setLoadingStatus(false);
            }
        };
        fetchStatus();
    }, [router]);

    // Detect scroll to bottom of terms section
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY + window.innerHeight;
            const docH = document.documentElement.scrollHeight;
            if (scrollY >= docH - 300) setHasScrolledToBottom(true);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSign = async (e) => {
        e.preventDefault();
        setSignError("");

        if (!esignName.trim() || esignName.trim().length < 3) {
            setSignError("Please enter your full legal name (minimum 3 characters).");
            return;
        }
        if (!agreed) {
            setSignError("You must check the agreement checkbox to proceed.");
            return;
        }

        setSigning(true);
        try {
            const res = await fetch("/api/vendor/esign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ esignName: esignName.trim(), esignDesignation: esignDesignation.trim(), agreed: true })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setSignSuccess(true);
                setSignTimestamp(data.timestamp);
                if (refreshUser) await refreshUser();
                setTimeout(() => router.push("/vendor"), 3000);
            } else {
                setSignError(data.error || "Failed to submit e-signature. Please try again.");
            }
        } catch (err) {
            console.error("E-sign error:", err);
            setSignError("A network error occurred. Please try again.");
        } finally {
            setSigning(false);
        }
    };

    if (loadingStatus) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="animate-spin text-emerald-500 mx-auto" size={40} />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Agreement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-emerald-950 text-white py-10 px-6 text-center sticky top-0 z-30 shadow-2xl">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black italic text-sm">B</div>
                        <span className="text-sm font-black tracking-widest uppercase text-emerald-400">BoxFox Vendor Network</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">Vendor Partnership Agreement</h1>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                        Version {TAC_VERSION} &nbsp;·&nbsp; Effective {EFFECTIVE_DATE} &nbsp;·&nbsp; {COMPANY_NAME}
                    </p>
                    {esignData?.commissionRate !== undefined && (
                        <div className="mt-4 inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-4 py-2">
                            <DollarSign size={14} className="text-emerald-400" />
                            <span className="text-emerald-300 text-xs font-black uppercase tracking-wider">
                                Your Commission Rate: <span className="text-emerald-400 text-base">{esignData.commissionRate}%</span>
                                {!esignData.commissionSetByAdmin && <span className="text-gray-500 ml-2">(To be confirmed by Admin)</span>}
                            </span>
                        </div>
                    )}
                    <div className="mt-3 flex items-center justify-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                        <ScrollText size={12} />
                        Please read all {clauses.length} clauses carefully before signing
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">

                {/* Intro Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4">
                    <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                    <div>
                        <p className="font-black text-amber-900 text-sm mb-1">Action Required: Electronic Signature</p>
                        <p className="text-amber-700 text-xs leading-relaxed">
                            Your BoxFox vendor account has been <strong>approved</strong>. To activate your dashboard and begin receiving orders, 
                            you must read and electronically sign this Vendor Partnership Agreement. This is a legally binding document. 
                            Once signed, you will gain full access to the BoxFox Vendor Portal.
                        </p>
                    </div>
                </div>

                {/* Clauses */}
                {clauses.map((clause, idx) => {
                    const colors = colorMap[clause.color] || colorMap.emerald;
                    const Icon = clause.icon;
                    const isExpanded = expandedClause === clause.id;

                    return (
                        <motion.div
                            key={clause.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                        >
                            <button
                                onClick={() => setExpandedClause(isExpanded ? null : clause.id)}
                                className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50/50 transition-colors"
                            >
                                <div className={`w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center shrink-0`}>
                                    <Icon size={18} className={colors.icon} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Section {clause.id}</p>
                                    <h3 className="text-sm font-black text-gray-900 tracking-tight">{clause.title}</h3>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${colors.text} ${colors.bg} border ${colors.border} px-2 py-0.5 rounded-full`}>
                                        {clause.content.length} clause{clause.content.length > 1 ? "s" : ""}
                                    </span>
                                    <ChevronDown
                                        size={16}
                                        className={`text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                                    />
                                </div>
                            </button>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className={`px-5 pb-5 pt-0 border-t ${colors.border} ${colors.bg}`}>
                                            <ol className="space-y-3 mt-4">
                                                {clause.content.map((item, i) => (
                                                    <li key={i} className="flex gap-3">
                                                        <span className={`w-5 h-5 rounded-full ${colors.dot} text-white font-black text-[9px] flex items-center justify-center shrink-0 mt-0.5`}>
                                                            {i + 1}
                                                        </span>
                                                        <p className={`text-xs leading-relaxed ${colors.text} font-medium`}>{item}</p>
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}

                {/* Expand All Hint */}
                <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Click each section to expand and read all clauses • Scroll to the bottom to sign
                </p>

                {/* E-SIGN FORM */}
                <motion.div
                    ref={esignRef}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-3xl border-2 border-emerald-200 shadow-xl overflow-hidden"
                    id="esign-section"
                >
                    {/* Form Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Pen size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black tracking-tight">Electronic Signature</h2>
                                <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest">Legally binding digital consent</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 md:p-8">
                        {signSuccess ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-10 space-y-5"
                            >
                                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 size={40} className="text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-950 tracking-tight">Agreement Signed!</h3>
                                    <p className="text-gray-500 text-sm mt-1">Welcome to the BoxFox Vendor Network</p>
                                </div>
                                {signTimestamp && (
                                    <div className="inline-block bg-gray-50 border border-gray-200 rounded-xl px-5 py-3">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Signed At</p>
                                        <p className="font-black text-gray-900 text-sm">{new Date(signTimestamp).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "medium" })}</p>
                                    </div>
                                )}
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                    <Loader2 size={12} className="animate-spin" /> Redirecting to your dashboard...
                                </p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSign} className="space-y-6">
                                {/* Signatory Info */}
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        Signatory Details
                                    </p>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        By typing your full legal name below, you are creating a legally binding electronic signature under the Information Technology Act, 2000 (India). This signature has the same legal effect as a handwritten signature.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Full Legal Name *</label>
                                        <input
                                            type="text"
                                            value={esignName}
                                            onChange={(e) => setEsignName(e.target.value)}
                                            placeholder="Enter your full legal name"
                                            required
                                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-emerald-500 transition-colors placeholder:text-gray-300 placeholder:font-normal"
                                        />
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">This will serve as your digital signature</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Designation / Title</label>
                                        <input
                                            type="text"
                                            value={esignDesignation}
                                            onChange={(e) => setEsignDesignation(e.target.value)}
                                            placeholder="e.g. Director, Managing Partner, Owner"
                                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-emerald-500 transition-colors placeholder:text-gray-300 placeholder:font-normal"
                                        />
                                    </div>
                                </div>

                                {/* Business + Date Preview */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Business Entity</p>
                                        <p className="text-sm font-black text-gray-900">{esignData?.businessName || "Your Business Name"}</p>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Agreement Version</p>
                                        <p className="text-sm font-black text-gray-900">{TAC_VERSION}</p>
                                    </div>
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Commission Rate</p>
                                        <p className="text-sm font-black text-emerald-700">{esignData?.commissionRate ?? 0}% Platform Commission</p>
                                    </div>
                                </div>

                                {/* Agreement Checkbox */}
                                <div
                                    onClick={() => setAgreed(!agreed)}
                                    className={`cursor-pointer flex items-start gap-4 p-5 rounded-2xl border-2 transition-all ${
                                        agreed ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"
                                    }`}
                                >
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                        agreed ? "bg-emerald-500 border-emerald-500" : "border-gray-300 bg-white"
                                    }`}>
                                        {agreed && <CheckCircle2 size={14} className="text-white" strokeWidth={3} />}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-black tracking-tight ${agreed ? "text-emerald-800" : "text-gray-700"}`}>
                                            I have fully read and understood this Vendor Partnership Agreement
                                        </p>
                                        <p className={`text-xs mt-1 leading-relaxed ${agreed ? "text-emerald-700" : "text-gray-500"}`}>
                                            I agree to all {clauses.length} sections of this Agreement, including the Commission Structure, Confidentiality, Quality Standards, and Dispute Resolution clauses. I confirm I have the legal authority to enter into this binding agreement on behalf of <strong>{esignData?.businessName || "my organization"}</strong>.
                                        </p>
                                    </div>
                                </div>

                                {/* Signature Preview */}
                                {esignName.trim().length >= 3 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="border-2 border-dashed border-emerald-300 rounded-2xl p-6 bg-emerald-50/50 text-center"
                                    >
                                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-3">Your E-Signature Preview</p>
                                        <p style={{ fontFamily: "'Georgia', serif", fontSize: "2rem" }} className="text-gray-800 italic leading-tight">
                                            {esignName.trim()}
                                        </p>
                                        {esignDesignation && (
                                            <p className="text-xs text-emerald-700 font-bold mt-1">{esignDesignation}</p>
                                        )}
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-2">
                                            {new Date().toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}
                                        </p>
                                    </motion.div>
                                )}

                                {/* Error */}
                                {signError && (
                                    <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-xl p-4">
                                        <XCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                                        <p className="text-rose-700 text-sm font-bold">{signError}</p>
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={signing || !agreed || esignName.trim().length < 3}
                                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-3 text-sm shadow-lg shadow-emerald-200 disabled:shadow-none"
                                >
                                    {signing ? (
                                        <><Loader2 size={16} className="animate-spin" /> Signing Agreement...</>
                                    ) : (
                                        <><Pen size={16} /> Sign & Activate My Vendor Account <ArrowRight size={16} /></>
                                    )}
                                </button>

                                <p className="text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                                    🔒 Your signature is encrypted and stored securely. IP address recorded for audit purposes.<br />
                                    This constitutes a valid electronic signature under the IT Act, 2000.
                                </p>
                            </form>
                        )}
                    </div>
                </motion.div>

                {/* Footer */}
                <div className="text-center space-y-2 pb-10">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{COMPANY_NAME}</p>
                    <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest">
                        Version {TAC_VERSION} · {EFFECTIVE_DATE} · For queries: vendors@boxfox.in
                    </p>
                </div>
            </div>
        </div>
    );
}
