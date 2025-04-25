import express from 'express';
import { uploadVerificationDocument } from '../Controllers/uploadController.js';

const router = express.Router();

// Route for uploading verification documents
router.post('/verification', uploadVerificationDocument);

export default router;
