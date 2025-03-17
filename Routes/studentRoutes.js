const express = require("express");
const {
  registerStudent,
  authStudent,
  getStudentProfile,
  updateStudentProfile,
  getAllStudents,
  deleteStudent,
} = require("../Controllers/studentController.js");

// const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerStudent);
router.post("/login", authStudent);
router.get("/profile", protect, getStudentProfile);
router.put("/profile", protect, updateStudentProfile);
router.get("/", getAllStudents);
router.delete("/:id", protect, admin, deleteStudent);

module.exports = router;
