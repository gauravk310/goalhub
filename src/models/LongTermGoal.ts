
import mongoose, { Schema, Model } from 'mongoose';
import { LongTermGoal } from '@/types';

interface ILongTermGoalDocument extends Omit<LongTermGoal, 'id'>, mongoose.Document { }

const LongTermGoalSchema = new Schema<ILongTermGoalDocument>(
    {
        userId: {
            type: String,
            required: true,
            ref: 'User',
            index: true
        },
        title: {
            type: String,
            required: [true, 'Please provide a title'],
            maxlength: [200, 'Title cannot be more than 200 characters'],
        },
        description: {
            type: String,
            required: false,
            default: ''
        },
        status: {
            type: String,
            enum: ['incomplete', 'complete'],
            default: 'incomplete',
        },
        isCompleted: {
            type: Boolean,
            default: false
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

const LongTermGoalModel: Model<ILongTermGoalDocument> = mongoose.models.LongTermGoal || mongoose.model<ILongTermGoalDocument>('LongTermGoal', LongTermGoalSchema);

export default LongTermGoalModel;
