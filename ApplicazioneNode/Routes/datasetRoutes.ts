import express from 'express';
import { authMiddleware } from '../middleware';
import { datasetController } from '../Controller/datasetController';

const router = express.Router();

/**
 * POST /api/emptydataset
 * Route handler for creating an empty dataset.
 * Requires authentication middleware.
 */
router.post('/emptydataset', authMiddleware, datasetController.createEmptyDataset);

/**
 * PUT /api/dataset/:name/cancel
 * Route handler for canceling a dataset by name.
 * Requires authentication middleware.
 */
router.put('/dataset/:name/cancel', authMiddleware, datasetController.cancelDataset);

/**
 * PATCH /api/dataset/:name/update
 * Route handler for updating a dataset by name.
 * Requires authentication middleware.
 */
router.patch('/dataset/:name/update', authMiddleware, datasetController.updateDataset);

/**
 * POST /api/startInference/:datasetName
 * Route handler for starting inference on a dataset by name.
 * Requires authentication middleware.
 */
router.post('/startInference/:datasetName', authMiddleware, datasetController.startInference);

/**
 * GET /api/datasets
 * Route handler for retrieving all datasets.
 * Requires authentication middleware.
 */
router.get('/datasets', authMiddleware, datasetController.getAllDatasets);

/**
 * GET /api/inferenceStatus/:jobId
 * Route handler for retrieving inference status by job ID.
 * Requires authentication middleware.
 */
router.get('/inferenceStatus/:jobId', authMiddleware, datasetController.getInferenceStatus);

export default router;
