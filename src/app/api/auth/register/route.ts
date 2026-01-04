
import { NextResponse } from 'next/server';
import { registerUser } from '@/controllers/authController';

export async function POST(req: Request) {
    try {
        const user = await registerUser(req);
        return NextResponse.json(user, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
