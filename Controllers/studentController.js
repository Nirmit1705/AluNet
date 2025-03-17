const asyncHandler = require("express-async-handler");
const Student = require("../Models/Student.js");
const generateToken = require("../Utils/generateToken.js");

// @desc    Register a new student
// @route   POST /api/students/register
// @access  Public
const registerStudent = asyncHandler(async (req, res) => {
  const { name, email, role, graduationYear, specialization, skills, internships, projects, linkedin, goal } = req.body;

  // Check if student already exists
  const studentExists = await Student.findOne({ email });

  if (studentExists) {
    res.status(400);
    throw new Error("Student already registered");
  }

  // Create new student with embedded internships and projects
  const student = await Student.create({
    name,
    email,
    role,
    graduationYear,
    specialization,
    skills,
    internships,
    projects,
    linkedin,
    goal,
  });

  if (student) {
    res.status(201).json({
      _id: student._id,
      name: student.name,
      email: student.email,
      role: student.role,
      graduationYear: student.graduationYear,
      specialization: student.specialization,
      skills: student.skills,
      internships: student.internships,
      projects: student.projects,
      linkedin: student.linkedin,
      goal: student.goal,
      token: generateToken(student._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid student data");
  }
});

// @desc    Authenticate student & get token
// @route   POST /api/students/login
// @access  Public
const authStudent = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const student = await Student.findOne({ email });

  if (student) {
    res.json({
      _id: student._id,
      name: student.name,
      email: student.email,
      role: student.role,
      graduationYear: student.graduationYear,
      specialization: student.specialization,
      skills: student.skills,
      internships: student.internships,
      projects: student.projects,
      linkedin: student.linkedin,
      goal: student.goal,
      token: generateToken(student._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email");
  }
});

// @desc    Get student profile
// @route   GET /api/students/profile
// @access  Private
const getStudentProfile = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.user._id);

  if (student) {
    res.json({
      _id: student._id,
      name: student.name,
      email: student.email,
      role: student.role,
      graduationYear: student.graduationYear,
      specialization: student.specialization,
      skills: student.skills,
      internships: student.internships,
      projects: student.projects,
      linkedin: student.linkedin,
      goal: student.goal,
    });
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
    student.name = req.body.name || student.name;
    student.specialization = req.body.specialization || student.specialization;
    student.skills = req.body.skills || student.skills;
    student.linkedin = req.body.linkedin || student.linkedin;
    student.goal = req.body.goal || student.goal;

    // Update internships if provided
    if (req.body.internships) {
      student.internships = req.body.internships;
    }

    // Update projects if provided
    if (req.body.projects) {
      student.projects = req.body.projects;
    }

    const updatedStudent = await student.save();

    res.json({
      _id: updatedStudent._id,
      name: updatedStudent.name,
      email: updatedStudent.email,
      role: updatedStudent.role,
      graduationYear: updatedStudent.graduationYear,
      specialization: updatedStudent.specialization,
      skills: updatedStudent.skills,
      internships: updatedStudent.internships,
      projects: updatedStudent.projects,
      linkedin: updatedStudent.linkedin,
      goal: updatedStudent.goal,
      token: generateToken(updatedStudent._id),
    });
  } else {
    res.status(404);
    throw new Error("Student not found");
  }
});

// @desc    Add an internship
// @route   PUT /api/students/add-internship
// @access  Private
const addInternship = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.user._id);

  if (student) {
    const { company, duration, role } = req.body;
    student.internships.push({ company, duration, role });

    await student.save();
    res.json(student.internships);
  } else {
    res.status(404);
    throw new Error("Student not found");
  }
});

// @desc    Add a project
// @route   PUT /api/students/add-project
// @access  Private
const addProject = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.user._id);

  if (student) {
    const { name, description } = req.body;
    student.projects.push({ name, description });

    await student.save();
    res.json(student.projects);
  } else {
    res.status(404);
    throw new Error("Student not found");
  }
});

module.exports = {
  registerStudent,
  authStudent,
  getStudentProfile,
  updateStudentProfile,
  addInternship,
  addProject,
};
