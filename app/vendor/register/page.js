"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Briefcase, User, Mail, Lock, Phone, CheckCircle2, ChevronRight, 
    ChevronLeft, RefreshCw, Upload, AlertCircle, FileText, Globe, 
    Landmark, ShieldCheck, MapPin, Receipt, Trash2, Check
} from "lucide-react";
import Navbar from "../../components/Navbar";

export default function VendorRegistration() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Basic / Credentials
        name: "", email: "", password: "", phone: "", businessName: "", vendorCategory: "", vendorSpecialties: [],
        
        // Step 1: Address Details
        vendorAddressLine1: "", vendorAddressLine2: "", vendorAddressLine3: "", vendorAddressLine4: "",
        vendorCity: "", vendorState: "", vendorPostalCode: "", vendorCountry: "India",
        vendorTelephone: "", vendorFax: "",

        // Step 2: Owner / Entity Details
        vendorContactOwnerName: "", vendorDesignation: "", vendorLegalEntity: "",
        vendorYearsInBusiness: "", vendorNoOfEmployees: "",
        vendorAssociatedWithEmployee: "No", vendorEmployeeDetails: "",

        // Step 3: Bank Details
        vendorBankName: "", vendorBankAccountNo: "", vendorBankBranch: "", vendorIfscCode: "",
        vendorPaymentTerms: "", vendorCoveredUnderMSMED: "No", vendorMsmedRegNo: "",

        // Step 4: Tax Details
        vendorPan: "", vendorTdsCategory: "N.A.", vendorGstCentral: "", vendorGstLocal: "",
        vendorServiceTaxRegNo: "", vendorCentralExciseNo: "", vendorAuthorisedDealer: "",

        // Step 5: Uploaded Documents URLs
        vendorDocAddressProof: "", vendorDocExciseReg: "", vendorDocPan: "", vendorDocVatReg: "",
        vendorDocServiceTax: "", vendorDocProofLegalEntity: "", vendorDocCancelledCheque: "",
        vendorDocOthers: ""
    });

    const [uploadingDocs, setUploadingDocs] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [validationErrors, setValidationErrors] = useState({});

    const steps = [
        { id: 1, label: "Company & Address", icon: MapPin },
        { id: 2, label: "Owner & Entity", icon: User },
        { id: 3, label: "Bank details", icon: Landmark },
        { id: 4, label: "Tax Info", icon: Receipt },
        { id: 5, label: "Documents", icon: ShieldCheck }
    ];

    const specialtyOptions = [
        "Pizza Box", "Cake Box", "Burger Box", "Food Box", "Wok Box", "CupCake", 
        "CupCake + Bento", "Gifting", "Hamper Box", "Platter", "Loaf", "Pastry", 
        "Chocolate Box", "Macaron", "Brownie", "Wrap Box", "Popcorn", "Carry Bag"
    ];

    const validateStep = (currentStep) => {
        const errors = {};
        if (currentStep === 1) {
            if (!formData.name) errors.name = "Contact Name is required";
            if (!formData.email) errors.email = "Email is required";
            else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Invalid email format";
            if (!formData.password) errors.password = "Password is required";
            else if (formData.password.length < 6) errors.password = "Password must be at least 6 characters";
            if (!formData.phone) errors.phone = "Phone number is required";
            if (!formData.businessName) errors.businessName = "Business Name is required";
            if (!formData.vendorCategory) errors.vendorCategory = "Category Type is required";
            if (!formData.vendorSpecialties || formData.vendorSpecialties.length === 0) {
                errors.vendorSpecialties = "At least one Specialization Category is required";
            } else if (formData.vendorSpecialties.length > 6) {
                errors.vendorSpecialties = "You can select up to 6 Specialization Categories";
            }
            if (!formData.vendorAddressLine1) errors.vendorAddressLine1 = "Address Line 1 is required";
            if (!formData.vendorCity) errors.vendorCity = "City Name is required";
            if (!formData.vendorState) errors.vendorState = "State is required";
            if (!formData.vendorPostalCode) errors.vendorPostalCode = "Postal Code is required";
        }
        if (currentStep === 2) {
            if (!formData.vendorContactOwnerName) errors.vendorContactOwnerName = "Owner/Contact Name is required";
            if (!formData.vendorDesignation) errors.vendorDesignation = "Designation is required";
            if (!formData.vendorLegalEntity) errors.vendorLegalEntity = "Legal Entity is required";
            if (formData.vendorAssociatedWithEmployee === "Yes" && !formData.vendorEmployeeDetails) {
                errors.vendorEmployeeDetails = "Please provide employee relationship details";
            }
        }
        if (currentStep === 3) {
            if (!formData.vendorBankName) errors.vendorBankName = "Bank Name is required";
            if (!formData.vendorBankAccountNo) errors.vendorBankAccountNo = "Bank Account No is required";
            if (!formData.vendorIfscCode) errors.vendorIfscCode = "IFSC Code is required";
            else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.vendorIfscCode.toUpperCase())) {
                errors.vendorIfscCode = "Invalid IFSC Code (e.g. SBIN0001234)";
            }
            if (!formData.vendorPaymentTerms) errors.vendorPaymentTerms = "Payment terms are required";
            if (formData.vendorCoveredUnderMSMED === "Yes" && !formData.vendorMsmedRegNo) {
                errors.vendorMsmedRegNo = "MSMED Registration number is required";
            }
        }
        if (currentStep === 4) {
            if (!formData.vendorPan) errors.vendorPan = "PAN number is required";
            else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.vendorPan.toUpperCase())) {
                errors.vendorPan = "Invalid Indian PAN format (e.g. ABCDE1234F)";
            }
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFileUpload = async (e, fieldName) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingDocs(prev => ({ ...prev, [fieldName]: true }));
        
        const fileFormData = new FormData();
        fileFormData.append("image", file);
        fileFormData.append("name", file.name);
        fileFormData.append("type", "document");

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: fileFormData
            });
            const data = await res.json();
            if (res.ok && data.url) {
                setFormData(prev => ({ ...prev, [fieldName]: data.url }));
            } else {
                alert(data.error || "Failed to upload document");
            }
        } catch (err) {
            console.error("Document upload error:", err);
            alert("An error occurred during file upload.");
        } finally {
            setUploadingDocs(prev => ({ ...prev, [fieldName]: false }));
        }
    };

    const handleRemoveFile = async (fieldName, fileUrl) => {
        if (!confirm("Are you sure you want to remove this uploaded document?")) return;
        
        try {
            await fetch("/api/upload", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: fileUrl })
            });
        } catch (err) {
            console.error("Failed to delete file:", err);
        }
        setFormData(prev => ({ ...prev, [fieldName]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep(step)) return;

        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/vendor-signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.error || "Registration failed. Please try again.");
            }
        } catch (err) {
            setError("Something went wrong. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white border border-gray-200 p-12 rounded-[3rem] max-w-xl shadow-2xl">
                <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20 text-white">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-4xl font-black uppercase tracking-tighter italic text-gray-955 mb-4">Application Received</h2>
                <p className="text-gray-500 font-bold leading-relaxed mb-8">
                    Your vendor onboarding file for <strong>{formData.businessName}</strong> has been submitted. 
                    Our administrator is reviewing your bank details, regulatory tax records, and supporting documents. 
                    You will receive an email confirmation once approved.
                </p>
                <a href="/" className="px-8 py-4 bg-gray-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all block text-center">Return to Home</a>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 text-gray-955 selection:bg-emerald-500/30 pb-20">
            <Navbar />
            <div className="max-w-[1400px] mx-auto px-6 py-32 grid lg:grid-cols-12 gap-16 items-start">
                
                {/* Left Side: Progress & Info */}
                <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-32">
                    <div>
                        <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4 italic">Corporate Onboarding</p>
                        <h1 className="text-5xl font-black text-gray-950 uppercase tracking-tighter italic mb-4">Vendor Opening</h1>
                        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                            Pernod Ricard India Compliance Partner Portal
                        </p>
                    </div>

                    {/* Progress Checklist */}
                    <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4 shadow-sm">
                        {steps.map((s) => {
                            const Icon = s.icon;
                            const isActive = step === s.id;
                            const isCompleted = step > s.id;
                            return (
                                <div key={s.id} className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
                                        isActive ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" :
                                        isCompleted ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-gray-100 border-gray-200 text-gray-400"
                                    }`}>
                                        {isCompleted ? <Check size={14} /> : <Icon size={14} />}
                                    </div>
                                    <div>
                                        <p className={`text-[10px] font-black uppercase tracking-wider ${isActive ? "text-gray-955" : "text-gray-400"}`}>{s.label}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Side: Form */}
                <motion.div 
                    layout
                    className="lg:col-span-8 bg-white border border-gray-200/80 p-8 lg:p-12 rounded-[3rem] shadow-xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
                    
                    <h3 className="text-2xl font-black text-gray-955 uppercase italic tracking-tight mb-8 border-b border-gray-100 pb-4">
                        Step {step} of 5: {steps[step - 1].label}
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* STEP 1: General & Address Details */}
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] italic border-b border-gray-100 pb-2">Credentials & Contact info</h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact/Representative Name *</label>
                                        <div className="relative">
                                            <User className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                                            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={`w-full pl-14 pr-6 py-4 bg-gray-50 border rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400 ${validationErrors.name ? 'border-red-500' : 'border-gray-200'}`} placeholder="Full Name" />
                                        </div>
                                        {validationErrors.name && <p className="text-red-500 text-[9px] font-bold uppercase">{validationErrors.name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Firm/Supplier Name *</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                                            <input type="text" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} className={`w-full pl-14 pr-6 py-4 bg-gray-50 border rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400 ${validationErrors.businessName ? 'border-red-500' : 'border-gray-200'}`} placeholder="Firm Name" />
                                        </div>
                                        {validationErrors.businessName && <p className="text-red-500 text-[9px] font-bold uppercase">{validationErrors.businessName}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Email *</label>
                                        <div className="relative">
                                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                                            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={`w-full pl-14 pr-6 py-4 bg-gray-50 border rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400 ${validationErrors.email ? 'border-red-500' : 'border-gray-200'}`} placeholder="partner@firm.com" />
                                        </div>
                                        {validationErrors.email && <p className="text-red-500 text-[9px] font-bold uppercase">{validationErrors.email}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password *</label>
                                        <div className="relative">
                                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                                            <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={`w-full pl-14 pr-6 py-4 bg-gray-50 border rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400 ${validationErrors.password ? 'border-red-500' : 'border-gray-200'}`} placeholder="••••••••" />
                                        </div>
                                        {validationErrors.password && <p className="text-red-500 text-[9px] font-bold uppercase">{validationErrors.password}</p>}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Vendor Category Type *</label>
                                        <select 
                                            value={formData.vendorCategory} 
                                            onChange={e => setFormData({...formData, vendorCategory: e.target.value})} 
                                            className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic appearance-none text-gray-955 ${validationErrors.vendorCategory ? 'border-red-500' : 'border-gray-200'}`}
                                        >
                                            <option value="" className="bg-white text-gray-955">Select Category Type</option>
                                            <option value="Packaging" className="bg-white text-gray-955">Box Manufacturing (Packaging)</option>
                                            <option value="Printing" className="bg-white text-gray-955">Printing & Branding</option>
                                            <option value="Logistics" className="bg-white text-gray-955">Logistics & Supply</option>
                                            <option value="Gifts" className="bg-white text-gray-955">Gift Sourcing</option>
                                        </select>
                                        {validationErrors.vendorCategory && <p className="text-red-500 text-[9px] font-bold uppercase">{validationErrors.vendorCategory}</p>}
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-1">Your Specialization Categories (Select up to 6) *</label>
                                            <p className="text-[9px] text-gray-450 font-bold uppercase tracking-wider ml-1">Choose up to 6 box types you manufacture or supply</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2.5">
                                            {specialtyOptions.map((cat) => {
                                                const isSelected = formData.vendorSpecialties?.includes(cat);
                                                return (
                                                    <button
                                                        key={cat}
                                                        type="button"
                                                        onClick={() => {
                                                            const current = formData.vendorSpecialties || [];
                                                            if (isSelected) {
                                                                setFormData({
                                                                    ...formData,
                                                                    vendorSpecialties: current.filter(c => c !== cat)
                                                                });
                                                            } else {
                                                                if (current.length >= 6) {
                                                                    alert("You can select a maximum of 6 Specialization Categories.");
                                                                    return;
                                                                }
                                                                setFormData({
                                                                    ...formData,
                                                                    vendorSpecialties: [...current, cat]
                                                                });
                                                            }
                                                        }}
                                                        className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border flex items-center gap-2 ${
                                                            isSelected 
                                                                ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm" 
                                                                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-100"
                                                        }`}
                                                    >
                                                        {cat}
                                                        {isSelected && <Check size={12} className="text-emerald-600" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {validationErrors.vendorSpecialties && <p className="text-red-500 text-[9px] font-bold uppercase">{validationErrors.vendorSpecialties}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile No. *</label>
                                        <div className="relative">
                                            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                                            <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={`w-full pl-14 pr-6 py-4 bg-gray-50 border rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400 ${validationErrors.phone ? 'border-red-500' : 'border-gray-200'}`} placeholder="+91 ..." />
                                        </div>
                                        {validationErrors.phone && <p className="text-red-500 text-[9px] font-bold uppercase">{validationErrors.phone}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Telephone No.</label>
                                        <input type="tel" value={formData.vendorTelephone} onChange={e => setFormData({...formData, vendorTelephone: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400" placeholder="Landline number" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fax No.</label>
                                        <input type="text" value={formData.vendorFax} onChange={e => setFormData({...formData, vendorFax: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400" placeholder="Fax No." />
                                    </div>
                                </div>

                                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] italic border-b border-gray-100 pb-2 pt-4">Registered Office Address</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Address Line 1 (Plot/Bldg No, Flat) *</label>
                                        <input type="text" value={formData.vendorAddressLine1} onChange={e => setFormData({...formData, vendorAddressLine1: e.target.value})} className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400 ${validationErrors.vendorAddressLine1 ? 'border-red-500' : 'border-gray-200'}`} placeholder="Address Line 1" />
                                        {validationErrors.vendorAddressLine1 && <p className="text-red-500 text-[9px] font-bold uppercase">{validationErrors.vendorAddressLine1}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Address Line 2 (Building Name, Road)</label>
                                        <input type="text" value={formData.vendorAddressLine2} onChange={e => setFormData({...formData, vendorAddressLine2: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400" placeholder="Address Line 2" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Address Line 3 (Near / Opposite)</label>
                                        <input type="text" value={formData.vendorAddressLine3} onChange={e => setFormData({...formData, vendorAddressLine3: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400" placeholder="Address Line 3" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Address Line 4 (Other Reference)</label>
                                        <input type="text" value={formData.vendorAddressLine4} onChange={e => setFormData({...formData, vendorAddressLine4: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400" placeholder="Address Line 4" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City Name *</label>
                                        <input type="text" value={formData.vendorCity} onChange={e => setFormData({...formData, vendorCity: e.target.value})} className={`w-full px-6 py-4 bg-gray-55 border rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400 ${validationErrors.vendorCity ? 'border-red-500' : 'border-gray-200'}`} placeholder="City Name" />
                                        {validationErrors.vendorCity && <p className="text-red-500 text-[9px] font-bold uppercase">{validationErrors.vendorCity}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">State *</label>
                                        <input type="text" value={formData.vendorState} onChange={e => setFormData({...formData, vendorState: e.target.value})} className={`w-full px-6 py-4 bg-gray-55 border rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400 ${validationErrors.vendorState ? 'border-red-500' : 'border-gray-200'}`} placeholder="State Name" />
                                        {validationErrors.vendorState && <p className="text-red-500 text-[9px] font-bold uppercase">{validationErrors.vendorState}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Postal Code *</label>
                                        <input type="text" value={formData.vendorPostalCode} onChange={e => setFormData({...formData, vendorPostalCode: e.target.value})} className={`w-full px-6 py-4 bg-gray-55 border rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400 ${validationErrors.vendorPostalCode ? 'border-red-500' : 'border-gray-200'}`} placeholder="Pin code" />
                                        {validationErrors.vendorPostalCode && <p className="text-red-500 text-[9px] font-bold uppercase">{validationErrors.vendorPostalCode}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Country</label>
                                        <input type="text" disabled value={formData.vendorCountry} className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-black italic text-gray-500" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: Owner & Entity Details */}
                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] italic border-b border-gray-100 pb-2">Corporate Identity & Owners</h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact/Owner Name *</label>
                                        <input type="text" value={formData.vendorContactOwnerName} onChange={e => setFormData({...formData, vendorContactOwnerName: e.target.value})} className={`w-full px-6 py-4 bg-gray-55 border rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400 ${validationErrors.vendorContactOwnerName ? 'border-red-500' : 'border-gray-200'}`} placeholder="Owner Name" />
                                        {validationErrors.vendorContactOwnerName && <p className="text-red-500 text-[9px] font-bold uppercase">{validationErrors.vendorContactOwnerName}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Designation *</label>
                                        <input type="text" value={formData.vendorDesignation} onChange={e => setFormData({...formData, vendorDesignation: e.target.value})} className={`w-full px-6 py-4 bg-gray-55 border rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400 ${validationErrors.vendorDesignation ? 'border-red-500' : 'border-gray-200'}`} placeholder="Designation" />
                                        {validationErrors.vendorDesignation && <p className="text-red-500 text-[9px] font-bold uppercase">{validationErrors.vendorDesignation}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Entity Type *</label>
                                        <select value={formData.vendorLegalEntity} onChange={e => setFormData({...formData, vendorLegalEntity: e.target.value})} className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic appearance-none text-gray-955 ${validationErrors.vendorLegalEntity ? 'border-red-500' : 'border-gray-200'}`}>
                                            <option value="" className="bg-white text-gray-955">Select Legal Entity</option>
                                            <option value="Public Limited" className="bg-white text-gray-955">Public Limited</option>
                                            <option value="Private Limited" className="bg-white text-gray-955">Private Limited</option>
                                            <option value="Partnership" className="bg-white text-gray-955">Partnership</option>
                                            <option value="Proprietor" className="bg-white text-gray-955">Proprietorship</option>
                                            <option value="HUF" className="bg-white text-gray-955">HUF</option>
                                            <option value="Others" className="bg-white text-gray-955">Others</option>
                                        </select>
                                        {validationErrors.vendorLegalEntity && <p className="text-red-500 text-[9px] font-bold uppercase">{validationErrors.vendorLegalEntity}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">No. of Years in Business</label>
                                        <input type="number" min="0" value={formData.vendorYearsInBusiness} onChange={e => setFormData({...formData, vendorYearsInBusiness: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400" placeholder="Years in business" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">No. of Employees</label>
                                        <input type="number" min="0" value={formData.vendorNoOfEmployees} onChange={e => setFormData({...formData, vendorNoOfEmployees: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400" placeholder="Total employees" />
                                    </div>
                                </div>

                                <div className="space-y-4 border border-gray-200 bg-gray-50 p-6 rounded-2xl">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <label className="text-xs font-black uppercase italic text-gray-700">Associated with any Pernod Ricard India employee?</label>
                                        <div className="flex gap-4">
                                            {["Yes", "No"].map((opt) => (
                                                <button key={opt} type="button" onClick={() => setFormData({...formData, vendorAssociatedWithEmployee: opt})} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                    formData.vendorAssociatedWithEmployee === opt ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/10" : "bg-white border-gray-200 text-gray-550 hover:bg-gray-100"
                                                }`}>
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {formData.vendorAssociatedWithEmployee === "Yes" && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Please provide employee name & relationship details *</label>
                                            <textarea rows="3" value={formData.vendorEmployeeDetails} onChange={e => setFormData({...formData, vendorEmployeeDetails: e.target.value})} className={`w-full px-6 py-4 bg-white border rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400 ${validationErrors.vendorEmployeeDetails ? 'border-red-500' : 'border-gray-200'}`} placeholder="Describe the association details..."></textarea>
                                            {validationErrors.vendorEmployeeDetails && <p className="text-red-500 text-[9px] font-bold uppercase">{validationErrors.vendorEmployeeDetails}</p>}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: Bank Details */}
                        {step === 3 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] italic border-b border-gray-100 pb-2">Financial Settlement Settings</h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bank Name *</label>
                                        <input type="text" value={formData.vendorBankName} onChange={e => setFormData({...formData, vendorBankName: e.target.value})} className={`w-full px-6 py-4 bg-gray-55 border rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400 ${validationErrors.vendorBankName ? 'border-red-500' : 'border-gray-200'}`} placeholder="Bank Name" />
                                        {validationErrors.vendorBankName && <p className="text-red-500 text-[9px] font-bold uppercase">{validationErrors.vendorBankName}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bank Account Number *</label>
                                        <input type="text" value={formData.vendorBankAccountNo} onChange={e => setFormData({...formData, vendorBankAccountNo: e.target.value})} className={`w-full px-6 py-4 bg-gray-55 border rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400 ${validationErrors.vendorBankAccountNo ? 'border-red-500' : 'border-gray-200'}`} placeholder="Account Number" />
                                        {validationErrors.vendorBankAccountNo && <p className="text-red-500 text-[9px] font-bold uppercase">{validationErrors.vendorBankAccountNo}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bank Branch Location</label>
                                        <input type="text" value={formData.vendorBankBranch} onChange={e => setFormData({...formData, vendorBankBranch: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400" placeholder="Branch Name / City" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">IFSC Code *</label>
                                        <input type="text" value={formData.vendorIfscCode} onChange={e => setFormData({...formData, vendorIfscCode: e.target.value})} className={`w-full px-6 py-4 bg-gray-55 border rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic uppercase text-gray-955 placeholder:text-gray-400 ${validationErrors.vendorIfscCode ? 'border-red-500' : 'border-gray-200'}`} placeholder="IFSC Code (e.g. SBIN0001234)" />
                                        {validationErrors.vendorIfscCode && <p className="text-red-500 text-[9px] font-bold uppercase">{validationErrors.vendorIfscCode}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payment Terms (Explanation) *</label>
                                    <select 
                                        value={formData.vendorPaymentTerms} 
                                        onChange={e => setFormData({...formData, vendorPaymentTerms: e.target.value})} 
                                        className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic appearance-none text-gray-955 ${validationErrors.vendorPaymentTerms ? 'border-red-500' : 'border-gray-200'}`}
                                    >
                                        <option value="" className="bg-white text-gray-955">Select Payment Terms</option>
                                        <option value="Net 15 Days" className="bg-white text-gray-955">Net 15 Days</option>
                                        <option value="Net 30 Days" className="bg-white text-gray-955">Net 30 Days</option>
                                        <option value="Net 45 Days" className="bg-white text-gray-955">Net 45 Days</option>
                                        <option value="After delivery" className="bg-white text-gray-955">After delivery</option>
                                        <option value="50% Advance" className="bg-white text-gray-955">50% Advance</option>
                                        <option value="50% Advance / 50% Net 30" className="bg-white text-gray-955">50% Advance / 50% Net 30</option>
                                    </select>
                                    {validationErrors.vendorPaymentTerms && <p className="text-red-500 text-[9px] font-bold uppercase">{validationErrors.vendorPaymentTerms}</p>}
                                </div>

                                <div className="space-y-4 border border-gray-200 bg-gray-50 p-6 rounded-2xl">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <label className="text-xs font-black uppercase italic text-gray-700">Whether covered under MSMED Act, 2006?</label>
                                        <div className="flex gap-4">
                                            {["Yes", "No"].map((opt) => (
                                                <button key={opt} type="button" onClick={() => setFormData({...formData, vendorCoveredUnderMSMED: opt})} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                    formData.vendorCoveredUnderMSMED === opt ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/10" : "bg-white border-gray-200 text-gray-550 hover:bg-gray-100"
                                                }`}>
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {formData.vendorCoveredUnderMSMED === "Yes" && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">MSMED Registration Number *</label>
                                            <input type="text" value={formData.vendorMsmedRegNo} onChange={e => setFormData({...formData, vendorMsmedRegNo: e.target.value})} className={`w-full px-6 py-4 bg-white border rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400 ${validationErrors.vendorMsmedRegNo ? 'border-red-500' : 'border-gray-200'}`} placeholder="MSME Reg No" />
                                            {validationErrors.vendorMsmedRegNo && <p className="text-red-500 text-[9px] font-bold uppercase">{validationErrors.vendorMsmedRegNo}</p>}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: Tax Regulatory Info */}
                        {step === 4 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] italic border-b border-gray-100 pb-2">Tax Registration Records</h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PAN Card Number *</label>
                                        <input type="text" value={formData.vendorPan} onChange={e => setFormData({...formData, vendorPan: e.target.value})} className={`w-full px-6 py-4 bg-gray-55 border rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic uppercase text-gray-955 placeholder:text-gray-400 ${validationErrors.vendorPan ? 'border-red-500' : 'border-gray-200'}`} placeholder="PAN Number (e.g. ABCDE1234F)" />
                                        {validationErrors.vendorPan && <p className="text-red-500 text-[9px] font-bold uppercase">{validationErrors.vendorPan}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">TDS Category *</label>
                                        <select value={formData.vendorTdsCategory} onChange={e => setFormData({...formData, vendorTdsCategory: e.target.value})} className="w-full px-6 py-4 bg-gray-55 border border-gray-200 rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic appearance-none text-gray-955">
                                            <option value="N.A." className="bg-white text-gray-955">N.A. / No TDS</option>
                                            <option value="Contractor" className="bg-white text-gray-955">Contractor (194C)</option>
                                            <option value="Professional/Adv" className="bg-white text-gray-955">Professional/Adv (194J)</option>
                                            <option value="Comm" className="bg-white text-gray-955">Commission / Brokerage (194H)</option>
                                            <option value="Rent" className="bg-white text-gray-955">Rent (194I)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">GST Registration (Central / IGST)</label>
                                        <input type="text" value={formData.vendorGstCentral} onChange={e => setFormData({...formData, vendorGstCentral: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic uppercase text-gray-955 placeholder:text-gray-400" placeholder="GSTIN (Central)" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">GST Registration (Local / SGST)</label>
                                        <input type="text" value={formData.vendorGstLocal} onChange={e => setFormData({...formData, vendorGstLocal: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic uppercase text-gray-955 placeholder:text-gray-400" placeholder="GSTIN (Local / NA)" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Service Tax Registration No.</label>
                                        <input type="text" value={formData.vendorServiceTaxRegNo} onChange={e => setFormData({...formData, vendorServiceTaxRegNo: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400" placeholder="Service Tax No." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Central Excise Registration No.</label>
                                        <input type="text" value={formData.vendorCentralExciseNo} onChange={e => setFormData({...formData, vendorCentralExciseNo: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400" placeholder="Central Excise No." />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Authorised Dealer / Distributor Details</label>
                                    <input type="text" value={formData.vendorAuthorisedDealer} onChange={e => setFormData({...formData, vendorAuthorisedDealer: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-emerald-500 text-xs font-black italic text-gray-955 placeholder:text-gray-400" placeholder="Provide details if applicable" />
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 5: Supporting Documents Upload */}
                        {step === 5 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] italic border-b border-gray-100 pb-2">Supporting Compliance Files</h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    
                                    {/* Document upload field template */}
                                    {[
                                        { key: "vendorDocAddressProof", label: "1. Address Proof (Utility bill / Rent Agreement)" },
                                        { key: "vendorDocExciseReg", label: "2. Excise Registration Certificate" },
                                        { key: "vendorDocPan", label: "3. PAN Card Document" },
                                        { key: "vendorDocVatReg", label: "4. VAT / GST Registration Certificate" },
                                        { key: "vendorDocServiceTax", label: "5. Service Tax Registration Document" },
                                        { key: "vendorDocProofLegalEntity", label: "6. Proof of Legal Entity (Incorp Cert / Partnership Deed)" },
                                        { key: "vendorDocCancelledCheque", label: "7. Cancelled Cheque Leaflet" },
                                        { key: "vendorDocOthers", label: "8. Other Declarations / Certificates" }
                                    ].map((doc) => (
                                        <div key={doc.key} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col justify-between min-h-[140px]">
                                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-700 mb-4">{doc.label}</p>
                                            
                                            {formData[doc.key] ? (
                                                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl">
                                                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-2">
                                                        <FileText size={12} /> Uploaded
                                                    </span>
                                                    <button type="button" onClick={() => handleRemoveFile(doc.key, formData[doc.key])} className="text-red-500 hover:text-red-600 transition-colors">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="cursor-pointer border border-dashed border-gray-200 hover:border-emerald-500/50 hover:bg-gray-150/50 transition-all rounded-xl p-4 flex flex-col items-center justify-center gap-2 bg-white">
                                                    {uploadingDocs[doc.key] ? (
                                                        <RefreshCw className="animate-spin text-emerald-500" size={18} />
                                                    ) : (
                                                        <>
                                                            <Upload size={18} className="text-gray-400" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Upload File (PDF/Image)</span>
                                                        </>
                                                    )}
                                                    <input 
                                                        type="file" 
                                                        disabled={uploadingDocs[doc.key]}
                                                        className="hidden" 
                                                        accept=".pdf,image/*" 
                                                        onChange={(e) => handleFileUpload(e, doc.key)} 
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    ))}

                                </div>

                                <div className="border-t border-gray-100 pt-6 mt-6">
                                    <p className="text-[10px] font-bold text-gray-450 uppercase leading-relaxed">
                                        DECLARATION: I do hereby declare that the information furnished above is true and correct to the best of my knowledge. Submitting fake details can lead to permanent vendor exclusion and legal processing.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* NAVIGATION BUTTONS */}
                        <div className="border-t border-gray-100 pt-8 mt-8 flex justify-between">
                            {step > 1 ? (
                                <button type="button" onClick={handleBack} className="px-8 py-4 bg-gray-50 border border-gray-250 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center gap-2 text-gray-650">
                                    <ChevronLeft size={14} /> Back
                                </button>
                            ) : <div />}

                            {error && <p className="text-red-500 text-[10px] font-black uppercase italic tracking-widest flex items-center gap-2"><AlertCircle size={14} /> {error}</p>}

                            {step < 5 ? (
                                <button type="button" onClick={handleNext} className="px-8 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-md shadow-emerald-500/10">
                                    Continue <ChevronRight size={14} />
                                </button>
                            ) : (
                                <button type="submit" disabled={loading} className="px-12 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all flex items-center gap-3 disabled:opacity-50 shadow-md shadow-emerald-500/10">
                                    {loading ? <RefreshCw className="animate-spin" size={14} /> : <>Submit File <ChevronRight size={14} /></>}
                                </button>
                            )}
                        </div>

                    </form>
                </motion.div>
            </div>
        </div>
    );
}
