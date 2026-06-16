import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Coupon from '@/models/Coupon';
import Product from '@/models/Product';
import UserImage from '@/models/UserImage';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import jwt from 'jsonwebtoken';
import { finalizeImagesInObject } from '@/lib/image-finalizer';
import { 
    sendEmail, 
    getAdminOrderTemplate, 
    getUserOrderTemplate, 
    generateInvoicePDF,
    getStatusUpdateTemplate
} from '@/lib/mail';

const parseMoney = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const parsed = parseFloat(value.replace(/[^0-9.]/g, ''));
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
};

const normalizeCouponCode = (value) => {
    if (typeof value !== 'string') return '';
    return value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
};

const buildShippingAddress = (shipping = {}) => {
    const parts = [shipping.address, shipping.city, shipping.state].filter(Boolean);
    return parts.join(', ');
};

const validateOrderPayload = (orderData) => {
    if (!orderData || typeof orderData !== 'object') {
        return 'Invalid order payload';
    }

    const items = Array.isArray(orderData.items) ? orderData.items : [];
    if (items.length === 0) {
        return 'Order must contain at least one item';
    }

    const validItems = items.every((item) => {
        if (!item || typeof item !== 'object') return false;
        if (!item.productId) return false;

        const quantity = Number(item.quantity || 0);
        const unitPrice = parseMoney(item.price);

        return Number.isFinite(quantity) && quantity > 0 && Number.isFinite(unitPrice) && unitPrice >= 0;
    });

    if (!validItems) {
        return 'One or more order items are invalid';
    }

    const total = parseMoney(orderData.total);
    if (!Number.isFinite(total) || total < 0) {
        return 'Order total is invalid';
    }

    const customer = orderData.customer || {};
    if (!customer.email || !customer.phone) {
        return 'Customer email and phone number are required';
    }

    const cleanPhone = String(customer.phone).replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
        return 'A valid 10-digit phone number is required';
    }

    const shipping = orderData.shipping || orderData.shippingAddress || {};
    const street = shipping.street || shipping.address;
    const city = shipping.city;
    const zipCode = shipping.zipCode || shipping.postalCode;
    const state = shipping.state;

    if (!street || !city || !zipCode || !state) {
        return 'Complete shipping details (Street, City, State, Zip) are required';
    }

    return null;
};


export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (id) {
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
            const query = isValidObjectId ? { $or: [{ orderId: id }, { _id: id }] } : { orderId: id };
            const order = await Order.findOne(query);
            if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            return NextResponse.json(order);
        }

        const orders = await Order.find().sort({ createdAt: -1 });
        return NextResponse.json(orders);
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}


