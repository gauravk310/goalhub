
import { NextResponse } from 'next/server';
import { loginUser } from '@/controllers/authController';


export async function POST(req: Request) {
    try {
        const session = await loginUser(req);

        const response = NextResponse.json(session, { status: 200 });

        response.cookies.set({
            name: 'session_token',
            value: session.token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            expires: new Date(session.expiresAt),
        });

        return response;
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
}
