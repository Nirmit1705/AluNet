import asyncHandler from "express-async-handler";
import Alumni from "../Models/Alumni.js";
import VerificationRequest from "../Models/VerificationRequest.js";
import { formatAlumniResponse } from "../Utils/responseFormatter.js";
import { generateToken } from "../Utils/generateToken.js";
import { uploadProfilePicture, uploadToCloudinary, removeFromCloudinary, handleVerificationDocument } from "../Utils/fileUpload.js";
import fs from 'fs';
import bcrypt from 'bcryptjs';
import path from 'path'; // Add this import for path.basename

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

  console.log("Registration request body:", req.body);

  // Check if alumni exists
  const alumniExists = await Alumni.findOne({ email });
  if (alumniExists) {
    res.status(400);
    throw new Error("Email already registered");
  }

  // Check if a verification request already exists for this email
  const existingVerificationRequest = await VerificationRequest.findOne({ email });
  
  // Create alumni with unverified status
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const alumni = await Alumni.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || "",
      graduationYear,
      branch,
      university: university || "",
      college: college || "",
      currentPosition: currentPosition || "",
      company: company || "",
      verificationStatus: 'pending',
    });

    if (alumni) {
      let verificationRequest;
      
      if (existingVerificationRequest) {
        // Update the existing verification request instead of creating a new one
        existingVerificationRequest.name = name;
        existingVerificationRequest.phone = phone || "";
        existingVerificationRequest.university = university || "";
        existingVerificationRequest.degree = "Not Specified";
        existingVerificationRequest.branch = branch;
        existingVerificationRequest.graduationYear = graduationYear;
        existingVerificationRequest.currentCompany = company || "";
        existingVerificationRequest.currentRole = currentPosition || "";
        existingVerificationRequest.documentURL = documentURL;
        existingVerificationRequest.userId = alumni._id;
        existingVerificationRequest.status = 'pending';
        
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

      res.status(201).json({
        _id: alumni._id,
        name: alumni.name,
        email: alumni.email,
        token: generateToken(alumni._id),
        isVerified: false,
        status: 'pending',
        role: 'alumni'
      });
    } else {
      res.status(400);
      throw new Error("Invalid alumni data");
    }
  } catch (error) {
    console.error("Error creating alumni:", error);
    res.status(500);
    throw new Error(error.message);
  }
});

