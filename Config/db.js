require("dotenv").config();

const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGO_URI; 

if (!uri) {
    console.error("MONGO_URI is undefined! Check your .env file.");
    process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectDB() {
  try {
    console.log("Connecting to MongoDB...");
    await client.connect();
    await client.db().command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
}

module.exports = { client, connectDB };
