import express from "express";
import {
  registerAlumni,
  authAlumni,
  getAlumniProfile,
  updateAlumniProfile,
  getAllAlumni,
  deleteAlumni,
  searchAlumni,
  getAlumniByBatch,
  getAlumniByCompany,
} from "../Controllers/alumniController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerAlumni);
router.post("/login", authAlumni);

// Protected routes
router.get("/profile", protect, getAlumniProfile);
router.put("/profile", protect, updateAlumniProfile);

// Admin routes
router.get("/", protect, admin, getAllAlumni);
router.delete("/:id", protect, admin, deleteAlumni);

// Additional useful routes
router.get("/search", protect, admin, searchAlumni);
router.get("/batch/:year", protect, admin, getAlumniByBatch);
router.get("/company/:company", protect, admin, getAlumniByCompany);

export default router;
