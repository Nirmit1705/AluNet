import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import studentRoutes from './Routes/studentRoutes.js';
import alumniRoutes from './Routes/alumniRoutes.js';
import adminRoutes from './Routes/adminRoutes.js';
import mentorshipRoutes from './Routes/mentorshipRoutes.js';
import uploadRoutes from './Routes/uploadRoutes.js';
import messageRoutes from './Routes/messageRoutes.js';
import notificationRoutes from './Routes/notificationRoutes.js';

const app = express();

// Middleware
app.use(express.json());

// CORS setup
app.use(cors());

// Ensure uploads directory is accessible as static content
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Register routes
app.use('/api/students', studentRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

export default app;