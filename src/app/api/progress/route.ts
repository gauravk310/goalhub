
import { NextRequest, NextResponse } from 'next/server';
import { getAllUserProgress } from '@/controllers/progressController';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const progress = await getAllUserProgress(user.userId);
        return NextResponse.json(progress);
    } catch (error: any) {
        console.error('Error fetching all user progress:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
