import jwt from 'jsonwebtoken';
import config from './configJWT';

export function generateToken(data: any): string {
  return jwt.sign(data, config.jwtSecret, { expiresIn: config.jwtExpiration });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (err) {
    return null;
  }
}
