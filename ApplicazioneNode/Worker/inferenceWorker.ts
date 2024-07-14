import { Worker, ConnectionOptions } from 'bullmq';
import { redisOptions } from '../Config/redis_config';
import axios from 'axios';
//import { ConnectionOptions } from 'sequelize';

const inferenceWorker = new Worker('inferenceQueue', async job=>{
  try {
    const { modelId, spectrograms, userId, updateValues } = job.data;

    console.log('Performing inference for model:', modelId, 'on spectrograms:', spectrograms);
    const response = await axios.post('http://flask_app:5000/inference', { modelId, spectrograms });

    console.log('Response from Flask server:', response.data);
    const dataresponse = response.data

    return JSON.stringify({ results: dataresponse });
    
  } catch (error) {
    console.error('Error processing inference job:', error);
  }
},{
  connection: redisOptions as ConnectionOptions
})

export default inferenceWorker;