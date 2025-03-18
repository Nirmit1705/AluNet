// Load environment variables first
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
const result = dotenv.config({ path: path.resolve(__dirname, '.env') });
if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('Environment variables loaded successfully');
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
}

// Then import other dependencies
import express from "express";
import cors from "cors";
import { connectDB } from "./Config/db.js";
import alumniRoutes from "./Routes/alumniRoutes.js";
import studentRoutes from "./Routes/studentRoutes.js";
import mentorshipRoutes from "./Routes/mentorshipRoutes.js";
import jobPostingRoutes from "./Routes/jobPostingRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Connect to database
connectDB();

const app = express();
app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable Cross-Origin Resource Sharing

// Routes
app.use("/api/alumni", alumniRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/mentorship", mentorshipRoutes);
app.use("/api/jobs", jobPostingRoutes);

app.get("/", (req, res) => {
    res.send("Alumni-Student Interaction Platform API is running...");
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});