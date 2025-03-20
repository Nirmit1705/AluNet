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
  uploadAlumniProfilePicture
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

// Protected routes
router.route("/profile")
  .get(protect, getAlumniProfile)
  .put(protect, updateAlumniProfile);

// Profile picture upload route
router.post("/profile/upload-picture", protect, uploadAlumniProfilePicture);

export default router;
