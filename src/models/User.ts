
import mongoose, { Schema, Model } from 'mongoose';
import { User } from '@/types';

// Interface for the User document, extending the User type but omitting id (mongoose has _id)
// We might need to adjust this if we want strict typing for the Mongoose document
interface IUserDocument extends Omit<User, 'id'>, mongoose.Document { }

const UserSchema = new Schema<IUserDocument>(
    {
        email: {
            type: String,
            required: [true, 'Please provide an email for this user.'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: [true, 'Please provide a password hash.'],
        },
        name: {
            type: String,
            required: [true, 'Please provide a name for this user.'],
            maxlength: [60, 'Name cannot be more than 60 characters'],
        },
    },
    {
        timestamps: true, // Automatically manages createdAt and updatedAt
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: function (doc, ret) {
                delete ret._id;
                delete ret.passwordHash; // Don't return password hash by default
            },
        },
        toObject: { virtuals: true },
    }
);

// Check if the model is already compiled to avoid overwriting error in HMR
const UserModel: Model<IUserDocument> = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default UserModel;
