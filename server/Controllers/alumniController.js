import asyncHandler from "express-async-handler";
import Alumni from "../Models/Alumni.js";
import { formatAlumniResponse } from "../Utils/responseFormatter.js";
import { generateToken } from "../Utils/generateToken.js";
import { uploadProfilePicture, uploadToCloudinary, removeFromCloudinary } from "../Utils/fileUpload.js";
import fs from 'fs';

// @desc    Register a new alumni
// @route   POST /api/alumni/register
// @access  Public
const registerAlumni = asyncHandler(async (req, res) => {
  const { name, email, phone, graduationYear, University, College, degree, specialization, currentPosition, company, linkedin, experience, skills, mentorshipAvailable, bio } = req.body;

  const alumniExists = await Alumni.findOne({ email });

  if (alumniExists) {
    res.status(400);
    throw new Error("Alumni already registered");
  }

  const alumni = await Alumni.create({
    name,
    email,
    phone,
    graduationYear,
    University,
    College,
    degree,
    specialization,
    currentPosition,
    company,
    linkedin,
    experience,
    skills,
    mentorshipAvailable,
    bio,
  });

  if (alumni) {
    res.status(201).json(formatAlumniResponse(alumni, true));
  } else {
    res.status(400);
    throw new Error("Invalid alumni data");
  }
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

  if (alumni) {
    // Update fields if provided in request
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        alumni[key] = req.body[key];
      }
    });

    const updatedAlumni = await alumni.save();
    res.json(formatAlumniResponse(updatedAlumni, true));
  } else {
    res.status(404);
    throw new Error("Alumni not found");
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
  const { name, degree, specialization, skills, mentorshipAvailable } = req.query;
  
  const query = {};
  
  if (name) query.name = { $regex: name, $options: 'i' };
  if (degree) query.degree = { $regex: degree, $options: 'i' };
  if (specialization) query.specialization = { $regex: specialization, $options: 'i' };
  if (skills) query.skills = { $in: skills.split(',').map(skill => skill.trim()) };
  if (mentorshipAvailable !== undefined) query.mentorshipAvailable = mentorshipAvailable === 'true';

  const alumni = await Alumni.find(query);
  
  if (alumni.length > 0) {
    res.json(alumni);
  } else {
    res.status(404);
    throw new Error("No alumni found matching the search criteria");
  }
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

export {
  registerAlumni,
  authAlumni,
  getAlumniProfile,
  updateAlumniProfile,
  getAllAlumni,
  deleteAlumni,
  searchAlumni,
  getAlumniByBatch,
  getAlumniByCompany,
  uploadAlumniProfilePicture,
};
