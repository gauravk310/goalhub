
import { NextResponse } from 'next/server';
import { runScheduledTasks } from '@/controllers/cronController';
import connectDB from '@/lib/db';

// Prevent caching for this route
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        const results = await runScheduledTasks();

        return NextResponse.json({
            success: true,
            message: 'Scheduled tasks processed',
            results
        });
    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
