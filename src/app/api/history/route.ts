
import { NextRequest, NextResponse } from 'next/server';
import { getHistory } from '@/controllers/historyController';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period') || undefined;

        const history = await getHistory(user.userId, period);
        return NextResponse.json(history);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
