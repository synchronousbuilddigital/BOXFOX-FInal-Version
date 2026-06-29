/**
 * BoxFox — Full Vendor Agreement PDF Generator & Email Sender
 * ============================================================
 * Generates a multi-page professional PDF containing:
 *   Page 1  : E-Sign Certificate (vendor details, signature, audit trail)
 *   Pages 2+ : Complete Terms & Conditions (all 11 clauses, full text)
 *
 * Usage: node scripts/send-esign-sample.js
 */

import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const RECIPIENT_EMAIL = "prasadshaswat9265@gmail.com";
const TAC_VERSION     = "v1.0";
const EFFECTIVE_DATE  = "June 29, 2025";
const COMPANY_NAME    = "BoxFox Technologies Private Limited";

const VENDOR_DATA = {
    businessName:     "SAMPLE VENDOR COMPANY PVT. LTD.",
    signatoryName:    "Shaswat Prasad",
    designation:      "Director / Authorised Signatory",
    email:            RECIPIENT_EMAIL,
    pan:              "ABCDE1234F",
    gstin:            "27ABCDE1234F1ZX",
    commissionRate:   "12%",
    agreementVersion: TAC_VERSION,
    signedAt:         new Date().toLocaleString("en-IN", {
        dateStyle: "full", timeStyle: "medium", timeZone: "Asia/Kolkata",
    }),
    ipAddress:        "183.82.XX.XX (Redacted for Sample)",
    legalFramework:   "IT Act, 2000 (India) — Section 2(1)(ta)",
    vendorId:         "BFVND-2025-" + Math.floor(100000 + Math.random() * 900000),
};

