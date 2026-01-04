
import mongoose, { Schema, Model } from 'mongoose';
import { Category } from '@/types';

interface ICategoryDocument extends Omit<Category, 'id'>, mongoose.Document { }

const CategorySchema = new Schema<ICategoryDocument>(
    {
        userId: {
            type: String, // Keeping as String for flexibility during migration, as types define it as string. 
            // Mongoose ObjectIds cast directly to string fine.
            required: true,
            ref: 'User',
            index: true
        },
        name: {
            type: String,
            required: [true, 'Please provide a category name'],
            maxlength: [50, 'Name cannot be more than 50 characters'],
        },
        color: {
            type: String,
            required: [true, 'Please provide a color'],
        },
        icon: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: function (doc, ret) {
                delete ret._id;
            },
        },
        toObject: { virtuals: true },
    }
);

// Compound index to ensure unique category names per user
CategorySchema.index({ userId: 1, name: 1 }, { unique: true });

const CategoryModel: Model<ICategoryDocument> = mongoose.models.Category || mongoose.model<ICategoryDocument>('Category', CategorySchema);

export default CategoryModel;
