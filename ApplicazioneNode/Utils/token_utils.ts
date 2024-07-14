import { Request} from 'express';
import jwt from 'jsonwebtoken';
import JWT_config from '../Config/JWT_config';

export function getDecodedToken(req: Request){
    const authHeader = req.headers.authorization;
    console.log(JSON.stringify(req.headers, null, 2));
    if(authHeader){
    const token = authHeader.split(' ')[1];
    try {
      const decodedToken= jwt.verify(token, JWT_config.jwtSecret);
      console.log('token', JSON.stringify(decodedToken, null, 2))
      return decodedToken

    } catch (error) {
      console.error('Errore durante la verifica del token:', error);
    }
}
  
}