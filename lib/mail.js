import nodemailer from 'nodemailer';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const transporter = nodemailer.createTransport(
    process.env.EMAIL_SERVICE === 'gmail' 
    ? {
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
      }
    : {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_PORT == 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    }
);

export const sendEmail = async ({ to, bcc, subject, html, attachments = [] }) => {
    try {
        const mailOptions = {
            from: `"BoxFox Store" <${process.env.EMAIL_USER}>`,
            to,
            bcc,
            subject,
            html,
            attachments,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

// --- Shared Components ---
const EMAIL_CONTAINER = (content) => `
    <div style="font-family: 'Inter', 'Helvetica', 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #f0f0f0; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.06);">
        <!-- Premium Header Area -->
        <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 50px 20px; text-align: center; border-bottom: 4px solid #10b981;">
            <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 900; letter-spacing: -2px; text-transform: uppercase;">BoxFox</h1>
            <p style="color: #10b981; margin: 8px 0 0; font-size: 11px; letter-spacing: 4px; font-weight: 900; text-transform: uppercase;">Premium Packaging Ecosystem</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 50px 40px; color: #111827;">
            ${content}
        </div>
        
        <!-- Premium Footer Area -->
        <div style="padding: 40px 30px; background-color: #fafafa; border-top: 1px solid #f3f4f6; text-align: center;">
            <div style="margin-bottom: 25px;">
                <a href="https://boxfox.in/shop" style="color: #000; text-decoration: none; font-size: 12px; font-weight: 900; margin: 0 15px; text-transform: uppercase; letter-spacing: 1px;">Collection</a>
                <a href="https://boxfox.in/contact" style="color: #000; text-decoration: none; font-size: 12px; font-weight: 900; margin: 0 15px; text-transform: uppercase; letter-spacing: 1px;">Support</a>
                <a href="https://boxfox.in/track" style="color: #000; text-decoration: none; font-size: 12px; font-weight: 900; margin: 0 15px; text-transform: uppercase; letter-spacing: 1px;">Tracking</a>
            </div>
            <p style="margin: 0; font-size: 11px; color: #999; font-weight: 600;">&copy; ${new Date().getFullYear()} BOXFOX. All rights reserved.</p>
            <p style="margin: 10px 0 0; font-size: 10px; color: #bbb; line-height: 1.5;">BOXFOX is a registered trademark RyM Grenergy.<br/>Sector 15, Vasundhara, Ghaziabad, UP, India</p>
        </div>
    </div>
`;

// --- Templates ---
export const getAdminOrderTemplate = (order) => EMAIL_CONTAINER(`
    <div style="text-align: center; margin-bottom: 35px;">
        <span style="background-color: #fefce8; color: #854d0e; padding: 6px 16px; border-radius: 99px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; border: 1px solid #fef08a;">Sales Notification</span>
        <h2 style="margin: 20px 0 5px; font-size: 28px; font-weight: 900; color: #111; letter-spacing: -1px;">Cha-Ching! New Sale.</h2>
        <p style="color: #666; font-size: 14px;">A new order has been securely placed on the platform.</p>
    </div>
    
    <div style="background-color: #fff; border: 1px solid #f3f4f6; padding: 25px; border-radius: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
        <div style="background-color: #f9fafb; padding: 15px 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <span style="font-size: 11px; font-weight: 900; color: #9ca3af; text-transform: uppercase;">Reference ID</span>
            <span style="font-size: 15px; font-weight: 900; color: #000;">${order.orderId}</span>
        </div>
        
        <div style="margin-bottom: 20px;">
            <p style="font-size: 10px; font-weight: 900; color: #9ca3af; text-transform: uppercase; margin: 0 0 8px; letter-spacing: 1px;">Customer Intelligence</p>
            <p style="font-size: 16px; font-weight: 700; color: #111; margin: 0;">${order.customerName}</p>
            <p style="font-size: 13px; color: #6b7280; margin: 3px 0 0;">${order.customerEmail}</p>
        </div>

        <p style="font-size: 10px; font-weight: 900; color: #9ca3af; text-transform: uppercase; margin: 20px 0 10px; letter-spacing: 1px;">Cart Composition</p>
        <div style="border-top: 1px solid #f3f4f6;">
            ${order.items.map(item => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f9fafb;">
                    <div style="flex: 1;">
                        <p style="font-size: 13px; font-weight: 700; color: #374151; margin: 0;">${item.name}</p>
                        <p style="font-size: 11px; color: #9ca3af; margin: 2px 0 0;">Quantity: ${item.quantity}</p>
                    </div>
                    <span style="font-size: 14px; font-weight: 800; color: #111;">₹${parseFloat(item.price).toFixed(2)}</span>
                </div>
            `).join('')}
        </div>
        
        <div style="margin-top: 20px; text-align: right;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">Total Revenue Generated</p>
            <p style="font-size: 24px; font-weight: 900; color: #059669; margin: 5px 0 0;">₹${parseFloat(order.totalAmount).toFixed(2)}</p>
        </div>
    </div>
    
    <div style="margin-top: 40px; text-align: center;">
        <a href="https://boxfox.in/admin" style="display: inline-block; background-image: linear-gradient(to right, #000, #333); color: #fff; text-decoration: none; padding: 18px 45px; border-radius: 14px; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; box-shadow: 0 10px 20px rgba(0,0,0,0.1);">Enter Admin Vault</a>
    </div>
`);

export const getUserOrderTemplate = (order) => EMAIL_CONTAINER(`
    <div style="text-align: center; margin-bottom: 45px;">
        <div style="width: 80px; height: 80px; background-color: #ecfdf5; border-radius: 30px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 25px; margin-left: auto; margin-right: auto;">
             <img src="https://img.icons8.com/ios-filled/100/10b981/checked-checkbox.png" style="width: 40px; height: 40px;" alt="Check" />
        </div>
        <h2 style="font-size: 36px; font-weight: 900; color: #111827; letter-spacing: -2px; margin: 0; line-height: 1;">Order Confirmed!</h2>
        <p style="color: #6b7280; font-size: 16px; margin-top: 10px; font-weight: 500;">Hi ${order.customerName}, we're getting things ready.</p>
    </div>

    <div style="border: 2px dashed #f3f4f6; border-radius: 24px; padding: 30px; margin-bottom: 40px;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid #f3f4f6; padding-bottom: 20px;">
            <p style="margin: 0; font-size: 11px; font-weight: 900; color: #9ca3af; text-transform: uppercase; letter-spacing: 2px;">Tracking ID</p>
            <p style="margin: 8px 0 0; font-size: 24px; font-weight: 900; color: #000; letter-spacing: -0.5px;">${order.orderId}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="border-bottom: 2px solid #f9fafb;">
                    <th style="padding: 12px 0; text-align: left; font-size: 10px; font-weight: 900; color: #abb1bb; text-transform: uppercase; letter-spacing: 1px;">Item Details</th>
                    <th style="padding: 12px 0; text-align: right; font-size: 10px; font-weight: 900; color: #abb1bb; text-transform: uppercase; letter-spacing: 1px;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                ${order.items.map(item => `
                    <tr style="border-bottom: 1px solid #f9fafb;">
                        <td style="padding: 18px 0;">
                            <p style="font-size: 14px; font-weight: 700; color: #111827; margin: 0;">${item.name}</p>
                            <p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0; font-weight: 600;">Qty: ${item.quantity} · ${item.variant || 'Standard'}</p>
                        </td>
                        <td style="padding: 18px 0; font-size: 15px; font-weight: 800; color: #111827; text-align: right;">₹${parseFloat(item.price).toFixed(2)}</td>
                    </tr>
                `).join('')}
                
                ${order.discount > 0 ? `
                    <tr>
                        <td style="padding: 20px 0 0; font-size: 13px; font-weight: 700; color: #10b981;">Exclusive Discount</td>
                        <td style="padding: 20px 0 0; font-size: 15px; font-weight: 800; color: #10b981; text-align: right;">-₹${parseFloat(order.discount).toFixed(2)}</td>
                    </tr>
                ` : ''}

                <tr>
                    <td style="padding: 20px 0 0; font-size: 16px; font-weight: 900; color: #111827;">Grand Total</td>
                    <td style="padding: 20px 0 0; font-size: 22px; font-weight: 900; color: #000; text-align: right;">₹${parseFloat(order.totalAmount).toFixed(2)}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div style="background-color: #f9fafb; padding: 25px; border-radius: 20px; font-size: 14px; margin-bottom: 35px;">
        <p style="margin: 0 0 10px; font-size: 10px; font-weight: 900; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">Shipping Destination</p>
        <p style="margin: 0; color: #374151; line-height: 1.6; font-weight: 600;">${order.shippingAddress || 'Awaiting Details'}</p>
    </div>

    <p style="color: #6b7280; line-height: 1.7; font-size: 14px; margin-bottom: 35px; text-align: center; padding: 0 10px;">
        Your official stamped invoice is securely attached to this email. We'll notify you via push & email as soon as the package leaves our facility.
    </p>

    <div style="text-align: center;">
        <a href="https://boxfox.in/track/${order.orderId}" style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 20px 50px; border-radius: 16px; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">Track Real-time Status</a>
    </div>
`);

export const getOTPTemplate = (otp) => EMAIL_CONTAINER(`
    <div style="text-align: center; margin-bottom: 40px;">
        <div style="width: 60px; height: 60px; background-color: #000; border-radius: 18px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 25px;">
             <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
        <h2 style="font-size: 32px; font-weight: 900; color: #000; margin: 0; letter-spacing: -1.5px;">Identity Check.</h2>
        <p style="color: #666; font-size: 14px; margin-top: 10px;">Complete your secure onboarding with the code below.</p>
    </div>

    <div style="background-color: #f8f8f8; padding: 40px 20px; border-radius: 30px; text-align: center; border: 1px dashed #e5e7eb;">
        <div style="display: inline-flex; gap: 8px;">
            ${otp.split('').map(digit => `
                <div style="width: 45px; height: 60px; display: inline-flex; align-items: center; justify-content: center; background: white; border: 2px solid #000; color: #000; font-size: 28px; font-weight: 900; border-radius: 12px; margin: 0 3px;">${digit}</div>
            `).join('')}
        </div>
        <p style="margin-top: 25px; font-size: 12px; font-weight: 900; color: #999; text-transform: uppercase; letter-spacing: 1px;">Expiring in 10 minutes</p>
    </div>

    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 35px;">
        This code was generated specifically for your account creation. If you did not request this, please disregard and secure your email account.
    </p>
`);

// --- Advance PDF Generation with AutoTable ---
export const generateInvoicePDF = (order) => {
    const doc = new jsPDF();
    
    // Header & Footer Drawing Function for Multi-page Support
    const drawBranding = () => {
        // Advanced Header Design (High-Fidelity)
        doc.setFillColor(15, 17, 26); // Near Black
        doc.rect(0, 0, 210, 60, 'F');
        
        // Emerald Brand Accent
        doc.setFillColor(16, 185, 129);
        doc.rect(0, 58, 210, 2, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(42);
        doc.text('BOXFOX', 25, 34);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(156, 163, 175);
        doc.text('PREMIUM PACKAGING ECOSYSTEM | AUTHENTICATED BOXFOX DOCUMENT', 27, 43);
        doc.text('VAT/GST REG: 24AAAFR1234F1Z5 | HSN COMPLIANCE AUTHENTICATED', 27, 48);
        
        // Status ID Panel
        doc.setFillColor(31, 41, 55);
        doc.roundedRect(140, 18, 55, 30, 4, 4, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('DOCUMENT CLASSIFICATION', 147, 26);
        doc.setFontSize(11);
        doc.text('TAX INVOICE', 147, 34);
        doc.setFontSize(14);
        doc.setTextColor(16, 185, 129);
        doc.text(order.orderId, 147, 43);

        // Verification Overlay (Every Page Watermark)
        doc.setGState(new doc.GState({ opacity: 0.04 }));
        doc.setFontSize(80);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text('BOXFOX', 105, 150, { align: 'center', angle: 45 });
        doc.setGState(new doc.GState({ opacity: 1 }));

        // Institutional Page Footer (Every Page) - Simplified as per user request
        doc.setFillColor(249, 250, 251);
        doc.rect(0, 287, 210, 10, 'F');
        doc.setTextColor(156, 163, 175);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('© 2026 BOXFOX PREMIUM PACKAGING. ALL RIGHTS RESERVED.', 20, 293.5);
        doc.text('PORTAL.BOXFOX.IN', 190, 293.5, { align: 'right' });
    };

    // Recipient & Site Details (Only on first page)
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('RECIPIENT & SITE DETAILS.', 25, 80);
    
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text(order.customerName || 'PREMIUM CLIENT', 25, 92);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text(`Client ID: ${order.customerEmail?.split('@')[0].toUpperCase() || 'ANON'}`, 25, 99);
    doc.text(`Email: ${order.customerEmail || 'Restricted'}`, 25, 104);
    doc.text(`Site: ${order.shippingAddress || 'India Mainland'}`, 25, 109);

    // Primary Partition
    doc.setDrawColor(241, 245, 249);
    doc.line(25, 70, 185, 70);

    // High-Fidelity Table
    const tableData = order.items.map((item, idx) => [
        (idx + 1).toString().padStart(2, '0'),
        item.name,
        'HSN-4819',
        item.quantity.toString().padStart(2, '0'),
        `INR ${parseFloat(item.price).toFixed(2)}`,
        '0.00%', 
        `INR ${(parseFloat(item.price) * item.quantity).toFixed(2)}`
    ]);

    autoTable(doc, {
        startY: 125,
        head: [['#', 'INVENTORY SPECIFICATION', 'REG/HSN', 'QTY', 'RATE', 'TAX %', 'TOTAL']],
        body: tableData,
        theme: 'striped',
        headStyles: { 
            fillColor: [17, 24, 39], 
            textColor: [255, 255, 255], 
            fontSize: 7, 
            halign: 'center', 
            fontStyle: 'bold',
            cellPadding: 3
        },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 70, halign: 'left' },
            2: { cellWidth: 22, halign: 'center' },
            3: { cellWidth: 12, halign: 'center' },
            4: { cellWidth: 25, halign: 'right' },
            5: { cellWidth: 16, halign: 'center' },
            6: { cellWidth: 25, halign: 'right', fontStyle: 'bold' }
        },
        styles: { fontSize: 7, cellPadding: 3, font: 'helvetica', textColor: [17, 24, 39] },
        margin: { left: 15, right: 15, top: 70 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        didDrawPage: drawBranding
    });

    const finalY = (doc).lastAutoTable.finalY + 15;

    // Advanced Totals Summary Grid
    const summaryX = 130;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text('LEDGER SUB-TOTAL', summaryX, finalY + 5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(17, 24, 39);
    doc.text(`INR ${(order.totalAmount + (order.discount || 0)).toFixed(2)}`, 190, finalY + 5, { align: 'right' });

    let currentY = finalY + 12;

    if (order.discount > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(156, 163, 175);
        doc.text('PROMOTIONAL OFFSET', summaryX, currentY);
        doc.setTextColor(16, 185, 129);
        doc.text(`(-) INR ${order.discount.toFixed(2)}`, 190, currentY, { align: 'right' });
        currentY += 12;
    }

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(156, 163, 175);
    doc.text('LOGISTICS REBATE', summaryX, currentY);
    doc.setTextColor(16, 185, 129);
    doc.text('COMPLIMENTARY', 190, currentY, { align: 'right' });
    currentY += 12;

    // High-Fidelity Total Module
    doc.setFillColor(15, 17, 26);
    doc.roundedRect(summaryX - 5, currentY - 6, 65, 25, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL PAYABLE VALUATION', summaryX, currentY + 5);
    doc.setFontSize(15);
    doc.setTextColor(16, 185, 129);
    doc.text(`INR ${parseFloat(order.totalAmount).toFixed(2)}`, 190, currentY + 13, { align: 'right' });

    // Payment/Bank Clearance Details
    doc.setTextColor(75, 85, 99);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('OFFICIAL BANK CLEARANCE DATA.', 25, finalY + 5);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const bankDetails = [
        'Bank: STATE BANK OF INDIA | BOXFOX ECOSYSTEM',
        'Acc No: 1234 5678 9012 (CURRENT)',
        'IFSC: SBIN002931 / VASUNDHARA BRANCH',
        'PAN: AAAFR1234F | SWIFT: SBIIN33XXX'
    ];
    bankDetails.forEach((text, i) => doc.text(text, 25, finalY + 12 + (i * 5)));

    // Branding Quote (Institutional Finish)
    doc.setTextColor(156, 163, 175);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('"Sustainability is not an option, it is our signature."', 105, 255, { align: 'center' });

    // Signaling Footer Line
    doc.setDrawColor(243, 244, 246);
    doc.line(20, 265, 190, 265);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text('AUTHORIZED CLEARANCE AGENT', 105, 278, { align: 'center' });

    return Buffer.from(doc.output('arraybuffer'));
};

export const getStatusUpdateTemplate = (order) => EMAIL_CONTAINER(`
    <div style="text-align: center; margin-bottom: 35px;">
        <h2 style="font-size: 28px; font-weight: 900; color: #111; margin: 0; letter-spacing: -1px;">Package Lifecycle Update.</h2>
        <p style="color: #666; font-size: 14px; margin-top: 8px;">Order ${order.orderId} is progressing through our ecosystem.</p>
    </div>

    <div style="background-color: #000; border: 8px solid #f3f4f6; padding: 35px 25px; border-radius: 30px; text-align: center; margin-bottom: 30px;">
        <p style="margin: 0; font-size: 10px; font-weight: 900; color: #10b981; text-transform: uppercase; letter-spacing: 3px;">Milestone Reached</p>
        <h3 style="margin: 15px 0 0; font-size: 36px; font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: -1px;">${order.status}</h3>
    </div>

    <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 30px;">
        <div style="flex: 1; height: 6px; background: #eee; border-radius: 99px; ${order.status === 'Processing' || order.status === 'Shipped' || order.status === 'Delivered' ? 'background: #10b981;' : ''}"></div>
        <div style="flex: 1; height: 6px; background: #eee; border-radius: 99px; ${order.status === 'Shipped' || order.status === 'Delivered' ? 'background: #10b981;' : ''}"></div>
        <div style="flex: 1; height: 6px; background: #eee; border-radius: 99px; ${order.status === 'Delivered' ? 'background: #10b981;' : ''}"></div>
    </div>

    <p style="color: #666; font-size: 14px; text-align: center; line-height: 1.8; padding: 0 15px;">
        We prioritize velocity and precision. Your boxes are currently in the <strong>${order.status}</strong> phase, being handled by our premium logistics partners.
    </p>

    <div style="text-align: center; margin-top: 40px;">
        <a href="https://boxfox.in/track/${order.orderId}" style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 18px 50px; border-radius: 16px; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">Track Real-Time Status</a>
    </div>
`);

export const getCouponTemplate = (coupon) => EMAIL_CONTAINER(`
    <div style="background-image: linear-gradient(135deg, #000 0%, #222 100%); margin: -50px -40px 40px; padding: 60px 40px; text-align: center; color: #fff; border-bottom: 5px solid #10b981;">
        <h4 style="margin: 0; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 5px; color: #10b981;">Limited Privilege</h4>
        <h1 style="font-size: 52px; font-weight: 900; letter-spacing: -3px; margin: 25px 0 10px; line-height: 0.9;">Exclusive Allocation.</h1>
        <p style="font-size: 18px; color: #9ca3af; font-weight: 500;">Reserved specifically for your next premium acquisition.</p>
    </div>
    
    <div style="text-align: center;">
        <div style="background-color: #f9fafb; border: 2px dashed #000; padding: 35px; border-radius: 24px; display: inline-block;">
            <p style="margin: 0; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #9ca3af; letter-spacing: 2px;">Access Key</p>
            <h2 style="margin: 8px 0 0; font-size: 48px; font-weight: 900; letter-spacing: -1px; color: #000;">${coupon.code}</h2>
        </div>
        
        <div style="margin-top: 40px;">
            <p style="font-size: 28px; font-weight: 900; color: #000; margin: 0;">₹${coupon.discountValue} OFF</p>
            <p style="font-size: 11px; color: #10b981; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin-top: 8px;">Institutional Discount Applied</p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin: 30px 0; line-height: 1.6;">Use this code at checkout to reduce your total acquisition cost. Valid across our entire range of custom and stock packaging.</p>
        
        <a href="https://boxfox.in/shop" style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 22px 60px; border-radius: 18px; font-size: 15px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 20px 40px rgba(0,0,0,0.15);">Redeem Allocation</a>
    </div>
`);
