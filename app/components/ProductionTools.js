"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { Download, Printer, QrCode, Scissors, RotateCw, FileText } from "lucide-react";

// ============================================================================
// 1. FLAT DIE-CUT LAYOUT — Cross-shaped box dieline
// ============================================================================
function DieCutLayout({ customDesign, orderId, size = 500 }) {
    const canvasRef = useRef(null);
    const [rendered, setRendered] = useState(false);
    const cd = customDesign || {};
    const dims = cd.dimensions || { l: 12, w: 8, h: 4 };

    // Scale factor to fit in the canvas
    // Die-cut cross layout: width = l + 2*w, height = 2*w + h (front in center)
    // Actually standard cross: width = l + 2*h, height = w + 2*h + w = 2w + 2h? No.
    // Standard box cross layout:
    //          [TOP]
    //  [LEFT] [FRONT] [RIGHT] [BACK]
    //         [BOTTOM]
    // Width = h + l + h + l = 2h + 2l ... no
    // Let me think: standard cross-shaped dieline:
    //          [TOP: l × w]
    //  [LEFT: h × h]  [FRONT: l × h]  [RIGHT: h × h]  [BACK: l × h]
    //         [BOTTOM: l × w]
    // Total width = h + l + h + l = 2l + 2h (if back is included to the right)
    // Total height = w + h + w = 2w + h
    // Actually simpler cross (most common):
    //              [TOP: l × w]
    //     [LEFT: w × h] [FRONT: l × h] [RIGHT: w × h]
    //              [BOTTOM: l × w]
    //              [BACK: l × h] (below bottom)
    // Total width = w + l + w = l + 2w
    // Total height = w + h + w + h = 2w + 2h

    const totalW = dims.l + 2 * dims.w;
    const totalH = 2 * dims.w + 2 * dims.h;
    const scale = Math.min((size - 40) / totalW, (size - 40) / totalH);

    const sL = dims.l * scale;
    const sW = dims.w * scale;
    const sH = dims.h * scale;

    const canvasW = Math.ceil(totalW * scale + 40);
    const canvasH = Math.ceil(totalH * scale + 40);

    // Positions of each face (x, y relative to canvas)
    const pad = 20;
    const facePositions = {
        top: { x: pad + sW, y: pad, w: sL, h: sW },
        left: { x: pad, y: pad + sW, w: sW, h: sH },
        front: { x: pad + sW, y: pad + sW, w: sL, h: sH },
        right: { x: pad + sW + sL, y: pad + sW, w: sW, h: sH },
        bottom: { x: pad + sW, y: pad + sW + sH, w: sL, h: sW },
        back: { x: pad + sW, y: pad + sW + sH + sW, w: sL, h: sH },
    };

    const loadImage = (url) => new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = url;
    });

    const renderDieCut = useCallback(async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        canvas.width = canvasW * 2; // 2x for hi-res
        canvas.height = canvasH * 2;
        ctx.scale(2, 2);

        // Background
        ctx.fillStyle = "#f8f9fa";
        ctx.fillRect(0, 0, canvasW, canvasH);

        const faces = ["top", "left", "front", "right", "bottom", "back"];

        for (const face of faces) {
            const pos = facePositions[face];
            const settings = cd.textureSettings?.[face] || { scale: 100, x: 50, y: 50 };
            const color = cd.colors?.[face] || "#059669";

            // Fill background color
            ctx.fillStyle = color;
            ctx.fillRect(pos.x, pos.y, pos.w, pos.h);

            // Draw texture if exists
            if (cd.textures?.[face]) {
                const img = await loadImage(cd.textures[face]);
                if (img) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(pos.x, pos.y, pos.w, pos.h);
                    ctx.clip();

                    const scaleFactor = settings.scale / 100;
                    const imgDisplayW = pos.w * scaleFactor;
                    const imgDisplayH = (img.height / img.width) * imgDisplayW;
                    const posX = pos.x + ((settings.x / 100) * (pos.w - imgDisplayW));
                    const posY = pos.y + ((settings.y / 100) * (pos.h - imgDisplayH));

                    ctx.drawImage(img, posX, posY, imgDisplayW, imgDisplayH);
                    ctx.restore();
                }
            }

            // Draw text on top face
            if (cd.text && face === "top") {
                const ts = cd.textSettings || { x: 50, y: 50, size: 20 };
                const fontSize = Math.max(6, ts.size * (pos.w / 200));
                ctx.fillStyle = cd.textColor || "#ffffff";
                ctx.font = `900 ${fontSize}px sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(cd.text, pos.x + (ts.x / 100) * pos.w, pos.y + (ts.y / 100) * pos.h);
            }

            // Face label
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            ctx.font = "bold 9px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(face.toUpperCase(), pos.x + pos.w / 2, pos.y + pos.h / 2);
        }

        // Draw fold lines (dashed)
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 1;

        // Horizontal fold lines
        const drawLine = (x1, y1, x2, y2) => {
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        };

        // Top/Front fold
        drawLine(pad + sW, pad + sW, pad + sW + sL, pad + sW);
        // Front/Bottom fold
        drawLine(pad + sW, pad + sW + sH, pad + sW + sL, pad + sW + sH);
        // Bottom/Back fold
        drawLine(pad + sW, pad + sW + sH + sW, pad + sW + sL, pad + sW + sH + sW);
        // Left/Front fold
        drawLine(pad + sW, pad + sW, pad + sW, pad + sW + sH);
        // Front/Right fold
        drawLine(pad + sW + sL, pad + sW, pad + sW + sL, pad + sW + sH);

        ctx.setLineDash([]);

        // Outer cut line (solid)
        ctx.strokeStyle = "#111827";
        ctx.lineWidth = 1.5;
        // Top outline
        ctx.strokeRect(facePositions.top.x, facePositions.top.y, facePositions.top.w, facePositions.top.h);
        // Left outline
        ctx.strokeRect(facePositions.left.x, facePositions.left.y, facePositions.left.w, facePositions.left.h);
        // Front outline
        ctx.strokeRect(facePositions.front.x, facePositions.front.y, facePositions.front.w, facePositions.front.h);
        // Right outline
        ctx.strokeRect(facePositions.right.x, facePositions.right.y, facePositions.right.w, facePositions.right.h);
        // Bottom outline
        ctx.strokeRect(facePositions.bottom.x, facePositions.bottom.y, facePositions.bottom.w, facePositions.bottom.h);
        // Back outline
        ctx.strokeRect(facePositions.back.x, facePositions.back.y, facePositions.back.w, facePositions.back.h);

        // Flap tabs (triangular glue tabs)
        ctx.fillStyle = "rgba(209,213,219,0.3)";
        ctx.strokeStyle = "#9ca3af";
        ctx.lineWidth = 0.5;
        ctx.setLineDash([3, 3]);
        const tabH = 12;
        // Left tab on front-left
        const drawTab = (x, y, w, side) => {
            ctx.beginPath();
            if (side === "left") {
                ctx.moveTo(x, y); ctx.lineTo(x - tabH, y + 6); ctx.lineTo(x - tabH, y + sH - 6); ctx.lineTo(x, y + sH);
            } else if (side === "right") {
                ctx.moveTo(x + w, y); ctx.lineTo(x + w + tabH, y + 6); ctx.lineTo(x + w + tabH, y + sH - 6); ctx.lineTo(x + w, y + sH);
            } else if (side === "top") {
                ctx.moveTo(x, y); ctx.lineTo(x + 6, y - tabH); ctx.lineTo(x + w - 6, y - tabH); ctx.lineTo(x + w, y);
            } else if (side === "bottom") {
                ctx.moveTo(x, y + sW); ctx.lineTo(x + 6, y + sW + tabH); ctx.lineTo(x + w - 6, y + sW + tabH); ctx.lineTo(x + w, y + sW);
            }
            ctx.fill(); ctx.stroke();
        };
        // Glue tabs on left of left face and right of right face
        drawTab(facePositions.left.x, facePositions.left.y, facePositions.left.w, "left");
        drawTab(facePositions.right.x, facePositions.right.y, facePositions.right.w, "right");
        // Tab on top of top
        drawTab(facePositions.top.x, facePositions.top.y, facePositions.top.w, "top");
        ctx.setLineDash([]);

        // Dimension labels
        ctx.fillStyle = "#6b7280";
        ctx.font = "bold 8px sans-serif";
        ctx.textAlign = "center";
        // Length label under front
        ctx.fillText(`${dims.l}${cd.unit || 'in'}`, facePositions.front.x + sL / 2, facePositions.front.y + sH + 12);
        // Height label to right of front
        ctx.save();
        ctx.translate(facePositions.front.x + sL + 12, facePositions.front.y + sH / 2);
        ctx.rotate(Math.PI / 2);
        ctx.fillText(`${dims.h}${cd.unit || 'in'}`, 0, 0);
        ctx.restore();
        // Width label above top
        ctx.fillText(`${dims.w}${cd.unit || 'in'}`, facePositions.top.x + sL / 2, facePositions.top.y - 6);

        setRendered(true);
    }, [cd, canvasW, canvasH]);

    useEffect(() => { renderDieCut(); }, [renderDieCut]);

    const downloadDieCut = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = `${(orderId || "boxfox").toString().replace(/[^a-zA-Z0-9_-]/g, "_")}_diecut_layout.png`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };

    return (
        <div className="space-y-4">
            <div className="relative bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-center overflow-auto" style={{ minHeight: canvasH + 20 }}>
                <canvas ref={canvasRef} style={{ width: canvasW, height: canvasH }} className="block" />
                {!rendered && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <RotateCw size={16} className="animate-spin text-gray-400" />
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-gray-900 inline-block"></span> Cut Line</span>
                    <span className="flex items-center gap-1"><span className="w-4 h-0.5 border-t-2 border-dashed border-red-500 inline-block"></span> Fold Line</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-200 border border-gray-300 rounded-sm inline-block"></span> Glue Tab</span>
                </div>
                <button onClick={downloadDieCut} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                    <Download size={12} /> Download PNG Preview
                </button>
                <button 
                    onClick={() => {
                        const { generateMailerDieLine } = require("@/lib/dieline-generator");
                        const svg = generateMailerDieLine(dims.l, dims.w, dims.h, cd.unit || 'in');
                        const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `BoxFox_Dieline_${orderId || 'Template'}_${dims.l}x${dims.w}x${dims.h}.svg`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-md shadow-orange-100"
                >
                    <Download size={12} /> Download SVG Template
                </button>
            </div>
        </div>
    );
}

// ============================================================================
// 2. QR CODE — Auto-generated order tracking QR
// ============================================================================
function OrderQRCode({ orderId, orderUrl, size = 180 }) {
    const canvasRef = useRef(null);
    const [qrReady, setQrReady] = useState(false);

    useEffect(() => {
        const generateQR = async () => {
            try {
                const QRCode = (await import("qrcode")).default;
                const url = orderUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/order-info/${orderId}`;
                await QRCode.toCanvas(canvasRef.current, url, {
                    width: size * 2,
                    margin: 2,
                    color: { dark: "#111827", light: "#ffffff" },
                    errorCorrectionLevel: "H",
                });
                setQrReady(true);
            } catch (e) {
                console.error("QR generation failed:", e);
            }
        };
        if (orderId) generateQR();
    }, [orderId, orderUrl, size]);

    const downloadQR = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Create a new canvas with branding
        const exportCanvas = document.createElement("canvas");
        const ctx = exportCanvas.getContext("2d");
        const border = 40;
        const labelH = 60;
        exportCanvas.width = size * 2 + border * 2;
        exportCanvas.height = size * 2 + border * 2 + labelH;

        // White background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        // Border
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, exportCanvas.width - 2, exportCanvas.height - 2);

        // QR code
        ctx.drawImage(canvas, border, border, size * 2, size * 2);

        // Label
        ctx.fillStyle = "#111827";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`BOXFOX · ${orderId}`, exportCanvas.width / 2, size * 2 + border + 30);

        ctx.fillStyle = "#9ca3af";
        ctx.font = "12px sans-serif";
        ctx.fillText("Scan for order details", exportCanvas.width / 2, size * 2 + border + 50);

        const a = document.createElement("a");
        a.href = exportCanvas.toDataURL("image/png");
        a.download = `${(orderId || "boxfox").toString().replace(/[^a-zA-Z0-9_-]/g, "_")}_qr.png`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <canvas ref={canvasRef} style={{ width: size, height: size }} className="block" />
            </div>
            {qrReady && (
                <>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center">
                        Order: {orderId}
                    </p>
                    <button onClick={downloadQR} className="flex items-center gap-2 px-4 py-2 bg-gray-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all">
                        <Download size={12} /> Download QR
                    </button>
                </>
            )}
        </div>
    );
}

