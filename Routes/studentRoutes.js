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
router.get("/profile", protect, getStudentProfile);
router.put("/profile", protect, updateStudentProfile);
router.delete("/:id", protect, deleteStudent);

export default router;
