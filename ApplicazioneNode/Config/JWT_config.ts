import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Configuration object for JWT settings.
 * Uses environment variables for configuration or defaults.
 */
const jwtConfig = {
  /**
   * JWT secret key for signing tokens.
   * Uses environment variable JWT_KEY or defaults to 'default_secret'.
   * @type {string}
   */
  jwtSecret: process.env.JWT_KEY || 'default_secret',

  /**
   * JWT token expiration time.
   * Uses environment variable JWT_EXPIRATION or defaults to '1d' (1 day).
   * @type {string}
   */
  jwtExpiration: process.env.JWT_EXPIRATION || '1d'
};

export default jwtConfig;
