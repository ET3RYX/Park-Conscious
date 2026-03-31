import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config({ path: './.env' });

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@parkconscious.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists. Updating record...');
            existingAdmin.role = 'admin';
            existingAdmin.password = 'admin123'; // Model hook will hash this
            await existingAdmin.save();
            console.log('Admin user updated.');
        } else {
            await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: 'admin123', // Model hook will hash this
                role: 'admin'
            });
            console.log('Default admin user created: admin@parkconscious.com / admin123');
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
