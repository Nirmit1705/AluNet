import asyncHandler from "express-async-handler";
import Alumni from "../Models/Alumni.js";
import VerificationRequest from "../Models/VerificationRequest.js";
import { formatAlumniResponse } from "../Utils/responseFormatter.js";
import { generateToken } from "../Utils/generateToken.js";
import { uploadProfilePicture, uploadToCloudinary, removeFromCloudinary, handleVerificationDocument } from "../Utils/fileUpload.js";
import fs from 'fs';
import bcrypt from 'bcryptjs';
import path from 'path'; // Add this import for path.basename

// @desc    Alumni login
// @route   POST /api/alumni/login
// @access  Public
const authAlumni = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the alumni by email
    const alumni = await Alumni.findOne({ email }).select('+password');

    if (!alumni) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // Check if password matches
    const isMatch = await alumni.matchPassword(password);

    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // Determine verification status
    // Be extra careful about how we check verification
    const isVerified = 
      alumni.isVerified === true || 
      alumni.verificationStatus === 'approved' ||
      alumni.status === 'active';
    
    console.log(`Alumni login for ${email}, verification status:`, {
      isVerified,
      directIsVerified: alumni.isVerified,
      verificationStatus: alumni.verificationStatus,
      status: alumni.status
    });

    // Generate token
    const token = generateToken(alumni._id);

    // Return user data and token
    res.status(200).json({
      _id: alumni._id,
      name: alumni.name,
      email: alumni.email,
      isVerified: isVerified, // This is the critical field for the frontend
      token: token
    });
  } catch (error) {
    console.error('Alumni login error:', error);
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'Server error');
  }
});

// @desc    Check alumni verification status
// @route   GET /api/alumni/verification-status
// @access  Private
const getVerificationStatus = asyncHandler(async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.user.id);

    if (!alumni) {
      res.status(404);
      throw new Error('Alumni not found');
    }

    // Determine verification status from multiple fields for compatibility
    const isVerified = 
      alumni.isVerified === true || 
      alumni.verificationStatus === 'approved' ||
      alumni.status === 'active';
    
    // Get status field with appropriate fallbacks
    let status = 'pending';
    if (alumni.verificationStatus) {
      status = alumni.verificationStatus;
    } else if (alumni.status === 'active') {
      status = 'approved';
    } else if (alumni.isVerified === true) {
      status = 'approved';
    }
    
    console.log(`Verification status check for alumni ${alumni._id}:`, {
      isVerified,
      status,
      directIsVerified: alumni.isVerified,
      verificationStatus: alumni.verificationStatus,
      modelStatus: alumni.status
    });

    // Send back complete verification info
    res.status(200).json({
      isVerified: isVerified,
      status: status,
      rejectionReason: alumni.verificationRejectionReason || null,
      createdAt: alumni.createdAt,
      updatedAt: alumni.updatedAt
    });
  } catch (error) {
    console.error('Error getting verification status:', error);
    res.status(500);
    throw new Error('Failed to get verification status');
  }
});

// @desc    Resend verification
// @route   POST /api/alumni/resend-verification
// @access  Private
const resendVerification = asyncHandler(async (req, res) => {
  const { documentURL } = req.body;
  const alumni = await Alumni.findById(req.user._id);
  
  if (!alumni) {
    res.status(404);
    throw new Error("Alumni not found");
  }
  
  // Create new verification request
  const verificationRequest = await VerificationRequest.create({
    name: alumni.name,
    email: alumni.email,
    phone: alumni.phone,
    university: alumni.university,
    degree: alumni.degree,
    branch: alumni.branch,
    graduationYear: alumni.graduationYear,
    currentCompany: alumni.currentCompany,
    currentRole: alumni.currentRole,
    documentURL,
    userId: alumni._id,
    status: 'pending'
  });
  
  // Update alumni status to pending
  alumni.status = 'pending';
  await alumni.save();
  
  res.status(200).json({
    message: "Verification request submitted successfully",
    requestId: verificationRequest._id
  });
});

