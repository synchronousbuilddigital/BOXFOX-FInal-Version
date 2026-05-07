import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { rateLimit, getIP } from '@/lib/rateLimit';

const limiter = rateLimit({ interval: 10 * 60 * 1000 }); // 10 minutes

export async function POST(req) {
    try {
        try {
            const ip = getIP(req);
            await limiter.check(5, ip); // 5 requests per 10 minutes
        } catch {
            return NextResponse.json({ error: 'Too Many Checkout Attempts. Please try again later.' }, { status: 429 });
        }

        const { txnid, amount, productinfo, firstname, email, udf1, udf2, udf3, udf4, udf5 } = await req.json();

        const key = process.env.PAYU_MERCHANT_KEY;
        const salt = process.env.PAYU_MERCHANT_SALT;

        // hashSequence = key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
        const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1 || ''}|${udf2 || ''}|${udf3 || ''}|${udf4 || ''}|${udf5 || ''}||||||${salt}`;

        const hash = crypto.createHash('sha512').update(hashString).digest('hex');

        return NextResponse.json({ hash });
    } catch (e) {
        console.error("PayU Hash Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
