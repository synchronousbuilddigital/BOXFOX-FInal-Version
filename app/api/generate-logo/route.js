import jwt from 'jsonwebtoken';
import { rateLimit, getIP } from '@/lib/rateLimit';

const limiter = rateLimit({ interval: 30 * 60 * 1000 }); // 30 minutes

export async function POST(req) {
  try {
    const token = req.cookies.get('token')?.value;
    let userId = null;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_development_purposes');
            userId = decoded.id;
        } catch (err) { }
    }

    // Rate limiting logic
    try {
        const ip = getIP(req);
        const rateLimitKey = userId ? `user_logo_${userId}` : `ip_logo_${ip}`;
        const maxRequests = userId ? 20 : 4; 
        await limiter.check(maxRequests, rateLimitKey);
    } catch {
        return NextResponse.json({
            error: "LIMIT_REACHED",
            message: userId 
                ? "Too many logo generation requests. Please wait 30 minutes."
                : "Guest limit reached (4 AI logos). Please login for more!"
        }, { status: 429 });
    }

    const { prompt, style, color } = await req.json();

    if (!process.env.FREEPIK_API_KEY) {
      return NextResponse.json({ error: "Freepik API key not configured" }, { status: 500 });
    }

    // Build a refined prompt for logo generation
    const refinedPrompt = `Minimalist professional logo, ${prompt}, ${style ? `style: ${style},` : ""} ${color ? `primary color: ${color},` : ""} high quality vector style, clean white background, isolated, professional branding graphic`;

    const response = await fetch("https://api.freepik.com/v1/ai/text-to-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "x-freepik-api-key": process.env.FREEPIK_API_KEY,
      },
      body: JSON.stringify({
        prompt: refinedPrompt,
        negative_prompt: "photorealistic, 3d, shadows, background, text, words, letters, blurry, low resolution",
        num_images: 1,
        image: {
            size: "square_1_1"
        },
        styling: {
            style: "vector"
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Freepik API Error:", errorData);
      return NextResponse.json({ error: "Failed to generate logo", details: errorData }, { status: response.status });
    }

    const data = await response.json();
    // Freepik usually returns an array of images with base64 or URL
    const imageUrl = data.data?.[0]?.url || data.data?.[0]?.base64;

    if (!imageUrl) {
        return NextResponse.json({ error: "No image generated" }, { status: 500 });
    }

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error("Generate Logo Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
