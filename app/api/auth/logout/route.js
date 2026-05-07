import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const response = NextResponse.json({
            message: 'Logout successful'
        }, { status: 200 });

        // Clear the token cookie
        response.cookies.set('token', '', {
            httpOnly: true,
            expires: new Date(0), // Expire immediately
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
