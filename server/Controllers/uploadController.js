import asyncHandler from 'express-async-handler';
import path from 'path';
import fs from 'fs';
import { handleVerificationDocument, uploadProfilePicture, uploadToCloudinary } from '../Utils/fileUpload.js';

// @desc    Upload a verification document
// @route   POST /api/upload/verification
// @access  Public
const uploadVerificationDocument = asyncHandler(async (req, res) => {
  handleVerificationDocument(req, res, function(err) {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).json({
        success: false,
        message: 'Please upload a verification document'
      });
    }

    // Get the file name only
    const fileName = req.file.filename;
    
    // Create the URL that will be accessible from the browser
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const documentURL = `${baseUrl}/uploads/${fileName}`;
    
    console.log("File uploaded successfully:", {
      file: req.file,
      documentURL: documentURL
    });

    res.status(200).json({
      success: true,
      documentURL: documentURL,
      fileName: fileName,
      message: 'Document uploaded successfully'
    });
  });
});

// @desc    Upload a profile picture
// @route   POST /api/upload/profile-picture
// @access  Private
const uploadProfilePictureHandler = asyncHandler(async (req, res) => {
  uploadProfilePicture(req, res, async function(err) {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).json({
        success: false,
        message: 'Please upload a profile picture'
      });
    }

    try {
      // Get file info for debugging
      console.log("File uploaded:", {
        path: req.file.path,
        filename: req.file.filename,
        size: req.file.size
      });
      
      // Upload the file (to Cloudinary or local storage)
      const result = await uploadToCloudinary(req.file.path, 'profile_pictures');
      
      // Don't delete the local file if we're using local storage
      // Only delete if we're using Cloudinary and the file is already uploaded there
      if (result.secure_url.includes('cloudinary.com')) {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
          console.log(`Temporary file removed: ${req.file.path}`);
        }
      } else {
        console.log(`Keeping local file: ${req.file.path}`);
      }
      
      // Send response with the image URL
      const imageUrl = result.secure_url;
      const publicId = result.public_id;
      
      console.log("Profile picture processed successfully:", {
        imageUrl: imageUrl,
        publicId: publicId
      });

      res.status(200).json({
        success: true,
        imageUrl: imageUrl,
        publicId: publicId,
        fileName: req.file.filename,
        message: 'Profile picture uploaded successfully'
      });
    } catch (error) {
      console.error("Error processing uploaded file:", error);
      // If there's an error, try to clean up the temp file
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(500).json({
        success: false,
        message: `Error processing the uploaded file: ${error.message}`
      });
    }
  });
});

export { uploadVerificationDocument, uploadProfilePictureHandler };