// @desc    Check verification status
// @route   GET /api/alumni/verification-status
// @access  Private
const checkVerificationStatus = asyncHandler(async (req, res) => {
  const alumni = await Alumni.findById(req.user._id);
  
  if (!alumni) {
    res.status(404);
    throw new Error("Alumni not found");
  }
  
  // Get the verification request for more details
  const verificationRequest = await VerificationRequest.findOne({ userId: alumni._id }).sort({ createdAt: -1 });
  
  // Ensure consistency between alumni model and verification request
  let needsSync = false;
  if (verificationRequest) {
    if (verificationRequest.status === 'approved' && !alumni.isVerified) {
      alumni.isVerified = true;
      alumni.verificationStatus = 'approved';
      alumni.status = 'active';
      needsSync = true;
    } else if (verificationRequest.status === 'rejected' && 
              (alumni.verificationStatus !== 'rejected' || alumni.isVerified)) {
      alumni.isVerified = false;
      alumni.verificationStatus = 'rejected';
      alumni.status = 'inactive';
      needsSync = true;
    }
    
    if (needsSync) {
      console.log(`Syncing alumni ${alumni._id} with latest verification request status: ${verificationRequest.status}`);
      await alumni.save();
    }
  }
  
  res.json({
    isVerified: alumni.isVerified,
    status: alumni.status || (alumni.isVerified ? 'active' : 'pending'),
    verificationStatus: alumni.verificationStatus || (alumni.isVerified ? 'approved' : 'pending'),
    rejectionReason: verificationRequest?.rejectionReason || alumni.verificationRejectionReason || null,
    requestDate: verificationRequest?.createdAt || null
  });
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

// @desc    Auth user & get token
// @route   POST /api/alumni/login
// @access  Public
const authAlumni = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const alumni = await Alumni.findOne({ email }).select('+password');

  if (!alumni) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Check if password matches
  const isMatch = await alumni.matchPassword(password);
  
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  
  // Check if email is verified (unless verification is disabled in development)
  if (process.env.NODE_ENV !== 'development' && !alumni.isEmailVerified) {
    res.status(401);
    throw new Error('Please verify your email before logging in');
  }

  res.json({
    _id: alumni._id,
    name: alumni.name,
    email: alumni.email,
    token: generateToken(alumni._id),
    isEmailVerified: alumni.isEmailVerified
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

// @desc    Upload alumni profile picture
// @route   POST /api/alumni/profile/upload-picture
// @access  Private
const uploadAlumniProfilePicture = asyncHandler(async (req, res) => {
  // Use multer middleware for file upload
  uploadProfilePicture(req, res, async (err) => {
    if (err) {
      res.status(400);
      throw new Error(err.message);
    }

    // Check if file exists
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a file');
    }

    try {
      const alumni = await Alumni.findById(req.user._id);
      
      if (!alumni) {
        res.status(404);
        throw new Error('Alumni not found');
      }

      // If alumni already has a profile picture, delete it from Cloudinary
      if (alumni.profilePicture && alumni.profilePicture.public_id) {
        await removeFromCloudinary(alumni.profilePicture.public_id);
      }

      // Upload to Cloudinary
      const result = await uploadToCloudinary(req.file.path, 'alumni_profile_pictures');
      
      // Remove temporary file
      fs.unlinkSync(req.file.path);

      // Update alumni profile with new picture URL
      alumni.profilePicture = {
        url: result.url,
        public_id: result.public_id
      };
      
      await alumni.save();

      res.json({
        message: 'Profile picture uploaded successfully',
        profilePicture: alumni.profilePicture
      });
    } catch (error) {
      // Remove temporary file if it exists
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500);
      throw new Error(`Failed to upload profile picture: ${error.message}`);
    }
  });
});

// @desc    Submit verification document
// @route   POST /api/alumni/submit-verification
// @access  Private (alumni only)
const submitVerificationDocument = asyncHandler(async (req, res) => {
  // Use the handleVerificationDocument middleware 
  handleVerificationDocument(req, res, async (err) => {
    if (err) {
      res.status(400);
      throw new Error(err.message);
    }

    // Check if file exists
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a verification document (PDF only)');
    }

    try {
      const alumni = await Alumni.findById(req.user._id);
      
      if (!alumni) {
        res.status(404);
        throw new Error('Alumni not found');
      }

      // Create a full URL for the document
      const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
      const documentURL = `${baseUrl}/uploads/${path.basename(req.file.path)}`;
      
      console.log("Generated document URL:", documentURL);
      
      // Update alumni record with document info
      alumni.verificationDocument = {
        url: documentURL,
        publicId: req.file.filename
      };
      alumni.verificationStatus = 'pending';
      
      await alumni.save();
      
      // Create or update verification request
      let verificationRequest = await VerificationRequest.findOne({ 
        $or: [
          { userId: alumni._id },
          { email: alumni.email }
        ]
      });
      
      if (verificationRequest) {
        // Update existing request
        verificationRequest.documentURL = documentURL;
        verificationRequest.status = 'pending';
        verificationRequest.name = alumni.name;
        verificationRequest.email = alumni.email;
        verificationRequest.phone = alumni.phone || "";
        verificationRequest.university = alumni.university || "";
        verificationRequest.degree = alumni.degree || "Not Specified";
        verificationRequest.branch = alumni.branch;
        verificationRequest.graduationYear = alumni.graduationYear;
        verificationRequest.currentCompany = alumni.company || "";
        verificationRequest.currentRole = alumni.currentPosition || "";
        verificationRequest.userId = alumni._id;
        
        await verificationRequest.save();
        console.log("Updated verification request with document URL:", documentURL);
      } else {
        // Create new verification request
        verificationRequest = await VerificationRequest.create({
          name: alumni.name,
          email: alumni.email,
          phone: alumni.phone || "",
          university: alumni.university || "",
          degree: alumni.degree || "Not Specified",
          branch: alumni.branch,
          graduationYear: alumni.graduationYear,
          currentCompany: alumni.company || "",
          currentRole: alumni.currentPosition || "",
          documentURL: documentURL,
          userId: alumni._id,
          status: 'pending'
        });
        console.log("Created new verification request with document URL:", documentURL);
      }
      
      res.json({
        success: true,
        message: 'Verification document uploaded successfully',
        documentUrl: documentURL
      });
    } catch (error) {
      console.error("Error in submitVerificationDocument:", error);
      res.status(500);
      throw new Error(`Error uploading document: ${error.message}`);
    }
  });
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

export {
  registerAlumni,
  authAlumni as loginAlumni, // Fix: Export authAlumni as loginAlumni
  getAlumniProfile,
  updateAlumniProfile,
  getAllAlumni,
  getAlumniById, // Now properly defined
  deleteAlumni,
  getAlumniByCompany,
  uploadAlumniProfilePicture,
  checkVerificationStatus,
  resendVerification,
  searchAlumni,
  getAlumniByBatch,
  submitVerificationDocument
};