// ============================================================================
// 3. PRINT-READY PDF EXPORT — All faces with crop marks and bleed
// ============================================================================
function PrintReadyPDFExport({ customDesign, orderId, orderData }) {
    const [isExporting, setIsExporting] = useState(false);

    const loadImage = (url) => new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = url;
    });

    const renderFaceToCanvas = async (face, width, height) => {
        const cd = customDesign;
        const canvas = document.createElement("canvas");
        const RES = 300; // 300 DPI equivalent
        const pxW = Math.round(width * RES / 25.4); // mm to px at 300dpi
        const pxH = Math.round(height * RES / 25.4);
        // Use fixed high-res: 1200px wide
        canvas.width = 1200;
        canvas.height = Math.round(1200 * (height / width));
        const ctx = canvas.getContext("2d");

        // Background color
        ctx.fillStyle = cd.colors?.[face] || "#059669";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Texture
        if (cd.textures?.[face]) {
            const img = await loadImage(cd.textures[face]);
            if (img) {
                const s = cd.textureSettings?.[face] || { scale: 100, x: 50, y: 50 };
                const scaleFactor = s.scale / 100;
                const imgDisplayW = canvas.width * scaleFactor;
                const imgDisplayH = (img.height / img.width) * imgDisplayW;
                const posX = (s.x / 100) * (canvas.width - imgDisplayW);
                const posY = (s.y / 100) * (canvas.height - imgDisplayH);
                ctx.drawImage(img, posX, posY, imgDisplayW, imgDisplayH);
            }
        }

        // Text
        if (cd.text && face === "top") {
            const ts = cd.textSettings || { x: 50, y: 50, size: 20 };
            const fontSize = Math.round(ts.size * (canvas.width / 200));
            ctx.fillStyle = cd.textColor || "#ffffff";
            ctx.font = `900 ${fontSize}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(cd.text, (ts.x / 100) * canvas.width, (ts.y / 100) * canvas.height);
        }

        return canvas;
    };

    const exportPDF = async () => {
        setIsExporting(true);
        try {
            const { jsPDF } = await import("jspdf");
            const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
            const cd = customDesign;
            const dims = cd.dimensions || { l: 12, w: 8, h: 4 };
            const unit = cd.unit || "in";

            const pageW = 210; // A4 width mm
            const pageH = 297; // A4 height mm
            const margin = 15;
            const bleed = 3; // 3mm bleed

            // Title page
            pdf.setFontSize(28);
            pdf.setFont("helvetica", "bold");
            pdf.text("BOXFOX", pageW / 2, 40, { align: "center" });
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            pdf.text("PRINT-READY PRODUCTION FILE", pageW / 2, 50, { align: "center" });

            pdf.setFontSize(12);
            pdf.setFont("helvetica", "bold");
            pdf.text(`Order: ${orderId}`, margin, 75);
            pdf.setFont("helvetica", "normal");
            pdf.text(`Date: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`, margin, 83);
            pdf.text(`Dimensions: ${dims.l} × ${dims.w} × ${dims.h} ${unit}`, margin, 91);
            if (orderData?.customer?.name) pdf.text(`Customer: ${orderData.customer.name}`, margin, 99);
            if (cd.text) pdf.text(`Custom Text: "${cd.text}" (${cd.textStyle}, ${cd.textColor})`, margin, 107);

            // Specifications table
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "bold");
            pdf.text("PRODUCTION SPECIFICATIONS", margin, 125);
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(9);

            const specs = [
                ["Bleed", `${bleed}mm all sides`],
                ["Resolution", "300 DPI equivalent"],
                ["Color Mode", "RGB (convert to CMYK for offset)"],
                ["Material", "Per order specification"],
                ["Finish", "As specified"],
            ];
            specs.forEach(([label, value], i) => {
                const y = 133 + i * 8;
                pdf.setFont("helvetica", "bold");
                pdf.text(label + ":", margin, y);
                pdf.setFont("helvetica", "normal");
                pdf.text(value, margin + 40, y);
            });

            // Color swatches
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(10);
            pdf.text("FACE COLORS", margin, 185);
            const faces = ["front", "back", "top", "bottom", "left", "right"];
            faces.forEach((face, i) => {
                const color = cd.colors?.[face] || "#059669";
                const x = margin + (i % 3) * 60;
                const y = 192 + Math.floor(i / 3) * 22;
                // Color swatch
                const hex = color.replace("#", "");
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                pdf.setFillColor(r, g, b);
                pdf.rect(x, y, 10, 10, "F");
                pdf.setDrawColor(200, 200, 200);
                pdf.rect(x, y, 10, 10, "S");
                pdf.setFontSize(8);
                pdf.setFont("helvetica", "bold");
                pdf.setTextColor(0, 0, 0);
                pdf.text(face.toUpperCase(), x + 13, y + 4);
                pdf.setFont("helvetica", "normal");
                pdf.text(color, x + 13, y + 9);
            });

            // Per-face pages with crop marks
            for (const face of faces) {
                pdf.addPage();

                const faceW = ["left", "right"].includes(face) ? dims.w : dims.l;
                const faceH = ["top", "bottom"].includes(face) ? dims.w : dims.h;

                // Header
                pdf.setFontSize(14);
                pdf.setFont("helvetica", "bold");
                pdf.setTextColor(0, 0, 0);
                pdf.text(`${face.toUpperCase()} FACE`, margin, 20);
                pdf.setFontSize(9);
                pdf.setFont("helvetica", "normal");
                pdf.text(`${faceW} × ${faceH} ${unit} · Bleed: ${bleed}mm · Order: ${orderId}`, margin, 28);

                // Render face
                const canvas = await renderFaceToCanvas(face, faceW, faceH);
                const imgData = canvas.toDataURL("image/jpeg", 0.95);

                // Calculate drawing area (fit in page with margins)
                const maxDrawW = pageW - margin * 2;
                const maxDrawH = pageH - 60; // Leave space for header
                const ratio = faceW / faceH;
                let drawW = maxDrawW;
                let drawH = drawW / ratio;
                if (drawH > maxDrawH) { drawH = maxDrawH; drawW = drawH * ratio; }

                const drawX = (pageW - drawW) / 2;
                const drawY = 40;

                // Bleed area (light gray border)
                pdf.setDrawColor(200, 200, 200);
                pdf.setLineWidth(0.3);
                pdf.rect(drawX - bleed, drawY - bleed, drawW + bleed * 2, drawH + bleed * 2, "S");

                // Face image
                pdf.addImage(imgData, "JPEG", drawX, drawY, drawW, drawH);

                // Crop marks
                const markLen = 8;
                pdf.setDrawColor(0, 0, 0);
                pdf.setLineWidth(0.25);
                // Top-left
                pdf.line(drawX - bleed - markLen, drawY, drawX - bleed - 1, drawY);
                pdf.line(drawX, drawY - bleed - markLen, drawX, drawY - bleed - 1);
                // Top-right
                pdf.line(drawX + drawW + bleed + 1, drawY, drawX + drawW + bleed + markLen, drawY);
                pdf.line(drawX + drawW, drawY - bleed - markLen, drawX + drawW, drawY - bleed - 1);
                // Bottom-left
                pdf.line(drawX - bleed - markLen, drawY + drawH, drawX - bleed - 1, drawY + drawH);
                pdf.line(drawX, drawY + drawH + bleed + 1, drawX, drawY + drawH + bleed + markLen);
                // Bottom-right
                pdf.line(drawX + drawW + bleed + 1, drawY + drawH, drawX + drawW + bleed + markLen, drawY + drawH);
                pdf.line(drawX + drawW, drawY + drawH + bleed + 1, drawX + drawW, drawY + drawH + bleed + markLen);

                // Color info footer
                const color = cd.colors?.[face] || "#059669";
                pdf.setFontSize(7);
                pdf.setTextColor(100, 100, 100);
                pdf.text(`Base Color: ${color} · Has Texture: ${cd.textures?.[face] ? "Yes" : "No"} · Scale: ${cd.textureSettings?.[face]?.scale || 100}%`, margin, drawY + drawH + bleed + markLen + 10);
            }

            // Save
            const safeName = (orderId || "boxfox").toString().replace(/[^a-zA-Z0-9_-]/g, "_");
            pdf.save(`${safeName}_print_ready.pdf`);
        } catch (e) {
            console.error("PDF export error:", e);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button
            onClick={exportPDF}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-200 disabled:opacity-50"
        >
            {isExporting ? (
                <><RotateCw size={14} className="animate-spin" /> Generating PDF...</>
            ) : (
                <><FileText size={14} /> Export Print-Ready PDF</>
            )}
        </button>
    );
}

export { DieCutLayout, OrderQRCode, PrintReadyPDFExport };
