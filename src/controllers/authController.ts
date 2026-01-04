
import User from '@/models/User';
import connectDB from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/password';
import crypto from 'crypto';
// Actually, dataService.ts uses standard Web Crypto API which works in Edge/Node environments usually.
// But better to define them clearly or use a library like bcryptjs but I'll stick to what's there if valid.
// Wait, dataService.ts helpers are exported. I can reuse them for now.

export const registerUser = async (req: Request) => {
    await connectDB();
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
        throw new Error('Missing required fields');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new Error('User already exists');
    }

    // We need to hash the password. The existing helper in dataService returns a hash string.
    const hashedPassword = await hashPassword(password);

    const user = await User.create({
        email,
        passwordHash: hashedPassword,
        name,
    });

    // Create default categories for the new user
    const Category = (await import('@/models/Category')).default;
    const defaultCategories = [
        { name: 'Work', color: '#3b82f6', icon: 'briefcase' },
        { name: 'Personal', color: '#8b5cf6', icon: 'user' },
        { name: 'Health', color: '#22c55e', icon: 'heart' },
        { name: 'Learning', color: '#f59e0b', icon: 'book' },
    ];

    await Category.insertMany(
        defaultCategories.map(cat => ({
            userId: user._id.toString(), // Using created user's ID
            name: cat.name,
            color: cat.color,
            icon: cat.icon
        }))
    );

    return user;
};

export const loginUser = async (req: Request) => {
    await connectDB();
    const { email, password } = await req.json();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
        throw new Error('Invalid credentials');
    }

    // Create session
    const token = crypto.randomBytes(32).toString('hex');

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Import Session dynamically or at top level to avoid circular deps if any
    const Session = (await import('@/models/Session')).default;

    await Session.create({
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        token,
        expiresAt
    });

    return {
        user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
        },
        token,
        expiresAt: expiresAt.toISOString()
    };
};
