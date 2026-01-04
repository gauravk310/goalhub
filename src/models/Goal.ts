
import mongoose, { Schema, Model } from 'mongoose';
import { Goal } from '@/types';

interface IGoalDocument extends Omit<Goal, 'id'>, mongoose.Document { }

const GoalSchema = new Schema<IGoalDocument>(
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
            required: false, // Description might be optional? Interface says string, usually implies required unless optional '?'
            default: ''
        },
        type: {
            type: String,
            enum: ['daily', 'weekly', 'monthly'],
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'working', 'done'],
            default: 'pending',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
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

const GoalModel: Model<IGoalDocument> = mongoose.models.Goal || mongoose.model<IGoalDocument>('Goal', GoalSchema);

export default GoalModel;
