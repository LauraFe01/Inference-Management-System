import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { getDecodedToken } from '../Utils/token_utils';
import { updateToken } from '../Utils/utils';
import UserDAOApplication from '../DAO/userDao';
import { SpectrogramCreationAttributes } from '../Model/spectrogram';
import DatasetDAOApplication from '../DAO/datasetDao';
import SpectrogramDAOApplication from '../DAO/spectrogramDao';
import AdmZip from 'adm-zip';
import ErrorFactory, { ErrorType } from '../Errors/errorFactory';
import db from '../Config/db_config';


const userApp = new UserDAOApplication();
const datasetApp = new DatasetDAOApplication();
const spectrogramDao = new SpectrogramDAOApplication();

export const spectrogramController = {

  addSpectrogram: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { datasetName } = req.body;
      await db.transaction(async (transaction) => {
  
      if (!req.file || !datasetName) {
        throw ErrorFactory.createError(ErrorType.MissingParameterError, 'Missing required fields (file, datasetName) in the body');
      } else if (!req.file.originalname.endsWith('.png')) {
        throw ErrorFactory.createError(ErrorType.UnsupportedMediaType, 'Unsupported file format. Expected .png');
      }
  
      const pathName = req.file.originalname;
      const fileName = path.basename(pathName);
  
      const userData = getDecodedToken(req);
      if (!userData) {
        throw ErrorFactory.createError(ErrorType.NotFoundError, 'User logged not found');
      }
  
      if (typeof userData !== 'string') {
        const userId = userData.id;
  
        
          const userObj = await userApp.getUser(userId);
  
          const tokenRemaining = updateToken('uploadImage', userObj!, 1);
          if (tokenRemaining < 0 || !userObj) {
            throw ErrorFactory.createError(ErrorType.TokenError);
          }
  
          await userApp.updateUser(userObj, { numToken: tokenRemaining }, transaction);
  
          const datasetData = await datasetApp.getByName(datasetName, userId);
          if (!datasetData || datasetData.userId !== userId) {
            throw ErrorFactory.createError(ErrorType.UnauthorizedError, 'User cannot access to this dataset');
          }
  
          const newSpectrogram = {
            name: fileName,
            data: req.file.buffer,
            datasetId: datasetData.id,
          };
  
          await spectrogramDao.addSpectrogram(newSpectrogram, transaction);
  
        return res.status(201).json({ status: 'spectrogram added', statusCode: 201, newSpectrogram: newSpectrogram });
      }
    });

    } catch (error) {
      next(error);
    }
  },

  uploadFile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { datasetName } = req.body;
      await db.transaction(async (transaction) => {

      if (!req.file || !datasetName) {
        throw ErrorFactory.createError(ErrorType.MissingParameterError, 'Missing required fields (file, datasetName)');
      } else if (!req.file.originalname.endsWith('.zip')) {
        throw ErrorFactory.createError(ErrorType.UnsupportedMediaType, 'Unsupported file format. Expected .zip');
      }

      const userData = getDecodedToken(req);
      if (!userData) {
        throw ErrorFactory.createError(ErrorType.NotFoundError, 'User logged not found');
      }

      if (typeof userData !== 'string') {
        const userId = userData.id;
        const userObj = await userApp.getUser(userId);
        const datasetData = await datasetApp.getByName(datasetName, userId);

        if (!datasetData || datasetData.userId !== userId) {
          throw ErrorFactory.createError(ErrorType.UnauthorizedError, 'User cannot access to this dataset');
        }
          
        const zip = new AdmZip(req.file.buffer);
        const zipEntries = zip.getEntries();
        const datasetID = datasetData.id;
        const numEntries = zipEntries.length;

        const tokenRemaining = updateToken('uploadZip', userObj!, numEntries);

        if (tokenRemaining < 0 || !userObj) {
          throw ErrorFactory.createError(ErrorType.TokenError);
        }

        await userApp.updateUser(userObj, { numToken: tokenRemaining }, transaction);
        try {
          for (const zipEntry of zipEntries) {
            const filename = zipEntry.entryName;
            const basename = path.basename(filename);
            
            if (zipEntry.entryName.endsWith('.png') && !zipEntry.entryName.startsWith('__MACOSX/')) {
              const bufferData = zipEntry.getData();
              const newSpectrogram: SpectrogramCreationAttributes = {
                name: basename,
                data: bufferData,
                datasetId: datasetID,
              };
              await spectrogramDao.addSpectrogram(newSpectrogram, transaction);

            }
          }

          return res.status(201).json({ status: 'Spectrograms successfully uploaded', statusCode: 201 });
        } catch (error) {
          throw ErrorFactory.createError(ErrorType.InternalServerError, 'Error reading file .zip');
        }
      }
    });
    } catch (error) {
      next(error);
    }
  },
};
