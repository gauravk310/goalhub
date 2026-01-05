import mongoose, { Schema, Model } from 'mongoose';
import { Resource } from '@/types';

interface IResourceDocument extends Omit<Resource, 'id'>, mongoose.Document { }

const ResourceSchema = new Schema<IResourceDocument>(
    {
        learningId: {
            type: String,
            required: true,
            ref: 'Learning',
            index: true
        },
        title: {
            type: String,
            required: [true, 'Please provide a title'],
            maxlength: [200, 'Title cannot be more than 200 characters'],
        },
        source: {
            type: String,
            required: false,
            default: ''
        },
        link: {
            type: String,
            required: false,
            default: ''
        },
        status: {
            type: String,
            enum: ['pending', 'learning', 'done'],
            default: 'pending',
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

const ResourceModel: Model<IResourceDocument> = mongoose.models.Resource || mongoose.model<IResourceDocument>('Resource', ResourceSchema);

export default ResourceModel;
