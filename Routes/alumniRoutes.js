const express = require("express");
const {
  registerAlumni,
  authAlumni,
  getAlumniProfile,
  updateAlumniProfile,
  getAllAlumni,
  deleteAlumni,
} = require("../Controllers/alumniController.js");
// const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerAlumni);
router.post("/login", authAlumni);
router.get("/profile", protect, getAlumniProfile);
router.put("/profile", protect, updateAlumniProfile);
router.get("/", getAllAlumni);
router.delete("/:id", protect, admin, deleteAlumni);

module.exports = router;
