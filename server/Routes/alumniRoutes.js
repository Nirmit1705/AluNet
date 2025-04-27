import express from "express";
import {
  registerAlumni,
  authAlumni,
  getAlumniProfile,
  updateAlumniProfile,
  getAllAlumni,
  searchAlumni,
  getAlumniByBatch,
  getAlumniByCompany,
  uploadAlumniProfilePicture,
  getAlumniById,
  checkVerificationStatus,
  resendVerification,
  submitVerificationDocument,
  registerAlumniWithGoogle // Add this import
} from "../Controllers/alumniController.js";
import { protect } from "../middleware/authMiddleware.js";

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

// Profile picture upload route
router.post("/profile/upload-picture", protect, uploadAlumniProfilePicture);

// Google Authentication routes
router.post('/register-google', registerAlumniWithGoogle);

export default router;
