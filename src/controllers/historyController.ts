
import GoalHistoryModel from '@/models/GoalHistory';
import connectDB from '@/lib/db';

export async function getHistory(userId: string, period?: string) {
    await connectDB();
    const query: any = { userId };
    if (period) {
        query.period = period;
    }
    // Sort by date descending (newest first)
    return await GoalHistoryModel.find(query).sort({ date: -1 });
}
