const mongoose = require('mongoose');
require('dotenv').config(); // Load .env variables

const mongoURI = process.env.MONGO_URI; // Get MongoDB URI from .env

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ MongoDB connected successfully!");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
