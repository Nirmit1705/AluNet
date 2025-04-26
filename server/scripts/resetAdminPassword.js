import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from '../Models/Admin.js';

dotenv.config();

// Default password to set
const DEFAULT_ADMIN_PASSWORD = 'admin123';
const DEFAULT_ADMIN_EMAIL = 'verify@admin.com';

const resetAdminPassword = async () => {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Find the admin account
    const admin = await Admin.findOne({ email: DEFAULT_ADMIN_EMAIL });
    
    if (!admin) {
      console.log(`No admin found with email: ${DEFAULT_ADMIN_EMAIL}`);
      console.log('Creating new admin account...');
      
      // Create a new admin
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, salt);
      
      const newAdmin = new Admin({
        name: 'System Admin',
        email: DEFAULT_ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin'
      });
      
      await newAdmin.save();
      console.log(`Created new admin account with email: ${DEFAULT_ADMIN_EMAIL}`);
    } else {
      // Update the existing admin's password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, salt);
      
      admin.password = hashedPassword;
      await admin.save();
      
      console.log(`Reset password for admin: ${DEFAULT_ADMIN_EMAIL}`);
    }
    
    console.log('\n-----------------------------------------------------');
    console.log('ADMIN PASSWORD HAS BEEN RESET TO: admin123');
    console.log('You can now log in with:');
    console.log(`Email: ${DEFAULT_ADMIN_EMAIL}`);
    console.log('Password: admin123');
    console.log('-----------------------------------------------------\n');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

resetAdminPassword();
