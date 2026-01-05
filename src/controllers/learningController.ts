
import Learning from '@/models/Learning';
import connectDB from '@/lib/db';

export const getLearnings = async (userId: string) => {
    await connectDB();
    const learnings = await Learning.find({ userId }).sort({ createdAt: -1 });
    return learnings;
};

export const getLearning = async (id: string, userId: string) => {
    await connectDB();
    const learning = await Learning.findOne({ _id: id, userId });

    if (!learning) {
        throw new Error('Learning item not found');
    }

    return learning;
};

export const createLearning = async (req: Request, userId: string) => {
    await connectDB();
    const data = await req.json();

    // Validate required fields
    if (!data.title || !data.categoryId) {
        throw new Error('Missing required fields');
    }

    const learning = await Learning.create({
        ...data,
        userId,
    });

    return learning;
};

export const updateLearning = async (id: string, req: Request, userId: string) => {
    await connectDB();
    const updates = await req.json();

    const learning = await Learning.findOneAndUpdate(
        { _id: id, userId },
        { $set: updates },
        { new: true, runValidators: true }
    );

    if (!learning) {
        throw new Error('Learning item not found');
    }

    return learning;
};

export const deleteLearning = async (id: string, userId: string) => {
    await connectDB();
    const learning = await Learning.findOneAndDelete({ _id: id, userId });

    if (!learning) {
        throw new Error('Learning item not found');
    }

    return { success: true };
};
