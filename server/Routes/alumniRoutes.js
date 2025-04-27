import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import { 
  registerAlumni,
  authAlumni,
  getAlumniProfile,
  updateAlumniProfile,
  getAllAlumni,
  searchAlumni,
  getAlumniByBatch,
  getAlumniByCompany,
  getAlumniById,
  checkVerificationStatus,
  resendVerification,
  submitVerificationDocument,
  registerAlumniWithGoogle,
  updateAlumniProfilePicture 
} from '../Controllers/alumniController.js';

const router = express.Router();

// Public routes
router.post("/register", registerAlumni);
router.post("/login", authAlumni);
router.get("/", getAllAlumni);
router.get("/search", searchAlumni);
router.get("/batch/:year", getAlumniByBatch);
router.get("/company/:company", getAlumniByCompany);
router.get("/:id", getAlumniById);

// Protected routes
router.route("/profile")
  .get(protect, getAlumniProfile)
  .put(protect, updateAlumniProfile);

// Verification routes
router.get("/verification-status", protect, checkVerificationStatus);
router.post("/resend-verification", protect, resendVerification);
router.post("/submit-verification", protect, submitVerificationDocument);

// Profile picture update route
router.put('/profile/profile-picture', protect, updateAlumniProfilePicture);

// Google Authentication routes
router.post('/register-google', registerAlumniWithGoogle);

// Add this route to update education information
router.put('/update-education', protect, asyncHandler(async (req, res) => {
  const { graduationYear, previousEducation } = req.body;
  
  // Get the alumni ID from the authenticated user
  const alumniId = req.user._id;
  
  const alumni = await Alumni.findById(alumniId);
  
  if (!alumni) {
    res.status(404);
    throw new Error('Alumni not found');
  }
  
  // Update the education fields
  alumni.graduationYear = graduationYear;
  alumni.previousEducation = previousEducation;
  
  // Save the updated alumni
  await alumni.save();
  
  // Return the updated alumni data
  res.json(formatAlumniResponse(alumni));
}));
export default router;
