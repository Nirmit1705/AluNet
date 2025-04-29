/**
 * Script to fix connection records and ensure they follow the student->alumni pattern
 * Run with: node scripts/fixConnectionDuplicates.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Connection from '../Models/Connection.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    
    try {
      // Get all connections with issues
      const problematicConnections = await Connection.find({
        $or: [
          { student: null },
          { alumni: null }
        ]
      });
      
      console.log(`Found ${problematicConnections.length} problematic connections`);
      
      // Process connections with the old sender/recipient pattern
      const oldFormatConnections = await Connection.find({
        sender: { $exists: true },
        recipient: { $exists: true }
      });
      
      console.log(`Found ${oldFormatConnections.length} connections with old format`);
      
      let migratedCount = 0;
      for (const conn of oldFormatConnections) {
        // Only process if they have the model fields and proper references
        if (conn.senderModel && conn.recipientModel && conn.sender && conn.recipient) {
          if (conn.senderModel === 'Student' && conn.recipientModel === 'Alumni') {
            // This is the correct pattern, just make sure student/alumni fields are set
            conn.student = conn.sender;
            conn.alumni = conn.recipient;
            await conn.save();
            migratedCount++;
          } else if (conn.senderModel === 'Alumni' && conn.recipientModel === 'Student') {
            // Swap the fields to match the student->alumni pattern
            conn.student = conn.recipient;
            conn.alumni = conn.sender;
            await conn.save();
            migratedCount++;
          }
        }
      }
      
      console.log(`Migrated ${migratedCount} connections to the new format`);
      
      // Remove invalid connections that can't be fixed
      const removedCount = await Connection.deleteMany({
        $or: [
          { student: null },
          { alumni: null }
        ]
      });
      
      console.log(`Removed ${removedCount.deletedCount} invalid connections`);
      
      // Check for remaining duplicates
      const allConnections = await Connection.find({
        student: { $ne: null },
        alumni: { $ne: null }
      });
      
      // Use a map to find duplicate student-alumni pairs
      const pairMap = new Map();
      const duplicates = [];
      
      for (const conn of allConnections) {
        const key = `${conn.student.toString()}-${conn.alumni.toString()}`;
        
        if (pairMap.has(key)) {
          duplicates.push({
            key,
            connections: [pairMap.get(key), conn._id]
          });
        } else {
          pairMap.set(key, conn._id);
        }
      }
      
      console.log(`Found ${duplicates.length} duplicate student-alumni pairs`);
      
      // For each duplicate pair, keep the newest one
      for (const dup of duplicates) {
        const connections = await Connection.find({
          _id: { $in: dup.connections }
        }).sort({ updatedAt: -1 });
        
        // Keep the first one (newest) and delete the rest
        for (let i = 1; i < connections.length; i++) {
          await Connection.deleteOne({ _id: connections[i]._id });
        }
      }
      
      console.log(`Fixed ${duplicates.length} duplicate pairs`);
      console.log('Connection migration completed successfully');
    } catch (error) {
      console.error('Error migrating connections:', error);
    } finally {
      mongoose.disconnect();
      console.log('MongoDB Disconnected');
    }
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });
