import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    try {
        const { taskId } = await params;
        const apiKey = process.env.FREEPIK_API_KEY;

        if (!apiKey || apiKey === 'your_freepik_api_key_here') {
            return NextResponse.json({
                error: "Config Error",
                message: "Freepik API key not configured"
            }, { status: 500 });
        }

        const response = await fetch(`https://api.freepik.com/v1/ai/text-to-image/flux-dev/${taskId}`, {
            headers: {
                'x-freepik-api-key': apiKey
            },
            cache: 'no-store'
        });

        const data = await response.json();


        return NextResponse.json(data);
    } catch (error) {
        console.error("Status check proxy error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            message: error.message
        }, { status: 500 });
    }
}