// @desc    Get alumni profile
// @route   GET /api/alumni/profile
// @access  Private
const getAlumniProfile = asyncHandler(async (req, res) => {
  try {
    // Make sure req.user exists (from the auth middleware)
    if (!req.user || !req.user._id) {
      res.status(401);
      throw new Error("Not authorized, no valid user ID found");
    }

    // Use req.user._id from auth middleware instead of req.params.id
    const alumni = await Alumni.findById(req.user._id);

    if (!alumni) {
      res.status(404);
      throw new Error("Alumni not found");
    }

    // Return the formatted alumni response
    res.json(formatAlumniResponse(alumni));
  } catch (error) {
    console.error("Error in getAlumniProfile:", error);
    res.status(error.statusCode || 500);
    throw new Error(error.message || "Failed to fetch alumni profile");
  }
});

// @desc    Update alumni profile
// @route   PUT /api/alumni/profile
// @access  Private
const updateAlumniProfile = asyncHandler(async (req, res) => {
  const alumniId = req.user._id;
  
  console.log("Update profile request received for alumni ID:", alumniId);
  console.log("Request body:", JSON.stringify(req.body, null, 2));
  
  const {
    name,
    bio,
    location,
    linkedin, // This will map to linkedInProfile in the database
    company,
    position,
    experience,
    skills,
    interests,
    graduationYear,
    education, // Changed from previousEducation to education
    university,
    college,
    industry,
    mentorshipAvailable
  } = req.body;

  try {
    let alumni = await Alumni.findById(alumniId);
    
    if (!alumni) {
      res.status(404);
      throw new Error('Alumni not found');
    }
    
    console.log("Found alumni in database:", alumni._id);
    console.log("Current education data:", JSON.stringify(alumni.education, null, 2));
    console.log("New education data received:", JSON.stringify(education, null, 2));
    
    // Update the simple fields if provided
    if (name) alumni.name = name;
    if (bio !== undefined) alumni.bio = bio;
    if (location !== undefined) alumni.location = location;
    if (linkedin !== undefined) alumni.linkedInProfile = linkedin;
    if (company !== undefined) alumni.company = company;
    if (position !== undefined) alumni.position = position;
    if (experience !== undefined) alumni.experience = Number(experience) || 0;
    if (university !== undefined) alumni.university = university;
    if (college !== undefined) alumni.college = college;
    if (industry !== undefined) alumni.industry = industry;
    if (mentorshipAvailable !== undefined) alumni.mentorshipAvailable = mentorshipAvailable;
    
    // Handle arrays properly - make sure they're not undefined
    if (skills && Array.isArray(skills)) alumni.skills = skills;
    if (interests && Array.isArray(interests)) alumni.interests = interests;
    
    // Update graduation year if provided and valid
    if (graduationYear && !isNaN(graduationYear)) {
      const year = Number(graduationYear);
      if (year >= 1950 && year <= new Date().getFullYear() + 10) {
        alumni.graduationYear = year;
      }
    }
    
    // Handle education array specially - it might come in different formats from frontend
    if (education) {
      if (Array.isArray(education)) {
        // Make a deep copy to avoid reference issues
        alumni.education = JSON.parse(JSON.stringify(education));
        console.log("Setting education array directly:", JSON.stringify(alumni.education, null, 2));
      } else if (typeof education === 'object') {
        // If it's a single object, wrap it in an array
        alumni.education = [education];
        console.log("Setting education as single object in array:", JSON.stringify(alumni.education, null, 2));
      }
    }
    
    // Update lastActive timestamp
    alumni.lastActive = new Date();
    
    // Save the updated profile
    const updatedAlumni = await alumni.save();
    
    console.log("Alumni profile updated successfully. Database now has:");
    console.log("- Education:", JSON.stringify(updatedAlumni.education, null, 2));
    console.log("- Skills:", JSON.stringify(updatedAlumni.skills, null, 2));
    console.log("- Interests:", JSON.stringify(updatedAlumni.interests, null, 2));
    
    // Return the updated profile data
    res.json(formatAlumniResponse(updatedAlumni));
  } catch (error) {
    console.error("Error updating alumni profile:", error);
    res.status(500);
    throw new Error('Server error updating profile: ' + error.message);
  }
});

// @desc    Get all alumni
// @route   GET /api/alumni
// @access  Public
const getAllAlumni = asyncHandler(async (req, res) => {
  const alumniList = await Alumni.find({});
  res.json(alumniList);
});

