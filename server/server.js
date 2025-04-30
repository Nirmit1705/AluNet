import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { connectDB } from './config/db.js';
import { requestLogger } from './middleware/loggingMiddleware.js';
import fs from 'fs';
import { initWebSocketServer } from './webSocketServer.js';

// Import routes - Fix capitalization to match actual file paths
import userRoutes from './routes/userRoutes.js';
import alumniRoutes from './routes/alumniRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import jobRoutes from './routes/jobPostingRoutes.js'; // Fixed to actual filename
import adminRoutes from './routes/adminRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import mentorshipRoutes from './Routes/mentorshipRoutes.js';
import connectionRoutes from './Routes/connectionRoutes.js'; // Changed from './Routes/connectionRoutes.js' to './routes/connectionRoutes.js'
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import authRoutes from './Routes/authRoutes.js';

// Setup for ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Created uploads directory at ${uploadsDir}`);
}

// Connect to database
connectDB();

const app = express();

// Configure CORS with more options
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// IMPORTANT: Serve static files from the uploads directory
// This must come before route definitions
app.use('/uploads', express.static(uploadsDir));
console.log(`Static files being served from: ${uploadsDir}`);

// Check if the directory is accessible and log content
try {
  const files = fs.readdirSync(uploadsDir);
  console.log(`Files in uploads directory: ${files.length ? files.join(', ') : 'none'}`);
} catch (error) {
  console.error(`Error reading uploads directory: ${error.message}`);
}

// Parse JSON request bodies
app.use(express.json());
app.use(cors());
app.use(requestLogger); // Add request logging middleware

// API routes
app.use('/api/users', userRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/connections', connectionRoutes); 
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes); // THIS LINE IS CRITICAL - it was missing from your server.js

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

// Create HTTP server with WebSocket support
const server = initWebSocketServer(app);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`WebSocket server is active on ws://localhost:${PORT}/ws`);
});

export default app;