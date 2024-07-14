import * as dotenv from 'dotenv';
dotenv.config();

export const redisOptions = {
  host: process.env.REDIS_HOST|| 'localhost',
  port: process.env.REDIS_PORT || 6379
  };
  