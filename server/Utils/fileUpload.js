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

// Try to import cloudinary but don't crash if it's not available
let cloudinary;
try {
  cloudinary = (await import('cloudinary')).v2;
  
  // Configure Cloudinary only if credentials are available
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });
    console.log('Cloudinary configured successfully');
  } else {
    console.log('Cloudinary credentials missing, will use local storage');
    cloudinary = null;
  }
} catch (error) {
  console.log('Cloudinary not available, will use local storage');
  cloudinary = null;
}

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

// Upload to Cloudinary or use local file path
const uploadToCloudinary = async (filePath, folder = 'alumni-student-platform') => {
  // Get the base URL for our server
  const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  
  // If cloudinary is available and configured, use it
  if (cloudinary) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: folder,
        resource_type: 'auto'
      });
      
      console.log('Successfully uploaded to Cloudinary:', result.secure_url);
      
      return {
        secure_url: result.secure_url,
        public_id: result.public_id
      };
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
    }
  } else {
    // Fallback to local file storage
    console.log('Using local file storage instead of Cloudinary');
    
    // Get just the filename from the path
    const fileName = path.basename(filePath);
    
    // Create a local URL that can be accessed
    const localUrl = `${baseUrl}/uploads/${fileName}`;
    
    return {
      secure_url: localUrl,
      public_id: fileName
    };
  }
};

// Remove from Cloudinary (or handle local files)
const removeFromCloudinary = async (publicId) => {
  if (!publicId) return { result: 'ok' };
  
  if (cloudinary) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
      return { result: 'error', error };
    }
  } else {
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
  }
};

export {
  handleVerificationDocument,
  uploadProfilePicture,
  uploadToCloudinary,
  removeFromCloudinary
};