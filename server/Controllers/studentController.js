import asyncHandler from "express-async-handler";
import Student from "../Models/Student.js";
import { generateToken } from "../Utils/generateToken.js";
import { formatStudentResponse } from "../Utils/responseFormatter.js";
import { uploadProfilePicture, uploadToCloudinary, removeFromCloudinary } from "../Utils/fileUpload.js";
import fs from 'fs';

// @desc    Register a new student
// @route   POST /api/students/register
// @access  Public
const registerStudent = asyncHandler(async (req, res) => {
  console.log("Student registration request received");
  console.log("Request body:", req.body);
  // Log each required field
  console.log("name:", req.body.name);
  console.log("email:", req.body.email);
  console.log("password:", req.body.password ? "provided" : "missing");
  console.log("registrationNumber:", req.body.registrationNumber);
  console.log("currentYear:", req.body.currentYear);
  console.log("branch:", req.body.branch);
  console.log("university:", req.body.university);
  console.log("college:", req.body.college);
  console.log("graduationYear:", req.body.graduationYear);

  const {
    name,
    email,
    password, // ADDED password field
    phone,
    registrationNumber,
    currentYear,
    branch,
    cgpa,
    skills,
    interests,
    bio,
    linkedin,
    github,
    resume,
    university, // Changed from University
    college,    // Changed from College
    graduationYear // ADDED graduationYear field
  } = req.body;

  const studentExists = await Student.findOne({ email });

  if (studentExists) {
    res.status(400);
    throw new Error("Student already registered");
  }

  try {
    const student = await Student.create({
      name,
      email,
      password, // ADDED password field
      phone,
      registrationNumber,
      currentYear,
      branch,
      cgpa,
      skills: skills || [], // Provide default empty array
      interests: interests || [], // Provide default empty array
      bio,
      linkedin,
      github,
      resume,
      university, // Changed from University
      college,    // Changed from College
      graduationYear // ADDED graduationYear field
    });

    if (student) {
      // Log successful creation
      console.log("Student created successfully:", student._id);
      res.status(201).json(formatStudentResponse(student, true));
    } else {
      res.status(400);
      throw new Error("Invalid student data");
    }
  } catch (error) {
    // Log any errors during creation
    console.error("Error creating student:", error.message);
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Register a student with Google OAuth
// @route   POST /api/students/register-google
// @access  Public
const registerStudentWithGoogle = asyncHandler(async (req, res) => {
  const { 
    name, 
    email, 
    googleId, 
    registrationNumber, 
    currentYear, 
    branch, 
    university, 
    college, 
    graduationYear,
    skills
  } = req.body;

  try {
    console.log("Student Google registration data:", {
      email, googleId, name
    });
    
    // Check if student already exists with this email or Google ID
    const studentExists = await Student.findOne({ 
      $or: [{ email }, { googleId }] 
    });

    if (studentExists) {
      res.status(400);
      throw new Error("Student already registered with this email or Google account");
    }

    // Create a student document WITHOUT password validation
    const student = new Student({
      name,
      email,
      googleId,
      registrationNumber,
      currentYear: currentYear || 1,
      branch,
      university,
      college,
      graduationYear: graduationYear || (new Date().getFullYear() + 4),
      skills: skills || [],
      isEmailVerified: true // Skip email verification for Google accounts
    });

    // Save the student manually to bypass the password validation
    await student.save({ validateBeforeSave: false });

    if (student) {
      // Generate JWT token for authentication
      const token = generateToken(student._id);
      
      res.status(201).json({
        _id: student._id,
        name: student.name,
        email: student.email,
        token: token,
        isEmailVerified: student.isEmailVerified
      });
    } else {
      res.status(400);
      throw new Error("Invalid student data");
    }
  } catch (error) {
    console.error("Error creating student with Google:", error.message);
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Auth user & get token
// @route   POST /api/students/login
// @access  Public
const authStudent = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const student = await Student.findOne({ email }).select('+password');

  if (!student) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Check if password matches
  const isMatch = await student.matchPassword(password);
  
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  
  // Check if email is verified (unless verification is disabled in development)
  if (process.env.NODE_ENV !== 'development' && !student.isEmailVerified) {
    res.status(401);
    throw new Error('Please verify your email before logging in');
  }

  res.json({
    _id: student._id,
    name: student.name,
    email: student.email,
    token: generateToken(student._id),
    isEmailVerified: student.isEmailVerified
  });
});

// @desc    Get student profile
// @route   GET /api/students/profile
// @access  Private
const getStudentProfile = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.user._id);

  if (student) {
    res.json(formatStudentResponse(student));
  } else {
    res.status(404);
    throw new Error("Student not found");
  }
});

// Find the updateStudentProfile or similar function and update it to handle previousEducation
const updateStudentProfile = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  
  const {
    name,
    bio,
    location,
    linkedin,
    skills,
    interests,
    graduationYear,
    previousEducation
  } = req.body;

  try {
    const student = await Student.findById(studentId);
    
    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }
    
    // Update fields if provided
    if (name) student.name = name;
    if (bio !== undefined) student.bio = bio;
    if (location !== undefined) student.location = location;
    if (linkedin !== undefined) student.linkedin = linkedin;
    if (skills) student.skills = skills;
    if (interests) student.interests = interests;
    
    // Update graduation year if provided and valid
    if (graduationYear && !isNaN(graduationYear)) {
      const year = Number(graduationYear);
      if (year >= 1950 && year <= new Date().getFullYear() + 10) {
        student.graduationYear = year;
      }
    }
    
    // Update previous education if provided
    if (previousEducation && Array.isArray(previousEducation)) {
      // Validate each education entry
      const validEducation = previousEducation.filter(edu => {
        return (
          edu.institution && 
          edu.degree && 
          edu.fieldOfStudy && 
          edu.startYear && 
          Number(edu.startYear) >= 1950 &&
          Number(edu.startYear) <= new Date().getFullYear()
        );
      });
      
      student.previousEducation = validEducation;
    }
    
    // Save the updated profile
    const updatedStudent = await student.save();
    
    // Return the updated profile data
    res.json(formatStudentResponse(updatedStudent));
  } catch (error) {
    console.error("Error updating student profile:", error);
    res.status(500);
    throw new Error('Server error updating profile: ' + error.message);
  }
});