// ─── FULL T&C CONTENT ─────────────────────────────────────────────────────────
const TAC_CLAUSES = [
    {
        id: 1, title: "Vendor Partnership & Onboarding",
        content: [
            "This Vendor Partnership Agreement ('Agreement') is entered into between BoxFox Technologies Private Limited ('BoxFox', 'Company', 'Platform') and the registered vendor entity ('Vendor', 'Partner', 'You') upon successful registration and approval by the BoxFox administrative team.",
            "By electronically signing this Agreement, the Vendor confirms that they have full legal authority to enter into this binding contract on behalf of their organization, partnership, or sole proprietorship.",
            "Onboarding is subject to verification of all submitted documents. BoxFox reserves the right to request additional documentation at any time and to suspend the partnership if information is found to be inaccurate or misleading.",
            "The Vendor agrees to maintain the accuracy and completeness of their registered profile, including business address, bank details, GST/PAN information, and contact details. Material changes must be communicated to BoxFox within 7 (seven) business days.",
        ],
    },
    {
        id: 2, title: "Commission Structure & Revenue Sharing",
        content: [
            "BoxFox operates on a commission-based revenue sharing model. The Vendor's individual commission rate is determined solely by BoxFox at the time of account activation and is displayed in the Vendor's dashboard under 'Commission Rate'. The Vendor's current agreed rate is reflected in this Agreement.",
            "The commission rate is deducted from each fulfilled order or project before the net payout is credited to the Vendor's BoxFox Wallet. For example, if the commission rate is 15%, the Vendor receives 85% of the total order value.",
            "BoxFox reserves the right to revise the commission rate for any Vendor with a minimum 14 (fourteen) days' written notice via email. The Vendor's continued use of the platform after the notice period constitutes acceptance of the new rate.",
            "All commission calculations are performed on the base order value, excluding platform-applied discounts, coupons, and applicable taxes (GST). BoxFox is responsible for collecting and remitting applicable indirect taxes.",
            "BoxFox does not guarantee a minimum order volume or revenue for any Vendor. Revenue is entirely contingent on customer demand and order allocation by the BoxFox fulfillment team.",
        ],
    },
    {
        id: 3, title: "Payment Terms & Wallet Withdrawals",
        content: [
            "Earnings from fulfilled orders and projects are credited to the Vendor's BoxFox Wallet within 3-5 (three to five) business days after the order is marked as 'Delivered' and the post-delivery hold period expires.",
            "Vendors may submit withdrawal requests for their available wallet balance. BoxFox processes withdrawal requests within 7-10 (seven to ten) business days via NEFT/RTGS to the registered bank account.",
            "A minimum withdrawal threshold of Rs. 500 (Indian Rupees Five Hundred) applies. Withdrawals below this amount will not be processed.",
            "BoxFox is not responsible for delays caused by incorrect bank account information provided by the Vendor. It is the Vendor's sole responsibility to ensure bank details are accurate and up-to-date.",
            "TDS (Tax Deducted at Source) under applicable Income Tax provisions shall be deducted at the time of payment as per the TDS category declared by the Vendor during registration. BoxFox shall issue Form 16A / TDS certificates as required by law.",
        ],
    },
    {
        id: 4, title: "Quality Standards & Compliance",
        content: [
            "All products manufactured and supplied by the Vendor must meet the quality specifications agreed upon at the time of order allocation. BoxFox reserves the right to reject products that fail to meet these specifications.",
            "Vendors are required to maintain consistent quality standards across all orders. Repeated quality failures may result in order allocation reduction, commission rate revision, or termination of the partnership.",
            "The Vendor must comply with all applicable Indian laws and regulations, including the Bureau of Indian Standards (BIS), Food Safety and Standards Authority of India (FSSAI) for food packaging, and other relevant regulatory bodies.",
            "BoxFox may conduct periodic quality audits of Vendor operations, with reasonable prior notice. The Vendor agrees to cooperate with such audits and provide access to relevant production records.",
            "Vendors must have appropriate insurance coverage for their manufacturing operations. BoxFox shall not be held liable for damages arising from Vendor's manufacturing processes or product defects.",
        ],
    },
    {
        id: 5, title: "Fulfillment, Shipping & Logistics",
        content: [
            "The Vendor is responsible for fulfilling orders within the timelines specified in each order allocation. Default fulfillment timelines are communicated via the BoxFox Vendor Portal.",
            "For orders where the Vendor manages direct shipping, the Vendor must update tracking information (courier partner and tracking ID) on the BoxFox Portal within 24 hours of dispatch.",
            "BoxFox may provide shipping label templates and fulfillment guidelines. The Vendor is responsible for proper packaging to prevent damage during transit.",
            "In the event of shipment damage, loss, or delay attributable to the Vendor's packaging or dispatch, BoxFox may recover costs from the Vendor's wallet balance after providing due notice.",
            "Vendors must maintain a minimum fulfillment acceptance rate of 85%. Consistently declining order allocations without valid reason may lead to reduced allocation priority or account review.",
        ],
    },
    {
        id: 6, title: "Confidentiality & Non-Disclosure",
        content: [
            "The Vendor agrees to maintain strict confidentiality regarding all proprietary information, business processes, pricing structures, customer data, and technical specifications shared by BoxFox during the course of this partnership.",
            "Customer information (including names, addresses, contact details, and order history) is the exclusive property of BoxFox and may not be used, shared, or retained by the Vendor beyond what is strictly necessary for order fulfillment.",
            "The Vendor must not approach BoxFox customers directly for business outside the BoxFox platform. Circumventing the BoxFox platform to facilitate direct transactions is a material breach of this Agreement.",
            "Confidentiality obligations survive the termination of this Agreement for a period of 3 (three) years from the date of termination.",
            "The Vendor must implement reasonable data security measures to protect any BoxFox or customer information they have access to, and must promptly report any data breach or unauthorized access.",
        ],
    },
    {
        id: 7, title: "Intellectual Property Rights",
        content: [
            "BoxFox retains exclusive ownership of its platform, brand assets, logos, proprietary technology, and any custom design files shared with Vendors for manufacturing purposes.",
            "Custom designs, artworks, and specifications shared with Vendors are licensed solely for the purpose of fulfilling BoxFox orders and may not be reproduced, sold, or shared without explicit written authorization from BoxFox.",
            "Any improvements, modifications, or innovations developed by the Vendor specifically for BoxFox orders shall be disclosed to BoxFox, and BoxFox shall have a non-exclusive license to use such innovations in its platform.",
            "The Vendor must not reverse-engineer, copy, or replicate BoxFox's product designs for third-party customers or for sale under their own brand.",
        ],
    },
    {
        id: 8, title: "Dispute Resolution & Governing Law",
        content: [
            "Any dispute arising from or in connection with this Agreement shall first be addressed through good-faith negotiation between the parties. If unresolved within 30 (thirty) days, the dispute shall be submitted to mediation.",
            "If mediation fails, disputes shall be resolved through binding arbitration under the Arbitration and Conciliation Act, 1996 (India). The arbitration shall be conducted in New Delhi, India.",
            "This Agreement shall be governed by and construed in accordance with the laws of India. The courts of New Delhi shall have exclusive jurisdiction for any matter not subject to arbitration.",
            "The Vendor waives the right to participate in class-action lawsuits against BoxFox. All disputes must be brought on an individual basis.",
            "BoxFox's total liability to the Vendor under this Agreement shall not exceed the total commissions earned by the Vendor in the 3 (three) months preceding the event giving rise to the claim.",
        ],
    },
    {
        id: 9, title: "Modification & Termination",
        content: [
            "BoxFox reserves the right to modify the terms of this Agreement at any time with 14 (fourteen) days' notice. Continued use of the platform after the effective date of changes constitutes acceptance.",
            "Either party may terminate this Agreement with 30 (thirty) days' written notice. BoxFox may terminate immediately for cause, including but not limited to: quality failures, fraud, breach of confidentiality, or regulatory non-compliance.",
            "Upon termination, all pending earnings shall be processed as per standard payment terms, minus any outstanding amounts owed to BoxFox. The Vendor's access to the portal will be disabled upon the effective termination date.",
            "BoxFox reserves the right to suspend a Vendor's account without notice in cases of suspected fraud, violation of customer trust, or risk to the BoxFox platform's integrity. A full review will be conducted promptly.",
            "Post-termination, the Vendor must return or destroy all BoxFox confidential information and certify such action in writing within 15 (fifteen) days of termination.",
        ],
    },
    {
        id: 10, title: "Representations & Warranties",
        content: [
            "The Vendor represents and warrants that: (a) they are a legally registered entity or individual authorized to conduct business in India; (b) all information provided during registration is accurate and complete; (c) they possess all licenses, permits, and registrations required for their manufacturing operations.",
            "The Vendor warrants that their products are free from defects, comply with applicable standards, and do not infringe upon any third-party intellectual property rights.",
            "The Vendor warrants that they have not been convicted of any fraud, financial crime, or regulatory violation that would make their participation in the BoxFox network inappropriate.",
            "BoxFox provides the platform and services 'as-is' and does not warrant uninterrupted service. BoxFox shall not be liable for platform downtime, technical issues, or third-party service failures.",
        ],
    },
    {
        id: 11, title: "Indemnification",
        content: [
            "The Vendor agrees to indemnify, defend, and hold harmless BoxFox, its directors, officers, employees, and agents from any claims, damages, liabilities, costs, and expenses (including legal fees) arising from: (a) the Vendor's breach of this Agreement; (b) product defects or quality failures; (c) Vendor's negligence or misconduct; (d) infringement of third-party rights by the Vendor.",
            "BoxFox shall promptly notify the Vendor of any claim for which indemnification is sought. The Vendor shall have the right to control the defense of such claim, with BoxFox's cooperation.",
            "This indemnification obligation survives the termination of this Agreement indefinitely.",
        ],
    },
];

