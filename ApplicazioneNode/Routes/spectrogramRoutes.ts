import express from 'express';
import { authMiddleware} from '../Token/middleware';
import { spectrogramController } from '../Controller/spectrogramController';
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/newspectrogram',authMiddleware, upload.single('file'), spectrogramController.addSpectrogram);
router.post('/uploadfilesfromzip', authMiddleware, upload.single('file'), spectrogramController.uploadFile);

export default router;
