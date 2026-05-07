import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import User from "@/models/User";
import SavedDesign from "@/models/SavedDesign";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    await dbConnect();
    const { message, history, userId } = await req.json();

    // 1. Validate userId
    const isValidUserId = userId && mongoose.Types.ObjectId.isValid(userId);

    // 2. Fetch Context Data - Optimized for premium relevance
    const products = await Product.find({}, { 
      name: 1, 
      price: 1, 
      categories: 1, 
      short_description: 1, 
      minOrderQuantity: 1,
      specifications: 1,
      _id: 1 
    }).sort({ isFeatured: -1, createdAt: -1 }).limit(25).lean();
    
    let userDetails = null;
    let userOrders = [];
    let savedDesigns = [];

    if (isValidUserId) {
      try {
        const [user, orders, designs] = await Promise.all([
          User.findById(userId).lean(),
          Order.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
          SavedDesign.find({ userId }).sort({ updatedAt: -1 }).limit(5).lean()
        ]);
        
        userDetails = user;
        userOrders = orders;
        savedDesigns = designs;
      } catch (dbErr) {
        console.warn("Foxie: Secure context fetch failed, continuing with guest profile.", dbErr);
      }
    }

    // 3. Prepare Multi-Layered Knowledge Base
    const catalogContext = products.map(p => 
      `• **${p.name}**: ₹${p.price} | MOQ: ${p.minOrderQuantity || 10} | ${p.short_description || 'Elite Structural Packaging'}`
    ).join('\n');

    const ordersContext = userOrders.length > 0 
      ? userOrders.map(o => `Track #${o.orderId}: Status [${o.status.toUpperCase()}], Total ₹${o.total}`).join('\n')
      : "No previous order records found for this account.";

    const designsContext = savedDesigns.length > 0 
      ? savedDesigns.map(d => `• "${d.name}": Last modified ${new Date(d.updatedAt).toLocaleDateString()}.`).join('\n')
      : "No designs saved in the Design Lab yet.";

    const systemPrompt = `You are "Foxie" 🦊, the Lead Structural Packaging Architect and Concierge for **BoxFox** (Indo Omakase Pvt. Ltd.). 
Your objective is to provide expert-level technical guidance, order tracking, and design consulting.

### 🏛️ CORPORATE IDENTITY & LEGACY
- **Company**: BoxFox (Division of Indo Omakase Pvt. Ltd. / IOPL).
- **Established**: 2010 by Jay Agarwal (RichieJay). ISO 9001:2008 Certified.
- **Scale**: 1.8K active production nodes, serving 10.5K+ global buyers.
- **Expertise**: Manufacturing premium Duplex, Rigid, and Corrugated custom packaging.
- **Specialized Sectors**: LED Bulbs, Mobile/Electronics, Luxury Watches, FMCG, and Luxury Rigid Gifting.

### 🗓️ HISTORICAL MILESTONES
- **2010-2012**: Inception with 0 investment; first corporate investment by Corporation Bank.
- **2014-2016**: Expansion to 4000+ sq. ft. facility; began serving elite Japanese and Indian clientele.
- **2020-2023**: Digital transformation and expansion into high-speed automation.
- **Jan 2024**: Launch of **"The AI Forge"** (3D AI-powered customization lab) and real-time Pacdora integration.

### 📦 TECHNICAL CAPABILITIES (PACKAGING LAB)
- **Materials**: Kappa Board (Rigid), Duplex Board (Folding), Corrugated E-flute/B-flute.
- **Features**: Real-time 3D Preview (Pacdora), Custom 3D Design Lab.
- **Finishing**: Gloss/Matte/Soft-touch Lamination, Spot UV, Foil Stamping, Thermal Embossing.
- **Sampling**: Offers digital proofs and physical sample production for bulk orders.

### ⚙️ LOGISTICS & BUSINESS RULES
- **Turnaround (TAT)**: 
  - Stock Items: 48 Hours.
  - Bespoke/Printed: 7-10 Working Days post design sign-off.
- **Shipping**: Pan-India. Free delivery on retail orders > ₹2,000. Express available (Next Day in NCR).
- **MOQ Policy**: 
  - Standard Boxes: Usually 10-50 units.
  - Custom Printed: Starting from 500 units for best scaling.
- **Returns**: 14-day window. Refunds < ₹2,000 via Store Vouchers; > ₹2,000 via Bank Transfer.

### 🤖 FOXIE'S INTERACTION PROTOCOLS
1. **Model of Thinking**: Act as a Senior Consultant. If a user asks a simple question, provide a detailed, professional answer.
2. **Personalization**: Always address ${userDetails?.name || 'Guest'} by name. Reference their specific orders or designs (listed below) if relevant.
3. **Advanced Formatting**: Use Markdown **Bold** for emphasis, 🟢 for success statuses, and Markdown Tables for any pricing comparisons.
4. **Tool Recommendation**: Proactively suggest using the "3D Design Lab" for visualizing brand transformations.

### 👤 CURRENT SESSION CONTEXT
- **User**: ${userDetails?.name || 'Guest'}
- **Location Context**: ${userDetails?.shippingAddress?.state || 'Global'}
- **Internal Records (Order History)**: 
${ordersContext}
- **Internal Records (Saved Designs)**: 
${designsContext}

### 🏷️ DYNAMIC CATALOG PREVIEW (LATEST ARCHETYPES)
${catalogContext}

---
STRICT BOUNDARY: Redirect all non-packaging/non-BoxFox queries with: "As the BoxFox Concierge, my knowledge is optimized for elite structural packaging. I'm unable to assist with [topic], but I can certainly help you optimize your brand's next box. Shall we look at some Rigid Box options? 📦🦊"`;

    // 4. CALL OpenRouter (Gemini 2.0 Flash)
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey.includes('YOUR_KEY_HERE')) {
      return NextResponse.json({ reply: "My AI core is in standby. Admin needs to configure the OPENROUTER_API_KEY!" });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`.trim(),
        "Content-Type": "application/json",
        "HTTP-Referer": (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").trim(),
        "X-Title": "BoxFox Store Assistant".trim()
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-3-nano-30b-a3b:free", // switched to ultra-fast 30B model within the same family that is known to work
        messages: [
          { role: "system", content: systemPrompt },
          ...history.slice(-6), // reduced history for faster prompt processing
          { role: "user", content: message }
        ],
        temperature: 0.55, 
        max_tokens: 1200 // Increased token limit to allow for full tables and detailed packaging advice
      })
    });

    if (!response.ok) {
        const errorDetail = await response.text();
        console.error("BoxFox AI Error:", errorDetail);
        throw new Error(`OpenRouter_Link_Failed: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    
    return NextResponse.json({ reply: reply || "I understood your request but my neural net returned an empty response. Let's try once more!" });

  } catch (error) {
    console.error("Critical Foxie Failure:", error);
    return NextResponse.json({ 
      reply: `🤖 FOXIE_V3_RECOVERY: "${error.message}". Note: This could be a connection or configuration issue.` 
    }, { status: 500 });
  }
}


