import express from 'express';
import bodyParser from 'body-parser';
import { initModels } from './Model/init_database';
import datasetRoutes from './Routes/datasetRoutes';
import userRoutes from './Routes/userRoutes';
import spectrogramRoutes from './Routes/spectrogramRoutes';

const app = express();
const port = 3000;


app.use(bodyParser.json());

app.use(datasetRoutes);
app.use(userRoutes);
app.use(spectrogramRoutes);

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

