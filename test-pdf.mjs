import { generateInvoicePDF } from './lib/mail.js';
import fs from 'fs';

const mockOrder = {
    orderId: "ORD-1019",
    customerName: "Prasad Shaswat",
    customerEmail: "prasadshaswat9265@gmail.com",
    totalAmount: 20,
    discount: 180,
    shippingAddress: "Silver Residency Dindoli surat 118, Surat, Gujarat",
    status: "Pending",
    paymentMethod: "Razorpay / UPI",
    transactionId: "pay_PFnK9l8w4XQvHz",
    items: [
        { name: "Wrap Box (Small) - 0.6x2.9x8.5", quantity: 10, price: 12 },
        { name: "Premium Wrap Sleeve (Standard) - 2.8x8.25", quantity: 10, price: 8 }
    ]
};

try {
    console.log("Generating PDF...");
    const pdfBuffer = generateInvoicePDF(mockOrder);
    fs.writeFileSync('test_invoice.pdf', pdfBuffer);
    console.log("Success! PDF saved as test_invoice.pdf");
} catch (error) {
    console.error("Error generating PDF:", error);
}
