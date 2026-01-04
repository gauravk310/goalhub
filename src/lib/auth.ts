
import { NextRequest } from 'next/server';
import Session from '@/models/Session';
import connectDB from '@/lib/db';

export async function getUserFromRequest(req: NextRequest) {
    await connectDB();
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return null;
    }

    const session = await Session.findOne({ token });

    if (!session || new Date() > session.expiresAt) {
        return null;
    }

    return { userId: session.userId };
}
