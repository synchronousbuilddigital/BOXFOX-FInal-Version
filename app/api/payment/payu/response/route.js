import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function POST(req) {
    try {
        await dbConnect();
        const formData = await req.formData();
        const data = Object.fromEntries(formData.entries());

        const { status, txnid, amount, productinfo, firstname, email, hash, udf1 } = data;
        const key = process.env.PAYU_MERCHANT_KEY;
        const salt = process.env.PAYU_MERCHANT_SALT;

        // Verify Hash
        // sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
        const hashSequence = `${salt}|${status}||||||${data.udf5 || ''}|${data.udf4 || ''}|${data.udf3 || ''}|${data.udf2 || ''}|${udf1 || ''}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
        const generatedHash = crypto.createHash('sha512').update(hashSequence).digest('hex');

        if (!generatedHash || generatedHash !== hash) {
            console.error("Hash Mismatch! Potential Tampering.");
            return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
        }

        const orderId = txnid; // We used order's numeric ID or a unique txn ID
        const order = await Order.findOne({ orderId });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (status === 'success') {
            await Order.findOneAndUpdate(
                { orderId: orderId },
                {
                    paid: true,
                    status: 'Processing',
                    paymentResponse: data
                }
            );
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout?status=success&orderId=${orderId}`, 303);
        } else {
            await Order.findOneAndUpdate(
                { orderId: orderId },
                {
                    status: 'Pending',
                    paymentResponse: data
                }
            );
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout?status=failure&orderId=${orderId}`, 303);
        }
    } catch (e) {
        console.error("PayU Response Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
