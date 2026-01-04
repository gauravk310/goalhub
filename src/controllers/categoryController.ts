
import Category from '@/models/Category';
import Goal from '@/models/Goal'; // For cascading delete
import connectDB from '@/lib/db';

export const getCategories = async (userId: string) => {
    await connectDB();
    // Using string for userId as decided
    const categories = await Category.find({ userId }).sort({ createdAt: -1 });
    return categories;
};

export const createCategory = async (req: Request, userId: string) => {
    await connectDB();
    const { name, color, icon } = await req.json();

    if (!name || !color) {
        throw new Error('Name and color are required');
    }

    const category = await Category.create({
        userId,
        name,
        color,
        icon,
    });

    return category;
};

export const updateCategory = async (id: string, req: Request, userId: string) => {
    await connectDB();
    const updates = await req.json(); // Validating strictly might be better, but basic for now.

    const category = await Category.findOneAndUpdate(
        { _id: id, userId },
        { $set: updates },
        { new: true, runValidators: true }
    );

    if (!category) {
        throw new Error('Category not found');
    }

    return category;
};

export const deleteCategory = async (id: string, userId: string) => {
    await connectDB();
    const category = await Category.findOneAndDelete({ _id: id, userId });

    if (!category) {
        throw new Error('Category not found');
    }

    // Delete associated goals
    // Note: we're using the string ID of the category for reference
    // Since `id` passed here is likely the stringified ObjectID, and we stored string in Goal.categoryId
    // We need to match whatever Goal.categoryId holds. 
    // If we start storing IDs as strings in Goal, we are fine.
    await Goal.deleteMany({ categoryId: id, userId });

    return { success: true };
};
