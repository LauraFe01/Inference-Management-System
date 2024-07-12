import express from 'express';
import { authMiddleware} from '../Token/middleware';
import { datasetController } from '../Controller/datasetController';

const router = express.Router();

router.post('/emptydataset', authMiddleware, datasetController.createEmptyDataset);
router.put('/dataset/:name/cancel', authMiddleware, datasetController.cancelDataset);
router.patch('/dataset/:name/update', authMiddleware, datasetController.updateDataset);
router.post('/startInference/:datasetName', authMiddleware, datasetController.startInference);
router.get('/allDatasets', authMiddleware, datasetController.getAllDatasets);
router.get('/inferenceSTatus/:jobId', authMiddleware, datasetController.getInferenceStatus);

export default router;
