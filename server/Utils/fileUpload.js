import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create verification-specific directory
const verificationDir = path.join(uploadsDir, 'verification');
if (!fs.existsSync(verificationDir)) {
  fs.mkdirSync(verificationDir, { recursive: true });
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

// Handle resume upload
const uploadResume = upload.single('resume');

// Upload to Cloudinary (stub function if not using Cloudinary)
const uploadToCloudinary = async (filePath, folder = 'alumni-student-platform', resourceType = 'auto') => {
  // Just return the local file path if not using actual Cloudinary
  return {
    secure_url: `http://localhost:5000/uploads/${path.basename(filePath)}`,
    public_id: path.basename(filePath)
  };
};

// Remove from Cloudinary (stub function if not using Cloudinary)
const removeFromCloudinary = async (publicId) => {
  // No-op if not using actual Cloudinary
  return { result: 'ok' };
};

// Utility function to process file uploads
const processFileUpload = async (req, res, next) => {
  // Handle the file upload using multer
  handleVerificationDocument(req, res, function(err) {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};

export {
  handleVerificationDocument,
  uploadProfilePicture,
  uploadResume,
  uploadToCloudinary,
  removeFromCloudinary,
  processFileUpload
};