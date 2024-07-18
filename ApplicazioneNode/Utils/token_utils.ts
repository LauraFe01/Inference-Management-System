import { Request } from 'express';
import jwt from 'jsonwebtoken';
import JWT_config from '../Config/JWT_config';

/**
 * Extracts and decodes JWT token from the Authorization header of the request.
 * @param req - Express Request object containing headers with Authorization token.
 * @returns Decoded token payload if token is valid; otherwise, undefined.
 */
export function getDecodedToken(req: Request) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    // Extract token from Authorization header
    const token = authHeader.split(' ')[1];

    try {
      // Verify and decode JWT token using configured secret
      const decodedToken = jwt.verify(token, JWT_config.jwtSecret);

      return decodedToken;
    } catch (error) {
      console.error('Error verifying token:', error);
    }
  }
}