// @desc    Delete an alumni
// @route   DELETE /api/alumni/:id
// @access  Private
const deleteAlumni = asyncHandler(async (req, res) => {
  const alumni = await Alumni.findById(req.params.id);

  if (alumni) {
    await Alumni.findByIdAndDelete(req.params.id);
    res.json({ message: "Alumni removed successfully" });
  } else {
    res.status(404);
    throw new Error("Alumni not found");
  }
});

// @desc    Search alumni by various criteria
// @route   GET /api/alumni/search
// @access  Public
const searchAlumni = asyncHandler(async (req, res) => {
  const {
    name,
    company,
    specialization,
    skills,
    graduationYear,
    mentorshipAvailable,
    university,
    location,
    industry
  } = req.query;
  
  const query = {};
  
  if (name) query.name = { $regex: name, $options: 'i' };
  if (company) query.company = { $regex: company, $options: 'i' }
});

// @desc    Get alumni by batch (graduation year)
// @route   GET /api/alumni/batch/:year
// @access  Public
const getAlumniByBatch = asyncHandler(async (req, res) => {
  const year = Number(req.params.year);
  
  if (isNaN(year)) {
    res.status(400);
    throw new Error("Invalid graduation year format");
  }
  
  const alumni = await Alumni.find({ graduationYear: year });
  
  if (alumni.length > 0) {
    res.json(alumni);
  } else {
    res.status(404);
    throw new Error("No alumni found from this batch");
  }
});

// @desc    Get alumni by company
// @route   GET /api/alumni/company/:company
// @access  Public
const getAlumniByCompany = asyncHandler(async (req, res) => {
  const alumni = await Alumni.find({ 
    company: { $regex: req.params.company, $options: 'i' }
  });
  
  if (alumni.length > 0) {
    res.json(alumni);
  } else {
    res.status(404);
    throw new Error("No alumni found working at this company");
  }
});

// Update the updateProfilePicture function
const updateAlumniProfilePicture = async (req, res) => {
  try {
    const { imageUrl, publicId } = req.body;
    
    if (!imageUrl || !publicId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image URL and public ID are required' 
      });
    }
    
    // Create a proper profilePicture object
    const profilePictureObject = {
      url: imageUrl,
      public_id: publicId
    };
    
    // Find the alumni by ID using the _id property from auth middleware
    const alumni = await Alumni.findById(req.user._id);
    
    if (!alumni) {
      return res.status(404).json({ 
        success: false, 
        message: 'Alumni not found' 
      });
    }
    
    // Update with the profilePicture object
    alumni.profilePicture = profilePictureObject;
    await alumni.save();
    
    return res.status(200).json({ 
      success: true, 
      message: 'Profile picture updated successfully', 
      profilePicture: alumni.profilePicture 
    });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile picture',
      error: error.message 
    });
  }
};

// @desc    Submit verification document
// @route   POST /api/alumni/submit-verification
// @access  Private
const submitVerificationDocument = asyncHandler(async (req, res) => {
  const { documentURL } = req.body;
  const alumni = await Alumni.findById(req.user._id);
  
  if (!alumni) {
    res.status(404);
    throw new Error("Alumni not found");
  }
  
  if (!documentURL) {
    res.status(400);
    throw new Error("Verification document URL is required");
  }
  
  try {
    // Update alumni verification document
    alumni.verificationDocument = {
      url: documentURL,
      filename: path.basename(documentURL)
    };
    alumni.verificationStatus = 'pending';
    alumni.verificationSubmittedAt = new Date(); // Set new submission timestamp
    
    // Clear previous verification decisions
    alumni.verificationApprovedAt = null;
    alumni.verificationApprovedBy = null;
    alumni.verificationRejectedAt = null;
    alumni.verificationRejectedBy = null;
    alumni.verificationRejectionReason = '';
    
    await alumni.save();
    
    // Create or update verification request
    let verificationRequest = await VerificationRequest.findOne({ userId: alumni._id });
    
    if (verificationRequest) {
      verificationRequest.documentURL = documentURL;
      verificationRequest.status = 'pending';
      verificationRequest.rejectionReason = null;
      await verificationRequest.save();
    } else {
      verificationRequest = await VerificationRequest.create({
        name: alumni.name,
        email: alumni.email,
        phone: alumni.phone || "",
        university: alumni.university || "",
        degree: "Not Specified",
        branch: alumni.branch || "",
        graduationYear: alumni.graduationYear,
        currentCompany: alumni.company || "",
        currentRole: alumni.currentPosition || "",
        documentURL,
        userId: alumni._id,
        status: 'pending'
      });
    }
    
    res.status(200).json({
      message: "Verification document submitted successfully",
      statusUpdated: true
    });
  } catch (error) {
    console.error("Error submitting verification document:", error);
    res.status(500);
    throw new Error("Failed to submit verification document");
  }
});

