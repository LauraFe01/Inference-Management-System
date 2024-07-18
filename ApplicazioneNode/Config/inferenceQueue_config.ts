import {Queue} from 'bullmq';
import {redisOptions} from './redis_config';

/**
 * Represents the queue for handling inference jobs.
 * Uses BullMQ Queue for job processing.
 */
export const inferenceQueue= new Queue('inferenceQueue', {
  connection: {
    host: redisOptions.host,
    port: redisOptions.port
  }
});