import { Worker, ConnectionOptions } from 'bullmq';
import { redisOptions } from '../Config/redis_config';
import axios from 'axios';

/**
 * Worker instance responsible for performing inference tasks.
 * Processes jobs from 'inferenceQueue' and sends inference requests to a Flask server.
 */
const inferenceWorker = new Worker('inferenceQueue', async job => {
  try {
    const { modelId, spectrograms } = job.data;

    // Send POST request to Flask server for inference
    const response = await axios.post('http://flask_app:5000/inference', { modelId, spectrograms });

    // Return response data to indicate successful completion of job
    return response.data;
  } catch (error) {
    // Handle errors that occur during inference processing
    console.error('Error processing inference job:', error);
  }
}, {
  // Worker configuration options
  connection: redisOptions as ConnectionOptions, // Redis connection options
  removeOnComplete: { count: 20 }, // Remove job from queue after successful completion (up to 20 jobs)
  removeOnFail: { count: 20 }, // Remove job from queue on failure (up to 20 jobs)
});

export default inferenceWorker;