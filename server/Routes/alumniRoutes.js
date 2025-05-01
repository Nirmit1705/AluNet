import express from 'express';
import { 
  registerAlumni,
  authAlumni,
  getAlumniProfile,
  updateAlumniProfile,
  getAlumni, // Changed from getAllAlumni to getAlumni to match the export name
  searchAlumni,
  getAlumniByBatch,
  getAlumniByCompany,
  getAlumniById,
  checkVerificationStatus,
  resendVerification,
  submitVerificationDocument,
  registerAlumniWithGoogle,
  updateAlumniProfilePicture,
  getDashboardStats 
} from '../Controllers/alumniController.js';
import { protect, alumniOnly } from '../middleware/authMiddleware.js';
import asyncHandler from '../Utils/asyncHandler.js'; // Add this import for asyncHandler
import Alumni from '../Models/Alumni.js'; // Add this import for the debug route

const router = express.Router();

// Public routes
router.post('/register', registerAlumni);

router.post("/login", authAlumni);
router.get("/", getAlumni); // Changed from getAllAlumni to getAlumni
router.get("/search", searchAlumni);
router.get("/batch/:year", getAlumniByBatch);
router.get("/company/:company", getAlumniByCompany);

// Protected routes
router.route("/profile")
  .get(protect, getAlumniProfile)
  .put(protect, updateAlumniProfile);

// IMPORTANT: Move this specific route BEFORE the /:id route
// to prevent "profile" from being treated as an ID parameter
router.get("/verification-status", protect, checkVerificationStatus);
router.post("/resend-verification", protect, resendVerification);
router.post("/submit-verification", protect, submitVerificationDocument);

// Profile picture update route
router.put('/profile/profile-picture', protect, updateAlumniProfilePicture);

// Update profile route - make sure this comes before the /:id route
router.put('/profile', protect, updateAlumniProfile);

// Add a special debug route to check what's happening with education data
router.get('/profile/debug', protect, asyncHandler(async (req, res) => {
  const alumniId = req.user._id;
  
  try {
    const alumni = await Alumni.findById(alumniId);
    
    if (!alumni) {
      res.status(404);
      throw new Error('Alumni not found');
    }
    
    // Return detailed information about the alumni schema
    res.json({
      _id: alumni._id,
      name: alumni.name,
      education: alumni.education,
      previousEducation: alumni.previousEducation,
      educationFields: {
        hasEducation: !!alumni.education,
        educationType: alumni.education ? typeof alumni.education : 'undefined',
        isArray: Array.isArray(alumni.education),
        length: Array.isArray(alumni.education) ? alumni.education.length : 'n/a'
      },
      skills: alumni.skills,
      skillsFields: {
        hasSkills: !!alumni.skills,
        skillsType: alumni.skills ? typeof alumni.skills : 'undefined',
        isArray: Array.isArray(alumni.skills),
        length: Array.isArray(alumni.skills) ? alumni.skills.length : 'n/a'
      },
      interests: alumni.interests,
      interestsFields: {
        hasInterests: !!alumni.interests,
        interestsType: alumni.interests ? typeof alumni.interests : 'undefined',
        isArray: Array.isArray(alumni.interests),
        length: Array.isArray(alumni.interests) ? alumni.interests.length : 'n/a'
      }
    });
  } catch (error) {
    console.error("Error in debug route:", error);
    res.status(500);
    throw new Error('Server error in debug route: ' + error.message);
  }
}));

// Google Authentication routes
router.post('/register-google', registerAlumniWithGoogle);

// Update the route to update education information
router.put('/update-education', protect, asyncHandler(async (req, res) => {
  const { graduationYear, education } = req.body;
  
  // Get the alumni ID from the authenticated user
  const alumniId = req.user._id;
  
  const alumni = await Alumni.findById(alumniId);
  
  if (!alumni) {
    res.status(404);
    throw new Error('Alumni not found');
  }
  
  console.log("Received education data:", JSON.stringify(education));
  
  // Update the education fields
  if (graduationYear && !isNaN(graduationYear)) {
    alumni.graduationYear = Number(graduationYear);
  }
  
  if (education) {
    // Ensure education is an array
    if (Array.isArray(education)) {
      // Process each education entry to ensure it has both institution and university
      const processedEducation = education.map(edu => {
        const entry = { ...edu };
        
        // Make sure both fields exist, but keep them distinct
        // Only copy from one to the other if one is missing completely
        if (!entry.institution && entry.university) {
          entry.institution = entry.university;
        } else if (!entry.university && entry.institution) {
          entry.university = entry.institution;
        }
        
        // Ensure neither field is null/undefined
        entry.institution = entry.institution || '';
        entry.university = entry.university || '';
        
        return entry;
      });
      
      alumni.education = processedEducation;
      
      // Also update the root level university field with the university from the first education entry
      if (processedEducation.length > 0 && processedEducation[0].university) {
        alumni.university = processedEducation[0].university;
      }
    } else if (typeof education === 'object') {
      // If it's a single object, wrap it in an array
      const entry = { ...education };
      
      // Make sure both fields exist, but keep them distinct
      if (!entry.institution && entry.university) {
        entry.institution = entry.university;
      } else if (!entry.university && entry.institution) {
        entry.university = entry.institution;
      }
      
      // Ensure neither field is null/undefined
      entry.institution = entry.institution || '';
      entry.university = entry.university || '';
      
      alumni.education = [entry];
      
      // Update root university field
      if (entry.university) {
        alumni.university = entry.university;
      }
    }
  }
  
  // Save the updated alumni
  await alumni.save();
  
  // Return the updated alumni data
  res.status(200).json({
    success: true,
    data: {
      graduationYear: alumni.graduationYear,
      education: alumni.education
    }
  });
}));

// Dashboard stats route
router.get('/dashboard-stats', protect, alumniOnly, getDashboardStats);

// IMPORTANT: This must come AFTER all specific routes that might match patterns like /profile
router.get("/:id", getAlumniById);

export default router;
