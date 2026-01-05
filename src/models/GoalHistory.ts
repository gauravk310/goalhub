
import mongoose, { Schema, Model } from 'mongoose';
import { GoalHistory, HistoryPeriod } from '@/types';

interface IGoalHistoryDocument extends Omit<GoalHistory, 'id'>, mongoose.Document { }

const GoalHistorySchema = new Schema<IGoalHistoryDocument>(
    {
        userId: {
            type: String,
            required: true,
            ref: 'User',
            index: true
        },
        date: {
            type: String,
            required: true,
            index: true // Helps in querying history by date
        },
        period: {
            type: String,
            enum: ['daily', 'weekly', 'monthly'],
            required: true,
            index: true
        },
        completedCount: {
            type: Number,
            required: true,
            default: 0
        },
        pendingCount: {
            type: Number,
            required: true,
            default: 0
        },
        totalCount: {
            type: Number,
            required: true,
            default: 0
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

// Compound index to ensure one record per period per date per user
GoalHistorySchema.index({ userId: 1, date: 1, period: 1 }, { unique: true });

const GoalHistoryModel: Model<IGoalHistoryDocument> = mongoose.models.GoalHistory || mongoose.model<IGoalHistoryDocument>('GoalHistory', GoalHistorySchema);

export default GoalHistoryModel;
