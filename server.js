import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./Config/db.js";

dotenv.config();

connectDB();

const app = express();
app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable Cross-Origin Resource Sharing

app.get("/", (req, res) => {
    res.send("Alumni-Student Interaction Platform API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});