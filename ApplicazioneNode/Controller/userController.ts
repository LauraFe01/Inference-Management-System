import { Request, Response } from 'express';
import UserDAOApplication from '../DAO/userDao';
import jwt from 'jsonwebtoken';
import { getDecodedToken } from '../Utils/token_utils';
import config from '../Config/JWT_config';

const userApp = new UserDAOApplication();

export const userController = {
  // Endpoint to handle user login
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Check if email and password are provided
      if (!email || !password) {
        return res.status(400).send({ error: 'Missing required fields (email, password)' });
      } else {
        // Attempt to fetch user by email and password
        const user = await userApp.getUserByEmailPass(email);
        
        // If no user found with the provided email
        if (user.length === 0) {
          return res.status(401).send({ error: 'No User with that email!' });
        } else if (user[0].password !== password) { // Check if password matches
          return res.status(401).send({ error: 'Wrong Password inserted' });
        } else {
          // Generate JWT token if credentials are correct
          const token = jwt.sign(
            { id: user[0].id, isAdmin: user[0].isAdmin },
            config.jwtSecret,
            { expiresIn: config.jwtExpiration }
          );
          // Set Authorization header with Bearer token
          res.set('Authorization', `Bearer ${token}`);
          // Respond with the token
          res.status(201).json({ token });
        }
      }
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  },

  // Endpoint to get remaining tokens for a user
  getRemainingTokens: async (req: Request, res: Response) => {
    const userData = getDecodedToken(req);
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    } else {
      if (typeof userData !== 'string') {
        const id = userData.id;
        try {
          // Fetch remaining tokens by user ID
          const numToken = await userApp.getTokensNumById(id);
          // Respond with the number of tokens
          res.status(201).json({ numToken });
        } catch (error) {
          console.error('Error during query:', error);
          res.status(500).send({ error: 'Internal Server Error' });
        }
      }
    }
  },

  // Endpoint to refill tokens for a user
  refillTokens: async (req: Request, res: Response) => {
    const { userEmail, newTokens } = req.body;
    try {
      // Fetch user by email to refill tokens
      const user = await userApp.getUserByEmailPass(userEmail);
      if (user) {
        const numToken = user[0].numToken + newTokens; // Calculate new token count
        // Update user's token count
        await userApp.updateUser(user[0], { numToken });
        // Respond with success message and updated token count
        return res.status(201).json({ message: 'Token number updated', userEmail, numToken });
      } else {
        // If user not found
        return res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error during token refill:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};
