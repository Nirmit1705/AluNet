import asyncHandler from 'express-async-handler';
import path from 'path';
import { handleVerificationDocument } from '../Utils/fileUpload.js';

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

export { uploadVerificationDocument };
