import Resource from '@/models/Resource';
import Learning from '@/models/Learning';
import connectDB from '@/lib/db';

export const getResources = async (learningId: string, userId: string) => {
    await connectDB();

    // Verify ownership
    const learning = await Learning.findOne({ _id: learningId, userId });
    if (!learning) {
        throw new Error('Learning item not found or unauthorized');
    }

    const resources = await Resource.find({ learningId }).sort({ createdAt: -1 });
    return resources;
};

export const createResource = async (learningId: string, req: Request, userId: string) => {
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

    const resource = await Resource.create({
        ...data,
        learningId,
    });

    return resource;
};

export const updateResource = async (resourceId: string, req: Request, userId: string) => {
    await connectDB();
    const data = await req.json();

    const resource = await Resource.findById(resourceId);
    if (!resource) {
        throw new Error('Resource not found');
    }

    // Verify ownership
    const learning = await Learning.findOne({ _id: resource.learningId, userId });
    if (!learning) {
        throw new Error('Unauthorized');
    }

    const updatedResource = await Resource.findByIdAndUpdate(
        resourceId,
        { ...data },
        { new: true, runValidators: true }
    );

    return updatedResource;
};

export const deleteResource = async (resourceId: string, userId: string) => {
    await connectDB();

    const resource = await Resource.findById(resourceId);
    if (!resource) {
        throw new Error('Resource not found');
    }

    // Verify ownership
    const learning = await Learning.findOne({ _id: resource.learningId, userId });
    if (!learning) {
        throw new Error('Unauthorized');
    }

    await Resource.findByIdAndDelete(resourceId);
    return { message: 'Resource deleted' };
};
