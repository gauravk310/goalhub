
import { NextResponse } from 'next/server';
import { loginUser } from '@/controllers/authController';

export async function POST(req: Request) {
    try {
        const session = await loginUser(req);
        return NextResponse.json(session, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
}