// ─── PDF TEXT WRAPPER ─────────────────────────────────────────────────────────
function wrapText(text, maxWidth, font, fontSize) {
    const words = text.split(" ");
    const lines = [];
    let current = "";
    for (const word of words) {
        const test = current ? current + " " + word : word;
        const w = font.widthOfTextAtSize(test, fontSize);
        if (w > maxWidth && current) {
            lines.push(current);
            current = word;
        } else {
            current = test;
        }
    }
    if (current) lines.push(current);
    return lines;
}

// ─── PAGE HELPER ─────────────────────────────────────────────────────────────
function addPageWithHeader(pdfDoc, fonts, colors, pageNum, totalPages) {
    const page = pdfDoc.addPage([595, 842]);
    const { fontBold, fontOblique } = fonts;
    const W = 595;

    // Thin top bar
    page.drawRectangle({ x: 0, y: 830, width: W, height: 12, color: colors.emeraldDark });
    page.drawText("BOXFOX TECHNOLOGIES PRIVATE LIMITED  |  VENDOR PARTNERSHIP AGREEMENT  |  " + TAC_VERSION, {
        x: 20, y: 832, size: 6, font: fontBold, color: colors.white,
    });
    // Bottom bar
    page.drawRectangle({ x: 0, y: 0, width: W, height: 20, color: rgb(0.06, 0.10, 0.14) });
    page.drawText(COMPANY_NAME + "  |  vendors@boxfox.in  |  www.boxfox.in", {
        x: 20, y: 7, size: 6, font: fontOblique, color: rgb(0.60, 0.75, 0.70),
    });
    page.drawText("Page " + pageNum + " of " + totalPages + "  |  CONFIDENTIAL", {
        x: W - 120, y: 7, size: 6, font: fontBold, color: rgb(0.60, 0.75, 0.70),
    });

    return page;
}

