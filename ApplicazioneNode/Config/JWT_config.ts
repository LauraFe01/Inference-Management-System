import * as dotenv from 'dotenv';
dotenv.config();
export default {
    jwtSecret: process.env.JWT_KEY||'default_secret',
    jwtExpiration: process.env.JWT_EXPIRATION || '1d'// tempo di scadenza del token
  };
  // roba da spostare