import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Setup __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Created uploads directory at ${uploadsDir}`);
}

// Setup storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Define allowed file types
const allowedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG and PNG files are allowed.'));
  }
};

// Setup upload middleware
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Handle verification document upload
const handleVerificationDocument = upload.single('verificationDocument');

// Handle profile picture upload
const uploadProfilePicture = upload.single('profilePicture');

// Upload to local storage
const uploadToCloudinary = async (filePath, folder = 'alumni-student-platform') => {
  // Get the base URL for our server
  const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  
  // Using local file storage
  console.log('Using local file storage for uploads');
  
  // Get just the filename from the path
  const fileName = path.basename(filePath);
  
  // Create a local URL that can be accessed
  const localUrl = `${baseUrl}/uploads/${fileName}`;
  
  return {
    secure_url: localUrl,
    public_id: fileName
  };
};

// Remove from local storage
const removeFromCloudinary = async (publicId) => {
  if (!publicId) return { result: 'ok' };
  
  // For local storage, attempt to delete the file if it exists
  try {
    const filePath = path.join(uploadsDir, publicId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return { result: 'ok' };
  } catch (error) {
    console.error('Error deleting local file:', error);
    return { result: 'error', error };
  }
};

export {
  handleVerificationDocument,
  uploadProfilePicture,
  uploadToCloudinary,
  removeFromCloudinary
};