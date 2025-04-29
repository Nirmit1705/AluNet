import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    const db = mongoose.connection;
    
    try {
      console.log('Starting connection schema fix');
      
      // Step 1: Check and drop the problematic index
      const connectionCollection = db.collection('connections');
      const indexes = await connectionCollection.indexes();
      const senderRecipientIndex = indexes.find(
        index => index.name === 'sender_1_recipient_1' || 
                index.key && index.key.sender === 1 && index.key.recipient === 1
      );
      
      if (senderRecipientIndex) {
        console.log('Found problematic sender_recipient index, dropping it...');
        await connectionCollection.dropIndex(senderRecipientIndex.name);
        console.log('Index dropped successfully');
      } else {
        console.log('No problematic sender_recipient index found');
      }
      
      // Step 2: Find connections with missing student or alumni fields
      const problematicConnections = await connectionCollection.find({
        $or: [
          { student: null },
          { alumni: null },
          { student: { $exists: false } },
          { alumni: { $exists: false } }
        ]
      }).toArray();
      
      console.log(`Found ${problematicConnections.length} connections with missing student/alumni fields`);
      
      // Step 3: Fix connections from old schema (sender/recipient) to new schema (student/alumni)
      const oldSchemaConnections = await connectionCollection.find({
        $and: [
          { sender: { $exists: true } },
          { recipient: { $exists: true } },
          { $or: [
              { student: null },
              { alumni: null },
              { student: { $exists: false } },
              { alumni: { $exists: false } }
            ]
          }
        ]
      }).toArray();
      
      console.log(`Found ${oldSchemaConnections.length} connections with old schema format`);
      
      let migratedCount = 0;
      let deletedCount = 0;
      
      // Process and fix each connection
      for (const conn of oldSchemaConnections) {
        // Try to fix based on senderModel and recipientModel if available
        if (conn.senderModel === 'Student' && conn.recipientModel === 'Alumni' && conn.sender && conn.recipient) {
          await connectionCollection.updateOne(
            { _id: conn._id },
            { 
              $set: { 
                student: conn.sender,
                alumni: conn.recipient
              }
            }
          );
          migratedCount++;
        }
        // If we can't migrate it properly, we'll mark it for deletion
        else {
          await connectionCollection.deleteOne({ _id: conn._id });
          deletedCount++;
        }
      }
      
      console.log(`Fixed ${migratedCount} connections and deleted ${deletedCount} unmigrateable connections`);
      
      // Step 4: Delete connections with null values that can't be fixed
      const remainingProblematic = await connectionCollection.deleteMany({
        $or: [
          { student: null },
          { alumni: null },
          { student: { $exists: false } },
          { alumni: { $exists: false } }
        ]
      });
      
      console.log(`Deleted ${remainingProblematic.deletedCount} remaining problematic connections`);
      
      // Step 5: Create the correct index if it doesn't exist
      const studentAlumniIndex = indexes.find(
        index => index.name === 'student_1_alumni_1' || 
                (index.key && index.key.student === 1 && index.key.alumni === 1)
      );
      
      if (!studentAlumniIndex) {
        console.log('Creating student_alumni compound index...');
        await connectionCollection.createIndex(
          { student: 1, alumni: 1 },
          { unique: true }
        );
        console.log('Index created successfully');
      } else {
        console.log('student_alumni index already exists');
      }
      
      console.log('Connection schema fix completed successfully!');
      
    } catch (error) {
      console.error('Error fixing connection schema:', error);
    } finally {
      await mongoose.disconnect();
      console.log('MongoDB Disconnected');
    }
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });
