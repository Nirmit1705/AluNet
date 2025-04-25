import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Import routes
import studentRoutes from "./Routes/studentRoutes.js";
import alumniRoutes from "./Routes/alumniRoutes.js";
import authRoutes from "./Routes/authRoutes.js";
import adminRoutes from './Routes/adminRoutes.js';
import mentorshipRoutes from "./Routes/mentorshipRoutes.js";
import jobPostingRoutes from "./Routes/jobPostingRoutes.js";
import messageRoutes from "./Routes/messageRoutes.js";
import notificationRoutes from "./Routes/notificationRoutes.js";
import uploadRoutes from './Routes/uploadRoutes.js';

// Setup for ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies

// Configure CORS with more options
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register routes
app.use('/api/students', studentRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/jobs', jobPostingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// API Routes
app.use('/api/upload', uploadRoutes);

// Test routes
app.get("/", (req, res) => {
    res.send("Alumni-Student Interaction Platform API is running...");
});

app.get("/api/test", (req, res) => {
    res.json({
        status: "success",
        message: "Server is running correctly",
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development',
        apiVersion: "1.0.0"
    });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

export default app;