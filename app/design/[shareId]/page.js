"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Ruler, Type, Palette, Layers, ShoppingCart, Copy, Check, ArrowLeft, RefreshCw } from "lucide-react";
import { BoxFacePreview, MiniBox3D } from "@/app/components/BoxPreview3D";
import Navbar from "@/app/components/Navbar";

const FACES = ["front", "back", "top", "bottom", "left", "right"];

export default function SharedDesignPage() {
    const { shareId } = useParams();
    const router = useRouter();
    const [design, setDesign] = useState(null);
    const [cdState, setCdState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetch(`/api/designs?shareId=${shareId}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) setError("Design not found or link has expired.");
                else {
                    setDesign(data);
                    setCdState(data.customDesign || {});
                }
                setLoading(false);
            })
            .catch(() => { setError("Failed to load design"); setLoading(false); });
    }, [shareId]);

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Design...</p>
                </div>
            </div>
        );
    }

    if (error || !design) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh] px-6">
                    <div className="text-center space-y-4 max-w-sm">
                        <Box size={40} className="text-gray-300 mx-auto" />
                        <h1 className="text-2xl font-black text-gray-950 uppercase tracking-tight">Design Not Found</h1>
                        <p className="text-sm text-gray-400 font-medium">This design link may have expired or been removed.</p>
                        <button onClick={() => router.push('/customize')} className="px-6 py-3 bg-gray-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all">
                            Create Your Own
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const cd = cdState || {};
    const dims = cd.dimensions || { l: 12, w: 8, h: 4 };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navbar />
            <main className="max-w-4xl mx-auto px-6 pt-[92px] pb-20">
                {/* Header */}
                <div className="mb-8">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-gray-950 transition-colors mb-4 text-sm font-bold">
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-1">Shared Design</p>
                            <h1 className="text-3xl font-black text-gray-950 uppercase tracking-tighter">{design.name}</h1>
                            <p className="text-xs font-bold text-gray-400 mt-1">
                                {dims.l} × {dims.w} × {dims.h} {cd.unit || "in"} · Created {new Date(design.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={copyLink} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                                {copied ? <><Check size={14} className="text-emerald-500" /> Copied!</> : <><Copy size={14} /> Copy Link</>}
                            </button>

                        </div>
                    </div>
                </div>

                {/* 3D Preview */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 mb-6">
                    <div className="flex flex-col items-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Interactive 3D Preview — Drag to Rotate</p>
                        <MiniBox3D customDesign={cd} size={200} />
                    </div>
                </div>

                {/* Per-Face Grid */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 mb-6">
                    <h2 className="text-sm font-black text-gray-950 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Layers size={16} className="text-emerald-500" /> Face Previews
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {FACES.map(face => {
                            const fw = ["left", "right"].includes(face) ? dims.w : dims.l;
                            const fh = ["top", "bottom"].includes(face) ? dims.w : dims.h;
                            return (
                                <div key={face} className="space-y-2">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">{face}</p>
                                    <div style={{ paddingBottom: `${(fh / fw) * 100}%`, position: "relative" }}>
                                        <div style={{ position: "absolute", inset: 0, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,0.06)" }}>
                                            <BoxFacePreview
                                                face={face}
                                                textures={cd.textures}
                                                textureSettings={cd.textureSettings}
                                                colors={cd.colors}
                                                text={cd.text}
                                                textStyle={cd.textStyle}
                                                textColor={cd.textColor}
                                                textSettings={cd.textSettings}
                                                width="100%"
                                                height="100%"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-3 h-3 rounded-sm border border-gray-200" style={{ backgroundColor: cd.colors?.[face] || "#059669" }}></div>
                                        <span className="text-[8px] font-mono text-gray-400">{cd.colors?.[face] || "#059669"}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Design Specs */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8">
                    <h2 className="text-sm font-black text-gray-950 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Ruler size={16} className="text-blue-500" /> Specifications
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <SpecCard label="Length" value={`${dims.l} ${cd.unit || "in"}`} />
                        <SpecCard label="Width" value={`${dims.w} ${cd.unit || "in"}`} />
                        <SpecCard label="Height" value={`${dims.h} ${cd.unit || "in"}`} />
                        {cd.text && <SpecCard label="Custom Text" value={`"${cd.text}"`} />}
                        {cd.textStyle && <SpecCard label="Text Style" value={cd.textStyle} />}
                        {cd.textColor && <SpecCard label="Text Color" value={cd.textColor} />}
                    </div>
                </div>

                {/* PRODUCT FORMULATION */}
                <div className="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-xl space-y-6 mt-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <h3 className="text-sm font-black text-gray-950 uppercase tracking-widest flex items-center gap-2">
                            <Layers size={16} className="text-emerald-500" /> Product Formulation
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select GSM</label>
                        <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-gray-950">
                          {cd.selectedGSM || "300 GSM"}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Material</label>
                        <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-gray-950">
                          {cd.selectedMaterial || "SBS"}
                        </div>
                      </div>

                    </div>
                </div>

            </main>
        </div>
    );
}

function SpecCard({ label, value }) {
    return (
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-sm font-bold text-gray-950 truncate">{value}</p>
        </div>
    );
}
