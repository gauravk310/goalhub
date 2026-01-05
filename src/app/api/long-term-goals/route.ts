
import { NextRequest, NextResponse } from 'next/server';
import { getLongTermGoals, createLongTermGoal } from '@/controllers/longTermGoalController';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const goals = await getLongTermGoals(user.userId);
        return NextResponse.json(goals);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const goal = await createLongTermGoal(req, user.userId);
        return NextResponse.json(goal, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
