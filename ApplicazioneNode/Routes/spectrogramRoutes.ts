import express from 'express';
import { authMiddleware} from '../Token/middleware';
import { spectrogramController } from '../Controller/spectrogramController';

const router = express.Router();

router.post('/newspectrogram', spectrogramController.addSpectrogram);
router.post('/uploadfilesfromzip', authMiddleware, spectrogramController.uploadFile);

export default router;
