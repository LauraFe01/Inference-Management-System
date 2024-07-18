import express from 'express';
import { authMiddleware, singleFileCheck} from '../middleware';
import { spectrogramController } from '../Controller/spectrogramController';
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/spectrogram',authMiddleware, singleFileCheck, upload.single('file'), spectrogramController.addSpectrogram);
router.post('/uploadFilesFromZip', authMiddleware, singleFileCheck, upload.single('file'), spectrogramController.uploadFile);

export default router;
