import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import Admin model
import Admin from '../Models/Admin.js';

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student-alumni-platform');
    console.log('MongoDB Connected!');
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'verify@admin.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      await mongoose.connection.close();
      return;
    }
    
    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    const admin = new Admin({
      name: 'System Admin',
      email: 'verify@admin.com',
      password: hashedPassword,
      role: 'admin',
      permissions: {
        verifyAlumni: true,
        manageUsers: true,
        viewSystemLogs: true
      }
    });
    
    await admin.save();
    console.log('Admin user created successfully!');
    
    await mongoose.connection.close();
    console.log('MongoDB Connection closed');
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();
