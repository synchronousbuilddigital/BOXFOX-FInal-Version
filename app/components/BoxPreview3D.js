"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";

// Renders a single box face with EXACT texture settings (scale, position, color, text)
function BoxFacePreview({ face, textures, textureSettings, colors, text, textStyle, textColor, textSettings, width, height, showLabel = true }) {
    const settings = textureSettings?.[face] || { scale: 100, x: 50, y: 50 };
    const textureUrl = textures?.[face];
    const bgColor = colors?.[face] || "#059669";

    const textStyleMap = {
        bold: { fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", textAlign: "center" },
        script: { fontFamily: "serif", fontStyle: "italic", letterSpacing: "0.05em", textAlign: "center" },
        minimal: { fontWeight: 300, letterSpacing: "0.5em", textTransform: "uppercase", textAlign: "center" },
        classic: { fontFamily: "serif", letterSpacing: "normal", textAlign: "center" },
        modern: { fontWeight: 200, letterSpacing: "0.2em", textAlign: "center" },
    };

    const showText = text && face === "top";
    const tSettings = textSettings || { x: 50, y: 50, size: 20 };

    return (
        <div style={{
            width, height, position: "relative", overflow: "hidden", borderRadius: 8,
            border: "1px solid rgba(0,0,0,0.08)",
            backgroundImage: textureUrl ? `url(${textureUrl})` : "none",
            backgroundColor: textureUrl ? bgColor : bgColor,
            backgroundSize: textureUrl ? `${settings.scale}%` : "cover",
            backgroundPosition: `${settings.x}% ${settings.y}%`,
            backgroundRepeat: "no-repeat",
        }}>
            {showText && (
                <div style={{
                    position: "absolute",
                    left: `${tSettings.x}%`, top: `${tSettings.y}%`,
                    transform: "translate(-50%, -50%)",
                    fontSize: Math.max(8, tSettings.size * ((parseFloat(width) || 200) / 200)),
                    color: textColor || "#fff",
                    ...(textStyleMap[textStyle] || textStyleMap.bold),
                    whiteSpace: "nowrap", pointerEvents: "none",
                    textShadow: "0 1px 4px rgba(0,0,0,0.3)",
                }}>{text}</div>
            )}
            {!textureUrl && showLabel && (
                <div style={{
                    position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.4)", textTransform: "uppercase",
                    letterSpacing: "0.3em",
                }}>{face}</div>
            )}
        </div>
    );
}

