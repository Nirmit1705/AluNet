import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect directly to the database
const forceAdminReset = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Force update the admin document directly in the database
    const db = mongoose.connection;
    
    // Generate a secure password hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Update or insert admin document directly
    const result = await db.collection('admins').updateOne(
      { email: 'verify@admin.com' }, 
      { 
        $set: { 
          name: 'System Admin',
          email: 'verify@admin.com',
          password: hashedPassword,
          role: 'admin'
        } 
      },
      { upsert: true }
    );
    
    console.log('Admin reset result:', result);
    console.log('\n---------------------------------------------------');
    console.log('ADMIN PASSWORD HAS BEEN FORCE RESET');
    console.log('Login with:');
    console.log('Email: verify@admin.com');
    console.log('Password: admin123');
    console.log('---------------------------------------------------\n');
    
    // Update the .env file with the new hash for reference
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      const hashLine = `ADMIN_PASSWORD_HASH=${hashedPassword}`;
      
      // Check if ADMIN_PASSWORD_HASH already exists
      if (envContent.includes('ADMIN_PASSWORD_HASH=')) {
        // Replace existing line
        envContent = envContent.replace(/ADMIN_PASSWORD_HASH=.*/g, hashLine);
      } else {
        // Add new line
        envContent += `\n${hashLine}`;
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log(`Updated ADMIN_PASSWORD_HASH in .env file`);
    } else {
      console.log(`.env file not found at ${envPath}`);
      console.log(`Add this to your .env file: ADMIN_PASSWORD_HASH=${hashedPassword}`);
    }
    
  } catch (error) {
    console.error('Error during admin reset:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

forceAdminReset();
