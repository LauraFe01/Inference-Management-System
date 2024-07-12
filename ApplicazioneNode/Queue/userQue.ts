import {Queue} from 'bullmq';
import {redisOptions} from '../Config/redis_config';

export const userQueue = new Queue('userQueue', {
    connection: redisOptions
  });