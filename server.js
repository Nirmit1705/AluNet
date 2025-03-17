import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./Config/db.js";
import alumniRoutes from "./Routes/alumniRoutes.js";
import studentRoutes from "./Routes/studentRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

connectDB();

const app = express();
app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable Cross-Origin Resource Sharing

// Routes
app.use("/api/alumni", alumniRoutes);
app.use("/api/students", studentRoutes);

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