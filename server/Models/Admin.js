import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    default: 'admin',
    immutable: true // Add immutability for consistency
  },
  permissions: {
    verifyAlumni: {
      type: Boolean,
      default: true
    },
    manageUsers: {
      type: Boolean,
      default: true
    },
    viewSystemLogs: {
      type: Boolean,
      default: true
    }
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash password before save
AdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
AdminSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Add this before any other middleware functions
AdminSchema.pre('validate', function(next) {
  // If status is undefined or null, set a default status
  if (!this.status) {
    this.status = 'active'; // Admins are always active by default
    console.log(`Setting default status 'active' for admin ${this._id}`);
  }
  next();
});

const Admin = mongoose.model('Admin', AdminSchema);

export default Admin;
