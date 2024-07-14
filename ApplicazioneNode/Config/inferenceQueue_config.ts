import {Queue} from 'bullmq';
import {redisOptions} from './redis_config';

export const inferenceQueue= new Queue('inferenceQueue', {
  connection: {
    host: redisOptions.host,
    port: redisOptions.port
  }
});