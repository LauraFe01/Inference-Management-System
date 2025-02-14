import { Request, Response, NextFunction } from 'express';
import { getDecodedToken } from '../Utils/token_utils';
import Dataset, { DatasetCreationAttributes } from '../Model/dataset';
import DatasetDAOApplication from '../DAO/datasetDao';
import UserDAOApplication from '../DAO/userDao';
import SpectrogramDAOApplication from '../DAO/spectrogramDao';
import { updateToken } from '../Utils/utils';
import { User } from '../init_database';
import { inferenceQueue } from '../Config/inferenceQueue_config';
import '../Worker/inferenceWorker'; // Assuming this imports a worker for inference processing
import ErrorFactory, { ErrorType } from '../Errors/errorFactory';
import db from '../Config/db_config';

const datasetApp = new DatasetDAOApplication();
const userApp = new UserDAOApplication();
const spectrogramDao = new SpectrogramDAOApplication();

export const datasetController = {
  createEmptyDataset: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description, tags } = req.body;
      if (!name || !description) {
        throw ErrorFactory.createError(ErrorType.MissingParameterError, 'Missing required fields in body (name, description)');
      } else if (name.length === 0) {
        throw ErrorFactory.createError(ErrorType.ValidationError, 'Not valid name!');
      }

      if (tags && (!Array.isArray(tags) )) {
        throw ErrorFactory.createError(ErrorType.ValidationError, 'Tags must be an array of strings');
      }

      const userData = getDecodedToken(req);
      if (!userData) {
        throw ErrorFactory.createError(ErrorType.NotFoundError, 'User not found');
      } else {
        if (typeof userData !== 'string') {
          const userId = userData.id;
          const newDataset: DatasetCreationAttributes = {
            name,
            description,
            userId,
            tags: tags || [],
          };
          await datasetApp.addDataset(newDataset);
          res.status(201).send({status: 'Empty Dataset added', statusCode: 201, newDataset}); // Send success response with created dataset
        }
      }
    } catch (error) {
      next(error);
    }
  },

  cancelDataset: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const datasetName = req.params.name;
      const userData = getDecodedToken(req);

      if (!datasetName) {
        throw ErrorFactory.createError(ErrorType.MissingParameterError, 'Missing required fields in body (datasetName)');
      }

      if (userData && typeof userData !== 'string') {
        const userId = userData.id;
        const dataset = await datasetApp.getByName(datasetName, userId);
        if (!dataset) {
          throw ErrorFactory.createError(ErrorType.NotFoundError, 'Dataset not found');
        }
        await datasetApp.deleteDataset(dataset);
        res.status(200).json({ message: 'Dataset cancelled successfully', statusCode: 200});
      }
    } catch (error) {
      next(error);
    }
  },

  // Endpoint to update a dataset by name
  updateDataset: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const datasetName = req.params.name;
      const updateFields = req.body;

      if (!updateFields) {
        throw ErrorFactory.createError(ErrorType.MissingParameterError, 'Missing fields to be updated');
      } else if (!datasetName) {
        throw ErrorFactory.createError(ErrorType.MissingParameterError, 'Missing required field in body (datasetName)');
      }

      const userData = getDecodedToken(req);
      if (!userData) {
        throw ErrorFactory.createError(ErrorType.NotFoundError, 'User not found');
      } else {
        if (typeof userData !== 'string') {
          const id = userData.id;
          const dataset = await datasetApp.getByName(datasetName, id);
          console.log(datasetName, id)
          if (!dataset) {
            throw ErrorFactory.createError(ErrorType.NotFoundError, 'Dataset not found');
          }
          await datasetApp.updateDataset(dataset, updateFields);
          res.status(200).json({status: 'Dataset successfully updated!', statusCode: 200, dataset});
        }
      }
    } catch (error) {
      next(error);
    }
  },

  startInference: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { modelId } = req.body;
      const allowedValues = ["10_patients_model", "20_patients_model"];

      if (!modelId) {
        throw ErrorFactory.createError(ErrorType.MissingParameterError, 'The modelId is missing! [10_patients_model, 20_patients_model]');
      } else if (!allowedValues.includes(modelId)) {
        throw ErrorFactory.createError(ErrorType.ValidationError, 'ModelId value entered not allowed [10_patients_model, 20_patients_model]');
      }

      const datasetName = req.params.datasetName;
      const userData = getDecodedToken(req);
      await db.transaction(async (transaction) => {

      if (!userData) {
        throw ErrorFactory.createError(ErrorType.NotFoundError, 'User not found');
      }

      if (typeof userData !== 'string') {
        const userId = userData.id;
        const userObj = await userApp.getUser(userId);
        const jobIdsArray = userObj?.jobIds
        const dataset = await datasetApp.getByName(datasetName, userId);

        if (!dataset) {
          throw ErrorFactory.createError(ErrorType.NotFoundError, 'Dataset not found');
        }

        const spectrograms = await spectrogramDao.getAllSpectrogramsByDataset(dataset.id);
        const numSpectrograms = spectrograms.length;
        const tokenRemaining = updateToken("inference", userObj!, numSpectrograms);

        if (tokenRemaining >= 0 && userObj) {

          try {
            // Add inference job to queue
            const job = await inferenceQueue.add('Perform Inference', { modelId, spectrograms });
            const jobId = job.id;
            const idArray = [...(jobIdsArray || []), jobId];
            const jobArray: string[] = idArray as string[];
            const updateValues: Partial<User> = { numToken: tokenRemaining, jobIds: jobArray };
            await userApp.updateUser(userObj, updateValues, transaction); 
            res.status(202).json({ message: 'Inference added to the queue with id:', jobId });
          } catch (error) {
            throw ErrorFactory.createError(ErrorType.InternalServerError, 'Error during the request to Flask');
          }

           // Update user tokens
        } else {
          const job = await inferenceQueue.add('Aborted', { reason: 'Insufficient tokens' });
          res.status(401).json({ status: 'Aborted', error: 'Insufficient tokens. Aborted.', jobId: job.id });
        }
      }
    });
    } catch (error) {
      next(error);
    }
  },

  // Endpoint to get status of an inference job by jobId
  getInferenceStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobId = req.params.jobId;
      const userData = getDecodedToken(req);
  
      if (!userData) {
        throw ErrorFactory.createError(ErrorType.NotFoundError, 'User not found');
      }
  
      if (typeof userData !== 'string') {
        const userId = userData.id;
        const userObj = await userApp.getUser(userId);
  
        if (!userObj) {
          throw ErrorFactory.createError(ErrorType.NotFoundError, 'User data not found');
        }
  
        const jobs = userObj?.jobIds || [];
  
        if (!jobId) {
          throw ErrorFactory.createError(ErrorType.MissingParameterError, 'Missing required fields in body (jobId)');
        } else if (jobId.length === 0) {
          throw ErrorFactory.createError(ErrorType.ValidationError, 'No Job found with that id!');
        } else if (!jobs.includes(jobId)) {
          throw ErrorFactory.createError(ErrorType.NotFoundError, 'JobId does not belong to the user');
        }
  
        const job = await inferenceQueue.getJob(jobId);
  
        if (!job) {
          throw ErrorFactory.createError(ErrorType.NotFoundError, 'Job not found');
        }
  
        if (job.name === 'Aborted') {
          res.json({ status: 'Aborted', reason: job.data.reason });
        } else if (await job.isCompleted()) {
          res.json({ status: 'Completed', result: job.returnvalue });
        } else if (await job.isFailed()) {
          if (job.failedReason === 'Job aborted') {
            res.json({ status: 'Aborted' });
          } else {
            res.status(500).json({ status: 'Failed', failedReason: job.failedReason });
          }
        } else if (await job.isActive()) {
          res.json({ status: 'Running' });
        } else if (await job.isWaiting()) {
          res.json({ status: 'Pending' });
        } else if (await job.isDelayed()) {
          res.json({ status: 'Delayed' });
        } else {
          res.json({ status: 'Unknown' });
        }
      } else {
        throw ErrorFactory.createError(ErrorType.NotFoundError, 'Invalid user data');
      }
    } catch (error) {
      next(error);
    }
  },
  
 
  getAllDatasets: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = getDecodedToken(req);
      if (userData && typeof userData !== 'string') {
        const userId = userData.id;
        const datasets = await datasetApp.getAllDatasetsByUser(userId);
        if (!datasets || datasets.length === 0) {
          throw ErrorFactory.createError(ErrorType.NotFoundError, 'User does not have any datasets yet');
        }
        const combinedJson: { dataset: Dataset; spectrograms: string[] }[] = [];
        for (const dataset of datasets) {
          const spectrograms = await spectrogramDao.getAllSpectrogramsByDataset(dataset.id)
          const spectrogramNames: string[] = spectrograms.map(s => s.name);
          const datasetObject = {
            dataset: dataset,
            spectrograms: spectrogramNames
          };

          combinedJson.push(datasetObject);
        }
        
        res.json(combinedJson);
      }
    } catch (error) {
      next(error);
    }
  },
};
