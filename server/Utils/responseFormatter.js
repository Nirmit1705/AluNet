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
    university: alumni.university,
    college: alumni.college,
    degree: alumni.degree,
    specialization: alumni.specialization,
    currentPosition: alumni.currentPosition || alumni.position,
    company: alumni.company,
    linkedin: alumni.linkedin || alumni.linkedInProfile,
    experience: alumni.experience,
    skills: alumni.skills || [],
    mentorshipAvailable: alumni.mentorshipAvailable,
    bio: alumni.bio,
    location: alumni.location, 
    profilePicture: alumni.profilePicture,
    interests: alumni.interests || [],
    education: alumni.education || [],
    isVerified: alumni.isVerified,
    status: alumni.status,
    verificationStatus: alumni.verificationStatus,
    industry: alumni.industry || ""
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
    university: student.university,
    college: student.college,
    graduationYear: student.graduationYear,
    skills: student.skills || [],
    interests: student.interests || [],
    bio: student.bio,
    linkedin: student.linkedin,
    github: student.github,
    location: student.location,
    profilePicture: student.profilePicture,
    previousEducation: student.previousEducation || [],
    status: student.status,
    isEmailVerified: student.isEmailVerified,
    projects: student.projects || [],
    internships: student.internships || [],
    careerGoals: student.careerGoals
  };
  
  if (includeToken) {
    response.token = generateToken(student._id);
  }
  
  return response;
};

export { formatAlumniResponse, formatStudentResponse };