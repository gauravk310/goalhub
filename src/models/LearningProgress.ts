
import mongoose, { Schema, Model } from 'mongoose';
import { LearningProgress } from '@/types';

interface ILearningProgressDocument extends Omit<LearningProgress, 'id'>, mongoose.Document { }

const LearningProgressSchema = new Schema<ILearningProgressDocument>(
    {
        learningId: {
            type: String,
            required: true,
            ref: 'Learning',
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

const LearningProgressModel: Model<ILearningProgressDocument> = mongoose.models.LearningProgress || mongoose.model<ILearningProgressDocument>('LearningProgress', LearningProgressSchema);

export default LearningProgressModel;
