import {Queue} from 'bullmq';
import {redisOptions} from '../Config/redis_config';

export const inferenceQueue= new Queue('inferenceQueue', {
    connection: redisOptions
  });