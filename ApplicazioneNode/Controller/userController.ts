import { Request, Response } from 'express';
import UserDAOApplication from '../DAO/userDao';
import jwt from 'jsonwebtoken';
import { getDecodedToken } from '../Token/token';
import config from '../Token/configJWT';

const userApp = new UserDAOApplication();

export const userController = {
    login: async (req: Request, res: Response) => {
    try{
        const{email, password}= req.body;
        
        if(!email||!password){
            return res.status(400).send({error:'Missing required fields (email, password)'});
        } else{
            const user= await userApp.getUserByEmailPass(email);
            if(password!= user[0].password){
            res.status(401).send({error:'Wrong Password inserted'});
            }else{
            const token = jwt.sign({id: user[0].id, isAdmin: user[0].isAdmin}, config.jwtSecret, { expiresIn: config.jwtExpiration });
            console.log(`${user[0].id}`)
            res.set('Authorization', `Bearer ${token}`);
            //res.json({token});
            res.status(201).send(token);
            }
        }
        } catch(error){ 
            console.error('Error during login:', error);
            res.status(500).send({ error: 'Internal Server Error' });
        }
    },
    getRemainingTokens: async (req: Request, res: Response) => {
        const userData = getDecodedToken(req)
        if (!userData) {
        return res.status(404).json({ error: 'User not found' });
        }else{
        if (typeof userData !== 'string') {
            const id = userData.id;
        try {
            const numToken = await userApp.getTokensNumById(id)
            res.json({numToken});
        }catch(error){ 
        console.error('Error during query:', error);
        res.status(500).send({ error: 'Internal Server Error' });
        }
        }
    }
    },
    refillTokens: async (req: Request, res: Response) => {
        const {userEmail, newTokens} = req.body

        try {
            const user = await userApp.getUserByEmailPass(userEmail);

            if (user) {
                console.log(user[0].numToken);

                const numToken = user[0].numToken + newTokens;

                await userApp.updateUser(user[0], { numToken });

                return res.status(201).json({ esito: 'Token number updated', userEmail, numToken });
            } else {
                return res.status(500).json({ error: 'Internal server error' });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal server error' });
        }

    }

  };
  