import nodemailer from 'nodemailer';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';

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

// --- Advance PDF Generation helpers ---
// Helper: State to GST code mapping
const getStateCode = (stateName) => {
    if (!stateName) return '06'; // Default to Haryana
    const state = stateName.trim().toLowerCase();
    const stateCodes = {
        'jammu and kashmir': '01', 'himachal pradesh': '02', 'punjab': '03',
        'chandigarh': '04', 'uttarakhand': '05', 'haryana': '06',
        'delhi': '07', 'rajasthan': '08', 'uttar pradesh': '09',
        'bihar': '10', 'sikkim': '11', 'arunachal pradesh': '12',
        'nagaland': '13', 'manipur': '14', 'mizoram': '15',
        'tripura': '16', 'meghalaya': '17', 'assam': '18',
        'west bengal': '19', 'jharkhand': '20', 'odisha': '21',
        'chhattisgarh': '22', 'madhya pradesh': '23', 'gujarat': '24',
        'daman and diu': '25', 'dadra and nagar haveli': '26', 'maharashtra': '27',
        'andhra pradesh': '28', 'karnataka': '29', 'goa': '30',
        'lakshadweep': '31', 'kerala': '32', 'tamil nadu': '33',
        'puducherry': '34', 'andaman and nicobar islands': '35', 'telangana': '36',
        'andhra pradesh (new)': '37', 'ladakh': '38'
    };
    for (const [name, code] of Object.entries(stateCodes)) {
        if (state.includes(name)) return code;
    }
    return '06'; // default
};

// Helper: Number to Words (Indian Rupee style)
const numberToWords = (num) => {
    const a = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const numToWords = (n) => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
        if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + numToWords(n % 100) : '');
        return '';
    };

    const convert = (n) => {
        if (n === 0) return 'Zero';
        let words = '';
        const crores = Math.floor(n / 10000000);
        n %= 10000000;
        const lakhs = Math.floor(n / 100000);
        n %= 100000;
        const thousands = Math.floor(n / 1000);
        n %= 1000;
        const hundreds = Math.floor(n / 100);
        const remaining = n % 100;

        if (crores > 0) words += numToWords(crores) + ' Crore ';
        if (lakhs > 0) words += numToWords(lakhs) + ' Lakh ';
        if (thousands > 0) words += numToWords(thousands) + ' Thousand ';
        if (hundreds > 0) words += a[hundreds] + ' Hundred ';
        if (remaining > 0) {
            if (words !== '') words += 'and ';
            words += numToWords(remaining) + ' ';
        }
        return words.trim();
    };

    const integerPart = Math.floor(num);
    const decimalPart = Math.round((num - integerPart) * 100);

    let result = 'INR ' + convert(integerPart);
    if (decimalPart > 0) {
        result += ' and ' + convert(decimalPart) + ' Paise';
    }
    result += ' Only';
    return result;
};

// Helper: Address Parser
const parseAddressString = (addressStr) => {
    if (!addressStr) return { street: 'India Mainland', city: '', state: 'Haryana', zip: '' };
    const parts = addressStr.split(',').map(p => p.trim());
    if (parts.length === 1) {
        return { street: parts[0], city: '', state: 'Haryana', zip: '' };
    }
    const statePart = parts[parts.length - 1] || '';
    const cityPart = parts[parts.length - 2] || '';
    const streetParts = parts.slice(0, parts.length - 2);
    
    let zip = '';
    let state = statePart;
    const zipMatch = statePart.match(/\d{6}/) || cityPart.match(/\d{6}/);
    if (zipMatch) {
        zip = zipMatch[0];
        state = statePart.replace(zip, '').trim();
    }
    
    return {
        street: streetParts.join(', '),
        city: cityPart.replace(zip, '').trim(),
        state: state,
        zip: zip
    };
};

// Helper: Format Date
const formatDate = (dateObj) => {
    // Touch to force compiler to clear cache and recompile
    const d = dateObj ? new Date(dateObj) : new Date();
    const day = d.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return day + '-' + months[d.getMonth()] + '-' + d.getFullYear().toString().slice(-2);
};

