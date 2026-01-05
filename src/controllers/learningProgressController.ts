
import LearningProgress from '@/models/LearningProgress';
import Learning from '@/models/Learning';
import connectDB from '@/lib/db';

export const getLearningProgress = async (learningId: string, userId: string) => {
    await connectDB();

    // Verify ownership
    const learning = await Learning.findOne({ _id: learningId, userId });
    if (!learning) {
        throw new Error('Learning item not found or unauthorized');
    }

    const progress = await LearningProgress.find({ learningId }).sort({ createdAt: -1 });
    return progress;
};

export const createLearningProgress = async (learningId: string, req: Request, userId: string) => {
    await connectDB();
    const data = await req.json();

    // Verify ownership
    const learning = await Learning.findOne({ _id: learningId, userId });
    if (!learning) {
        throw new Error('Learning item not found or unauthorized');
    }

    if (!data.title) {
        throw new Error('Title is required');
    }

    const progress = await LearningProgress.create({
        ...data,
        learningId,
    });

    return progress;
};
