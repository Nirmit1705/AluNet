import { generateToken } from "./generateToken.js";

/**
 * Format alumni data for response
 * @param {Object} alumni - Alumni document from MongoDB
 * @param {Boolean} includeToken - Whether to include auth token
 * @returns {Object} Formatted alumni object
 */
const formatAlumniResponse = (alumni, includeToken = false) => {
  const response = {
    _id: alumni._id,
    name: alumni.name,
    email: alumni.email,
    phone: alumni.phone,
    graduationYear: alumni.graduationYear,
    University: alumni.University,
    College: alumni.College,
    degree: alumni.degree,
    specialization: alumni.specialization,
    currentPosition: alumni.currentPosition,
    company: alumni.company,
    linkedin: alumni.linkedin,
    experience: alumni.experience,
    skills: alumni.skills,
    mentorshipAvailable: alumni.mentorshipAvailable,
    bio: alumni.bio,
    location: alumni.location, // Ensure location is included
    profilePicture: alumni.profilePicture, // Include profile picture
    interests: alumni.interests || [], // Ensure interests field is included
    previousEducation: alumni.previousEducation || [], // Include previous education
  };

  if (includeToken) {
    response.token = generateToken(alumni._id);
  }

  return response;
};

/**
 * Format student data for response
 * @param {Object} student - Student document from MongoDB
 * @param {Boolean} includeToken - Whether to include auth token
 * @returns {Object} Formatted student object
 */
const formatStudentResponse = (student, includeToken = false) => {
  const response = {
    _id: student._id,
    name: student.name,
    email: student.email,
    phone: student.phone,
    registrationNumber: student.registrationNumber,
    currentYear: student.currentYear,
    branch: student.branch,
    cgpa: student.cgpa,
    skills: student.skills || [],
    interests: student.interests || [],
    bio: student.bio,
    linkedin: student.linkedin,
    github: student.github,
    resume: student.resume,
    university: student.university,
    college: student.college,
    graduationYear: student.graduationYear,
    isEmailVerified: student.isEmailVerified,
    profilePicture: student.profilePicture, // Include profile picture
    location: student.location || "", // Add location field with default
    previousEducation: student.previousEducation || [], // Include previous education
  };

  if (includeToken) {
    response.token = generateToken(student._id);
  }

  return response;
};

export { formatAlumniResponse, formatStudentResponse };