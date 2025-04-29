import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    // Check if MONGO_URI is defined
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is not defined in environment variables');
      console.error('Using default local MongoDB connection');
      process.env.MONGO_URI = 'mongodb://localhost:27017/student-alumni-platform';
    }

    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGO_URI);

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
    
    // If it's a parse error, provide more helpful message
    if (error.name === 'MongoParseError') {
      console.error('Please check that your MONGO_URI starts with "mongodb://" or "mongodb+srv://"');
      console.error('Falling back to local MongoDB...');
      
      try {
        // Try to connect to local MongoDB as fallback
        const localConn = await mongoose.connect('mongodb://localhost:27017/student-alumni-platform');
        console.log(`Local MongoDB Connected: ${localConn.connection.host}`);
        return;
      } catch (localError) {
        console.error('Failed to connect to local MongoDB:', localError.message);
      }
    }
    
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
