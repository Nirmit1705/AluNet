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
    mentorshipAreas: alumni.mentorshipAreas || [],
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
    userType: 'Alumni'
  };
  
  if (includeToken) {
    response.token = generateToken(alumni._id);
  }
  
  return response;
};

/**
 * Format education data for display
 * @param {Object} alumni - Alumni document
 * @returns {String} Formatted education string
 */
function formatEducationForDisplay(alumni) {
  // Handle different education field formats
  if (alumni.education && Array.isArray(alumni.education) && alumni.education.length > 0) {
    const primaryEdu = alumni.education[0];
    
    // Check if degree already contains "in" to avoid duplication
    const degreeText = primaryEdu.degree || '';
    const fieldText = primaryEdu.fieldOfStudy ? 
      (degreeText.toLowerCase().includes(`in ${primaryEdu.fieldOfStudy.toLowerCase()}`) ? 
        '' : ` in ${primaryEdu.fieldOfStudy}`) : '';
    
    // Handle institution and university separately
    let institutionText = '';
    if (primaryEdu.institution && primaryEdu.university) {
      // If both fields exist and are different, show both
      if (primaryEdu.institution !== primaryEdu.university) {
        institutionText = ` from ${primaryEdu.institution}, ${primaryEdu.university}`;
      } else {
        institutionText = ` from ${primaryEdu.institution}`;
      }
    } else if (primaryEdu.institution) {
      institutionText = ` from ${primaryEdu.institution}`;
    } else if (primaryEdu.university) {
      institutionText = ` from ${primaryEdu.university}`;
    }
    
    return `${degreeText}${fieldText}${institutionText}`;
  } else if (alumni.university || alumni.college) {
    // Fall back to basic education fields
    const degreeText = alumni.degree || '';
    const specText = alumni.specialization ? `in ${alumni.specialization}` : '';
    const uniText = alumni.university ? `from ${alumni.university}` : '';
    
    // Combine all parts, filtering out empty strings
    return [degreeText, specText, uniText].filter(Boolean).join(' ');
  } else {
    return '';
  }
}

/**
 * Format student data for response
 * @param {Object} student - Student document from MongoDB
 * @param {Boolean} includeToken - Whether to include auth token
 * @returns {Object} Formatted student object
 */
const formatStudentResponse = (student, includeToken = false) => {
  const response = {
    _id: student._id,
    id: student._id,
    name: student.name,
    email: student.email,
    phone: student.phone || "",
    registrationNumber: student.registrationNumber,
    currentYear: student.currentYear,
    branch: student.branch,
    cgpa: student.cgpa || 0,
    skills: student.skills || [],
    interests: student.interests || [],
    bio: student.bio || "",
    linkedin: student.linkedin || "",
    github: student.github || "",
    location: student.location || "",
    college: student.college || "",
    university: student.university || "",
    graduationYear: student.graduationYear,
    profilePicture: student.profilePicture || { url: "", public_id: "" },
    previousEducation: student.previousEducation || [],
    mentorshipInterests: student.mentorshipInterests || [],
    assignedMentor: student.assignedMentor,
    internships: student.internships || [],
    projects: student.projects || [],
    careerGoals: student.careerGoals || "",
    isActive: student.isActive,
    isEmailVerified: student.isEmailVerified || false,
    status: student.status || "active",
    userType: "Student"
  };
  
  if (includeToken) {
    response.token = generateToken(student._id);
  }
  
  return response;
};

export { formatAlumniResponse, formatStudentResponse };