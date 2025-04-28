import express from "express";
import {
  registerStudent,
  registerStudentWithGoogle,
  authStudent,
  getStudentProfile,
  updateStudentProfile,
  getAllStudents,
  deleteStudent,
  searchStudents,
  getStudentsByBranch,
  getStudentsByYear,
  updateStudentProfilePicture, // Ensure this line matches the export name
} from '../Controllers/studentController.js';
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerStudent);
router.post("/login", authStudent);
router.get("/", getAllStudents);
router.get("/search", searchStudents);
router.get("/branch/:branch", getStudentsByBranch);
router.get("/year/:year", getStudentsByYear);

// Protected routes
router.route("/profile")
  .get(protect, getStudentProfile)
  .put(protect, updateStudentProfile);

// File upload routes
router.put('/profile/profile-picture', protect, updateStudentProfilePicture);

// Google Authentication routes
router.post('/register-google', registerStudentWithGoogle);

export default router;