// --- Advance PDF Generation with AutoTable ---
export const generateInvoicePDF = (order) => {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    // Resolve Addresses
    const shipping = order.shipping || {};
    const shipDetails = {
        street: shipping.address || shipping.street || '',
        city: shipping.city || '',
        state: shipping.state || '',
        zip: shipping.zipCode || shipping.postalCode || shipping.pincode || ''
    };
    if (!shipDetails.street && order.shippingAddress) {
        const parsed = parseAddressString(order.shippingAddress);
        shipDetails.street = parsed.street;
        shipDetails.city = parsed.city;
        shipDetails.state = parsed.state;
        shipDetails.zip = parsed.zip;
    }

    const billDetails = {
        companyName: order.billingDetails?.companyName || order.customerName || 'PREMIUM CLIENT',
        gstNumber: order.billingDetails?.gstNumber || '',
        isB2b: order.billingDetails?.isB2b || false
    };

    // Determine state codes & tax types
    const sellerState = 'Haryana';
    const sellerStateCode = '06';
    const shipState = shipDetails.state || 'Haryana';
    const shipStateCode = getStateCode(shipState);
    const isSameState = shipState.toLowerCase().includes('haryana');

    // Extract PAN from customer GSTIN if B2B
    let customerPan = '';
    if (billDetails.isB2b && billDetails.gstNumber && billDetails.gstNumber.length >= 12) {
        customerPan = billDetails.gstNumber.slice(2, 12).toUpperCase();
    }

    // Calculations
    const totalItemSum = order.items.reduce((sum, item) => sum + (parseFloat(item.price) * (item.quantity || 1)), 0);
    const discountFactor = (order.discount > 0 && totalItemSum > 0) ? (totalItemSum - order.discount) / totalItemSum : 1;

    let totalTaxableVal = 0;
    let totalTaxAmount = 0;
    let totalQty = 0;
    const parsedItems = [];
    const taxDetails = {};

    order.items.forEach(item => {
        const qty = item.quantity || 1;
        totalQty += qty;
        
        const inclusivePrice = parseFloat(item.price) || 0;
        const netInclusiveTotal = inclusivePrice * qty * discountFactor;
        
        // Item specific classification
        const isDie = item.name.toLowerCase().includes('die') || item.name.toLowerCase().includes('tooling') || item.name.toLowerCase().includes('plate');
        const hsn = isDie ? '9997' : '4819';
        const gstRate = 0.18; // Standard 18% GST
        
        const baseTotal = netInclusiveTotal / (1 + gstRate);
        const taxTotal = netInclusiveTotal - baseTotal;
        const baseRate = baseTotal / qty;

        totalTaxableVal += baseTotal;
        totalTaxAmount += taxTotal;

        parsedItems.push({
            name: item.name,
            qty,
            baseRate,
            baseTotal,
            hsn
        });

        // Group tax details
        const rateKey = (gstRate * 100).toFixed(1); // "18.0"
        if (!taxDetails[rateKey]) {
            taxDetails[rateKey] = {
                hsn,
                rate: gstRate,
                taxable: 0,
                tax: 0
            };
        }
        taxDetails[rateKey].taxable += baseTotal;
        taxDetails[rateKey].tax += taxTotal;
    });

    const calculatedTotal = totalTaxableVal + totalTaxAmount;
    const finalRoundedTotal = Math.round(order.totalAmount || calculatedTotal);
    const roundedOff = finalRoundedTotal - calculatedTotal;

    // Load Company Logo
    let logoBase64 = null;
    try {
        const logoPath = path.join(process.cwd(), 'public', 'WhatsApp Image 2026-05-05 at 10.22.08 AM (2).jpeg');
        if (fs.existsSync(logoPath)) {
            logoBase64 = fs.readFileSync(logoPath).toString('base64');
        }
    } catch (e) {
        console.error("Failed to load logo image:", e);
    }

    // Load Stamp Image
    let stampBase64 = null;
    try {
        const stampPath = path.join(process.cwd(), 'public', '0.png');
        if (fs.existsSync(stampPath)) {
            stampBase64 = fs.readFileSync(stampPath).toString('base64');
        }
    } catch (e) {
        console.error("Failed to load stamp image:", e);
    }

    // Function to draw one page of the invoice
    const drawInvoicePage = (copyTitle) => {
        // Outer border
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.35);
        doc.rect(10, 10, 190, 277);

        // Header Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.text('Tax Invoice', 105, 14.5, { align: 'center' });
        
        doc.setFontSize(7.5);
        doc.text('GST SALES INVOICE', 105, 18.5, { align: 'center' });
        
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7.5);
        doc.text(copyTitle, 198, 14.5, { align: 'right' });

        // Horizontal Line below Header
        doc.setLineWidth(0.15);
        doc.line(10, 22, 200, 22);

        // Vertical Center Split for Seller & Metadata
        doc.line(105, 22, 105, 135);

        // --- SELLER INFO (Left, Y = 22 to 68) ---
        if (logoBase64) {
            try {
                doc.addImage(`data:image/jpeg;base64,${logoBase64}`, 'JPEG', 12, 24, 16, 16);
            } catch (err) {
                console.error("Error drawing logo on pdf:", err);
            }
        }
        
        const sellerX = logoBase64 ? 30 : 12;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.text('Indo Omakase Pvt Ltd', sellerX, 27);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.text('Plot No. 2, Bhim Colony, Sarai Allawardi', sellerX, 31);
        doc.text('Chauma Road, Palam Vihar, Gurugram', sellerX, 34.5);
        doc.text('Gurugram', sellerX, 38);
        
        doc.setFont('helvetica', 'bold');
        doc.text('GSTIN/UIN: 06AACCI7775D1ZI', sellerX, 42.5);
        
        doc.setFont('helvetica', 'normal');
        doc.text('State Name : Haryana, Code : 06', sellerX, 46.5);
        doc.text('CIN: U52390HR2011PTC044568', sellerX, 50.5);
        doc.text('Contact : 0124 5058389', sellerX, 54.5);
        doc.text('E-Mail : helpdesk@indoomakase.com', sellerX, 58.5);

        // Divider Line between Seller and Consignee
        doc.line(10, 68, 105, 68);

        // --- CONSIGNEE INFO (Left, Y = 68 to 102) ---
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.text('Consignee (Ship to)', 12, 71.5);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(billDetails.companyName, 12, 75.5);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(shipDetails.street, 12, 79.5);
        doc.text(`${shipDetails.city}${shipDetails.city ? ', ' : ''}${shipDetails.state} - ${shipDetails.zip}`, 12, 83.5);
        
        doc.setFont('helvetica', 'bold');
        doc.text(`GSTIN/UIN: ${billDetails.gstNumber || 'URD'}`, 12, 88.5);
        
        doc.setFont('helvetica', 'normal');
        doc.text(`PAN/IT No: ${customerPan || 'N/A'}`, 12, 92.5);
        doc.text(`State Name: ${shipState}, Code : ${shipStateCode}`, 12, 96.5);

        // Divider Line between Consignee and Buyer
        doc.line(10, 102, 105, 102);

        // --- BUYER INFO (Left, Y = 102 to 135) ---
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.text('Buyer (Bill to)', 12, 105.5);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(billDetails.companyName, 12, 109.5);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(shipDetails.street, 12, 113.5);
        doc.text(`${shipDetails.city}${shipDetails.city ? ', ' : ''}${shipDetails.state} - ${shipDetails.zip}`, 12, 117.5);
        
        doc.setFont('helvetica', 'bold');
        doc.text(`GSTIN/UIN: ${billDetails.gstNumber || 'URD'}`, 12, 122.5);
        
        doc.setFont('helvetica', 'normal');
        doc.text(`PAN/IT No: ${customerPan || 'N/A'}`, 12, 126.5);
        doc.text(`State Name: ${shipState}, Code : ${shipStateCode}`, 12, 130.5);

        // --- RIGHT INFO COLUMN (Y = 22 to 135) ---
        // Draw grid lines
        for (let y = 34; y <= 94; y += 12) {
            doc.line(105, y, 200, y);
            doc.line(152.5, y - 12, 152.5, y);
        }
        
        // Populate Right side grid
        // Row 1
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.text('Invoice No.', 107, 26);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(order.orderId, 107, 30);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.text('Dated', 154.5, 26);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(formatDate(order.createdAt), 154.5, 30);

        // Row 2
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.text('Delivery Note', 107, 38);
        
        doc.text('Mode/Terms of Payment', 154.5, 38);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(order.paymentDetails?.method || 'UPI/Manual', 154.5, 42);

        // Row 3
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.text('Reference No. & Date.', 107, 50);
        doc.text('Other References', 154.5, 50);

        // Row 4
        doc.text("Buyer's Order No.", 107, 62);
        doc.text('Dated', 154.5, 62);

        // Row 5
        doc.text('Dispatch Doc No.', 107, 74);
        doc.text('Delivery Note Date', 154.5, 74);

        // Row 6
        doc.text('Dispatched through', 107, 86);
        doc.text('Destination', 154.5, 86);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(shipDetails.city || 'India', 154.5, 90);

        // Row 7 (Terms of Delivery)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.text('Terms of Delivery', 107, 98);
        doc.setFontSize(7);
        doc.text('- Delivery within 5-7 working days after verification.', 107, 103);
        doc.text('- Goods once sold will not be returned.', 107, 107);
        doc.text('- Subject to Ghaziabad jurisdiction.', 107, 111);

        // --- ITEMS TABLE (Y = 135 to 200) ---
        // Header line
        doc.line(10, 135, 200, 135);
        
        // Header Text
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text('SI', 15, 139.5, { align: 'center' });
        doc.text('No.', 15, 143.5, { align: 'center' });
        
        doc.text('Description of Goods and Services', 22, 141.5);
        doc.text('HSN/SAC', 119, 141.5, { align: 'center' });
        doc.text('Quantity', 137, 141.5, { align: 'center' });
        doc.text('Rate', 159, 141.5, { align: 'right' });
        doc.text('per', 167, 141.5, { align: 'center' });
        doc.text('Disc. %', 177, 141.5, { align: 'center' });
        doc.text('Amount', 197, 141.5, { align: 'right' });

        // Line under headers
        doc.line(10, 145, 200, 145);

        // Draw items
        let currentY = 150;
        parsedItems.forEach((item, idx) => {
            if (currentY > 190) return; 

            // SI No
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.text((idx + 1).toString(), 15, currentY, { align: 'center' });

            // Description
            let nameY = currentY;
            let displayName = item.name;
            let subLines = [];
            if (item.name.includes('\n')) {
                const parts = item.name.split('\n');
                displayName = parts[0];
                subLines = parts.slice(1);
            } else if (item.name.includes(' - ')) {
                const parts = item.name.split(' - ');
                displayName = parts[0];
                subLines = parts.slice(1);
            }

            doc.setFont('helvetica', 'bold');
            doc.text(displayName, 22, nameY);
            
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(7);
            doc.setTextColor(80, 80, 80);
            subLines.forEach(line => {
                nameY += 3.5;
                doc.text(line.trim(), 22, nameY);
            });
            doc.setTextColor(0, 0, 0);

            // Rest columns
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.text(item.hsn, 119, currentY, { align: 'center' });
            
            doc.setFont('helvetica', 'bold');
            doc.text(`${item.qty.toLocaleString('en-IN')} PCS`, 137, currentY, { align: 'center' });
            doc.text(item.baseRate.toFixed(2), 159, currentY, { align: 'right' });
            
            doc.setFont('helvetica', 'normal');
            doc.text('PCS', 167, currentY, { align: 'center' });
            
            doc.setFont('helvetica', 'bold');
            doc.text(item.baseTotal.toFixed(2), 197, currentY, { align: 'right' });

            currentY = Math.max(nameY + 5.5, currentY + 5.5);
        });

        // Output GST lines inside the items table
        Object.keys(taxDetails).forEach(rateKey => {
            if (currentY > 195) return;
            const detail = taxDetails[rateKey];
            const ratePercent = parseFloat(rateKey);
            const taxAmount = detail.tax;

            if (isSameState) {
                // CGST
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8);
                doc.text(`Output CGST ${(ratePercent / 2).toFixed(1)}%`, 22, currentY);
                doc.text(`${(ratePercent / 2).toFixed(1)} %`, 159, currentY, { align: 'right' });
                doc.text((taxAmount / 2).toFixed(2), 197, currentY, { align: 'right' });
                currentY += 4;
                
                // SGST
                doc.text(`Output SGST ${(ratePercent / 2).toFixed(1)}%`, 22, currentY);
                doc.text(`${(ratePercent / 2).toFixed(1)} %`, 159, currentY, { align: 'right' });
                doc.text((taxAmount / 2).toFixed(2), 197, currentY, { align: 'right' });
                currentY += 4;
            } else {
                // IGST
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8);
                doc.text(`Output IGST ${ratePercent.toFixed(1)}%`, 22, currentY);
                doc.text(`${ratePercent.toFixed(1)} %`, 159, currentY, { align: 'right' });
                doc.text(taxAmount.toFixed(2), 197, currentY, { align: 'right' });
                currentY += 4;
            }
        });

        // Rounding Off Row
        if (Math.abs(roundedOff) > 0.001) {
            if (currentY <= 196) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.text('Less: Rounded Off (+/-)', 22, currentY);
                doc.text(roundedOff.toFixed(2), 197, currentY, { align: 'right' });
            }
        }

        // Draw vertical columns lines from Y = 135 to 200
        const columnsX = [10, 20, 110, 128, 146, 162, 172, 182, 200];
        columnsX.forEach(x => {
            doc.line(x, 135, x, 200);
        });

        // Total row outline & text
        doc.line(10, 200, 200, 200);
        doc.line(10, 206, 200, 206);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Total', 22, 204);
        doc.text(`${totalQty.toLocaleString('en-IN')} PCS`, 137, 204, { align: 'center' });
        doc.text(`Rs. ${finalRoundedTotal.toFixed(2)}`, 197, 204, { align: 'right' });

        // --- BOTTOM INFO BLOCKS (Y = 206 to 287) ---
        // Amount Chargeable in words
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.text('Amount Chargeable (in words)', 12, 210);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(numberToWords(finalRoundedTotal), 12, 214);
        doc.text('E. & O.E', 198, 214, { align: 'right' });

        // Tax details table (Y = 217 to 233)
        doc.line(10, 217, 200, 217);
        doc.line(10, 223, 200, 223);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text('HSN/SAC', 25, 221, { align: 'center' });
        doc.text('Taxable Value', 57.5, 221, { align: 'center' });

        if (isSameState) {
            doc.text('Central Tax', 95, 219.5, { align: 'center' });
            doc.text('Rate', 82.5, 222, { align: 'center' });
            doc.text('Amount', 102.5, 222, { align: 'center' });
            
            doc.text('State Tax', 135, 219.5, { align: 'center' });
            doc.text('Rate', 122.5, 222, { align: 'center' });
            doc.text('Amount', 142.5, 222, { align: 'center' });
        } else {
            doc.text('Integrated Tax', 115, 219.5, { align: 'center' });
            doc.text('Rate', 87.5, 222, { align: 'center' });
            doc.text('Amount', 127.5, 222, { align: 'center' });
        }
        doc.text('Total Tax Amount', 177.5, 221, { align: 'center' });

        // Draw vertical dividers for tax table headers
        doc.line(40, 217, 40, 223);
        doc.line(75, 217, 75, 223);
        doc.line(115, 217, 115, 223);
        doc.line(155, 217, 155, 223);
        doc.line(75, 220, 155, 220);
        if (isSameState) {
            doc.line(90, 220, 90, 222);
            doc.line(130, 220, 130, 222);
        } else {
            doc.line(100, 220, 100, 222);
        }

        // Draw tax rows
        let taxY = 223;
        Object.keys(taxDetails).forEach(rateKey => {
            const detail = taxDetails[rateKey];
            const ratePercent = parseFloat(rateKey);
            const rowY = taxY + 4;
            
            doc.line(10, taxY + 5, 200, taxY + 5);
            
            // vertical dividers
            doc.line(40, taxY, 40, taxY + 5);
            doc.line(75, taxY, 75, taxY + 5);
            doc.line(115, taxY, 115, taxY + 5);
            doc.line(155, taxY, 155, taxY + 5);
            if (isSameState) {
                doc.line(90, taxY, 90, taxY + 5);
                doc.line(130, taxY, 130, taxY + 5);
            } else {
                doc.line(100, taxY, 100, taxY + 5);
            }

            doc.setFont('helvetica', 'normal');
            doc.text(detail.hsn, 25, rowY, { align: 'center' });
            doc.text(detail.taxable.toFixed(2), 72, rowY, { align: 'right' });

            if (isSameState) {
                doc.text(`${(ratePercent / 2).toFixed(1)}%`, 82.5, rowY, { align: 'center' });
                doc.text((detail.tax / 2).toFixed(2), 112, rowY, { align: 'right' });
                
                doc.text(`${(ratePercent / 2).toFixed(1)}%`, 122.5, rowY, { align: 'center' });
                doc.text((detail.tax / 2).toFixed(2), 152, rowY, { align: 'right' });
            } else {
                doc.text(`${ratePercent.toFixed(1)}%`, 87.5, rowY, { align: 'center' });
                doc.text(detail.tax.toFixed(2), 152, rowY, { align: 'right' });
            }
            doc.text(detail.tax.toFixed(2), 197, rowY, { align: 'right' });

            taxY += 5;
        });

        // Draw total tax row
        const finalTaxY = taxY + 4;
        doc.line(10, taxY + 5, 200, taxY + 5);
        // dividers
        doc.line(40, taxY, 40, taxY + 5);
        doc.line(75, taxY, 75, taxY + 5);
        doc.line(115, taxY, 115, taxY + 5);
        doc.line(155, taxY, 155, taxY + 5);
        if (isSameState) {
            doc.line(90, taxY, 90, taxY + 5);
            doc.line(130, taxY, 130, taxY + 5);
        } else {
            doc.line(100, taxY, 100, taxY + 5);
        }
        
        doc.setFont('helvetica', 'bold');
        doc.text('Total', 25, finalTaxY, { align: 'center' });
        doc.text(totalTaxableVal.toFixed(2), 72, finalTaxY, { align: 'right' });
        if (isSameState) {
            doc.text((totalTaxAmount / 2).toFixed(2), 112, finalTaxY, { align: 'right' });
            doc.text((totalTaxAmount / 2).toFixed(2), 152, finalTaxY, { align: 'right' });
        } else {
            doc.text(totalTaxAmount.toFixed(2), 152, finalTaxY, { align: 'right' });
        }
        doc.text(totalTaxAmount.toFixed(2), 197, finalTaxY, { align: 'right' });
        
        taxY += 5;

        // Tax Amount in words
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.text('Tax Amount (in words) :', 12, taxY + 4);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text(numberToWords(totalTaxAmount), 42, taxY + 4);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text(`Company's PAN : AACCI7775D`, 12, taxY + 10);

        // Line above declaration/bank details
        doc.line(10, taxY + 13, 200, taxY + 13);

        // Declaration & Bank details split vertical
        doc.line(105, taxY + 13, 105, taxY + 31);
        doc.line(10, taxY + 31, 200, taxY + 31);

        // Declaration
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text('Declaration:', 12, taxY + 17);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        const declText = "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.";
        doc.text(doc.splitTextToSize(declText, 90), 12, taxY + 21);

        // Bank Details
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text("Company's Bank Details:", 107, taxY + 17);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.text('A/c Holder\'s Name : Indo Omakase Pvt Ltd (Ggn)', 107, taxY + 20);
        doc.text('Bank Name              : HDFC Bank', 107, taxY + 23);
        doc.text('A/c No.                    : 5020008678169', 107, taxY + 26);
        doc.text('Branch & IFS Code  : SECTOR 23, GURGAON & HDFC0000616', 107, taxY + 29);

        // Signatures split vertical (Y = 264 to 287)
        doc.line(105, taxY + 31, 105, 287);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.text('Customer\'s Seal and Signature', 12, 283);

        doc.setFont('helvetica', 'bold');
        doc.text('for Indo Omakase Pvt Ltd', 198, taxY + 35, { align: 'right' });
        
        // Draw physical stamp seal and signature image
        if (stampBase64) {
            try {
                const sigTop = taxY + 31;
                const sigBottom = 287;
                const sigMiddleY = (sigTop + sigBottom) / 2;
                const stampSize = 21; // 21mm x 21mm size fits perfectly
                const stampImageY = sigMiddleY - (stampSize / 2) - 1;
                const stampImageX = 165 - (stampSize / 2);
                doc.addImage(`data:image/png;base64,${stampBase64}`, 'PNG', stampImageX, stampImageY, stampSize, stampSize);
            } catch (err) {
                console.error("Error drawing stamp image on pdf:", err);
            }
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.text('Authorised Signatory', 198, 283, { align: 'right' });

        // Center bottom computer generated message
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(6.5);
        doc.text('This is a Computer Generated Invoice', 105, 292, { align: 'center' });
    };

    // Draw Page 1: Original for Recipient
    drawInvoicePage('(ORIGINAL FOR RECIPIENT)');

    // Draw Page 2: Duplicate for Transporter
    doc.addPage();
    drawInvoicePage('(DUPLICATE FOR TRANSPORTER)');

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

    ${(order.status === 'Shipped' || order.status === 'Delivered') && order.trackingId ? `
        <div style="background-color: #f9fafb; padding: 25px; border-radius: 20px; font-size: 14px; margin: 25px 0; text-align: left; border: 1px solid #f3f4f6;">
            <p style="margin: 0 0 10px; font-size: 10px; font-weight: 900; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">Logistics & Tracking Details</p>
            <p style="margin: 0; color: #374151; font-weight: 700;">Delivery Partner: <strong style="color: #111;">${order.deliveryPartner || 'Standard Courier'}</strong></p>
            <p style="margin: 5px 0 0; color: #374151; font-weight: 700;">Tracking ID: <strong style="color: #111; font-family: monospace; letter-spacing: 1px;">${order.trackingId}</strong></p>
        </div>
    ` : ''}

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
