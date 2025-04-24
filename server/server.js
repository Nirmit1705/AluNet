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
import messageRoutes from "./Routes/messageRoutes.js";
import notificationRoutes from "./Routes/notificationRoutes.js";
import authRoutes from './Routes/authRoutes.js'; // Ensure this is imported
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { protect } from "./middleware/authMiddleware.js";
import mongoose from "mongoose";

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
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use('/api/auth', authRoutes); // Ensure this is registered

app.get("/", (req, res) => {
    res.send("Alumni-Student Interaction Platform API is running...");
});

// Test route for health check
app.get("/api/test", (req, res) => {
    res.json({
        status: "success",
        message: "Server is running correctly",
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development',
        apiVersion: "1.0.0"
    });
});

// Protected test route that requires authentication
app.get("/api/test/auth", protect, (req, res) => {
    res.json({
        status: "success",
        message: "Authentication successful",
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            userType: req.user.model || req.user.constructor.modelName
        },
        timestamp: new Date().toISOString()
    });
});

// Database connection test route
app.get("/api/test/db", async (req, res) => {
    try {
        // Check database connection
        const dbState = mongoose.connection.readyState;
        const states = {
            0: "disconnected",
            1: "connected",
            2: "connecting",
            3: "disconnecting"
        };
        
        // Get list of collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        
        res.json({
            status: "success",
            database: {
                connection: states[dbState],
                name: mongoose.connection.name,
                host: mongoose.connection.host,
                collections: collectionNames
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Database connection error",
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Add this to your server.js file
app.get("/api/test/hello", (req, res) => {
    console.log("Hello route accessed");
    res.json({ message: "Hello World" });
  });

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});