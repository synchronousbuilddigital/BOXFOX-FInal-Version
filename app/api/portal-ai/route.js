import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Quotation from '@/models/Quotation';

function getUserFromToken(req) {
    const token = req.cookies.get('token')?.value;
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_development_purposes');
    } catch { return null; }
}

export async function POST(req) {
    try {
        await dbConnect();

        const decoded = getUserFromToken(req);
        const { message, history } = await req.json();

        // Load caller context
        let caller = null;
        let role = 'guest';
        let liveContext = '';

        if (decoded?.id) {
            caller = await User.findById(decoded.id).lean();
            role = caller?.role || 'guest';
        }

        // Pull relevant live data depending on role
        if (role === 'admin') {
            const [quotes, vendors] = await Promise.all([
                Quotation.find({}).sort({ createdAt: -1 }).limit(20).lean(),
                User.find({ role: 'vendor' }).sort({ createdAt: -1 }).lean()
            ]);

            const pendingQuotes = quotes.filter(q => q.status === 'pending').length;
            const allottedQuotes = quotes.filter(q => q.status === 'allotted').length;
            const approvedVendors = vendors.filter(v => v.vendorStatus === 'approved').length;
            const pendingVendors = vendors.filter(v => v.vendorStatus === 'pending').length;

            liveContext = `
### 📊 LIVE ADMIN DASHBOARD SNAPSHOT
- **Total Quotes**: ${quotes.length} (${pendingQuotes} pending, ${allottedQuotes} allotted)
- **Total Partners in Directory**: ${vendors.length} (${approvedVendors} approved, ${pendingVendors} awaiting approval)
- **Recent Quote IDs (last 5)**: ${quotes.slice(0, 5).map(q => `#${String(q._id).slice(-6).toUpperCase()} [${q.status}] – ${q.user?.name || 'N/A'}`).join(', ')}
- **Approved Partners**: ${vendors.filter(v => v.vendorStatus === 'approved').map(v => `${v.name} (${v.vendorCategory || 'Unclassified'})`).join(', ') || 'None yet'}
- **Anomaly Check**: ${quotes.some(q => q.vendorAmount > q.totalAmount) ? '⚠️ ALERT: One or more quotes have vendor payout exceeding user amount!' : '✅ All payouts within valid range'}`;

        } else if (role === 'vendor' && caller) {
            const myQuotes = await Quotation.find({ assignedVendor: caller._id }).sort({ createdAt: -1 }).lean();
            liveContext = `
### 📦 YOUR ALLOCATED PROJECTS (Partner: ${caller.name})
- **Status**: ${caller.vendorStatus === 'approved' ? '✅ Approved Partner' : '⏳ Pending Approval'}
- **Category**: ${caller.vendorCategory || 'Not set'}
- **Total Allocated Projects**: ${myQuotes.length}
- **Projects by Status**: ${['allotted', 'in-progress', 'completed'].map(s => `${s}: ${myQuotes.filter(q => q.status === s).length}`).join(' | ')}
- **Latest Projects**: ${myQuotes.slice(0, 3).map(q => `Order #${String(q._id).slice(-6).toUpperCase()} [${q.status}] — Payout: ₹${q.vendorAmount || 0}`).join(', ') || 'No projects yet'}`;
        }

        const systemPrompt = `You are an AI assistant embedded in the BoxFox Manufacturing Portal — a B2B platform connecting corporate gifting clients with verified manufacturing and packaging partners.

## YOUR ROLE & IDENTITY
- You assist **admins**, **manufacturing partners (vendors)**, and **clients** in managing the portal.
- Current user: **${caller?.name || 'Guest'}** | Role: **${role.toUpperCase()}**
- Respond concisely, accurately, and action-oriented.

## THE FOUR CORE MODULES

### 1. ALLOCATED PROJECTS
Orders assigned to manufacturing partners. Each order has:
- Order ID, status (allotted → in-progress → completed), client contact
- Production items, quantity, settlement amount, vendor payout
- Partners can download specs

### 2. GIFTING QUOTES  
Custom gifting quotation requests. Each quote shows:
- Client name & contact, requested items, quantity
- Assigned manufacturing partner
- User amount (client pays) & vendor payout (partner receives)
- Admins assign partners and set both amounts
- Status flow: pending → allotted → completed

### 3. DIRECTORY
Vendor/partner registry. Each entry: partner name, business name, emails, phone, category (Packaging/Printing/Logistics/Gifts), approval status.
- Admins can approve or reject applications
- Only approved partners can be assigned to quotes

### 4. PARTNER APPLICATION
Onboarding form for new manufacturing partners. Collects: contact name, business name, work email, phone, specialization category, access password.

## BUSINESS RULES
- Vendor payout ≤ user amount (BoxFox keeps the margin)
- Partners must be **approved** in Directory before being assignable to quotes
- Order status flow: allotted → in-progress → completed
- Quote status flow: pending → allotted → completed/cancelled
- Response SLA for quotation requests: **4 working hours**
- Flag anomalies proactively (e.g. vendor payout > user amount, unverified partner assigned)

${liveContext}

## RESPONSE GUIDELINES
- For admins: help manage orders, assign vendors, approve/reject partners, resolve disputes, flag issues
- For vendors: help understand allocated orders, payouts, and spec downloads
- For clients: help track quote status and order progress
- Use ₹ for Indian Rupee amounts
- Keep responses short and actionable unless detailed breakdown is requested
- If anomalies exist in the live data, flag them first`;

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey || apiKey.includes('YOUR_KEY_HERE')) {
            return NextResponse.json({ reply: '⚙️ Portal AI is offline — Admin needs to configure OPENROUTER_API_KEY.' });
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`.trim(),
                'Content-Type': 'application/json',
                'HTTP-Referer': (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').trim(),
                'X-Title': 'BoxFox Portal AI'
            },
            body: JSON.stringify({
                model: 'nvidia/nemotron-3-nano-30b-a3b:free',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...(history || []).slice(-8),
                    { role: 'user', content: message }
                ],
                temperature: 0.4,
                max_tokens: 800
            })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('Portal AI Error:', err);
            throw new Error(`OpenRouter_Error: ${response.status}`);
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;
        return NextResponse.json({ reply: reply || 'No response from AI. Please try again.' });

    } catch (error) {
        console.error('Portal AI Failure:', error);
        return NextResponse.json({ reply: `Portal AI Error: ${error.message}` }, { status: 500 });
    }
}
