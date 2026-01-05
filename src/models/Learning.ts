
import mongoose, { Schema, Model } from 'mongoose';
import { Learning } from '@/types';

interface ILearningDocument extends Omit<Learning, 'id'>, mongoose.Document { }

const LearningSchema = new Schema<ILearningDocument>(
    {
        userId: {
            type: String,
            required: true,
            ref: 'User',
            index: true
        },
        categoryId: {
            type: String,
            required: true,
            ref: 'Category',
            index: true
        },
        title: {
            type: String,
            required: [true, 'Please provide a title'],
            maxlength: [100, 'Title cannot be more than 100 characters'],
        },
        description: {
            type: String,
            required: false,
            default: ''
        },
        status: {
            type: String,
            enum: ['pending', 'learning', 'done'],
            default: 'pending',
        },
        dueDate: {
            type: String,
            required: false,
        }
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

const LearningModel: Model<ILearningDocument> = mongoose.models.Learning || mongoose.model<ILearningDocument>('Learning', LearningSchema);

export default LearningModel;