// Generates a canvas snapshot
function useFaceSnapshot() {
    const generate = useCallback(async (textureUrl, settings, faceW, faceH, bgColor, text, textStyle, textColor, textSettings, face) => {
        const canvas = document.createElement("canvas");
        const EXPORT_W = 1200;
        const EXPORT_H = Math.round(EXPORT_W * (faceH / faceW));
        canvas.width = EXPORT_W;
        canvas.height = EXPORT_H;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = bgColor || "#059669";
        ctx.fillRect(0, 0, EXPORT_W, EXPORT_H);

        if (textureUrl) {
            try {
                const img = await new Promise((resolve, reject) => {
                    const i = new Image();
                    i.crossOrigin = "anonymous";
                    i.onload = () => resolve(i);
                    i.onerror = reject;
                    i.src = textureUrl;
                });

                const s = settings || { scale: 100, x: 50, y: 50 };
                const scaleFactor = s.scale / 100;
                const imgDisplayW = EXPORT_W * scaleFactor;
                const imgDisplayH = (img.height / img.width) * imgDisplayW;
                const posX = ((s.x / 100) * (EXPORT_W - imgDisplayW));
                const posY = ((s.y / 100) * (EXPORT_H - imgDisplayH));

                ctx.drawImage(img, posX, posY, imgDisplayW, imgDisplayH);
            } catch (e) {}
        }

        if (text && face === "top") {
            const ts = textSettings || { x: 50, y: 50, size: 20 };
            const fontSize = Math.round(ts.size * (EXPORT_W / 200));
            ctx.fillStyle = textColor || "#ffffff";
            ctx.font = `900 ${fontSize}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(text, (ts.x / 100) * EXPORT_W, (ts.y / 100) * EXPORT_H);
        }

        return canvas.toDataURL("image/png");
    }, []);

    return { generate };
}

// Standard Mini Box 3D
function MiniBox3D({ customDesign, size = 160 }) {
    const { textures, textureSettings, colors, text, textStyle, textColor, textSettings, dimensions } = customDesign || {};
    const [rot, setRot] = useState({ x: -25, y: 35 });
    const dragging = useRef(false);

    const dims = dimensions || { l: 12, w: 8, h: 4 };
    const maxVal = Math.max(dims.l, dims.w, dims.h);
    const factor = size / maxVal;
    const L = dims.l * factor;
    const W = dims.w * factor;
    const H = dims.h * factor;

    const faceStyle = (face) => {
        const s = textureSettings?.[face] || { scale: 100, x: 50, y: 50 };
        return {
            backgroundImage: textures?.[face] ? `url(${textures[face]})` : "none",
            backgroundColor: colors?.[face] || "rgba(16,185,129,0.15)",
            backgroundSize: textures?.[face] ? `${s.scale}%` : "cover",
            backgroundPosition: `${s.x}% ${s.y}%`,
            backgroundRepeat: "no-repeat",
            position: "absolute",
            border: "1px solid rgba(0,0,0,0.08)",
            overflow: "hidden",
        };
    };

    return (
        <div style={{ width: size + 60, height: size + 60, perspective: 1800, userSelect: "none", touchAction: "none" }}
            onMouseDown={() => { dragging.current = true; }}
            onMouseMove={e => { if (dragging.current) setRot(r => ({ x: r.x - e.movementY * 0.5, y: r.y + e.movementX * 0.5 })); }}
            onMouseUp={() => { dragging.current = false; }}
            onMouseLeave={() => { dragging.current = false; }}
        >
            <div style={{
                width: L, height: H, margin: "auto", marginTop: (size + 60 - H) / 2,
                transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
                transformStyle: "preserve-3d", position: "relative",
                transitionProperty: dragging.current ? "none" : "transform",
                transitionDuration: dragging.current ? "0s" : "0.4s",
                transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
            }}>
                <div style={{ ...faceStyle("front"), width: L, height: H, transform: `translateZ(${W / 2}px)` }} />
                <div style={{ ...faceStyle("back"), width: L, height: H, transform: `rotateY(180deg) translateZ(${W / 2}px)` }} />
                <div style={{ ...faceStyle("right"), width: W, height: H, transform: `rotateY(90deg) translateZ(${L / 2}px)`, left: (L - W) / 2 }} />
                <div style={{ ...faceStyle("left"), width: W, height: H, transform: `rotateY(-90deg) translateZ(${L / 2}px)`, left: (L - W) / 2 }} />
                <div style={{ ...faceStyle("top"), width: L, height: W, transform: `rotateX(90deg) translateZ(${H / 2}px)`, top: (H - W) / 2 }} />
                <div style={{ ...faceStyle("bottom"), width: L, height: W, transform: `rotateX(-90deg) translateZ(${H / 2}px)`, top: (H - W) / 2 }} />
            </div>
        </div>
    );
}

function AnimatedBox3D({ dimensions, isOpen, size = 200 }) {
    const dims = dimensions || { l: 12, w: 8, h: 4 };
    const maxVal = Math.max(dims.l, dims.w, dims.h);
    // Reduce factor to 0.6 to ensure the OPEN lid fits in the div without clipping tabs
    const factor = (size * 0.6) / maxVal;
    
    const L = dims.l * factor; 
    const W = dims.w * factor; 
    const H = dims.h * factor; 
    
    const EMERALD = "#059669";
    const INTERIOR = "#10b981";

    const faceStyle = (isInterior = false) => ({
        position: "absolute",
        backgroundColor: isInterior ? INTERIOR : EMERALD,
        border: "0.5px solid rgba(255,255,255,0.3)",
        boxShadow: isInterior ? "inset 0 0 40px rgba(0,0,0,0.15)" : "inset 0 0 25px rgba(0,0,0,0.05)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    });

    return (
        <div style={{ width: size + 100, height: size + 100, perspective: 3000, display: "flex", alignItems: "center", justifyContent: "center", overflow: "visible" }}>
            <div style={{
                width: L, height: H,
                // Significant downward translation when open (80px) to clear the top tabs
                transform: `rotateX(-30deg) rotateY(40deg) ${isOpen ? "translateY(80px)" : ""}`,
                transformStyle: "preserve-3d",
                position: "relative",
                transitionProperty: "transform",
                transitionDuration: "1.6s",
                transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
            }}>
                {/* 1. STRUCTURAL BASE */}
                {/* Bottom Surfaces */}
                <div style={{ ...faceStyle(), width: L, height: W, transform: `rotateX(-90deg) translateZ(${H/2}px)`, top: (H-W)/2 }} />
                <div style={{ ...faceStyle(true), width: L - 2, height: W - 2, transform: `rotateX(90deg) translateZ(${-H/2 + 2}px)`, top: (H-W)/2 }} />
                
                {/* Fixed Walls */}
                <div style={{ ...faceStyle(), width: L, height: H, transform: `translateZ(${-W/2}px) rotateY(180deg)` }} />
                <div style={{ ...faceStyle(true), width: L - 1, height: H - 1, transform: `translateZ(${-W/2 + 2}px)` }} />
                
                <div style={{ ...faceStyle(), width: L, height: H, transform: `translateZ(${W/2}px)` }}>
                     <div className="text-[7px] font-black text-white/30 uppercase tracking-[0.4em]">BoxFox_Premium</div>
                </div>
                <div style={{ ...faceStyle(true), width: L - 1, height: H - 1, transform: `translateZ(${W/2 - 2}px) rotateY(180deg)` }} />

                {/* Side Walls */}
                {["left", "right"].map(side => (
                    <div key={side} style={{
                        position: "absolute", width: W, height: H,
                        transform: `rotateY(${side === "left" ? -90 : 90}deg) translateZ(${L/2}px)`,
                        left: (L-W)/2, transformStyle: "preserve-3d"
                    }}>
                        <div style={{ ...faceStyle(), width: W, height: H }} />
                        <div style={{ ...faceStyle(true), width: W - 1, height: H - 1, transform: "rotateY(180deg) translateZ(2px)" }} />
                    </div>
                ))}

                {/* 2. DUST FLAPS (Relocated deeper to avoid artifacts) */}
                {[-1, 1].map(d => (
                    <div key={d} style={{
                        position: "absolute", width: W/2, height: H - 10,
                        left: (L-W/2)/2,
                        transformOrigin: "center",
                        // Deeply recessed (L/2 - 10) to prevent clipping outside
                        transform: `rotateY(${d * 90}deg) translateZ(${L/2 - 10}px) rotateY(${isOpen ? d * 70 : 0}deg)`,
                        transitionProperty: "transform",
                        transitionDuration: "1.2s",
                        transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
                        transitionDelay: isOpen ? "0.3s" : "0s",
                        ...faceStyle(true),
                        backgroundColor: "#064e3b",
                        opacity: isOpen ? 1 : 0 // Hide when closed
                    }} />
                ))}

                {/* 3. KINEMATIC LID ASSEMBLY */}
                <div style={{
                    position: "absolute", width: L, height: W,
                    top: -W + (H/2),
                    transformOrigin: "bottom",
                    transformStyle: "preserve-3d",
                    transform: `translateZ(${-W/2}px) translateY(${-H/2}px) rotateX(${isOpen ? -155 : 0}deg) `,
                    transitionProperty: "transform",
                    transitionDuration: "1.6s",
                    transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
                    zIndex: 100
                }}>
                    {/* Top Panel Layers */}
                    <div style={{ ...faceStyle(), width: L, height: W, transform: "rotateX(-90deg) translateZ(${W/2}px)" }}>
                         <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] italic">BoxFox</div>
                    </div>
                    <div style={{ ...faceStyle(true), width: L, height: W, transform: "rotateX(-90deg) translateZ(${W/2 - 1.5}px) rotateY(180deg)" }} />

                    {/* Integrated Front-Tuck Transition */}
                    <div style={{
                        position: "absolute", width: L, height: H,
                        bottom: W, 
                        transformOrigin: "bottom",
                        transformStyle: "preserve-3d",
                        transform: `rotateX(${isOpen ? -85 : -90}deg)`,
                        transitionProperty: "transform",
                        transitionDuration: "1.3s",
                        transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
                        transitionDelay: isOpen ? "0.1s" : "0.4s",
                    }}>
                        <div style={{ ...faceStyle(), width: L, height: H }} />
                        <div style={{ ...faceStyle(true), width: L, height: H, transform: "translateZ(-1.5px) rotateY(180deg)" }} />
                        
                        {/* Tuck wings */}
                        {[-1, 1].map(d => (
                            <div key={d} style={{
                                ...faceStyle(true),
                                width: H/2.5, height: H/1.2,
                                left: d === -1 ? -H/5 : L - H/5,
                                top: H/8,
                                transformOrigin: d === -1 ? "right" : "left",
                                transform: `rotateY(${isOpen ? d * 35 : 0}deg)`,
                                transitionProperty: "transform",
                                transitionDuration: "1s",
                                transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
                                backgroundColor: "#064e3b"
                            }} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export { BoxFacePreview, MiniBox3D, AnimatedBox3D, useFaceSnapshot };
