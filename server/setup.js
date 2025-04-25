import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Running setup script...');

// Ensure uploads directory exists in the parent directory of server
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`✅ Created uploads directory at ${uploadDir}`);
  } catch (error) {
    console.error(`❌ Failed to create uploads directory: ${error.message}`);
    console.error('Please create this directory manually and ensure Node.js has write permissions');
  }
} else {
  console.log(`✅ Uploads directory already exists at ${uploadDir}`);
}

// Test write permissions
try {
  const testFile = path.join(uploadDir, 'test-permissions.txt');
  fs.writeFileSync(testFile, 'Testing write permissions');
  fs.unlinkSync(testFile);
  console.log('✅ Write permissions confirmed for uploads directory');
} catch (error) {
  console.error(`❌ Write permission test failed: ${error.message}`);
  console.error('Please ensure the Node.js process has write permissions to the uploads directory');
}

console.log('Setup completed');