// @desc    Get all students
// @route   GET /api/students
// @access  Public
const getAllStudents = asyncHandler(async (req, res) => {
  const students = await Student.find({});
  res.json(students);
});

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Private
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (student) {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student removed successfully" });
  } else {
    res.status(404);
    throw new Error("Student not found");
  }
});

// @desc    Search students by various criteria
// @route   GET /api/students/search
// @access  Public
const searchStudents = asyncHandler(async (req, res) => {
  const { name, branch, skills, currentYear } = req.query;
  
  const query = {};
  
  if (name) query.name = { $regex: name, $options: 'i' };
  if (branch) query.branch = { $regex: branch, $options: 'i' };
  if (skills) query.skills = { $in: skills.split(',').map(skill => skill.trim()) };
  if (currentYear) query.currentYear = currentYear;

  const students = await Student.find(query);
  
  if (students.length > 0) {
    res.json(students);
  } else {
    res.status(404);
    throw new Error("No students found matching the search criteria");
  }
});

// @desc    Get students by branch
// @route   GET /api/students/branch/:branch
// @access  Public
const getStudentsByBranch = asyncHandler(async (req, res) => {
  const students = await Student.find({ branch: req.params.branch });
  
  if (students.length > 0) {
    res.json(students);
  } else {
    res.status(404);
    throw new Error("No students found in this branch");
  }
});

// @desc    Get students by year
// @route   GET /api/students/year/:year
// @access  Public
const getStudentsByYear = asyncHandler(async (req, res) => {
  const students = await Student.find({ currentYear: req.params.year });
  
  if (students.length > 0) {
    res.json(students);
  } else {
    res.status(404);
    throw new Error("No students found in this year");
  }
});

// Make sure the function is named correctly and exported
const updateStudentProfilePicture = async (req, res) => {
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
    
    // Find the student by ID
    const student = await Student.findById(req.user.userId);
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }
    
    // Update with the profilePicture object
    student.profilePicture = profilePictureObject;
    await student.save();
    
    return res.status(200).json({ 
      success: true, 
      message: 'Profile picture updated successfully', 
      profilePicture: student.profilePicture 
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

// @desc    Get available alumni for mentorship
// @route   GET /api/alumni
// @access  Public
const getAvailableAlumni = asyncHandler(async (req, res) => {
  try {
    // Get query parameters for filtering
    const { university, expertise, availability } = req.query;
    
    // Build query object
    const query = { status: 'active' };
    
    // Add filters if provided
    if (university) {
      query.university = university;
    }
    
    if (expertise) {
      query.expertise = { $in: expertise.split(',') };
    }
    
    if (availability) {
      query.availability = availability;
    }
    
    // Find alumni matching the criteria
    const alumni = await Alumni.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .limit(20);
      
    // Return formatted alumni list
    res.json(alumni.map(alum => ({
      _id: alum._id,
      name: alum.name,
      email: alum.email,
      jobTitle: alum.currentPosition?.title || 'Professional',
      company: alum.currentPosition?.company || '',
      university: alum.university,
      expertise: alum.expertise || [],
      availability: alum.availableForMentorship ? 'Available for mentorship' : 'Limited availability',
      profilePicture: alum.profilePicture || { url: '' },
      graduationYear: alum.graduationYear,
      bio: alum.bio || ''
    })));
  } catch (error) {
    console.error("Error fetching alumni:", error);
    res.status(500);
    throw new Error('Server error while fetching alumni');
  }
});

export {
  registerStudent,
  registerStudentWithGoogle,
  authStudent,
  getStudentProfile,
  updateStudentProfile,
  getAllStudents,
  deleteStudent,
  searchStudents,
  getStudentsByBranch,
  getStudentsByYear,
  updateStudentProfilePicture,
  getAvailableAlumni
};