// ─── PDF GENERATOR ────────────────────────────────────────────────────────────
async function generateEsignPDF() {
    const pdfDoc      = await PDFDocument.create();
    const fontBold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const fontTimesBI = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);
    const fonts       = { fontBold, fontRegular, fontOblique, fontTimesBI };

    const colors = {
        emeraldDark:  rgb(0.039, 0.506, 0.373),
        emeraldLight: rgb(0.063, 0.725, 0.506),
        white:        rgb(1, 1, 1),
        darkGray:     rgb(0.08, 0.08, 0.08),
        medGray:      rgb(0.35, 0.35, 0.35),
        lightGray:    rgb(0.92, 0.93, 0.94),
        borderGray:   rgb(0.78, 0.80, 0.82),
        accentGold:   rgb(0.85, 0.68, 0.18),
        dark:         rgb(0.06, 0.10, 0.14),
    };

    // We'll calculate total pages = 1 (cert) + T&C pages (rendered dynamically)
    // First pass: count T&C pages needed
    const W = 595, M = 40, textW = W - M * 2, lineH = 13, clauseH = 12;
    let tacPageCount = 1;
    let curY = 780; // start Y on T&C page 1

    // Simulate layout to count pages
    for (const clause of TAC_CLAUSES) {
        const titleLines = 1;
        curY -= (titleLines * clauseH + 8);
        for (const para of clause.content) {
            const lines = wrapText(para, textW - 25, fontRegular, 9);
            curY -= (lines.length * lineH + 10);
        }
        curY -= 16; // gap between clauses
        if (curY < 80) { tacPageCount++; curY = 780; }
    }

    const TOTAL_PAGES = 1 + tacPageCount;

    // ══════════════════════════════════════════════════
    // PAGE 1: CERTIFICATE
    // ══════════════════════════════════════════════════
    const certPage = pdfDoc.addPage([595, 842]);
    const H = 842;

    certPage.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(0.97, 0.98, 0.99) });

    // Header
    certPage.drawRectangle({ x: 0, y: H - 90, width: W, height: 90, color: colors.emeraldDark });
    certPage.drawRectangle({ x: 0, y: H - 95, width: W, height: 5, color: colors.accentGold });
    certPage.drawText("BOXFOX TECHNOLOGIES PRIVATE LIMITED", { x: M, y: H - 40, size: 13, font: fontBold, color: colors.white });
    certPage.drawText("VENDOR NETWORK  |  OFFICIAL DOCUMENT  |  " + TAC_VERSION, { x: M, y: H - 57, size: 7.5, font: fontOblique, color: rgb(0.78, 0.95, 0.88) });
    certPage.drawRectangle({ x: W - 170, y: H - 76, width: 135, height: 22, color: colors.accentGold });
    certPage.drawText("CERTIFICATE OF E-SIGN", { x: W - 164, y: H - 67, size: 8, font: fontBold, color: colors.darkGray });

    // Title
    certPage.drawText("VENDOR PARTNERSHIP AGREEMENT", { x: M, y: H - 125, size: 18, font: fontBold, color: colors.darkGray });
    certPage.drawText("Electronic Signature Certificate  |  Effective: " + EFFECTIVE_DATE + "  |  Page 1 of " + TOTAL_PAGES, { x: M, y: H - 143, size: 7.5, font: fontOblique, color: colors.medGray });
    certPage.drawRectangle({ x: M, y: H - 155, width: W - M * 2, height: 1.5, color: colors.emeraldLight });
    certPage.drawText("This Certificate confirms that the Vendor below has electronically read, understood, and accepted the BoxFox Vendor", { x: M, y: H - 171, size: 8.5, font: fontRegular, color: colors.medGray });
    certPage.drawText("Partnership Agreement (Pages 2-" + TOTAL_PAGES + ") in full — constituting a legally binding electronic agreement.", { x: M, y: H - 183, size: 8.5, font: fontRegular, color: colors.medGray });

    // Vendor card
    const cardY = H - 348, cardH = 153;
    certPage.drawRectangle({ x: M - 5, y: cardY, width: W - M * 2 + 10, height: cardH, color: colors.white, borderColor: colors.borderGray, borderWidth: 1 });
    certPage.drawRectangle({ x: M - 5, y: cardY + cardH - 4, width: W - M * 2 + 10, height: 4, color: colors.emeraldLight });
    certPage.drawText("VENDOR IDENTIFICATION", { x: M + 5, y: cardY + cardH - 19, size: 7.5, font: fontBold, color: colors.emeraldDark });

    const c1 = M + 5, c2 = M + 265;
    const vRows = [
        ["Business Entity", VENDOR_DATA.businessName],
        ["Vendor ID",       VENDOR_DATA.vendorId],
        ["Email Address",   VENDOR_DATA.email],
        ["PAN Number",      VENDOR_DATA.pan],
        ["GSTIN",           VENDOR_DATA.gstin],
        ["Commission Rate", VENDOR_DATA.commissionRate],
    ];
    let rY = cardY + cardH - 40;
    vRows.forEach(([l, v], i) => {
        const x = i % 2 === 0 ? c1 : c2;
        if (i % 2 === 0 && i > 0) rY -= 30;
        certPage.drawText(l.toUpperCase() + ":", { x, y: rY, size: 6.5, font: fontBold, color: colors.medGray });
        const vv = v.length > 30 ? v.slice(0, 30) + "..." : v;
        certPage.drawText(vv, { x, y: rY - 12, size: 8.5, font: fontBold, color: colors.darkGray });
    });

    // Signatory card
    const sY = cardY - 122, sH = 112;
    certPage.drawRectangle({ x: M - 5, y: sY, width: W - M * 2 + 10, height: sH, color: rgb(0.95, 0.99, 0.97), borderColor: rgb(0.64, 0.89, 0.78), borderWidth: 1 });
    certPage.drawText("SIGNATORY DETAILS", { x: M + 5, y: sY + sH - 14, size: 7.5, font: fontBold, color: colors.emeraldDark });

    const lSig = [["Full Legal Name", VENDOR_DATA.signatoryName], ["Designation", VENDOR_DATA.designation], ["Agreement Version", VENDOR_DATA.agreementVersion]];
    const rSig = [["Date & Time", VENDOR_DATA.signedAt], ["IP Address", VENDOR_DATA.ipAddress], ["Legal Act", "IT Act, 2000 — Sec 2(1)(ta)"]];
    let lY2 = sY + sH - 33, rY2 = sY + sH - 33;
    lSig.forEach(([l, v]) => { certPage.drawText(l.toUpperCase() + ":", { x: c1, y: lY2, size: 6.5, font: fontBold, color: colors.medGray }); certPage.drawText(v.length > 30 ? v.slice(0, 30) + "..." : v, { x: c1, y: lY2 - 11, size: 8.5, font: fontBold, color: colors.darkGray }); lY2 -= 27; });
    rSig.forEach(([l, v]) => { certPage.drawText(l.toUpperCase() + ":", { x: c2, y: rY2, size: 6.5, font: fontBold, color: colors.medGray }); certPage.drawText(v.length > 30 ? v.slice(0, 30) + "..." : v, { x: c2, y: rY2 - 11, size: 8.5, font: fontBold, color: colors.darkGray }); rY2 -= 27; });

    // E-sign box
    const esY = sY - 80, esH = 70;
    certPage.drawRectangle({ x: M - 5, y: esY, width: W - M * 2 + 10, height: esH, color: colors.white, borderColor: rgb(0.64, 0.89, 0.78), borderWidth: 1.5 });
    certPage.drawRectangle({ x: M - 5, y: esY + esH - 3, width: W - M * 2 + 10, height: 3, color: colors.emeraldLight });
    certPage.drawText("ELECTRONIC SIGNATURE (TYPED)  |  IT ACT 2000  |  SECTION 2(1)(TA)  |  LEGALLY BINDING", { x: M + 5, y: esY + 58, size: 6.5, font: fontBold, color: colors.emeraldDark });
    certPage.drawText(VENDOR_DATA.signatoryName, { x: M + 20, y: esY + 26, size: 26, font: fontTimesBI, color: rgb(0.04, 0.22, 0.14) });
    certPage.drawText(VENDOR_DATA.designation, { x: M + 20, y: esY + 10, size: 7.5, font: fontOblique, color: colors.medGray });
    certPage.drawText("[DIGITALLY RECORDED & TIMESTAMPED]", { x: W - M - 150, y: esY + 28, size: 7.5, font: fontBold, color: colors.emeraldDark });
    certPage.drawText(VENDOR_DATA.signedAt, { x: W - M - 150, y: esY + 14, size: 6.5, font: fontOblique, color: colors.medGray });

    // Acceptance statement
    const accY = esY - 50;
    certPage.drawRectangle({ x: M - 5, y: accY, width: W - M * 2 + 10, height: 42, color: rgb(0.04, 0.36, 0.25), borderColor: colors.emeraldDark, borderWidth: 1 });
    certPage.drawText("I, " + VENDOR_DATA.signatoryName + " (" + VENDOR_DATA.designation + "), on behalf of " + VENDOR_DATA.businessName + ",", { x: M + 5, y: accY + 30, size: 8, font: fontBold, color: colors.white });
    certPage.drawText("confirm having read, understood, and agreed to ALL " + TAC_CLAUSES.length + " sections of this Vendor Partnership Agreement", { x: M + 5, y: accY + 18, size: 7.5, font: fontRegular, color: rgb(0.85, 0.95, 0.91) });
    certPage.drawText("(Pages 2-" + TOTAL_PAGES + ") in their entirety. This electronic acceptance is binding under Indian law.", { x: M + 5, y: accY + 7, size: 7.5, font: fontRegular, color: rgb(0.85, 0.95, 0.91) });

    // Ref box
    const refY = accY - 36;
    certPage.drawRectangle({ x: M - 5, y: refY, width: W - M * 2 + 10, height: 28, color: colors.dark });
    const docRef = "BF-ESG-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    certPage.drawText("DOCUMENT REF: " + docRef + "  |  Generated: " + new Date().toUTCString(), { x: M + 5, y: refY + 17, size: 7.5, font: fontBold, color: colors.white });
    certPage.drawText("Verify at: vendors.boxfox.in/verify  |  Full agreement on Pages 2-" + TOTAL_PAGES, { x: M + 5, y: refY + 6, size: 6.5, font: fontRegular, color: rgb(0.60, 0.75, 0.70) });

    // Footer
    certPage.drawRectangle({ x: 0, y: 0, width: W, height: 20, color: colors.dark });
    certPage.drawText(COMPANY_NAME + "  |  vendors@boxfox.in  |  www.boxfox.in", { x: M, y: 7, size: 6, font: fontOblique, color: rgb(0.60, 0.75, 0.70) });
    certPage.drawText("Page 1 of " + TOTAL_PAGES + "  |  CONFIDENTIAL", { x: W - 120, y: 7, size: 6, font: fontBold, color: rgb(0.60, 0.75, 0.70) });

    // ══════════════════════════════════════════════════
    // PAGES 2+: FULL TERMS & CONDITIONS
    // ══════════════════════════════════════════════════
    let pageNum = 2;
    let tacPage = addPageWithHeader(pdfDoc, fonts, colors, pageNum, TOTAL_PAGES);
    curY = 800;

    // T&C Title on first T&C page
    tacPage.drawText("VENDOR PARTNERSHIP AGREEMENT — TERMS & CONDITIONS", { x: M, y: curY, size: 14, font: fontBold, color: colors.darkGray });
    curY -= 16;
    tacPage.drawText("BoxFox Technologies Private Limited  |  Version " + TAC_VERSION + "  |  Effective: " + EFFECTIVE_DATE, { x: M, y: curY, size: 8, font: fontOblique, color: colors.medGray });
    curY -= 8;
    tacPage.drawRectangle({ x: M, y: curY, width: W - M * 2, height: 1.5, color: colors.emeraldLight });
    curY -= 14;
    tacPage.drawText("This Agreement governs the relationship between BoxFox Technologies Private Limited and the registered Vendor. By electronically", { x: M, y: curY, size: 8, font: fontRegular, color: colors.medGray });
    curY -= 11;
    tacPage.drawText("signing this document, the Vendor accepts all terms below. The signed certificate is on Page 1 of this document.", { x: M, y: curY, size: 8, font: fontRegular, color: colors.medGray });
    curY -= 20;

    for (const clause of TAC_CLAUSES) {
        // Estimate space needed
        let spaceNeeded = 30; // clause header
        for (const para of clause.content) {
            spaceNeeded += (wrapText(para, textW - 25, fontRegular, 9).length * lineH) + 10;
        }
        spaceNeeded += 16;

        if (curY - spaceNeeded < 40) {
            pageNum++;
            tacPage = addPageWithHeader(pdfDoc, fonts, colors, pageNum, TOTAL_PAGES);
            curY = 800;
        }

        // Clause number badge
        tacPage.drawRectangle({ x: M - 5, y: curY - 3, width: 22, height: 16, color: colors.emeraldDark });
        tacPage.drawText(String(clause.id).padStart(2, "0"), { x: M - 1, y: curY, size: 9, font: fontBold, color: colors.white });

        // Clause title
        tacPage.drawText("SECTION " + clause.id + ": " + clause.title.toUpperCase(), {
            x: M + 22, y: curY, size: 10, font: fontBold, color: colors.darkGray,
        });
        curY -= 6;
        tacPage.drawRectangle({ x: M - 5, y: curY, width: W - M * 2 + 10, height: 0.75, color: colors.emeraldLight });
        curY -= 12;

        // Clause paragraphs
        clause.content.forEach((para, idx) => {
            const lines = wrapText(para, textW - 25, fontRegular, 9);

            if (curY - lines.length * lineH < 40) {
                pageNum++;
                tacPage = addPageWithHeader(pdfDoc, fonts, colors, pageNum, TOTAL_PAGES);
                curY = 800;
            }

            // Numbered circle
            tacPage.drawCircle({ x: M + 7, y: curY - 1, size: 6, color: colors.emeraldLight });
            tacPage.drawText(String(idx + 1), { x: idx < 9 ? M + 4.5 : M + 3, y: curY - 4, size: 5.5, font: fontBold, color: colors.white });

            lines.forEach((line, li) => {
                tacPage.drawText(line, {
                    x: M + 20, y: curY - li * lineH,
                    size: 9, font: fontRegular, color: colors.medGray,
                });
            });
            curY -= lines.length * lineH + 10;
        });
        curY -= 18;

        // Light separator between clauses
        if (clause.id < TAC_CLAUSES.length) {
            tacPage.drawRectangle({ x: M - 5, y: curY + 8, width: W - M * 2 + 10, height: 0.5, color: colors.borderGray });
        }
    }

    // Final closing statement on last T&C page
    if (curY < 120) {
        pageNum++;
        tacPage = addPageWithHeader(pdfDoc, fonts, colors, pageNum, TOTAL_PAGES);
        curY = 800;
    }
    curY -= 20;

    tacPage.drawRectangle({ x: M - 5, y: curY - 50, width: W - M * 2 + 10, height: 60, color: rgb(0.04, 0.36, 0.25) });
    tacPage.drawText("ACCEPTANCE & BINDING CONFIRMATION", { x: M + 5, y: curY - 5, size: 9, font: fontBold, color: colors.white });
    tacPage.drawText("By electronically signing this Agreement (Page 1), " + VENDOR_DATA.signatoryName + " on behalf of " + VENDOR_DATA.businessName, { x: M + 5, y: curY - 18, size: 8, font: fontRegular, color: rgb(0.85, 0.95, 0.91) });
    tacPage.drawText("has agreed to all " + TAC_CLAUSES.length + " sections above. This constitutes a valid electronic signature under IT Act, 2000 (India).", { x: M + 5, y: curY - 30, size: 8, font: fontRegular, color: rgb(0.85, 0.95, 0.91) });
    tacPage.drawText("Agreement Version: " + TAC_VERSION + "  |  Effective: " + EFFECTIVE_DATE + "  |  " + COMPANY_NAME, { x: M + 5, y: curY - 42, size: 7, font: fontOblique, color: rgb(0.70, 0.90, 0.82) });

    return pdfDoc.save();
}

