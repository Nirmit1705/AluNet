const asyncHandler = require("express-async-handler");
const Alumni = require("../Models/Alumni");
const generateToken = require("../Utils/generateToken");

// @desc    Register a new alumni
// @route   POST /api/alumni/register
// @access  Public
const registerAlumni = asyncHandler(async (req, res) => {
  const { name, email, phone, graduationYear, degree, specialization, currentPosition, company, linkedin, experience, skills, mentorshipAvailable, bio } = req.body;

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
    res.status(201).json({
      _id: alumni._id,
      name: alumni.name,
      email: alumni.email,
      phone: alumni.phone,
      graduationYear: alumni.graduationYear,
      degree: alumni.degree,
      specialization: alumni.specialization,
      currentPosition: alumni.currentPosition,
      company: alumni.company,
      linkedin: alumni.linkedin,
      experience: alumni.experience,
      skills: alumni.skills,
      mentorshipAvailable: alumni.mentorshipAvailable,
      bio: alumni.bio,
      token: generateToken(alumni._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid alumni data");
  }
});

// @desc    Authenticate alumni & get token
// @route   POST /api/alumni/login
// @access  Public
const authAlumni = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const alumni = await Alumni.findOne({ email });

  if (alumni) {
    res.json({
      _id: alumni._id,
      name: alumni.name,
      email: alumni.email,
      phone: alumni.phone,
      graduationYear: alumni.graduationYear,
      degree: alumni.degree,
      specialization: alumni.specialization,
      currentPosition: alumni.currentPosition,
      company: alumni.company,
      linkedin: alumni.linkedin,
      experience: alumni.experience,
      skills: alumni.skills,
      mentorshipAvailable: alumni.mentorshipAvailable,
      bio: alumni.bio,
      token: generateToken(alumni._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email");
  }
});

// @desc    Get alumni profile
// @route   GET /api/alumni/profile
// @access  Private
const getAlumniProfile = asyncHandler(async (req, res) => {
  const alumni = await Alumni.findById(req.user._id);

  if (alumni) {
    res.json({
      _id: alumni._id,
      name: alumni.name,
      email: alumni.email,
      phone: alumni.phone,
      graduationYear: alumni.graduationYear,
      degree: alumni.degree,
      specialization: alumni.specialization,
      currentPosition: alumni.currentPosition,
      company: alumni.company,
      linkedin: alumni.linkedin,
      experience: alumni.experience,
      skills: alumni.skills,
      mentorshipAvailable: alumni.mentorshipAvailable,
      bio: alumni.bio,
    });
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
    alumni.name = req.body.name || alumni.name;
    alumni.phone = req.body.phone || alumni.phone;
    alumni.degree = req.body.degree || alumni.degree;
    alumni.specialization = req.body.specialization || alumni.specialization;
    alumni.currentPosition = req.body.currentPosition || alumni.currentPosition;
    alumni.company = req.body.company || alumni.company;
    alumni.linkedin = req.body.linkedin || alumni.linkedin;
    alumni.experience = req.body.experience || alumni.experience;
    alumni.skills = req.body.skills || alumni.skills;
    alumni.mentorshipAvailable = req.body.mentorshipAvailable || alumni.mentorshipAvailable;
    alumni.bio = req.body.bio || alumni.bio;

    const updatedAlumni = await alumni.save();

    res.json({
      _id: updatedAlumni._id,
      name: updatedAlumni.name,
      email: updatedAlumni.email,
      phone: updatedAlumni.phone,
      graduationYear: updatedAlumni.graduationYear,
      degree: updatedAlumni.degree,
      specialization: updatedAlumni.specialization,
      currentPosition: updatedAlumni.currentPosition,
      company: updatedAlumni.company,
      linkedin: updatedAlumni.linkedin,
      experience: updatedAlumni.experience,
      skills: updatedAlumni.skills,
      mentorshipAvailable: updatedAlumni.mentorshipAvailable,
      bio: updatedAlumni.bio,
      token: generateToken(updatedAlumni._id),
    });
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
// @access  Private (Admin)
const deleteAlumni = asyncHandler(async (req, res) => {
  const alumni = await Alumni.findById(req.params.id);

  if (alumni) {
    await alumni.remove();
    res.json({ message: "Alumni removed successfully" });
  } else {
    res.status(404);
    throw new Error("Alumni not found");
  }
});

module.exports = {
  registerAlumni,
  authAlumni,
  getAlumniProfile,
  updateAlumniProfile,
  getAllAlumni,
  deleteAlumni,
};
