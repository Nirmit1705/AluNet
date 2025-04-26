import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from '../Models/Admin.js';
import readline from 'readline';

dotenv.config();

// Create readline interface for terminal input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt for input with a promise wrapper
const prompt = (question) => new Promise((resolve) => {
  rl.question(question, (answer) => resolve(answer));
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Check if admin already exists
    const adminExists = await Admin.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('An admin account already exists.');
      const resetConfirm = await prompt('Do you want to reset the admin password? (yes/no): ');
      
      if (resetConfirm.toLowerCase() === 'yes') {
        // Get email
        const email = await prompt('Enter admin email: ');
        
        // Get and confirm new password
        const password = await prompt('Enter new password (min 8 chars): ');
        const confirmPassword = await prompt('Confirm new password: ');
        
        if (password !== confirmPassword) {
          console.log('Passwords do not match. Operation cancelled.');
          process.exit(0);
        }
        
        if (password.length < 8) {
          console.log('Password too short (minimum 8 characters). Operation cancelled.');
          process.exit(0);
        }
        
        // Update admin with new credentials
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        await Admin.findOneAndUpdate(
          { email },
          { password: hashedPassword },
          { new: true }
        );
        
        console.log('Admin password updated successfully.');
        
        // Generate hash for .env file
        console.log('\nFor your .env file:');
        console.log(`ADMIN_EMAIL=${email}`);
        console.log(`ADMIN_PASSWORD_HASH=${hashedPassword}`);
      }
    } else {
      // Create new admin
      console.log('No admin account found. Creating a new admin account...');
      
      // Get admin details
      const name = await prompt('Enter admin name: ');
      const email = await prompt('Enter admin email: ');
      const password = await prompt('Enter admin password (min 8 chars): ');
      const confirmPassword = await prompt('Confirm admin password: ');
      
      if (password !== confirmPassword) {
        console.log('Passwords do not match. Operation cancelled.');
        process.exit(0);
      }
      
      if (password.length < 8) {
        console.log('Password too short (minimum 8 characters). Operation cancelled.');
        process.exit(0);
      }
      
      // Create admin
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const admin = await Admin.create({
        name,
        email,
        password, // Will be auto-hashed by the model
        role: 'admin'
      });
      
      console.log(`Admin created successfully: ${admin.name} (${admin.email})`);
      
      // Generate hash for .env file
      console.log('\nFor your .env file:');
      console.log(`ADMIN_EMAIL=${email}`);
      console.log(`ADMIN_PASSWORD_HASH=${hashedPassword}`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();
    mongoose.disconnect();
    process.exit(0);
  }
})
.catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});
