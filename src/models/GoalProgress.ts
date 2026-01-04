
import mongoose, { Schema, Model } from 'mongoose';
import { GoalProgress } from '@/types';

interface IGoalProgressDocument extends Omit<GoalProgress, 'id'>, mongoose.Document { }

const GoalProgressSchema = new Schema<IGoalProgressDocument>(
    {
        goalId: {
            type: String, // Storing as String to match Goal model's userId/categoryId style, though ObjectId is common. Goal model uses String for references.
            required: true,
            ref: 'Goal',
            index: true
        },
        title: {
            type: String,
            required: [true, 'Please provide a summary of the progress'],
            maxlength: [200, 'Progress title cannot be more than 200 characters'],
        },
        description: {
            type: String,
            required: false,
            default: ''
        }
        // status or isCompleted could be added if each progress item can complete the goal. 
        // But distinct "Completed" status on Goal model is likely sufficient.
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

const GoalProgressModel: Model<IGoalProgressDocument> = mongoose.models.GoalProgress || mongoose.model<IGoalProgressDocument>('GoalProgress', GoalProgressSchema);

export default GoalProgressModel;
