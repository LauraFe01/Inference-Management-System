import { Request, Response, NextFunction } from 'express';
import { User } from '../Model/user'; // Assicurati di avere il percorso corretto
import { verifyToken } from './jwt';
import config from './configJWT';
import jwt from 'jsonwebtoken';
import { error } from 'console';

const jwtkey = config.jwtSecret;
const expirationTime = config.jwtExpiration;

declare global {
    namespace Express {
      interface Request {
        user?: User; 
      }
    }
  }

function isTokenExpired(expirationTime: number): boolean {
    return Date.now() >= expirationTime * 1000;
}

export async function authToken(req: Request, res: Response, next: NextFunction) {
  const bearerHeader = req.headers.authorization;

  if (typeof bearerHeader !== 'undefined') {
    const bearerToken = bearerHeader.split(' ')[1];

    try {
      const decoded = jwt.verifyToken(bearerToken, jwtkey); // Verifica e decodifica il token
      const userId = decoded.id; // Estrai l'ID dell'utente dal token

      try {
        let user = await User.findByPk(userId); // Trova l'utente nel database per ID
        if (!user) {
          // Se l'utente non esiste manda un messaggio di errore
          return res.status(403).send({error: 'No user found'})
        } else{
            req.user = user; // Assegna l'utente trovato a req.user per l'utilizzo nelle route successive
            const tokenExpired = isTokenExpired(decoded.exp);
            if (tokenExpired) {
                console.log(`Il token per l'utente ${user.id} è scaduto.`);
                // Esegui il logout automatico: rimuovi il token dall'utente
                user.numToken = 0; // Rimuovi il token dal database
                await user.save();
                return res.status(401).send({ error: 'Token expired. Automatic logout.' });
          }
        }
        next();
      } catch (error) {
        console.error('Error finding or updating user:', error);
        res.status(500).send({ error: 'Internal Server Error' });
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      res.status(403).send({ error: 'Failed to authenticate token.' });
    }
  } else {
    res.status(403).send({ error: 'No token provided.' });
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const bearerHeader = req.headers.authorization;

  if (typeof bearerHeader !== 'undefined') {
    const bearerToken = bearerHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(bearerToken, jwtkey); // Verifica e decodifica il token
      const userId = decoded.id; // Estrai l'ID dell'utente dal token

      try {
        const user = await User.findByPk(userId); // Trova l'utente nel database per ID
        if (user) {
          req.user = user; // Assegna l'utente trovato a req.user per l'utilizzo nelle route successive
          next(); // Prosegui con la richiesta
        } else {
          res.status(404).send({ error: 'User not found' });
        }
      } catch (error) {
        console.error('Error finding user:', error);
        res.status(500).send({ error: 'Internal Server Error' });
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      res.status(403).send({ error: 'Failed to authenticate token.' });
    }
  } else {
    res.status(403).send({ error: 'No token provided.' });
  }
}
