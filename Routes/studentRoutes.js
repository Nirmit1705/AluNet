import express from "express";
import {
  registerStudent,
  authStudent,
  getStudentProfile,
  updateStudentProfile,
  getAllStudents,
  deleteStudent,
  searchStudents,
  getStudentsByBranch,
  getStudentsByYear,
} from "../Controllers/studentController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerStudent);
router.post("/login", authStudent);

// Protected routes
router.get("/profile", protect, getStudentProfile);
router.put("/profile", protect, updateStudentProfile);

// Admin routes
router.get("/", protect, admin, getAllStudents);
router.delete("/:id", protect, admin, deleteStudent);

// Additional useful routes
router.get("/search", protect, admin, searchStudents);
router.get("/branch/:branch", protect, admin, getStudentsByBranch);
router.get("/year/:year", protect, admin, getStudentsByYear);

export default router;
