import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Redis connection options.
 */
export const redisOptions = {
  /**
   * Redis server host address.
   * Uses environment variable REDIS_HOST or defaults to 'localhost'.
   * @type {string}
   */
  host: process.env.REDIS_HOST || 'localhost',

  /**
   * Redis server port number.
   * Uses environment variable REDIS_PORT parsed as a number or defaults to 6379.
   * @type {number}
   */
  port: Number(process.env.REDIS_PORT) || 6379
};
