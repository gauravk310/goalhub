
import GoalProgress from '@/models/GoalProgress';
import Goal from '@/models/Goal';
import connectDB from '@/lib/db';

export const getGoalProgress = async (goalId: string, userId: string) => {
    await connectDB();

    // Verify goal exists and belongs to user
    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) {
        throw new Error('Goal not found');
    }

    const progress = await GoalProgress.find({ goalId }).sort({ createdAt: -1 });
    return progress;
};

export const addGoalProgress = async (goalId: string, userId: string, data: any) => {
    await connectDB();

    // Verify goal exists and belongs to user
    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) {
        throw new Error('Goal not found');
    }

    const progress = await GoalProgress.create({
        goalId,
        ...data,
    });

    return progress;
};
