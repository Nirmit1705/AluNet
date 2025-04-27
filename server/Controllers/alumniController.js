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
  const alumni = await Alumni.findById(req.user._id);

  if (alumni) {
    res.json(formatAlumniResponse(alumni));
  } else {
    res.status(404);
    throw new Error("Alumni not found");
  }
});

// @desc    Update alumni profile
// @route   PUT /api/alumni/profile
// @access  Private
const updateAlumniProfile = asyncHandler(async (req, res) => {
  const alumni = await Alumni.findById(req.user._id);

  if (!alumni) {
    res.status(404);
    throw new Error("Alumni not found");
  }

  const {
    name,
    phone,
    graduationYear,
    degree,
    specialization,
    currentPosition,
    company,
    linkedin,
    experience,
    skills,
    interests,
    mentorshipAvailable,
    mentorshipAreas,
    bio,
    location,
    industry,
    university,
    college
  } = req.body;

  // Update fields if provided
  if (name) alumni.name = name;
  if (phone) alumni.phone = phone;
  if (graduationYear) alumni.graduationYear = graduationYear;
  if (degree) alumni.degree = degree;
  if (specialization) alumni.specialization = specialization;
  if (currentPosition) alumni.currentPosition = currentPosition;
  if (company) alumni.company = company;
  if (linkedin) alumni.linkedin = linkedin;
  if (experience) alumni.experience = experience;
  if (skills) alumni.skills = skills;
  if (interests) alumni.interests = interests;
  if (mentorshipAvailable !== undefined) alumni.mentorshipAvailable = mentorshipAvailable;
  if (mentorshipAreas) alumni.mentorshipAreas = mentorshipAreas;
  if (bio) alumni.bio = bio;
  if (location) alumni.location = location;
  if (industry) alumni.industry = industry;
  if (university) alumni.university = university;
  if (college) alumni.college = college;

  const updatedAlumni = await alumni.save();
  res.json(formatAlumniResponse(updatedAlumni, true));
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
  if (company) query.company = { $regex: company, $options: 'i' };
  if (specialization) query.specialization = { $regex: specialization, $options: 'i' };
  if (skills) query.skills = { $in: skills.split(',').map(skill => new RegExp(skill.trim(), 'i')) };
  if (graduationYear) query.graduationYear = graduationYear;
  if (mentorshipAvailable) query.mentorshipAvailable = mentorshipAvailable === 'true';
  if (university) query.university = { $regex: university, $options: 'i' };
  if (location) query.location = { $regex: location, $options: 'i' };
  if (industry) query.industry = { $regex: industry, $options: 'i' };

  const alumni = await Alumni.find(query)
    .select('name email profilePicture company position experience specialization graduationYear skills interests university bio location linkedin')
    .sort('-lastActive');
  
  res.json(alumni);
});

// @desc    Get alumni by graduation year
// @route   GET /api/alumni/batch/:year
// @access  Public
const getAlumniByBatch = asyncHandler(async (req, res) => {
  const alumni = await Alumni.find({ graduationYear: req.params.year });
  
  if (alumni.length > 0) {
    res.json(alumni);
  } else {
    res.status(404);
    throw new Error("No alumni found for this graduation year");
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

// @desc    Update alumni profile picture
// @route   PUT /api/alumni/profile/profile-picture
// @access  Private
const updateAlumniProfilePicture = asyncHandler(async (req, res) => {
  const { imageUrl, publicId } = req.body;
  
  if (!imageUrl) {
    res.status(400);
    throw new Error("Image URL is required");
  }
  
  const alumni = await Alumni.findById(req.user._id);
  
  if (!alumni) {
    res.status(404);
    throw new Error("Alumni not found");
  }
  
  // If alumni already has a profile picture with a public_id, we might want to delete it from Cloudinary
  if (alumni.profilePicture && alumni.profilePicture.public_id) {
    try {
      await removeFromCloudinary(alumni.profilePicture.public_id);
    } catch (error) {
      console.error("Error removing old profile picture:", error);
      // Continue anyway, as this is not critical
    }
  }
  
  // Update the profile picture
  alumni.profilePicture = {
    url: imageUrl,
    public_id: publicId || ""
  };
  
  const updatedAlumni = await alumni.save();
  
  res.json({
    success: true,
    profilePicture: updatedAlumni.profilePicture,
    message: "Profile picture updated successfully"
  });
});

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

  // Check if alumni exists
  const alumniExists = await Alumni.findOne({ 
    $or: [{ email }, { googleId }] 
  });
  
  if (alumniExists) {
    res.status(400);
    throw new Error("Email already registered");
  }

  try {
    // Create alumni with unverified status
    const alumni = new Alumni({
      name,
      email,
      googleId,
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

    if (alumni) {
      // Create a verification request
      const verificationRequest = await VerificationRequest.create({
        name,
        email,
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
    } else {
      res.status(400);
      throw new Error("Invalid alumni data");
    }
  } catch (error) {
    console.error("Error in alumni Google registration:", error);
    res.status(400);
    throw new Error(error.message);
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
  updateAlumniProfilePicture, // Changed from uploadAlumniProfilePicture to match the function name
  getVerificationStatus as checkVerificationStatus,
  resendVerification,
  searchAlumni,
  getAlumniByBatch,
  submitVerificationDocument,
  registerAlumniWithGoogle 
};