// ─── EMAIL SENDER ─────────────────────────────────────────────────────────────
async function sendEmail(pdfBytes) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const clauseHtml = TAC_CLAUSES.map(c =>
        `<div style="margin-bottom:16px;padding:14px 16px;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;border-left:4px solid #10B981">
        <div style="font-size:11px;font-weight:900;color:#065F46;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Section ${c.id}: ${c.title}</div>
        ${c.content.map((p, i) =>
            `<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px">
            <div style="width:18px;height:18px;background:#10B981;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:8px;font-weight:900;flex-shrink:0;margin-top:1px">${i+1}</div>
            <p style="font-size:12px;color:#4B5563;line-height:1.6;margin:0">${p}</p>
            </div>`
        ).join("")}
        </div>`
    ).join("");

    const detailRow = (lbl, val, green = false) =>
        `<div style="display:flex;justify-content:space-between;align-items:flex-start;padding:8px 0;border-bottom:1px solid #F3F4F6">
        <span style="font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.4px">${lbl}</span>
        <span style="font-size:12px;font-weight:800;color:${green?"#059669":"#111827"};text-align:right;max-width:280px">${val}</span></div>`;

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F3F4F6">
<div style="max-width:680px;margin:0 auto;background:#fff">

<!-- HEADER -->
<div style="background:linear-gradient(135deg,#065F46 0%,#10B981 100%);padding:40px 32px;text-align:center">
  <div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;color:#fff;font-style:italic;margin-bottom:14px">B</div>
  <h1 style="color:#fff;font-size:22px;font-weight:900;margin:0 0 6px;letter-spacing:-0.5px">Vendor Partnership Agreement</h1>
  <p style="color:rgba(255,255,255,0.75);font-size:11px;margin:0;text-transform:uppercase;letter-spacing:2px">Complete Agreement + E-Sign Certificate · BoxFox Vendor Network</p>
