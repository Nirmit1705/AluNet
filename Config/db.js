const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config(); // Load environment variables

const uri = process.env.MONGO_URI; // Get MongoDB URI from .env

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await client.connect(); // Connect to the server

    // Check the connection by sending a ping
    await client.db("Shreyansh_1812").command({ ping: 1 });
    console.log("✅ Pinged your deployment. Successfully connected to MongoDB!");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  } finally {
    // Close the connection after checking
    await client.close();
  }
}

run().catch(console.dir);
