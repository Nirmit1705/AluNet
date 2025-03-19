import asyncHandler from "express-async-handler";
import Student from "../Models/Student.js";
import generateToken from "../Utils/generateToken.js";
import { formatStudentResponse } from "../Utils/responseFormatter.js";

// @desc    Register a new student
// @route   POST /api/students/register
// @access  Public
const registerStudent = asyncHandler(async (req, res) => {
  const {
    name,
    email,
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
    University,
    College
  } = req.body;

  const studentExists = await Student.findOne({ email });

  if (studentExists) {
    res.status(400);
    throw new Error("Student already registered");
  }

  const student = await Student.create({
    name,
    email,
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
    University,
    College
  });

  if (student) {
    res.status(201).json(formatStudentResponse(student, true));
  } else {
    res.status(400);
    throw new Error("Invalid student data");
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

  if (student) {
    // Update fields if provided in request
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        student[key] = req.body[key];
      }
    });

    const updatedStudent = await student.save();
    res.json(formatStudentResponse(updatedStudent, true));
  } else {
    res.status(404);
    throw new Error("Student not found");
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

export {
  registerStudent,
  authStudent,
  getStudentProfile,
  updateStudentProfile,
  getAllStudents,
  deleteStudent,
  searchStudents,
  getStudentsByBranch,
  getStudentsByYear,
};