// @desc    Get alumni by ID
// @route   GET /api/alumni/:id
// @access  Public
const getAlumniById = asyncHandler(async (req, res) => {
  const alumni = await Alumni.findById(req.params.id);
  
  if (alumni) {
    res.json(formatAlumniResponse(alumni));
  } else {
    res.status(404);
    throw new Error("Alumni not found");
  }
});

// @desc    Register a new alumni
// @route   POST /api/alumni/register
// @access  Public
const registerAlumni = asyncHandler(async (req, res) => {
  const { 
    name, 
    email, 
    password,
    phone, 
    graduationYear, 
    branch,
    university, 
    college,
    currentPosition, 
    company,
    documentURL 
  } = req.body;

  console.log("Registration request body:", { ...req.body, password: '[REDACTED]', documentURL });

  // Check if alumni exists
  const alumniExists = await Alumni.findOne({ email });
  if (alumniExists) {
    res.status(400);
    throw new Error("Email already registered");
  }
  
  // Check if a verification request already exists for this email
  const existingVerificationRequest = await VerificationRequest.findOne({ email });
  console.log("Existing verification request:", existingVerificationRequest ? "found" : "not found");

  try {
    // Create alumni with unverified status
    const alumni = await Alumni.create({
      name,
      email,
      password,
      phone: phone || "",
      graduationYear,
      branch,
      university: university || "",
      college: college || "",
      currentPosition: currentPosition || "",
      company: company || "",
      isVerified: false,
      verificationStatus: 'pending',
      status: 'pending',
      verificationSubmittedAt: new Date(), // Set submission timestamp
      // Store document URL in alumni record
      verificationDocument: documentURL ? {
        url: documentURL,
        filename: path.basename(documentURL)
      } : undefined
    });

    if (alumni) {
      let verificationRequest;
      
      if (existingVerificationRequest) {
        // Update existing verification request
        existingVerificationRequest.userId = alumni._id;
        existingVerificationRequest.documentURL = documentURL;
        existingVerificationRequest.name = name;
        existingVerificationRequest.branch = branch;
        existingVerificationRequest.graduationYear = graduationYear;
        existingVerificationRequest.university = university || "";
        existingVerificationRequest.currentCompany = company || "";
        existingVerificationRequest.currentRole = currentPosition || "";
        
        verificationRequest = await existingVerificationRequest.save();
        console.log("Updated existing verification request for:", email);
      } else {
        // Create a new verification request
        verificationRequest = await VerificationRequest.create({
          name,
          email,
          phone: phone || "",
          university: university || "",
          degree: "Not Specified",
          branch,
          graduationYear,
          currentCompany: company || "",
          currentRole: currentPosition || "",
          documentURL,
          userId: alumni._id,
          status: 'pending'
        });
        console.log("Created new verification request for:", email);
      }

      // Generate token
      const token = generateToken(alumni._id);

      // Return success response
      res.status(201).json({
        _id: alumni._id,
        name: alumni.name,
        email: alumni.email,
        isVerified: false,
        token: token,
        message: "Registration successful. Your account is pending verification."
      });
    } else {
      res.status(400);
      throw new Error("Invalid alumni data");
    }
  } catch (error) {
    console.error("Error in alumni registration:", error);
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Register a new alumni with Google
// @route   POST /api/alumni/register-google
// @access  Public
const registerAlumniWithGoogle = asyncHandler(async (req, res) => {
  const { 
    name, 
    email, 
    googleId, 
    graduationYear, 
    branch,
    university, 
    college,
    currentPosition, 
    company,
    documentURL,
    skills = []
  } = req.body;

  console.log("Google registration request body:", { 
    name, email, googleId, graduationYear, branch, university, documentURL 
  });

  try {
    // First, check if there's an alumni with this email
    const alumniWithEmail = await Alumni.findOne({ email });
    
    if (alumniWithEmail) {
      console.log(`Found existing alumni with email ${email}, ID: ${alumniWithEmail._id}`);
      res.status(400);
      throw new Error("Email already registered");
    }
    
    // Then check if there's an alumni with this googleId (if provided)
    if (googleId) {
      const alumniWithGoogleId = await Alumni.findOne({ googleId });
      if (alumniWithGoogleId) {
        console.log(`Found existing alumni with googleId ${googleId}, ID: ${alumniWithGoogleId._id}`);
        res.status(400);
        throw new Error(`This Google account is already linked to another profile`);
      }
    } else {
      console.log("Warning: No googleId provided for Google registration");
    }

    console.log(`No existing alumni found with email ${email} or googleId ${googleId}`);

    // Check if a verification request already exists for this email
    const existingVerificationRequest = await VerificationRequest.findOne({ email });
    console.log("Existing verification request:", existingVerificationRequest ? `found with ID ${existingVerificationRequest._id}` : "not found");

    // Create alumni with unverified status
    const alumni = new Alumni({
      name,
      email,
      googleId, // Make sure googleId is passed if available
      graduationYear,
      branch,
      university: university || "",
      college: college || "",
      currentPosition: currentPosition || "",
      company: company || "",
      isVerified: false,
      verificationStatus: 'pending',
      status: 'pending',
      isEmailVerified: true, // Email is verified through Google
      verificationSubmittedAt: new Date(),
      // Store document URL in alumni record
      verificationDocument: documentURL ? {
        url: documentURL,
        filename: path.basename(documentURL)
      } : undefined,
      skills: skills || []
    });

    // Save without running password validations
    await alumni.save({ validateBeforeSave: false });
    console.log(`Successfully created new alumni with Google auth: ${alumni._id}`);

    // Handle verification request (update or create)
    let verificationRequest;
    if (existingVerificationRequest) {
      // Update existing verification request
      existingVerificationRequest.userId = alumni._id;
      existingVerificationRequest.documentURL = documentURL;
      existingVerificationRequest.name = name;
      existingVerificationRequest.branch = branch || "";
      existingVerificationRequest.graduationYear = graduationYear;
      existingVerificationRequest.university = university || "";
      existingVerificationRequest.currentCompany = company || "";
      existingVerificationRequest.currentRole = currentPosition || "";
      existingVerificationRequest.status = 'pending'; // Reset status to pending
      
      verificationRequest = await existingVerificationRequest.save();
      console.log(`Updated existing verification request: ${verificationRequest._id}`);
    } else {
      try {
        // Create a new verification request
        verificationRequest = await VerificationRequest.create({
          name,
          email,
          university: university || "",
          degree: "Not Specified",
          branch: branch || "",
          graduationYear,
          currentCompany: company || "",
          currentRole: currentPosition || "",
          documentURL,
          userId: alumni._id,
          status: 'pending'
        });
        console.log(`Created new verification request: ${verificationRequest._id}`);
      } catch (verificationError) {
        // If creating verification request fails, don't fail the registration
        console.error("Failed to create verification request:", verificationError.message);
        // Continue with alumni registration anyway
      }
    }

    // Generate JWT
    const token = generateToken(alumni._id);

    // Return success response
    res.status(201).json({
      _id: alumni._id,
      name: alumni.name,
      email: alumni.email,
      isVerified: false,
      token: token,
      message: "Registration successful. Your account is pending verification."
    });
  } catch (error) {
    console.error("Error in alumni Google registration:", error);
    res.status(400);
    throw new Error(error.message || "Failed to register alumni with Google");
  }
});

export {
  registerAlumni,
  authAlumni,
  getAlumniProfile,
  updateAlumniProfile,
  getAllAlumni,
  getAlumniById,
  deleteAlumni,
  getAlumniByCompany,
  updateAlumniProfilePicture, // Changed from updateProfilePicture to match the import
  getVerificationStatus as checkVerificationStatus,
  resendVerification,
  searchAlumni,
  getAlumniByBatch,
  submitVerificationDocument,
  registerAlumniWithGoogle 
};
