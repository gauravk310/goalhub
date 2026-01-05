
import GoalModel from '@/models/Goal';
import GoalHistoryModel from '@/models/GoalHistory';
import { startOfDay, subDays, startOfWeek, subWeeks, startOfMonth, subMonths, format } from 'date-fns';

/**
 * Processes goal resets and history recording.
 * Should be called once per day (ideally at 00:00).
 */
export async function runScheduledTasks() {
    const today = new Date();
    const yesterday = subDays(today, 1);
    const yesterdayStr = format(yesterday, 'yyyy-MM-dd');

    const results = {
        daily: { processed: 0, status: 'skipped' },
        weekly: { processed: 0, status: 'skipped' },
        monthly: { processed: 0, status: 'skipped' }
    };

    // 1. ALWAYS process Daily Goals (for yesterday)
    results.daily = await processGoals('daily', yesterdayStr);

    // 2. Check if today is the start of a new week (Monday)
    // If today is Monday, we process the previous week (previous Monday to Sunday)
    // date-fns startOfWeek defaults to Sunday, pass { weekStartsOn: 1 } for Monday
    if (today.getDay() === 1) { // 1 = Monday
        // We record history for the week ending yesterday
        results.weekly = await processGoals('weekly', yesterdayStr);
    }

    // 3. Check if today is the start of a new month (1st)
    if (today.getDate() === 1) {
        // We record history for the month ending yesterday
        results.monthly = await processGoals('monthly', yesterdayStr);
    }

    return results;
}

async function processGoals(type: 'daily' | 'weekly' | 'monthly', dateStr: string) {
    try {
        // 1. Aggregate stats per user for the given goal type
        // We want to capture the state BEFORE we reset it.
        // Note: This relies on the function being called BEFORE users start interacting with the new day's goals
        // or strictly at the turnover time.

        const stats = await GoalModel.aggregate([
            { $match: { type: type } },
            {
                $group: {
                    _id: '$userId',
                    total: { $sum: 1 },
                    completed: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'done'] }, 1, 0]
                        }
                    },
                    // Pending includes 'pending' and 'working'
                    pending: {
                        $sum: {
                            $cond: [{ $ne: ['$status', 'done'] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        let processedCount = 0;

        // 2. Create history records
        for (const stat of stats) {
            // idempotent check: don't create if already exists
            const existing = await GoalHistoryModel.findOne({
                userId: stat._id,
                date: dateStr,
                period: type
            });

            if (!existing) {
                await GoalHistoryModel.create({
                    userId: stat._id,
                    date: dateStr,
                    period: type,
                    completedCount: stat.completed,
                    pendingCount: stat.pending,
                    totalCount: stat.total
                });
                processedCount++;
            }
        }

        // 3. Reset goals to 'pending'
        // We reset ALL goals of this type, regardless of whether they had activity, 
        // simply because the period has rolled over.
        await GoalModel.updateMany(
            { type: type },
            { $set: { status: 'pending' } }
        );

        return { processed: processedCount, status: 'success' };

    } catch (error) {
        console.error(`Error processing ${type} goals:`, error);
        return { processed: 0, status: 'error', error };
    }
}
