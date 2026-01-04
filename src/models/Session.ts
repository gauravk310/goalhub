
import mongoose, { Schema, Model } from 'mongoose';
import { AuthSession } from '@/types';

// We'll store the session content.
interface ISessionDocument extends mongoose.Document {
    userId: string;
    email: string;
    name: string;
    token: string;
    expiresAt: Date;
}

const SessionSchema = new Schema<ISessionDocument>(
    {
        userId: { type: String, required: true },
        email: { type: String, required: true },
        name: { type: String, required: true },
        token: { type: String, required: true, unique: true },
        expiresAt: { type: Date, required: true, expires: 0 }, // TTL index to auto-remove
    },
    {
        timestamps: true,
    }
);

const SessionModel: Model<ISessionDocument> = mongoose.models.Session || mongoose.model<ISessionDocument>('Session', SessionSchema);

export default SessionModel;
