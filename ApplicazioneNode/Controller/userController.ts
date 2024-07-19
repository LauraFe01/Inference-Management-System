import { Request, Response, NextFunction } from 'express';
import UserDAOApplication from '../DAO/userDao';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDecodedToken } from '../Utils/token_utils';
import config from '../Config/JWT_config';
import ErrorFactory, { ErrorType } from '../Errors/errorFactory';

const userApp = new UserDAOApplication();

export const userController = {
  // Endpoint to handle user login
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw ErrorFactory.createError(ErrorType.MissingParameterError, 'Missing required fields (email, password)');
      }

      const user = await userApp.getUserByEmail(email);

      if (user.length === 0) {
        throw ErrorFactory.createError(ErrorType.NotFoundError, 'No User with that email!');
      } 
      
      const isPasswordValid = await bcrypt.compare(password, user[0].password);

      if (!isPasswordValid) {
        throw ErrorFactory.createError(ErrorType.UnauthorizedError, 'Wrong Password inserted');
      } else {
        const token = jwt.sign(
          { id: user[0].id, isAdmin: user[0].isAdmin },
          config.jwtSecret,
          { expiresIn: config.jwtExpiration }
        );
        res.set('Authorization', `Bearer ${token}`);
        res.status(200).json({ 
          status: 'successfully logged in ',
          statusCode: 200,
          token });
      }
    } catch (error) {
      next(error); 
    }
  },

  getRemainingTokens: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = getDecodedToken(req);
      if (!userData) {
        throw ErrorFactory.createError(ErrorType.NotFoundError, 'Logged user not found');
      }

      if (typeof userData !== 'string') {
        const id = userData.id;
        const numToken = await userApp.getTokensNumById(id);
        res.status(200).json({ 
          status: 'OK ',
          statusCode: 200,
          numToken });
      }
      }
     catch (error) {
      next(error);
    }
  },

  refillTokens: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userEmail, newTokens } = req.body;

      if (!userEmail || !newTokens) {
        throw ErrorFactory.createError(ErrorType.MissingParameterError, 'Missing required fields (userEmail, newTokens)');
      }
      if (typeof newTokens !=='number'){
        throw ErrorFactory.createError(ErrorType.ValidationError, 'newTokens must be a number');
      }

      const user = await userApp.getUserByEmail(userEmail);

      if (user.length === 0) {
        throw ErrorFactory.createError(ErrorType.NotFoundError, 'User not found');
      }

      const numToken = user[0].numToken + newTokens;
      await userApp.updateUser(user[0], { numToken });
      res.status(201).json({ message: 'Token number updated', statusCode: 201, userEmail, numToken });
    } catch (error) {
      next(error);
    }
  },
};
