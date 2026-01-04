
import Goal from '@/models/Goal';
import connectDB from '@/lib/db';

export const getGoals = async (userId: string) => {
    await connectDB();
    const goals = await Goal.find({ userId }).sort({ createdAt: -1 });
    return goals;
};

export const getGoal = async (id: string, userId: string) => {
    await connectDB();
    const goal = await Goal.findOne({ _id: id, userId });

    if (!goal) {
        throw new Error('Goal not found');
    }

    return goal;
};

export const createGoal = async (req: Request, userId: string) => {
    await connectDB();
    const data = await req.json();

    // Validate required fields
    if (!data.title || !data.categoryId || !data.type) {
        throw new Error('Missing required fields');
    }

    const goal = await Goal.create({
        ...data,
        userId,
    });

    return goal;
};

export const updateGoal = async (id: string, req: Request, userId: string) => {
    await connectDB();
    const updates = await req.json();

    const goal = await Goal.findOneAndUpdate(
        { _id: id, userId },
        { $set: updates },
        { new: true, runValidators: true }
    );

    if (!goal) {
        throw new Error('Goal not found');
    }

    return goal;
};

export const deleteGoal = async (id: string, userId: string) => {
    await connectDB();
    const goal = await Goal.findOneAndDelete({ _id: id, userId });

    if (!goal) {
        throw new Error('Goal not found');
    }

    return { success: true };
};