</div>
<div style="height:4px;background:linear-gradient(90deg,#D97706,#F59E0B,#D97706)"></div>

<div style="padding:36px 32px">
  <h2 style="font-size:20px;font-weight:800;color:#111827;margin:0 0 10px">Agreement Signed & Certificate Attached ✅</h2>
  <p style="font-size:14px;color:#4B5563;line-height:1.7;margin:0 0 20px">
    This email contains the <strong>complete Vendor Partnership Agreement</strong> for your reference. 
    The attached PDF includes the E-Sign Certificate (Page 1) and the full Terms & Conditions document (Pages 2+).
    Please retain this for your legal records.
  </p>

  <div style="display:inline-flex;align-items:center;gap:8px;background:#ECFDF5;border:1.5px solid #6EE7B7;border-radius:100px;padding:10px 20px;margin-bottom:28px">
    <div style="width:10px;height:10px;border-radius:50%;background:#10B981"></div>
    <span style="font-size:12px;font-weight:800;color:#065F46;text-transform:uppercase;letter-spacing:0.5px">Agreement Active · ${TAC_CLAUSES.length} Sections Accepted</span>
  </div>

  <!-- Vendor & Signature Details -->
  <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:14px;padding:20px;margin-bottom:20px">
    <div style="font-size:10px;font-weight:900;color:#6B7280;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #E5E7EB">📋 Vendor & Signature Record</div>
    ${detailRow("Business Entity", VENDOR_DATA.businessName)}
    ${detailRow("Vendor ID", VENDOR_DATA.vendorId, true)}
    ${detailRow("Signatory", VENDOR_DATA.signatoryName + " — " + VENDOR_DATA.designation)}
    ${detailRow("Commission Rate", VENDOR_DATA.commissionRate, true)}
    ${detailRow("Signed At", VENDOR_DATA.signedAt)}
    ${detailRow("Legal Framework", VENDOR_DATA.legalFramework)}
    <div style="padding-top:2px"></div>
  </div>

  <!-- Signature preview -->
  <div style="border:2px dashed #6EE7B7;border-radius:14px;padding:24px;text-align:center;margin:20px 0;background:#F0FDF4">
    <div style="font-size:9px;font-weight:900;color:#059669;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px">🔏 Recorded Electronic Signature</div>
    <div style="font-family:Georgia,serif;font-size:32px;font-style:italic;color:#064E3B;margin-bottom:6px">${VENDOR_DATA.signatoryName}</div>
    <div style="font-size:11px;color:#6B7280">${VENDOR_DATA.designation}</div>
  </div>

  <!-- Full T&C -->
  <div style="border:1.5px solid #D1FAE5;border-radius:14px;padding:20px;margin-bottom:20px">
    <div style="font-size:10px;font-weight:900;color:#065F46;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid #10B981">
      📑 FULL TERMS & CONDITIONS — ALL ${TAC_CLAUSES.length} SECTIONS
    </div>
    ${clauseHtml}
  </div>

  <!-- Legal Notice -->
  <div style="background:#0F172A;border-radius:14px;padding:20px">
    <p style="color:#94A3B8;font-size:11px;line-height:1.65;margin:0">
      <strong style="color:#34D399">Legal Validity:</strong> This electronic signature is valid under 
      <strong style="color:#34D399">Section 2(1)(ta) of the Information Technology Act, 2000 (India)</strong> 
      and has the same legal effect as a handwritten wet signature. The signature record includes timestamp, 
      IP address, and agreement version for full audit trail compliance.
    </p>
    <p style="color:#94A3B8;font-size:11px;line-height:1.65;margin:12px 0 0">
      <strong style="color:#34D399">Document Retention:</strong> Please retain the attached PDF securely. 
      It contains the E-Sign Certificate and complete Terms & Conditions and serves as primary evidence of 
      agreement acceptance in any dispute, audit, or regulatory inquiry.
    </p>
  </div>
