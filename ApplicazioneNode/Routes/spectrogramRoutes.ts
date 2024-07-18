import express from 'express';
import { authMiddleware, singleFileCheck } from '../middleware';
import { spectrogramController } from '../Controller/spectrogramController';
import multer from 'multer';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * POST /api/spectrogram
 * Route handler for adding a spectrogram.
 * Requires authentication middleware and checks for a single file upload.
 * Uses multer to handle file upload with field name 'file'.
 */
router.post('/spectrogram', authMiddleware, singleFileCheck, upload.single('file'), spectrogramController.addSpectrogram);

/**
 * POST /api/uploadFilesFromZip
 * Route handler for uploading files from a zip archive.
 * Requires authentication middleware and checks for a single file upload.
 * Uses multer to handle file upload with field name 'file'.
 */
router.post('/uploadFilesFromZip', authMiddleware, singleFileCheck, upload.single('file'), spectrogramController.uploadFile);

export default router;
