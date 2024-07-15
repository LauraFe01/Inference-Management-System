import { Request, Response } from 'express';
import { getDecodedToken } from '../Utils/token_utils';
import { DatasetCreationAttributes } from '../Model/dataset';
import DatasetDAOApplication from '../DAO/datasetDao';
import UserDAOApplication from '../DAO/userDao';
import SpectrogramDAOApplication from '../DAO/spectrogramDao';
import { updateToken } from '../Utils/utils';
import { User } from '../Model/init_database';
import { inferenceQueue } from '../Config/inferenceQueue_config';
import '../Worker/inferenceWorker'; // Assuming this imports a worker for inference processing
import { QueueEvents } from 'bullmq';
import { redisOptions } from '../Config/redis_config';

const datasetApp = new DatasetDAOApplication();
const userApp = new UserDAOApplication();
const spectrogramDao = new SpectrogramDAOApplication();
const queueEvents = new QueueEvents('Inference', {
  connection: {
    host: redisOptions.host,
    port: redisOptions.port
  }});

export const datasetController = {
  // Endpoint to create an empty dataset
  createEmptyDataset: async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body;
      if (!name || !description) {
        return res.status(400).send({ error: 'Missing required fields in body (name, description)' });
      } else if (name.length === 0) {
        return res.status(401).send({ error: 'No Dataset with that name!' });
      }
      const userData = getDecodedToken(req);
      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      } else {
        if (typeof userData !== 'string') {
          const userId = userData.id;
          const newDataset: DatasetCreationAttributes = {
            name,
            description,
            userId,
          };
          await datasetApp.addDataset(newDataset);
          res.status(201).send(newDataset); // Send success response with created dataset
        }
      }
    } catch (error) {
      console.error('Error creating dataset:', error);
      res.status(500).send({ error: 'Internal Server Error during dataset creation' });
    }
  },

  // Endpoint to cancel a dataset by name
  cancelDataset: async (req: Request, res: Response) => {
    const datasetName = req.params.name;
    const userData = getDecodedToken(req);

    if (!datasetName) {
      return res.status(400).send({ error: 'Missing required fields in body (datasetName)' });
    } else if (datasetName.length === 0) {
      return res.status(401).send({ error: 'No Dataset with that name!' });
    }

    if (userData && typeof userData !== 'string') {
      const userId = userData.id;
      try {
        const dataset = await datasetApp.getByName(datasetName, userId);
        if (!dataset) {
          return res.status(404).json({ error: 'Dataset not found' });
        }
        await datasetApp.updateDataset(dataset, { isCancelled: true });
        res.status(200).json({ message: 'Dataset cancelled successfully' });
      } catch (error) {
        console.error('Error cancelling dataset:', error);
        res.status(500).json({ error: 'Internal Server Error during dataset cancellation' });
      }
    }
  },

  // Endpoint to update a dataset by name
  updateDataset: async (req: Request, res: Response) => {
    const datasetName = req.params.name;
    const updateFields = req.body;

    if (!updateFields) {
      return res.status(400).send({ error: 'Missing fields to be updated' });
    } else if (!datasetName) {
      return res.status(400).send({ error: 'Missing required fields in body (datasetName)' });
    } else if (datasetName.length === 0) {
      return res.status(401).send({ error: 'No Dataset with that name!' });
    }

    const userData = getDecodedToken(req);
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    } else {
      if (typeof userData !== 'string') {
        const id = userData.id;
        try {
          const dataset = await datasetApp.getByName(datasetName, id);
          if (!dataset) {
            return res.status(404).json({ error: 'Dataset not found' });
          }
          await datasetApp.updateDataset(dataset, updateFields);
          res.status(200).json(dataset);
        } catch (error) {
          console.error('Error updating dataset:', error);
          res.status(500).json({ error: 'Internal server error during dataset update' });
        }
      }
    }
  },

  // Endpoint to start an inference process
  startInference: async (req: Request, res: Response) => {
    const { modelId } = req.body;
    const allowedValues = ["10_patients_model", "20_patients_model"];

    if (!modelId) {
      return res.status(400).send({ error: 'The modelId is missing!' });
    } else if (!allowedValues.includes(modelId)) {
      return res.status(400).send({ error: 'ModelId value entered not allowed' });
    }

    const datasetName = req.params.datasetName;
    const userData = getDecodedToken(req);

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (typeof userData !== 'string') {
      const userId = userData.id;
      const userObj = await userApp.getUser(userId);
      const dataset = await datasetApp.getByName(datasetName, userId);

      if (!dataset) {
        return res.status(404).json({ error: 'Dataset not found' });
      }

      const spectrograms = await spectrogramDao.getAllSpectrogramsByDataset(dataset.id);
      const numSpectrograms = spectrograms.length;
      const tokenRemaining = updateToken("inference", userObj!, numSpectrograms);

      if (tokenRemaining >= 0 && userObj) {
        const updateValues: Partial<User> = { numToken: tokenRemaining };
        try {
          // Add inference job to queue
          const job = await inferenceQueue.add('Perform Inference', { modelId, spectrograms });
          const jobId = job.id;

          // Listen for completion and failure events from queue
          queueEvents.on('completed', ({ jobId: completedJobId }) => {
            if (completedJobId === jobId) {
              res.status(201).json({ message: 'The inference is completed!' });
            }
          });
          queueEvents.on('failed', ({ jobId: failedJobId, failedReason }) => {
            if (failedJobId === jobId) {
              res.status(500).json({ error: 'Failed inference', reason: failedReason });
            }
          });

          res.json({ message: 'Inference added to the queue with id:', jobId });
        } catch (error) {
          console.error('Error during the request to Flask:', error);
          res.status(500).json({ error: 'Internal server error' });
        }

        await userApp.updateUser(userObj, updateValues); // Update user tokens
      } else {
        const job = await inferenceQueue.add('Aborted', { reason: 'Insufficient tokens' });
        res.status(401).json({ status: 'Aborted', error: 'Insufficient tokens. Aborted.', jobId: job.id });
      }
    }
  },

  // Endpoint to get status of an inference job by jobId
  getInferenceStatus: async (req: Request, res: Response) => {
    const jobId = req.params.jobId;

    if (!jobId) {
      return res.status(400).send({ error: 'Missing required fields in body (jobId)' });
    } else if (jobId.length === 0) {
      return res.status(401).send({ error: 'No Job found with that id!' });
    }

    try {
      const job = await inferenceQueue.getJob(jobId);
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      if(job.name==='Aborted'){
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
    } catch (error) {
      console.error('Error getting job status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

 
  // Endpoint to get all datasets belonging to a user
  getAllDatasets: async (req: Request, res: Response) => {
    const userData = getDecodedToken(req);
    if (userData && typeof userData !== 'string') {
      const userId = userData.id;
      try {
        const datasets = await datasetApp.getAllDatasetsByUser(userId);
        if (!datasets || datasets.length === 0) {
          return res.status(404).json({ error: 'User does not have any datasets yet' });
        }
        res.status(200).json(datasets);
      } catch (error) {
        console.error('Error retrieving datasets:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  },
};