</div>

<!-- FOOTER -->
<div style="padding:24px 32px;text-align:center;background:#F9FAFB;border-top:1px solid #E5E7EB">
  <p style="font-size:13px;font-weight:700;color:#111827;margin:0 0 6px">${COMPANY_NAME}</p>
  <p style="font-size:11px;color:#9CA3AF;margin:0">📧 <a href="mailto:vendors@boxfox.in" style="color:#10B981;font-weight:700;text-decoration:none">vendors@boxfox.in</a> &nbsp;·&nbsp; 🌐 <a href="https://boxfox.in" style="color:#10B981;font-weight:700;text-decoration:none">www.boxfox.in</a></p>
  <p style="font-size:10px;color:#D1D5DB;margin-top:8px">© 2025 BoxFox Technologies Private Limited. All rights reserved.</p>
</div>
</div>
</body></html>`;

    return transporter.sendMail({
        from: `"BoxFox Vendor Network" <${process.env.EMAIL_USER}>`,
        to: RECIPIENT_EMAIL,
        subject: "BoxFox Vendor Partnership Agreement — Full T&C + E-Sign Certificate [Client Approval Copy]",
        html,
        attachments: [{
            filename: `BoxFox_Vendor_Agreement_Complete_${VENDOR_DATA.signatoryName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`,
            content: Buffer.from(pdfBytes),
            contentType: "application/pdf",
        }],
    });
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
    console.log("\n==========================================================");
    console.log("  BoxFox — Full Agreement PDF Generator & Mailer");
    console.log("==========================================================\n");

    console.log("  [1/3] Generating multi-page PDF (Certificate + Full T&C)...");
    const pdfBytes = await generateEsignPDF();

    const tmpDir = path.join(__dirname, "..", "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const outPath = path.join(tmpDir, `vendor_agreement_full_${Date.now()}.pdf`);
    fs.writeFileSync(outPath, Buffer.from(pdfBytes));
    console.log(`  [2/3] PDF saved: ${outPath}`);

    console.log(`  [3/3] Sending full agreement email to ${RECIPIENT_EMAIL}...`);
    const result = await sendEmail(pdfBytes);

    console.log("\n==========================================================");
    console.log("   EMAIL SENT SUCCESSFULLY!");
    console.log("==========================================================");
    console.log(`   Recipient  : ${RECIPIENT_EMAIL}`);
    console.log(`   Message ID : ${result.messageId}`);
    console.log(`   PDF Copy   : ${outPath}`);
    console.log("   PDF contains: Certificate (Page 1) + Full T&C (remaining pages)");
    console.log("   Check your inbox (and spam folder if needed).\n");
}

main().catch(err => {
    console.error("\n  ERROR:", err.message);
    console.error(err);
    process.exit(1);
});
