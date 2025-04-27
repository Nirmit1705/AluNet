import asyncHandler from "express-async-handler";
import Student from "../Models/Student.js";
import { generateToken } from "../Utils/generateToken.js";
import { formatStudentResponse } from "../Utils/responseFormatter.js";
import { uploadProfilePicture, uploadResume, uploadToCloudinary, removeFromCloudinary } from "../Utils/fileUpload.js";
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

// @desc    Update student profile
// @route   PUT /api/students/profile
// @access  Private
const updateStudentProfile = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.user._id);

  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  const {
    name,
    phone,
    currentYear,
    branch,
    cgpa,
    skills,
    interests,
    bio,
    linkedin,
    github,
    careerGoals,
    projects,
    internships,
    university,
    college,
    location, // Add location field
  } = req.body;

  // Update fields if provided
  if (name) student.name = name;
  if (phone) student.phone = phone;
  if (currentYear) student.currentYear = currentYear;
  if (branch) student.branch = branch;
  if (cgpa) student.cgpa = cgpa;
  if (skills) student.skills = skills;
  if (interests) student.interests = interests;
  if (bio) student.bio = bio;
  if (linkedin) student.linkedin = linkedin;
  if (github) student.github = github;
  if (careerGoals) student.careerGoals = careerGoals;
  if (projects) student.projects = projects;
  if (internships) student.internships = internships;
  if (university) student.university = university;
  if (college) student.college = college;
  if (location) student.location = location; // Handle location field

  const updatedStudent = await student.save();
  res.json(formatStudentResponse(updatedStudent, true));
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

// @desc    Update student profile picture
// @route   PUT /api/students/profile/profile-picture
// @access  Private
const updateStudentProfilePicture = asyncHandler(async (req, res) => {
  const { imageUrl, publicId } = req.body;
  
  if (!imageUrl) {
    res.status(400);
    throw new Error("Image URL is required");
  }
  
  const student = await Student.findById(req.user._id);
  
  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }
  
  // Store the profile picture as an object with url and public_id
  student.profilePicture = {
    url: imageUrl,
    public_id: publicId || ""
  };
  
  const updatedStudent = await student.save();
  
  res.json({
    success: true,
    profilePicture: updatedStudent.profilePicture,
    message: "Profile picture updated successfully"
  });
});

// @desc    Upload student resume
// @route   POST /api/students/upload-resume
// @access  Private
const uploadStudentResume = asyncHandler(async (req, res) => {
  uploadResume(req, res, async function(err) {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume'
      });
    }

    try {
      // Upload to Cloudinary (or local storage)
      const result = await uploadToCloudinary(req.file.path, 'resumes');
      
      // Remove the temporary file
      fs.unlinkSync(req.file.path);
      
      const student = await Student.findById(req.user._id);
      
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }
      
      // Update student with resume URL
      student.resume = result.secure_url;
      await student.save();
      
      res.status(200).json({
        success: true,
        resumeUrl: result.secure_url,
        message: 'Resume uploaded successfully'
      });
    } catch (error) {
      console.error("Error processing resume upload:", error);
      // Clean up temp file if it exists
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error processing the uploaded resume'
      });
    }
  });
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
  updateStudentProfilePicture, // Changed from uploadStudentProfilePicture
  uploadStudentResume,
};
