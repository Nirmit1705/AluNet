import { generateToken } from "./generateToken.js";

/**
 * Format alumni data for response
 * @param {Object} alumni - Alumni document from MongoDB
 * @param {Boolean} includeToken - Whether to include auth token
 * @returns {Object} Formatted alumni object
 */
const formatAlumniResponse = (alumni, includeToken = false) => {
  const response = {
    _id: alumni._id, // Ensure _id is always included
    id: alumni._id, // Add an additional id field for more compatibility
    name: alumni.name,
    email: alumni.email,
    phone: alumni.phone,
    graduationYear: alumni.graduationYear,
    university: alumni.university, // Keep for backward compatibility
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
    education: formatEducationForDisplay(alumni),
    educationData: alumni.education || [],
    isVerified: alumni.isVerified,
    status: alumni.status,
    verificationStatus: alumni.verificationStatus,
    industry: alumni.industry || "",
    userType: 'Alumni' // Add a userType field for frontend convenience
  };
  
  // If token is requested, include it
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
    location: student.location,
    graduationYear: student.graduationYear,
    university: student.university,
    college: student.college,
    previousEducation: student.previousEducation || [],
    internships: student.internships || [],
    projects: student.projects || [],
    profilePicture: student.profilePicture,
    careerGoals: student.careerGoals,
    isActive: student.isActive,
    status: student.status,
    role: student.role || "student"
  };

  // If token is requested, include it
  if (includeToken) {
    response.token = generateToken(student._id);
  }

  return response;
};

/**
 * Format education information for display
 * @param {Object} alumni - Alumni document
 * @returns {String} Formatted education string
 */
const formatEducationForDisplay = (alumni) => {
  // If education is already a string, return it
  if (alumni.education && typeof alumni.education === 'string') {
    return alumni.education;
  }
  
  // If education is an array, format it appropriately
  if (alumni.education && Array.isArray(alumni.education) && alumni.education.length > 0) {
    return alumni.education.map(edu => {
      if (typeof edu === 'object') {
        let parts = [];
        if (edu.degree) parts.push(edu.degree);
        if (edu.fieldOfStudy && !edu.degree?.includes(edu.fieldOfStudy)) {
          parts.push(`in ${edu.fieldOfStudy}`);
        }
        
        // Handle both institution and university distinctly
        if (edu.institution && edu.university && edu.institution !== edu.university) {
          parts.push(`at ${edu.institution}, ${edu.university}`);
        } else if (edu.institution) {
          parts.push(`at ${edu.institution}`);
        } else if (edu.university) {
          parts.push(`at ${edu.university}`);
        }
        
        return parts.join(' ');
      }
      return edu;
    }).join('; ');
  }
  
  // Fallback: Try to build from individual fields
  if (alumni.degree) {
    let educationStr = alumni.degree;
    if (alumni.university) {
      educationStr += ` at ${alumni.university}`;
    }
    return educationStr;
  }
  
  // Final fallback
  return alumni.university || '';
};

export { formatAlumniResponse, formatStudentResponse, formatEducationForDisplay };