import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    // Check if MONGO_URI is defined
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is not defined in environment variables');
      console.error('Please create a .env file with MONGO_URI defined');
      process.exit(1);
    }

    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGO_URI ? 'URI is defined' : 'URI is undefined');

    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log('Connection state:', mongoose.connection.readyState);
  } catch (error) {
    console.error('MongoDB connection error details:');
    console.error(`Error name: ${error.name}`);
    console.error(`Error message: ${error.message}`);
    console.error(`Error code: ${error.code}`);
    console.error(`Error codeName: ${error.codeName}`);
    console.error(`Full error:`, error);
    console.error(`Stack trace:`, error.stack);
    
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
