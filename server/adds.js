// Load environment variables
require('dotenv').config({ path: __dirname + './.env' }); 
const mongoose = require('mongoose');
const Student = require('./Models/Student'); // Import Student model

const mongoURI = process.env.MONGO_URI;

// Check if MONGO_URI is loaded properly
if (!mongoURI) {
    console.error("❌ MongoDB URI is undefined! Check your .env file path.");
    process.exit(1);
}

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("✅ Successfully connected to MongoDB!");
        addStudent(); // Call function to add a student
    })
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    });

// Function to add a student
async function addStudent() {
    try {
        const newStudent = new Student({
            name: "Shreyansh",
            email: "shreyansh1812@gmail.com",  // Replace with your actual email
            role: "student",
            graduationYear: 2026,
            specialization: "Computer Science & AI",
            skills: ["Full Stack Development", "MongoDB", "React", "Python", "AI & Machine Learning"], 
            internships: [
                { company: "Reliance Jio", duration: "1 Month", role: "Intern" }
            ],
            projects: [
                { name: "Alumni-Student Interaction Platform", description: "Developing the database using MongoDB Atlas." },
                { name: "Stock Market AI", description: "Researching AI applications for stock market analysis." }
            ],
            linkedin: "https://linkedin.com/in/shreyansh", 
            goal: "Master AI, get into Caltech, and become financially independent."
        });

        const savedStudent = await newStudent.save();
        console.log("✅ Student added successfully:", savedStudent);
    } catch (error) {
        console.error("❌ Error adding student:", error);
    } finally {
        mongoose.connection.close(); // Close connection after execution
    }
}
