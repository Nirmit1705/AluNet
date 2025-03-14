require('dotenv').config({ path: __dirname + '/Config/.env' });
const mongoose = require('mongoose');
const Student = require('./Models/Student');

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error("❌ MongoDB URI is undefined! Check your .env file.");
    process.exit(1);
}

mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log("✅ Successfully connected to MongoDB!"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

async function testDB() {
    try {
        const students = await Student.find();
        console.log("✅ Successfully fetched students:", students);
    } catch (error) {
        console.error("❌ Error fetching students:", error);
    } finally {
        mongoose.connection.close();
    }
}

testDB();