export async function POST(req) {
    try {
        await dbConnect();
        const orderData = await req.json();
        const validationError = validateOrderPayload(orderData);

        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: 'Please login to place an order' }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_development_purposes');
        } catch (error) {
            return NextResponse.json({ success: false, error: 'Please login to place an order' }, { status: 401 });
        }

        if (!orderData.userId) {
            orderData.userId = decoded.id;
        }

        if (validationError) {
            return NextResponse.json({ success: false, error: validationError }, { status: 400 });
        }

        // Generate a clean numeric order ID
        const count = await Order.countDocuments();
        const orderId = `ORD-${1001 + count}`;
        const normalizedCouponCode = normalizeCouponCode(orderData.couponCode);
        const shipping = orderData.shipping || orderData.shippingAddress || {};
        const total = Math.round(parseMoney(orderData.total) * 100) / 100;

        if (normalizedCouponCode) {
            const couponExists = await Coupon.findOne({ code: normalizedCouponCode }).select('_id');
            if (!couponExists) {
                return NextResponse.json({ success: false, error: 'Invalid coupon code' }, { status: 400 });
            }
        }

        const newOrder = await Order.create({
            ...orderData,
            paymentDetails: orderData.paymentDetails,
            billingDetails: orderData.billingDetails,
            couponCode: normalizedCouponCode || undefined,
            shipping,
            total,
            orderId,
            status: 'Pending'
        });

        // 1. If coupon was used, increment usage count
        if (normalizedCouponCode) {
            await Coupon.findOneAndUpdate(
                { code: normalizedCouponCode },
                { $inc: { usageCount: 1 } }
            );
        }

        // 2. Decrement stock for standard retail products
        if (orderData.items && orderData.items.length > 0) {
            for (const item of orderData.items) {
                // Skip stock decrement for custom lab items (they have string IDs like "123-456")
                const isVObjectId = /^[0-9a-fA-F]{24}$/.test(item.productId);
                const isNumeric = item.productId && !isNaN(Number(item.productId));

                if (item.productId && (isVObjectId || isNumeric)) {
                    try {
                        const productQuery = isVObjectId 
                            ? { $or: [{ _id: item.productId }, { wpId: isNumeric ? Number(item.productId) : undefined }] }
                            : { wpId: Number(item.productId) };

                        await Product.findOneAndUpdate(
                            productQuery,
                            { $inc: { stock_quantity: -(item.quantity || 1) } }
                        );
                    } catch (err) {
                        console.error(`Failed to update stock for product ${item.productId}:`, err.message);
                    }
                }
            }
        }

        // 3. Send Order Emails
        const emailCommonData = {
            orderId: newOrder.orderId,
            customerName: newOrder.customer?.name || 'Customer',
            customerEmail: newOrder.customer?.email,
            totalAmount: newOrder.total || 0,
            discount: newOrder.discount || 0,
            shippingAddress: buildShippingAddress(newOrder.shipping),
            billingDetails: newOrder.billingDetails,
            status: newOrder.status,
            items: newOrder.items || [],
        };

        // PDF Invoice Generation
        const invoicePdf = generateInvoicePDF(emailCommonData);

        // Notify Admin
        await sendEmail({
            to: process.env.EMAIL_USER,
            subject: `🚀 New Order Received: ${newOrder.orderId}`,
            html: getAdminOrderTemplate(emailCommonData)
        });

        // Notify User with Invoice
        if (newOrder.customer?.email) {
            await sendEmail({
                to: newOrder.customer.email,
                subject: `Order Confirmed: ${newOrder.orderId}`,
                html: getUserOrderTemplate(emailCommonData),
                attachments: [
                    {
                        filename: `Invoice-${newOrder.orderId}.pdf`,
                        content: invoicePdf
                    }
                ]
            });
        }

        // 4. Finalize Images (Mark them as permanent in UserImage collection)
        try {
            await finalizeImagesInObject(orderData);
        } catch (err) {
            console.error("Image Finalization Error:", err);
        }

        return NextResponse.json({ success: true, orderId: newOrder.orderId });
    } catch (e) {
        console.error("Order Creation Error:", e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        await dbConnect();
        const { id, status, labNotes, paymentDetails, paid } = await req.json();

        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
        const query = isValidObjectId ? { $or: [{ orderId: id }, { _id: id }] } : { orderId: id };

        const currentOrder = await Order.findOne(query);
        const prevStatus = currentOrder?.status;

        const order = await Order.findOne(query);

        if (order) {
            if (status !== undefined) order.status = status;
            if (labNotes !== undefined) order.labNotes = labNotes;
            if (paymentDetails !== undefined) order.paymentDetails = paymentDetails;
            if (paid !== undefined) order.paid = paid;

            await order.save();

            // Handle Vendor Wallet Credit if paid or Delivered
            if ((paid === true && !currentOrder.paid) || (status === 'Delivered' && currentOrder.status !== 'Delivered') || (currentOrder.paid || currentOrder.status === 'Delivered')) {
                const existingTx = await WalletTransaction.findOne({ referenceId: order.orderId, type: 'credit' });
                if (!existingTx) {
                    for (const item of order.items) {
                        const isVObjectId = /^[0-9a-fA-F]{24}$/.test(item.productId);
                        const isNumeric = item.productId && !isNaN(Number(item.productId));
                        if (item.productId && (isVObjectId || isNumeric)) {
                            const productQuery = isVObjectId 
                                ? { $or: [{ _id: item.productId }, { wpId: isNumeric ? Number(item.productId) : undefined }] }
                                : { wpId: Number(item.productId) };
                            
                            const product = await Product.findOne(productQuery);
                            if (product && product.vendorId) {
                                const vendor = await User.findById(product.vendorId);
                                if (vendor) {
                                    const commissionRate = vendor.commissionRate || 0;
                                    const itemTotal = parseFloat(item.price) * (item.quantity || 1);
                                    const vendorCut = itemTotal * (1 - (commissionRate / 100));
                                    
                                    await WalletTransaction.create({
                                        vendorId: vendor._id,
                                        type: 'credit',
                                        amount: vendorCut,
                                        status: 'completed',
                                        description: `Sale from Order ${order.orderId} - ${item.name}`,
                                        referenceId: order.orderId
                                    });
                                    
                                    vendor.walletBalance = (vendor.walletBalance || 0) + vendorCut;
                                    vendor.totalEarned = (vendor.totalEarned || 0) + vendorCut;
                                    await vendor.save();
                                }
                            }
                        }
                    }
                }
            }

            // Trigger status update email if it changed
            if (status && status !== prevStatus && order.customer?.email) {
                await sendEmail({
                    to: order.customer.email,
                    subject: `Update on Order ${order.orderId}: ${status}`,
                    html: getStatusUpdateTemplate(order)
                });
            }
            return NextResponse.json({ success: true, order });
        }
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    } catch (e) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
