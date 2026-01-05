
import LongTermGoal from '@/models/LongTermGoal';
import connectDB from '@/lib/db';

export const getLongTermGoals = async (userId: string) => {
    await connectDB();
    const goals = await LongTermGoal.find({ userId }).sort({ createdAt: -1 });
    return goals;
};

export const createLongTermGoal = async (req: Request, userId: string) => {
    await connectDB();
    const data = await req.json();

    // Validate required fields
    if (!data.title) {
        throw new Error('Missing required fields');
    }

    const goal = await LongTermGoal.create({
        ...data,
        userId,
    });

    return goal;
};

export const updateLongTermGoal = async (id: string, req: Request, userId: string) => {
    await connectDB();
    const updates = await req.json();

    const goal = await LongTermGoal.findOneAndUpdate(
        { _id: id, userId },
        { $set: updates },
        { new: true, runValidators: true }
    );

    if (!goal) {
        throw new Error('Long-term goal not found');
    }

    return goal;
};

export const deleteLongTermGoal = async (id: string, userId: string) => {
    await connectDB();
    const goal = await LongTermGoal.findOneAndDelete({ _id: id, userId });

    if (!goal) {
        throw new Error('Long-term goal not found');
    }

    return { success: true };
};
