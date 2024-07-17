import express from 'express';
import bodyParser from 'body-parser';
import { initModels } from './Model/init_database';
import datasetRoutes from './Routes/datasetRoutes';
import userRoutes from './Routes/userRoutes';
import spectrogramRoutes from './Routes/spectrogramRoutes';
import * as dotenv from 'dotenv';
import errorHandler from './Errors/errorHandler';
import { checkValidJson } from './middleware';
import seed from './Seeders/userSeed';
dotenv.config();

const app = express();
const port = Number(process.env.SERVER_PORT);


//seed()

app.use(bodyParser.json());
app.use(checkValidJson)

app.use(datasetRoutes);
app.use(userRoutes);
app.use(spectrogramRoutes);
app.use(errorHandler);

(async () => {
  try {
    await initModels();
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
})();

